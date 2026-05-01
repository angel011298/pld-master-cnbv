# PLD-Master Architecture Documentation

**Project**: Certifik PLD - CNBV Exam Preparation Platform  
**Stack**: Next.js 16.2.4, React 18.3.1, TypeScript, Supabase, Tailwind CSS  
**Status**: Production (free + premium tiers with Stripe)

---

## Project Overview

Certifik PLD is a comprehensive learning platform for CNBV PLD/FT (Money Laundering/Terrorism Financing) certification exam preparation in Mexico. It combines:
- **RAG (Retrieval-Augmented Generation)** with 18+ official CNBV PDFs
- **AI tutoring** via Gemini 1.5 (Flash/Pro) and Claude APIs
- **Quiz/exam simulation** with adaptive difficulty
- **Document ingestion** from Google Drive (admin feature)
- **Stripe integration** for premium subscription (individual + corporate tiers)
- **Real-time progress tracking** with XP system and streaks

---

## Folder Structure

```
pld-master-cnbv/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (dashboard)/              # Protected routes (auth required)
│   │   │   ├── chatbot/page.tsx      # AI tutor interface
│   │   │   ├── dashboard/page.tsx    # Main user dashboard
│   │   │   ├── estudio/page.tsx      # Study materials & PDFs
│   │   │   ├── knowledge/page.tsx    # Knowledge base viewer
│   │   │   ├── perfil/page.tsx       # User profile & settings
│   │   │   ├── simulator/page.tsx    # Exam simulator (quiz mode)
│   │   │   ├── tramites/page.tsx     # Certification process guide
│   │   │   ├── foro/page.tsx         # Community forum
│   │   │   ├── entities/page.tsx     # Financial entities reference
│   │   │   └── layout.tsx            # Dashboard wrapper (auth check)
│   │   ├── api/                      # Backend API endpoints
│   │   │   ├── chat/route.ts         # Chat with AI tutor (Gemini)
│   │   │   ├── generate-quiz/route.ts # Generate exam questions
│   │   │   ├── ingest/route.ts       # Upload user documents (PDF)
│   │   │   ├── ingest-drive/route.ts # Ingest from Google Drive folder
│   │   │   ├── list-drive-folder/route.ts # List Drive files
│   │   │   ├── update-xp/route.ts    # Record study events (XP/streaks)
│   │   │   ├── checkout/route.ts     # Stripe session creation
│   │   │   ├── webhook/route.ts      # Stripe webhook handler
│   │   │   ├── forum/route.ts        # Forum posts (future)
│   │   │   ├── marketing/generate/route.ts # Email/marketing content
│   │   │   └── admin/                # Admin-only endpoints
│   │   ├── page.tsx                  # Landing page (auth UI)
│   │   ├── welcome/page.tsx          # Post-signup welcome
│   │   ├── trial/page.tsx            # Trial info
│   │   ├── register/                 # Signup flow
│   │   │   ├── individual/page.tsx
│   │   │   └── corporativo/page.tsx
│   │   ├── invite/page.tsx           # Team invite flow
│   │   ├── terminos/page.tsx         # Terms & conditions
│   │   ├── privacidad/page.tsx       # Privacy policy
│   │   ├── admin/page.tsx            # Admin panel
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   ├── ClientLayout.tsx          # Client-side wrapper
│   │   ├── AuthControls.tsx          # Login/signup controls
│   │   ├── app-sidebar.tsx           # Dashboard sidebar
│   │   ├── QuizSimulator.tsx         # Quiz/exam UI
│   │   ├── TramitesGuide.tsx         # Certification guide
│   │   ├── LearningPath.tsx          # Progress visualization
│   │   ├── IngestDialog.tsx          # PDF upload dialog
│   │   └── ui/                       # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── card.tsx
│   │       ├── table.tsx
│   │       ├── sidebar.tsx
│   │       ├── tabs.tsx
│   │       ├── alert.tsx
│   │       ├── tooltip.tsx
│   │       └── ... (more primitives)
│   ├── hooks/
│   │   ├── useUserProfile.ts         # User profile + XP management
│   │   ├── useSyllabus.ts            # CNBV syllabus data
│   │   ├── use-mobile.ts             # Responsive breakpoint
│   ├── lib/
│   │   ├── supabase.ts               # Supabase client (auth + DB)
│   │   ├── gemini.ts                 # Google Generative AI client
│   │   ├── auth-client.ts            # Auth utilities
│   │   ├── google-drive.ts           # Drive API helpers
│   │   ├── constants.ts              # CNBV syllabus, entity types
│   │   ├── security.ts               # Input validation, rate limiting, IP extraction
│   │   ├── rate-limit.ts             # In-memory rate limiter
│   │   ├── pdf-service.ts            # PDF parsing (pdf-parse)
│   │   ├── customer-id.ts            # Public customer ID generation
│   │   └── utils.ts                  # Tailwind/CSS utilities
├── supabase/
│   ├── schema.sql                    # Database schema (RLS, tables, functions)
│   └── migrations/                   # Version-controlled migrations (if any)
├── scripts/
│   └── seed-global-documents.mjs     # Ingest 18 official CNBV PDFs from Google Drive
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── components.json                   # shadcn/ui config
└── .env.example                      # Environment variables template
```

