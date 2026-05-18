import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/study/sessions/[id]/answer
// Body: { question_id, user_answer, is_correct, response_time_ms? }
// Returns: { success: true, correct_count }
//
// Inserts a study_question_responses row and increments correct_count
// on the session when the answer is correct. The session must belong
// to the authenticated user and be in_progress.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: sessionId } = await params;
  if (!sessionId) {
    return NextResponse.json({ error: "session id requerido" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const raw = body as {
    question_id?: unknown;
    user_answer?: unknown;
    is_correct?: unknown;
    response_time_ms?: unknown;
  };

  // Validate question_id
  const questionId = Number(raw.question_id);
  if (!Number.isInteger(questionId) || questionId <= 0) {
    return NextResponse.json({ error: "question_id inválido" }, { status: 400 });
  }

  // Validate is_correct
  if (typeof raw.is_correct !== "boolean") {
    return NextResponse.json({ error: "is_correct debe ser boolean" }, { status: 400 });
  }
  const isCorrect = raw.is_correct;

  // Sanitize user_answer (nullable text)
  const userAnswer =
    typeof raw.user_answer === "string" ? raw.user_answer.slice(0, 500) : null;

  // Sanitize response_time_ms
  const responseTimeMs =
    typeof raw.response_time_ms === "number" && raw.response_time_ms >= 0
      ? Math.floor(raw.response_time_ms)
      : null;

  const admin = supabaseAdmin();

  // ── Verify the session belongs to this user and is in_progress ───────────
  const { data: session, error: sessionErr } = await admin
    .from("study_sessions")
    .select("id, correct_count, status")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (sessionErr || !session) {
    return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
  }

  if (session.status !== "in_progress") {
    return NextResponse.json(
      { error: "La sesión ya está completada o abandonada" },
      { status: 409 }
    );
  }

  // ── Insert the response ───────────────────────────────────────────────────
  const { error: insertErr } = await admin
    .from("study_question_responses")
    .insert({
      session_id: sessionId,
      question_id: questionId,
      user_answer: userAnswer,
      is_correct: isCorrect,
      response_time_ms: responseTimeMs,
    });

  if (insertErr) {
    console.error("[study/sessions/[id]/answer POST] insert error:", insertErr);
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // ── Increment correct_count when answer is correct ────────────────────────
  const newCorrectCount = (session.correct_count ?? 0) + (isCorrect ? 1 : 0);

  const { error: updateErr } = await admin
    .from("study_sessions")
    .update({ correct_count: newCorrectCount })
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (updateErr) {
    // Non-critical — response is already persisted; log and continue
    console.error("[study/sessions/[id]/answer POST] update correct_count error:", updateErr);
  }

  return NextResponse.json({ success: true, correct_count: newCorrectCount });
}
