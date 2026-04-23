import { NextResponse } from "next/server"

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://certifik-pld.vercel.app"

const PRICES = {
  individual: { 
    amount: 299900, 
    name: "Certifik PLD — Premium Individual", 
    description: "Acceso completo 12 meses · Examen 2026 (IVA Incluido)" 
  },
  b2b: { 
    amount: 499500, 
    name: "Certifik PLD — Licencia Corporativa B2B", 
    description: "5 usuarios premium · Acceso 12 meses (IVA Incluido)" 
  },
}

export async function POST(req: Request) {
  if (!STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe no configurado. Contacta al administrador." }, { status: 503 })
  }

  const body = await req.json().catch(() => ({}))
  
  // Aceptamos 'plan' o 'type' para mantener compatibilidad con el frontend
  const plan = (body.plan ?? body.type ?? "individual") as "individual" | "b2b"
  const price = PRICES[plan] ?? PRICES.individual
  const invites: string[] = body.invites ?? []

  try {
    const stripe = await import("stripe").then((m) => new m.default(STRIPE_SECRET_KEY!, { apiVersion: "2025-01-27.acacia" as never }))

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: price.name,
              description: price.description,
            },
            unit_amount: price.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${BASE_URL}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      // Redirige de vuelta al onboarding específico si el usuario cancela en Stripe
      cancel_url: `${BASE_URL}/onboarding/${plan === 'b2b' ? 'corporativo' : 'individual'}`,
      metadata: {
        plan,
        invites: JSON.stringify(invites),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al crear sesión de pago"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}