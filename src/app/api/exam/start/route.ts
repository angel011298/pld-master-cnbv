import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  getAuthenticatedUser,
  CENEVAL_QUESTION_COUNT,
  CENEVAL_DURATION_MS,
} from "../_auth";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────────────────
// COMITÉ DE EXPERTOS CENEVAL — Distribución oficial de reactivos
// Basada en el mapa curricular del examen PLD/FT CNBV-CENEVAL.
// Cada versión del examen es estadísticamente equivalente: misma distribución
// por bloque y dificultad, distintos reactivos.
// ─────────────────────────────────────────────────────────────────────────────

/** Número de reactivos por bloque temático (suma = 118) */
const BLOQUE_WEIGHTS: Record<number, number> = {
  1: 20, // Marco Legal PLD/FT          — 16.9 %
  2: 12, // Definiciones                — 10.2 %
  3: 16, // KYC / Identificación        — 13.6 %
  4: 15, // Reportes a CNBV             — 12.7 %
  5: 13, // Estructura UNE              — 11.0 %
  6: 12, // Sanciones y Listas          — 10.2 %
  7: 18, // Tipologías y Op. Sospechosas— 15.3 %
  8: 12, // 40 Recomendaciones GAFI     — 10.2 %
};

/**
 * Distribución de dificultad dentro de cada bloque.
 * Refleja la estructura del examen CENEVAL real:
 *   – 25 % reactivos de reconocimiento/identificación (básico)
 *   – 45 % reactivos de comprensión/aplicación (intermedio)
 *   – 30 % reactivos de análisis/síntesis/evaluación (avanzado)
 */
const DIF_RATIO = { basico: 0.25, intermedio: 0.45, avanzado: 0.30 };

// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const admin = supabaseAdmin();

  // ── 1. Retomar sesión activa si existe ────────────────────────────────────
  const { data: openSession } = await admin
    .from("exam_sessions")
    .select("id, expires_at")
    .eq("user_id", user.id)
    .eq("exam_type", "ceneval")
    .eq("estado", "en_progreso")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (openSession && new Date(openSession.expires_at) > new Date()) {
    return NextResponse.json({ session_id: openSession.id, resumed: true });
  }

  // ── 2. Cargar banco de multiple_choice activas ────────────────────────────
  const { data: allQuestions, error: qErr } = await admin
    .from("question_bank")
    .select("id, bloque, dificultad")
    .eq("status", "active")
    .eq("formato", "multiple_choice");

  if (qErr || !allQuestions || allQuestions.length < 10) {
    return NextResponse.json(
      { error: "El banco de preguntas no tiene suficientes reactivos. Pide al admin generar el banco completo." },
      { status: 503 }
    );
  }

  // ── 3. Anti-repetición: excluir IDs del último examen completado ──────────
  const { data: lastSession } = await admin
    .from("exam_sessions")
    .select("question_ids")
    .eq("user_id", user.id)
    .eq("exam_type", "ceneval")
    .in("estado", ["completado", "terminado"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const recentIds = new Set<number>(
    Array.isArray(lastSession?.question_ids) ? lastSession.question_ids : []
  );

  // ── 4. Agrupar por bloque × dificultad, excluyendo IDs recientes ──────────
  type QRow = { id: number; dificultad: string };
  const byBloqueDif = new Map<string, QRow[]>();

  for (const q of allQuestions) {
    const key = `${q.bloque}-${q.dificultad}`;
    if (!byBloqueDif.has(key)) byBloqueDif.set(key, []);
    // Excluir preguntas del examen anterior del mismo usuario
    if (!recentIds.has(q.id as number)) {
      byBloqueDif.get(key)!.push({ id: q.id as number, dificultad: q.dificultad as string });
    }
  }

  // Si excluyendo recientes no hay suficientes, usar todo el banco
  const totalExcluidas = recentIds.size;
  const totalDisponibles = allQuestions.length - totalExcluidas;
  const useFullBank = totalDisponibles < CENEVAL_QUESTION_COUNT + 20;

  if (useFullBank) {
    byBloqueDif.clear();
    for (const q of allQuestions) {
      const key = `${q.bloque}-${q.dificultad}`;
      if (!byBloqueDif.has(key)) byBloqueDif.set(key, []);
      byBloqueDif.get(key)!.push({ id: q.id as number, dificultad: q.dificultad as string });
    }
  }

  // ── 5. Selección ponderada CENEVAL ────────────────────────────────────────
  // Para cada bloque: distribuir el target entre las 3 dificultades según DIF_RATIO.
  // Dentro de cada celda (bloque×dificultad): Fisher-Yates shuffle → tomar N.
  // Si no alcanza en una dificultad, el faltante se completa con las otras
  // en orden: avanzado → intermedio → basico.
  const picked: number[] = [];

  for (let bloque = 1; bloque <= 8; bloque++) {
    const target = BLOQUE_WEIGHTS[bloque]; // ej. 20

    // Cantidad deseada por dificultad (redondeando; el resto va a intermedio)
    const wantBasico    = Math.round(target * DIF_RATIO.basico);
    const wantAvanzado  = Math.round(target * DIF_RATIO.avanzado);
    const wantIntermedio = target - wantBasico - wantAvanzado;

    const want: Record<string, number> = {
      basico:     wantBasico,
      intermedio: wantIntermedio,
      avanzado:   wantAvanzado,
    };

    let deficit = 0;
    const firstPass: Record<string, number[]> = { basico: [], intermedio: [], avanzado: [] };

    for (const dif of ["avanzado", "intermedio", "basico"]) {
      const pool = shuffle((byBloqueDif.get(`${bloque}-${dif}`) ?? []).map(q => q.id));
      const take = Math.min(want[dif], pool.length);
      firstPass[dif] = pool.slice(0, take);
      deficit += want[dif] - take;
    }

    // Cubrir déficit con sobrante de otras dificultades
    let remaining = deficit;
    for (const dif of ["avanzado", "intermedio", "basico"]) {
      if (remaining <= 0) break;
      const pool = shuffle((byBloqueDif.get(`${bloque}-${dif}`) ?? []).map(q => q.id));
      const alreadyTaken = new Set(firstPass[dif]);
      const extra = pool.filter(id => !alreadyTaken.has(id)).slice(0, remaining);
      firstPass[dif].push(...extra);
      remaining -= extra.length;
    }

    for (const ids of Object.values(firstPass)) picked.push(...ids);
  }

  // Shuffle final: mezcla los reactivos de todos los bloques
  const final = shuffle(picked).slice(0, CENEVAL_QUESTION_COUNT);

  if (final.length < 10) {
    return NextResponse.json(
      { error: "El banco de preguntas no tiene suficientes reactivos." },
      { status: 503 }
    );
  }

  // ── 6. Crear sesión ───────────────────────────────────────────────────────
  const startedAt  = new Date();
  const expiresAt  = new Date(startedAt.getTime() + CENEVAL_DURATION_MS);

  const { data: session, error: sessErr } = await admin
    .from("exam_sessions")
    .insert({
      user_id:         user.id,
      exam_type:       "ceneval",
      estado:          "en_progreso",
      total_questions: final.length,
      correct_answers: 0,
      question_ids:    final,
      fecha:           startedAt.toISOString(),
      expires_at:      expiresAt.toISOString(),
    })
    .select("id")
    .single();

  if (sessErr)
    return NextResponse.json({ error: sessErr.message }, { status: 500 });

  return NextResponse.json({ session_id: session.id, resumed: false });
}

// ── Fisher-Yates shuffle ──────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
