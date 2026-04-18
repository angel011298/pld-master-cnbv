# ROADMAP.md — Certifik PLD
## Plan Maestro de Desarrollo — Scope Completo v2

> Fecha: Abril 2026 | Basado en: Fase 1 (STRATEGY.md + MARKET_ANALYSIS.md) + decisiones del producto

---

## Resumen del Proyecto

| Parámetro | Valor |
|---|---|
| Producto | Plataforma SaaS de preparación CNBV PLD/FT |
| Stack | Next.js 16 + Supabase + Gemini AI + Stripe |
| Precio | $1,499 → $1,999 → $2,499 → $2,999 (escalonado) |
| B2C target | Candidatos individuales certificación CNBV 2026 |
| B2B target | Entidades financieras con equipos de cumplimiento |
| Examen objetivo | Junio 27 + Octubre 24, 2026 |

---

## Estado Actual (post Fase 2)

```
✅ Repositorio: Next.js 16.2.4 App Router, build limpio
✅ Supabase: proyecto configurado, credenciales en .env.local
✅ Gemini AI: API key configurada (chat RAG + quiz + embeddings)
✅ Google Drive: API key configurada
✅ Vercel: conectado y desplegando automáticamente
✅ Schema SQL: migraciones en supabase/migrations/
⚠️  Google OAuth: pendiente de configurar en Supabase dashboard
⚠️  Stripe: no instalado aún
⚠️  SW SAPiens: credenciales obtenidas, pendiente de activación RFC
```

---

## Arquitectura del Sistema (target)

```
┌─────────────────────────────────────────────────────────┐
│                    CERTIFIK PLD                         │
│                                                         │
│  Frontend (Next.js 16 App Router)                       │
│  ├── /                    Landing + pricing             │
│  ├── /simulator           Quiz simulador                │
│  ├── /chatbot             Tutor IA RAG                  │
│  ├── /knowledge           Documentos                    │
│  ├── /entities            Entidades CNBV                │
│  ├── /tramites            Guía trámites                 │
│  ├── /foro                Comunidad                     │
│  ├── /blog                Artículos SEO                 │
│  ├── /perfil              Cuenta + CFDI                 │
│  └── /admin/*             Super Admin Dashboard         │
│                                                         │
│  Backend (Next.js API Routes / Supabase)                │
│  ├── Auth: Supabase + Google OAuth                      │
│  ├── DB: PostgreSQL (Supabase) + pgvector               │
│  ├── AI: Gemini 1.5 (chat, quiz, embeddings)            │
│  ├── Pagos: Stripe (B2C $1,499-$2,999 + B2B $999/seat) │
│  ├── Facturas: SW SAPiens CFDI 4.0                      │
│  └── Emails: Resend                                     │
└─────────────────────────────────────────────────────────┘
```

---

## Schema de Base de Datos (target completo)

