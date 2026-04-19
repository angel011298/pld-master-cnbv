import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { requireSuperAdmin } from "@/lib/admin";
import { setActivePricing, type PricingPhase } from "@/lib/pricing";
import { supabaseAdmin } from "@/lib/supabase";

const VALID_PHASES: PricingPhase[] = ["launch", "standard", "post_testimonials", "post_exam"];

export async function GET(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("pricing_config")
    .select("phase, price_cents, active, label, valid_until, updated_at")
    .order("price_cents", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pricing: data });
}

export async function POST(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = (await req.json()) as { phase?: string };
  const phase = body.phase as PricingPhase;
  if (!VALID_PHASES.includes(phase)) {
    return NextResponse.json({ error: "Fase inválida." }, { status: 400 });
  }

  await setActivePricing(phase);
  return NextResponse.json({ ok: true, phase });
}
