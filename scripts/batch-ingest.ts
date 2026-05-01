#!/usr/bin/env tsx
/**
 * Batch-ingest PDFs from a local folder into Supabase with Gemini embeddings.
 *
 * Usage:
 *   npx tsx scripts/batch-ingest.ts --folder ./docs/cnbv
 *   npm run batch-ingest -- --folder ./docs/cnbv
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY
 */

import { readFileSync, existsSync, readdirSync } from "fs";
import { join, extname, basename } from "path";
import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

// ─── PDF parsing helper ───────────────────────────────────────────────────────

async function parsePdf(buf: Buffer): Promise<{ text: string; numpages: number }> {
  const task = pdfjsLib.getDocument({ data: new Uint8Array(buf), useSystemFonts: true });
  const pdf = await task.promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = (content.items as Array<{ str?: string }>)
      .map((item) => item.str ?? "")
      .join(" ");
    text += pageText + "\n";
  }
  return { text, numpages: pdf.numPages };
}

// ─── Types ───────────────────────────────────────────────────────────────────

type PldTopic =
  | "marco_legal"
  | "gafi"
  | "kyc_cdd"
  | "reportes_cnbv"
  | "une"
  | "sanciones"
  | "tipologias";

interface ChunkEntry {
  content: string;
  hash: string;
  topic: PldTopic;
  chunkIndex: number;
}

// ─── Env loading ─────────────────────────────────────────────────────────────

