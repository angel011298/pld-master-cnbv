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

// GET /api/admin/qr-codes/redemptions?code_id=<uuid>
// Returns every individual redemption for a given QR code, enriched with full_name.
export async function GET(req: NextRequest) {
  const isAdmin = await assertAdmin(req);
  if (!isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const codeId = req.nextUrl.searchParams.get("code_id");
  if (!codeId) return NextResponse.json({ error: "Se requiere code_id" }, { status: 400 });

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("premium_qr_redemptions")
    .select("id, user_id, redeemed_at")
    .eq("code_id", codeId)
    .order("redeemed_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!data || data.length === 0) return NextResponse.json({ redemptions: [] });

  // Batch-fetch names from user_profiles (single query, no N+1)
  const userIds = [...new Set(data.map(r => r.user_id))];
  const { data: profiles } = await sb
    .from("user_profiles")
    .select("user_id, full_name")
    .in("user_id", userIds);

  const nameMap: Record<string, string | null> = {};
  for (const p of profiles ?? []) nameMap[p.user_id] = p.full_name ?? null;

  const enriched = data.map(r => ({
    id:          r.id,
    user_id:     r.user_id,
    full_name:   nameMap[r.user_id] ?? null,
    redeemed_at: r.redeemed_at,
  }));

  return NextResponse.json({ redemptions: enriched });
}
