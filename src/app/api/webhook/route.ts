import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// 1. Placeholder para Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16' as any,
});

// 2. Placeholders para Supabase (Esto soluciona el error actual)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key'; 
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder' // También protegido
    );
  } catch (error: any) {
    console.error('Error de firma de webhook:', error.message);
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;

    if (userId) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          subscription_tier: 'premium',
          stripe_customer_id: session.customer as string 
        })
        .eq('user_id', userId);

      const { error: purchaseError } = await supabase
        .from('purchases')
        .update({ status: 'completed' })
        .eq('stripe_session_id', session.id);

      if (profileError || purchaseError) {
        console.error('Error Supabase Webhook:', profileError, purchaseError);
        return NextResponse.json({ error: 'Fallo al actualizar BD' }, { status: 500 });
      }
      
      console.log(`¡Éxito! Usuario ${userId} es ahora Premium.`);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}