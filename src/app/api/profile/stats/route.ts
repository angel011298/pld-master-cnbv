import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUser } from "../_auth";

export const dynamic = "force-dynamic";

const TEMA_TO_BLOQUE: Record<string, number> = {
  marco_legal: 1,
  gafi: 2,
  kyc_cdd: 3,
  reportes_cnbv: 4,
  une: 5,
  sanciones: 6,
  tipologias: 7,
};

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const admin = supabaseAdmin();

  const { data: sessions } = await admin
    .from("exam_sessions")
    .select("score, duracion_seg")
    .eq("user_id", user.id)
    .eq("estado", "completado");

  const completed = sessions || [];
  const total = completed.length;
  const best_score =
    total > 0 ? Math.max(...completed.map((s) => s.score || 0)) : 0;
  const avg_score =
    total > 0
      ? Math.round(
          completed.reduce((sum, s) => sum + (s.score || 0), 0) / total
        )
      : 0;
  const avg_duration_min =
    total > 0
      ? Math.round(
          (completed.reduce((sum, s) => sum + (s.duracion_seg || 0), 0) /
            total /
            60) *
            10
        ) / 10
      : 0;

  const { data: topicStats } = await admin
    .from("v_user_topic_accuracy")
    .select("tema, total_answers, correct_answers, accuracy")
    .eq("user_id", user.id);

  const bloque_progress = (topicStats || [])
    .map((row) => ({
      bloque: TEMA_TO_BLOQUE[row.tema] || 0,
      correct: row.correct_answers || 0,
      total: row.total_answers || 0,
      pct: Math.round(Number(row.accuracy) || 0),
    }))
    .filter((b) => b.bloque > 0)
    .sort((a, b) => a.bloque - b.bloque);

  const { data: profile } = await admin
    .from("user_profiles")
    .select("exam_score_prediction, pass_probability")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({
    exam_stats: { total, best_score, avg_score, avg_duration_min },
    bloque_progress,
    predictions: {
      exam_score_prediction: profile?.exam_score_prediction ?? null,
      pass_probability: profile?.pass_probability ?? null,
    },
  });
}
