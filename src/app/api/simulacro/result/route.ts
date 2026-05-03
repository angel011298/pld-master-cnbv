import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";
import { TOPIC_DISTRIBUTION, topicByTema } from "@/lib/simulacro-config";

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
    }

    const sessionId = req.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "session_id requerido." }, { status: 400 });
    }

    const sb = supabaseAdmin();

    // Verify ownership and fetch session
    const { data: session, error: sessionErr } = await sb
      .from("exam_sessions")
      .select("id, score, correct_answers, total_questions, duracion_seg, completed_at, estado, exam_type")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();

    if (sessionErr || !session) {
      return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 });
    }

    // Fetch answers for this session
    const { data: answers, error: answersErr } = await sb
      .from("exam_answers")
      .select("question_id, es_correcta")
      .eq("session_id", sessionId);

    if (answersErr) throw answersErr;

    // Fetch topic for each question
    const questionIds = (answers ?? []).map((a: { question_id: number }) => a.question_id);
    let temaById = new Map<number, string>();

    if (questionIds.length > 0) {
      const { data: qRows } = await sb
        .from("quiz_bank")
        .select("id, tema")
        .in("id", questionIds);
      temaById = new Map(
        ((qRows ?? []) as { id: number; tema: string }[]).map((r) => [r.id, r.tema])
      );
    }

    // Aggregate per topic
    const topicCorrect: Record<string, number> = {};
    const topicTotal: Record<string, number> = {};
    for (const t of TOPIC_DISTRIBUTION) {
      topicCorrect[t.key] = 0;
      topicTotal[t.key] = 0;
    }

    for (const ans of (answers ?? []) as { question_id: number; es_correcta: boolean }[]) {
      const tema = temaById.get(ans.question_id);
      if (tema) {
        const cfg = topicByTema(tema);
        if (cfg) {
          topicTotal[cfg.key]++;
          if (ans.es_correcta) topicCorrect[cfg.key]++;
        }
      }
    }

    const byTopic = TOPIC_DISTRIBUTION.map((t) => ({
      key: t.key,
      label: t.label,
      slug: t.slug,
      correct: topicCorrect[t.key],
      total: topicTotal[t.key],
      pct: topicTotal[t.key] > 0
        ? Math.round((topicCorrect[t.key] / topicTotal[t.key]) * 100)
        : 0,
    })).filter((t) => t.total > 0);

    // Historical simulacros (last 5, including current)
    const { data: history } = await sb
      .from("exam_sessions")
      .select("id, score, correct_answers, total_questions, completed_at, duracion_seg")
      .eq("user_id", userId)
      .eq("exam_type", "simulacro")
      .eq("estado", "completado")
      .order("completed_at", { ascending: false })
      .limit(5);

    return NextResponse.json({ session, byTopic, history: history ?? [] });
  } catch (error: unknown) {
    console.error("simulacro/result error:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
