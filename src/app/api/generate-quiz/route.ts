import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateEmbedding, proModel } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { topic, difficulty = "Intermedio", count = 5 } = await req.json();

    // 1. Generate embedding for the topic to search context
    const topicEmbedding = await generateEmbedding(topic);

    // 2. Perform vector search (match_document_embeddings)
    const { data: contextChunks, error: searchError } = await supabaseAdmin.rpc(
      "match_document_embeddings",
      {
        query_embedding: topicEmbedding,
        match_threshold: 0.5,
        match_count: 10,
      }
    );

    if (searchError) throw searchError;

    const contextText = contextChunks
      ?.map((chunk: { content: string }) => chunk.content)
      .join("\n\n---\n\n");

    if (!contextText) {
      return NextResponse.json({ 
        error: "No se encontró información relevante en los documentos subidos." 
      }, { status: 404 });
    }

    // 3. Prompt Gemini Pro to generate the quiz
    const prompt = `
      Eres un experto en PLD/FT certificado por la CNBV.
      Utiliza el siguiente contexto extraído de leyes y guías oficiales para generar un examen de certificación:
      
      CONTEXTO:
      ${contextText}
      
      INSTRUCCIONES:
      - Genera exactamente ${count} preguntas de opción múltiple.
      - Nivel de dificultad: ${difficulty}.
      - Cada pregunta debe tener 4 opciones (A, B, C, D).
      - Incluye la justificación legal basada en el contexto.
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

    const result = await proModel.generateContent(prompt);
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
