import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUser } from "../../_auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/exam/[id]/finish
 * Marks the session as completed, computes final score from exam_answers,
 * and returns the result summary.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(req);
  if (!user)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id: sessionId } = await context.params;
  const admin = supabaseAdmin();

  const { data: session, error: sErr } = await admin
    .from("exam_sessions")
    .select("id, user_id, fecha, total_questions, estado")
    .eq("id", sessionId)
    .single();
  if (sErr || !session || session.user_id !== user.id)
    return NextResponse.json({ error: "Sesión inválida" }, { status: 404 });

  if (session.estado === "completado") {
    // Idempotent: return existing result
    const { data: existing } = await admin
      .from("exam_sessions")
      .select("score, correct_answers, total_questions, duracion_seg")
      .eq("id", sessionId)
      .single();
    return NextResponse.json({ ok: true, ...existing });
  }

  // Count correct answers
  const { data: answers } = await admin
    .from("exam_answers")
    .select("es_correcta")
    .eq("session_id", sessionId);

  const correctCount = (answers ?? []).filter((a) => a.es_correcta).length;
  const total = session.total_questions || 1;
  const score = Math.round((correctCount / total) * 10000) / 100; // 2 decimals

  const now = new Date();
  const startedAt = new Date(session.fecha);
  const durationSec = Math.max(
    0,
    Math.round((now.getTime() - startedAt.getTime()) / 1000)
  );

  const { error: updErr } = await admin
    .from("exam_sessions")
    .update({
      estado: "completado",
      correct_answers: correctCount,
      score,
      duracion_seg: durationSec,
      completed_at: now.toISOString(),
    })
    .eq("id", sessionId);

  if (updErr)
    return NextResponse.json({ error: updErr.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    score,
    correct_answers: correctCount,
    total_questions: total,
    duracion_seg: durationSec,
  });
}
