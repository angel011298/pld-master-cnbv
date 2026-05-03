#!/usr/bin/env tsx
/**
 * Generate 200+ quiz questions for PLD/FT CNBV exam.
 * Retrieves relevant document chunks per topic via vector search,
 * prompts Gemini 1.5-Pro to generate 30 questions per topic,
 * validates and inserts into quiz_bank table.
 *
 * Usage:
 *   npx tsx scripts/generate-quiz-bank.ts
 *   npm run generate-quiz
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY
 */

import { readFileSync, existsSync } from "fs";
import { createHash } from "crypto";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

// ─── Types ───────────────────────────────────────────────────────────────────

type PldTopic =
  | "marco_legal"
  | "gafi"
  | "kyc_cdd"
  | "reportes_cnbv"
  | "une"
  | "sanciones"
  | "tipologias";

interface QuizQuestion {
  pregunta: string;
  opcion_a: string;
  opcion_b: string;
  opcion_c: string;
  opcion_d: string;
  respuesta_correcta: "a" | "b" | "c" | "d";
  explicacion: string;
  tema: PldTopic;
  dificultad: 1 | 2 | 3;
  fuente_referencia: string;
}

// ─── Env loading ─────────────────────────────────────────────────────────────

function loadEnv(): void {
  const envFile = ".env.local";
  if (!existsSync(envFile)) {
    console.error("❌  .env.local not found.");
    process.exit(1);
  }
  for (const line of readFileSync(envFile, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (key && !process.env[key]) process.env[key] = val;
  }
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TOPICS: PldTopic[] = [
  "marco_legal",
  "gafi",
  "kyc_cdd",
  "reportes_cnbv",
  "une",
  "sanciones",
  "tipologias",
];

const TOPIC_DESCRIPTIONS: Record<PldTopic, string> = {
  marco_legal:
    "Ley Federal de Prevención de Lavado de Dinero, disposiciones regulatorias, artículos legales, marcos normativos CNBV",
  gafi: "Recomendaciones del GAFI, Grupo de Acción Financiera, estándares internacionales, evaluación mutua de países",
  kyc_cdd:
    "Conocimiento del cliente KYC, due diligence CDD, identificación de clientes, beneficiario real, políticas",
  reportes_cnbv:
    "Reportes de operaciones inusuales, operaciones relevantes, internas preocupantes, ROS ROII ante CNBV",
  une: "Unidad especializada en negocios, oficial de cumplimiento, comités, estructuras internas de prevención",
  sanciones:
    "Sanciones administrativas, multas, infracciones, listas OFAC, medidas preventivas contra terrorismo",
  tipologias:
    "Tipologías de lavado de dinero, casos prácticos, esquemas, señales de alerta, financiamiento al terrorismo",
};

// ─── Hash ────────────────────────────────────────────────────────────────────

function hashQuestion(pregunta: string): string {
  return createHash("sha256").update(pregunta).digest("hex");
}

// ─── Embedding ───────────────────────────────────────────────────────────────

async function generateEmbedding(
  model: GenerativeModel,
  text: string,
  retries = 2
): Promise<number[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  throw new Error("Embedding failed");
}

// ─── JSON extraction ─────────────────────────────────────────────────────────

function extractJsonFromResponse(text: string): unknown {
  // Try to find JSON array in markdown code blocks
  let jsonStr = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)?.[1];
  if (!jsonStr) {
    // Try to find raw JSON array
    const match = text.match(/\[\s*\{[\s\S]*?\}\s*\]/);
    if (match) jsonStr = match[0];
  }
  if (!jsonStr) {
    jsonStr = text; // Fallback: parse the whole text
  }

  return JSON.parse(jsonStr);
}

// ─── Question validation ─────────────────────────────────────────────────────

function validateQuestion(q: unknown, topic: PldTopic): q is QuizQuestion {
  if (typeof q !== "object" || q === null) return false;

  const obj = q as Record<string, unknown>;

  // Type checks
  if (typeof obj.pregunta !== "string") return false;
  if (typeof obj.opcion_a !== "string") return false;
  if (typeof obj.opcion_b !== "string") return false;
  if (typeof obj.opcion_c !== "string") return false;
  if (typeof obj.opcion_d !== "string") return false;
  if (!["a", "b", "c", "d"].includes(String(obj.respuesta_correcta))) return false;
  if (typeof obj.explicacion !== "string" || obj.explicacion.length < 20) return false;
  if (obj.tema !== topic) return false;
  if (![1, 2, 3].includes(Number(obj.dificultad))) return false;
  if (typeof obj.fuente_referencia !== "string" || obj.fuente_referencia.length < 3) return false;

  // Validate respuesta_correcta points to an actual option
  const respuesta = String(obj.respuesta_correcta).toLowerCase() as
    | "a"
    | "b"
    | "c"
    | "d";
  const optionMap = {
    a: obj.opcion_a,
    b: obj.opcion_b,
    c: obj.opcion_c,
    d: obj.opcion_d,
  };
  if (!optionMap[respuesta]) return false;

  // Check for duplicate options
  const options = [obj.opcion_a, obj.opcion_b, obj.opcion_c, obj.opcion_d];
  if (new Set(options).size !== 4) return false;

  // Check explicacion mentions a legal reference
  const expl = String(obj.explicacion);
  if (!expl.match(/artículo|articulo|disposición|disposicion|recomendación|recomendacion|criterio|inciso|fracción|fraccion|Artículo|Disposición|Recomendación|Criterio|Inciso|Fracción/)) {
    return false;
  }

  return true;
}

// ─── Quiz generation via Gemini ──────────────────────────────────────────────

async function generateQuestionsForTopic(
  topic: PldTopic,
  topicDescription: string,
  contextChunks: string[],
  proModel: GenerativeModel,
  retries = 2
): Promise<QuizQuestion[]> {
  const context = contextChunks.map((c, i) => `[${i + 1}] ${c}`).join("\n\n");

  const prompt = `Eres un experto en PLD/FT y certificación CNBV México. Debes generar exactamente 30 preguntas de examen para el tema: "${topic}".

CONTEXTO (fragmentos de documentos relevantes):
${context}

INSTRUCCIONES:
- Cada pregunta tiene 4 opciones (A, B, C, D) con exactamente UNA correcta
- Las preguntas deben variar en dificultad: algunos nivel 1 (básico), otros 2 (intermedio), otros 3 (avanzado)
- La explicación DEBE citar específicamente un artículo, disposición, recomendación o criterio del contexto
- Las opciones NO DEBEN ser duplicadas
- Responde SOLO con un JSON array válido (sin markdown, sin explicación adicional)

FORMATO REQUERIDO:
[
  {
    "pregunta": "¿Cuál es...?",
    "opcion_a": "Opción A",
    "opcion_b": "Opción B",
    "opcion_c": "Opción C",
    "opcion_d": "Opción D",
    "respuesta_correcta": "a",
    "explicacion": "Según el Artículo X de la LFPIORPI...",
    "tema": "${topic}",
    "dificultad": 1,
    "fuente_referencia": "LFPIORPI Art. X"
  },
  ...
]

Genera exactamente 30 preguntas en JSON válido.`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await proModel.generateContent(prompt);
      const text = response.response.text();
      const parsed = extractJsonFromResponse(text) as unknown[];

      if (!Array.isArray(parsed)) {
        throw new Error("Response is not an array");
      }

      return parsed
        .map((q) => {
          if (validateQuestion(q, topic)) {
            return { ...q } as QuizQuestion;
          }
          return null;
        })
        .filter((q): q is QuizQuestion => q !== null);
    } catch (err) {
      if (attempt === retries) throw err;
      process.stdout.write(` [retry ${attempt}]`);
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }

  return [];
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  loadEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!supabaseUrl || !serviceKey || !geminiKey) {
    console.error("❌  Missing env vars");
    process.exit(1);
  }

  const sb = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
  const genAI = new GoogleGenerativeAI(geminiKey);
  const embModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const proModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  console.log("\n🚀 Generando banco de reactivos CNBV (200+ preguntas)\n");

  // ── Fetch existing question hashes ──
  console.log("📊 Cargando preguntas existentes...");
  const { data: existingQuestions } = await sb
    .from("quiz_bank")
    .select("pregunta");
  const existingHashes = new Set(
    (existingQuestions || []).map((q) => hashQuestion(q.pregunta))
  );
  console.log(`   ✓ ${existingHashes.size} preguntas ya existen\n`);

  // ── Process each topic ──
  const allQuestions: QuizQuestion[] = [];
  const summaryByTopic: Record<PldTopic, number> = {} as Record<PldTopic, number>;
  const summaryByDifficulty: Record<number, number> = { 1: 0, 2: 0, 3: 0 };

  for (const topic of TOPICS) {
    process.stdout.write(`📚 ${topic.toUpperCase().padEnd(20)} → `);

    // ── Vector search for relevant chunks ──
    const topicDesc = TOPIC_DESCRIPTIONS[topic];
    const embedding = await generateEmbedding(embModel, topicDesc);

    const { data: matchedChunks, error } = await sb.rpc(
      "match_document_embeddings",
      {
        p_user_id: null,
        query_embedding: embedding,
        match_threshold: 0.2,
        match_count: 20,
      }
    );

    if (error || !matchedChunks || matchedChunks.length === 0) {
      console.log(`⚠️   Sin chunks relevantes`);
      continue;
    }

    const contextChunks = matchedChunks.map((c: { content: string }) => c.content);
    process.stdout.write(`${contextChunks.length} chunks | `);

    // ── Generate questions ──
    const generated = await generateQuestionsForTopic(
      topic,
      topicDesc,
      contextChunks,
      proModel
    );

    // ── Filter duplicates ──
    const newQuestions = generated.filter(
      (q) => !existingHashes.has(hashQuestion(q.pregunta))
    );

    console.log(`${generated.length} generadas → ${newQuestions.length} nuevas`);

    allQuestions.push(...newQuestions);
    summaryByTopic[topic] = newQuestions.length;
    newQuestions.forEach((q) => {
      summaryByDifficulty[q.dificultad]++;
    });

    // Delay between topics
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log(`\n💾 Insertando ${allQuestions.length} preguntas en quiz_bank...`);

  // ── Batch insert ──
  let inserted = 0;
  for (let i = 0; i < allQuestions.length; i += 50) {
    const batch = allQuestions.slice(i, i + 50);
    const { error } = await sb.from("quiz_bank").insert(batch);
    if (error) {
      console.error(`   ❌  Error en batch ${i / 50 + 1}: ${error.message}`);
      break;
    }
    inserted += batch.length;
    process.stdout.write(`\r   ${inserted}/${allQuestions.length}`);
  }

  console.log(`\n`);

  // ── Verify final count ──
  const { count: totalCount } = await sb
    .from("quiz_bank")
    .select("*", { count: "exact", head: true });

  console.log(`
╔════════════════════════════════════════════════════════════╗
║  GENERACIÓN COMPLETADA
║
║  Total en quiz_bank: ${String(totalCount || 0).padStart(4)} preguntas
║  Insertadas esta ronda: ${String(inserted).padStart(4)}
║
║  Por TEMA:
${Array.from(Object.entries(summaryByTopic))
  .map(([t, c]) => `║    • ${t.padEnd(15)} ${String(c).padStart(3)} preguntas`)
  .join("\n")}
║
║  Por DIFICULTAD:
║    • Nivel 1 (Básico)      ${String(summaryByDifficulty[1]).padStart(3)} preguntas
║    • Nivel 2 (Intermedio)  ${String(summaryByDifficulty[2]).padStart(3)} preguntas
║    • Nivel 3 (Avanzado)    ${String(summaryByDifficulty[3]).padStart(3)} preguntas
╚════════════════════════════════════════════════════════════╝
`);

  if ((totalCount || 0) < 200) {
    console.warn(
      `\n⚠️   quiz_bank tiene ${totalCount} preguntas (objetivo: 200+). Ejecuta nuevamente.`
    );
  } else {
    console.log(`\n✅ ¡Banco de reactivos completado con éxito!\n`);
  }
}

// ── Run only when executed directly ──
const isEntryPoint =
  process.argv[1] != null &&
  (process.argv[1].endsWith("generate-quiz-bank.ts") ||
    process.argv[1].endsWith("generate-quiz-bank.js"));

if (isEntryPoint) {
  main().catch((err) => {
    console.error("❌  Error fatal:", err.message);
    process.exit(1);
  });
}
