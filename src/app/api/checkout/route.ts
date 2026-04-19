import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const {
    purchase_type = "individual",
    seats = 1,
    exam_cycle = "jun_2026",
  } = body;

  // Obtener precio vigente
  const pricingRes = await supabase
    .from("certifik_pricing_config")
    .select("price_cents")
    .eq("active", true)
    .single();
  const price_cents = pricingRes.data?.price_cents ?? 199900;
  const total_cents =
    purchase_type === "b2b" ? price_cents * seats : price_cents;

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://certifik-pld.vercel.app";

  const checkoutSession = await stripe().checkout.sessions.create({
    customer_email: session.user.email ?? undefined,
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "mxn",
          product_data: {
            name:
              purchase_type === "b2b"
                ? `Certifik PLD – Licencia Corporativa (${seats} asientos)`
                : "Certifik PLD – Acceso Individual",
          },
          unit_amount:
            purchase_type === "b2b" ? price_cents : total_cents,
        },
        quantity: purchase_type === "b2b" ? seats : 1,
      },
    ],
    mode: "payment",
    success_url: `${appUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/`,
    metadata: {
      user_id: session.user.id,
      purchase_type,
      exam_cycle,
      seats: seats.toString(),
    },
  });

  // Registrar purchase como pending
  const { error: dbError } = await supabase
    .from("certifik_purchases")
    .insert({
      user_id: session.user.id,
      stripe_session_id: checkoutSession.id,
      purchase_type,
      amount_cents: total_cents,
      seats,
      exam_cycle,
      status: "pending",
    });

  if (dbError) {
    console.error("DB error:", dbError);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json({
    sessionId: checkoutSession.id,
    url: checkoutSession.url,
  });
}
