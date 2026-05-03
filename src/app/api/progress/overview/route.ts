import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";

export interface TopicProgress {
  tema: string;
  accuracy: number | null;
  total_answered: number;
  pending_reviews_today: number;
  label: string;
}

export interface ProgressOverviewResponse {
  total_xp: number;
  current_streak: number;
  simulacros_completados: number;
  score_promedio_simulacros: number | null;
  topics: TopicProgress[];
}

const TOPIC_LABELS: Record<string, string> = {
  tipologias:    "Bloque 1: Lavado de Dinero y FT",
  gafi:          "Bloque 2: Organismos Internacionales",
  sanciones:     "Bloque 3: Detección y Gestión de Riesgos",
  kyc_cdd:       "Bloque 4: Prevención y Combate LD/FT",
  reportes_cnbv: "Bloque 5: Régimen de Prevención LD/FT",
  marco_legal:   "Bloque 6: Ley FPIORPI",
  une:           "Bloque 7: Auditoría PLD/FT",
};

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
    }

    const sb = supabaseAdmin();

    // 1. Get user profile (xp, streak)
    const { data: profile, error: profileErr } = await sb
      .from("user_profiles")
      .select("total_xp, current_streak")
      .eq("user_id", userId)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: "Perfil no encontrado." }, { status: 404 });
    }

    // 2. Get simulacro stats (count + avg score)
    const { data: simulacros } = await sb
      .from("exam_sessions")
      .select("score")
      .eq("user_id", userId)
      .eq("exam_type", "simulacro")
      .eq("estado", "completado");

    const simulacros_completados = simulacros?.length ?? 0;
    const scores = (simulacros ?? []).filter(s => s.score != null).map(s => Number(s.score));
    const score_promedio_simulacros = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

    // 3. Get last 50 exam answers with topic info
    const { data: answers } = await sb
      .from("exam_answers")
      .select(`
        id,
        es_correcta,
        question_id,
        quiz_bank!inner (tema),
        exam_sessions!inner (user_id)
      `)
      .eq("exam_sessions.user_id", userId)
      .order("answered_at", { ascending: false })
      .limit(50);

    // Group by topic and calculate accuracy
    const topicMap = new Map<string, { correct: number; total: number }>();
    for (const a of answers ?? []) {
      const tema = (a.quiz_bank as any)?.tema;
      if (!tema) continue;
      const current = topicMap.get(tema) ?? { correct: 0, total: 0 };
      current.total += 1;
      if (a.es_correcta) current.correct += 1;
      topicMap.set(tema, current);
    }

    // 4. Get pending reviews today per topic
    const { data: dueReviews } = await sb
      .from("v_due_reviews")
      .select("tema")
      .eq("user_id", userId);

    const dueTodayMap = new Map<string, number>();
    for (const r of dueReviews ?? []) {
      const tema = r.tema;
      dueTodayMap.set(tema, (dueTodayMap.get(tema) ?? 0) + 1);
    }

    // 5. Build topic array with all 7 topics
    const allTopics = [
      "tipologias",
      "gafi",
      "sanciones",
      "kyc_cdd",
      "reportes_cnbv",
      "marco_legal",
      "une",
    ];

    const topics: TopicProgress[] = allTopics.map(tema => {
      const stats = topicMap.get(tema);
      const accuracy = stats ? Math.round((stats.correct / stats.total) * 100) : null;
      return {
        tema,
        accuracy,
        total_answered: stats?.total ?? 0,
        pending_reviews_today: dueTodayMap.get(tema) ?? 0,
        label: TOPIC_LABELS[tema] || tema
      };
    });

    return NextResponse.json({
      total_xp: profile.total_xp ?? 0,
      current_streak: profile.current_streak ?? 0,
      simulacros_completados,
      score_promedio_simulacros,
      topics
    } satisfies ProgressOverviewResponse);
  } catch (error: unknown) {
    console.error("progress/overview error:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