```sql
-- Ya existente (revisar migraciones actuales)
users                  -- perfil del usuario
documents              -- documentos de estudio
document_embeddings    -- vectores RAG (pgvector)

-- Fase 4.1
questions              -- 135 preguntas del banco
  id, text, options (jsonb), correct_answer, explanation,
  area, difficulty, is_active

-- Fase 4.2 / B2B
purchases              -- compras B2C y B2B
  id, user_id, stripe_session_id, amount, product_type,
  status, created_at
organizations          -- empresas con licencias corporativas
  id, name, rfc, contact_email, seats_purchased, admin_user_id
organization_members   -- empleados vinculados a org
  id, org_id, user_id, status, joined_at

-- Fase 4.4
pricing_config         -- precio activo controlable desde admin
  id, price_mxn, stripe_price_id, phase_name, is_active,
  updated_at, updated_by

-- Fase 4.5 / 4.6
diagnostic_results     -- resultados del test diagnóstico
  id, user_id, score, areas_json, taken_at
exam_attempts          -- intentos de simulacro
  id, user_id, questions_json, answers_json, score,
  duration_seconds, completed_at
exam_results_real      -- resultados reales CNBV (KPI tasa aprobación)
  id, user_id, exam_date, passed, score, notes

-- Fase 4.10 (Foro)
forum_categories       -- 5 categorías predefinidas
  id, name, slug, description, icon, sort_order
forum_posts            -- posts del foro
  id, category_id, user_id, title, body, is_pinned,
  is_locked, votes, created_at
forum_replies          -- respuestas a posts
  id, post_id, user_id, body, votes, created_at
forum_votes            -- tabla para evitar votos duplicados
  id, user_id, target_type, target_id, value (1/-1)

-- Fase 4.11 (CFDI)
cfdis                  -- facturas timbradas
  id, user_id, purchase_id, uuid_fiscal, folio,
  xml_url, pdf_url, total_mxn, status, timbrado_at

-- Fase 4.13 (Mejoras)
referrals              -- programa de referidos
  id, referrer_id, referred_user_id, status,
  reward_mxn, paid_at
testimonials           -- testimonios con aprobación
  id, user_id, content, rating, is_approved, created_at
blog_posts             -- artículos del blog
  id, slug, title, body_mdx, author_id, published_at,
  is_published, meta_description
```

---

## Fase 4 — Desarrollo Completo

**Total estimado: 12–17 días de desarrollo**

> Orden de implementación recomendado: secuencial respetando las dependencias del árbol de abajo.

---

### 4.1 — Ingesta de 135 Preguntas `[2 días]`

**Objetivo:** Poblar el banco de preguntas del simulador.

**Entregables:**
- Script `scripts/seed-questions.mjs` para importar preguntas desde JSON/CSV
- Tabla `questions` con validación de campos
- Panel básico en `/admin/preguntas` para revisar/editar
- Al menos 135 preguntas distribuidas en las áreas del temario CNBV 2026:
  - Marco jurídico (25%)
  - Enfoque basado en riesgos (25%)
  - Debida diligencia (20%)
  - Reporte de operaciones (15%)
  - Controles internos (15%)

**Criterio de completitud:**
- `SELECT COUNT(*) FROM questions WHERE is_active = true` retorna ≥ 135
- Preguntas cubren las 5 áreas del temario

**Dependencias:** Schema SQL aplicado

---

### 4.2 — Stripe + B2B `[2 días]`

**Objetivo:** Sistema de pagos completo, B2C y B2B corporativo.

**B2C:**
- `npm install stripe @stripe/stripe-js`
- Checkout session para producto individual
- Webhook: `checkout.session.completed` → insertar en `purchases`
- Activar acceso premium al usuario tras pago exitoso

**B2B:**
- Producto Stripe separado: `$999 MXN × N asientos` (mínimo 5)
- Checkout con metadatos: `org_name`, `seats`, `admin_email`
- Webhook → crear `organization` + `organization_members` (admin)
- Dashboard `/admin/b2b`: ver organizaciones, miembros, estado de pago

**Variables requeridas en `.env.local`:**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_B2C=price_...     # precio individual
STRIPE_PRICE_ID_B2B=price_...     # precio por asiento
```

**Criterio de completitud:**
- Pago test completa sin errores
- Usuario queda con `premium = true` en Supabase tras webhook
- Organización B2B creada con 5+ miembros funciona

**Dependencias:** Ninguna (puede iniciar en paralelo)

---

### 4.3 — Google OAuth `[1 día]`

**Objetivo:** Login/registro con cuenta Google funcional.

**Entregables:**
- Google OAuth configurado en Supabase dashboard (no requiere código nuevo)
- Verificar que `AuthControls.tsx` funciona con OAuth activo
- Manejo de primer login: crear perfil en `users` si no existe (trigger Supabase)
- Callback URL configurada para localhost + Vercel

**Pasos (en Supabase dashboard):**
1. Authentication → Providers → Google → Activar
2. Pegar Client ID + Client Secret de Google Cloud Console
3. Authorized redirect URI: `https://[project].supabase.co/auth/v1/callback`

