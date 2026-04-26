import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/lib/supabase';

// Inicialización de SDKs (Asegúrate de tener estas variables en tu .env.local)
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Agregamos 'type' para distinguir entre copy y segmentación (puedes mandarlo desde el frontend)
    const { prompt, model, type = 'copy' } = body; 

    let generatedText = "";
    let estimatedCost = 2.50; // Costo base por defecto en MXN

    // Contexto del sistema para guiar a las IAs
    const systemPrompt = type === 'copy'
      ? "Eres un experto copywriter de marketing especializado en el sector financiero y PLD/FT (Prevención de Lavado de Dinero). Genera un copy atractivo, profesional y persuasivo basado en la siguiente solicitud. Ve directo al grano, sin saludos."
      : "Eres un experto en growth marketing y segmentación B2B en el sector financiero. Sugiere la segmentación ideal (cargos, intereses, demografía) para la siguiente campaña de forma estructurada con viñetas.";

    const fullPrompt = `Solicitud del usuario: ${prompt}`;

    // 1. Router del LLM
    if (model === "Gemini 1.5 Pro") {
      const genModel = gemini.getGenerativeModel({ model: "gemini-1.5-pro" });
      // Gemini maneja el system prompt combinándolo o en config, aquí lo combinamos directo por simplicidad
      const result = await genModel.generateContent(`${systemPrompt}\n\n${fullPrompt}`);
      generatedText = result.response.text();
      estimatedCost = 1.80; // Costo estimado de ejemplo
      
    } else if (model === "Claude 3.5 Sonnet") {
      const msg = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: fullPrompt }],
      });
      // @ts-ignore - Verificamos que el bloque sea de texto
      generatedText = msg.content[0].type === 'text' ? msg.content[0].text : '';
      estimatedCost = 3.20;

    } else if (model === "GPT-4o") {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: fullPrompt }
        ],
      });
      generatedText = completion.choices[0].message?.content || "";
      estimatedCost = 2.90;
      
    } else {
      throw new Error("Modelo no soportado");
    }

    // 2. Insertar Gasto (Egreso) automático por el costo de API
    // Usamos el cliente de supabase que ya tienes configurado
    const sb = typeof supabase === 'function' ? supabase() : supabase;
    
    const { error: dbError } = await sb.from('finance_transactions').insert([{
      date: new Date().toISOString().split('T')[0],
      concept: `Costo API - Generación de Campaña con ${model}`,
      category: "APIs de IA",
      type: "Egreso",
      amount: estimatedCost 
    }]);

    if (dbError) {
      console.error("Error al registrar gasto en Supabase:", dbError);
      // No lanzamos error para no interrumpir la respuesta al cliente, 
      // pero se queda registrado en los logs del servidor.
    }

    return NextResponse.json({ success: true, result: generatedText });

  } catch (error: any) {
    console.error("Error en API de Marketing:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error interno en motor IA" }, 
      { status: 500 }
    );
  }
}