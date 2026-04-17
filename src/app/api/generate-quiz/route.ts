import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { generateEmbedding, proModel } from "@/lib/gemini";
import { applyRateLimit } from "@/lib/rate-limit";
import { getAuthenticatedUserId, getClientIp, validateQuizPayload } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Debes iniciar sesión con Google." }, { status: 401 });
    }
    const rate = applyRateLimit({
      key: `${userId ?? "anon"}:${ip}`,
      route: "generate-quiz",
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
    const parsed = validateQuizPayload(payload);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { topic, difficulty, count } = parsed.data;

    // 1. Generate embedding for the topic to search context
    const topicEmbedding = await generateEmbedding(topic);

    // 2. Perform vector search (match_document_embeddings)
    const { data: contextChunks, error: searchError } = await sb.rpc(
      "match_document_embeddings",
      {
        p_user_id: userId,
        query_embedding: topicEmbedding,
        match_threshold: 0.5,
        match_count: 10,
      }
    );

    if (searchError) throw searchError;

    const contextText = contextChunks
      ?.map((chunk: { content: string }) => chunk.content)
      .join("\n\n---\n\n");

    const finalContext =
      contextText ||
      "No hay contexto suficiente en documentos internos. Usa fuentes públicas oficiales recientes de México (DOF, CNBV, SHCP, UIF) e incluye referencias.";

    // 3. Prompt Gemini Pro to generate the quiz
    const prompt = `
      Eres un experto en PLD/FT certificado por la CNBV.
      Utiliza el siguiente contexto extraído de leyes y guías oficiales para generar un examen de certificación:
      
      CONTEXTO:
      ${finalContext}
      
      INSTRUCCIONES:
      - Genera exactamente ${count} preguntas de opción múltiple.
      - Nivel de dificultad: ${difficulty}.
      - Cada pregunta debe tener 4 opciones (A, B, C, D).
      - Incluye la justificación legal basada en el contexto.
      - Incluye referencia de la fuente (documento interno o URL oficial).
      - Formato: JSON puro (un arreglo de objetos).
      
      EJEMPLO DE FORMATO:
      [
        {
          "id": 1,
          "question": "¿Cuál es el plazo para reportar Operaciones Inusuales?",
          "options": ["24 horas", "3 días hábiles", "60 días naturales", "Inmediatamente"],
          "answer": "60 días naturales",
          "justification": "Según las Disposiciones de Carácter General, el reporte debe enviarse dentro de los 60 días siguientes a que se dictamine la operación."
        }
      ]
    `;

    const result = await proModel().generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (handling potential markdown fences)
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const quiz = JSON.parse(jsonStr);

    return NextResponse.json({ success: true, quiz });

  } catch (error: unknown) {
    console.error("Quiz generation error:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
