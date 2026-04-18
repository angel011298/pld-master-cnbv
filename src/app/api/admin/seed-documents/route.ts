import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Uses service role — bypasses RLS and user limits
// Protected by SEED_SECRET header

const DRIVE_FILES = [
  // Trámites
  { id: "1febe6e9PcQTKtVXb6duqLxOh76A3XjAq", name: "Convocatoria 2026" },
  { id: "1IAfuhZVZvZYgivKBhqiMSzlPaS149Fm3", name: "Preguntas Frecuentes CertPLD 2026" },
  { id: "1wnKQD6JvPqMS-K3lacbiJZnI4K3fxcD2", name: "Manual de Pago de Derechos PLD" },
  { id: "1dsSWWEFNrAk5B931tLoVoYkrJq_fAXVl", name: "Instructivo Obtención Certificado" },
  { id: "12z7as4W82qzXzB-tZjKl_pohuF5rtwHs", name: "Más Información Certificación PLD" },
  { id: "1-_dAuQOOm4VBFEICHJ2KuemNztogbQj_", name: "Aviso de Privacidad Certificación 2026" },
  // Estudio
  { id: "1dxwxrLF_0solq0y7lFHOb_jltDEG1nAb", name: "Guía CNBV PLD/FT 11ª ed. 2025" },
  { id: "1CzO-2bna1hLI25OO00NYYwpJafY583Ti", name: "Temario Oficial CNBV PLD/FT 2026" },
  { id: "16HS0HVfFOndTJWtOnmiZ-KfnGLlivTub", name: "LFPIORPI - Ley Federal PLD" },
  { id: "1xcBBonqQf6OUsqiQhbCP8yg6ZHDi-n-4", name: "Recomendaciones y Metodología Dic 2025" },
  { id: "1tiA9V2druGEuM2zo2s7MM_sqWktVfQhj", name: "Guía de Estudio Módulo 1" },
  { id: "1Zcn_3J-v4Jy50dgzh81W5KXBt9ozqUNM", name: "Repaso General PLD (compress)" },
  { id: "1ultvTFfO3c8-70ePPAeF_1XEEKYwYf-8", name: "Definiciones PLD FT" },
  { id: "1XTNB7qr1pTVO_WGY1YBHq7Ywa2kb87P6", name: "Glosario PLD" },
  // Ejercicios
  { id: "19f35GOm1YTl7jahnUWl9gbQWPCS5ZCle", name: "Cliente de Alto Riesgo" },
  { id: "14V6OP6TKtqoj9DInBEPPCx8EzptEzml3", name: "Bonus Reportes 24 - Ejercicio" },
  { id: "1PfeJra3N2gjk0H5DxxRsjnQB8yBPKfiZ", name: "Bonus Reportes 24 - Respuestas" },
  { id: "1DVm4duvBmb6Czlxs4PWHZL1vPIhnDw_I", name: "Bonus Reportes 24 - Colores" },
];

const MAX_BYTES = 5 * 1024 * 1024;
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

function chunk(text: string): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
    chunks.push(text.substring(i, i + CHUNK_SIZE));
  }
  return chunks;
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-seed-secret");
  if (!secret || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const geminiKey = process.env.GEMINI_API_KEY!;

  if (!supabaseUrl || !serviceKey || !geminiKey) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const genAI = new GoogleGenerativeAI(geminiKey);
  const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

  const results: { name: string; status: string; chunks?: number; error?: string }[] = [];

  for (const file of DRIVE_FILES) {
    try {
      // Check if already ingested
      const { data: existing } = await sb
        .from("documents")
        .select("id")
        .eq("name", file.name)
        .eq("is_global", true)
        .limit(1);

      if (existing && existing.length > 0) {
        results.push({ name: file.name, status: "skipped (already exists)" });
        continue;
      }

      const driveApiKey = process.env.GOOGLE_DRIVE_API_KEY;
      if (!driveApiKey) {
        results.push({ name: file.name, status: "error", error: "GOOGLE_DRIVE_API_KEY not set" });
        continue;
      }
      const downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${driveApiKey}`;
      const res = await fetch(downloadUrl);
      if (!res.ok) {
        results.push({ name: file.name, status: "error", error: `HTTP ${res.status}` });
        continue;
      }

      const bytes = await res.arrayBuffer();
      if (bytes.byteLength > MAX_BYTES) {
        results.push({ name: file.name, status: "skipped (too large)", error: `${(bytes.byteLength / 1024 / 1024).toFixed(1)} MB` });
        continue;
      }

      const { parsePDF } = await import("@/lib/pdf-service");
      const pdfData = await parsePDF(Buffer.from(bytes));
      if (pdfData.numpages > 150) {
        results.push({ name: file.name, status: "skipped (>150 pages)" });
        continue;
      }

      const fullText = pdfData.text;
      const { data: doc, error: docErr } = await sb
        .from("documents")
        .insert({
          user_id: null,
          name: file.name,
          content: fullText,
          file_type: "pdf",
          page_count: pdfData.numpages,
          file_size_bytes: bytes.byteLength,
          is_global: true,
        })
        .select()
        .single();

      if (docErr) throw docErr;

      const chunks = chunk(fullText);
      const entries = await Promise.all(
        chunks.map(async (c) => {
          const result = await embeddingModel.embedContent(c);
          return {
            document_id: doc.id,
            user_id: null,
            content: c,
            embedding: result.embedding.values,
            metadata: { source: file.name, source_file_id: file.id, is_global: true },
          };
        })
      );

      const { error: embErr } = await sb.from("document_embeddings").insert(entries);
      if (embErr) throw embErr;

      results.push({ name: file.name, status: "ok", chunks: chunks.length });
    } catch (err) {
      results.push({ name: file.name, status: "error", error: String(err) });
    }
  }

  return NextResponse.json({ results, total: DRIVE_FILES.length });
}
