// insert-quiz-bank.mjs
// Inserts all quiz bank questions into Supabase quiz_bank table.
// Usage: node scripts/insert-quiz-bank.mjs
// Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

import { quizPart1 } from './generate-quiz-bank-part1.mjs';
import { quizPart2 } from './generate-quiz-bank-part2.mjs';
import { quizPart3 } from './generate-quiz-bank-part3.mjs';
import { quizPart4 } from './generate-quiz-bank-part4.mjs';
import { quizPart5 } from './generate-quiz-bank-part5.mjs';
import { quizPart6 } from './generate-quiz-bank-part6.mjs';
import { quizPart7 } from './generate-quiz-bank-part7.mjs';

// ── Env loader ────────────────────────────────────────────────────────────────
function loadEnv() {
  const __dir = dirname(fileURLToPath(import.meta.url));
  // Walk up from scripts/ until we find .env.local (supports worktrees)
  let dir = resolve(__dir, '..');
  let raw;
  for (let i = 0; i < 6; i++) {
    const candidate = resolve(dir, '.env.local');
    try {
      raw = readFileSync(candidate, 'utf8');
      break;
    } catch {
      const parent = resolve(dir, '..');
      if (parent === dir) break;
      dir = parent;
    }
  }
  if (!raw) throw new Error('.env.local not found in any parent directory');
  const env = {};
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    env[key] = val;
  }
  return env;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // 1. Load credentials
  const env = loadEnv();
  const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
  const serviceKey  = env['SUPABASE_SERVICE_ROLE_KEY'];

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  }

  // 2. Combine all parts
  const allQuestions = [
    ...quizPart1,
    ...quizPart2,
    ...quizPart3,
    ...quizPart4,
    ...quizPart5,
    ...quizPart6,
    ...quizPart7,
  ];

  console.log(`Total: ${allQuestions.length} preguntas`);

  // 3. Validate structure before touching the DB
  const invalid = allQuestions.filter(
    (q) =>
      !q.pregunta ||
      !Array.isArray(q.opciones) ||
      q.opciones.length !== 4 ||
      typeof q.respuesta_correcta !== 'number' ||
      !q.explicacion ||
      !q.tema ||
      !q.dificultad ||
      !q.fuente
  );
  if (invalid.length > 0) {
    throw new Error(`${invalid.length} preguntas tienen campos inválidos. Abortando.`);
  }
  console.log('Validación local: OK');

  // 4. Connect (service role bypasses RLS)
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // 5. Clear existing rows (idempotent re-run)
  console.log('Limpiando filas existentes en quiz_bank...');
  const { error: delErr } = await supabase.from('quiz_bank').delete().neq('id', 0);
  if (delErr) throw new Error(`Error al limpiar tabla: ${delErr.message}`);

  // 6. Insert in batches of 50 to stay within request limits
  const BATCH = 50;
  let inserted = 0;

  for (let i = 0; i < allQuestions.length; i += BATCH) {
    const batch = allQuestions.slice(i, i + BATCH).map((q) => ({
      pregunta:           q.pregunta,
      opciones:           q.opciones,           // stored as jsonb
      respuesta_correcta: q.respuesta_correcta,
      explicacion:        q.explicacion,
      tema:               q.tema,
      dificultad:         q.dificultad,
      fuente:             q.fuente,
    }));

    const { error } = await supabase.from('quiz_bank').insert(batch);
    if (error) {
      throw new Error(`Error en batch ${i / BATCH + 1}: ${error.message}`);
    }
    inserted += batch.length;
    console.log(`  → ${inserted}/${allQuestions.length} insertadas...`);
  }

  // 7. Final verification
  const { count, error: countErr } = await supabase
    .from('quiz_bank')
    .select('*', { count: 'exact', head: true });

  if (countErr) throw new Error(`Error al verificar conteo: ${countErr.message}`);

  console.log(`\n✅ ${inserted} preguntas insertadas correctamente`);
  console.log(`   Filas en quiz_bank: ${count}`);
}

main().catch((err) => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
