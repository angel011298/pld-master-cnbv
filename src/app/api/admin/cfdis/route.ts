import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { requireSuperAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  const sb = supabaseAdmin();
  let q = sb
    .from("cfdis")
    .select("id, purchase_id, user_id, receptor_rfc, receptor_nombre, total, status, uuid_fiscal, fecha_timbrado, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status) q = q.eq("status", status);

  const { data } = await q;
  return NextResponse.json({ cfdis: data ?? [] });
}
