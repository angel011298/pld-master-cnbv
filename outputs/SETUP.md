# SETUP.md — Configuración de Credenciales
## Certifik PLD — Guía de Setup Local

> Para desarrollo local. En Vercel, las variables se configuran en el dashboard del proyecto.

---

## Estado actual del `.env.local`

Las siguientes variables **ya están configuradas** en `.env.local`:

```
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ GEMINI_API_KEY
✅ GOOGLE_DRIVE_API_KEY
✅ SEED_SECRET
```

Lo que falta para desarrollo local completo:

---

## 1. Supabase — Activar localhost (2 minutos)

El proyecto Supabase tiene restricción de hosts habilitada. Para desarrollar localmente:

### Pasos:

1. Ir a https://supabase.com/dashboard
2. Seleccionar el proyecto (`xuwestiepwhlbdnwyblb`)
3. Click en **Settings** (engranaje en el menú izquierdo)
4. Click en **API**
5. Bajar hasta **"Allowed Origins"** o **"Restrict usage by origin"**
6. Agregar: `http://localhost:3000`
7. Click **Save**

### Alternativa (si no encuentras la opción):

En Settings → API, busca "Additional security" y desactiva la restricción para el proyecto de desarrollo.

**Resultado:** `npm run dev` conectará a Supabase sin errores.

---

## 2. Supabase — Verificar migraciones SQL (5 minutos)

Las migraciones de la base de datos están en:
- `supabase/migrations/000_full_schema.sql`
- `supabase/migrations/001_global_documents.sql`

### Verificar si están aplicadas:

1. Ir a https://supabase.com/dashboard → tu proyecto
2. Click en **Table Editor** (menú izquierdo)
3. Verificar que existan las tablas principales (ej. `users`, `documents`, `document_embeddings`)

### Si NO existen las tablas:

1. Click en **SQL Editor** (menú izquierdo)
2. Abrir el archivo `supabase/migrations/000_full_schema.sql`
3. Copiar el contenido y pegarlo en el SQL Editor
4. Click **Run**
5. Repetir con `supabase/migrations/001_global_documents.sql`

---

## 3. Supabase Auth — Google OAuth (5 minutos)

La autenticación con Google se configura directamente en Supabase (no requiere variables en `.env.local`).

### Pasos:

1. Ir a https://supabase.com/dashboard → tu proyecto
2. Click en **Authentication** → **Providers**
3. Buscar "Google" y activarlo (toggle)
4. Necesitarás un Client ID y Client Secret de Google Cloud

### Crear credenciales Google OAuth:

1. Ir a https://console.cloud.google.com/
2. Seleccionar o crear proyecto "Certifik PLD"
3. Ir a **APIs & Services** → **Credentials**
4. Click **+ Create Credentials** → **OAuth client ID**
5. Tipo: **Web application**
6. Nombre: "Certifik PLD"
7. En **Authorized redirect URIs** agregar:
   - `https://xuwestiepwhlbdnwyblb.supabase.co/auth/v1/callback`
   - `http://localhost:3000` (para pruebas locales)
8. Click **Create**
9. Copiar **Client ID** y **Client Secret**

### Pegar en Supabase:

10. Volver a Supabase → Authentication → Providers → Google
11. Pegar el Client ID y Client Secret
12. Click **Save**

**Resultado:** El botón "Iniciar sesión con Google" funcionará.

---

## 4. Stripe — Pagos (cuando se implemente en Fase 3)

> Stripe aún no está en el proyecto. Estas instrucciones son para cuando se añada.

### Instalación:

```bash
npm install stripe @stripe/stripe-js
```

### Obtener credenciales (modo test):

1. Ir a https://dashboard.stripe.com/register (crear cuenta si no tienes)
2. En el dashboard, ir a **Developers** → **API keys**
3. Copiar:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`

### Agregar a `.env.local`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_XXXX
STRIPE_SECRET_KEY=sk_test_XXXX
```

### Configurar Webhook (para recibir eventos de pago):

1. En Stripe dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. URL: `https://[TU-VERCEL-DOMAIN]/api/webhooks/stripe`
4. Seleccionar eventos:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `customer.subscription.created` (si usas suscripciones)
5. Click **Add endpoint**
6. Ver el webhook creado → copiar **Signing secret** (`whsec_...`)

### Agregar a `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_XXXX
```

**Para testing local del webhook:**

```bash
# Instalar Stripe CLI
npm install -g stripe

# Reenviar eventos a localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 5. Template `.env.example`

Crea un archivo `.env.example` en la raíz (sin valores reales, solo estructura):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJXXXXXX
SUPABASE_SERVICE_ROLE_KEY=eyJXXXXXX

# Google AI
GEMINI_API_KEY=AIzaSyXXXXXX

# Google Drive
GOOGLE_DRIVE_API_KEY=AIzaSyXXXXXX

# Admin
SEED_SECRET=your-seed-secret-here

# Stripe (Fase 3 - aún no implementado)
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_XXXX
# STRIPE_SECRET_KEY=sk_test_XXXX
# STRIPE_WEBHOOK_SECRET=whsec_XXXX

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 6. Verificación Final

Una vez completada la configuración, ejecutar:

```bash
# Iniciar servidor de desarrollo
npm run dev

# Verificar en el navegador
open http://localhost:3000
```

### Checklist de funcionalidades a probar:

```
□ Carga la página principal (/)
□ Login con Google funciona (Supabase Auth)
□ Chatbot responde (/chatbot)
□ Simulador carga preguntas (/simulator)
□ Página de conocimiento carga (/knowledge)
□ Ingesta de PDF funciona (si hay documento de prueba)
```

---

## Troubleshooting

### Error: "Host not in allowlist"
→ Ver sección 1: Agregar localhost al Supabase allowlist

### Error: "Debes iniciar sesión con Google"
→ Ver sección 3: Configurar Google OAuth en Supabase

### Error: "GEMINI_API_KEY no configurada"
→ Verificar que `.env.local` tenga `GEMINI_API_KEY=...` con formato `=` (no tabs)

### Error: "Cannot find module '@supabase/supabase-js'"
→ Ejecutar `npm install`

### Build falla con TypeScript errors
→ Ejecutar `npx tsc --noEmit` para ver errores detallados

### Vercel deployment falla
→ Verificar que todas las env vars estén configuradas en Vercel Dashboard → Settings → Environment Variables
