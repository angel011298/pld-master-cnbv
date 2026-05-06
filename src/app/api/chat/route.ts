import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { generateEmbedding, flashModel } from "@/lib/gemini";
import { applyRateLimit } from "@/lib/rate-limit";
import { getAuthenticatedUserId, getClientIp, validateMessagesPayload } from "@/lib/security";
import type { ChatSource, ChatResponse } from "@/types/chat";

const GLOBAL_ADMIN_USER_ID = "00000000-0000-0000-0000-000000000000";

interface RawChunk {
  id: number;
  document_id: string;
  content: string;
  metadata: Record<string, unknown> | null;
  similarity: number;
}

function parseSources(rawText: string): { text: string; sources: ChatSource[] } {
  const match = rawText.match(/<SOURCES>([\s\S]*?)<\/SOURCES>/);
  const text = rawText.replace(/<SOURCES>[\s\S]*?<\/SOURCES>/g, "").trim();

  if (!match) return { text, sources: [] };

  try {
    const parsed = JSON.parse(match[1].trim()) as ChatSource[];
    return { text, sources: Array.isArray(parsed) ? parsed : [] };
  } catch {
    return { text, sources: [] };
  }
}

function truncateWords(str: string, maxWords: number): string {
  const words = str.trim().split(/\s+/);
  return words.length <= maxWords ? str.trim() : words.slice(0, maxWords).join(" ") + "…";
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Debes iniciar sesión con Google." },
        { status: 401 }
      );
    }

    const rate = applyRateLimit({
      key: `${userId}:${ip}`,
      route: "chat",
      limit: 30,
      windowMs: 24 * 60 * 60 * 1000,
    });

    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Límite diario alcanzado (30 interacciones). Intenta mañana." },
        { status: 429 }
      );
    }

    const sb = supabaseAdmin();
    const payload = await req.json();
    const parsed = validateMessagesPayload(payload);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const messages = parsed.data;
    const lastMessage = messages[messages.length - 1].content;

    // 1. RAG – embed user query and retrieve relevant chunks
    const embedding = await generateEmbedding(lastMessage);
    const { data: contextChunks } = await sb.rpc("match_document_embeddings", {
      p_user_id: GLOBAL_ADMIN_USER_ID,
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 5,
    });

    const chunks: RawChunk[] = contextChunks ?? [];

    // Build context with source metadata for Gemini
    const contextLines = chunks.map((chunk, idx) => {
      const meta = chunk.metadata ?? {};
      const source = (meta.source as string) ?? "Documento oficial";
      const fragmentPreview = truncateWords(chunk.content, 15);
      return `[Fuente ${idx + 1}: ${source}]\n${chunk.content}\nFragmento: "${fragmentPreview}"`;
    });
    const contextText = contextLines.join("\n\n---\n\n");

    // Prepare sources reference list for Gemini to cite from
    const sourcesRef = chunks.map((chunk, idx) => ({
      index: idx + 1,
      documento: (chunk.metadata?.source as string) ?? "Documento oficial",
      fragmento: truncateWords(chunk.content, 15),
    }));

    // 2. System prompt – instruct Gemini to cite sources
    const systemPrompt = `
Eres el "Tutor PLD-Master", un asistente IA experto en Prevención de Lavado de Dinero y Financiamiento al Terrorismo para la certificación CNBV de México.

Tu ÚNICA fuente de verdad es el siguiente contexto oficial extraído de LFPIORPI y disposiciones CNBV:

CONTEXTO OFICIAL:
${contextText || "No hay resultados relevantes en los documentos globales."}

INSTRUCCIONES:
- Sé directo, profesional y altamente técnico. Evita rodeos innecesarios.
- Si el usuario comete un error conceptual, corrígelo basándote en la normativa.
- Incluye citas del contexto cuando aplique.
- Nunca digas solo "no sé"; explica lo más probable y qué faltaría confirmar.

FUENTES DISPONIBLES PARA CITAR:
${JSON.stringify(sourcesRef, null, 2)}

AL FINAL DE TU RESPUESTA, AGREGA OBLIGATORIAMENTE UN BLOQUE CON EXACTAMENTE ESTE FORMATO:
<SOURCES>
[
  { "documento": "nombre exacto del documento", "pagina": null, "fragmento": "primeras 15 palabras del fragmento usado" }
]
</SOURCES>

Solo incluye las fuentes que REALMENTE usaste en tu respuesta. Si no usaste ningún fragmento, incluye un array vacío: <SOURCES>[]</SOURCES>
El campo "pagina" debe ser null si no tienes información de página específica.
`;

    // 3. Call Gemini (non-streaming to parse the full response)
    const chat = flashModel().startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        {
          role: "model",
          parts: [{ text: "Entendido. Soy tu Tutor PLD-Master. Al final de cada respuesta incluiré el bloque <SOURCES> con los fragmentos utilizados. ¿En qué puedo ayudarte hoy?" }],
        },
        ...messages.slice(0, -1).map((m: { role: string; content: string }) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        })),
      ],
    });

    const result = await chat.sendMessage(lastMessage);
    const rawText = result.response.text();
    const { text, sources } = parseSources(rawText);

    const response: ChatResponse = { text, sources };
    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Chat error:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
