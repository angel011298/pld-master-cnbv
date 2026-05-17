import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { claudeGenerateJson } from "@/lib/claude";
import { applyRateLimit } from "@/lib/rate-limit";
import {
  getAuthenticatedUserId,
  getClientIp,
  validateQuizPayload,
} from "@/lib/security";
import type { QuizQuestion } from "@/types/quiz";

// ─── Mappers ───────────────────────────────────────────────────────────────
// Difficulty: UI label → question_bank value
const DIFF_LABEL_TO_BANK: Record<string, "basico" | "intermedio" | "avanzado"> = {
  Básico: "basico",
  Intermedio: "intermedio",
  Avanzado: "avanzado",
};

// Topic text → bloque (1-8). Returns null when no clear match (no filter).
function topicToBloque(topic: string): number | null {
  if (!topic) return null;
  const t = topic.toLowerCase();
  if (/marco|ley|lfpiorpi|regulator|circular/.test(t)) return 1;
  if (/definici|concepto|glosario/.test(t)) return 2;
  if (/kyc|cdd|identificac|expedient|cliente/.test(t)) return 3;
  if (/reporte|formato|inusual|relevante|24|preocupant/.test(t)) return 4;
  if (/une|oficial.*cumplimiento|estructura/.test(t)) return 5;
  if (/sancion|lista|ofac|pep|bloqueo/.test(t)) return 6;
  if (/tipolog|sospechos|operacion|señal/.test(t)) return 7;
  if (/gafi|fatf|40.*recom/.test(t)) return 8;
  return null;
}

// Exercise type → formato
function exerciseToFormato(et: string): string {
  const e = (et || "").toLowerCase();
  if (e.includes("verdadero")) return "true_false";
  if (e.includes("flashcard")) return "flashcard";
  if (e.includes("caso")) return "case_study";
  if (e.includes("completar")) return "fill_blank";
  if (e.includes("crucigrama")) return "crossword";
  if (e.includes("sopa")) return "word_search";
  return "multiple_choice";
}

type BankRow = {
  id: number;
  bloque: number;
  dificultad: string;
  formato: string;
  stem: string;
  options: string[] | null;
  correct_answer: { index?: number; value?: boolean; answer?: string };
  explanation: string | null;
  source_document: string | null;
};

type ClaudeQuestion = {
  question: string;
  options: string[];
  answer: string;
  justification: string;
};

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Convert a question_bank row → response shape with shuffled option positions
function bankRowToQuestion(row: BankRow, seqId: number): QuizQuestion {
  const labels = ["A)", "B)", "C)", "D)"];
  const opts = Array.isArray(row.options) ? row.options : [];

  // For multiple_choice the correct_answer is {"index": N}
  const correctIdx =
    typeof row.correct_answer?.index === "number" ? row.correct_answer.index : 0;

  // Shuffle option order so the correct one isn't always at the same position
  const positions = shuffleArray(opts.map((_, i) => i));
  const options = positions.map((origIdx, pos) => `${labels[pos]} ${opts[origIdx]}`);
  const correctPos = positions.indexOf(correctIdx);

  return {
    id: seqId,
    question_id: row.id,
    question: row.stem,
    options,
    answer: options[Math.max(0, correctPos)],
    justification: `${row.explanation || ""}${
      row.source_document ? ` (Fuente: ${row.source_document})` : ""
    }`,
    source: "bank",
  };
}

