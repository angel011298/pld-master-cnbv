import { supabaseAdmin } from "@/lib/supabase";

export type PricingPhase = "launch" | "standard" | "post_testimonials" | "post_exam";

export type ActivePricing = {
  phase: PricingPhase;
  price_cents: number;
  label: string | null;
  valid_until: string | null;
};

export async function getActivePricing(): Promise<ActivePricing | null> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("pricing_config")
    .select("phase, price_cents, label, valid_until")
    .eq("active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    phase: data.phase as PricingPhase,
    price_cents: data.price_cents,
    label: data.label ?? null,
    valid_until: data.valid_until ?? null,
  };
}

export async function setActivePricing(phase: PricingPhase) {
  const sb = supabaseAdmin();
  await sb.from("pricing_config").update({ active: false }).neq("phase", phase);
  await sb
    .from("pricing_config")
    .update({ active: true, updated_at: new Date().toISOString() })
    .eq("phase", phase);
}