**Criterio de completitud:**
- Login con Google funciona en localhost y en Vercel
- Usuario nuevo crea perfil automáticamente

**Dependencias:** Ninguna

---

### 4.4 — Paywall + Precio Escalonado `[1.5 días]`

**Objetivo:** Controlar qué features requieren pago y el precio actual desde admin.

**Precio escalonado:**

| Fase | Precio | Contexto |
|---|---|---|
| Lanzamiento | $1,499 MXN | Primeras 4 semanas |
| Estándar | $1,999 MXN | Meses 2–4 |
| Crecimiento | $2,499 MXN | Post-50 testimonios |
| Maduro | $2,999 MXN | Marca establecida |

**Entregables:**
- Tabla `pricing_config` con precio activo
- API route `GET /api/pricing` → retorna precio actual (cacheable 1h)
- Admin `/admin/pricing`: cambiar precio y fase sin re-deploy
- Middleware de paywall: `/simulator`, `/chatbot`, `/foro` (escritura) requieren `premium = true`
- Landing page muestra precio dinámico desde la tabla

**Criterio de completitud:**
- Cambiar precio en admin se refleja en landing sin re-deploy
- Usuario sin pago es redirigido al checkout al intentar acceder features premium

**Dependencias:** 4.2 Stripe, 4.3 Google OAuth

---

### 4.5 — Test Diagnóstico `[1 día]`

**Objetivo:** Quiz corto de 20 preguntas para diagnosticar nivel del candidato.

**Entregables:**
- Ruta `/diagnostico` — 20 preguntas aleatorias (4 por área)
- Sin límite de tiempo (modo diagnóstico)
- Resultado: radar chart por área + recomendación de ruta de estudio
- Guardar resultado en `diagnostic_results`
- Acceso libre (sin paywall) — es el hook de conversión

**Criterio de completitud:**
- Test completa y muestra resultado visual
- Resultado guardado en BD

**Dependencias:** 4.1 Preguntas

---

### 4.6 — Simulacro Completo + PDF Reporte `[2 días]`

**Objetivo:** Simulacro de examen fiel al real + reporte descargable.

**Entregables:**
- Simulacro: 100 preguntas, 4 horas, distribución por áreas igual al examen real
- Timer countdown con advertencias a 60/30/5 min
- Al finalizar: score, % por área, preguntas incorrectas con explicación
- **PDF reporte**: descarga con nombre, fecha, score, gráficas por área
  - Librería: `@react-pdf/renderer` o `jspdf`
- Guardar en `exam_attempts`
- Modo estudio: sin timer (incluye 4.13.F)

**Criterio de completitud:**
- Simulacro de 100 preguntas con timer funciona
- PDF se genera y descarga correctamente
- Modo estudio sin timer filtra por área y dificultad

**Dependencias:** 4.1 Preguntas, 4.4 Paywall (acceso premium)

---

### 4.7 — RAG Chatbot Mejorado `[2 días]`

**Objetivo:** Asegurar que el chatbot funciona con documentos reales cargados.

> El código base ya existe en `/api/chat`. Esta fase es de contenido + hardening.

**Entregables:**
- Ingestar 5–10 documentos PLD/FT oficiales (CNBV, GAFI, FATF, guías EBR)
- Verificar que RAG retorna fragmentos relevantes (test con 10 preguntas tipo)
- Mejorar prompt del sistema con el temario 2026
- Agregar botón "Preguntar al tutor" desde resultado de simulacro (link a chatbot con contexto)
- Rate limit: 30 mensajes/día (ya implementado, verificar)

**Criterio de completitud:**
- 5+ documentos ingestados y buscables
- Chatbot responde correctamente preguntas del temario CNBV

**Dependencias:** 4.1 Preguntas (para contexto del temario)

