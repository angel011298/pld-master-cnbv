import { claudeGenerateJson } from "@/lib/claude";
import { supabaseAdmin } from "@/lib/supabase";

export const BLOQUE_NAMES: Record<number, string> = {
  1: "Marco Legal PLD/FT",
  2: "Definiciones",
  3: "KYC / Identificación del Cliente",
  4: "Reportes a CNBV",
  5: "Estructura UNE / Oficial Cumplimiento",
  6: "Sanciones y Listas",
  7: "Tipologías y Operaciones Sospechosas",
  8: "40 Recomendaciones GAFI",
};

// Source PDFs in the `documents` table — used as Claude context per bloque
export const SOURCE_DOC_PRIORITY: Record<number, string[]> = {
  1: ["Guía PLD_FT_CNBV", "LFPIORPI - Ley Federal PLD", "Guía CNBV PLD/FT 11ª ed. 2025"],
  2: ["Definiciones PLD FT", "Glosario PLD"],
  3: ["Guía PLD_FT_CNBV", "Cliente de Alto Riesgo"],
  4: ["Guía PLD_FT_CNBV", "Bonus Reportes 24 - Colores"],
  5: ["Guía PLD_FT_CNBV", "Repaso General PLD (compress)"],
  6: ["Guía PLD_FT_CNBV", "Repaso General PLD (compress)"],
  7: ["Guía PLD_FT_CNBV", "Repaso General PLD (compress)"],
  8: ["40 Recomendaciones GAFI"],
};

export const FORMATOS = [
  "multiple_choice",
  "true_false",
  "flashcard",
  "case_study",
  "fill_blank",
  "crossword",
  "word_search",
] as const;

export const DIFICULTADES = ["basico", "intermedio", "avanzado"] as const;

export type Formato = (typeof FORMATOS)[number];
export type Dificultad = (typeof DIFICULTADES)[number];

// Pull source-document text for a bloque (capped to keep prompt size sane)
export async function getSourceContext(
  bloque: number,
  maxChars = 30000
): Promise<{ text: string; sourceName: string }> {
  const sb = supabaseAdmin();
  const candidates = SOURCE_DOC_PRIORITY[bloque] ?? [];

  for (const name of candidates) {
    const { data } = await sb
      .from("documents")
      .select("name, content")
      .eq("is_global", true)
      .ilike("name", `%${name}%`)
      .limit(1)
      .maybeSingle();

    if (data?.content) {
      return {
        text: (data.content as string).slice(0, maxChars),
        sourceName: data.name as string,
      };
    }
  }

  // Fallback to any global doc
  const { data } = await sb
    .from("documents")
    .select("name, content")
    .eq("is_global", true)
    .ilike("name", "%PLD%")
    .limit(1)
    .maybeSingle();

  return {
    text: ((data?.content as string) || "").slice(0, maxChars),
    sourceName: (data?.name as string) || "PLD/FT general",
  };
}

const FORMAT_INSTRUCTIONS: Record<Formato, string> = {
  multiple_choice: `Cada reactivo: 1 enunciado + EXACTAMENTE 4 opciones. UNA correcta.
Estructura JSON:
{
  "stem": "Enunciado claro y específico",
  "options": ["texto opción 1", "texto opción 2", "texto opción 3", "texto opción 4"],
  "correct_index": 0,
  "explanation": "Justificación detallada citando artículo de LFPIORPI/CNBV/GAFI"
}`,

  true_false: `Afirmación clara que pueda calificarse como verdadera o falsa.
Estructura JSON:
{
  "stem": "Afirmación a evaluar",
  "value": true,
  "explanation": "Por qué es verdadera/falsa, citando la norma"
}`,

  flashcard: `Concepto al frente, definición al reverso.
Estructura JSON:
{
  "stem": "Concepto, término o pregunta corta (FRENTE)",
  "answer": "Definición o respuesta detallada (REVERSO)",
  "explanation": "Contexto adicional para reforzar"
}`,

  case_study: `Caso práctico narrativo seguido de pregunta de opción múltiple (4 opciones).
Estructura JSON:
{
  "stem": "Caso práctico narrativo (2-4 párrafos) + pregunta al final",
  "options": ["opción 1", "opción 2", "opción 3", "opción 4"],
  "correct_index": 0,
  "explanation": "Análisis del caso y por qué la respuesta correcta lo es"
}`,

  fill_blank: `Texto con UN espacio en blanco "______" y 4 opciones para llenarlo.
Estructura JSON:
{
  "stem": "Texto con un ______ en el espacio a completar",
  "options": ["palabra/frase 1", "palabra/frase 2", "palabra/frase 3", "palabra/frase 4"],
  "correct_index": 0,
  "explanation": "Por qué esa palabra/frase es correcta"
}`,

  crossword: `Generar 5-8 palabras relacionadas al tema con pistas (no incluir grid — la UI lo arma).
Estructura JSON:
{
  "stem": "Crucigrama: ${"" /* topic */}",
  "words": [
    { "word": "PALABRA", "clue": "Pista breve" }
  ],
  "explanation": "Tema general del crucigrama"
}`,

  word_search: `Generar 10-15 palabras clave relacionadas al tema (UI arma la sopa).
Estructura JSON:
{
  "stem": "Sopa de letras: ${"" /* topic */}",
  "words": ["PALABRA1","PALABRA2","..."],
  "explanation": "Tema general"
}`,
};

