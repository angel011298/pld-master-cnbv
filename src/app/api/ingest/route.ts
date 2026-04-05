import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateEmbedding } from "@/lib/gemini";
import { parsePDF } from "@/lib/pdf-service";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const documentName = file.name;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Extract text from PDF
    const pdfData = await parsePDF(buffer);
    const fullText = pdfData.text;

    // 2. Initial record in 'documents' table
    const { data: document, error: docError } = await supabaseAdmin
      .from("documents")
      .insert({
        name: documentName,
        content: fullText,
        file_type: "pdf",
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
        content: chunk,
        embedding: embedding,
        metadata: { source: documentName, page_count: pdfData.numpages },
      };
    });

    const entries = await Promise.all(embeddingPromises);

    const { error: embedError } = await supabaseAdmin
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