---

## Database Schema (Supabase PostgreSQL)

### Core Tables

#### `auth.users` (Supabase Auth)
- Built-in auth managed by Supabase
- OAuth (Google) + Email/Password support
- Session tokens stored in JWT

#### `public.user_profiles`
```sql
- user_id (uuid, PK, FK → auth.users)
- public_customer_id (text, unique) -- Format: CL-YYYY-XXXXXX
- full_name (text)
- total_xp (integer)
- current_streak (integer)
- exam_score_prediction (numeric)
- pass_probability (numeric)
- stripe_customer_id (text, unique)
- external_refs (jsonb) -- Custom metadata
- tier (text) -- 'free' | 'premium'
- exam_date (date)
- onboarding_completed (boolean)
- created_at, updated_at (timestamptz)
```

#### `public.documents` (User & Global)
```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users, nullable for global docs)
- name (text) -- PDF filename
- file_type (text) -- 'pdf'
- content (text) -- Full PDF text
- page_count (integer)
- file_size_bytes (integer)
- is_global (boolean) -- true = available to all users (18 official CNBV PDFs)
- created_at (timestamptz)
```

#### `public.document_embeddings` (RAG Vector Storage)
```sql
- id (bigserial, PK)
- document_id (uuid, FK → documents)
- user_id (uuid, FK → auth.users, nullable for global)
- content (text) -- Text chunk (1000 chars, 200 char overlap)
- embedding (vector(768)) -- Gemini text-embedding-004 vector
- metadata (jsonb) -- source, source_file_id, is_global
- created_at (timestamptz)
```
**Indexes**: 
- `ivfflat` on embedding (cosine similarity)
- `user_id`, `document_id`

#### `public.study_events` (Learning Analytics)
```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- event_type (text) -- 'chat' | 'quiz' | 'flashcard' | 'case'
- correct (boolean, nullable)
- topic (text)
- difficulty (text) -- 'Básico' | 'Intermedio' | 'Avanzado'
- response_time_ms (integer)
- created_at (timestamptz)
```

### Key Database Functions

#### `public.generate_public_customer_id()`
- Generates unique customer ID: `CL-YYYY-XXXXXX` (e.g., `CL-2026-000001`)
- Uses sequence `public.customer_seq`

#### `public.touch_updated_at()`
- Trigger function: auto-updates `updated_at` on profile changes

#### `public.match_document_embeddings(p_user_id, query_embedding, match_threshold, match_count)`
- RPC function for vector similarity search
- Returns top K matching chunks + similarity score
- Filters by user ownership or global documents

### Row-Level Security (RLS)

All tables have RLS enabled. Key policies:
- Users can only SELECT/UPDATE/INSERT their own records
- Global documents (`is_global=true`) are readable by all authenticated users
- Service role can bypass RLS (via `supabaseAdmin()`)

---

## API Endpoints

### Chat & Learning

