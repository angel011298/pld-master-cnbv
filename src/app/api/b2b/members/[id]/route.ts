import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const { id: memberId } = await ctx.params;
  const sb = supabaseAdmin();

  const { data: org } = await sb
    .from("organizations")
    .select("id, used_seats")
    .eq("admin_user_id", userId)
    .maybeSingle();

  if (!org) return NextResponse.json({ error: "Sin organización." }, { status: 403 });

  const { data: member } = await sb
    .from("organization_members")
    .select("id")
    .eq("id", memberId)
    .eq("organization_id", org.id)
    .maybeSingle();

  if (!member) return NextResponse.json({ error: "Miembro no encontrado." }, { status: 404 });

  await sb.from("organization_members").delete().eq("id", memberId);
  await sb
    .from("organizations")
    .update({ used_seats: Math.max(0, (org.used_seats ?? 1) - 1) })
    .eq("id", org.id);

  return NextResponse.json({ ok: true });
}
