import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";
import { TOPIC_DISTRIBUTION, topicByTema } from "@/lib/simulacro-config";

const LETTERS = ["A", "B", "C", "D"] as const;

interface AnswerInput {
  question_id: number;
  opcion_elegida: string | null;
}

type BankRow = {
  id: number;
  respuesta_correcta: number;
  tema: string;
};

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
    }

    const body = await req.json() as {
      session_id: string;
      answers: AnswerInput[];
      duracion_seg?: number;
    };

    const { session_id, answers, duracion_seg } = body;
    if (!session_id || !Array.isArray(answers)) {
      return NextResponse.json({ error: "session_id y answers son requeridos." }, { status: 400 });
    }

    const sb = supabaseAdmin();

    // Verify session belongs to this user and is still in progress
    const { data: session, error: sessionErr } = await sb
      .from("exam_sessions")
      .select("id, estado")
      .eq("id", session_id)
      .eq("user_id", userId)
      .single();

    if (sessionErr || !session) {
      return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 });
    }
    if ((session as { estado: string }).estado === "completado") {
      return NextResponse.json({ error: "La sesión ya fue enviada." }, { status: 409 });
    }

    // Fetch correct answers for all submitted question IDs
    const questionIds = answers.map((a) => a.question_id);
    const { data: bankRows, error: bankErr } = await sb
      .from("quiz_bank")
      .select("id, respuesta_correcta, tema")
      .in("id", questionIds);

    if (bankErr) throw bankErr;

    const bankMap = new Map(
      ((bankRows ?? []) as BankRow[]).map((r) => [r.id, r])
    );

    // Score answers and build exam_answers rows
    let totalCorrect = 0;
    const topicCorrect: Record<string, number> = {};
    const topicTotal: Record<string, number> = {};

    // Initialize counters from distribution
    for (const t of TOPIC_DISTRIBUTION) {
      topicCorrect[t.key] = 0;
      topicTotal[t.key] = 0;
    }

    const answerRows = answers.map((a) => {
      const bank = bankMap.get(a.question_id);
      const correctLetter = bank ? LETTERS[bank.respuesta_correcta] : null;
      const chosen = a.opcion_elegida?.charAt(0).toUpperCase() ?? null;
      const isCorrect = chosen !== null && chosen === correctLetter;

      if (isCorrect) totalCorrect++;

      if (bank) {
        const topicCfg = topicByTema(bank.tema);
        if (topicCfg) {
          topicTotal[topicCfg.key]++;
          if (isCorrect) topicCorrect[topicCfg.key]++;
        }
      }

      return {
        session_id,
        question_id: a.question_id,
        opcion_elegida: chosen && LETTERS.includes(chosen as typeof LETTERS[number]) ? chosen : null,
        es_correcta: isCorrect,
        tiempo_respuesta_seg: null,
      };
    });

    // Insert all exam_answers
    if (answerRows.length > 0) {
      const { error: insertErr } = await sb.from("exam_answers").insert(answerRows);
      if (insertErr) throw insertErr;
    }

    const total = answers.length;
    const score = total > 0 ? Number(((totalCorrect / total) * 100).toFixed(2)) : 0;

    // Update exam_session
    await sb
      .from("exam_sessions")
      .update({
        estado: "completado",
        score,
        correct_answers: totalCorrect,
        duracion_seg: typeof duracion_seg === "number" ? duracion_seg : null,
        completed_at: new Date().toISOString(),
      })
      .eq("id", session_id);

    // Build by_topic response
    const byTopic = TOPIC_DISTRIBUTION
      .filter((t) => (topicTotal[t.key] ?? 0) > 0)
      .map((t) => ({
        key: t.key,
        label: t.label,
        slug: t.slug,
        correct: topicCorrect[t.key] ?? 0,
        total: topicTotal[t.key] ?? 0,
        pct: topicTotal[t.key]
          ? Math.round(((topicCorrect[t.key] ?? 0) / topicTotal[t.key]) * 100)
          : 0,
      }));

    return NextResponse.json({ success: true, score, correct: totalCorrect, total, byTopic, session_id });
  } catch (error: unknown) {
    console.error("simulacro/submit error:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
