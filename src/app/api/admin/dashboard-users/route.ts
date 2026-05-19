import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";

const SUPER_ADMIN_EMAIL = "553angelortiz@gmail.com";

async function assertAdmin(req: NextRequest): Promise<boolean> {
  const sb = supabaseAdmin();
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return false;
  const { data: user } = await sb.auth.admin.getUserById(userId);
  return user?.user?.email === SUPER_ADMIN_EMAIL;
}

// GET /api/admin/dashboard-users
// Returns every auth user merged with their profile + QR source data.
// Uses service-role to bypass RLS — admin-only.
export async function GET(req: NextRequest) {
  const isAdmin = await assertAdmin(req);
  if (!isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const sb = supabaseAdmin();

  // 1. All auth users (includes email, provider, created_at)
  const { data: { users: authUsers }, error: authErr } = await sb.auth.admin.listUsers({ perPage: 1000 });
  if (authErr) return NextResponse.json({ error: authErr.message }, { status: 500 });

  // 2. All profiles
  const { data: profiles, error: profErr } = await sb.from("user_profiles").select("*");
  if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 });

  const profileMap: Record<string, Record<string, unknown>> = {};
  for (const p of profiles ?? []) profileMap[p.user_id] = p;

  // 3. QR codes referenced by profiles (batch)
  const qrIds = [...new Set(
    (profiles ?? []).filter(p => p.premium_qr_code_id).map(p => p.premium_qr_code_id as string)
  )];
  const qrMap: Record<string, { label: string | null; token: string }> = {};
  if (qrIds.length > 0) {
    const { data: qrCodes } = await sb
      .from("premium_qr_codes")
      .select("id, token, label")
      .in("id", qrIds);
    for (const q of qrCodes ?? []) qrMap[q.id] = { label: q.label, token: q.token };
  }

  const enriched = (authUsers ?? []).map(au => {
    const profile = profileMap[au.id] ?? {};
    const qr = profile.premium_qr_code_id
      ? (qrMap[profile.premium_qr_code_id as string] ?? null)
      : null;

    return {
      user_id:             au.id,
      email:               au.email ?? (profile.email as string | null) ?? null,
      provider:            (au.app_metadata?.provider as string) ?? "email",
      created_at:          au.created_at,
      last_sign_in_at:     au.last_sign_in_at ?? null,
      // profile
      full_name:           (profile.full_name as string | null) ?? null,
      public_customer_id:  (profile.public_customer_id as string | null) ?? null,
      tier:                (profile.tier as string) ?? "free",
      status:              (profile.status as string) ?? "active",
      total_xp:            (profile.total_xp as number) ?? 0,
      current_streak:      (profile.current_streak as number) ?? 0,
      premium_expires_at:  (profile.premium_expires_at as string | null) ?? null,
      premium_source:      (profile.premium_source as string | null) ?? "organic",
      premium_qr_code_id:  (profile.premium_qr_code_id as string | null) ?? null,
      next_reminder_at:    (profile.next_reminder_at as string | null) ?? null,
      reminder_channels:   (profile.reminder_channels as string[]) ?? [],
      temp_password:       (profile.temp_password as string | null) ?? null,
      password_changed_at: (profile.password_changed_at as string | null) ?? null,
      // QR info
      qr_label:            qr?.label ?? null,
      qr_token:            qr?.token ?? null,
    };
  });

  return NextResponse.json({ users: enriched });
}

// PATCH /api/admin/dashboard-users — save reminder config for a user
export async function PATCH(req: NextRequest) {
  const isAdmin = await assertAdmin(req);
  if (!isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { user_id, next_reminder_at, reminder_channels } = body;
  if (!user_id) return NextResponse.json({ error: "Se requiere user_id" }, { status: 400 });

  const sb = supabaseAdmin();
  const { error } = await sb
    .from("user_profiles")
    .update({
      next_reminder_at: next_reminder_at ?? null,
      reminder_channels: reminder_channels ?? [],
    })
    .eq("user_id", user_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
