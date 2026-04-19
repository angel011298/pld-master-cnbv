import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const sb = supabaseAdmin();
  const { data } = await sb
    .from("organizations")
    .select("id, name, rfc, razon_social, max_seats, used_seats, access_level, access_expires_at")
    .eq("admin_user_id", userId)
    .maybeSingle();

  if (!data) return NextResponse.json({ organization: null });
  return NextResponse.json({ organization: data });
}
