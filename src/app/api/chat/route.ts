import { NextRequest } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { generateEmbedding, flashModel } from "@/lib/gemini";
import { applyRateLimit } from "@/lib/rate-limit";
import { getAuthenticatedUserId, getClientIp, validateMessagesPayload } from "@/lib/security";

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

    // 1. RAG Search
    const embedding = await generateEmbedding(lastMessage);
    const { data: contextChunks } = await sb.rpc(
      "match_document_embeddings",
      {
        p_user_id: userId,
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
      Eres el "Tutor Certifik PLD", un asistente IA experto en Prevención de Lavado de Dinero y Financiamiento al Terrorismo.
      Tu objetivo es ayudar al usuario a entender conceptos complejos, resolver dudas y prepararse para el examen de la CNBV.
      
      Utiliza el siguiente contexto oficial si es relevante para responder:
      ${contextText || "No hay resultados relevantes en los documentos de estudio."}
      
      INSTRUCCIONES:
      - Sé directo, profesional y didáctico.
      - Si el usuario comete un error conceptual, explícaselo amablemente.
      - Incluye citas textuales del contexto cuando existan.
      - Si el contexto no alcanza, consulta información pública web confiable y entrega respuesta aproximada con enlaces de fuente.
      - Nunca digas solo "no sé"; explica lo más probable y qué faltaría confirmar.
    `;

    // 3. Simple Streaming implementation using the Gemini SDK 
    // note: standard Next.js streaming requires some careful iteration
    const chat = flashModel().startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Entendido. Soy tu Tutor Certifik PLD. ¿En qué puedo ayudarte hoy?" }] },
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