---

### 4.8 — Dashboard de Usuario + UI `[2 días]`

**Objetivo:** Experiencia de usuario cohesiva y pulida.

**Entregables:**
- `/perfil`: foto, nombre, email, progreso total, XP, racha de días
- Dashboard home: resumen de avance (% por área, último simulacro, nivel)
- `LearningPath` mejorado: módulos desbloqueables, progreso visual
- Modo oscuro (toggle persistente)
- Responsive mobile completo
- Skeleton loaders en todas las páginas de datos

**Criterio de completitud:**
- Todas las páginas cargan en <2s
- Mobile funciona sin scroll horizontal

**Dependencias:** 4.3 OAuth (para mostrar datos del usuario)

---

### 4.9 — Validación Pre-Producción `[1 día]`

**Objetivo:** QA completo antes del lanzamiento público.

**Checklist:**
- [ ] Flujo completo: registro → pago → acceso → simulacro → PDF
- [ ] Flujo B2B: empresa → pago → miembros → acceso
- [ ] Tests con 3+ usuarios reales (beta cerrada)
- [ ] Performance: Lighthouse score >80 en mobile
- [ ] Seguridad: headers, CORS, rate limits
- [ ] Variables de entorno en Vercel production configuradas
- [ ] Dominio personalizado configurado (si disponible)
- [ ] Analytics: Vercel Analytics activado

**Criterio de completitud:**
- 0 bugs críticos
- Flujo de pago completa en modo test sin errores

**Dependencias:** 4.1–4.8

---

### 4.10 — Foro de Comunidad `[2 días]`

**Objetivo:** Espacio comunitario para candidatos.

**5 categorías predefinidas:**
1. Dudas de temario
2. Experiencias del examen
3. Noticias y actualizaciones CNBV
4. Recursos y materiales
5. Offtopic / networking

**Entregables:**
- Ruta `/foro` — listado de categorías y posts recientes
- `/foro/[categoria]/[post]` — hilo completo con replies
- Votos up/down en posts y replies (sin duplicados via `forum_votes`)
- Leer: todos los usuarios | Escribir: solo premium
- Moderación desde `/admin/foro`: pin, lock, eliminar posts
- Notificación por email al recibir reply (via Resend)

**Criterio de completitud:**
- Post completo con replies y votos funciona
- Usuario no-premium puede leer pero no escribir

**Dependencias:** 4.3 OAuth, 4.4 Paywall; puede ir paralelo con 4.7

---

### 4.11 — CFDI 4.0 Timbrado (SW SAPiens) `[2 días]`

**Objetivo:** Emisión de facturas fiscales válidas ante el SAT.

> ⚠️ **PREREQUISITO:** Las credenciales de SW SAPiens y el RFC del emisor deben estar en `.env.local` antes de ejecutar esta fase. Ver sección "Prerequisites" al final de este documento.

**Entregables:**
- `npm install` del SDK de SW SAPiens (o implementación via REST)
- API route `POST /api/cfdi/emitir` — recibe datos del usuario y emite CFDI 4.0
- Página `/perfil/facturas` — historial de CFDIs con descarga XML y PDF
- Admin `/admin/facturas` — ver todas las facturas emitidas, estado, RFC receptor
- Flujo self-service: tras pago, el usuario ingresa su RFC y razón social para facturar
- Tabla `cfdis` registra UUID fiscal, XML, PDF, estado

**Variables requeridas:**
```
SW_SAPIENS_USER=<correo registrado en SW SAPiens>
SW_SAPIENS_PASSWORD=<contraseña SW SAPiens>
SW_SAPIENS_RFC_EMISOR=<RFC del emisor registrado>
SW_SAPIENS_ENV=sandbox   # → 'production' al lanzar
```

**Criterio de completitud:**
- CFDI de prueba timbrado en sandbox con UUID fiscal válido
- XML y PDF descargables desde el perfil del usuario

