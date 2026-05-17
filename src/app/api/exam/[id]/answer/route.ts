import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUser } from "../../_auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/exam/[id]/answer
 * Body: { question_id: number, opcion_elegida: 'A'|'B'|'C'|'D', tiempo_respuesta_seg?: number }
 *
 * Records an answer for a question. Computes correctness server-side
 * (compared against question_bank.correct_answer.index → A/B/C/D).
 * Idempotent: upserts on (session_id, question_id).
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(req);
  if (!user)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id: sessionId } = await context.params;
  const body = (await req.json().catch(() => null)) as {
    question_id?: number;
    opcion_elegida?: string;
    tiempo_respuesta_seg?: number;
  } | null;

  if (!body?.question_id || !["A", "B", "C", "D"].includes(body.opcion_elegida || "")) {
    return NextResponse.json(
      { error: "question_id y opcion_elegida (A/B/C/D) son requeridos" },
      { status: 400 }
    );
  }

  const admin = supabaseAdmin();

  // Validate session belongs to user + is in_progress + not expired
  const { data: session, error: sErr } = await admin
    .from("exam_sessions")
    .select("id, user_id, estado, expires_at, question_ids")
    .eq("id", sessionId)
    .single();
  if (sErr || !session || session.user_id !== user.id)
    return NextResponse.json({ error: "Sesión inválida" }, { status: 404 });

  if (session.estado !== "en_progreso")
    return NextResponse.json(
      { error: "Esta sesión ya fue finalizada" },
      { status: 409 }
    );

  if (new Date(session.expires_at) < new Date())
    return NextResponse.json({ error: "El tiempo expiró" }, { status: 410 });

  // Validate the question belongs to this session
  const qIds = (session.question_ids ?? []) as number[];
  if (!qIds.includes(body.question_id))
    return NextResponse.json(
      { error: "La pregunta no pertenece a esta sesión" },
      { status: 400 }
    );

  // Compute correctness from question_bank
  const { data: q } = await admin
    .from("question_bank")
    .select("correct_answer")
    .eq("id", body.question_id)
    .single();

  if (!q)
    return NextResponse.json({ error: "Pregunta no encontrada" }, { status: 404 });

  const correctIdx = (q.correct_answer as { index?: number })?.index ?? 0;
  const correctLetter = ["A", "B", "C", "D"][correctIdx] ?? "A";
  const isCorrect = body.opcion_elegida === correctLetter;

  // Upsert exam_answer (delete + insert to ensure idempotency without unique constraint)
  await admin
    .from("exam_answers")
    .delete()
    .eq("session_id", sessionId)
    .eq("question_id", body.question_id);

  const { error: insErr } = await admin.from("exam_answers").insert({
    session_id: sessionId,
    question_id: body.question_id,
    opcion_elegida: body.opcion_elegida,
    es_correcta: isCorrect,
    tiempo_respuesta_seg: body.tiempo_respuesta_seg ?? null,
    answered_at: new Date().toISOString(),
  });

  if (insErr)
    return NextResponse.json({ error: insErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
