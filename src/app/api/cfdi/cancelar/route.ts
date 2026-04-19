import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { requireSuperAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";
import { swCancelCfdi } from "@/lib/cfdi";

const VALID_MOTIVOS = new Set(["01", "02", "03", "04"]);

export async function POST(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = (await req.json()) as { cfdi_id?: string; motivo?: string };
  const motivo = body.motivo ?? "02";
  if (!VALID_MOTIVOS.has(motivo)) {
    return NextResponse.json({ error: "Motivo SAT inválido (01-04)." }, { status: 400 });
  }
  if (!body.cfdi_id) return NextResponse.json({ error: "cfdi_id requerido." }, { status: 400 });

  const sb = supabaseAdmin();
  const { data: cfdi } = await sb
    .from("cfdis")
    .select("id, uuid_fiscal, status")
    .eq("id", body.cfdi_id)
    .maybeSingle();

  if (!cfdi || !cfdi.uuid_fiscal) return NextResponse.json({ error: "CFDI no timbrado." }, { status: 404 });
  if (cfdi.status === "cancelado") return NextResponse.json({ error: "Ya cancelado." }, { status: 400 });

  try {
    await swCancelCfdi(cfdi.uuid_fiscal, motivo);
    await sb.from("cfdis").update({ status: "cancelado" }).eq("id", cfdi.id);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