const DIFFICULTY_HINTS: Record<Dificultad, string> = {
  basico:
    "Nivel BÁSICO: conceptos fundamentales, definiciones directas, identificación de elementos.",
  intermedio:
    "Nivel INTERMEDIO: aplicación de la norma, distinción entre conceptos similares, análisis básico.",
  avanzado:
    "Nivel AVANZADO: casos complejos, integración de múltiples normas, juicio profesional, distractores muy plausibles.",
};

type GeneratedItem = {
  stem: string;
  options?: string[];
  correct_index?: number;
  value?: boolean;
  answer?: string;
  words?: Array<{ word: string; clue?: string }> | string[];
  explanation: string;
};

/**
 * Generate a batch of N questions for a specific (bloque, dificultad, formato).
 * Calls Claude with bloque-specific source PDF content as grounding.
 * Returns ready-to-insert rows for question_bank.
 */
export async function generateBatch(opts: {
  bloque: number;
  dificultad: Dificultad;
  formato: Formato;
  count: number;
  status?: "active" | "review";
}): Promise<
  Array<{
    bloque: number;
    dificultad: Dificultad;
    formato: Formato;
    stem: string;
    options: unknown;
    correct_answer: unknown;
    explanation: string;
    source_document: string;
    status: "active" | "review";
  }>
> {
  const { bloque, dificultad, formato, count, status = "active" } = opts;
  const { text: sourceText, sourceName } = await getSourceContext(bloque);
  const bloqueName = BLOQUE_NAMES[bloque];
  const formatInst = FORMAT_INSTRUCTIONS[formato];
  const diffHint = DIFFICULTY_HINTS[dificultad];

  const system = `Eres un examinador experto para la Certificación CENEVAL CNBV PLD/FT (México).
Generas reactivos de altísima calidad, alineados estrictamente a la normativa mexicana vigente:
- LFPIORPI (Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita) y Reglamento
- Disposiciones Generales CNBV (Circular Única)
- 40 Recomendaciones GAFI
- Guías oficiales SHCP/UIF

Devuelves SOLO JSON válido. Sin markdown, sin texto antes/después. Primer carácter: '['.`;

  const user = `BLOQUE: ${bloque} — ${bloqueName}
FORMATO: ${formato}
DIFICULTAD: ${dificultad}
CANTIDAD: ${count}

${diffHint}

INSTRUCCIONES DE FORMATO:
${formatInst}

MATERIAL FUENTE (extracto del documento "${sourceName}"):
"""
${sourceText}
"""

Genera EXACTAMENTE ${count} reactivos sobre el bloque "${bloqueName}" basados en el material fuente.
Devuelve un ARRAY JSON con ${count} objetos siguiendo la estructura especificada para el formato "${formato}".`;

  const generated = await claudeGenerateJson<GeneratedItem[]>({
    system,
    user,
    maxTokens: 8000,
    temperature: 0.75,
  });

  if (!Array.isArray(generated)) {
    throw new Error("Claude no devolvió un array de reactivos");
  }

  // Normalize per format
  return generated.map((g) => {
    let options: unknown = null;
    let correct_answer: unknown = {};

    switch (formato) {
      case "multiple_choice":
      case "case_study":
      case "fill_blank":
        options = Array.isArray(g.options) ? g.options.slice(0, 4) : [];
        correct_answer = { index: g.correct_index ?? 0 };
        break;
      case "true_false":
        options = ["Verdadero", "Falso"];
        correct_answer = { value: g.value === true };
        break;
      case "flashcard":
        options = null;
        correct_answer = { answer: g.answer || "" };
        break;
      case "crossword":
        options = null;
        correct_answer = { words: g.words || [] };
        break;
      case "word_search":
        options = null;
        correct_answer = { words: g.words || [] };
        break;
    }

    return {
      bloque,
      dificultad,
      formato,
      stem: g.stem,
      options,
      correct_answer,
      explanation: g.explanation || "",
      source_document: sourceName,
      status,
    };
  });
}
