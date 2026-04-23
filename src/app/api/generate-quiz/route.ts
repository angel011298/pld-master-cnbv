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
    // Capturamos el tipo de formato solicitado, si no viene, asumimos simulador ceneval por defecto
    const formatType = payload.formatType || 'ceneval';

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

    // 3. Prompt Gemini Pro to generate the educational material (Multi-formato y Jerarquía estricta)
    const prompt = `
      Eres un experto pedagogo y examinador especializado en la Certificación de Prevención de Lavado de Dinero y Financiamiento al Terrorismo (PLD/FT) de la CNBV en México.
      
      INSTRUCCIONES DE FUENTE DE VERDAD (JERARQUÍA ESTRICTA):
      1. FUENTE PRINCIPAL Y DEFINITIVA: Debes basar tus respuestas PRIMORDIALMENTE en la "Guía PLD/FT_CNBV".
      2. FUENTES SECUNDARIAS: Leyes, reglamentos, Disposiciones de Carácter General (DCG), circulares de Banxico y marco jurídico publicado en el DOF y la Cámara de Diputados, así como los documentos aportados a continuación.
      
      CONTEXTO RECUPERADO (Base de Datos Vectorial de la Carpeta Drive):
      ${finalContext}
      
      INSTRUCCIONES DE GENERACIÓN:
      Se te ha solicitado generar material educativo sobre el tema: "${topic}".
      Nivel de dificultad: ${difficulty}.
      El formato solicitado es: "${formatType}".
      Cantidad de elementos solicitada: ${count}.

      REGLAS POR FORMATO (Usa estrictamente las siguientes estructuras):
      - 'ceneval': Genera un arreglo de preguntas de opción múltiple (4 opciones: A, B, C, D) con alto rigor técnico. Ejemplo de objeto: {"id": 1, "question": "...", "options": ["A", "B", "C", "D"], "answer": "...", "justification": "...", "source": "..."}
      - 'true_false': Genera un arreglo de afirmaciones. Ejemplo de objeto: {"id": 1, "statement": "...", "isTrue": true/false, "justification": "...", "source": "..."}
      - 'crossword_clues': Genera un arreglo de conceptos de una sola palabra sin espacios ni guiones. Ejemplo de objeto: {"id": 1, "word": "...", "clue": "..."}
      - 'concept_matching': Genera un objeto con dos arreglos aleatorizados. Ejemplo: {"concepts": [{"id": 1, "text": "..."}], "definitions": [{"id": 1, "conceptId": 1, "text": "..."}]}
      - 'word_search_terms': Genera un arreglo de palabras clave. Ejemplo de objeto: {"word": "...", "explanation": "..."}

      IMPORTANTE:
      Devuelve el resultado ESTRICTAMENTE en formato JSON válido puro. 
      NO uses formato markdown ni bloques de código (como \`\`\`json). No agregues ningún texto introductorio, el primer y último carácter deben ser las llaves o corchetes del JSON ([ o {).
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
      source_context_used: contextChunks?.length || 0 // Útil para mostrar en frontend si la IA usó los PDF reales
    });

  } catch (error: unknown) {
    console.error("Quiz generation error:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}