**Dependencias:** 4.2 Stripe (purchases debe existir), credenciales SW SAPiens activas

---

### 4.12 — Super Admin Dashboard Completo `[1.5 días]`

**Objetivo:** Panel centralizado para gestionar toda la plataforma.

**Rutas del Super Admin:**

| Ruta | Función |
|---|---|
| `/admin` | Overview: MRR, usuarios activos, ventas del día |
| `/admin/usuarios` | Lista, buscar, banear, cambiar rol |
| `/admin/compras` | Historial de pagos B2C y B2B |
| `/admin/facturas` | Gestión CFDIs (ver, re-timbrar, cancelar) |
| `/admin/preguntas` | CRUD banco de preguntas |
| `/admin/foro` | Moderar posts, pin, lock, eliminar |
| `/admin/pricing` | Cambiar precio activo (fase escalonada) |
| `/admin/analytics` | Tasa de aprobación, funnel, retención |
| `/admin/b2b` | Organizaciones, miembros, renovaciones |

**Seguridad:**
- Middleware: solo `role = 'super_admin'` en tabla `users`
- Todas las rutas `/admin/*` retornan 403 a cualquier otro rol

**Criterio de completitud:**
- Super admin puede cambiar precio desde UI sin re-deploy
- Dashboard de analytics muestra MRR real de Stripe

**Dependencias:** 4.2, 4.3, 4.4, 4.10, 4.11

---

### 4.13 — Mejoras del Análisis `[3 días total]`

#### A. Programa de Referidos `[0.5 días]`
- Cada usuario tiene un link único: `certifik.mx/ref/[code]`
- Al comprar via ese link → $200 MXN de crédito al referidor
- Tabla `referrals`, pago manual o via Stripe Transfer
- Mostrar en `/perfil`: mis referidos, crédito acumulado

#### B. Blog Base (SEO) `[0.5 días]`
- Ruta `/blog` y `/blog/[slug]`
- Tabla `blog_posts` con soporte MDX
- 3 artículos semilla:
  1. "Guía completa: Certificación CNBV PLD/FT 2026"
  2. "¿Qué es el Enfoque Basado en Riesgos en PLD?"
  3. "Diferencias entre PLD/FT y FPADM: Lo que debes saber"
- Meta tags para SEO (título, descripción, og:image)

#### C. Emails Automáticos (Resend) `[1 día]`
- `npm install resend`
- Triggers de email:
  - Bienvenida tras registro
  - Confirmación de compra (con link a factura si aplica)
  - Recordatorio 7 días antes del examen CNBV
  - "No has practicado en 3 días" (re-engagement)
  - Reply en foro
- Templates: HTML + texto plano

**Variable requerida:**
```
RESEND_API_KEY=re_...
```

#### D. PDF Reporte Post-Simulacro
> Incluido en subtarea 4.6 — ver arriba.

#### E. Sistema de Testimonios `[0.5 días]`
- Formulario en `/perfil` para dejar testimonio (1-5 estrellas + texto)
- Admin aprueba/rechaza en `/admin/usuarios`
- Landing page muestra testimonios aprobados
- Tabla `testimonials`

#### F. Modo Estudio por Área
> Incluido en subtarea 4.6 (Simulacro con modo estudio).

---

## Timeline Visual

```
Semana 1 (días 1–5):
  Día 1–2:  4.1 Preguntas  ──────────────────┐
  Día 1–2:  4.2 Stripe + B2B (paralelo)       │
  Día 3:    4.3 Google OAuth                  │
  Día 3–4:  4.4 Paywall + Precios             │
  Día 5:    4.5 Test Diagnóstico ─────────────┘

Semana 2 (días 6–10):
  Día 6–7:  4.6 Simulacro + PDF
  Día 8–9:  4.7 RAG Chatbot
            4.10 Foro (paralelo con 4.7)
  Día 10:   4.8 Dashboard + UI

Semana 3 (días 11–15+):
  Día 11:   4.9 Validación pre-prod
  Día 12–13: 4.11 CFDI 4.0
  Día 14:   4.12 Super Admin completo
  Día 15–17: 4.13 Mejoras (A, B, C, E)

🚀 LANZAMIENTO: Semana 3-4
```

