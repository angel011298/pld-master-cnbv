import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";

const SUPER_ADMIN_EMAIL = "553angelortiz@gmail.com";

async function assertAdmin(req: NextRequest): Promise<string | null> {
  const sb = supabaseAdmin();
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return null;
  const { data: user } = await sb.auth.admin.getUserById(userId);
  if (user?.user?.email !== SUPER_ADMIN_EMAIL) return null;
  return userId;
}

// POST /api/admin/qr-codes — generate a new premium QR code token
export async function POST(req: NextRequest) {
  const adminId = await assertAdmin(req);
  if (!adminId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const label: string = typeof body.label === "string" ? body.label.slice(0, 120) : "";

  // max_uses: positive integer or null (unlimited). 0 sent from client = unlimited.
  const rawMax = body.max_uses;
  const maxUses: number | null =
    rawMax === null || rawMax === undefined
      ? 1
      : rawMax === 0
        ? null
        : Math.max(1, Math.floor(Number(rawMax)));

  // expires_in_hours: how long the QR token itself is valid (default 24 h, max 8 760 h = 1 year)
  const rawExpHrs = Number(body.expires_in_hours);
  const expiresInHours: number =
    isNaN(rawExpHrs) || rawExpHrs < 1 ? 24 : Math.min(Math.floor(rawExpHrs), 8760);

  // premium_duration_days: how long the premium access lasts after redemption (default 61 d ≈ 2 months)
  const rawPremDays = Number(body.premium_duration_days);
  const premiumDays: number =
    isNaN(rawPremDays) || rawPremDays < 1 ? 61 : Math.min(Math.floor(rawPremDays), 3650);

  const now = new Date();
  const expiresAt    = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);
  const premiumUntil = new Date(now.getTime() + premiumDays   * 24 * 60 * 60 * 1000);

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("premium_qr_codes")
    .insert({
      label: label || null,
      expires_at: expiresAt.toISOString(),
      premium_until: premiumUntil.toISOString(),
      max_uses: maxUses,
      use_count: 0,
      created_by: adminId,
    })
    .select("id, token, label, expires_at, premium_until, max_uses, use_count, created_at")
    .single();

  if (error || !data) {
    console.error("[qr-codes] insert error:", error);
    return NextResponse.json({ error: "Error generando código" }, { status: 500 });
  }

  return NextResponse.json({ code: data }, { status: 201 });
}

// GET /api/admin/qr-codes — list all QR codes (newest first)
export async function GET(req: NextRequest) {
  const adminId = await assertAdmin(req);
  if (!adminId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("premium_qr_codes")
    .select("id, token, label, expires_at, premium_until, max_uses, use_count, activated_by, activated_at, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Enrich first activating user name where available
  const enriched = await Promise.all(
    (data ?? []).map(async (row) => {
      if (!row.activated_by) return row;
      const { data: profile } = await sb
        .from("user_profiles")
        .select("full_name")
        .eq("user_id", row.activated_by)
        .single();
      return { ...row, activated_name: profile?.full_name ?? null };
    })
  );

  return NextResponse.json({ codes: enriched });
}

// DELETE /api/admin/qr-codes — delete a code by id
export async function DELETE(req: NextRequest) {
  const adminId = await assertAdmin(req);
  if (!adminId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : null;
  if (!id) {
    return NextResponse.json({ error: "Se requiere id" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { error } = await sb.from("premium_qr_codes").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// PATCH /api/admin/qr-codes — reactivate an expired or exhausted QR code
// Body: { id, expires_in_hours, reset_uses? }
export async function PATCH(req: NextRequest) {
  const adminId = await assertAdmin(req);
  if (!adminId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : null;
  if (!id) {
    return NextResponse.json({ error: "Se requiere id" }, { status: 400 });
  }

  // expires_in_hours: how many more hours to make the QR valid from now (1–8760)
  const rawExpHrs = Number(body.expires_in_hours);
  const expiresInHours: number =
    isNaN(rawExpHrs) || rawExpHrs < 1 ? 24 : Math.min(Math.floor(rawExpHrs), 8760);

  const resetUses = body.reset_uses === true;

  const newExpiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  const updatePayload: Record<string, unknown> = {
    expires_at: newExpiresAt.toISOString(),
  };
  if (resetUses) {
    updatePayload.use_count = 0;
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("premium_qr_codes")
    .update(updatePayload)
    .eq("id", id)
    .select("id, token, label, expires_at, premium_until, max_uses, use_count, activated_by, activated_at, created_at")
    .single();

  if (error || !data) {
    console.error("[qr-codes] reactivate error:", error);
    return NextResponse.json({ error: "Error reactivando código" }, { status: 500 });
  }

  return NextResponse.json({ code: data });
}
