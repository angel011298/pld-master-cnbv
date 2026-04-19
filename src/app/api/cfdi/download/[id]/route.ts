import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";
import { isSuperAdmin } from "@/lib/admin";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const { id } = await ctx.params;
  const sb = supabaseAdmin();
  const { data: cfdi } = await sb
    .from("cfdis")
    .select("id, user_id, organization_id, uuid_fiscal, xml_cfdi, pdf_url, status")
    .eq("id", id)
    .maybeSingle();

  if (!cfdi) return NextResponse.json({ error: "CFDI no encontrado." }, { status: 404 });

  const isOwner = cfdi.user_id === userId;
  const isAdmin = await isSuperAdmin(userId);
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Sin permiso." }, { status: 403 });
  }

  return NextResponse.json({
    uuid: cfdi.uuid_fiscal,
    xml: cfdi.xml_cfdi,
    pdf_url: cfdi.pdf_url,
    status: cfdi.status,
  });
}
