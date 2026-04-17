import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { generateEmbedding } from "@/lib/gemini";
import { parsePDF } from "@/lib/pdf-service";
import { applyRateLimit } from "@/lib/rate-limit";
import { getAuthenticatedUserId, getClientIp, sanitizeFileName } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = applyRateLimit({
      key: `${ip}`,
      route: "ingest",
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
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Debes iniciar sesión con Google." }, { status: 401 });
    }

    const { count: totalDocuments = 0 } = await sb
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (totalDocuments >= 3) {
      return NextResponse.json(
        { error: "Límite alcanzado: máximo 3 documentos por usuario en el plan gratuito." },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
    }

    const maxFileBytes = 5 * 1024 * 1024;
    if (file.size > maxFileBytes) {
      return NextResponse.json({ error: "El archivo excede 5MB." }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Solo se aceptan archivos PDF." }, { status: 400 });
    }

    const documentName = sanitizeFileName(file.name || "documento.pdf");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Extract text from PDF
    const pdfData = await parsePDF(buffer);
    if (pdfData.numpages > 150) {
      return NextResponse.json(
        { error: "El archivo excede el límite de 150 páginas." },
        { status: 400 }
      );
    }
    const fullText = pdfData.text;

    // 2. Initial record in 'documents' table
    const { data: document, error: docError } = await sb
      .from("documents")
      .insert({
        user_id: userId,
        name: documentName,
        content: fullText,
        file_type: "pdf",
        page_count: pdfData.numpages,
        file_size_bytes: file.size,
      })
      .select()
      .single();

    if (docError) throw docError;

    // 3. Chunking (approx. 1000 characters with 200 overlap)
    const chunkSize = 1000;
    const overlap = 200;
    const chunks = [];
    
    for (let i = 0; i < fullText.length; i += chunkSize - overlap) {
      chunks.push(fullText.substring(i, i + chunkSize));
    }

    // 4. Generate embeddings and store in 'document_embeddings'
    const embeddingPromises = chunks.map(async (chunk) => {
      const embedding = await generateEmbedding(chunk);
      return {
        document_id: document.id,
        user_id: userId,
        content: chunk,
        embedding: embedding,
        metadata: { source: documentName, page_count: pdfData.numpages },
      };
    });

    const entries = await Promise.all(embeddingPromises);

    const { error: embedError } = await sb
      .from("document_embeddings")
      .insert(entries);

    if (embedError) throw embedError;

    return NextResponse.json({ 
      success: true, 
      documentId: document.id, 
      chunks: chunks.length 
    });

  } catch (error: unknown) {
    console.error("Ingestion error:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
