import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import Stripe from "stripe";
import { getAuthenticatedUserId } from "@/lib/security";
import { supabaseAdmin } from "@/lib/supabase";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://certifik-pld.app";

const PRICE_MAP: Record<string, { priceId: string; plan: string }> = {
  individual: {
    priceId: process.env.STRIPE_PRICE_PREMIUM!,
    plan: "premium_individual",
  },
  corporativo: {
    priceId: process.env.STRIPE_PRICE_CORPORATIVO!,
    plan: "corporativo",
  },
};

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

  const body = (await req.json().catch(() => ({}))) as {
    plan?: string;
  };
  const planKey = body.plan === "corporativo" ? "corporativo" : "individual";
  const config = PRICE_MAP[planKey];

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
    line_items: [{ price: config.priceId, quantity: 1 }],
    mode: "payment",
    success_url: `${BASE_URL}/welcome?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BASE_URL}/register/${planKey}`,
    metadata: {
      user_id: userId,
      plan: config.plan,
    },
  });

  return NextResponse.json({ url: session.url });
}
