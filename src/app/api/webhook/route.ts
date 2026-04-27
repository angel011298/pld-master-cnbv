// src/app/api/webhook/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: Request) {
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 })
  }

  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  let event: any; 

  try {
    const stripe = await import("stripe").then((m) => new m.default(STRIPE_SECRET_KEY!, {
      // Ignoramos el chequeo estricto de tipos en la versión para evitar errores de TS
      apiVersion: "2026-03-25.dahlia" as any,
    }));

    // Se asigna el event de forma directa sin el "as typeof event" problemático
    event = stripe.webhooks.constructEvent(body, sig!, STRIPE_WEBHOOK_SECRET!);
    
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Webhook signature verification failed"
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      customer_email?: string
      metadata?: { plan?: string; invites?: string }
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const email = session.customer_email
    const plan = session.metadata?.plan ?? "individual"
    const invites: string[] = JSON.parse(session.metadata?.invites ?? "[]")

    if (email) {
      // 1. Buscamos al usuario en la lista global de Auth
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error("Error al obtener la lista de usuarios:", authError);
      } else {
        const targetUser = authData?.users.find((u: any) => u.email === email);

        // 2. Si existe, actualizamos su perfil
        if (targetUser) {
          const { error: updateError } = await supabase
            .from("user_profiles")
            .update({ 
              is_premium: true,
              plan_type: plan // Asignación dinámica basada en el metadata en lugar de hardcodear 'individual'
            })
            .eq("id", targetUser.id);

          if (updateError) {
            console.error("Error al actualizar perfil a premium:", updateError);
          } else {
            console.log(`Perfil de ${email} actualizado a premium exitosamente.`);
          }
        } else {
          console.warn(`Usuario con email ${email} no encontrado en la base de datos de Auth.`);
        }
      }
    }

    // For B2B: send invite emails (placeholder — integrate with email provider)
    if (plan === "b2b" && invites.length > 0) {
      console.log("[Webhook] B2B invites to send:", invites)
      // TODO: send invite emails via Resend/SendGrid
    }
  }

  return NextResponse.json({ received: true })
}