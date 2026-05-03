#!/usr/bin/env node
/**
 * SOLUCIÓN TEMPORAL: Ingiere SOLO Guía PLD sin embeddings
 * Sin dependencias de Gemini API
 * Run: node scripts/ingest-guia-pld-simple.mjs
 */

import { existsSync, readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

function loadEnv() {
  const envFile = ".env.local";
  if (!existsSync(envFile)) {
    console.error("❌ .env.local not found");
    process.exit(1);
  }
  const lines = readFileSync(envFile, "utf-8").split("\n");
  for (const line of lines) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Missing Supabase env vars");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

async function parsePdf(buf) {
  const task = pdfjsLib.getDocument({ data: new Uint8Array(buf), useSystemFonts: true });
  const pdf = await task.promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = (content.items || [])
      .map((item) => item.str || "")
      .join(" ");
    text += pageText + "\n";
  }
  return { text, numpages: pdf.numPages };
}

async function ingestGuiaPLD() {
  console.log("🚀 Ingiriendo Guía PLD_FT_CNBV (SIN embeddings por ahora)...\n");

  const guiaFile = {
    id: "1dxwxrLF_0solq0y7lFHOb_jltDEG1nAb",
    name: "Guía PLD_FT_CNBV"
  };

  process.stdout.write(`📄 Descargando ${guiaFile.name}...`);

  const downloadUrl = `https://drive.google.com/uc?export=download&id=${guiaFile.id}`;
  const res = await fetch(downloadUrl, { redirect: "follow" });

  if (!res.ok) {
    console.log(`\n❌ Error descarga: HTTP ${res.status}`);
    process.exit(1);
  }

  const bytes = await res.arrayBuffer();
  console.log(` ✓ ${(bytes.byteLength / 1024 / 1024).toFixed(2)} MB`);

  process.stdout.write("📖 Parsando PDF...");
  const pdfData = await parsePdf(Buffer.from(bytes));
  console.log(` ✓ ${pdfData.numpages} páginas`);

  process.stdout.write("💾 Insertando en base de datos...");

  // Check if already exists
  const { data: existing } = await sb
    .from("documents")
    .select("id")
    .eq("name", guiaFile.name)
    .eq("is_global", true)
    .maybeSingle();

  let docId;
  if (existing) {
    docId = existing.id;
    console.log(` ✓ Ya existe (ID: ${docId})`);
  } else {
    const { data: doc, error: docErr } = await sb
      .from("documents")
      .insert({
        user_id: null,
        name: guiaFile.name,
        content: pdfData.text,
        file_type: "pdf",
        page_count: pdfData.numpages,
        file_size_bytes: bytes.byteLength,
        is_global: true,
      })
      .select("id")
      .single();

    if (docErr) {
      console.log(`\n❌ Error DB: ${docErr.message}`);
      process.exit(1);
    }

    docId = doc.id;
    console.log(` ✓ Insertado (ID: ${docId})`);
  }

  console.log(`\n✨ ¡Guía PLD_FT_CNBV lista en base de datos!`);
  console.log(`   ID del documento: ${docId}`);
  console.log(`   Páginas: ${pdfData.numpages}`);
  console.log(`   Tamaño: ${(bytes.byteLength / 1024 / 1024).toFixed(2)} MB`);
  console.log(`\n📝 Próximo paso: Agregar embeddings después (cuando Gemini API esté disponible)`);
}

ingestGuiaPLD().catch(err => {
  console.error("❌ Error fatal:", err.message);
  process.exit(1);
});