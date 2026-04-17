import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { applyRateLimit } from "@/lib/rate-limit";
import { getAuthenticatedUserId, getClientIp, sanitizeText } from "@/lib/security";
import {
  extractGoogleDriveFolderId,
  isGoogleDriveUrl,
  listPdfsInFolder,
} from "@/lib/google-drive";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_DOCS = 3;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = applyRateLimit({
      key: ip,
      route: "list-drive-folder",
      limit: 60,
      windowMs: 24 * 60 * 60 * 1000,
    });
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Límite diario alcanzado. Intenta mañana." },
        { status: 429 }
      );
    }

    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Debes iniciar sesión con Google." }, { status: 401 });
    }

    const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_DRIVE_API_KEY no está configurada en el servidor." },
        { status: 500 }
      );
    }

    const payload = (await req.json()) as { folderUrl?: string };
    const folderUrl = typeof payload?.folderUrl === "string"
      ? sanitizeText(payload.folderUrl, 500)
      : "";

    if (!folderUrl || !isGoogleDriveUrl(folderUrl)) {
      return NextResponse.json(
        { error: "Debes enviar una URL válida de carpeta de Google Drive." },
        { status: 400 }
      );
    }

    const folderId = extractGoogleDriveFolderId(folderUrl);
    if (!folderId) {
      return NextResponse.json(
        { error: "No se pudo extraer el ID de la carpeta. Usa un link de carpeta compartida." },
        { status: 400 }
      );
    }

    const sb = supabaseAdmin();
    const { count: existingCount } = await sb
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    const slotsAvailable = MAX_DOCS - (existingCount ?? 0);

    const allFiles = await listPdfsInFolder(folderId, apiKey);

    const files = allFiles.map((f) => ({
      id: f.id,
      name: f.name,
      size: f.size,
      sizeLabel: formatBytes(f.size),
      eligible: f.size <= MAX_FILE_BYTES,
      reason: f.size > MAX_FILE_BYTES ? "Excede 5MB" : null,
    }));

    return NextResponse.json({
      files,
      slotsAvailable,
      totalFound: files.length,
    });
  } catch (error: unknown) {
    console.error("list-drive-folder error:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
