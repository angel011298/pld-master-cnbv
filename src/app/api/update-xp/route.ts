import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";

interface UpdateXpPayload {
  xpGained: number;
  correct: boolean;
  topic?: string;
  difficulty?: string;
  responseTimeMs?: number;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Debes iniciar sesión con Google." }, { status: 401 });
    }

    const payload = (await req.json()) as UpdateXpPayload;
    const xpGained = Math.max(0, Math.min(500, Number(payload.xpGained) || 0));
    const correct = Boolean(payload.correct);
    const topic = typeof payload.topic === "string" ? payload.topic.slice(0, 200) : null;
    const difficulty = typeof payload.difficulty === "string" ? payload.difficulty.slice(0, 50) : null;
    const responseTimeMs = typeof payload.responseTimeMs === "number" ? payload.responseTimeMs : null;

    const sb = supabaseAdmin();

    // Insert study event
    await sb.from("study_events").insert({
      user_id: userId,
      event_type: "quiz",
      correct,
      topic,
      difficulty,
      response_time_ms: responseTimeMs,
    });

    // Check if user answered a quiz in the last 24h (for streak logic)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: recentCount } = await sb
      .from("study_events")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("event_type", "quiz")
      .gte("created_at", oneDayAgo);

    // Get current profile
    const { data: profile } = await sb
      .from("user_profiles")
      .select("total_xp, current_streak")
      .eq("user_id", userId)
      .single();

    const currentXp = profile?.total_xp ?? 0;
    const currentStreak = profile?.current_streak ?? 0;

    // Streak: increment if this is the first quiz today (recentCount was 0 before this insert, so now it's 1)
    const newStreak = (recentCount ?? 0) <= 1 ? currentStreak + 1 : currentStreak;
    const newXp = currentXp + xpGained;

    // Upsert profile (create if not exists)
    const { error: upsertError } = await sb
      .from("user_profiles")
      .upsert(
        {
          user_id: userId,
          total_xp: newXp,
          current_streak: newStreak,
        },
        { onConflict: "user_id" }
      );

    if (upsertError) throw upsertError;

    return NextResponse.json({ success: true, totalXp: newXp, streak: newStreak });
  } catch (error: unknown) {
    console.error("update-xp error:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
