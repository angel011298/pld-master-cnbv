import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId, sanitizeText } from "@/lib/security";
import { loadSwConfig, swStampCfdi } from "@/lib/cfdi";

const IVA_RATE = 0.16;

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const body = (await req.json()) as {
      purchase_id?: string;
      receptor_rfc?: string;
      receptor_nombre?: string;
      receptor_regimen_fiscal?: string;
      receptor_uso_cfdi?: string;
    };

    const rfc = (body.receptor_rfc ?? "").toUpperCase().replace(/\s/g, "").slice(0, 13);
    const nombre = sanitizeText(body.receptor_nombre ?? "", 300);
    const regimen = (body.receptor_regimen_fiscal ?? "").trim().slice(0, 5);
    const uso = (body.receptor_uso_cfdi ?? "").trim().slice(0, 5) || "G03";

    if (!body.purchase_id || !rfc || !nombre || !regimen) {
      return NextResponse.json(
        { error: "purchase_id, receptor_rfc, receptor_nombre y receptor_regimen_fiscal son obligatorios." },
        { status: 400 }
      );
    }

    const sb = supabaseAdmin();
    const { data: purchase, error: pErr } = await sb
      .from("purchases")
      .select("id, user_id, organization_id, amount_cents, status, cfdi_emitido")
      .eq("id", body.purchase_id)
      .maybeSingle();

    if (pErr || !purchase) return NextResponse.json({ error: "Compra no encontrada." }, { status: 404 });
    if (purchase.status !== "completed") {
      return NextResponse.json({ error: "La compra no está completada." }, { status: 400 });
    }
    if (purchase.cfdi_emitido) {
      return NextResponse.json({ error: "Ya existe un CFDI para esta compra." }, { status: 400 });
    }

    const total = purchase.amount_cents / 100;
    const subtotal = +(total / (1 + IVA_RATE)).toFixed(2);
    const iva = +(total - subtotal).toFixed(2);

    const cfg = loadSwConfig();

    const { data: cfdiRow, error: insErr } = await sb
      .from("cfdis")
      .insert({
        purchase_id: purchase.id,
        user_id: purchase.user_id ?? userId,
        organization_id: purchase.organization_id,
        emisor_rfc: cfg.rfcEmisor,
        emisor_nombre: cfg.nombreEmisor,
        emisor_regimen_fiscal: cfg.regimenEmisor,
        receptor_rfc: rfc,
        receptor_nombre: nombre,
        receptor_regimen_fiscal: regimen,
        receptor_uso_cfdi: uso,
        subtotal,
        iva,
        total,
        status: "pendiente",
      })
      .select("id")
      .single();

    if (insErr || !cfdiRow) {
      return NextResponse.json({ error: insErr?.message ?? "No se pudo crear registro CFDI." }, { status: 500 });
    }

    try {
      const stamp = await swStampCfdi({
        receptor: { rfc, nombre, regimenFiscal: regimen, usoCFDI: uso },
        subtotal,
        iva,
        total,
        descripcion: "Acceso a plataforma Certifik PLD — Preparación Certificación CNBV PLD/FT",
      });

      await sb
        .from("cfdis")
        .update({
          uuid_fiscal: stamp.uuid,
          fecha_timbrado: stamp.fechaTimbrado,
          xml_cfdi: stamp.xml,
          status: "timbrado",
        })
        .eq("id", cfdiRow.id);

      await sb
        .from("purchases")
        .update({ cfdi_emitido: true, cfdi_uuid: stamp.uuid })
        .eq("id", purchase.id);

      return NextResponse.json({ id: cfdiRow.id, uuid: stamp.uuid });
    } catch (stampErr: unknown) {
      const message = stampErr instanceof Error ? stampErr.message : "Error SW";
      await sb
        .from("cfdis")
        .update({ status: "error", error_message: message })
        .eq("id", cfdiRow.id);
      return NextResponse.json({ error: message, cfdi_id: cfdiRow.id }, { status: 502 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
