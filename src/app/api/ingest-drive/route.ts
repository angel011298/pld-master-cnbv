import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { generateEmbedding } from "@/lib/gemini";
import { parsePDF } from "@/lib/pdf-service";
import { applyRateLimit } from "@/lib/rate-limit";
import { getAuthenticatedUserId, getClientIp, sanitizeFileName, sanitizeText } from "@/lib/security";
import { buildGoogleDriveDownloadUrl } from "@/lib/google-drive";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_DOCS = 3;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = applyRateLimit({
      key: ip,
      route: "ingest-drive",
      limit: 30,
      windowMs: 24 * 60 * 60 * 1000,
    });
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Límite diario alcanzado (30 interacciones). Intenta mañana." },
        { status: 429 }
      );
    }

    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Debes iniciar sesión con Google." }, { status: 401 });
    }

    const payload = (await req.json()) as { fileId?: string; fileName?: string };
    const fileId = typeof payload?.fileId === "string" ? sanitizeText(payload.fileId, 200) : "";
    const rawFileName = typeof payload?.fileName === "string" ? payload.fileName : "";

    if (!fileId) {
      return NextResponse.json(
        { error: "Debes enviar un fileId de Google Drive." },
        { status: 400 }
      );
    }

    const sb = supabaseAdmin();

    // Upsert: if a document with this source_file_id already exists for this user, delete it first
    const { data: existing } = await sb
      .from("documents")
      .select("id")
      .eq("user_id", userId)
      .filter("name", "like", `%drive-${fileId}%`)
      .limit(1);

    // Also check via metadata on embeddings
    const { data: existingByMeta } = await sb
      .from("document_embeddings")
      .select("document_id")
      .eq("user_id", userId)
      .contains("metadata", { source_file_id: fileId })
      .limit(1);

    const existingDocId =
      existingByMeta?.[0]?.document_id ?? existing?.[0]?.id ?? null;

    if (existingDocId) {
      // Cascade deletes embeddings automatically via FK
      await sb.from("documents").delete().eq("id", existingDocId).eq("user_id", userId);
    } else {
      // Only enforce the 3-doc limit when it's a new document (not an update)
      const { count: totalDocuments = 0 } = await sb
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if ((totalDocuments ?? 0) >= MAX_DOCS) {
        return NextResponse.json(
          { error: "Límite alcanzado: máximo 3 documentos por usuario en el plan gratuito." },
          { status: 400 }
        );
      }
    }

    const downloadUrl = buildGoogleDriveDownloadUrl(fileId);
    const driveRes = await fetch(downloadUrl, { method: "GET", redirect: "follow" });
    if (!driveRes.ok) {
      return NextResponse.json(
        { error: "No se pudo descargar el archivo desde Drive. Verifica permisos públicos." },
        { status: 400 }
      );
    }

    const bytes = await driveRes.arrayBuffer();
    const fileSize = bytes.byteLength;
    if (fileSize > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "El archivo excede 5MB." }, { status: 400 });
    }

    const contentType = driveRes.headers.get("content-type") ?? "";
    if (!contentType.includes("pdf")) {
      return NextResponse.json({ error: "Solo se aceptan PDFs de Drive." }, { status: 400 });
    }

    const contentDisposition = driveRes.headers.get("content-disposition") ?? "";
    const extractedName = contentDisposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i)?.[1];
    const documentName = sanitizeFileName(
      decodeURIComponent(extractedName ?? rawFileName ?? `drive-${fileId}.pdf`).replace(/\+/g, " ")
    );

    const pdfData = await parsePDF(Buffer.from(bytes));
    if (pdfData.numpages > 150) {
      return NextResponse.json(
        { error: "El archivo excede el límite de 150 páginas." },
        { status: 400 }
      );
    }

    const fullText = pdfData.text;
    const { data: document, error: docError } = await sb
      .from("documents")
      .insert({
        user_id: userId,
        name: documentName,
        content: fullText,
        file_type: "pdf",
        page_count: pdfData.numpages,
        file_size_bytes: fileSize,
      })
      .select()
      .single();

    if (docError) throw docError;

    const chunkSize = 1000;
    const overlap = 200;
    const chunks: string[] = [];
    for (let i = 0; i < fullText.length; i += chunkSize - overlap) {
      chunks.push(fullText.substring(i, i + chunkSize));
    }

    const entries = await Promise.all(
      chunks.map(async (chunk) => {
        const embedding = await generateEmbedding(chunk);
        return {
          document_id: document.id,
          user_id: userId,
          content: chunk,
          embedding,
          metadata: {
            source: documentName,
            source_file_id: fileId,
            page_count: pdfData.numpages,
          },
        };
      })
    );

    const { error: embedError } = await sb.from("document_embeddings").insert(entries);
    if (embedError) throw embedError;

    return NextResponse.json({
      success: true,
      documentId: document.id,
      chunks: chunks.length,
      updated: !!existingDocId,
      source: "google-drive",
    });
  } catch (error: unknown) {
    console.error("Drive ingestion error:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
