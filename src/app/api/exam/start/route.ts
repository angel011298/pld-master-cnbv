import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  getAuthenticatedUser,
  CENEVAL_QUESTION_COUNT,
  CENEVAL_DURATION_MS,
} from "../_auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/exam/start
 * Creates a new CENEVAL exam session for the authenticated user.
 *
 * Selection strategy — bloque-distributed:
 *   target = ceil(118 / 8) = 15 per bloque
 *   Within each bloque: prefer avanzado → intermedio → basico
 *   Final array is shuffled and capped at exactly 118.
 *
 * Falls back gracefully when a bloque has fewer than 15 questions.
 * Returns 503 when the bank has fewer than 10 questions total.
 */
export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const admin = supabaseAdmin();

  // ── Fail-fast if the user already has an in-progress non-expired session ──
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

  // ── Load all active multiple_choice questions ─────────────────────────────
  const { data: allQuestions, error: qErr } = await admin
    .from("question_bank")
    .select("id, bloque, dificultad")
    .eq("status", "active")
    .eq("formato", "multiple_choice");

  if (qErr || !allQuestions || allQuestions.length < 10) {
    return NextResponse.json(
      {
        error:
          "El banco de preguntas no tiene suficientes reactivos. " +
          "Pide al admin generar el banco completo.",
      },
      { status: 503 }
    );
  }

  // ── Group questions by bloque ─────────────────────────────────────────────
  type QRow = { id: number; dificultad: string };
  const byBloque = new Map<number, QRow[]>();
  for (const q of allQuestions) {
    const b = q.bloque as number;
    if (!byBloque.has(b)) byBloque.set(b, []);
    byBloque.get(b)!.push({ id: q.id as number, dificultad: q.dificultad as string });
  }

  // ── Bloque-distributed selection ─────────────────────────────────────────
  // Target: ceil(118 / 8) = 15 per bloque; fall back if a bloque is smaller.
  const PER_BLOQUE = Math.ceil(CENEVAL_QUESTION_COUNT / 8); // 15
  const DIF_ORDER: string[] = ["avanzado", "intermedio", "basico"];

  let picked: number[] = [];

  for (let bloque = 1; bloque <= 8; bloque++) {
    const pool = byBloque.get(bloque) ?? [];
    const need = Math.min(PER_BLOQUE, pool.length);
    const selected: number[] = [];

    // Fill from hardest to easiest until we have `need` questions
    for (const dif of DIF_ORDER) {
      if (selected.length >= need) break;
      const candidates = shuffle(
        pool.filter((q) => q.dificultad === dif).map((q) => q.id)
      );
      for (const id of candidates) {
        if (selected.length >= need) break;
        selected.push(id);
      }
    }

    picked.push(...selected);
  }

  // Shuffle once more so questions aren't grouped by bloque in the exam,
  // then cap to exactly 118.
  picked = shuffle(picked).slice(0, CENEVAL_QUESTION_COUNT);

  if (picked.length < 10) {
    return NextResponse.json(
      {
        error:
          "El banco de preguntas no tiene suficientes reactivos. " +
          "Pide al admin generar el banco completo.",
      },
      { status: 503 }
    );
  }

  // ── Create session ────────────────────────────────────────────────────────
  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + CENEVAL_DURATION_MS);

  const { data: session, error } = await admin
    .from("exam_sessions")
    .insert({
      user_id: user.id,
      exam_type: "ceneval",
      estado: "en_progreso",
      total_questions: picked.length,
      correct_answers: 0,
      question_ids: picked,
      fecha: startedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .select("id")
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ session_id: session.id, resumed: false });
}

// ── Fisher-Yates shuffle ──────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