#### `POST /api/chat`
- **Purpose**: AI tutor interaction with RAG
- **Auth**: Required (Bearer token)
- **Rate Limit**: 30 calls/24h per user
- **Request**: `{ messages: Array<{ role, content }> }`
- **Response**: Streamed text (from Gemini 1.5-Flash)
- **Logic**:
  1. Get last user message, embed with Gemini
  2. Vector search user's documents + global docs
  3. Build system prompt with relevant chunks
  4. Call Gemini with context
  5. Stream response

#### `POST /api/generate-quiz`
- **Purpose**: Generate exam questions by topic + difficulty
- **Auth**: Required
- **Rate Limit**: 10 calls/24h
- **Request**: `{ topic: string, difficulty: 'Básico'|'Intermedio'|'Avanzado', count: 1-10 }`
- **Response**: Array of quiz questions (JSON format)
- **AI Model**: Gemini 1.5-Pro (more capable for quiz generation)

### Document Management

#### `POST /api/ingest`
- **Purpose**: Upload and embed user PDF
- **Auth**: Required
- **Max Size**: 5MB per file
- **Max Count**: 3 files per user (enforced in app)
- **Logic**:
  1. Parse PDF with pdf-parse
  2. Chunk text (1000 chars, 200 overlap)
  3. Generate embeddings (Gemini text-embedding-004)
  4. Store in `documents` + `document_embeddings`

#### `POST /api/ingest-drive`
- **Purpose**: Ingest PDFs from Google Drive folder
- **Auth**: Required + admin check
- **Logic**:
  1. List folder contents via Google Drive API
  2. Download PDFs
  3. Parse and embed (same as `/api/ingest`)

#### `POST /api/list-drive-folder`
- **Purpose**: List PDFs in a Google Drive folder
- **Auth**: Required
- **Response**: Array of Drive files with IDs, sizes

### Gamification

#### `POST /api/update-xp`
- **Purpose**: Record study event (quiz answer, chat, etc.)
- **Auth**: Required
- **Request**: `{ event_type, correct?, topic, difficulty, response_time_ms }`
- **Logic**:
  1. Insert into `study_events`
  2. Update user XP/streak in `user_profiles`

### Payments

#### `POST /api/checkout`
- **Purpose**: Create Stripe Checkout Session
- **Auth**: Required
- **Request**: `{ plan: 'individual'|'corporativo', email }`
- **Pricing**:
  - Individual: $2,999.00 MXN (299900 cents)
  - Corporate: $9,999.00 MXN (999900 cents)
- **Logic**:
  1. Create/find Stripe customer
  2. Create Session with return URL
  3. Store stripe_customer_id in profile

#### `POST /api/webhook`
- **Purpose**: Stripe webhook handler (payment events)
- **Events Handled**:
  - `charge.succeeded`: Update tier → 'premium', store payment date
  - `customer.subscription.deleted`: Downgrade tier → 'free'
- **Signature Verification**: HMAC-SHA256

### Marketing/Utils

#### `POST /api/marketing/generate`
- **Purpose**: Generate marketing copy (future)
- **Auth**: Required

#### `POST /api/forum`
- **Purpose**: Forum posts (future development)

#### `POST /api/admin/*`
- **Purpose**: Admin-only endpoints (seed, cleanup, etc.)
- **Auth**: Required + admin secret key

---

## Environment Variables

All environment variables are documented in `.env.example`. Required for:

### Supabase (Database & Auth)
- `NEXT_PUBLIC_SUPABASE_URL` – Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Anon key for browser client
- `SUPABASE_SERVICE_ROLE_KEY` – Service role (server-side admin operations)

### AI & APIs
- `GEMINI_API_KEY` – Google Generative AI (embeddings, chat)
- `ANTHROPIC_API_KEY` – Claude API (optional, for future features)
- `OPENAI_API_KEY` – OpenAI API (optional, fallback)
- `GOOGLE_DRIVE_API_KEY` – Google Drive API (ingest PDFs)

### Stripe (Payments)
- `STRIPE_SECRET_KEY` – Stripe API key (server-side)
- `STRIPE_WEBHOOK_SECRET` – Stripe webhook signing secret

### Security & Config
- `ADMIN_SECRET_KEY` – Secret for admin endpoints (seed, cleanup)
- `SEED_SECRET` – Secret for seed script
- `NEXT_PUBLIC_SITE_URL` – Base URL (localhost:3000 or vercel domain)

