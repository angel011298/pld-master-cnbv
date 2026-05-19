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

    // Get current profile
    const { data: profile } = await sb
      .from("user_profiles")
      .select("total_xp, current_streak")
      .eq("user_id", userId)
      .single();

    const currentXp = profile?.total_xp ?? 0;
    const currentStreak = profile?.current_streak ?? 0;

    // Streak logic using calendar days (Mexico City time, UTC-6)
    // We offset by 6h so "today" lines up with local day boundaries.
    const nowMs = Date.now();
    const offsetMs = 6 * 60 * 60 * 1000; // UTC-6
    const toDay = (ms: number) => Math.floor((ms - offsetMs) / (24 * 60 * 60 * 1000));

    const todayDay   = toDay(nowMs);
    const todayStart = new Date((todayDay * 24 * 60 * 60 * 1000) + offsetMs).toISOString();
    const yestStart  = new Date(((todayDay - 1) * 24 * 60 * 60 * 1000) + offsetMs).toISOString();

    // Check if user already studied today (before this event)
    const { count: todayCount } = await sb
      .from("study_events")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", todayStart);

    // Check if user studied yesterday (keeps the chain alive)
    const { count: yestCount } = await sb
      .from("study_events")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", yestStart)
      .lt("created_at", todayStart);

    let newStreak: number;
    if ((todayCount ?? 0) > 1) {
      // Already studied today before this event → streak unchanged
      newStreak = currentStreak;
    } else if ((yestCount ?? 0) > 0 || currentStreak === 0) {
      // First event today AND (studied yesterday OR streak was already 0) → increment
      newStreak = currentStreak + 1;
    } else {
      // First event today but missed yesterday → reset to 1
      newStreak = 1;
    }
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
