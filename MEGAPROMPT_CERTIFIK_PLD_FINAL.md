# 🚀 MEGAPROMPT CERTIFIK PLD - CLAUDE CODE
## Autonomía Total | Ejecución sin pausas | Reporte final detallado

**Última actualización:** 17 de Abril 2026  
**Versión:** 1.0 (DEFINITIVA)  
**Estado:** LISTO PARA EJECUCIÓN INMEDIATA

---

## 📋 CONTEXTO EJECUTIVO

**Nombre del Proyecto:** Certifik PLD  
**Subtitle:** Plataforma didáctica para Certificación CNBV PLD/FT en México  
**Objetivo:** Transformar código existente → plataforma lista para mercado, monetizable, V1.0  
**Target Initial:** Profesionales examen 27 junio 2026 (Examen 1) y 24 octubre 2026 (Examen 2)  
**Mercado:** México, sector fintech/compliance, profesionales regulados  

**Tech Stack:**
- Frontend: Next.js 14+ (App Router)
- Backend: Supabase (PostgreSQL + Auth + Storage)
- Pagos: Stripe (test keys inicialmente)
- IA: Google Gemini API
- Auth: Google OAuth 2.0
- Hosting: Vercel (ya conectado)
- Iconografía: Lucide Icons (npm)

**Repo:** https://github.com/angel011298/pld-master-cnbv  
**Vercel:** Ya conectado (auto-deploy en push)  

---

## 🎨 IDENTIDAD VISUAL (CRÍTICA)

### Paleta de Colores

**CONFIRMADO POR USUARIO:**

