import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getClients() {
  const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-03-25.dahlia",
  });
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  return { stripeClient, supabase };
}

function examExpiry(exam_cycle: string) {
  return exam_cycle === "jun_2026"
    ? "2026-06-28T23:59:59"
    : "2026-10-25T23:59:59";
}

export async function POST(req: NextRequest) {
  const { stripeClient, supabase } = getClients();

  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripeClient.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    // Primary: checkout.session.completed — directly matches stripe_session_id
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { data: purchase } = await supabase
        .from("certifik_purchases")
        .select("*")
        .eq("stripe_session_id", session.id)
        .single();

      if (purchase) {
        const expires = examExpiry(purchase.exam_cycle ?? "jun_2026");

        await supabase
          .from("certifik_purchases")
          .update({ status: "completed", completed_at: new Date().toISOString() })
          .eq("id", purchase.id);

        if (purchase.purchase_type === "individual") {
          await supabase
            .from("certifik_users")
            .update({ access_level: "premium", access_expires_at: expires })
            .eq("id", purchase.user_id);
        } else {
          await supabase
            .from("certifik_organizations")
            .update({
              access_level: "b2b_active",
              access_expires_at: expires,
              used_seats: purchase.seats,
            })
            .eq("id", purchase.organization_id);
        }
        console.log("✅ Checkout completed for purchase:", purchase.id);
      }
      break;
    }

    // payment_intent.succeeded — also update if purchase found by payment_intent_id
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const { data: purchase } = await supabase
        .from("certifik_purchases")
        .select("*")
        .eq("stripe_payment_intent_id", paymentIntent.id)
        .single();

      if (purchase && purchase.status !== "completed") {
        const expires = examExpiry(purchase.exam_cycle ?? "jun_2026");
        await supabase
          .from("certifik_purchases")
          .update({ status: "completed", completed_at: new Date().toISOString() })
          .eq("id", purchase.id);

        if (purchase.purchase_type === "individual") {
          await supabase
            .from("certifik_users")
            .update({ access_level: "premium", access_expires_at: expires })
            .eq("id", purchase.user_id);
        }
        console.log("✅ Payment succeeded for purchase:", purchase.id);
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await supabase
        .from("certifik_purchases")
        .update({ status: "failed" })
        .eq("stripe_payment_intent_id", paymentIntent.id);
      console.log("❌ Payment failed:", paymentIntent.id);
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const { data: purchase } = await supabase
        .from("certifik_purchases")
        .select("*")
        .eq("stripe_payment_intent_id", charge.payment_intent)
        .single();

      if (purchase) {
        await supabase
          .from("certifik_purchases")
          .update({ status: "refunded" })
          .eq("id", purchase.id);

        await supabase
          .from("certifik_users")
          .update({ access_level: "free", access_expires_at: null })
          .eq("id", purchase.user_id);

        console.log("💰 Refund processed for purchase:", purchase.id);
      }
      break;
    }

    case "charge.dispute.created": {
      const dispute = event.data.object as Stripe.Dispute;
      console.log("⚖️ Dispute created:", dispute.id);
      break;
    }

    default:
      console.log("⚠️ Unhandled event type:", event.type);
  }

  return NextResponse.json({ received: true });
}
