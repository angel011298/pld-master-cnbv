import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { generateEmbedding, proModel } from "@/lib/gemini";
import { applyRateLimit } from "@/lib/rate-limit";
import { getAuthenticatedUserId, getClientIp, validateQuizPayload } from "@/lib/security";

// ID correspondiente al Superadmin/Sistema para forzar la consulta de la Guía PLD/FT_CNBV global
const GLOBAL_ADMIN_USER_ID = "00000000-0000-0000-0000-000000000000";

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
    
    // Asumiendo que validateQuizPayload ya no rechaza llaves extra o fue adaptado.
    const parsed = validateQuizPayload(payload);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
   
    const { topic, difficulty, count } = parsed.data;
    const exerciseType = payload.exerciseType || "Opción Múltiple";

    // 1. Generate embedding for the topic to search context
    const topicEmbedding = await generateEmbedding(topic);

    // 2. Perform vector search (match_document_embeddings) - FORZADO AL CONTEXTO GLOBAL
    const { data: contextChunks, error: searchError } = await sb.rpc(
      "match_document_embeddings",
      {
        p_user_id: GLOBAL_ADMIN_USER_ID, // Base de conocimiento maestra unificada
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
      "No hay contexto suficiente en documentos internos globales. Usa fuentes públicas oficiales recientes de México (DOF, CNBV, SHCP, UIF) e incluye referencias.";

    // 3. Prompt Gemini Pro to generate the educational material (Multi-formato y Jerarquía estricta)
    const prompt = `
      Eres un experto pedagogo y examinador especializado en la Certificación de Prevención de Lavado de Dinero y Financiamiento al Terrorismo (PLD/FT) de la CNBV en México.
     
      INSTRUCCIONES DE FUENTE DE VERDAD (JERARQUÍA ESTRICTA):
      1. FUENTE PRINCIPAL Y DEFINITIVA: Debes basar tus respuestas PRIMORDIALMENTE en la "Guía PLD/FT_CNBV". Todo el material generado debe alinearse con esta guía obligatoriamente.
      2. FUENTES SECUNDARIAS: Leyes, reglamentos, Disposiciones de Carácter General (DCG), circulares de Banxico y marco jurídico publicado en el DOF y la Cámara de Diputados, así como los documentos aportados a continuación.
     
      CONTEXTO RECUPERADO (Base de Datos Vectorial de la Carpeta Drive Oficial):
      ${finalContext}
     
      INSTRUCCIONES DE GENERACIÓN:
      Se te ha solicitado generar material educativo técnico y preciso sobre el tema: "${topic}".
      Nivel de dificultad: ${difficulty}.
      Tipo de ejercicio solicitado: "${exerciseType}".
      Cantidad de elementos solicitada: ${count}.

      REGLAS DE FORMATO Y EJERCICIOS (Obligatorio seguir estas reglas según el tipo de ejercicio):
      - Si el tipo es "Opción Múltiple" o "Casos Prácticos": DEBES generar EXACTAMENTE 4 opciones de respuesta para CADA pregunta, etiquetadas como "A)", "B)", "C)" y "D)". Una sola es correcta.
      - Si el tipo es "Verdadero o Falso": Las únicas opciones deben ser "A) Verdadero" y "B) Falso".
      - Si el tipo es "Completar Texto": Usa "______" en la pregunta para el espacio en blanco y genera 4 opciones (A, B, C, D) para llenarlo.
      - Si el tipo es "Flashcards": La 'pregunta' será el concepto. Omite las 4 opciones enviando un arreglo con una sola opción igual a la respuesta, y explica el concepto detalladamente en 'justification'.

      IMPORTANTE:
      Devuelve el resultado ESTRICTAMENTE en formato JSON válido puro, con esta estructura base:
      {
        "quiz": [
          {
            "id": 1,
            "question": "Pregunta o planteamiento del caso...",
            "options": ["A) Opción 1", "B) Opción 2", "C) Opción 3", "D) Opción 4"],
            "answer": "A) Opción 1",
            "justification": "Base legal y explicación extraída de la Guía..."
          }
        ]
      }
      NO uses formato markdown ni bloques de código (como \`\`\`json). No agregues ningún texto introductorio, el primer y último carácter deben ser las llaves del JSON { }.
    `;

    const result = await proModel().generateContent(prompt);
    const response = await result.response;
    const text = response.text();
   
    // Extract JSON from response (handling potential markdown fences just in case Gemini gets stubborn)
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const quiz = JSON.parse(jsonStr);

    return NextResponse.json({
      success: true,
      quiz,
      source_context_used: contextChunks?.length || 0
    });

  } catch (error: unknown) {
    console.error("Quiz generation error:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}