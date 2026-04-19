import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getAuthenticatedUserId } from "@/lib/security";
import { createCheckoutSession } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { sanitizeText } from "@/lib/security";
import { computeCycleExpiry } from "@/lib/access";

const B2B_PRICE_CENTS = 99900; // $999 MXN per seat

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const body = (await req.json()) as {
      organization_name?: string;
      rfc?: string;
      razon_social?: string;
      regimen_fiscal?: string;
      email_contacto?: string;
      telefono?: string;
      seats?: number;
      exam_cycle?: string;
    };

    const name = sanitizeText(body.organization_name ?? "", 200);
    if (!name) return NextResponse.json({ error: "Nombre de organización requerido." }, { status: 400 });

    const seats = Math.min(Math.max(Math.floor(Number(body.seats) || 5), 5), 200);
    const amount_cents = seats * B2B_PRICE_CENTS;
    const exam_cycle = body.exam_cycle === "oct_2026" ? "oct_2026" : "jun_2026";

    const sb = supabaseAdmin();

    const { data: org, error: orgErr } = await sb
      .from("organizations")
      .insert({
        name,
        rfc: sanitizeText(body.rfc ?? "", 20) || null,
        razon_social: sanitizeText(body.razon_social ?? "", 300) || null,
        regimen_fiscal: sanitizeText(body.regimen_fiscal ?? "", 10) || null,
        email_contacto: sanitizeText(body.email_contacto ?? "", 200) || null,
        telefono: sanitizeText(body.telefono ?? "", 30) || null,
        max_seats: seats,
        used_seats: 0,
        admin_user_id: userId,
        access_level: "b2b_active",
        access_expires_at: computeCycleExpiry(exam_cycle),
      })
      .select("id")
      .single();

    if (orgErr || !org) {
      return NextResponse.json({ error: orgErr?.message ?? "No se pudo crear la organización." }, { status: 500 });
    }

    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://certifik.mx";

    const session = await createCheckoutSession({
      unit_amount_cents: B2B_PRICE_CENTS,
      quantity: seats,
      product_name: `Certifik PLD — Licencia Corporativa (${seats} asientos)`,
      customer_email: sanitizeText(body.email_contacto ?? "", 200) || undefined,
      success_url: `${origin}/b2b/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/b2b?checkout=cancel`,
      metadata: {
        purchase_type: "b2b",
        user_id: userId,
        organization_id: org.id,
        exam_cycle,
        seats: String(seats),
      },
    });

    await sb.from("purchases").insert({
      user_id: userId,
      organization_id: org.id,
      stripe_session_id: session.id,
      purchase_type: "b2b",
      amount_cents,
      seats,
      status: "pending",
      exam_cycle,
    });

    return NextResponse.json({ url: session.url, organization_id: org.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
