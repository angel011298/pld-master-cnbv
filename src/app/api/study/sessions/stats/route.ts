import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/study/sessions/stats
// Returns a comprehensive pre-aggregated statistics object for the dashboard.
// All computation happens server-side; the frontend only renders raw values.
//
// Shape:
// {
//   summary:          { total_sessions, total_questions_answered, accuracy_percentage,
//                       favorite_formato, weakest_bloque, sessions_this_week,
//                       streak_days, last_session_at, total_xp, current_streak }
//   session_chart:    last 20 sessions (ascending) for the LineChart
//   by_formato:       questions_answered + accuracy_percentage grouped by formato
//   by_bloque:        accuracy_percentage grouped by bloque 1-8 (always 8 rows)
//   time_by_formato:  total_minutes per formato
//   recent_sessions:  last 10 sessions for the table
// }
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const admin = supabaseAdmin();

  // ── Fetch all source data in parallel ────────────────────────────────────
  const [statsRes, profileRes, sessionsRes] = await Promise.all([
    admin
      .from("user_study_stats")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),

    admin
      .from("user_profiles")
      .select("total_xp, current_streak")
      .eq("user_id", userId)
      .maybeSingle(),

    // Fetch up to 500 completed sessions for aggregation (most active users never reach this)
    admin
      .from("study_sessions")
      .select(
        "id, created_at, formato, bloque, score_percentage, " +
        "correct_count, total_questions, started_at, completed_at, xp_earned"
      )
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  if (statsRes.error) {
    console.error("[study/sessions/stats GET] stats error:", statsRes.error);
  }
  if (sessionsRes.error) {
    console.error("[study/sessions/stats GET] sessions error:", sessionsRes.error);
    return NextResponse.json({ error: sessionsRes.error.message }, { status: 500 });
  }

  const stats    = statsRes.data;
  const profile  = profileRes.data;

  // ── Failed questions count (last 30 days) ─────────────────────────────────
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const recentSessionIds = (sessionsRes.data ?? [])
    .filter((s) => new Date(s.created_at) >= new Date(thirtyDaysAgo))
    .map((s) => s.id)
    .slice(0, 100);

  let failedQuestionsCount = 0;
  if (recentSessionIds.length > 0) {
    const { data: failedData } = await admin
      .from("study_question_responses")
      .select("question_id")
      .in("session_id", recentSessionIds)
      .eq("is_correct", false)
      .gte("answered_at", thirtyDaysAgo);

    failedQuestionsCount = new Set(
      (failedData ?? []).map((r: { question_id: number }) => r.question_id)
    ).size;
  }

  type SessionRow = {
    id: string;
    created_at: string;
    formato: string;
    bloque: number | null;
    score_percentage: number | null;
    correct_count: number;
    total_questions: number;
    started_at: string;
    completed_at: string | null;
    xp_earned: number;
  };

  const sessions = (sessionsRes.data ?? []) as SessionRow[];

  // ── 1. Session accuracy chart — last 20, ascending for timeline display ───
  const sessionChart = sessions
    .slice(0, 20)
    .reverse()
    .map((s, i) => ({
      session_number: i + 1,
      score_percentage: Math.round(Number(s.score_percentage ?? 0)),
      formato: s.formato,
      date: s.created_at,
    }));

  // ── 2. Aggregate by formato ───────────────────────────────────────────────
  type FormatoAgg = { session_count: number; total_score: number; total_questions: number };
  const formatoMap = new Map<string, FormatoAgg>();

  for (const s of sessions) {
    const agg = formatoMap.get(s.formato) ?? { session_count: 0, total_score: 0, total_questions: 0 };
    agg.session_count    += 1;
    agg.total_score      += Number(s.score_percentage ?? 0);
    agg.total_questions  += s.total_questions ?? 0;
    formatoMap.set(s.formato, agg);
  }

  const byFormato = [...formatoMap.entries()]
    .map(([formato, agg]) => ({
      formato,
      session_count:        agg.session_count,
      questions_answered:   agg.total_questions,
      accuracy_percentage:
        agg.session_count > 0
          ? Math.round((agg.total_score / agg.session_count) * 10) / 10
          : 0,
    }))
    .sort((a, b) => b.questions_answered - a.questions_answered);

  // ── 3. Aggregate by bloque — always return rows for all 8 bloques ─────────
  type BloqueAgg = { session_count: number; total_score: number };
  const bloqueMap = new Map<number, BloqueAgg>();

  for (const s of sessions) {
    if (s.bloque == null) continue;
    const agg = bloqueMap.get(s.bloque) ?? { session_count: 0, total_score: 0 };
    agg.session_count += 1;
    agg.total_score   += Number(s.score_percentage ?? 0);
    bloqueMap.set(s.bloque, agg);
  }

  const byBloque = Array.from({ length: 8 }, (_, i) => i + 1).map((bloque) => {
    const agg = bloqueMap.get(bloque);
    return {
      bloque,
      session_count: agg?.session_count ?? 0,
      accuracy_percentage:
        agg && agg.session_count > 0
          ? Math.round((agg.total_score / agg.session_count) * 10) / 10
          : 0,
    };
  });

  // ── 4. Time dedicated per formato (minutes) ───────────────────────────────
  const timeMap = new Map<string, number>();

  for (const s of sessions) {
    if (!s.completed_at) continue;
    const ms = new Date(s.completed_at).getTime() - new Date(s.started_at).getTime();
    const minutes = ms / 60_000;
    // Sanity filter: ignore sessions longer than 5 h or negative
    if (minutes <= 0 || minutes > 300) continue;
    timeMap.set(s.formato, (timeMap.get(s.formato) ?? 0) + minutes);
  }

  const timeByFormato = [...timeMap.entries()]
    .map(([formato, total_minutes]) => ({
      formato,
      total_minutes: Math.round(total_minutes),
    }))
    .filter((t) => t.total_minutes > 0)
    .sort((a, b) => b.total_minutes - a.total_minutes);

  // ── 5. Recent sessions table (last 10) ────────────────────────────────────
  const recentSessions = sessions.slice(0, 10).map((s) => {
    const durationMs = s.completed_at
      ? new Date(s.completed_at).getTime() - new Date(s.started_at).getTime()
      : 0;
    return {
      id:               s.id,
      created_at:       s.created_at,
      formato:          s.formato,
      bloque:           s.bloque,
      total_questions:  s.total_questions,
      correct_count:    s.correct_count,
      score_percentage: Math.round(Number(s.score_percentage ?? 0)),
      duration_seconds: Math.max(0, Math.floor(durationMs / 1000)),
      xp_earned:        s.xp_earned ?? 0,
    };
  });

  // ── Compose final response ────────────────────────────────────────────────
  return NextResponse.json({
    summary: {
      total_sessions:           stats?.total_sessions           ?? 0,
      total_questions_answered: stats?.total_questions_answered ?? 0,
      accuracy_percentage:
        Math.round(Number(stats?.accuracy_percentage ?? 0) * 10) / 10,
      favorite_formato:  stats?.favorite_formato  ?? null,
      weakest_bloque:    stats?.weakest_bloque    ?? null,
      sessions_this_week: stats?.sessions_this_week ?? 0,
      streak_days:       stats?.streak_days       ?? 0,
      last_session_at:   stats?.last_session_at   ?? null,
      total_xp:               profile?.total_xp        ?? 0,
      current_streak:         profile?.current_streak  ?? 0,
      failed_questions_count: failedQuestionsCount,
    },
    session_chart:    sessionChart,
    by_formato:       byFormato,
    by_bloque:        byBloque,
    time_by_formato:  timeByFormato,
    recent_sessions:  recentSessions,
  });
}