// Persist a Claude-generated question into question_bank for reuse
async function cacheInBank(
  cq: ClaudeQuestion,
  bloque: number,
  dificultad: string,
  formato: string,
  sb: ReturnType<typeof supabaseAdmin>
): Promise<number | null> {
  const opciones = cq.options.map((o) => o.replace(/^[A-D]\)\s*/, "").trim());
  const answerClean = cq.answer.replace(/^[A-D]\)\s*/, "").trim();
  const respuestaIdx = opciones.findIndex((o) => o === answerClean);

  const { data, error } = await sb
    .from("question_bank")
    .insert({
      bloque,
      dificultad,
      formato,
      stem: cq.question,
      options: opciones,
      correct_answer: { index: respuestaIdx >= 0 ? respuestaIdx : 0 },
      explanation: cq.justification,
      source_document: "Claude (on-the-fly)",
      status: "review", // require admin review before being used in simulator
    })
    .select("id")
    .single();

  if (error) {
    console.error("question_bank cache error:", error.message);
    return null;
  }
  return (data as { id: number } | null)?.id ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
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

    const { topic, difficulty, count } = parsed.data;
    const exerciseType =
      ((payload as Record<string, unknown>).exerciseType as string | undefined) ??
      "Opción Múltiple";

    const bloque = topicToBloque(topic);
    const dificultad = DIFF_LABEL_TO_BANK[difficulty] ?? "intermedio";
    const formato = exerciseToFormato(exerciseType);

    // ── 1. Query question_bank ────────────────────────────────────────────
    let bankQuery = sb
      .from("question_bank")
      .select("*")
      .eq("status", "active")
      .eq("formato", formato)
      .eq("dificultad", dificultad);

    if (bloque !== null) bankQuery = bankQuery.eq("bloque", bloque);

    const { data: bankRows } = await bankQuery;
    const available = (bankRows ?? []) as BankRow[];

    if (available.length >= count) {
      const selected = shuffleArray(available).slice(0, count);
      const quiz = selected.map((row, i) => bankRowToQuestion(row, i + 1));
      return NextResponse.json({ success: true, quiz, source: "bank" });
    }

    // ── 2. Use what exists + generate the rest with Claude ────────────────
    const fromBank = shuffleArray(available);
    const bankQuestions = fromBank.map((row, i) => bankRowToQuestion(row, i + 1));
    const needed = count - bankQuestions.length;

    // ── 3. Claude prompt — no RAG embedding (was causing the Gemini error) ──
    const system = `Eres un experto pedagogo y examinador especializado en la Certificación CENEVAL de Prevención de Lavado de Dinero y Financiamiento al Terrorismo (PLD/FT) de la CNBV, México.

Fuentes de verdad (jerarquía estricta):
1. LFPIORPI (Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita) y su Reglamento.
2. Disposiciones de Carácter General CNBV (Circular Única) y anexos.
3. Las 40 Recomendaciones del GAFI (FATF) — especialmente cuando el tema lo requiera.
4. Marco jurídico publicado en el DOF y guías oficiales SHCP/UIF.

Devuelve EXCLUSIVAMENTE JSON válido. Sin markdown, sin texto introductorio, el primer carácter debe ser '{'.`;

    const user = `Genera ${needed} reactivos tipo CENEVAL sobre el tema: "${topic || "PLD/FT general"}".
Nivel de dificultad: ${difficulty}.
Tipo de ejercicio: "${exerciseType}".

Reglas por tipo de ejercicio:
- "Opción Múltiple" / "Casos Prácticos": EXACTAMENTE 4 opciones etiquetadas "A)", "B)", "C)", "D)". Una sola correcta.
- "Verdadero o Falso": solo "A) Verdadero" y "B) Falso".
- "Completar Texto": usa "______" en la pregunta y 4 opciones para llenarlo.
- "Flashcards": pregunta = concepto, options = [respuesta única], justification = explicación detallada.

Estructura JSON requerida:
{
  "quiz": [
    {
      "question": "Enunciado del reactivo",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "answer": "A) ...",
      "justification": "Base legal y explicación detallada citando LFPIORPI/CNBV/GAFI cuando aplique"
    }
  ]
}`;

    const { quiz: claudeRaw } = await claudeGenerateJson<{ quiz: ClaudeQuestion[] }>({
      system,
      user,
      maxTokens: 4096,
      temperature: 0.7,
    });

    // ── 4. Cache Claude results in question_bank (status='review') ────────
    const cacheBloque = bloque ?? 1;
    const claudeQuestions: QuizQuestion[] = await Promise.all(
      (claudeRaw || []).slice(0, needed).map(async (cq, i) => {
        const newId = await cacheInBank(cq, cacheBloque, dificultad, formato, sb);
        return {
          id: bankQuestions.length + i + 1,
          question_id: newId ?? undefined,
          question: cq.question,
          options: cq.options,
          answer: cq.answer,
          justification: cq.justification,
          source: "claude" as const,
        };
      })
    );

    const quiz = [...bankQuestions, ...claudeQuestions];
    return NextResponse.json({ success: true, quiz, source: "mixed" });
  } catch (error: unknown) {
    console.error("Quiz generation error:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
