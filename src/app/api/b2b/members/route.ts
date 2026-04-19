import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const sb = supabaseAdmin();
  const { data: org } = await sb
    .from("organizations")
    .select("id")
    .eq("admin_user_id", userId)
    .maybeSingle();

  if (!org) return NextResponse.json({ members: [] });

  const { data: members } = await sb
    .from("organization_members")
    .select("id, email, user_id, role, invited_at, accepted_at")
    .eq("organization_id", org.id)
    .order("invited_at", { ascending: false });

  return NextResponse.json({ members: members ?? [] });
}