---

## Development Commands

### Local Setup
```bash
# Install dependencies
npm install

# Create .env.local with variables (see .env.example)
cp .env.example .env.local
# Edit .env.local with your actual keys

# Run development server
npm run dev
# → Open http://localhost:3000
```

### Database Setup
```bash
# Supabase schema is auto-applied via Migrations tab in Supabase Dashboard
# Or manually run supabase/schema.sql in Supabase SQL Editor

# Seed 18 official CNBV PDFs from Google Drive (optional)
npm run seed
# Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY in .env.local
```

### Build & Production
```bash
# Type check + build
npm run build

# Start production server (after build)
npm start

# Lint
npm run lint
```

---

## Technology Stack

### Frontend
- **Next.js 16.2.4** – React + SSR/SSG
- **React 18.3.1** – UI library
- **TypeScript 5.6.3** – Type safety
- **Tailwind CSS 3.4.14** – Utility-first styling
- **Tailwind Animate** – Animation utilities
- **Framer Motion 11.11.17** – Advanced animations
- **shadcn/ui** – Accessible component library
- **Lucide React 0.460.0** – Icons
- **Recharts 3.8.1** – Charts/graphs
- **Canvas Confetti 1.9.4** – Celebration effects

### Backend & Services
- **Supabase** – PostgreSQL + Auth + Real-time
  - Extensions: `pgvector` (embeddings), `pgcrypto` (IDs)
  - Row-level security (RLS) for data isolation
- **Google Generative AI (Gemini)** – LLM + Embeddings
  - `gemini-1.5-pro` – Complex reasoning (quiz generation)
  - `gemini-1.5-flash` – Fast inference (chat)
  - `text-embedding-004` – Vector embeddings (RAG)
- **Google Drive API** – Document sourcing
- **Stripe** – Payments & subscriptions
- **Anthropic Claude API** – Optional AI fallback

### Deployment
- **Vercel** – Recommended (Next.js optimal)
- **Serverless Functions** – API routes on Vercel Edge/Serverless
- **Edge Network CDN** – Global content delivery

---

## Key Features

### 1. Learning Hub
- **Study Materials**: 18+ official CNBV PDFs as global documents
- **AI Tutor**: Chat interface powered by Gemini (with RAG context)
- **Syllabus**: 3 modules × 10+ topics organized by CNBV curriculum

### 2. Exam Preparation
- **Quiz Simulator**: Generate practice questions by topic/difficulty
- **Progress Tracking**: XP system, streaks, exam score prediction
- **Document Repository**: Upload personal study notes (max 3 files, 5MB each)

### 3. Certification Info
- **Trámites Guide**: Official CNBV certification process
- **Entities Reference**: Database of 20+ regulated financial entities
- **Legal Docs**: Terms, privacy policy, certification requirements

### 4. Subscription Model
- **Free Tier**: Limited chat (30/day), no premium features
- **Premium Individual**: Unlimited access, 12 months ($2,999 MXN)
- **Premium Corporate**: 5 users, 12 months ($9,999 MXN)
- **Stripe Integration**: Secure checkout, webhook auto-upgrade

### 5. Security & Compliance
- **Row-Level Security**: PostgreSQL RLS on all user data
- **Input Validation**: Text sanitization, message validation
- **Rate Limiting**: Per-user, per-IP rate limits on chat/quiz
- **JWT Auth**: Supabase managed sessions

---

## Data Models

### User Profile
```typescript
interface UserProfile {
  user_id: UUID;
  public_customer_id: string;        // CL-2026-000001
  full_name?: string;
  total_xp: number;                  // Cumulative points
  current_streak: number;            // Days of activity
  exam_score_prediction?: number;    // ML model prediction
  pass_probability?: number;
  stripe_customer_id?: string;
  external_refs: Record<string, any>;
  tier: 'free' | 'premium';
  exam_date?: Date;
  onboarding_completed: boolean;
  created_at: Date;
  updated_at: Date;
}
```

### Document (PDF)
```typescript
interface Document {
  id: UUID;
  user_id?: UUID;                    // null for global docs
  name: string;
  file_type: 'pdf';
  content: string;                   // Full text
  page_count: number;
  file_size_bytes: number;
  is_global: boolean;
  created_at: Date;
}
```

