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
 * Creates a new CENEVAL exam session for the authenticated user:
 * - Picks 118 random questions (multiple_choice, prioritizing avanzado).
 * - Stores ordered ids in exam_sessions.question_ids.
 * - Sets expires_at = now + 4h.
 * Returns the new session id.
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
    return NextResponse.json({
      session_id: openSession.id,
      resumed: true,
    });
  }

  // ── Pick 118 questions ────────────────────────────────────────────────
  // Strategy: prefer 'avanzado'; fall back to mixing 'intermedio' if short.
  const { data: advanced } = await admin
    .from("question_bank")
    .select("id")
    .eq("status", "active")
    .eq("formato", "multiple_choice")
    .eq("dificultad", "avanzado");

  const advIds = (advanced ?? []).map((r) => r.id as number);
  let picked: number[] = [];

  if (advIds.length >= CENEVAL_QUESTION_COUNT) {
    picked = shuffle(advIds).slice(0, CENEVAL_QUESTION_COUNT);
  } else {
    // Take all advanced, fill the rest with intermedio + basico
    picked = [...advIds];
    const { data: rest } = await admin
      .from("question_bank")
      .select("id")
      .eq("status", "active")
      .eq("formato", "multiple_choice")
      .in("dificultad", ["intermedio", "basico"]);

    const restIds = shuffle((rest ?? []).map((r) => r.id as number));
    picked.push(...restIds.slice(0, CENEVAL_QUESTION_COUNT - picked.length));
  }

  if (picked.length < 10) {
    return NextResponse.json(
      {
        error:
          "El banco de preguntas no tiene suficientes reactivos. Pide al admin generar el banco completo.",
      },
      { status: 503 }
    );
  }

  picked = shuffle(picked); // final shuffle

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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
