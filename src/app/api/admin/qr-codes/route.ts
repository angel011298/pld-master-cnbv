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
  // max_uses: positive integer or null (unlimited). Default 1 (single use).
  const rawMax = body.max_uses;
  const maxUses: number | null =
    rawMax === null || rawMax === undefined
      ? 1
      : rawMax === 0
        ? null  // 0 sent from client means unlimited
        : Math.max(1, Math.floor(Number(rawMax)));

  const now = new Date();
  // Token expires in 24 hours — after that it can no longer be scanned
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  // The premium access granted on redemption lasts 2 months (~61 days)
  const premiumUntil = new Date(now.getTime() + 61 * 24 * 60 * 60 * 1000);

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
