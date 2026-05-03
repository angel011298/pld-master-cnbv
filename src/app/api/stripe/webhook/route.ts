import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe webhook no configurado." },
      { status: 503 }
    );
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 }
    );
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY);
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Webhook signature verification failed";
    console.error("Webhook sig error:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const plan = session.metadata?.plan ?? "premium_individual";
      const stripeCustomerId = session.customer as string | null;

      if (userId) {
        const { error } = await supabase
          .from("user_profiles")
          .update({
            plan,
            stripe_customer_id: stripeCustomerId,
          })
          .eq("user_id", userId);

        if (error) {
          console.error("Error updating user plan:", error);
        } else {
          console.log(
            `[Webhook] User ${userId} upgraded to ${plan}`
          );
        }
      } else {
        // Fallback: find user by customer email
        const email = session.customer_details?.email;
        if (email) {
          const { data: authData } = await supabase.auth.admin.listUsers();
          const targetUser = authData?.users.find(
            (u) => u.email === email
          );
          if (targetUser) {
            await supabase
              .from("user_profiles")
              .update({
                plan,
                stripe_customer_id: stripeCustomerId,
              })
              .eq("user_id", targetUser.id);
            console.log(
              `[Webhook] User ${targetUser.id} (${email}) upgraded to ${plan} via email fallback`
            );
          } else {
            console.warn(
              `[Webhook] No user found for email ${email}`
            );
          }
        }
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const failMessage =
        intent.last_payment_error?.message ?? "Unknown payment failure";
      console.error(
        `[Webhook] Payment failed for customer ${intent.customer}: ${failMessage}`
      );
      break;
    }

    default:
      console.log(`[Webhook] Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
