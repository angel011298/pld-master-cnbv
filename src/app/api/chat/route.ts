import { NextRequest } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { generateEmbedding, flashModel } from "@/lib/gemini";
import { applyRateLimit } from "@/lib/rate-limit";
import { getAuthenticatedUserId, getClientIp, validateMessagesPayload } from "@/lib/security";

// ID correspondiente al Superadmin/Sistema para forzar la consulta de la Guía PLD/FT_CNBV global
const GLOBAL_ADMIN_USER_ID = "00000000-0000-0000-0000-000000000000";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return new Response(JSON.stringify({ error: "Debes iniciar sesión con Google." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const rate = applyRateLimit({
      key: `${userId ?? "anon"}:${ip}`,
      route: "chat",
      limit: 30,
      windowMs: 24 * 60 * 60 * 1000,
    });

    if (!rate.allowed) {
      return new Response(
        JSON.stringify({ error: "Límite diario alcanzado (30 interacciones). Intenta mañana." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    const sb = supabaseAdmin();
    const payload = await req.json();
    const parsed = validateMessagesPayload(payload);
    if (!parsed.ok) {
      return new Response(JSON.stringify({ error: parsed.error }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const messages = parsed.data;
    const lastMessage = messages[messages.length - 1].content;

    // 1. RAG Search - FORZADO AL CONTEXTO GLOBAL (Guía CNBV)
    const embedding = await generateEmbedding(lastMessage);
    const { data: contextChunks } = await sb.rpc(
      "match_document_embeddings",
      {
        p_user_id: GLOBAL_ADMIN_USER_ID, // Modificado: Consulta exclusiva de documentos oficiales administrados
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 5,
      }
    );

    const contextText = contextChunks
      ?.map((chunk: { content: string }) => chunk.content)
      .join("\n\n---\n\n");

    // 2. Prepare Chat with Context
    const systemPrompt = `
      Eres el "Tutor PLD-Master", un asistente IA experto en Prevención de Lavado de Dinero y Financiamiento al Terrorismo.
      Tu objetivo es ayudar al usuario a entender conceptos complejos, resolver dudas y prepararse para el examen de la CNBV.
      
      Tu ÚNICA fuente de verdad primordial es el siguiente contexto oficial extraído de la "Guía PLD/FT_CNBV" y leyes vigentes.
      NO inventes información. Si algo no está en el contexto, básate estrictamente en el marco regulatorio oficial aplicable:
      
      CONTEXTO OFICIAL:
      ${contextText || "No hay resultados relevantes en los documentos de estudio globales."}
      
      INSTRUCCIONES:
      - Sé directo, profesional y altamente técnico. Evita rodeos innecesarios.
      - Si el usuario comete un error conceptual, explícaselo amablemente basándote en la normativa.
      - Incluye citas textuales del contexto (Ej. "De acuerdo a la Guía PLD/FT_CNBV..." o "Según las Disposiciones...") cuando existan.
      - Si el contexto no alcanza, consulta información pública oficial confiable y entrega una respuesta aproximada con enlaces.
      - Nunca digas solo "no sé"; explica lo más probable y qué faltaría confirmar legalmente.
    `;

    // 3. Simple Streaming implementation using the Gemini SDK
    const chat = flashModel().startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Entendido. Soy tu Tutor PLD-Master, sustentado en la Guía oficial de la CNBV. ¿En qué puedo darte soporte técnico hoy?" }] },
        ...messages.slice(0, -1).map((m: { role: string; content: string }) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }]
        }))
      ]
    });

    const result = await chat.sendMessageStream(lastMessage);

    // Create a readable stream to pipe to the client
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          controller.enqueue(new TextEncoder().encode(chunkText));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });

  } catch (error: unknown) {
    console.error("Chat error:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}