function loadEnv(): void {
  const envFile = ".env.local";
  if (!existsSync(envFile)) {
    console.error("❌  .env.local not found. Copy .env.example and fill in the values.");
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

// ─── Chunking ─────────────────────────────────────────────────────────────────
// Respects paragraph and sentence boundaries; never cuts mid-sentence.
// max 800 tokens ≈ 3200 characters (Spanish/English ~4 chars/token).

const MAX_CHARS = 3200;

function splitIntoSentences(text: string): string[] {
  // Split on period/exclamation/question followed by whitespace or end-of-string.
  // Preserves the delimiter attached to the sentence.
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function chunkByParagraphs(text: string, maxChars = MAX_CHARS): string[] {
  const paragraphs = text
    .split(/\n{2,}|\r\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  function pushCurrent() {
    const trimmed = current.trim();
    if (trimmed.length > 0) chunks.push(trimmed);
    current = "";
  }

  for (const para of paragraphs) {
    // Paragraph too long on its own → split by sentences
    if (para.length > maxChars) {
      if (current) pushCurrent();
      for (const sentence of splitIntoSentences(para)) {
        if (current.length + sentence.length + 1 > maxChars) {
          pushCurrent();
          current = sentence;
        } else {
          current += (current ? " " : "") + sentence;
        }
      }
      continue;
    }

    // Would overflow → flush and start fresh with this paragraph
    if (current.length + para.length + 2 > maxChars) {
      pushCurrent();
    }

    current += (current ? "\n\n" : "") + para;
  }

  pushCurrent();
  return chunks.filter((c) => c.length >= 20); // discard noise
}

// ─── Topic detection (keyword scoring) ───────────────────────────────────────

const TOPIC_KEYWORDS: Record<PldTopic, string[]> = {
  marco_legal: [
    "lfpiorpi", "disposiciones", "artículo", "articulo", "reglamento",
    "ley federal", "disposición", "disposicion", "normativa", "decreto",
  ],
  gafi: [
    "fatf", "gafi", "recomendación", "recomendacion", "estándar internacional",
    "estandar internacional", "grupo de acción financiera", "acción financiera",
    "evaluación mutua", "evaluacion mutua",
  ],
  kyc_cdd: [
    "cliente", "identificación", "identificacion", "due diligence", "kyc",
    "cdd", "conocimiento del cliente", "expediente", "beneficiario real",
    "debida diligencia",
  ],
  reportes_cnbv: [
    "reporte", "operación inusual", "operacion inusual", "inusual", "ros",
    "roii", "interna preocupante", "operación relevante", "operacion relevante",
    "uif", "reportar",
  ],
  une: [
    "unidad especializada", "une", "oficial de cumplimiento", "oficial cumplimiento",
    "comité de cumplimiento", "comite cumplimiento", "estructura interna",
  ],
  sanciones: [
    "multa", "sanción", "sancion", "infracción", "infraccion", "ofac",
    "lista negra", "lista clinton", "sdo", "pmld",
  ],
  tipologias: [
    "tipología", "tipologia", "lavado de dinero", "caso práctico", "caso practico",
    "esquema", "red", "financiamiento al terrorismo", "señal de alerta",
    "senal de alerta",
  ],
};

export function detectTopic(text: string): PldTopic {
  const lower = text.toLowerCase();
  const scores = {} as Record<PldTopic, number>;

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS) as [PldTopic, string[]][]) {
    scores[topic] = keywords.reduce((sum, kw) => {
      const matches = lower.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"));
      return sum + (matches?.length ?? 0);
    }, 0);
  }

  const best = (Object.entries(scores) as [PldTopic, number][])
    .sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : "marco_legal"; // default
}

// ─── Hash ────────────────────────────────────────────────────────────────────

export function hashContent(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

// ─── Embedding with retry ────────────────────────────────────────────────────

async function generateEmbedding(
  model: ReturnType<InstanceType<typeof GoogleGenerativeAI>["getGenerativeModel"]>,
  text: string,
  retries = 3
): Promise<number[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (err) {
      if (attempt === retries) throw err;
      const delay = attempt * 1500;
      process.stdout.write(` [retry ${attempt} in ${delay}ms]`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Embedding failed after retries");
}

// ─── Batch helpers ────────────────────────────────────────────────────────────

/** Process in sequential batches of batchSize with a pause between batches. */
async function processBatched<T, R>(
  items: T[],
  batchSize: number,
  delayMs: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((item, j) => fn(item, i + j)));
    results.push(...batchResults);
    if (i + batchSize < items.length) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return results;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  loadEnv();

  // ── Parse CLI arguments ──
  const args = process.argv.slice(2);
  const folderIdx = args.indexOf("--folder");
  if (folderIdx === -1 || !args[folderIdx + 1]) {
    console.error("Usage: npx tsx scripts/batch-ingest.ts --folder ./docs/cnbv");
    process.exit(1);
  }
  const folderPath = args[folderIdx + 1];

  if (!existsSync(folderPath)) {
    console.error(`❌  Folder not found: ${folderPath}`);
    process.exit(1);
  }

  // ── Collect PDFs ──
  const pdfFiles = readdirSync(folderPath)
    .filter((f) => extname(f).toLowerCase() === ".pdf")
    .map((f) => join(folderPath, f));

  if (pdfFiles.length === 0) {
    console.log(`ℹ️   No PDFs found in ${folderPath}. Add PDF files and re-run.`);
    process.exit(0);
  }

  // ── Init clients ──
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!supabaseUrl || !serviceKey || !geminiKey) {
    console.error("❌  Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY");
    process.exit(1);
  }

  const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const genAI = new GoogleGenerativeAI(geminiKey);
  const embModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

  console.log(`\n📂  Encontrados ${pdfFiles.length} PDF(s) en ${folderPath}\n`);

  let totalChunksInserted = 0;
  let totalChunksSkipped = 0;

  for (let fileIdx = 0; fileIdx < pdfFiles.length; fileIdx++) {
    const filePath = pdfFiles[fileIdx];
    const fileName = basename(filePath);
    process.stdout.write(`\n[${fileIdx + 1}/${pdfFiles.length}] Procesando: ${fileName} ... `);

    // ── Check if document already exists (by name, global) ──
    const { data: existingDoc } = await sb
      .from("documents")
      .select("id")
      .eq("name", fileName)
      .eq("is_global", true)
      .maybeSingle();

    // ── Parse PDF ──
    let pdfData: { text: string; numpages: number };
    let buffer: Buffer;
    try {
      buffer = readFileSync(filePath);
      if (buffer.length > 10 * 1024 * 1024) {
        console.log("⚠️   Archivo > 10 MB, saltando.");
        continue;
      }
      pdfData = await parsePdf(buffer);
    } catch (err) {
      console.log(`❌  Error al parsear PDF: ${(err as Error).message}`);
      continue;
    }

    if (!pdfData.text || pdfData.text.trim().length < 50) {
      console.log("⚠️   PDF sin texto extraíble (puede ser imagen), saltando.");
      continue;
    }

    // ── Build chunks ──
    const rawChunks = chunkByParagraphs(pdfData.text);
    const chunks: ChunkEntry[] = rawChunks.map((content, i) => ({
      content,
      hash: hashContent(content),
      topic: detectTopic(content),
      chunkIndex: i,
    }));

    console.log(`${chunks.length} chunks detectados`);

    // ── Fetch existing hashes (for duplicate detection) ──
    let existingHashes = new Set<string>();
    let docId: string;

    if (existingDoc) {
      const { data: existingEmbeddings } = await sb
        .from("document_embeddings")
        .select("metadata")
        .eq("document_id", existingDoc.id);

      existingHashes = new Set(
        (existingEmbeddings ?? [])
          .map((e) => (e.metadata as Record<string, string>)?.content_hash)
          .filter(Boolean)
      );
      docId = existingDoc.id;
      process.stdout.write(`   → Documento ya existe (${existingHashes.size} chunks previos). `);
    } else {
      // ── Insert document record ──
      const { data: newDoc, error: docErr } = await sb
        .from("documents")
        .insert({
          user_id: null,
          name: fileName,
          content: pdfData.text,
          file_type: "pdf",
          page_count: pdfData.numpages,
          file_size_bytes: buffer!.length,
          is_global: true,
        })
        .select("id")
        .single();

      if (docErr || !newDoc) {
        console.log(`❌  Error al crear documento: ${docErr?.message}`);
        continue;
      }
      docId = newDoc.id;
    }

    // ── Filter out duplicates ──
    const newChunks = chunks.filter((c) => !existingHashes.has(c.hash));
    const skipped = chunks.length - newChunks.length;

    if (newChunks.length === 0) {
      console.log(`   → Todos los chunks ya existen. Saltando.`);
      totalChunksSkipped += skipped;
      continue;
    }

    if (skipped > 0) {
      process.stdout.write(`   → ${skipped} chunks duplicados saltados. `);
    }

    process.stdout.write(`   → Generando embeddings para ${newChunks.length} chunks...\n`);

    // ── Generate embeddings in batches of 5 (rate limit friendly) ──
    const embeddingEntries = await processBatched(
      newChunks,
      5,
      600,
      async (chunk, idx) => {
        const embeddingValues = await generateEmbedding(embModel, chunk.content);
        const pct = Math.round(((idx + 1) / newChunks.length) * 100);
        process.stdout.write(`\r   Embeddings: ${idx + 1}/${newChunks.length} (${pct}%)`);
        return {
          document_id: docId,
          user_id: null,
          content: chunk.content,
          embedding: embeddingValues,
          metadata: {
            source: fileName,
            is_global: true,
            content_hash: chunk.hash,
            tema: chunk.topic,
            chunk_index: chunk.chunkIndex,
          },
        };
      }
    );

    // ── Insert embeddings in batches of 50 (Supabase payload limit) ──
    for (let i = 0; i < embeddingEntries.length; i += 50) {
      const batch = embeddingEntries.slice(i, i + 50);
      const { error: embErr } = await sb
        .from("document_embeddings")
        .insert(batch);

      if (embErr) {
        console.error(`\n❌  Error insertando embeddings (batch ${i / 50 + 1}): ${embErr.message}`);
        break;
      }
    }

    process.stdout.write(`\n   ✅  ${newChunks.length} chunks insertados (${pdfData.numpages} páginas)\n`);
    totalChunksInserted += newChunks.length;
    totalChunksSkipped += skipped;
  }

  console.log(`
╔══════════════════════════════════════╗
║  Ingesta completada
║  ✅  Insertados : ${String(totalChunksInserted).padEnd(6)} chunks
║  ⏭️   Saltados  : ${String(totalChunksSkipped).padEnd(6)} chunks (duplicados)
╚══════════════════════════════════════╝
`);
}

// Only run when executed directly (not when imported for testing)
const isEntryPoint =
  process.argv[1] != null &&
  (process.argv[1].endsWith("batch-ingest.ts") ||
    process.argv[1].endsWith("batch-ingest.js"));

if (isEntryPoint) {
  main().catch((err) => {
    console.error("Error fatal:", err);
    process.exit(1);
  });
}
