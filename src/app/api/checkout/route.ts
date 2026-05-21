import { NextResponse } from "next/server";
import {
  activePriceCents,
  PLAN_LABELS,
  PLAN_DESCRIPTIONS,
  type PlanKey,
} from "@/lib/pricing";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://certifik-pld.app";

export async function POST(req: Request) {
  if (!STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe no configurado. Contacta al administrador." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({}));

  // Accept 'plan' or 'type'; default to 'anual'
  const raw = (body.plan ?? body.type ?? "anual") as string;
  const plan: PlanKey = raw === "convocatoria" ? "convocatoria" : "anual";

  try {
    const stripe = await import("stripe").then(
      (m) => new m.default(STRIPE_SECRET_KEY!, { apiVersion: "2025-01-27.acacia" as never })
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: `Certifik PLD — ${PLAN_LABELS[plan]}`,
              description: PLAN_DESCRIPTIONS[plan],
            },
            unit_amount: activePriceCents(plan),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${BASE_URL}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/register/individual`,
      metadata: {
        plan: "premium_individual",
        plan_key: plan,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al crear sesión de pago";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
