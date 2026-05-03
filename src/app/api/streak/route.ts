import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
    }

    const sb = supabaseAdmin();

    // Fetch current profile
    const { data: profile, error: profileErr } = await sb
      .from("user_profiles")
      .select("current_streak, last_active_at")
      .eq("user_id", userId)
      .single();

    if (profileErr) throw profileErr;

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let newStreak = profile?.current_streak ?? 0;
    const lastActive = profile?.last_active_at ? new Date(profile.last_active_at) : null;

    if (lastActive) {
      const lastActiveAtStartOfDay = new Date(lastActive);
      lastActiveAtStartOfDay.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const daysDiff = Math.floor(
        (today.getTime() - lastActiveAtStartOfDay.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 0) {
        // Same day, streak unchanged
      } else if (daysDiff === 1) {
        // Last active was yesterday, increment streak
        newStreak = (newStreak ?? 0) + 1;
      } else if (daysDiff >= 2) {
        // Missed 2+ days, reset to 1
        newStreak = 1;
      }
    } else {
      // First time, streak = 1
      newStreak = 1;
    }

    // Update profile
    await sb
      .from("user_profiles")
      .update({
        current_streak: newStreak,
        last_active_at: now.toISOString(),
      })
      .eq("user_id", userId);

    return NextResponse.json({
      success: true,
      racha: newStreak,
    });
  } catch (error: unknown) {
    console.error("streak error:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
