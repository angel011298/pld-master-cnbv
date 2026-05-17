import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  generateBatch,
  DIFICULTADES,
  FORMATOS,
  type Dificultad,
  type Formato,
} from "@/lib/question-generator";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Vercel: 60s for hobby/pro

const SUPER_ADMIN_EMAIL = "553angelortiz@gmail.com";

/**
 * POST /api/admin/generate-batch
 * Body: { bloque: 1-8, dificultad: basico|intermedio|avanzado, formato: <one of FORMATOS>, count?: 1-15 }
 *
 * Admin-only. Generates `count` questions via Claude for the given cell
 * and inserts them into question_bank with status='active'. Also creates
 * a question_generation_jobs row for audit.
 */
export async function POST(req: NextRequest) {
  // ── Auth: super-admin only ─────────────────────────────────────────
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";
  if (!token)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const admin = supabaseAdmin();
  const { data: userData } = await admin.auth.getUser(token);
  const user = userData?.user;
  if (!user || user.email !== SUPER_ADMIN_EMAIL)
    return NextResponse.json({ error: "Solo super-admin" }, { status: 403 });

  // ── Validate body ──────────────────────────────────────────────────
  const body = (await req.json().catch(() => null)) as {
    bloque?: number;
    dificultad?: string;
    formato?: string;
    count?: number;
  } | null;

  const bloque = Number(body?.bloque);
  const dificultad = body?.dificultad as Dificultad;
  const formato = body?.formato as Formato;
  const count = Math.min(Math.max(Number(body?.count) || 5, 1), 15);

  if (!Number.isInteger(bloque) || bloque < 1 || bloque > 8)
    return NextResponse.json({ error: "bloque inválido" }, { status: 400 });
  if (!DIFICULTADES.includes(dificultad))
    return NextResponse.json({ error: "dificultad inválida" }, { status: 400 });
  if (!FORMATOS.includes(formato))
    return NextResponse.json({ error: "formato inválido" }, { status: 400 });

  // ── Create job record ──────────────────────────────────────────────
  const { data: job } = await admin
    .from("question_generation_jobs")
    .insert({
      bloque,
      dificultad,
      formato,
      target_count: count,
      status: "running",
      triggered_by: user.id,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  // ── Generate ───────────────────────────────────────────────────────
  try {
    const rows = await generateBatch({
      bloque,
      dificultad,
      formato,
      count,
      status: "active",
    });

    if (rows.length === 0)
      throw new Error("Claude no devolvió reactivos");

    const { error: insErr } = await admin.from("question_bank").insert(rows);
    if (insErr) throw new Error(insErr.message);

    if (job?.id) {
      await admin
        .from("question_generation_jobs")
        .update({
          status: "completed",
          generated_count: rows.length,
          completed_at: new Date().toISOString(),
        })
        .eq("id", job.id);
    }

    return NextResponse.json({
      ok: true,
      generated: rows.length,
      job_id: job?.id,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    if (job?.id) {
      await admin
        .from("question_generation_jobs")
        .update({
          status: "failed",
          error: msg,
          completed_at: new Date().toISOString(),
        })
        .eq("id", job.id);
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * GET /api/admin/generate-batch
 * Returns progress matrix: bloque × dificultad × formato active counts,
 * plus recent jobs.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";
  if (!token)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const admin = supabaseAdmin();
  const { data: userData } = await admin.auth.getUser(token);
  const user = userData?.user;
  if (!user || user.email !== SUPER_ADMIN_EMAIL)
    return NextResponse.json({ error: "Solo super-admin" }, { status: 403 });

  const { data: progress } = await admin
    .from("v_question_bank_progress")
    .select("*");

  const { data: jobs } = await admin
    .from("question_generation_jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return NextResponse.json({
    progress: progress ?? [],
    jobs: jobs ?? [],
  });
}
