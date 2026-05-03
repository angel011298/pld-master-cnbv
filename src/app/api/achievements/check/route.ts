import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";

export interface UnlockedAchievement {
  key: string;
  name: string;
  description: string;
  icon: string;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
    }

    const sb = supabaseAdmin();
    const unlockedList: UnlockedAchievement[] = [];

    // Get current user profile
    const { data: profile } = await sb
      .from("user_profiles")
      .select("total_xp, current_streak")
      .eq("user_id", userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Perfil no encontrado." }, { status: 404 });
    }

    // Get user's study events for primera_leccion
    const { data: studyEvents } = await sb
      .from("study_events")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    // Get user's simulacros
    const { data: simulacros } = await sb
      .from("exam_sessions")
      .select("score")
      .eq("user_id", userId)
      .eq("exam_type", "simulacro")
      .eq("estado", "completado");

    // Get user's sessions for answer data
    const { data: sessions } = await sb
      .from("exam_sessions")
      .select("id")
      .eq("user_id", userId);

    const sessionIds = (sessions ?? []).map(s => s.id);

    // Get exam answers for topic accuracy calculations
    let answersWithTopics: Array<{ tema: string; es_correcta: boolean }> = [];
    if (sessionIds.length > 0) {
      const { data: answers } = await sb
        .from("exam_answers")
        .select(`
          es_correcta,
          quiz_bank!inner (tema)
        `)
        .in("session_id", sessionIds);

      answersWithTopics = (answers ?? []).map(a => ({
        tema: (a.quiz_bank as any)?.tema || "",
        es_correcta: a.es_correcta
      }));
    }

    // Calculate per-topic accuracy
    const topicMap = new Map<string, { correct: number; total: number }>();
    for (const a of answersWithTopics) {
      if (!a.tema) continue;
      const current = topicMap.get(a.tema) ?? { correct: 0, total: 0 };
      current.total += 1;
      if (a.es_correcta) current.correct += 1;
      topicMap.set(a.tema, current);
    }

    // Get already unlocked achievements
    const { data: alreadyUnlocked } = await sb
      .from("user_achievements")
      .select("achievement_key")
      .eq("user_id", userId);

    const unlockedKeys = new Set(
      (alreadyUnlocked ?? []).map(a => (a.achievement_key as string))
    );

    // Get all achievements metadata
    const { data: allAchievements } = await sb
      .from("achievements")
      .select("key, name, description, icon");

    const achievementMap = new Map(
      (allAchievements ?? []).map(a => [a.key, a])
    );

    // 1. primera_leccion: Has completed at least one study event
    if (!unlockedKeys.has("primera_leccion") && (studyEvents ?? []).length > 0) {
      await sb
        .from("user_achievements")
        .insert({
          user_id: userId,
          achievement_key: "primera_leccion",
          metadata: {}
        });
      unlockedKeys.add("primera_leccion");
      const ach = achievementMap.get("primera_leccion");
      if (ach) unlockedList.push(ach);
    }

    // 2. racha_3: current_streak >= 3
    if (!unlockedKeys.has("racha_3") && profile.current_streak >= 3) {
      await sb
        .from("user_achievements")
        .insert({
          user_id: userId,
          achievement_key: "racha_3",
          metadata: { streak: profile.current_streak }
        });
      unlockedKeys.add("racha_3");
      const ach = achievementMap.get("racha_3");
      if (ach) unlockedList.push(ach);
    }

    // 3. racha_7: current_streak >= 7
    if (!unlockedKeys.has("racha_7") && profile.current_streak >= 7) {
      await sb
        .from("user_achievements")
        .insert({
          user_id: userId,
          achievement_key: "racha_7",
          metadata: { streak: profile.current_streak }
        });
      unlockedKeys.add("racha_7");
      const ach = achievementMap.get("racha_7");
      if (ach) unlockedList.push(ach);
    }

    // 4. primer_simulacro: Completed at least one simulacro
    const simulacrosCount = simulacros?.length ?? 0;
    if (!unlockedKeys.has("primer_simulacro") && simulacrosCount > 0) {
      await sb
        .from("user_achievements")
        .insert({
          user_id: userId,
          achievement_key: "primer_simulacro",
          metadata: { count: simulacrosCount }
        });
      unlockedKeys.add("primer_simulacro");
      const ach = achievementMap.get("primer_simulacro");
      if (ach) unlockedList.push(ach);
    }

    // 5. aprobado_simulacro: At least one simulacro with score >= 80
    const hasHighScore = (simulacros ?? []).some(s => (s.score ?? 0) >= 80);
    if (!unlockedKeys.has("aprobado_simulacro") && hasHighScore) {
      await sb
        .from("user_achievements")
        .insert({
          user_id: userId,
          achievement_key: "aprobado_simulacro",
          metadata: { high_scores: simulacros?.filter(s => (s.score ?? 0) >= 80).length }
        });
      unlockedKeys.add("aprobado_simulacro");
      const ach = achievementMap.get("aprobado_simulacro");
      if (ach) unlockedList.push(ach);
    }

    // 6. maestro_gafi: 20+ correct answers on gafi topic
    const gafiStats = topicMap.get("gafi");
    const gafiCorrect = gafiStats?.correct ?? 0;
    if (!unlockedKeys.has("maestro_gafi") && gafiCorrect >= 20) {
      await sb
        .from("user_achievements")
        .insert({
          user_id: userId,
          achievement_key: "maestro_gafi",
          metadata: { correct_answers: gafiCorrect }
        });
      unlockedKeys.add("maestro_gafi");
      const ach = achievementMap.get("maestro_gafi");
      if (ach) unlockedList.push(ach);
    }

    // 7. experto_pld: All 7 topics with >= 80% accuracy
    const allTopics = [
      "marco_legal",
      "gafi",
      "kyc_cdd",
      "reportes_cnbv",
      "une",
      "sanciones",
      "tipologias"
    ];
    const allTopicsAt80 = allTopics.every(tema => {
      const stats = topicMap.get(tema);
      if (!stats || stats.total === 0) return false;
      return Math.round((stats.correct / stats.total) * 100) >= 80;
    });

    if (!unlockedKeys.has("experto_pld") && allTopicsAt80) {
      await sb
        .from("user_achievements")
        .insert({
          user_id: userId,
          achievement_key: "experto_pld",
          metadata: { topics_at_80_percent: allTopics.length }
        });
      unlockedKeys.add("experto_pld");
      const ach = achievementMap.get("experto_pld");
      if (ach) unlockedList.push(ach);
    }

    return NextResponse.json({ unlocked: unlockedList });
  } catch (error: unknown) {
    console.error("achievements/check error:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