---

## Bloqueadores Identificados

| Bloqueador | Subtarea | Acción Requerida | Responsable |
|---|---|---|---|
| Stripe: crear cuenta y obtener keys | 4.2 | Registro en dashboard.stripe.com | Angel |
| Google OAuth: crear proyecto GCP | 4.3 | Crear en console.cloud.google.com | Angel |
| SW SAPiens: activar RFC emisor | 4.11 | Verificar que RFC está activo en portal | Angel |
| SW SAPiens: pasar a producción | 4.11 | Cambiar `SW_SAPIENS_ENV=production` | Angel |
| 135 preguntas: contenido del banco | 4.1 | Fuente: temario oficial CNBV 2026 | Angel + Claude |
| Resend: crear cuenta | 4.13.C | Registro en resend.com | Angel |
| Dominio personalizado | Deploy | Conectar en Vercel | Angel |

---

## Criterios de Lanzamiento (Definition of Done)

Para considerar el producto listo para lanzamiento público:

- [ ] 4.1: ≥135 preguntas en BD
- [ ] 4.2: Pago Stripe funciona end-to-end (test mode)
- [ ] 4.3: Login Google funciona
- [ ] 4.4: Paywall activo, precio visible en landing
- [ ] 4.5: Test diagnóstico disponible (sin login requerido)
- [ ] 4.6: Simulacro 100 preguntas + PDF descargable
- [ ] 4.7: Chatbot responde preguntas del temario
- [ ] 4.8: UI pulida, mobile responsive
- [ ] 4.9: 0 bugs críticos, Lighthouse >80
- [ ] CFDI, Foro, Admin, Mejoras: pueden lanzarse en v1.1 post-lanzamiento

**Lanzamiento mínimo viable (MVP):** subtareas 4.1–4.9 completadas

---

## Prerequisites — Credenciales Pendientes

### Para 4.11 (CFDI 4.0)

Agregar a `.env.local` (nunca al repo):

```
SW_SAPIENS_USER=<usuario>
SW_SAPIENS_PASSWORD=<contraseña>
SW_SAPIENS_RFC_EMISOR=<RFC del emisor>
SW_SAPIENS_ENV=sandbox
```

Ver: https://developers.sw.com.mx para documentación de la API REST.

Para timbrar en producción:
1. Cambiar `SW_SAPIENS_ENV=production`
2. Verificar que el RFC emisor está dado de alta ante el SAT con e.firma
3. Configurar el CSD (Certificado de Sello Digital) en el portal SW SAPiens

### Para 4.2 (Stripe)

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_B2C=price_...
STRIPE_PRICE_ID_B2B=price_...
```

### Para 4.13.C (Resend)

```
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=hola@certifik.mx
```

---

## KPIs de Éxito (post-lanzamiento)

| KPI | Meta mes 1 | Meta mes 3 | Meta mes 6 |
|---|---|---|---|
| Usuarios registrados (pagos) | 50 | 100 | 200 |
| Tasa de conversión landing | >8% | >12% | >15% |
| Tasa de aprobación CNBV (usuarios Certifik) | — | >70% | >80% |
| NPS | >7 | >8 | >8.5 |
| MRR | $75k MXN | $150k MXN | $300k MXN |
| Clientes B2B | 0 | 2 | 5 |
| CFDIs emitidos | 30 | 80 | 200 |

---

*Roadmap elaborado post-Fase 1 (análisis de mercado) y Fase 2 (diagnóstico técnico). Scope v2 incluye B2B, Foro, CFDI 4.0, precio escalonado y mejoras del análisis.*
