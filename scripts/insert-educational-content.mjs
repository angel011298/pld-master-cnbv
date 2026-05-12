#!/usr/bin/env node
/**
 * Script para insertar contenido educativo pre-generado en Supabase
 * Run: node scripts/insert-educational-content.mjs
 */

import { readFileSync, existsSync, readdirSync } from "fs";
import { createClient } from "@supabase/supabase-js";

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

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function insertEducationalContent(filePath) {
  const fileName = filePath.split("/").pop();
  console.log(`\n📚 Procesando: ${fileName}`);

  if (!existsSync(filePath)) {
    console.log(`   ⚠️  Archivo no encontrado: ${filePath}`);
    return 0;
  }

  const data = JSON.parse(readFileSync(filePath, "utf-8"));
  let inserted = 0;
  let errors = 0;

  for (const item of data) {
    const { error } = await sb
      .from("educational_content")
      .upsert(
        {
          bloque: item.bloque,
          tema: item.tema,
          subtema: item.subtema,
          tipo: item.tipo,
          contenido: item.contenido,
          fuente_detallada: item.fuente_detallada,
          orden: item.orden,
        },
        { onConflict: "bloque,subtema,tipo" }
      );

    if (error) {
      console.log(`   ❌ Error en "${item.subtema}" (${item.tipo}): ${error.message}`);
      errors++;
    } else {
      inserted++;
    }
  }

  console.log(`   ✅ ${inserted} registros insertados, ${errors} errores`);
  return inserted;
}

async function insertEjercicios(filePath) {
  const fileName = filePath.split("/").pop();
  console.log(`\n🎯 Procesando ejercicios: ${fileName}`);

  if (!existsSync(filePath)) {
    console.log(`   ⚠️  Archivo no encontrado: ${filePath}`);
    return 0;
  }

  const data = JSON.parse(readFileSync(filePath, "utf-8"));
  let inserted = 0;
  let errors = 0;

  for (const item of data) {
    const { error } = await sb
      .from("ejercicios_didacticos")
      .upsert(
        {
          bloque: item.bloque,
          tema: item.tema,
          tipo: item.tipo,
          titulo: item.titulo,
          instrucciones: item.instrucciones,
          contenido: item.contenido,
          solucion: item.solucion,
          dificultad: item.dificultad,
          tiempo_estimado: item.tiempo_estimado,
        },
        { onConflict: "bloque,titulo" }
      );

    if (error) {
      console.log(`   ❌ Error en "${item.titulo}": ${error.message}`);
      errors++;
    } else {
      inserted++;
    }
  }

  console.log(`   ✅ ${inserted} ejercicios insertados, ${errors} errores`);
  return inserted;
}

async function main() {
  console.log("🚀 Insertando contenido educativo pre-generado en Supabase...\n");

  const contentFiles = [
    "data/educational-content/bloque1-educational.json",
    "data/educational-content/bloque2-educational.json",
    "data/educational-content/bloque3-educational.json",
    "data/educational-content/bloque4-educational.json",
    "data/educational-content/bloque5-educational.json",
    "data/educational-content/bloque6-educational.json",
    "data/educational-content/bloque7-educational.json",
    "data/educational-content/gafi-educational.json",
  ];

  const ejerciciosFiles = [
    "data/ejercicios/bloque1-ejercicios.json",
    "data/ejercicios/bloque2-ejercicios.json",
    "data/ejercicios/bloque3-ejercicios.json",
    "data/ejercicios/bloque4-ejercicios.json",
    "data/ejercicios/bloque5-ejercicios.json",
    "data/ejercicios/bloque6-ejercicios.json",
    "data/ejercicios/bloque7-ejercicios.json",
    "data/ejercicios/gafi-ejercicios.json",
  ];

  let totalContent = 0;
  let totalEjercicios = 0;

  for (const file of contentFiles) {
    totalContent += await insertEducationalContent(file);
  }

  for (const file of ejerciciosFiles) {
    totalEjercicios += await insertEjercicios(file);
  }

  console.log("\n" + "=".repeat(50));
  console.log(`✨ RESUMEN FINAL:`);
  console.log(`   📚 Contenido educativo: ${totalContent} registros`);
  console.log(`   🎯 Ejercicios didácticos: ${totalEjercicios} registros`);
  console.log("=".repeat(50));
}

main().catch((err) => {
  console.error("❌ Error fatal:", err.message);
  process.exit(1);
});