### Embedding (Vector)
```typescript
interface DocumentEmbedding {
  id: BigInt;
  document_id: UUID;
  user_id?: UUID;
  content: string;                   // Text chunk
  embedding: Vector<768>;            // Gemini embedding
  metadata: {
    source?: string;
    source_file_id?: string;
    is_global?: boolean;
  };
  created_at: Date;
}
```

### Study Event
```typescript
interface StudyEvent {
  id: UUID;
  user_id: UUID;
  event_type: 'chat' | 'quiz' | 'flashcard' | 'case';
  correct?: boolean;
  topic?: string;
  difficulty?: 'Básico' | 'Intermedio' | 'Avanzado';
  response_time_ms?: number;
  created_at: Date;
}
```

---

## Deployment Notes

### Vercel (Recommended)
1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel project settings
3. Deploy → Automatic builds on git push
4. Serverless functions handle `/api/*` routes
5. Edge Network handles static assets

### Environment Setup
- Use `.env.example` as template
- For local: create `.env.local`
- For production: set vars in Vercel dashboard (never commit `.env.local`)

### Database Migrations
- Supabase auto-manages migrations
- SQL in `supabase/schema.sql` defines schema
- Apply via Supabase dashboard or `supabase db push` (with CLI)

---

## Known Limitations & Future Work

### Current
- Rate limiting is in-memory (resets on server restart; use Redis for production)
- Forum feature stubbed (no implementation)
- Stripe webhook assumes `2026-03-25.dahlia` API version (may need update)
- Admin endpoints require `ADMIN_SECRET_KEY` header (not tied to Supabase roles)

### Future Enhancements
- Real-time collaboration (forum, chat presence)
- Redis-backed rate limiting
- Advanced analytics dashboard
- Exam score prediction model (ML)
- Team/group study features
- Export progress (PDF reports)

---

## Debugging

### Common Issues

**"Falta NEXT_PUBLIC_SUPABASE_URL"**
- Check `.env.local` has `NEXT_PUBLIC_SUPABASE_URL=https://...`
- This must be readable by browser (public prefix)

**Vector search returns no results**
- Ensure documents are ingested (check `documents` + `document_embeddings` tables)
- Check similarity threshold in `/api/chat` (currently 0.3)
- Verify embeddings dimension is 768 (Gemini text-embedding-004)

**"Límite diario alcanzado (30 interacciones)"**
- Rate limit is 30 calls/24h for `/api/chat`
- In-memory store resets on server restart; for production, use Redis

**Stripe webhook failures**
- Verify `STRIPE_WEBHOOK_SECRET` matches Vercel env
- Check webhook endpoint URL in Stripe dashboard
- API version mismatch: see `src/app/api/webhook/route.ts`

### Logs
- **Browser**: DevTools Console (client-side errors)
- **Server**: `npm run dev` logs (local)
- **Production**: Vercel deployment logs (https://vercel.com/dashboard)
- **Database**: Supabase SQL Editor (query logs)

---

## Codebase Conventions

### File Organization
- Components: `/src/components/*.tsx` or `/src/components/ui/*.tsx`
- Pages: `/src/app/**/page.tsx`
- API: `/src/app/api/**/route.ts`
- Utilities: `/src/lib/*.ts`
- Hooks: `/src/hooks/*.ts`

### Naming
- PascalCase for React components
- camelCase for functions/variables
- SCREAMING_SNAKE_CASE for constants
- Suffix `-admin` for admin-only pages/routes

### TypeScript
- Strict mode enabled in `tsconfig.json`
- Use explicit types for API responses
- Import type with `import type` for type-only imports

---

## Additional Resources

- **CNBV PLD/FT Official**: https://www.cnbv.gob.mx
- **Supabase Docs**: https://supabase.com/docs
- **Gemini API**: https://ai.google.dev/
- **Next.js App Router**: https://nextjs.org/docs/app
- **Stripe Webhooks**: https://stripe.com/docs/webhooks
- **shadcn/ui**: https://ui.shadcn.com/

---

**Last Updated**: 2026-05-01  
**Maintainer**: Development Team
