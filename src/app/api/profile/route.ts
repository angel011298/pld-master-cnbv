import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUser } from "./_auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const admin = supabaseAdmin();

  const { data: profile, error } = await admin
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: achievements } = await admin
    .from("user_achievements")
    .select("achievement_key, unlocked_at")
    .eq("user_id", user.id);

  const today = new Date().toISOString().slice(0, 10);
  const { count: todayEvents } = await admin
    .from("study_events")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", `${today}T00:00:00`);

  const provider =
    user.app_metadata?.provider ||
    user.app_metadata?.providers?.[0] ||
    "email";
  const avatarUrl =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    null;

  return NextResponse.json({
    profile: {
      ...profile,
      avatar_url: avatarUrl,
      xp_today: (todayEvents || 0) * 10,
    },
    user_email: user.email || "",
    provider,
    achievements: (achievements || []).map(
      (a: { achievement_key: string; unlocked_at: string | null }) => ({
        key: a.achievement_key,
        unlocked_at: a.unlocked_at,
      })
    ),
  });
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (typeof body.full_name === "string")
    updates.full_name = body.full_name.trim() || null;
  if (typeof body.exam_target_date === "string")
    updates.exam_date = body.exam_target_date || null;
  if (
    typeof body.daily_xp_goal === "number" &&
    [10, 25, 50, 100].includes(body.daily_xp_goal)
  )
    updates.daily_xp_goal = body.daily_xp_goal;
  if (typeof body.notification_email_enabled === "boolean")
    updates.notification_email_enabled = body.notification_email_enabled;
  if (typeof body.notification_study_reminder === "boolean")
    updates.notification_study_reminder = body.notification_study_reminder;

  if (Object.keys(updates).length === 0)
    return NextResponse.json(
      { error: "No hay campos válidos para actualizar" },
      { status: 400 }
    );

  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("user_profiles")
    .update(updates)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ profile: data });
}
