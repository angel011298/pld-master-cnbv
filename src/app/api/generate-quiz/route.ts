import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { generateEmbedding, proModel } from "@/lib/gemini";
import { applyRateLimit } from "@/lib/rate-limit";
import { getAuthenticatedUserId, getClientIp, validateQuizPayload } from "@/lib/security";
import type { QuizQuestion } from "@/types/quiz";

const GLOBAL_ADMIN_USER_ID = "00000000-0000-0000-0000-000000000000";

const DIFF_TO_BANK: Record<string, string> = {
  Básico: "fácil",
  Intermedio: "medio",
  Avanzado: "difícil",
};

type BankRow = {
  id: number;
  pregunta: string;
  opciones: string[];
  respuesta_correcta: number;
  explicacion: string;
  tema: string;
  dificultad: string;
  fuente: string;
};

type GeminiQuestion = {
  id: number;
  question: string;
  options: string[];
  answer: string;
  justification: string;
};

// Fisher-Yates shuffle — returns a new array
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Convert a quiz_bank row to the response shape with shuffled option positions
function bankRowToQuestion(row: BankRow, seqId: number): QuizQuestion {
  const labels = ["A)", "B)", "C)", "D)"];
  const indices = shuffleArray([0, 1, 2, 3]);
  const options = indices.map((origIdx, pos) => `${labels[pos]} ${row.opciones[origIdx]}`);
  const correctPos = indices.indexOf(row.respuesta_correcta);
  return {
    id: seqId,
    question_id: row.id,
    question: row.pregunta,
    options,
    answer: options[correctPos],
    justification: `${row.explicacion}${row.fuente ? ` (Fuente: ${row.fuente})` : ""}`,
    source: "bank",
  };
}

// Persist a Gemini-generated question into quiz_bank; returns the new row id or null
async function cacheInBank(
  gq: GeminiQuestion,
  tema: string,
  dificultad: string,
  sb: ReturnType<typeof supabaseAdmin>
): Promise<number | null> {
  const opciones = gq.options.map((o) => o.replace(/^[A-D]\)\s*/, "").trim());
  const answerClean = gq.answer.replace(/^[A-D]\)\s*/, "").trim();
  const respuesta_correcta = opciones.findIndex((o) => o === answerClean);

  const { data, error } = await sb
    .from("quiz_bank")
    .insert({
      pregunta: gq.question,
      opciones,
      respuesta_correcta: respuesta_correcta >= 0 ? respuesta_correcta : 0,
      explicacion: gq.justification,
      tema,
      dificultad,
      fuente: "Gemini RAG",
    })
    .select("id")
    .single();

  if (error) {
    console.error("quiz_bank cache error:", error.message);
    return null;
  }
  return (data as { id: number } | null)?.id ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Debes iniciar sesión con Google." }, { status: 401 });
    }

    const rate = applyRateLimit({
      key: `${userId}:${ip}`,
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

    const { topic, difficulty, count, bankDificultad } = parsed.data;
    const exerciseType =
      (payload as Record<string, unknown>).exerciseType as string | undefined ??
      "Opción Múltiple";

    // ── 1. Query quiz_bank ────────────────────────────────────────────────────
    let bankQuery = sb.from("quiz_bank").select("*");
    if (topic) bankQuery = bankQuery.ilike("tema", `%${topic}%`);
    if (bankDificultad) bankQuery = bankQuery.eq("dificultad", bankDificultad);

    const { data: bankRows } = await bankQuery;
    const available = (bankRows ?? []) as BankRow[];
    const threshold = count * 2;

    if (available.length >= threshold) {
      // Sufficient cached questions: random pool, shuffle option order per question
      const selected = shuffleArray(available).slice(0, count);
      const quiz = selected.map((row, i) => bankRowToQuestion(row, i + 1));
      return NextResponse.json({ success: true, quiz, source_context_used: 0 });
    }

    // ── 2. Not enough cached: use what exists + generate the rest via Gemini ──
    const fromBank = shuffleArray(available);
    const bankQuestions = fromBank.map((row, i) => bankRowToQuestion(row, i + 1));
    const needed = count - bankQuestions.length;

    // RAG: embed topic and retrieve relevant document chunks
    const topicEmbedding = await generateEmbedding(topic || "PLD/FT");
    const { data: contextChunks, error: searchError } = await sb.rpc(
      "match_document_embeddings",
      {
        p_user_id: GLOBAL_ADMIN_USER_ID,
        query_embedding: topicEmbedding,
        match_threshold: 0.5,
        match_count: 10,
      }
    );
    if (searchError) throw searchError;

    const contextText =
      contextChunks?.map((c: { content: string }) => c.content).join("\n\n---\n\n") ?? "";
    const finalContext =
      contextText ||
      "No hay contexto suficiente en documentos internos globales. Usa fuentes públicas oficiales recientes de México (DOF, CNBV, SHCP, UIF) e incluye referencias.";

    // ── 3. Gemini prompt (generates only the missing `needed` questions) ──────
    const prompt = `
Eres un experto pedagogo y examinador especializado en la Certificación de Prevención de Lavado de Dinero y Financiamiento al Terrorismo (PLD/FT) de la CNBV en México.

INSTRUCCIONES DE FUENTE DE VERDAD (JERARQUÍA ESTRICTA):
1. FUENTE PRINCIPAL Y DEFINITIVA: Debes basar tus respuestas PRIMORDIALMENTE en la "Guía PLD/FT_CNBV". Todo el material generado debe alinearse con esta guía obligatoriamente.
2. FUENTES SECUNDARIAS: Leyes, reglamentos, Disposiciones de Carácter General (DCG), circulares de Banxico y marco jurídico publicado en el DOF y la Cámara de Diputados, así como los documentos aportados a continuación.

CONTEXTO RECUPERADO (Base de Datos Vectorial de la Carpeta Drive Oficial):
${finalContext}

INSTRUCCIONES DE GENERACIÓN:
Se te ha solicitado generar material educativo técnico y preciso sobre el tema: "${topic || "PLD/FT"}".
Nivel de dificultad: ${difficulty}.
Tipo de ejercicio solicitado: "${exerciseType}".
Cantidad de elementos solicitada: ${needed}.

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
NO uses formato markdown ni bloques de código (como \`\`\`json). No agregues ningún texto introductorio, el primer y último carácter deben ser las llaves del JSON { }.`;

    const result = await proModel().generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const { quiz: geminiRaw } = JSON.parse(jsonStr) as { quiz: GeminiQuestion[] };

    // ── 4. Cache Gemini results in quiz_bank for future requests ──────────────
    const cacheTema = topic || "PLD/FT";
    const cacheDif = bankDificultad ?? DIFF_TO_BANK[difficulty] ?? "medio";

    const geminiQuestions: QuizQuestion[] = await Promise.all(
      geminiRaw.map(async (gq, i) => {
        const newId = await cacheInBank(gq, cacheTema, cacheDif, sb);
        return {
          id: bankQuestions.length + i + 1,
          question_id: newId ?? undefined,
          question: gq.question,
          options: gq.options,
          answer: gq.answer,
          justification: gq.justification,
          source: "gemini" as const,
        };
      })
    );

    const quiz = [...bankQuestions, ...geminiQuestions];

    return NextResponse.json({
      success: true,
      quiz,
      source_context_used: contextChunks?.length ?? 0,
    });
  } catch (error: unknown) {
    console.error("Quiz generation error:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
