#!/usr/bin/env node
/**
 * generate-sopas.mjs
 * Generates enhanced "sopa de letras" (word-search) exercises for PLD-master bloques 1-7.
 * Words are placed in all 8 directions (horizontal, vertical, and all diagonals).
 * Run: node scripts/generate-sopas.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR  = join(__dirname, '..', 'data', 'ejercicios');

const GRID_SIZE = 17; // fits words up to 17 characters

// Spanish-weighted fill letters (no accents, common in Spanish)
const FILL = 'AAABCDEEEEEEFGHIIIJKLLLLMNNNOOOPRRRSSSSTTTUUUVYZ';

// ─── Seeded LCG random ────────────────────────────────────────────────────────
function mkRand(seed) {
  let s = seed >>> 0;
  return () => {
    s = ((Math.imul(1664525, s) + 1013904223) | 0) >>> 0;
    return s / 0x100000000;
  };
}

function shuffle(arr, rand) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── All 8 placement directions ───────────────────────────────────────────────
const DIRS_DIAG = [
  { dr:  1, dc:  1, name: 'diagonal-dr' },
  { dr:  1, dc: -1, name: 'diagonal-dl' },
  { dr: -1, dc:  1, name: 'diagonal-ur' },
  { dr: -1, dc: -1, name: 'diagonal-ul' },
];
const DIRS_STRAIGHT = [
  { dr:  0, dc:  1, name: 'horizontal'     },
  { dr:  0, dc: -1, name: 'horizontal-inv' },
  { dr:  1, dc:  0, name: 'vertical'       },
  { dr: -1, dc:  0, name: 'vertical-inv'   },
];
const DIRS = [...DIRS_DIAG, ...DIRS_STRAIGHT];

// ─── Core generator ───────────────────────────────────────────────────────────
const MIN_DIAG = 4; // Guarantee at least this many diagonal words per grid

function buildGrid(words, seed) {
  const rand    = mkRand(seed);
  const grid    = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
  const placed  = {};                        // word → { fila, columna, direccion }
  const sorted  = [...words].sort((a, b) => b.length - a.length); // longest first

  let diagPlaced = 0;

  const tryPlaceWord = (word, dirList) => {
    const dirs = shuffle(dirList, rand);
    outer:
    for (let attempt = 0; attempt < 900; attempt++) {
      const dir = dirs[attempt % dirs.length];
      const r   = Math.floor(rand() * GRID_SIZE);
      const c   = Math.floor(rand() * GRID_SIZE);

      // Boundary check
      const er = r + dir.dr * (word.length - 1);
      const ec = c + dir.dc * (word.length - 1);
      if (er < 0 || er >= GRID_SIZE || ec < 0 || ec >= GRID_SIZE) continue;

      // Conflict check
      for (let i = 0; i < word.length; i++) {
        const cell = grid[r + dir.dr * i][c + dir.dc * i];
        if (cell !== null && cell !== word[i]) continue outer;
      }

      // Place
      for (let i = 0; i < word.length; i++) {
        grid[r + dir.dr * i][c + dir.dc * i] = word[i];
      }
      placed[word] = { fila: r + 1, columna: c + 1, direccion: dir.name };
      if (dir.name.startsWith('diagonal')) diagPlaced++;
      return true;
    }
    return false;
  };

  for (const word of sorted) {
    // For short-to-medium words when we still need diagonals, try diagonal first
    const needDiag = diagPlaced < MIN_DIAG && word.length <= 13;
    let ok = needDiag ? tryPlaceWord(word, DIRS_DIAG) : false;
    if (!ok) ok = tryPlaceWord(word, DIRS);
    if (!ok) process.stderr.write(`  WARN: no pudo colocar "${word}"\n`);
  }

  // Fill remaining cells with weighted random letters
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === null) {
        grid[r][c] = FILL[Math.floor(rand() * FILL.length)];
      }
    }
  }

  return {
    cuadricula:     grid.map(row => row.join(' ')),
    palabras_ocultas: words,
    ubicaciones:    placed,
  };
}

// ─── Exercise definitions ──────────────────────────────────────────────────────
// Words: uppercase, NO accent marks (ñ/accented vowels avoided), no typos.
// Sorted longest-first by the generator automatically.

const BLOQUES = [
  {
    num:  1,
    seed: 1101,
    tema: 'El Lavado de Dinero y el Financiamiento al Terrorismo',
    titulo: 'Sopa de letras avanzada: Tipologías y conceptos del lavado de dinero',
    instrucciones: 'Encuentra las 16 palabras ocultas sobre el lavado de dinero y sus etapas. Las palabras pueden ir en dirección horizontal, vertical o diagonal — ¡incluso al revés!',
    words: [
      'ESTRATIFICACION',   // 15 — layering (stage 2)
      'PRESTANOMBRES',     // 13 — nominee
      'NARCOTRAFICO',      // 12 — drug trafficking
      'SIMULACION',        // 10 — simulation
      'CORRUPCION',        // 10 — corruption
      'SOSPECHOSA',        // 10 — suspicious
      'TIPOLOGIA',         //  9 — typology
      'EFECTIVO',          //  8 — cash
      'EVASION',           //  7 — evasion
      'INUSUAL',           //  7 — unusual
      'LAVADO',            //  6 — laundering
      'FRAUDE',            //  6 — fraud
      'DINERO',            //  6 — money
      'COLOCACION',        // 10 — placement (stage 1)
      'INTEGRACION',       // 11 — integration (stage 3)
      'TESTAFERRO',        // 10 — straw man
    ],
  },
  {
    num:  2,
    seed: 2202,
    tema: 'Organismos y Foros Internacionales que Participan en PLD y FT',
    titulo: 'Sopa de letras avanzada: Organismos y estándares internacionales',
    instrucciones: 'Localiza los 15 términos internacionales de prevención de lavado de dinero y financiamiento al terrorismo. Las palabras pueden ir en cualquier dirección.',
    words: [
      'RECOMENDACIONES',   // 15 — FATF 40 recommendations
      'CORRESPONSAL',      // 12 — correspondent banking
      'JURISDICCION',      // 12 — jurisdiction
      'INTELIGENCIA',      // 12 — intelligence (UIF)
      'EFECTIVIDAD',       // 11 — effectiveness
      'EVALUACION',        // 10 — mutual evaluation
      'CONVENCION',        // 10 — convention
      'RESOLUCION',        // 10 — UN Security Council resolution
      'WOLFSBERG',         //  9 — Wolfsberg Group
      'BASILEA',           //  7 — Basel Committee
      'GAFILAT',           //  7 — FATF-style body Latin America
      'PALERMO',           //  7 — Palermo Convention
      'EGMONT',            //  6 — Egmont Group
      'VIENA',             //  5 — Vienna Convention
      'GAFI',              //  4 — FATF
    ],
  },
  {
    num:  3,
    seed: 3303,
    tema: 'Marco Legal en México',
    titulo: 'Sopa de letras: Marco legal mexicano PLD/FT',
    instrucciones: 'Encuentra los 15 términos del marco legal mexicano para la prevención e identificación de operaciones con recursos de procedencia ilícita.',
    words: [
      'CUENTAHABIENTE',    // 14 — account holder
      'TIPIFICACION',      // 12 — criminalization
      'FIDEICOMISO',       // 11 — trust
      'SUPERVISION',       // 11 — supervision
      'OBLIGACION',        // 10 — obligation
      'REGULACION',        // 10 — regulation
      'COMPLIANCE',        // 10 — compliance (loanword)
      'LFPIORPI',          //  8 — Mexico AML law acronym
      'CORREDOR',          //  8 — broker
      'CONTABLE',          //  8 — accountant
      'CONDUCTA',          //  8 — conduct
      'REPORTE',           //  7 — report
      'NOTARIO',           //  7 — notary
      'SANCION',           //  7 — sanction
      'LAVADO',            //  6 — laundering
    ],
  },
  {
    num:  4,
    seed: 4404,
    tema: 'Sujetos Obligados, Instituciones Financieras y Actividades Vulnerables',
    titulo: 'Sopa de letras: Sujetos obligados y entidades financieras',
    instrucciones: 'Encuentra los 15 términos sobre sujetos obligados, instituciones del sistema financiero mexicano y entidades supervisadas por la CNBV.',
    words: [
      'FISCALIZACION',     // 13 — oversight/audit
      'ALMACENADORA',      // 12 — warehousing company
      'CONTROLADORA',      // 12 — holding company
      'ASEGURADORA',       // 11 — insurance company
      'ARRENDADORA',       // 11 — leasing company
      'TRANSMISORA',       // 11 — money transfer company
      'SUPERVISION',       // 11 — supervision
      'FIDUCIARIA',        // 10 — fiduciary/trust
      'AUTORIDAD',         //  9 — authority
      'FACTORAJE',         //  9 — factoring
      'BURSATIL',          //  8 — stock market
      'ENTIDAD',           //  7 — entity
      'SOFIPO',            //  6 — popular financial company
      'SOFOM',             //  5 — multi-purpose financial company
      'BANCO',             //  5 — bank
    ],
  },
  {
    num:  5,
    seed: 5505,
    tema: 'Conocimiento del Cliente (KYC/CDD) y Debida Diligencia',
    titulo: 'Sopa de letras: Conocimiento del cliente y debida diligencia',
    instrucciones: 'Localiza los 15 términos esenciales del proceso de conocimiento del cliente (KYC), debida diligencia y gestión del riesgo en instituciones financieras.',
    words: [
      'SIMPLIFICADA',      // 12 — simplified due diligence
      'CUESTIONARIO',      // 12 — questionnaire
      'VERIFICACION',      // 12 — verification
      'BENEFICIARIO',      // 12 — beneficial owner
      'PROPIETARIO',       // 11 — owner
      'EXPEDIENTE',        // 10 — customer file
      'DILIGENCIA',        // 10 — diligence
      'BIOMETRICO',        // 10 — biometric
      'IDENTIDAD',         //  9 — identity
      'MONITOREO',         //  9 — monitoring
      'FIDEDIGNO',         //  9 — reliable/trustworthy
      'REFORZADA',         //  9 — enhanced (due diligence)
      'CLIENTE',           //  7 — client
      'PERFIL',            //  6 — risk profile
      'RIESGO',            //  6 — risk
    ],
  },
  {
    num:  6,
    seed: 6606,
    tema: 'Reportes y Controles Internos',
    titulo: 'Sopa de letras: Reportes obligatorios y controles PLD/FT',
    instrucciones: 'Encuentra los 15 términos sobre los reportes obligatorios, controles internos y mecanismos de detección en el sistema PLD/FT mexicano.',
    words: [
      'TRANSFERENCIA',     // 13 — wire transfer
      'CONGELAMIENTO',     // 13 — asset freezing
      'AUTOMATIZADO',      // 12 — automated monitoring
      'CUMPLIMIENTO',      // 12 — compliance
      'PREOCUPANTE',       // 11 — concerning operation
      'MONITOREO',         //  9 — ongoing monitoring
      'BITACORA',          //  8 — logbook/registry
      'EFECTIVO',          //  8 — cash
      'DETECTAR',          //  8 — to detect
      'BLOQUEO',           //  7 — blocking/freeze
      'INUSUAL',           //  7 — unusual operation
      'REPORTE',           //  7 — report
      'RECHAZO',           //  7 — rejection
      'UMBRAL',            //  6 — threshold
      'ALERTA',            //  6 — alert/flag
    ],
  },
  {
    num:  7,
    seed: 7707,
    tema: 'Personas Políticamente Expuestas (PEP) y Tipologías Avanzadas',
    titulo: 'Sopa de letras: PEPs, tipologías avanzadas y financiamiento al terrorismo',
    instrucciones: 'Localiza los 15 términos sobre personas políticamente expuestas, tipologías avanzadas de lavado de dinero y financiamiento al terrorismo.',
    words: [
      'ENRIQUECIMIENTO',   // 15 — illicit enrichment
      'FINANCIAMIENTO',    // 14 — terrorist financing
      'PRESTANOMBRES',     // 13 — nominee/straw man
      'PROLIFERACION',     // 13 — WMD proliferation financing
      'FIDEICOMISO',       // 11 — trust (used in typologies)
      'COLABORADOR',       // 11 — close associate of PEP
      'ACCIONISTA',        // 10 — shareholder
      'CORRUPCION',        // 10 — corruption
      'TESTAFERRO',        // 10 — front person
      'SANCIONES',         //  9 — sanctions lists
      'POLITICO',          //  8 — politically exposed
      'EXPUESTO',          //  8 — exposed person (PEP)
      'FAMILIAR',          //  8 — family member of PEP
      'OFFSHORE',          //  8 — offshore entity
      'PARAISO',           //  7 — tax haven (paraíso fiscal)
    ],
  },
];

// ─── Main ──────────────────────────────────────────────────────────────────────
let totalErrors = 0;

for (const bloque of BLOQUES) {
  process.stdout.write(`\nBloque ${bloque.num} — ${bloque.words.length} palabras, seed=${bloque.seed}\n`);

  const { cuadricula, palabras_ocultas, ubicaciones } = buildGrid(bloque.words, bloque.seed);

  // Verify
  const missing = bloque.words.filter(w => !ubicaciones[w]);
  if (missing.length > 0) {
    process.stderr.write(`  ERROR palabras sin colocar: ${missing.join(', ')}\n`);
    totalErrors += missing.length;
  } else {
    process.stdout.write(`  OK — todas colocadas\n`);
  }

  // Direction summary
  const dirCount = {};
  for (const loc of Object.values(ubicaciones)) {
    dirCount[loc.direccion] = (dirCount[loc.direccion] || 0) + 1;
  }
  process.stdout.write(`  Direcciones: ${JSON.stringify(dirCount)}\n`);

  const exercise = {
    bloque:       bloque.num,
    tema:         bloque.tema,
    tipo:         'sopa_letras',
    titulo:       bloque.titulo,
    instrucciones: bloque.instrucciones,
    contenido: {
      cuadricula,
      palabras_ocultas,
    },
    solucion: { ubicaciones },
    dificultad:      'medio',
    tiempo_estimado: 12,
  };

  const filePath = join(DATA_DIR, `bloque${bloque.num}-ejercicios.json`);
  const existing = JSON.parse(readFileSync(filePath, 'utf-8'));
  existing.push(exercise);
  writeFileSync(filePath, JSON.stringify(existing, null, 2), 'utf-8');
  process.stdout.write(`  Escrito → ${filePath}\n`);
}

if (totalErrors > 0) {
  process.stdout.write(`\nFINALIZADO CON ${totalErrors} ERROR(ES)\n`);
  process.exit(1);
} else {
  process.stdout.write('\nTodo listo — sin errores.\n');
}
