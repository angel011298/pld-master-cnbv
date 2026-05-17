/**
 * BULK QUESTION BANK GENERATOR
 *
 * Fills public.question_bank with reactivos for the CENEVAL PLD/FT exam.
 *
 * Usage:
 *   node scripts/generate-question-bank.mjs                 # generate everything missing up to TARGET_PER_CELL
 *   node scripts/generate-question-bank.mjs --bloque 8      # only bloque 8
 *   node scripts/generate-question-bank.mjs --formato multiple_choice
 *   node scripts/generate-question-bank.mjs --dry-run       # show what would be done
 *
 * Required env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   ANTHROPIC_API_KEY
 *
 * Optional env:
 *   CLAUDE_MODEL (default claude-sonnet-4-5-20250929)
 *   BATCH_SIZE  (default 5 — items per Claude call)
 *   TARGET_PER_CELL (default per format, see TARGETS below)
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

// ─── Config ──────────────────────────────────────────────────────────────
const TARGETS = {
  multiple_choice: 42, // 8 bloques × 42 ≈ 336 multi-choice (covers 125/bloque across all difficulties)
  true_false: 15,
  flashcard: 20,
  case_study: 10,
  fill_blank: 15,
  crossword: 5,
  word_search: 5,
};
// Per cell = TARGETS[formato] / 3 difficulties, ceil. Override via TARGET_PER_CELL env.

const BLOQUE_NAMES = {
  1: "Marco Legal PLD/FT",
  2: "Definiciones",
  3: "KYC / Identificación del Cliente",
  4: "Reportes a CNBV",
  5: "Estructura UNE / Oficial Cumplimiento",
  6: "Sanciones y Listas",
  7: "Tipologías y Operaciones Sospechosas",
  8: "40 Recomendaciones GAFI",
};

const SOURCE_DOC_PRIORITY = {
  1: ["Guía PLD_FT_CNBV", "LFPIORPI"],
  2: ["Definiciones PLD FT", "Glosario PLD"],
  3: ["Guía PLD_FT_CNBV", "Cliente de Alto Riesgo"],
  4: ["Guía PLD_FT_CNBV", "Bonus Reportes"],
  5: ["Guía PLD_FT_CNBV", "Repaso General PLD"],
  6: ["Guía PLD_FT_CNBV", "Repaso General PLD"],
  7: ["Guía PLD_FT_CNBV", "Repaso General PLD"],
  8: ["40 Recomendaciones GAFI"],
};

const FORMATOS = [
  "multiple_choice",
  "true_false",
  "flashcard",
  "case_study",
  "fill_blank",
  "crossword",
  "word_search",
];
const DIFICULTADES = ["basico", "intermedio", "avanzado"];

const BATCH_SIZE = Number(process.env.BATCH_SIZE) || 5;
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-5-20250929";

// ─── Args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const argVal = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : null;
};
const hasFlag = (name) => args.includes(`--${name}`);

const filterBloque = argVal("bloque") ? Number(argVal("bloque")) : null;
const filterFormato = argVal("formato");
const filterDif = argVal("dificultad");
const isDryRun = hasFlag("dry-run");

// ─── Clients ─────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Helpers ─────────────────────────────────────────────────────────────
async function getSourceContext(bloque, maxChars = 30000) {
  const candidates = SOURCE_DOC_PRIORITY[bloque] || [];
  for (const name of candidates) {
    const { data } = await supabase
      .from("documents")
      .select("name, content")
      .eq("is_global", true)
      .ilike("name", `%${name}%`)
      .limit(1)
      .maybeSingle();
    if (data?.content)
      return { text: data.content.slice(0, maxChars), sourceName: data.name };
  }
  const { data } = await supabase
    .from("documents")
    .select("name, content")
    .eq("is_global", true)
    .ilike("name", "%PLD%")
    .limit(1)
    .maybeSingle();
  return {
    text: (data?.content || "").slice(0, maxChars),
    sourceName: data?.name || "PLD/FT general",
  };
}

const FORMAT_INSTRUCTIONS = {
  multiple_choice: `Cada reactivo: 1 enunciado + EXACTAMENTE 4 opciones. UNA correcta.
Estructura JSON: { "stem": "...", "options": ["...","...","...","..."], "correct_index": 0, "explanation": "Justificación citando LFPIORPI/CNBV/GAFI" }`,
  true_false: `Afirmación clara verdadera o falsa.
Estructura JSON: { "stem": "...", "value": true, "explanation": "..." }`,
  flashcard: `Concepto al frente, definición al reverso.
Estructura JSON: { "stem": "Concepto (frente)", "answer": "Definición detallada (reverso)", "explanation": "Contexto" }`,
  case_study: `Caso práctico narrativo + pregunta + 4 opciones.
Estructura JSON: { "stem": "Caso de 2-4 párrafos + pregunta", "options": [...], "correct_index": 0, "explanation": "..." }`,
  fill_blank: `Texto con UN ______ y 4 opciones.
Estructura JSON: { "stem": "Texto con un ______ aquí", "options": [...4 opciones...], "correct_index": 0, "explanation": "..." }`,
  crossword: `Generar 5-8 palabras + pistas (UI arma grid).
Estructura JSON: { "stem": "Crucigrama: tema", "words": [{"word":"PALABRA","clue":"pista"}], "explanation": "Tema" }`,
  word_search: `Generar 10-15 palabras clave (UI arma sopa).
Estructura JSON: { "stem": "Sopa de letras: tema", "words": ["P1","P2","..."], "explanation": "Tema" }`,
};

const DIFFICULTY_HINTS = {
  basico: "Nivel BÁSICO: conceptos fundamentales, definiciones directas.",
  intermedio: "Nivel INTERMEDIO: aplicación de la norma, distinción entre conceptos similares.",
  avanzado: "Nivel AVANZADO: casos complejos, integración de normas, distractores muy plausibles.",
};

async function generateBatch({ bloque, dificultad, formato, count }) {
  const { text, sourceName } = await getSourceContext(bloque);
  const bloqueName = BLOQUE_NAMES[bloque];

  const system = `Eres un examinador experto para la Certificación CENEVAL CNBV PLD/FT (México). Generas reactivos de alta calidad, alineados estrictamente a LFPIORPI, Disposiciones CNBV, 40 Recomendaciones GAFI, y guías SHCP/UIF.

Devuelves SOLO JSON válido. Sin markdown, sin texto antes/después. Primer carácter: '['.`;

  const user = `BLOQUE: ${bloque} — ${bloqueName}
FORMATO: ${formato}
DIFICULTAD: ${dificultad}
CANTIDAD: ${count}

${DIFFICULTY_HINTS[dificultad]}

INSTRUCCIONES:
${FORMAT_INSTRUCTIONS[formato]}

MATERIAL FUENTE (extracto del documento "${sourceName}"):
"""
${text}
"""

Devuelve un ARRAY JSON con EXACTAMENTE ${count} objetos.`;

  const resp = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 8000,
    temperature: 0.75,
    system,
    messages: [{ role: "user", content: user }],
  });

  const raw = resp.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  const first = cleaned.search(/[[{]/);
  const last = Math.max(cleaned.lastIndexOf("]"), cleaned.lastIndexOf("}"));
  const jsonStr = first >= 0 && last > first ? cleaned.slice(first, last + 1) : cleaned;
  const items = JSON.parse(jsonStr);
  if (!Array.isArray(items)) throw new Error("Respuesta no es array");

  return items.map((g) => {
    let options = null;
    let correct_answer = {};
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
        correct_answer = { answer: g.answer || "" };
        break;
      case "crossword":
      case "word_search":
        correct_answer = { words: g.words || [] };
        break;
    }
    return {
      bloque, dificultad, formato,
      stem: g.stem,
      options,
      correct_answer,
      explanation: g.explanation || "",
      source_document: sourceName,
      status: "active",
    };
  });
}

// ─── Main loop ───────────────────────────────────────────────────────────
async function main() {
  console.log("\n📚 CERTIFIK PLD — Bulk question bank generator\n");
  console.log(`Model: ${MODEL}`);
  console.log(`Batch size: ${BATCH_SIZE}`);
  if (filterBloque) console.log(`Filter bloque: ${filterBloque}`);
  if (filterFormato) console.log(`Filter formato: ${filterFormato}`);
  if (filterDif) console.log(`Filter dificultad: ${filterDif}`);
  if (isDryRun) console.log(`🔍 DRY RUN — no questions will be inserted\n`);

  // Read current progress
  const { data: progress } = await supabase
    .from("v_question_bank_progress")
    .select("*");

  const haveMap = new Map();
  (progress || []).forEach((p) => {
    haveMap.set(`${p.bloque}|${p.dificultad}|${p.formato}`, p.active_count);
  });

  // Build work list
  const work = [];
  for (let bloque = 1; bloque <= 8; bloque++) {
    if (filterBloque && bloque !== filterBloque) continue;
    for (const formato of FORMATOS) {
      if (filterFormato && formato !== filterFormato) continue;
      const totalTarget = Number(process.env.TARGET_PER_CELL) || TARGETS[formato];
      const perDifTarget = Math.ceil(totalTarget / DIFICULTADES.length);
      for (const dificultad of DIFICULTADES) {
        if (filterDif && dificultad !== filterDif) continue;
        const have = haveMap.get(`${bloque}|${dificultad}|${formato}`) || 0;
        const need = Math.max(0, perDifTarget - have);
        if (need > 0) {
          work.push({ bloque, dificultad, formato, have, need, target: perDifTarget });
        }
      }
    }
  }

  if (work.length === 0) {
    console.log("✅ El banco ya está lleno según los targets configurados.");
    return;
  }

  console.log(`📋 ${work.length} celdas requieren generación.\n`);
  for (const w of work) {
    console.log(
      `  Bloque ${w.bloque} / ${w.dificultad} / ${w.formato}: ${w.have} → ${w.target} (faltan ${w.need})`
    );
  }

  if (isDryRun) {
    const totalNeed = work.reduce((s, w) => s + w.need, 0);
    console.log(`\n🔍 Total reactivos a generar: ${totalNeed}\n`);
    return;
  }

  console.log(`\n🚀 Iniciando generación...\n`);

  let totalGenerated = 0;
  let totalFailed = 0;

  for (const w of work) {
    let remaining = w.need;
    while (remaining > 0) {
      const batchN = Math.min(BATCH_SIZE, remaining);
      const label = `[Bloque ${w.bloque}/${w.dificultad}/${w.formato}] ${batchN} items`;
      process.stdout.write(`  ${label}... `);
      try {
        const rows = await generateBatch({
          bloque: w.bloque,
          dificultad: w.dificultad,
          formato: w.formato,
          count: batchN,
        });
        const { error } = await supabase.from("question_bank").insert(rows);
        if (error) throw new Error(error.message);
        totalGenerated += rows.length;
        remaining -= rows.length;
        console.log(`✅ ${rows.length} insertados`);
      } catch (err) {
        totalFailed++;
        console.log(`❌ ${err.message}`);
        // Don't retry — move to next cell to avoid endless loops
        break;
      }
    }
  }

  console.log(`\n🎉 Completado. Generados: ${totalGenerated}. Fallos: ${totalFailed}.\n`);
}

main().catch((err) => {
  console.error("\n💥 Error fatal:", err);
  process.exit(1);
});
