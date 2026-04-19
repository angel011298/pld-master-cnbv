import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";

function makeCode(userId: string) {
  const base = userId.replace(/-/g, "").slice(0, 6).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `REF-${base}-${rand}`;
}

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const sb = supabaseAdmin();
  let { data: existing } = await sb
    .from("referrals")
    .select("referral_code")
    .eq("referrer_user_id", userId)
    .is("referred_user_id", null)
    .maybeSingle();

  if (!existing) {
    const code = makeCode(userId);
    const { data, error } = await sb
      .from("referrals")
      .insert({ referrer_user_id: userId, referral_code: code })
      .select("referral_code")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    existing = data;
  }

  const { data: converted } = await sb
    .from("referrals")
    .select("id, status, converted_at, reward_amount")
    .eq("referrer_user_id", userId);

  return NextResponse.json({ code: existing?.referral_code, referrals: converted ?? [] });
}
