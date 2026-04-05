import { NextRequest } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { generateEmbedding, flashModel } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content;

    // 1. RAG Search
    const embedding = await generateEmbedding(lastMessage);
    const { data: contextChunks } = await supabaseAdmin.rpc(
      "match_document_embeddings",
      {
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
      
      Utiliza el siguiente contexto oficial si es relevante para responder:
      ${contextText || "No hay resultados relevantes en los documentos de estudio."}
      
      INSTRUCCIONES:
      - Sé directo, profesional y didáctico.
      - Si el usuario comete un error conceptual, explícaselo amablemente.
      - Si la respuesta no está en el contexto, usa tu conocimiento general especificado como tal.
    `;

    // 3. Simple Streaming implementation using the Gemini SDK 
    // note: standard Next.js streaming requires some careful iteration
    const chat = flashModel.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Entendido. Soy tu Tutor PLD-Master. ¿En qué puedo ayudarte hoy?" }] },
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
