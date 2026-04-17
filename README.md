# PLD-Master (Duolingo-style) — Estudio + RAG + Simulador + Tutor IA

Plataforma de microaprendizaje gamificada: subes tus documentos (PDF), se indexan con embeddings (RAG) y puedes:

- **Hacer preguntas** al Tutor IA usando tu material como fuente.
- **Generar exámenes** (estilo certificación) por tema y dificultad.
- **Simular** un examen en UI tipo Duolingo.

> Objetivo del producto: que puedas **estudiar cualquier tema** (no solo PLD) usando tus propios archivos y medir progreso.

## Requisitos

- Node.js 18+ (recomendado 20+)
- Una cuenta gratuita de Supabase
- Una API key de Gemini (Google AI Studio)

## Configuración rápida (local)

1) Instala dependencias

```bash
npm install
```

2) Variables de entorno

- Copia `.env.example` a `.env.local`
- Llena los valores

3) Base de datos (Supabase)

- Abre el **SQL Editor** de tu proyecto Supabase
- Ejecuta `supabase/schema.sql`

4) Corre el proyecto

```bash
npm run dev
```

## Activación de Google Login (Supabase)

1) En Supabase: `Authentication` → `Providers` → activa `Google`.
2) Configura credenciales OAuth de Google (Client ID / Secret).
3) En Supabase: `Authentication` → `URL Configuration`:
   - `Site URL`: tu dominio principal (local: `http://localhost:3000`)
   - Agrega redirect URL para local y producción.
4) En Google Cloud OAuth, agrega URIs de redirección autorizadas de Supabase.

## Endpoints (API)

- **`POST /api/ingest`**: recibe `multipart/form-data` con `file` (PDF). Extrae texto, lo guarda en `documents` y crea embeddings en `document_embeddings`.
- **`POST /api/chat`**: chat con RAG (busca contexto en embeddings y responde con Gemini streaming).
- **`POST /api/generate-quiz`**: genera preguntas tipo examen en JSON usando contexto de tus documentos.
- **`POST /api/ingest-drive`**: importa un PDF público de Google Drive por URL de archivo.

## Seguridad aplicada

- **Rate limiting** en rutas IA e ingesta (límite diario por usuario/IP).
- **Sanitización de entradas** para texto y nombres de archivo.
- **Validación de archivos**: solo PDF, máximo 5MB, máximo 150 páginas.
- **Autenticación obligatoria** por Google (Supabase) en rutas sensibles.
- **Variables sensibles** solo en servidor (`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
- **ID maestro de cliente** en base de datos (`public_customer_id`) para mapear Stripe y sistemas internos.

## Notas importantes (para que no “se rompa”)

- **Sin llaves**: si faltan `GEMINI_API_KEY` o variables de Supabase, las APIs responderán con error claro (la UI debe seguir cargando).
- **Dimensión del vector**: este proyecto asume **768** dims (Gemini `text-embedding-004`).

## Deploy a Vercel (gratis)

1) Importa el repo en Vercel
2) Configura variables de entorno (las mismas de `.env.local`)
3) Deploy

## Importación desde Google Drive (Opción A)

- Soporta links de archivo tipo `https://drive.google.com/file/d/...`
- No acepta links de carpeta.
- El archivo debe ser público y cumplir límites: PDF, 5MB, 150 páginas.

## Roadmap sugerido (siguiente versión)

- **Progreso “exacto”**: tracking por “conceptos” y “evidencias” (preguntas respondidas, repasos espaciados, simulaciones).
- **Modo “elige tu tema”**: crear “Cursos” desde PDFs + objetivos (temario) + nivel.
- **Banco de reactivos**: cachear preguntas y re-usarlas (barato) + explicación y fuente.
- **Verificación/Referencias**: al responder, incluir *citas* al fragmento del documento (y links si aplica).
- **Animaciones didácticas**: micro-ilustraciones por concepto (Lottie/Framer) sin costos.

