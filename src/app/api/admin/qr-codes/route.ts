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

  const now = new Date();
  // Token is valid to scan for 90 days; the premium access it grants lasts 2 months
  const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const premiumUntil = new Date(now.getTime() + 61 * 24 * 60 * 60 * 1000); // ~2 months

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("premium_qr_codes")
    .insert({
      label: label || null,
      expires_at: expiresAt.toISOString(),
      premium_until: premiumUntil.toISOString(),
      created_by: adminId,
    })
    .select("id, token, label, expires_at, premium_until, created_at")
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
    .select("id, token, label, expires_at, premium_until, activated_by, activated_at, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Enrich with activating user email where available
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
