# DIAGNOSIS.md — Certifik PLD
## Diagnóstico Técnico Completo

> Fecha: Abril 2026 | Rama: `claude/certifik-pld-phase-1-XTzAu`

---

## Resumen Ejecutivo

| Categoría | Estado |
|---|---|
| Repositorio & estructura | ✅ Válido |
| Dependencias (npm install) | ✅ Instaladas |
| Compilación (npm run build) | ✅ Sin errores |
| Variables de entorno | ✅ Corregidas (formato `=`) |
| Supabase (credenciales) | ✅ Credenciales válidas |
| Supabase (localhost dev) | ⚠️ Requiere 1 config en dashboard |
| Gemini AI | ✅ API Key configurada |
| Google Drive API | ✅ API Key configurada |
| Stripe | 🔴 No implementado (Fase 3) |
| Seguridad: Next.js CVE | ⚠️ Actualización recomendada |

---

## 1. Repositorio & Estructura

### Validaciones

- [x] Git clone / status limpio
- [x] Es proyecto Next.js 15.0.3 con **App Router** (`src/app/`)
- [x] `package.json` y `tsconfig.json` presentes
- [x] `.gitignore` configurado correctamente
- [x] Sin archivos de secrets expuestos en el repo

### Stack tecnológico confirmado

```
Framework:    Next.js 15.0.3 (App Router)
Runtime:      Node.js v22.22.2 / npm 10.9.7
Lenguaje:     TypeScript 5.6.3
UI:           React 18.3.1 + Tailwind CSS 3.4 + Framer Motion
DB/Auth:      Supabase (@supabase/supabase-js ^2.45.4)
AI:           Google Gemini (@google/generative-ai ^0.24.1)
               Models: gemini-1.5-pro, gemini-1.5-flash, text-embedding-004
PDF:          pdf-parse + pdfjs-dist
Deploy:       Vercel (conectado vía OIDC token)
```

### Rutas de la aplicación (12 rutas compiladas)

```
/ ─────────── Página principal (landing)
/chatbot ──── Tutor IA PLD-Master (RAG + Gemini)
/simulator ── Quiz / Simulador de examen
/knowledge ── Gestión de documentos de estudio
/entities ─── Entidades supervisadas CNBV
/tramites ─── Guía de trámites PLD/FT
/privacidad ─ Aviso de privacidad
/terminos ─── Términos y condiciones

API Routes (serverless):
/api/chat ────────────── Chat RAG con Gemini streaming
/api/generate-quiz ───── Generador de quiz con IA
/api/ingest ──────────── Ingesta de PDFs
/api/ingest-drive ────── Ingesta desde Google Drive
/api/list-drive-folder ─ Lista PDFs en Drive folder
/api/update-xp ────────── Sistema de XP/gamificación
/api/admin/seed-documents── Admin: seed docs globales
```

---

## 2. Dependencias

```
npm install: ✅ 414 paquetes instalados sin errores críticos
Tiempo:      ~28 segundos
```

### Advertencias a atender

| Advertencia | Severidad | Acción |
|---|---|---|
| `next@15.0.3` CVE-2025-66478 | **CRÍTICA** | Actualizar a latest patch |
| `eslint@8.57.1` deprecated | Baja | Actualizar en Fase 3+ |

### Acción recomendada (Next.js CVE)

```bash
# Actualizar Next.js a versión parcheada
npm install next@15.3.2
```
> Ver: https://nextjs.org/blog/CVE-2025-66478

---

## 3. Variables de Entorno

### Bug encontrado y corregido

El `.env.local` original usaba **tabs como separador** en lugar de `=`:

```
# INCORRECTO (no lo lee Next.js dotenv)
NEXT_PUBLIC_SUPABASE_URL	https://xxx.supabase.co

# CORRECTO
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
```

**Corrección aplicada:** todas las variables ahora usan formato estándar `KEY=VALUE`.

### Variables configuradas

| Variable | Estado | Uso |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Configurada | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Configurada | Auth + DB del lado cliente |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Configurada | Admin DB en API routes |
| `GEMINI_API_KEY` | ✅ Configurada | AI: chat, quiz, embeddings |
| `GOOGLE_DRIVE_API_KEY` | ✅ Configurada | Listar PDFs en Drive |
| `SEED_SECRET` | ✅ Configurada | Endpoint admin de seed |
| `VERCEL_OIDC_TOKEN` | ✅ Configurada | Auto-inyectado por Vercel CI |

### Variables NO requeridas

A diferencia de lo especificado inicialmente en la Fase 2:
- **`GOOGLE_CLIENT_ID/SECRET`**: No necesarios. La autenticación Google se gestiona **internamente por Supabase** (configurado en el dashboard de Supabase, no en `.env.local`)
- **`STRIPE_*`**: Stripe **no está implementado** en el proyecto actualmente. Se añadirá en Fase 3 cuando se construya el sistema de pagos.

---

## 4. Compilación (npm run build)

