/**
 * Certifik PLD — Pricing constants
 *
 * Single source of truth for all plan prices.
 * Uses NEXT_PUBLIC_EARLY_BIRD_ACTIVE so the flag is readable
 * in both server API routes and client components.
 *
 * Set in .env.local / Vercel:
 *   NEXT_PUBLIC_EARLY_BIRD_ACTIVE=true   → early-bird prices active
 *   NEXT_PUBLIC_EARLY_BIRD_ACTIVE=false  → standard prices active (production default)
 */

export const PRICING = {
  convocatoria: { early: 699,  standard: 1299, months: 4  },
  anual:        { early: 1099, standard: 1999, months: 12 },
} as const;

export type PlanKey = keyof typeof PRICING;

/** true when the early-bird promotion is active */
export const isEarlyBird =
  process.env.NEXT_PUBLIC_EARLY_BIRD_ACTIVE === "true";

/** Active price in MXN for a given plan */
export const activePrice = (plan: PlanKey): number =>
  isEarlyBird ? PRICING[plan].early : PRICING[plan].standard;

/** Active price in centavos for Stripe (MXN × 100) */
export const activePriceCents = (plan: PlanKey): number =>
  activePrice(plan) * 100;

/** Human-readable plan labels */
export const PLAN_LABELS: Record<PlanKey, string> = {
  convocatoria: "Plan Convocatoria",
  anual:        "Plan Anual",
};

/** Plan descriptions for Stripe product_data */
export const PLAN_DESCRIPTIONS: Record<PlanKey, string> = {
  convocatoria: `Acceso ${PRICING.convocatoria.months} meses · Examen 2026 (IVA incluido)`,
  anual:        `Acceso ${PRICING.anual.months} meses · Examen 2026 (IVA incluido)`,
};
