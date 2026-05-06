#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    "❌ Error: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const DATA_DIR = path.join(process.cwd(), "data/educational-content");
const EJERCICIOS_DIR = path.join(process.cwd(), "data/ejercicios");

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    return null;
  }
}

function getFiles(directory, pattern) {
  try {
    if (!fs.existsSync(directory)) {
      console.warn(`⚠️  Directorio no existe: ${directory}`);
      return [];
    }
    return fs
      .readdirSync(directory)
      .filter((file) => file.match(pattern))
      .map((file) => path.join(directory, file));
  } catch (error) {
    console.error(`❌ Error reading directory ${directory}:`, error.message);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Educational Content Insertion
// ─────────────────────────────────────────────────────────────────────────────

async function insertEducationalContent() {
  console.log("\n📚 Insertando contenido educativo...\n");

  const files = getFiles(DATA_DIR, /^bloque\d+\.json$|^gafi\.json$/);

  if (files.length === 0) {
    console.log("⚠️  No hay archivos de contenido educativo para insertar");
    return;
  }

  for (const filePath of files) {
    const fileName = path.basename(filePath);
    const data = readJsonFile(filePath);

    if (!data) continue;

    const bloqueNum = data.bloque || 0;
    const tema = data.tema || "Sin tema";
    const contenidos = data.contenido || [];

    let insertCount = 0;
    let errorCount = 0;

    for (const item of contenidos) {
      try {
        const { error } = await supabase
          .from("educational_content")
          .upsert(
            {
              bloque: bloqueNum,
              tema: tema,
              subtema: item.subtema || "",
              tipo: item.tipo || "explicacion",
              contenido: item.contenido || {},
              fuente_detallada: item.fuente_detallada || null,
              orden: item.orden || 0,
            },
            {
              onConflict: "bloque,subtema,tipo",
            }
          );

        if (error) {
          console.error(
            `  ❌ Error insertando subtema "${item.subtema}":`,
            error.message
          );
          errorCount++;
        } else {
          insertCount++;
        }
      } catch (err) {
        console.error(`  ❌ Error procesando subtema:`, err.message);
        errorCount++;
      }
    }

    const status = errorCount > 0 ? `⚠️` : `✅`;
    console.log(
      `${status} ${fileName}: ${insertCount} registros insertados${errorCount > 0 ? `, ${errorCount} errores` : ""}`
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Ejercicios Insertion
// ─────────────────────────────────────────────────────────────────────────────

async function insertEjercicios() {
  console.log("\n🎯 Insertando ejercicios didácticos...\n");

  const files = getFiles(EJERCICIOS_DIR, /^ejercicios-bloque\d+\.json$|^ejercicios-gafi\.json$/);

  if (files.length === 0) {
    console.log("⚠️  No hay archivos de ejercicios para insertar");
    return;
  }

  for (const filePath of files) {
    const fileName = path.basename(filePath);
    const data = readJsonFile(filePath);

    if (!data) continue;

    const bloqueNum = data.bloque || 0;
    const tema = data.tema || "Sin tema";
    const ejercicios = data.ejercicios || [];

    let insertCount = 0;
    let errorCount = 0;

    for (const ejercicio of ejercicios) {
      try {
        const { error } = await supabase
          .from("ejercicios_didacticos")
          .upsert(
            {
              bloque: bloqueNum,
              tema: tema,
              tipo: ejercicio.tipo || "caso_practico",
              titulo: ejercicio.titulo || "Sin título",
              instrucciones: ejercicio.instrucciones || "",
              contenido: ejercicio.contenido || {},
              solucion: ejercicio.solucion || {},
              dificultad: ejercicio.dificultad || "medio",
              tiempo_estimado: ejercicio.tiempo_estimado || 10,
            },
            {
              onConflict: "bloque,titulo",
            }
          );

        if (error) {
          console.error(
            `  ❌ Error insertando ejercicio "${ejercicio.titulo}":`,
            error.message
          );
          errorCount++;
        } else {
          insertCount++;
        }
      } catch (err) {
        console.error(`  ❌ Error procesando ejercicio:`, err.message);
        errorCount++;
      }
    }

    const status = errorCount > 0 ? `⚠️` : `✅`;
    console.log(
      `${status} ${fileName}: ${insertCount} ejercicios insertados${errorCount > 0 ? `, ${errorCount} errores` : ""}`
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║  Insertor de Contenido Educativo — Certifik PLD           ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  try {
    await insertEducationalContent();
    await insertEjercicios();

    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║  ✅ Inserción completada                                  ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");
  } catch (error) {
    console.error("\n❌ Error fatal:", error.message);
    process.exit(1);
  }
}

main();
