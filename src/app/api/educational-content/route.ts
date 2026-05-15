import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

// Map bloque number → JSON file(s) for educational content
// Multiple files are merged in order (first file wins for duplicate subtema+tipo)
const BLOQUE_FILES: Record<number, string[]> = {
  1: ["bloque1-educational.json"],
  2: ["bloque2-educational.json", "gafi-educational.json"],
  3: ["bloque3-educational.json"],
  4: ["bloque4-educational.json"],
  5: ["bloque5-educational.json"],
  6: ["bloque6-educational.json"],
  7: ["bloque7-educational.json"],
};

const EJERCICIOS_FILES: Record<number, string> = {
  1: "bloque1-ejercicios.json",
  2: "bloque2-ejercicios.json",
  3: "bloque3-ejercicios.json",
  4: "bloque4-ejercicios.json",
  5: "bloque5-ejercicios.json",
  6: "bloque6-ejercicios.json",
  7: "bloque7-ejercicios.json",
};

function readJsonFile(dir: string, filename: string): unknown[] {
  try {
    const fullPath = path.join(dir, filename);
    if (!fs.existsSync(fullPath)) return [];
    const raw = fs.readFileSync(fullPath, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const bloque = request.nextUrl.searchParams.get("bloque");

  if (!bloque) {
    return NextResponse.json({ error: "Parámetro 'bloque' requerido" }, { status: 400 });
  }

  const bloqueNum = parseInt(bloque, 10);
  if (isNaN(bloqueNum) || bloqueNum < 1 || bloqueNum > 10) {
    return NextResponse.json({ error: "Bloque inválido" }, { status: 400 });
  }

  const contentDir = path.join(process.cwd(), "data", "educational-content");
  const ejerciciosDir = path.join(process.cwd(), "data", "ejercicios");

  // Read content from JSON files — merge multiple files for same bloque
  const contentFiles = BLOQUE_FILES[bloqueNum] ?? [];
  const rawContent = contentFiles.flatMap((f) => readJsonFile(contentDir, f));

  // Normalize: assign synthetic IDs and ensure orden
  const content = rawContent.map((item, idx) => {
    const it = item as Record<string, unknown>;
    return {
      id: it.id ?? idx + 1,
      bloque: it.bloque ?? bloqueNum,
      tema: it.tema ?? "",
      subtema: it.subtema ?? "",
      tipo: it.tipo ?? "explicacion",
      contenido: it.contenido ?? {},
      fuente_detallada: it.fuente_detallada ?? "",
      orden: it.orden ?? idx,
    };
  });

  // Read ejercicios
  const ejerciciosFile = EJERCICIOS_FILES[bloqueNum];
  const ejercicios = ejerciciosFile
    ? (readJsonFile(ejerciciosDir, ejerciciosFile) as Record<string, unknown>[]).map((e, idx) => ({
        id: e.id ?? idx + 1,
        bloque: e.bloque ?? bloqueNum,
        tema: e.tema ?? "",
        tipo: e.tipo ?? "",
        titulo: e.titulo ?? "",
        instrucciones: e.instrucciones ?? "",
        contenido: e.contenido ?? {},
        solucion: e.solucion ?? {},
        dificultad: e.dificultad ?? "basico",
        tiempo_estimado: e.tiempo_estimado ?? 5,
      }))
    : [];

  return NextResponse.json({
    content,
    ejercicios,
    contentError: null,
    ejerciciosError: null,
  });
}
