import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUser } from "../_auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/exam/[id]
 * Returns session metadata + questions:
 * - in_progress: questions WITHOUT correct_answer (hidden until finished).
 * - completado: full questions + user answers + correctness for review.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(req);
  if (!user)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await context.params;
  const admin = supabaseAdmin();

  const { data: session, error: sErr } = await admin
    .from("exam_sessions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (sErr || !session)
    return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });

  const ids = (session.question_ids ?? []) as number[];
  const isFinished = session.estado === "completado";

  // Two separate queries to keep Supabase column type inference happy
  const rawQuestions = isFinished
    ? (
        await admin
          .from("question_bank")
          .select(
            "id, stem, options, correct_answer, explanation, source_document, bloque, dificultad"
          )
          .in("id", ids)
      ).data
    : (
        await admin
          .from("question_bank")
          .select("id, stem, options, bloque, dificultad")
          .in("id", ids)
      ).data;

  // Preserve the question order from session.question_ids
  const byId = new Map<number, Record<string, unknown>>();
  for (const q of rawQuestions ?? []) byId.set((q as { id: number }).id, q);
  const questions = ids
    .map((qid) => byId.get(qid))
    .filter((q): q is Record<string, unknown> => Boolean(q));

  // Get user answers if any
  const { data: answers } = await admin
    .from("exam_answers")
    .select("question_id, opcion_elegida, es_correcta, tiempo_respuesta_seg")
    .eq("session_id", id);

  const answersByQ = new Map(
    (answers ?? []).map((a) => [a.question_id, a])
  );

  return NextResponse.json({
    session: {
      id: session.id,
      estado: session.estado,
      total_questions: session.total_questions,
      correct_answers: session.correct_answers,
      score: session.score,
      duracion_seg: session.duracion_seg,
      fecha: session.fecha,
      expires_at: session.expires_at,
      completed_at: session.completed_at,
    },
    questions,
    answers: Object.fromEntries(answersByQ),
  });
}
