# PLD-Master Scripts

Herramientas de línea de comandos para ingesta de PDFs, generación de reactivos y mantenimiento de la base de datos.

---

## 1. Seed Global Documents (18 PDFs CNBV)

**Archivo**: `seed-global-documents.mjs`

Descarga 18 PDFs oficiales de CNBV desde Google Drive, extrae texto, crea chunks y genera embeddings globales.

```bash
npm run seed
# o
node scripts/seed-global-documents.mjs
```

**Requisitos**:
- `.env.local` con:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `GEMINI_API_KEY`

**Output**:
- Ingesta 18 PDFs a `documents` table (is_global=true)
- Crea embeddings en `document_embeddings` (768 dims, Gemini)
- Logs: "✅ X fragmentos" por cada PDF

**Tiempo**: ~5-10 minutos (respeta rate limits de Gemini)

---

## 2. Batch Ingest Local PDFs

**Archivo**: `batch-ingest.ts`

Procesa PDFs desde una carpeta local con detección automática de tema, chunking inteligente y deduplicación.

```bash
npm run batch-ingest -- --folder ./docs/cnbv
# o
npx tsx scripts/batch-ingest.ts --folder ./docs/cnbv
```

**Requisitos**:
- Carpeta con PDFs (e.g., `./docs/cnbv/`)
- `.env.local` (mismo que seed)

**Features**:
- Respeta párrafos completos + oraciones (no corta a mitad de texto)
- Detección automática de tema por keywords (7 categorías)
- Deduplicación por SHA-256 del chunk
- Embeddings en batches de 5 (amigable con rate limits)
- Manejo de PDFs grandes (>10 MB) e imágenes (sin texto extraíble)

**Output**:
- Inserta en `documents` (is_global=true)
- Crea embeddings en `document_embeddings`
- Logs por archivo con conteo de chunks

**Tiempo**: ~30 seg por PDF (depende del tamaño)

---

## 3. Generate Quiz Bank (200+ Reactivos)

**Archivo**: `generate-quiz-bank.ts`

Genera 200+ preguntas de examen usando Gemini 1.5-Pro basadas en chunks relevantes de los documentos.

```bash
npm run generate-quiz
# o
npx tsx scripts/generate-quiz-bank.ts
```

**Requisitos**:
- `.env.local` (mismo que seed)
- `document_embeddings` pre-poblada (por seed o batch-ingest)
- Gemini API key válida (necesita dinero para Pro model)

**Process**:
1. Para cada tema (7 tópicos):
   - Incrusta descripción del tema
   - Vector search: top 20 chunks más relevantes
   - Llama Gemini 1.5-Pro para generar 30 preguntas
   - Valida cada pregunta (respuesta única, opciones únicas, cita legal)
   - Detecta duplicados por hash de pregunta
2. Inserta en batches de 50 en `quiz_bank`
3. Imprime resumen con conteo por tema y dificultad

**Output**:
- `quiz_bank` table con 200+ registros
- Summary table mostrando preguntas por tema y nivel
- Logs con validación y deduplicación

**Tiempo**: ~3-5 minutos (depende de Gemini Pro latency)

**Ejemplo output**:
```
╔════════════════════════════════════════════════════════════╗
║  GENERACIÓN COMPLETADA
║
║  Total en quiz_bank: 215 preguntas
║  Insertadas esta ronda: 215
║
║  Por TEMA:
║    • marco_legal      28 preguntas
║    • gafi             31 preguntas
║    • kyc_cdd          32 preguntas
║    • reportes_cnbv    30 preguntas
║    • une              29 preguntas
║    • sanciones        32 preguntas
║    • tipologias       33 preguntas
║
║  Por DIFICULTAD:
║    • Nivel 1 (Básico)      72 preguntas
║    • Nivel 2 (Intermedio)  71 preguntas
║    • Nivel 3 (Avanzado)    72 preguntas
╚════════════════════════════════════════════════════════════╝
```

---

## Full Pipeline

Secuencia completa para configurar el sistema:

### Paso 1: Seed global docs (18 CNBV PDFs)

```bash
npm run seed
```

**Resultado**:
- 18 PDFs globales en `documents`
- ~2000-3000 embeddings en `document_embeddings`
- Listo para RAG (chat + quiz)

### Paso 2: (Opcional) Batch ingest custom PDFs

```bash
mkdir -p docs/cnbv
# Coloca tus PDFs en docs/cnbv/
npm run batch-ingest -- --folder ./docs/cnbv
```

### Paso 3: Generate quiz bank

```bash
npm run generate-quiz
```

**Resultado**:
- 200+ preguntas en `quiz_bank`
- Sistema listo para examen simulacro

---

## Troubleshooting

### "API key not valid" (Gemini)

```
❌ [GoogleGenerativeAI Error]: API key not valid
```

**Solución**: Verifica `GEMINI_API_KEY` en `.env.local`. Obtén en https://ai.google.dev/

### "Folder not found"

```
❌ Folder not found: ./docs/cnbv
```

**Solución**: Crea la carpeta primero:
```bash
mkdir -p ./docs/cnbv
```

### "Quiz bank < 200 preguntas"

```
⚠️ quiz_bank tiene 120 preguntas (objetivo: 200+). Ejecuta nuevamente.
```

**Solución**: Rerun el script. Gemini puede generar menos si los chunks no son lo suficientemente relevantes.

```bash
npm run generate-quiz
```

### "No chunks found for [tema]"

**Solución**: Asegúrate de haber ejecutado `npm run seed` primero para poblar embeddings globales.

### Rate limit (429)

```
Error: Too many requests
```

**Solución**: El script usa retry automático con backoff. Espera 1-2 minutos y reintenta.

---

## Development Notes

- **batch-ingest.ts**: Usa `tsx` para ejecución directa de TypeScript
- **generate-quiz-bank.ts**: Requiere Gemini 1.5-Pro (no Flash)
- **Supabase RPC**: `match_document_embeddings` para vector search (cosine similarity)
- **Rate Limiting**: 
  - Gemini: batches de 5 embeddings con 600ms pausa
  - Supabase: batches de 50 inserts

---

## Next Steps

Una vez `quiz_bank` tiene 200+ preguntas:
1. Implementar `/api/generate-quiz` para generar simulacros dinámicos
2. Calcular dificultad adaptativa basada en respuestas previas
3. Implementar spaced repetition (SM-2) en `/api/update-xp`