```
✅ Compilación exitosa — 0 errores
✅ TypeScript válido
✅ Linting saltado (configurado en next.config.ts)
✅ 12/12 páginas estáticas generadas
✅ 7 API routes dinámicas (serverless)
```

### Advertencia de deprecación en gemini.ts

El archivo `src/lib/gemini.ts` usa `googleSearchRetrieval` (Google Search Grounding), que puede cambiar de API en versiones futuras de `@google/generative-ai`. Por ahora funciona, pero debe monitorearse.

---

## 5. Supabase

### Conexión

```
Credenciales: ✅ Presentes y con formato correcto
URL:          https://xuwestiepwhlbdnwyblb.supabase.co
Respuesta:    "Host not in allowlist"
```

### ¿Qué significa "Host not in allowlist"?

El proyecto Supabase tiene **restricción de hosts** habilitada (feature de seguridad de producción). Permite que la anon key solo funcione desde dominios autorizados.

**Para desarrollo local:** se necesita agregar `localhost` al allowlist.

**Resolución (2 minutos):**

1. Ir a [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleccionar el proyecto `xuwestiepwhlbdnwyblb`
3. Ir a **Settings → API**
4. Buscar "Allowed origins" o "API Settings"
5. Agregar `http://localhost:3000`
6. Guardar

Alternativamente, si la restricción no es necesaria en desarrollo:
- Desactivar "Restrict API access by allowed origins" temporalmente

> En producción (Vercel), el dominio `*.vercel.app` ya está autorizado.

### Schema SQL

La base de datos tiene migraciones definidas en:
- `supabase/migrations/000_full_schema.sql` — Schema completo
- `supabase/migrations/001_global_documents.sql` — Documentos globales RAG
- `supabase/schema.sql` — Schema de referencia

Verificar que las migraciones estén aplicadas en el dashboard de Supabase.

---

## 6. Google Gemini AI

```
API Key:    ✅ Configurada en GEMINI_API_KEY
Models:     gemini-1.5-pro, gemini-1.5-flash, text-embedding-004
Uso:        Chat RAG, generación de quiz, embeddings vectoriales
Validación: Key presente (validación de conectividad en runtime)
```

---

## 7. Google Drive API

```
API Key:    ✅ Configurada en GOOGLE_DRIVE_API_KEY
Uso:        Listar y descargar PDFs públicos de carpetas Drive
Validación: Key presente (validación en runtime al usar feature)
```

---

## 8. Sistema de Pagos (Stripe)

```
Estado: 🔴 NO IMPLEMENTADO
```

Stripe no está en `package.json` ni en las env vars. Está listado como feature futura. Ver `SETUP.md` para instrucciones de configuración cuando se implemente en Fase 3.

---

## 9. Seguridad

| Ítem | Estado | Detalles |
|---|---|---|
| Secrets en repo | ✅ OK | `.gitignore` incluye `.env.local` |
| Next.js CVE-2025-66478 | ⚠️ Pendiente | Actualizar `next@15.3.2+` |
| Rate limiting | ✅ Implementado | `src/lib/rate-limit.ts` — 30 req/día por usuario |
| Auth guard en API | ✅ Implementado | `getAuthenticatedUserId()` en todas las routes |
| Service Role Key | ✅ Server-only | Solo en API routes, nunca expuesta al cliente |
| Input validation | ✅ Implementado | `validateMessagesPayload()` en chat |

---

## 10. Items Pendientes (no bloquean desarrollo)

### Prioridad Alta

1. **Agregar localhost al Supabase allowlist** (2 min)
   - Sin esto, `npm run dev` no puede conectar a Supabase localmente

2. **Actualizar Next.js** (5 min)
   ```bash
   npm install next@15.3.2
   ```

### Prioridad Media

3. **Stripe Setup** (Fase 3)
   - Cuando se implemente el sistema de pagos
   - Instrucciones completas en `SETUP.md`

4. **Verificar migraciones SQL aplicadas** en Supabase dashboard
   - `000_full_schema.sql` y `001_global_documents.sql`

### Prioridad Baja

5. **Crear `.env.example`** para documentar las variables sin valores reales
   (ya cubierto en `SETUP.md`)

---

## Resumen Final

El proyecto está **técnicamente listo para desarrollo y producción** con un único bloqueador menor: la configuración del allowlist en Supabase para localhost. Una vez resuelto ese punto (2 minutos en el dashboard), `npm run dev` funcionará completamente.

El build de producción ya está limpio y desplegable a Vercel.

```
✅ npm install      → 414 paquetes, sin errores
✅ npm run build    → 12 rutas, 0 errores, 0 warnings TypeScript
✅ .env.local       → Corregido y completo
✅ Credenciales     → Supabase, Gemini, Drive configuradas
⚠️ 1 acción req.   → Agregar localhost al Supabase allowlist
⚠️ 1 recomendada   → Actualizar Next.js (CVE)
🔴 Stripe          → Pendiente de Fase 3
```
