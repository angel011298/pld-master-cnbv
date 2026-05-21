import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import Stripe from "stripe";
import { getAuthenticatedUserId } from "@/lib/security";
import { supabaseAdmin } from "@/lib/supabase";
import {
  activePriceCents,
  PLAN_LABELS,
  PLAN_DESCRIPTIONS,
  type PlanKey,
} from "@/lib/pricing";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://certifik-pld.app";

export async function POST(req: NextRequest) {
  if (!STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe no configurado." },
      { status: 503 }
    );
  }

  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json(
      { error: "Debes iniciar sesión." },
      { status: 401 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as { plan?: string };
  const plan: PlanKey =
    body.plan === "convocatoria" ? "convocatoria" : "anual";

  const stripe = new Stripe(STRIPE_SECRET_KEY);
  const sb = supabaseAdmin();

  // Look up or create Stripe customer
  const { data: profile } = await sb
    .from("user_profiles")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .single();

  let customerId = profile?.stripe_customer_id as string | null;

  if (!customerId) {
    const { data: authUser } = await sb.auth.admin.getUserById(userId);
    const customer = await stripe.customers.create({
      email: authUser?.user?.email ?? undefined,
      metadata: { user_id: userId },
    });
    customerId = customer.id;

    await sb
      .from("user_profiles")
      .update({ stripe_customer_id: customerId })
      .eq("user_id", userId);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
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
      user_id: userId,
      plan: "premium_individual",
      plan_key: plan,
    },
  });

  return NextResponse.json({ url: session.url });
}
