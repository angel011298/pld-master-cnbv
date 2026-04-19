import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { retrieveCheckoutSession } from "@/lib/stripe";
import { computeCycleExpiry } from "@/lib/access";
import { emailTemplates, sendEmail } from "@/lib/email";

// Minimal webhook handler. Production deployments should verify the signature
// using STRIPE_WEBHOOK_SECRET; here we re-fetch the session from Stripe as a
// tamper-resistant fallback.
export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as {
      type?: string;
      data?: { object?: { id?: string } };
    };

    if (payload.type !== "checkout.session.completed") {
      return NextResponse.json({ received: true });
    }

    const sessionId = payload.data?.object?.id;
    if (!sessionId) return NextResponse.json({ error: "session id missing" }, { status: 400 });

    const session = await retrieveCheckoutSession(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true, ignored: "not paid" });
    }

    const sb = supabaseAdmin();
    const metadata = session.metadata ?? {};
    const purchase_type = metadata.purchase_type ?? "individual";
    const user_id = metadata.user_id ?? null;
    const organization_id = metadata.organization_id ?? null;
    const exam_cycle = metadata.exam_cycle ?? "jun_2026";
    const expiresAt = computeCycleExpiry(exam_cycle);

    await sb
      .from("purchases")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("stripe_session_id", sessionId);

    if (purchase_type === "individual" && user_id) {
      await sb
        .from("user_profiles")
        .upsert(
          {
            user_id,
            access_level: "premium",
            access_expires_at: expiresAt,
            exam_cycle,
          },
          { onConflict: "user_id" }
        );

      try {
        if (session.customer_email) {
          const tpl = emailTemplates.welcome(metadata.full_name ?? "");
          await sendEmail({ to: session.customer_email, subject: tpl.subject, html: tpl.html });
          await sb.from("email_notifications").insert({
            user_id,
            email: session.customer_email,
            kind: "welcome",
            status: "sent",
            sent_at: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.error("welcome email failed", e);
      }
    }

    if (purchase_type === "b2b" && organization_id) {
      await sb
        .from("organizations")
        .update({
          access_level: "b2b_active",
          access_expires_at: expiresAt,
        })
        .eq("id", organization_id);

      if (user_id) {
        await sb
          .from("user_profiles")
          .upsert(
            {
              user_id,
              access_level: "b2b_active",
              organization_id,
              access_expires_at: expiresAt,
              exam_cycle,
            },
            { onConflict: "user_id" }
          );
      }
    }

    return NextResponse.json({ received: true, ok: true });
  } catch (error: unknown) {
    console.error("stripe webhook error", error);
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