**Fondo:** Blanco puro (#FFFFFF)
**Texto primario:** Negro (#000000) o Gris muy oscuro (#1F2937)
**Contraste:** Alto (WCAG AAA compliance)

**Color Primario: AZUL INSTITUCIONAL** ✅
```
Principal:  #0052B4
Hover:      #003D82
Light:      #1F5BA8
```

**Rationale:**
- Máxima confianza regulatoria
- Ideal para CNBV (institucionalidad)
- Sector financiero/compliance estándar
- Profesional, serio, confiable
- Máximo contraste en fondo blanco + negro
- Diferencia de verde Duolingo (evita comparaciones)

**USO:**
- Buttons CTA: "Pagar", "Comenzar examen", "Enviar", "Descargar"
- Feedback positivo: Checkmarks, success states, validaciones
- Links interactivos y hover states
- Acentos en tarjetas, progress bars, badges
- Hover states de botones (darkening a #003D82)
- Border-left en call-to-action cards

**Restricciones:**
- SIN gradientes
- SIN sombras decorativas
- SIN saturación excesiva
- Bordes: 0.5px máximo, color gris claro (#D1D5DB)
- Uso consistente: #0052B4 en CTA, nunca variar sin razón

### Tipografía

- **Sans-serif:** Familia limpia, legible, profesional
  - Body: 14px, weight 400, line-height 1.6
  - Headings: 16px (h3), 18px (h2), 22px (h1), weight 500-600
  - Labels: 12px, weight 500, color gris medio

- SIN serifs decorativos
- SIN fuentes script o cursivas
- Máximo 2 pesos (400 regular, 500-600 medium/bold)

### Componentes & Spacing

**Cards:**
- Fondo: Blanco (#FFFFFF)
- Borde: 1px solid #D1D5DB
- Border-radius: 8px
- Padding: 1.5rem interior
- Box-shadow: NONE (o 0.1px subtle max)

**Buttons:**
- Primary (CTA): Bg color primario, texto blanco, border none
- Secondary: Bg transparent, border 1px color primario, texto color primario
- Padding: 12px 20px
- Border-radius: 6px
- Hover: Bg más oscuro (20% darker) o border más visible
- NO rounded pills (radius max 8px)

**Progress bars:**
- Track: #E5E7EB (gris muy claro)
- Fill: Color primario
- Height: 8px
- Border-radius: 4px

**Inputs:**
- Bg: #FFFFFF
- Border: 1px solid #D1D5DB
- Focus: Border color primario, outline none
- Padding: 10px 12px
- Border-radius: 6px

### Ilustraciones & Iconografía

**CONFIRMADO POR USUARIO:**

#### Iconos: Lucide Icons (MIT License)

**Instalación:**
```bash
npm install lucide-react
```

**Por qué Lucide:**
- Minimalista = alineado con tu estilo visual
- Stroke-based = se ve bien en blanco y negro
- Fácil de colorear con CSS (inherit o color variable)
- React components nativos, NextJS compatible
- MIT license = sin restricciones comerciales
- 5,000+ íconos disponibles
- Escalables, crisp en cualquier tamaño

**Tamaños estándar:**
- Inline labels: 16px
- Buttons: 24px
- Card headers: 32px
- Destacados: 48px

**Color por defecto:** Negro (#000000), heredar de contexto
**Color en CTA:** Azul institucional (#0052B4)

**Uso en componentes:**
```tsx
import { TestTube, BarChart, Clock, MessageCircle, Settings, User, LogOut } from 'lucide-react';

export function DiagnosticButton() {
  return (
    <button className="flex items-center gap-2 hover:text-[#003D82]">
      <TestTube size={24} color="#0052B4" strokeWidth={1.5} />
      Test diagnóstico
    </button>
  );
}
```

**Iconos sugeridos por sección (Lucide):**

Onboarding & Flujo:
- `TestTube` → Test diagnóstico
- `BarChart` → Resultados/Analytics
- `CreditCard` → Pago/Stripe
- `CheckCircle` → Confirmación/Éxito
- `AlertCircle` → Advertencias

Dashboard & Estudio:
- `BookOpen` → Módulos/Lecciones
- `Clock` → Cronómetro/Timer
- `Target` → Objetivos/Metas
- `MessageCircle` → Chat/Asistente IA
- `Eye` → Ver simulacro

Métricas & Progreso:
- `TrendingUp` → Mejora/Progreso
- `Zap` → Racha activa
- `Star` → Dificultad/Nivel
- `Award` → Logros/Badges
- `Percent` → Porcentaje/Score

Acciones & Navegación:
- `Settings` → Configuración
- `User` → Perfil
- `LogOut` → Salir
- `Download` → Descargar/Export
- `Trash2` → Eliminar
- `ArrowRight` → Navegación

---

#### Ilustraciones Grandes: Illustration Kit (Paawy) + Undraw

**Paawy (PRIMARY - Recomendado)**

**URL:** https://paawy.com

**Por qué Paawy:**
- Ilustraciones minimalistas, estilo sketch limpio
- Perfectas para empty states, onboarding, secciones
- Coherencia visual con tu diseño
- Licencia: Libre para uso comercial (verificar términos)
- Paleta neutral (fácil de colorear con tu azul #0052B4)

**Uso en Certifik:**
- Empty states: "No hay exámenes completados" → ilustración Paawy
- Onboarding: Cada paso del flujo → ilustración
- Landing page: Hero section background
- Secciones vacías: "Chat sin conversaciones" → ilustración

**Cómo integrar:**
1. Descargar SVG desde Paawy
2. Guardar en `/public/illustrations/`
3. Recolorear con CSS (si es necesario): filter `hue-rotate()` o reemplazar color hex en SVG
4. Usar en componentes como `<Image>` o `<svg>`

```tsx
import Image from 'next/image';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Image 
        src="/illustrations/empty-chat.svg" 
        alt="No hay conversaciones"
        width={200}
        height={200}
      />
      <p className="text-gray-600">Aún no hay preguntas. ¡Inicia el chat!</p>
    </div>
  );
}
```

---

**Undraw (FALLBACK)**

**URL:** https://undraw.co

**Por qué Undraw:**
- 3,000+ ilustraciones de calidad
- CC0 license (dominio público)
- Estilo consistente y profesional
- Si Paawy no tiene cierta escena, Undraw seguro sí

**Recomendación:** Usar Paawy primero, Undraw como fallback

---

**Restricciones de ilustraciones:**
- NO fotos reales
- NO gradientes complejos (máximo 2 colores)
- Estilo minimalista = alineado con tu visual
- Paleta: Azul #0052B4 + grises
- Tamaño SVG: < 100KB por archivo
- Responsive: Escalan bien en móvil y desktop

**Ejemplos de uso:**

| Sección | Ilustración | Propósito |
|---------|-------------|----------|
| Onboarding - Paso 1 | Persona con test | Introduce test diagnóstico |
| Onboarding - Paso 2 | Gráfico de progreso | Muestra resultados |
| Onboarding - Paso 3 | Tarjeta de crédito | Visualiza pago |
| Dashboard vacío | Estudiante estudiando | Encourage comenzar |
| Chat vacío | Bombilla + chat | Invite hacer preguntas |
| Examen completado | Celebración/Trophy | Feedback positivo |
| Error 404 | Búsqueda sin resultados | User-friendly error |

---

## 💰 MODELO DE NEGOCIO

### Monetización

**Precio V1:** $1,999 MXN (pase de 6 meses)
- Válido desde compra hasta vencimiento automático
- NO hay renovación automática (cliente repite compra cada ciclo)
- NO suscripción recurrente (evitar complejidad legal)

**Vencimiento automático (CRÍTICO):**
- Examen 1: Todas las licencias expiran 28 de junio 2026, 23:59 UTC
- Examen 2: Todas las licencias expiran 25 de octubre 2026, 23:59 UTC

**Facturación V1:**
- Manual vía SAT para primeros 10-20 clientes
- Usar portal del SAT (SAT.gob.mx) para emitir CFDI
- Automatizar en V1.5 con API FIEL o SW Sapien

### Freemium Model

**Gratis (sin pago):**
- ✅ Módulo 1 completo (Marco Normativo) con todos los temas
- ✅ Test diagnóstico (5-10 preguntas, resultado sin paywall)
- ✅ 30 preguntas/interacciones IA por día
- ❌ Simulacro avanzado (bloqueado)
- ❌ Plan personalizado (bloqueado)
- ❌ Chat IA sin límite (limitado a 30)

**Premium ($1,999 MXN):**
- ✅ Simulacro cronometrado ilimitado
- ✅ Todas las áreas desbloqueadas
- ✅ Chat IA sin límite hasta vencimiento
- ✅ Plan de estudio personalizado con repetición espaciada
- ✅ Análisis de brechas avanzado
- ✅ Reporte completo + predicción de aprobación
- ✅ Acceso hasta 1 día post-examen (28 jun / 25 oct)

### Límites Técnicos (Costos Cero)

| Límite | Detalle | Razón |
|--------|---------|-------|
| **PDFs por usuario** | Máx 3 documentos | Storage Supabase (100MB free) |
| **Tamaño PDF** | 5 MB máximo | Evita uploads de imágenes escaneadas pesadas |
| **Preguntas IA/día (free)** | 30 límite | Gemini API free tier protection |
| **Usuarios concurrentes** | ~7,000 por ronda | Supabase Free tier capacity |
| **Storage total** | 100 MB | Supabase Free límite |
| **DB size** | 500 MB | Supabase Free límite |

**Monitoreo:** Crear dashboard interno (no visible a usuarios) para rastrear consumo. Si se aproxima al límite, alertar y considerar upgrade a Supabase Pro ($25/mes).

---

## 📊 ARQUITECTURA DE DATOS

### Schema Supabase (PostgreSQL)

```sql
-- ==========================================
-- 1. USUARIOS & AUTENTICACIÓN
-- ==========================================

create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  google_id text unique,
  name text,
  access_level text default 'free', -- 'free' | 'premium'
  access_expires_at timestamp,
  exam_date date default '2026-06-27'::date,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create index idx_users_email on users(email);
create index idx_users_google_id on users(google_id);

-- ==========================================
-- 2. COMPRAS (STRIPE)
-- ==========================================

create table purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  stripe_session_id text unique not null,
  stripe_customer_id text,
  amount_cents integer not null,
  currency text default 'MXN',
  status text default 'pending', -- 'pending' | 'completed' | 'failed'
  metadata jsonb, -- { "exam_round": "june_2026", ... }
  created_at timestamp default now(),
  completed_at timestamp
);

create index idx_purchases_user_id on purchases(user_id);
create index idx_purchases_status on purchases(status);

-- ==========================================
-- 3. PREGUNTAS (135 questions CNBV)
-- ==========================================

create table questions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  options jsonb not null, -- ["Opción A", "Opción B", "Opción C", "Opción D"]
  correct_answer_index integer not null, -- 0 = "Opción A", 1 = "Opción B", etc
  explanation text,
  topic text not null, -- 'marco_normativo' | 'operaciones_sospechosas' | 'casos_practicos' | 'educacion_financiera'
  difficulty text default 'medium', -- 'easy' | 'medium' | 'hard'
  source_document text, -- referencia al PDF fuente
  created_at timestamp default now()
);

create index idx_questions_topic on questions(topic);
create index idx_questions_difficulty on questions(difficulty);

-- ==========================================
-- 4. RESPUESTAS DEL USUARIO
-- ==========================================

create table user_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  question_id uuid not null references questions(id),
  answer_index integer not null, -- 0, 1, 2, o 3
  is_correct boolean,
  time_spent_seconds integer,
  attempted_at timestamp default now()
);

create index idx_user_responses_user_id on user_responses(user_id);
create index idx_user_responses_question_id on user_responses(question_id);

-- ==========================================
-- 5. SIMULACROS (examen cronometrado)
-- ==========================================

create table exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  questions_attempted jsonb not null, -- array of question IDs
  score_total integer, -- 0-135
  score_percentage numeric(5,2), -- 0.00-100.00
  time_spent_seconds integer,
  started_at timestamp,
  completed_at timestamp,
  results_by_topic jsonb -- { "marco_normativo": 0.92, "operaciones_sospechosas": 0.65 }
);

create index idx_exam_attempts_user_id on exam_attempts(user_id);

-- ==========================================
-- 6. PLAN DE ESTUDIO PERSONALIZADO
-- ==========================================

create table study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  diagnostic_score numeric(5,2), -- score del test diagnóstico
  weak_topics text[], -- tópicos a reforzar
  strong_topics text[], -- tópicos dominados
  next_recommended_topic text,
  progress_by_topic jsonb, -- { "marco_normativo": 0.85, ... }
  spaced_repetition_schedule jsonb, -- cronograma de preguntas para repetición espaciada
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create index idx_study_plans_user_id on study_plans(user_id);

-- ==========================================
-- 7. HISTORIAL DE CHAT (RAG)
-- ==========================================

create table chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  user_message text not null,
  assistant_response text not null,
  source_documents text[], -- referencias a PDFs / documentos
  tokens_used integer, -- para tracking de uso de API
  created_at timestamp default now()
);

create index idx_chat_history_user_id on chat_history(user_id);

-- ==========================================
-- 8. PDFs CARGADOS POR USUARIO
-- ==========================================

create table user_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  filename text not null,
  file_path text, -- path en Supabase Storage
  file_size_bytes integer,
  upload_date timestamp default now()
);

create index idx_user_documents_user_id on user_documents(user_id);

-- ==========================================
-- 9. EMBEDDINGS (para RAG vectorial)
-- ==========================================

create table document_embeddings (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references user_documents(id) on delete cascade,
  section_text text, -- chunk de texto
  embedding vector(1536), -- vector de Gemini
  created_at timestamp default now()
);

-- Índice vectorial para búsqueda semántica (si Supabase lo soporta)
-- create index on document_embeddings using ivfflat (embedding vector_cosine_ops);
```

### Relaciones Críticas

```
users (1) ──→ (N) purchases
users (1) ──→ (N) user_responses
users (1) ──→ (N) exam_attempts
users (1) ──→ (1) study_plans
users (1) ──→ (N) chat_history
users (1) ──→ (N) user_documents
user_documents (1) ──→ (N) document_embeddings
questions (1) ──→ (N) user_responses
questions (1) ──→ (N) exam_attempts
```

---

## 🔐 AUTENTICACIÓN Y SEGURIDAD

### Google OAuth 2.0

**Flow:**
1. User hace click "Ingresar con Google"
2. Redirect a `pages/api/auth/google-callback`
3. Supabase Auth maneja token exchange
4. Crear/actualizar registro en tabla `users`
5. Session storage en Supabase (jwt)
6. Redirect a dashboard o onboarding

**Variables de entorno:**
```env
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxxx
```

### Row Level Security (Supabase RLS)

Habilitado por defecto:
```sql
-- Solo el user puede ver sus propias respuestas
alter table user_responses enable row level security;
create policy "Users can see own responses" on user_responses
  for select using (auth.uid() = user_id);

-- Similar para todas las tablas user_*
```

### API Keys & Webhooks

**Stripe Webhook:**
- Endpoint: `POST /api/webhooks/stripe`
- Events: `payment_intent.succeeded`, `charge.refunded`
- Validación: Verificar firma del webhook con `Stripe.Webhook.ConstructEvent()`

**Gemini API:**
- Key almacenada en `.env.local` (backend only)
- Rate limit: 60 requests/min en free tier
- Cachear resultados donde sea posible

---

## 🎯 FLUJO DE USUARIO COMPLETO

### 1. Landing Page (No autenticado)

```
GET / → Landing page
├─ Hero: "Domina PLD/FT. Aprueba la CNBV."
├─ Features: Test gratis, simulacro, análisis IA, reporte
├─ Social proof: Stats (87% aprobación, 500+ certificados)
├─ CTA primario: "Comenzar prueba gratuita" → /auth/login
└─ CTA secundario: "Ver simulador" → /auth/login
```

### 2. Autenticación (Google OAuth)

```
GET /auth/login → Mostrar "Ingresar con Google"
  ↓
Google OAuth flow
  ↓
POST /api/auth/google-callback
  ↓
Crear/actualizar user en BD
  ↓
Redirect a /dashboard o /onboarding
```

### 3. Onboarding (Usuario nuevo)

```
GET /onboarding

Paso 1: Test diagnóstico
├─ 5-10 preguntas (1 de cada área)
├─ Sin cronómetro
├─ Respuesta inmediata → siguiente pregunta
└─ Botón "Ver mi diagnóstico"

Paso 2: Reporte diagnóstico
├─ Mostrar: Fortalezas (verde) y Brechas (rojo)
├─ Análisis por área con porcentajes
├─ AI-powered insight: "Te recomendamos enfocarte en..."
└─ Botón: "Desbloquear acceso completo"

Paso 3: Paywall (Stripe)
├─ Mostrar precio: $1,999 MXN
├─ Listar features desbloqueados
├─ CTA: "Pagar con Stripe"
├─ Fallback: "Continuar como invitado" (acceso limitado a módulo 1)
└─ Éxito → Redirect a /dashboard
```

### 4. Dashboard (Usuario premium)

```
GET /dashboard

Secciones:
├─ Header
│  ├─ Saludo: "¡Hola, [Nombre]! 👋"
│  ├─ Countdown: "⏱️ 48 días para tu examen"
│  └─ Botón Settings
│
├─ Plan personalizado (izq)
│  ├─ Progress bars por tema
│  └─ "Próximo tema sugerido: Operaciones Sospechosas"
│
├─ Estadísticas (der)
│  ├─ Promedio: 78%
│  ├─ Exámenes completados: 23
│  ├─ Racha activa: 8 días
│  └─ Predicción: "85% probabilidad de aprobación"
│
├─ Simulacro CTA (botón grande verde)
│  └─ "Iniciar simulacro cronometrado (135 preguntas)"
│
├─ Chat IA CTA
│  └─ "Asistente especializado en normativa CNBV"
│
└─ Sesión de hoy (recomendación)
   ├─ "5 preguntas: Identificación de operaciones sospechosas"
   └─ "Botón: Comenzar lección"
```

### 5. Simulacro Cronometrado

```
GET /exam

Pre-inicio:
├─ "Este es el simulacro oficial CNBV"
├─ "135 preguntas • 180 minutos"
├─ Botón: "Comenzar ahora"
└─ Botón: "Volver al dashboard"

Durante examen:
├─ Header con timer (rojo cuando < 10 min)
├─ Progreso: "Pregunta 45 de 135"
├─ Pregunta y 4 opciones (radio buttons)
├─ Botón "Siguiente" (deshabilitado hasta seleccionar)
├─ NO permitir volver atrás
└─ NO mostrar si es correcta/incorrecta en tiempo real

Fin de tiempo:
├─ Automáticamente submit respuestas
└─ Redirect a /exam/results

Fin manual:
├─ Botón "Terminar examen" (confirm modal)
└─ Submit y redirect a /exam/results
```

### 6. Reporte Post-Simulacro

```
GET /exam/results/:attempt_id

Mostrar:
├─ Puntaje total: XX/135 (XX%)
├─ Desglose por áreas (gráfico):
│  ├─ Marco Normativo: 92% ✓
│  ├─ Operaciones Sospechosas: 65%
│  ├─ Casos Prácticos: 41%
│  └─ (todas las áreas)
│
├─ Predicción: "Tienes 78% probabilidad de APROBAR"
│
├─ Preguntas por dificultad:
│  ├─ Easy: 18/20 (90%)
│  ├─ Medium: 45/80 (56%)
│  └─ Hard: 12/35 (34%)
│
├─ Sección: "Preguntas que fallaste"
│  ├─ Mostrar cada pregunta fallida
│  ├─ Tu respuesta vs. respuesta correcta
│  ├─ Explicación completa
│  └─ Link a documentación
│
└─ Botones:
   ├─ "Volver al dashboard"
   ├─ "Intentar otro simulacro"
   └─ "Descargar reporte (PDF)"
```

### 7. Chat IA (RAG)

```
GET /chat

Interfaz:
├─ Historial de chat scrolleable
├─ Input box: "Pregunta sobre normativa CNBV..."
├─ Botones sugeridos (ejemplos):
│  ├─ "¿Qué es una operación sospechosa?"
│  ├─ "Diferencia entre PLD y FT"
│  └─ "Procedimiento de OFAC en México"
│
Respuesta IA:
├─ Mostrar respuesta en markdown
├─ Citar fuentes: "[1] Ley de Instituciones de Crédito, Art. 5"
├─ Timestamp de respuesta
└─ Botón: "Más información" → link a documento

Límites:
├─ Free: 30 preguntas/día
├─ Premium: Ilimitado
└─ Mostrar contador de uso si free
```

### 8. Configuración (Settings)

```
GET /settings

├─ Perfil
│  ├─ Nombre: [editable]
│  ├─ Email: [readonly]
│  ├─ Fecha de examen: [dropdown: 27 jun / 24 oct]
│  └─ Botón: Guardar cambios
│
├─ Acceso
│  ├─ Estado: Free / Premium
│  ├─ Expira: [fecha]
│  └─ Botón: "Comprar acceso" (si expirado)
│
├─ Datos & Privacidad
│  ├─ Botón: "Descargar mis datos" (GDPR)
│  ├─ Botón: "Eliminar mi cuenta" (confirmación modal)
│  └─ Link: "Política de privacidad" → /privacidad
│
└─ Ayuda
   ├─ Link: "Preguntas frecuentes"
   └─ Link: "Contacto soporté"
```

---

## 📡 ENDPOINTS API (Next.js)

### Auth

```
POST /api/auth/google-login
  → Inicia OAuth flow
  
POST /api/auth/google-callback
  → Callback desde Google
  → Crea/actualiza user
  
GET /api/auth/logout
  → Limpia session
```

### User

```
GET /api/user/profile
  → Obtener datos del usuario actual
  
PATCH /api/user/profile
  → Actualizar nombre, exam_date, etc
  
DELETE /api/user/account
  → Borrado completo (física en Storage + lógica en BD)
```

### Questions

```
GET /api/questions?limit=10&topic=marco_normativo
  → Obtener preguntas (paginated)
  
GET /api/questions/diagnostic
  → Obtener 5-10 preguntas para test diagnóstico
```

### Respuestas & Simulacros

```
POST /api/responses
  → Guardar respuesta a una pregunta
  → { question_id, answer_index }
  
POST /api/exam/start
  → Iniciar un nuevo intento de examen
  → Retorna: exam_attempt_id
  
POST /api/exam/submit
  → Enviar respuestas del examen
  → Calcular score, crear reporte
  
GET /api/exam/results/:attempt_id
  → Obtener resultados de un examen
```

### Chat IA

```
POST /api/chat
  → Enviar pregunta al chatbot
  → { message: "¿Qué es PLD?" }
  → Retorna: { response: "...", sources: [...] }
  
GET /api/chat/history
  → Obtener historial de chat del usuario
```

### Plan de Estudio

```
GET /api/study-plan
  → Obtener plan personalizado del usuario
  
GET /api/study-plan/recommendation
  → Obtener próximo tema recomendado
```

### Pagos (Stripe)

```
POST /api/checkout_sessions
  → Crear sesión Stripe
  → Retorna: session_id, checkout_url
  
POST /api/webhooks/stripe
  → Webhook desde Stripe
  → Maneja: payment_intent.succeeded, etc
```

---

## 🏗️ FASES DE EJECUCIÓN

### FASE 1: INVESTIGACIÓN Y ESTRATEGIA (1-2 días)

**Objetivos:**
1. Análisis de mercado rápido (competencia CNBV actual)
2. Validación de precio ($1,999 es viable?)
3. Proyección fiscal (IVA + ISR en Mexico)
4. Propuesta de estructura legal

**Deliverables:**
- `STRATEGY.md` (análisis + recomendaciones)
- `MARKET_ANALYSIS.md` (competencia + precios + fiscal)

**Acciones:**
- Investigar cursos CNBV competidores (Precios, features, reviews)
- Calcular margen neto después de impuestos
- Estimar usuarios/ingresos en 6 meses
- Recomendar estructura fiscal al usuario

---

### FASE 2: DIAGNÓSTICO TÉCNICO (1 día)

**Objetivos:**
1. Validar estado actual del repo
2. Identificar bloqueadores
3. Preparar entorno dev

**Acciones:**
- `git clone` repo, `npm install`
- Revisar estructura Next.js actual
- Verificar Google Drive API (¿funciona?)
- Verificar Supabase connection (¿credenciales OK?)
- Verificar Gemini API
- Generar `.env.local` con placeholders

**Deliverables:**
- `DIAGNOSIS.md` (estado actual, bloqueadores, recomendaciones)
- `.env.local` completado (con placeholders seguros)
- `SETUP.md` (instrucciones para Stripe + OAuth)

---

### FASE 3: PLAN MAESTRO (1 día)

**Objetivos:**
1. Detallar roadmap técnico completo
2. Estimar timeline por componente
3. Identificar dependencias

**Deliverables:**
- `ROADMAP.md` (fases, duraciones, checkpoints)

**Componentes a detallar:**
- Extracción de 135 preguntas
- Pipeline RAG (embeddings)
- Backend Stripe
- Google OAuth
- Paywall logic
- Simulacro cronometrado
- Chatbot IA
- Dashboard
- Settings

---

### FASE 4: EJECUCIÓN (4-7 días)

#### 4.1 Ingesta de Preguntas (2 días)

**Objetivo:** Extraer 135 preguntas de PDFs → JSON → Supabase seed

**Acciones:**
1. Descargar PDFs de Google Drive
2. Usar Gemini API para OCR + parsing
3. Estructurar: `{ question, options[], correct_index, explanation, topic, difficulty }`
4. Validar estructura (sin null/empty)
5. Crear migraciones SQL (tabla `questions`)
6. Seed BD con todas 135 preguntas
7. Verificar integridad (select count de preguntas)

**Validación:**
- [ ] 135 preguntas en DB
- [ ] Todas tienen 4 opciones
- [ ] Distribuidas por tópicos
- [ ] Sin duplicados

#### 4.2 Backend Stripe (1 día)

**Objetivo:** Integrar pagos Stripe (test mode)

**Acciones:**
1. Instalar `stripe` y `@stripe/stripe-js`
2. Crear endpoint `POST /api/checkout_sessions`:
   - Validar user autenticado
   - Crear Stripe session (line item: $1,999 MXN)
   - Retornar checkout URL
3. Crear webhook `POST /api/webhooks/stripe`:
   - Validar firma webhook
   - En `payment_intent.succeeded`:
     - Crear registro en tabla `purchases`
     - Actualizar `user.access_level = 'premium'`
     - Actualizar `user.access_expires_at = 2026-06-28`
4. Crear migraciones SQL (tabla `purchases`)
5. Testear con Stripe test cards

**Test cards:**
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002

#### 4.3 Google OAuth (1 día)

**Objetivo:** Login/Signup vía Google

**Acciones:**
1. Crear proyecto en Google Cloud Console
2. Generar OAuth 2.0 credentials (web application)
3. Configurar URI redirect: `https://[vercel-domain]/api/auth/google-callback`
4. Instalar `@supabase/auth-helpers-nextjs`
5. Crear `pages/api/auth/google-callback` (exchange code for token)
6. Crear componentes:
   - `<GoogleLoginButton>` en landing
   - Login flow: Google → callback → crear user → dashboard
7. Crear tabla `users` (migraciones SQL)
8. Testear con test Google account

#### 4.4 Paywall & Acceso (1 día)

**Objetivo:** Bloquear funcionalidades por tier

**Acciones:**
1. Crear middleware: verificar `user.access_level` en cada request
2. Rutas protegidas:
   - `/simulacro` → premium only
   - `/chat` → free (30/día) o premium (ilimitado)
   - `/modulo-1` → gratis todos
3. Crear componente `<PaywallModal>` (mostrar después de test diagnóstico)
4. Crear tabla `purchases` + lógica de vencimiento:
   - Cron job (o trigger Supabase) que expira acceso automáticamente
   - Check diario: si hoy > `access_expires_at`, set `access_level = 'free'`
5. Testear: crear user, intentar acceder a /simulacro sin pago → paywall

#### 4.5 Test Diagnóstico (1 día)

**Objetivo:** 5-10 preguntas iniciales → resultado inmediato

**Acciones:**
1. Crear endpoint `GET /api/questions/diagnostic` (5-10 preguntas, 1 por area)
2. Crear página `/diagnostic`:
   - Mostrar pregunta
   - 4 opciones (radio)
   - Botón "Siguiente"
   - NO mostrar si correcta hasta el final
3. Post-final:
   - Calcular score por área
   - Crear `study_plan` con recomendaciones
   - Mostrar reporte (gráficos)
   - CTA: "Desbloquear acceso completo" → paywall
4. Guardar resultados en tabla `exam_attempts` (con flag "diagnostic")

#### 4.6 Simulacro Cronometrado (2 días)

**Objetivo:** 135 preguntas, 180 minutos, reporte detallado

**Acciones:**
1. Crear endpoint `POST /api/exam/start` (crea registro en `exam_attempts`)
2. Crear página `/exam`:
   - Timer visual (rojo < 10 min)
   - Mostrar: "Pregunta X de 135"
   - 4 opciones (radio buttons)
   - Botón "Siguiente" (deshabilitado hasta seleccionar)
   - NO permitir back button
   - Auto-submit si time-out
3. Crear endpoint `POST /api/exam/submit`:
   - Validar todas las respuestas
   - Calcular score total y por área
   - Crear reporte JSON
4. Crear página `/exam/results`:
   - Score total (X/135)
   - Gráfico por áreas (bar chart o progress bars)
   - Predicción de aprobación (ML model simple: si score > 75% → 80%+ prob)
   - Mostrar preguntas fallidas + explicaciones
   - Botones: volver, intentar otro, descargar PDF

#### 4.7 RAG Chatbot (2 días)

**Objetivo:** Chat con IA usando tus PDFs como contexto

**Acciones:**
1. Crear tabla `document_embeddings` (chunks de texto + embeddings Gemini)
2. Endpoint `POST /api/documents/upload`:
   - User sube PDF
   - Dividir en chunks (512 tokens)
   - Generar embeddings via Gemini
   - Guardar en `document_embeddings`
3. Endpoint `POST /api/chat`:
   - User pregunta
   - Buscar chunks relevantes (cosine similarity)
   - Pasar a Gemini con RAG prompt
   - Retornar respuesta + citas
   - Guardar en `chat_history`
4. Crear página `/chat`:
   - Historial scrolleable
   - Input box
   - Respuestas en markdown con citas
   - Mostrar contador de preguntas (si free)
5. Limitar: 30/día free, ilimitado premium

#### 4.8 Dashboard & UI General (2 días)

**Objetivo:** Interfaz completa, responsive

**Acciones:**
1. Crear layout general (`_layout.tsx`):
   - Navbar con user menu + countdown
   - Sidebar con navigation
2. Crear `/dashboard`:
   - Plan personalizado (progress bars)
   - Estadísticas (cards)
   - Botones CTA (Simulacro, Chat)
   - Lección sugerida del día
3. Crear `/settings`:
   - Perfil (editar nombre, exam date)
   - Acceso (estado, expira)
   - Privacidad (descargar datos, eliminar cuenta)
4. Responsive design (mobile-first):
   - Layout mobile: single column
   - Tablet: 2 columns max
   - Desktop: full layout
5. Accesibilidad:
   - Alt text en todas las imágenes
   - ARIA labels en inputs
   - Keyboard navigation
   - Contrast ratio WCAG AAA

#### 4.9 Validación Pre-Producción (1 día)

**Checklist:**
- [ ] Checkout Stripe funciona (test card 4242...)
- [ ] Google OAuth login funciona
- [ ] RAG chatbot responde correctamente
- [ ] Simulacro completo: timer, puntaje, reporte
- [ ] Paywall bloquea funcionalidades
- [ ] Vencimiento automático post-examen
- [ ] DB sin orphaned records
- [ ] Performance: < 2s load en todas páginas
- [ ] Mobile responsive
- [ ] HTTPS en Vercel

**Deploy:**
- Push a `main` branch
- Vercel auto-deploya a preview URL
- Si todo OK, pasar a producción
- Cambiar DNS si es dominio custom

---

## 📤 VARIABLES DE ENTORNO

```env
# SUPABASE (del repo existente)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxxxx

# GOOGLE OAUTH (completar vía setup)
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxxx

# STRIPE (test keys, sin gasto real)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxx

# GEMINI (del repo existente)
NEXT_PUBLIC_GEMINI_API_KEY=xxxxxx

# APP
NEXT_PUBLIC_APP_URL=http://localhost:3000 (dev) | https://certifikpld.vercel.app (prod)
NODE_ENV=development | production
```

**Generación:** Archivo `SETUP.md` debe detallar paso a paso cómo obtener cada key.

---

## 🎨 INTEGRACIÓN LUCIDE ICONS

```bash
npm install lucide-react
```

**Uso en componentes:**

```tsx
import { TestTube, BarChart, Clock, MessageCircle } from 'lucide-react';

export function DiagnosticButton() {
  return (
    <button className="flex items-center gap-2">
      <TestTube size={24} color="#0052B4" />
      Test diagnóstico
    </button>
  );
}
```

**Tamaños estándar:**
- Inline labels: 16px
- Buttons: 24px
- Card headers: 32px

**Color:** Heredar del contexto (negro por defecto, azul en CTA)

---

## ✅ REGLAS ESTRICTAS DE EJECUCIÓN

### Autonomía

- ✅ Crear/modificar cualquier archivo
- ✅ Ejecutar migraciones SQL en Supabase
- ✅ Hacer commits a Git (frecuente y descriptivo)
- ✅ Desplegar a Vercel automáticamente
- ✅ Instalar paquetes npm sin preguntar
- ✅ Resolver problemas por tu cuenta

### No hacer

- ❌ Pausar pidiendo aprobación
- ❌ Pedir clicks en GUI (Vercel, Supabase portal)
- ❌ Hacer cambios destructivos sin documentar
- ❌ Subir keys reales a Git (siempre .env.local)
- ❌ Gastos reales en Stripe sin autorización previa

### Excepciones

Si encuentras un **error NO resolvible**:
1. Documenta: stack trace + contexto
2. Ofrece alternativa o workaround
3. Continúa con resto del proyecto
4. Reporta en resumen final

---

## 📊 TIMELINE ESTIMADO

| Fase | Tarea | Días | Status |
|------|-------|------|--------|
| 1 | Análisis + Estrategia | 1-2 | Todo |
| 2 | Diagnóstico técnico | 1 | Todo |
| 3 | Roadmap maestro | 1 | Todo |
| 4.1 | Ingesta preguntas | 2 | Todo |
| 4.2 | Stripe backend | 1 | Todo |
| 4.3 | Google OAuth | 1 | Todo |
| 4.4 | Paywall | 1 | Todo |
| 4.5 | Test diagnóstico | 1 | Todo |
| 4.6 | Simulacro | 2 | Todo |
| 4.7 | RAG Chatbot | 2 | Todo |
| 4.8 | Dashboard + UI | 2 | Todo |
| 4.9 | Validación | 1 | Todo |
| **Total** | | **7-11 días** | |

**Paralelizable:** 4.2, 4.3 (dependencias distintas)

---

## 📋 VALIDACIÓN PRE-INICIO

Antes de empezar, verificar:

- [ ] Repo clonado: `git clone https://github.com/angel011298/pld-master-cnbv`
- [ ] `npm install` sin errores
- [ ] `.env.local` con variables disponibles
- [ ] `npm run dev` inicia sin crashes
- [ ] Supabase conectado (test SELECT 1)
- [ ] Google Drive PDFs accesibles
- [ ] Vercel conectado (auto-deploy en push)

Si algo falla aquí, diagnosticar primero.

---

## 📤 DELIVERABLES FINALES

**Reportar SOLO al final del proyecto:**

1. **URL de Vercel Preview:** Completamente funcional
2. **Resumen Ejecutivo:** (formato markdown)
   - Qué se completó ✅
   - Qué no (con razón) ❌
   - Próximos pasos (V1.5+)
3. **Archivos generados:**
   - `STRATEGY.md`
   - `MARKET_ANALYSIS.md`
   - `DIAGNOSIS.md`
   - `ROADMAP.md`
   - `SETUP.md`
4. **Logs de última ejecución:**
   - Últimos 10 commits
   - Último deploy a Vercel
5. **Instrucciones para usuario:**
   - Cómo completar credenciales Stripe + OAuth
   - Cómo desplegar a producción

**Formato:** Markdown, máx 5 páginas

---

## 🎬 COMIENZA AHORA

1. Lee este prompt completamente
2. Valida que tienes acceso a repo + creds
3. Inicia FASE 1 (análisis)
4. Avanza secuencialmente sin pausas
5. Reporta solo al final

**Modo:** Totalmente autónomo. Código limpio. Documentación integrada.

**Meta:** V1.0 listo para Vercel producción en 7-11 días.

---

**FIN DE MEGAPROMPT**

---

### 🎨 ESPECIFICACIONES VISUALES FINALES (CONFIRMADAS)

**Decidido por usuario:**
- ✅ Fondo: Blanco puro (#FFFFFF)
- ✅ Texto: Negro (#000000) o gris oscuro (#1F2937)
- ✅ Color primario: Azul Institucional #0052B4 (hover: #003D82)
- ✅ Sin gradientes, sin sombras, minimalista profesional
- ✅ Iconografía: Lucide Icons (MIT, npm)
- ✅ Ilustraciones: Paawy.com (primary) + Undraw.co (fallback)

**Implementación:**
1. Instalar Lucide: `npm install lucide-react`
2. Usar color CSS variable: `--primary-blue: #0052B4`
3. Descargar ilustraciones de Paawy, guardar en `/public/illustrations/`
4. Aplicar consistentemente en todos los componentes

**Testing:**
- Validar contraste blanco/negro (WCAG AAA)
- Test en mobile (responsive)
- Test en light/dark mode (si aplica, pero default es light)

---

**FIN DEL MEGAPROMPT - LISTO PARA CLAUDE CODE**
