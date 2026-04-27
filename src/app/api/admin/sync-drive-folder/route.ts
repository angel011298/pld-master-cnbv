import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { generateEmbedding } from "@/lib/gemini";
import { parsePDF } from "@/lib/pdf-service";
import { listPdfsInFolder, buildGoogleDriveDownloadUrl } from "@/lib/google-drive";

// El ID de la carpeta principal proporcionada
const GLOBAL_FOLDER_ID = "1X7uJ3TBUvR4PYxkeakKoakl3a1HuFZ_Y";
// Identificador especial para diferenciar documentos globales oficiales de los de usuarios
const GLOBAL_ADMIN_USER_ID = "00000000-0000-0000-0000-000000000000"; 

export async function POST(req: NextRequest) {
  try {
    // 1. Validar que quien llama es el Superadmin
    // (Asegúrate de implementar tu propia verificación de admin aquí)
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_DRIVE_API_KEY no configurada");

    const sb = supabaseAdmin();

    // 2. Listar todos los PDFs en la carpeta de la CNBV
    const files = await listPdfsInFolder(GLOBAL_FOLDER_ID, apiKey);

    let processed = 0;
    
    // 3. Iterar e ingestar cada archivo
    for (const file of files) {
      // Eliminar versión anterior del documento si existe
      await sb.from("documents")
        .delete()
        .eq("user_id", GLOBAL_ADMIN_USER_ID)
        .filter("name", "eq", file.name);

      const downloadUrl = buildGoogleDriveDownloadUrl(file.id);
      const driveRes = await fetch(downloadUrl);
      
      if (!driveRes.ok) continue;

      const bytes = await driveRes.arrayBuffer();
      const pdfData = await parsePDF(Buffer.from(bytes));
      
      // Guardar registro del documento
      const { data: document, error: docError } = await sb
        .from("documents")
        .insert({
          user_id: GLOBAL_ADMIN_USER_ID,
          name: file.name,
          content: pdfData.text,
          file_type: "pdf",
          page_count: pdfData.numpages,
          file_size_bytes: file.size,
          is_global: true // <-- Recomendado: Agregar esta columna booleana en tu BD
        })
        .select().single();

      if (docError) throw docError;

      // Generar y guardar embeddings (Chunks)
      const chunkSize = 1000;
      const overlap = 200;
      const chunks: string[] = [];
      for (let i = 0; i < pdfData.text.length; i += chunkSize - overlap) {
        chunks.push(pdfData.text.substring(i, i + chunkSize));
      }

      const entries = await Promise.all(
        chunks.map(async (chunk) => {
          const embedding = await generateEmbedding(chunk);
          return {
            document_id: document.id,
            user_id: GLOBAL_ADMIN_USER_ID,
            content: chunk,
            embedding,
            metadata: { source: file.name, official_cnbv: true },
          };
        })
      );

      await sb.from("document_embeddings").insert(entries);
      processed++;
    }

    return NextResponse.json({
      success: true,
      message: `Sincronización completada. ${processed} documentos oficiales ingestados.`,
    });
  } catch (error: any) {
    console.error("Error sincronizando carpeta CNBV:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}