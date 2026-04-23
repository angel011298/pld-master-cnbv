import { NextResponse } from "next/server"

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://certifik-pld.vercel.app"

// Definición de precios en centavos (ej. 299900 = $2,999.00 MXN)
const PRICES: Record<string, { amount: number; name: string; description: string }> = {
  individual: { 
    amount: 299900, 
    name: "Certifik PLD — Premium Individual", 
    description: "Acceso completo 12 meses · Examen 2026 (IVA Incluido)" 
  },
  corporativo: { 
    amount: 999900, 
    name: "Certifik PLD — Licencia Corporativa", 
    description: "5 usuarios premium · Acceso 12 meses (IVA Incluido)" 
  },
  // Mantenemos alias 'b2b' por si el frontend antiguo aún manda ese flag
  b2b: { 
    amount: 999900, 
    name: "Certifik PLD — Licencia Corporativa", 
    description: "5 usuarios premium · Acceso 12 meses (IVA Incluido)" 
  }
}

export async function POST(req: Request) {
  if (!STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe no configurado. Contacta al administrador." }, { status: 503 })
  }

  const body = await req.json().catch(() => ({}))
  
  // Aceptamos 'plan' o 'type' para mantener compatibilidad
  const plan = (body.plan ?? body.type ?? "individual") as string
  const price = PRICES[plan] ?? PRICES.individual
  const invites: string[] = body.invites ?? []

  // Normalizamos el nombre para las redirecciones (b2b -> corporativo)
  const planForUrl = (plan === 'b2b' || plan === 'corporativo') ? 'corporativo' : 'individual'

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
      // Redirige de vuelta a la página de registro correcta si el usuario cancela
      cancel_url: `${BASE_URL}/register/${planForUrl}`,
      metadata: {
        plan: planForUrl,
        invites: JSON.stringify(invites),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al crear sesión de pago"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}