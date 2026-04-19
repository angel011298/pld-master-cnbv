import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getAuthenticatedUserId } from "@/lib/security";
import { getActivePricing } from "@/lib/pricing";
import { createCheckoutSession } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const body = (await req.json()) as { exam_cycle?: string };
    const exam_cycle = body.exam_cycle === "oct_2026" ? "oct_2026" : "jun_2026";

    const pricing = await getActivePricing();
    const unit_amount_cents = pricing?.price_cents ?? 199900;

    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://certifik.mx";

    const sb = supabaseAdmin();
    const { data: profile } = await sb
      .from("user_profiles")
      .select("full_name")
      .eq("user_id", userId)
      .maybeSingle();

    const { data: authUser } = await sb.auth.admin.getUserById(userId);
    const email = authUser?.user?.email ?? undefined;

    const session = await createCheckoutSession({
      unit_amount_cents,
      product_name: "Certifik PLD — Licencia Individual",
      customer_email: email,
      success_url: `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancel`,
      metadata: {
        purchase_type: "individual",
        user_id: userId,
        exam_cycle,
        full_name: profile?.full_name ?? "",
      },
    });

    await sb.from("purchases").insert({
      user_id: userId,
      stripe_session_id: session.id,
      purchase_type: "individual",
      amount_cents: unit_amount_cents,
      seats: 1,
      status: "pending",
      exam_cycle,
    });

    return NextResponse.json({ url: session.url, session_id: session.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
