// Thin Stripe helper using the REST API via fetch (no SDK dependency added).
// Configure via STRIPE_SECRET_KEY env var. Prices are dynamic so the backend
// sends unit_amount per request rather than using pre-created price IDs.

const STRIPE_API = "https://api.stripe.com/v1";

function requireKey() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY no configurada.");
  }
  return key;
}

function encodeForm(obj: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    params.append(k, String(v));
  }
  return params.toString();
}

export type CheckoutInput = {
  unit_amount_cents: number;
  currency?: string;
  quantity?: number;
  product_name: string;
  customer_email?: string;
  success_url: string;
  cancel_url: string;
  metadata?: Record<string, string>;
};

export async function createCheckoutSession(input: CheckoutInput) {
  const key = requireKey();

  const body: Record<string, string | number | undefined> = {
    mode: "payment",
    success_url: input.success_url,
    cancel_url: input.cancel_url,
    "line_items[0][quantity]": input.quantity ?? 1,
    "line_items[0][price_data][currency]": input.currency ?? "mxn",
    "line_items[0][price_data][unit_amount]": input.unit_amount_cents,
    "line_items[0][price_data][product_data][name]": input.product_name,
    customer_email: input.customer_email,
  };

  if (input.metadata) {
    for (const [k, v] of Object.entries(input.metadata)) {
      body[`metadata[${k}]`] = v;
    }
  }

  const res = await fetch(`${STRIPE_API}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: encodeForm(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Stripe API error: ${res.status} ${text}`);
  }

  return (await res.json()) as { id: string; url: string };
}

export async function retrieveCheckoutSession(sessionId: string) {
  const key = requireKey();
  const res = await fetch(`${STRIPE_API}/checkout/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Stripe API error: ${res.status} ${text}`);
  }
  return (await res.json()) as {
    id: string;
    payment_status: string;
    amount_total: number;
    customer_email: string | null;
    metadata: Record<string, string>;
  };
}
