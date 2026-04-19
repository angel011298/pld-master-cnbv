import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";

type SubmittedAnswer = { question_id: string; selected_option: "a" | "b" | "c" | "d" | null };

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const body = (await req.json()) as {
      attempt_id?: string;
      answers?: SubmittedAnswer[];
      duration_seconds?: number;
    };

    if (!body.attempt_id || !Array.isArray(body.answers)) {
      return NextResponse.json({ error: "attempt_id y answers requeridos." }, { status: 400 });
    }

    const sb = supabaseAdmin();
    const { data: attempt } = await sb
      .from("exam_attempts")
      .select("id, user_id, completed")
      .eq("id", body.attempt_id)
      .maybeSingle();

    if (!attempt || attempt.user_id !== userId) {
      return NextResponse.json({ error: "Attempt no encontrado." }, { status: 404 });
    }
    if (attempt.completed) {
      return NextResponse.json({ error: "Ya completado." }, { status: 400 });
    }

    const questionIds = body.answers.map((a) => a.question_id).filter(Boolean);
    const { data: qs } = await sb
      .from("exam_questions")
      .select("id, correct_option")
      .in("id", questionIds);

    const keyMap = new Map<string, string>();
    for (const q of qs ?? []) keyMap.set(q.id as string, q.correct_option as string);

    let correct = 0;
    const rows = body.answers.map((a) => {
      const correctOption = keyMap.get(a.question_id);
      const isCorrect = correctOption && a.selected_option === correctOption;
      if (isCorrect) correct += 1;
      return {
        attempt_id: body.attempt_id,
        question_id: a.question_id,
        selected_option: a.selected_option,
        is_correct: Boolean(isCorrect),
      };
    });

    if (rows.length > 0) {
      await sb.from("exam_attempt_answers").insert(rows);
    }

    const total = body.answers.length;
    const score = total > 0 ? +((correct / total) * 100).toFixed(2) : 0;

    await sb
      .from("exam_attempts")
      .update({
        correct_answers: correct,
        score_percent: score,
        duration_seconds: body.duration_seconds ?? null,
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq("id", body.attempt_id);

    return NextResponse.json({ correct, total, score_percent: score });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
