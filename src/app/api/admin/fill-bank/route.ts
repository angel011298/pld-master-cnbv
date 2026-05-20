import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  generateBatch,
  type Dificultad,
  type Formato,
} from "@/lib/question-generator";

export const dynamic  = "force-dynamic";
export const maxDuration = 60; // Vercel: max 60 s

const SUPER_ADMIN_EMAIL = "553angelortiz@gmail.com";

/** Meta: 125 preguntas activas por bloque */
const TARGET_PER_BLOQUE = 125;

/**
 * Distribución de dificultad objetivo dentro de cada bloque
 * (refleja el examen CENEVAL: más intermedio y avanzado)
 */
const DIF_TARGET = { basico: 42, intermedio: 43, avanzado: 40 };

/**
 * Distribución de formatos objetivo por bloque:
 * el examen CENEVAL solo usa multiple_choice, pero el banco
 * sirve también para el modo estudio.
 */
const FORMAT_TARGET: Record<Formato, number> = {
  multiple_choice: 62,
  true_false:      27,
  flashcard:       18,
  fill_blank:       8,
  case_study:       5,
  crossword:        3,
  word_search:      2,
}; // suma = 125

// ─────────────────────────────────────────────────────────────────────────────

async function assertAdmin(req: NextRequest): Promise<boolean> {
  const token = (req.headers.get("authorization") || "").replace("Bearer ", "").trim();
  if (!token) return false;
  const sb = supabaseAdmin();
  const { data } = await sb.auth.getUser(token);
  return data?.user?.email === SUPER_ADMIN_EMAIL;
}

// ── GET — devuelve el plan de gaps (qué hace falta generar) ──────────────────
export async function GET(req: NextRequest) {
  if (!(await assertAdmin(req)))
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const sb = supabaseAdmin();
  const { data: counts } = await sb
    .from("question_bank")
    .select("bloque, dificultad, formato")
    .eq("status", "active");

  // Acumular conteos actuales por (bloque, dificultad, formato)
  const have: Record<string, number> = {};
  for (const row of counts ?? []) {
    const key = `${row.bloque}:${row.dificultad}:${row.formato}`;
    have[key] = (have[key] ?? 0) + 1;
  }

  // Calcular gaps
  type GapRow = {
    bloque: number;
    dificultad: Dificultad;
    formato: Formato;
    have: number;
    need: number;
    gap: number;
  };

  const gaps: GapRow[] = [];
  let totalGap = 0;

  for (let b = 1; b <= 8; b++) {
    for (const [dif, difTarget] of Object.entries(DIF_TARGET) as [Dificultad, number][]) {
      for (const [fmt, fmtTarget] of Object.entries(FORMAT_TARGET) as [Formato, number][]) {
        // Por celda (bloque×dif×formato): distribuir proporcionalmente
        // cellTarget = difTarget × (fmtTarget / 125)
        const cellTarget = Math.round((difTarget * fmtTarget) / TARGET_PER_BLOQUE);
        const key = `${b}:${dif}:${fmt}`;
        const current = have[key] ?? 0;
        const gap = Math.max(0, cellTarget - current);
        if (gap > 0) {
          gaps.push({ bloque: b, dificultad: dif, formato: fmt, have: current, need: cellTarget, gap });
          totalGap += gap;
        }
      }
    }
  }

  // Resumen por bloque
  const bloqueTotal: Record<number, number> = {};
  for (const row of counts ?? []) bloqueTotal[row.bloque] = (bloqueTotal[row.bloque] ?? 0) + 1;

  return NextResponse.json({
    totalGap,
    target: TARGET_PER_BLOQUE,
    currentByBloque: bloqueTotal,
    gaps: gaps.sort((a, b) => b.gap - a.gap),
  });
}

// ── POST — genera preguntas para UN bloque completo (toda su brecha MC) ────
// Body: { bloque: 1-8, formato?: Formato, dificultad?: Dificultad, batchSize?: number }
export async function POST(req: NextRequest) {
  if (!(await assertAdmin(req)))
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await req.json().catch(() => ({})) as {
    bloque?: number;
    formato?: Formato;
    dificultad?: Dificultad;
    batchSize?: number;
  };

  const bloque    = Number(body.bloque);
  const fmt       = (body.formato ?? "multiple_choice") as Formato;
  const dif       = (body.dificultad ?? "intermedio") as Dificultad;
  const batchSize = Math.min(Math.max(Number(body.batchSize) || 10, 1), 15);

  if (!Number.isInteger(bloque) || bloque < 1 || bloque > 8)
    return NextResponse.json({ error: "bloque inválido (1-8)" }, { status: 400 });

  const sb = supabaseAdmin();

  // Contar cuántas hay actualmente en esta celda
  const { count: current } = await sb
    .from("question_bank")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")
    .eq("bloque", bloque)
    .eq("dificultad", dif)
    .eq("formato", fmt);

  const cellTarget = Math.round(
    (DIF_TARGET[dif as keyof typeof DIF_TARGET] * FORMAT_TARGET[fmt]) / TARGET_PER_BLOQUE
  );
  const gap = Math.max(0, cellTarget - (current ?? 0));

  if (gap <= 0) {
    return NextResponse.json({ ok: true, generated: 0, message: "Esta celda ya está completa." });
  }

  const toGenerate = Math.min(gap, batchSize);

  // Crear job de auditoría
  const { data: job } = await sb
    .from("question_generation_jobs")
    .insert({ bloque, dificultad: dif, formato: fmt, target_count: toGenerate, status: "running", started_at: new Date().toISOString() })
    .select("id").single();

  try {
    const rows = await generateBatch({ bloque, dificultad: dif, formato: fmt, count: toGenerate, status: "active" });
    if (!rows.length) throw new Error("No se generaron reactivos");

    const { error: insErr } = await sb.from("question_bank").insert(rows);
    if (insErr) throw new Error(insErr.message);

    if (job?.id) {
      await sb.from("question_generation_jobs").update({
        status: "completed", generated_count: rows.length, completed_at: new Date().toISOString(),
      }).eq("id", job.id);
    }

    return NextResponse.json({
      ok: true,
      generated: rows.length,
      cellTarget,
      remaining: Math.max(0, gap - rows.length),
      job_id: job?.id,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    if (job?.id) {
      await sb.from("question_generation_jobs").update({ status: "failed", error: msg, completed_at: new Date().toISOString() }).eq("id", job.id);
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
