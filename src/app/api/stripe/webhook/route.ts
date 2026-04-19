import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe, getStripeWebhookSecret } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function updateSubscription(
  userId: string,
  status: string,
  subscriptionId?: string,
  priceId?: string
) {
  const sb = supabaseAdmin();
  await sb
    .from("user_profiles")
    .update({
      subscription_status: status,
      ...(subscriptionId ? { subscription_id: subscriptionId } : {}),
      ...(priceId ? { price_id: priceId } : {}),
    })
    .eq("user_id", userId);
}

async function getUserIdFromCustomer(customerId: string): Promise<string | null> {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("user_profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single();
  return data?.user_id ?? null;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, signature, getStripeWebhookSecret());
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Webhook signature verification failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const customerId =
        typeof pi.customer === "string" ? pi.customer : pi.customer?.id;
      if (!customerId) break;

      const userId = await getUserIdFromCustomer(customerId);
      if (!userId) break;

      const sb = supabaseAdmin();
      await sb
        .from("user_profiles")
        .update({ payment_intent_id: pi.id })
        .eq("user_id", userId);
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      const userId = await getUserIdFromCustomer(customerId);
      if (!userId) break;

      const status =
        sub.status === "active"
          ? "active"
          : sub.status === "past_due"
          ? "past_due"
          : sub.status === "canceled"
          ? "cancelled"
          : "free";

      const priceId = sub.items.data[0]?.price?.id;
      await updateSubscription(userId, status, sub.id, priceId);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      const userId = await getUserIdFromCustomer(customerId);
      if (!userId) break;
      await updateSubscription(userId, "cancelled", sub.id);
      break;
    }

    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId =
        session.metadata?.supabase_user_id ??
        (typeof session.customer === "string"
          ? await getUserIdFromCustomer(session.customer)
          : null);
      if (!userId) break;

      if (session.mode === "subscription" && session.subscription) {
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;
        await updateSubscription(userId, "active", subId);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
