import Stripe from "stripe";

function getStripeSecretKey() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Falta STRIPE_SECRET_KEY en variables de entorno.");
  return key;
}

let _stripe: Stripe | null = null;

export function stripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(getStripeSecretKey(), { apiVersion: "2026-03-25.dahlia" });
  }
  return _stripe;
}

export function getStripeWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("Falta STRIPE_WEBHOOK_SECRET en variables de entorno.");
  return secret;
}

export const STRIPE_PRICE_ID =
  process.env.STRIPE_PRICE_ID ?? "price_placeholder";
