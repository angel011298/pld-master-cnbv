-- =====================================================================
-- PLD-Master CNBV — Schema v2 (incremental migration)
-- =====================================================================
-- Builds on supabase/schema.sql. SAFE to run in production:
--   • All CREATE statements use IF NOT EXISTS
--   • All ALTER TABLE statements use ADD COLUMN IF NOT EXISTS
--   • No destructive operations (no DROP TABLE, no column removals)
--   • Existing rows preserved (defaults filled in for new columns)
--
-- Adds:
--   • companies                — corporate accounts (max 5 seats)
--   • user_profiles ALTER      — plan, trial_questions_used, company_id, last_active_at
--   • quiz_bank                — curated question bank with stats
--   • spaced_reviews           — SM-2 spaced repetition state
--   • exam_sessions            — full exam attempts
--   • exam_answers             — per-question responses
--   • user_achievements        — unlocked badges/milestones
--
-- Note: existing user_profiles already has total_xp + current_streak,
-- so we extend that table instead of creating a separate user_progress.
-- This keeps a single source of truth and avoids dual-write bugs.
-- =====================================================================

-- Required extensions (idempotent)
create extension if not exists vector;
create extension if not exists pgcrypto;

-- =====================================================================
-- 1. ENUM TYPES
-- =====================================================================

-- Topic taxonomy used by quiz_bank, spaced_reviews and analytics.
-- Wrapped in DO block to be re-runnable (CREATE TYPE has no IF NOT EXISTS).
do $$
begin
  if not exists (select 1 from pg_type where typname = 'pld_topic') then
    create type public.pld_topic as enum (
      'marco_legal',     -- LFPIORPI, Disposiciones de Carácter General
      'gafi',            -- GAFI, ONU, Grupo Egmont, recomendaciones internacionales
      'kyc_cdd',         -- Identificación / Conocimiento del Cliente, perfil transaccional
      'reportes_cnbv',   -- Operaciones Relevantes, Inusuales, Internas Preocupantes
      'une',             -- Unidad de Cumplimiento / Oficial de Cumplimiento
      'sanciones',       -- Listas OFAC, ONU, sanciones administrativas CNBV
      'tipologias'       -- Tipologías de LD/FT, casos prácticos, señales de alerta
    );
  end if;
end$$;

-- =====================================================================
-- 2. COMPANIES
-- =====================================================================
-- Corporate accounts that own a pool of seats. The admin_user_id is the
-- person who completes Stripe checkout for the corporate plan; they can
-- invite up to (max_seats) team members via /invite.
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  max_seats integer not null default 5 check (max_seats > 0),
  seats_used integer not null default 0 check (seats_used >= 0),
  admin_user_id uuid references auth.users(id) on delete set null,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists companies_admin_user_id_idx on public.companies(admin_user_id);

drop trigger if exists trg_companies_updated_at on public.companies;
create trigger trg_companies_updated_at
before update on public.companies
for each row execute function public.touch_updated_at();

-- =====================================================================
-- 3. EXTEND user_profiles
-- =====================================================================
-- Evolves the existing 'tier' column (free|premium) into a richer 'plan'
-- column (trial|premium_individual|corporativo). Both columns coexist for
-- backwards compatibility; a sync trigger keeps tier in sync with plan.
alter table public.user_profiles
  add column if not exists plan text
    check (plan in ('trial', 'premium_individual', 'corporativo'));

-- Backfill plan from tier for existing rows (one-time, idempotent).
update public.user_profiles
set plan = case
  when tier = 'premium' then 'premium_individual'
  else 'trial'
end
where plan is null;

alter table public.user_profiles
  alter column plan set default 'trial',
  alter column plan set not null;

alter table public.user_profiles
  add column if not exists trial_questions_used integer not null default 0
    check (trial_questions_used >= 0);

alter table public.user_profiles
  add column if not exists company_id uuid references public.companies(id) on delete set null;

alter table public.user_profiles
  add column if not exists last_active_at timestamptz;

create index if not exists user_profiles_company_id_idx on public.user_profiles(company_id);
create index if not exists user_profiles_plan_idx on public.user_profiles(plan);

-- Sync trigger: when 'plan' changes, mirror it onto legacy 'tier'.
create or replace function public.sync_plan_to_tier()
returns trigger
language plpgsql
as $$
begin
  new.tier = case
    when new.plan in ('premium_individual', 'corporativo') then 'premium'
    else 'free'
  end;
  return new;
end;
$$;

drop trigger if exists trg_user_profiles_sync_plan on public.user_profiles;
create trigger trg_user_profiles_sync_plan
before insert or update of plan on public.user_profiles
for each row execute function public.sync_plan_to_tier();

-- =====================================================================
-- 4. QUIZ_BANK
-- =====================================================================
-- Curated question bank. Editorially reviewed; not user-generated.
-- veces_respondida + tasa_acierto are auto-maintained by a trigger on
-- exam_answers (see section 9).
create table if not exists public.quiz_bank (
  id uuid primary key default gen_random_uuid(),
  pregunta text not null,
  opcion_a text not null,
  opcion_b text not null,
  opcion_c text not null,
  opcion_d text not null,
  respuesta_correcta char(1) not null check (respuesta_correcta in ('A','B','C','D')),
  explicacion text not null,
  fuente_documento text,                                   -- e.g. "LFPIORPI Art. 17"
  pagina_referencia integer check (pagina_referencia is null or pagina_referencia > 0),
  tema public.pld_topic not null,
  dificultad smallint not null default 1 check (dificultad between 1 and 3),
  veces_respondida bigint not null default 0,
  tasa_acierto numeric(5,4) not null default 0 check (tasa_acierto between 0 and 1),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quiz_bank_tema_idx on public.quiz_bank(tema);
create index if not exists quiz_bank_dificultad_idx on public.quiz_bank(dificultad);
create index if not exists quiz_bank_active_idx on public.quiz_bank(active) where active = true;
create index if not exists quiz_bank_tema_dificultad_idx on public.quiz_bank(tema, dificultad) where active = true;

drop trigger if exists trg_quiz_bank_updated_at on public.quiz_bank;
create trigger trg_quiz_bank_updated_at
before update on public.quiz_bank
for each row execute function public.touch_updated_at();

-- =====================================================================
-- 5. SPACED_REVIEWS (SM-2)
-- =====================================================================
-- One row per (user, question). Implements the SuperMemo SM-2 algorithm:
--   ease_factor: starts at 2.5, decreases on poor answers (min 1.3)
--   interval_days: gap until next review
--   repetitions: consecutive correct answers
-- Update logic lives in the API layer (/api/update-xp or /api/review).
create table if not exists public.spaced_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.quiz_bank(id) on delete cascade,
  next_review_at timestamptz not null default now(),
  interval_days integer not null default 1 check (interval_days >= 0),
  ease_factor numeric(4,2) not null default 2.50 check (ease_factor >= 1.30),
  repetitions integer not null default 0 check (repetitions >= 0),
  last_reviewed_at timestamptz,
  last_quality smallint check (last_quality is null or last_quality between 0 and 5),
  created_at timestamptz not null default now(),
  unique (user_id, question_id)
);

create index if not exists spaced_reviews_user_id_idx on public.spaced_reviews(user_id);
create index if not exists spaced_reviews_due_idx on public.spaced_reviews(user_id, next_review_at);
create index if not exists spaced_reviews_question_id_idx on public.spaced_reviews(question_id);

-- =====================================================================
-- 6. EXAM_SESSIONS
-- =====================================================================
-- Aggregate record of an exam attempt (simulacro, practica, repaso).
-- Score is computed once estado='completado'. duracion_seg is wall-clock
-- time the user spent in the session.
create table if not exists public.exam_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  score numeric(5,2) check (score is null or (score >= 0 and score <= 100)),
  fecha timestamptz not null default now(),
  duracion_seg integer check (duracion_seg is null or duracion_seg >= 0),
  estado text not null default 'en_progreso'
    check (estado in ('en_progreso', 'completado', 'abandonado')),
  total_questions integer not null default 0 check (total_questions >= 0),
  correct_answers integer not null default 0 check (correct_answers >= 0),
  exam_type text not null default 'simulacro'
    check (exam_type in ('simulacro', 'practica', 'repaso')),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists exam_sessions_user_id_idx on public.exam_sessions(user_id);
create index if not exists exam_sessions_user_fecha_idx on public.exam_sessions(user_id, fecha desc);
create index if not exists exam_sessions_estado_idx on public.exam_sessions(estado);

-- =====================================================================
-- 7. EXAM_ANSWERS
-- =====================================================================
-- Per-question response within a session. opcion_elegida is nullable to
-- support skipped questions. es_correcta is denormalized for fast scoring.
create table if not exists public.exam_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.exam_sessions(id) on delete cascade,
  question_id uuid not null references public.quiz_bank(id) on delete cascade,
  opcion_elegida char(1) check (opcion_elegida is null or opcion_elegida in ('A','B','C','D')),
  es_correcta boolean not null default false,
  tiempo_respuesta_seg integer check (tiempo_respuesta_seg is null or tiempo_respuesta_seg >= 0),
  answered_at timestamptz not null default now()
);

create index if not exists exam_answers_session_id_idx on public.exam_answers(session_id);
create index if not exists exam_answers_question_id_idx on public.exam_answers(question_id);

-- =====================================================================
-- 8. USER_ACHIEVEMENTS
-- =====================================================================
-- Unlocked badges/milestones. achievement_key is a stable string defined
-- in the app layer (e.g. 'first_quiz', '7_day_streak', 'perfect_simulacro',
-- 'all_modules_completed'). Unique constraint prevents duplicates.
create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_key text not null,
  unlocked_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique (user_id, achievement_key)
);

create index if not exists user_achievements_user_id_idx on public.user_achievements(user_id);

-- =====================================================================
-- 9. TRIGGERS — quiz_bank stats auto-maintenance
-- =====================================================================
-- Recomputes veces_respondida and tasa_acierto whenever a new exam_answer
-- is inserted. Atomic UPDATE: increments counter and rolls running average
-- without a subquery scan.
create or replace function public.update_quiz_bank_stats()
returns trigger
language plpgsql
as $$
begin
  update public.quiz_bank
  set
    veces_respondida = veces_respondida + 1,
    tasa_acierto = (
      (tasa_acierto * veces_respondida) + (case when new.es_correcta then 1 else 0 end)
    ) / (veces_respondida + 1),
    updated_at = now()
  where id = new.question_id;
  return new;
end;
$$;

drop trigger if exists trg_exam_answers_update_quiz_stats on public.exam_answers;
create trigger trg_exam_answers_update_quiz_stats
after insert on public.exam_answers
for each row execute function public.update_quiz_bank_stats();

-- =====================================================================
-- 10. ROW-LEVEL SECURITY
-- =====================================================================

-- 10.1 companies — admin can manage; members can read their own company
alter table public.companies enable row level security;

drop policy if exists "companies_select_member" on public.companies;
create policy "companies_select_member"
on public.companies
for select
using (
  auth.uid() = admin_user_id
  or exists (
    select 1 from public.user_profiles up
    where up.user_id = auth.uid() and up.company_id = companies.id
  )
);

drop policy if exists "companies_update_admin" on public.companies;
create policy "companies_update_admin"
on public.companies
for update
using (auth.uid() = admin_user_id);

drop policy if exists "companies_insert_admin" on public.companies;
create policy "companies_insert_admin"
on public.companies
for insert
with check (auth.uid() = admin_user_id);

-- 10.2 quiz_bank — readable by all authenticated users (no inserts via API)
alter table public.quiz_bank enable row level security;

drop policy if exists "quiz_bank_select_all" on public.quiz_bank;
create policy "quiz_bank_select_all"
on public.quiz_bank
for select
to authenticated
using (active = true);

-- Note: writes to quiz_bank go through the service role (admin seed scripts).
-- No INSERT/UPDATE/DELETE policies for regular users.

-- 10.3 spaced_reviews — own only
alter table public.spaced_reviews enable row level security;

drop policy if exists "spaced_reviews_select_own" on public.spaced_reviews;
create policy "spaced_reviews_select_own"
on public.spaced_reviews for select using (auth.uid() = user_id);

drop policy if exists "spaced_reviews_insert_own" on public.spaced_reviews;
create policy "spaced_reviews_insert_own"
on public.spaced_reviews for insert with check (auth.uid() = user_id);

drop policy if exists "spaced_reviews_update_own" on public.spaced_reviews;
create policy "spaced_reviews_update_own"
on public.spaced_reviews for update using (auth.uid() = user_id);

drop policy if exists "spaced_reviews_delete_own" on public.spaced_reviews;
create policy "spaced_reviews_delete_own"
on public.spaced_reviews for delete using (auth.uid() = user_id);

-- 10.4 exam_sessions — own only
alter table public.exam_sessions enable row level security;

drop policy if exists "exam_sessions_select_own" on public.exam_sessions;
create policy "exam_sessions_select_own"
on public.exam_sessions for select using (auth.uid() = user_id);

drop policy if exists "exam_sessions_insert_own" on public.exam_sessions;
create policy "exam_sessions_insert_own"
on public.exam_sessions for insert with check (auth.uid() = user_id);

drop policy if exists "exam_sessions_update_own" on public.exam_sessions;
create policy "exam_sessions_update_own"
on public.exam_sessions for update using (auth.uid() = user_id);

-- 10.5 exam_answers — readable/writable only via owned session
alter table public.exam_answers enable row level security;

drop policy if exists "exam_answers_select_own" on public.exam_answers;
create policy "exam_answers_select_own"
on public.exam_answers
for select
using (
  exists (
    select 1 from public.exam_sessions s
    where s.id = exam_answers.session_id and s.user_id = auth.uid()
  )
);

drop policy if exists "exam_answers_insert_own" on public.exam_answers;
create policy "exam_answers_insert_own"
on public.exam_answers
for insert
with check (
  exists (
    select 1 from public.exam_sessions s
    where s.id = exam_answers.session_id and s.user_id = auth.uid()
  )
);

-- 10.6 user_achievements — own only
alter table public.user_achievements enable row level security;

drop policy if exists "user_achievements_select_own" on public.user_achievements;
create policy "user_achievements_select_own"
on public.user_achievements for select using (auth.uid() = user_id);

drop policy if exists "user_achievements_insert_own" on public.user_achievements;
create policy "user_achievements_insert_own"
on public.user_achievements for insert with check (auth.uid() = user_id);

-- =====================================================================
-- 11. HELPER VIEWS (optional, used by dashboard)
-- =====================================================================

-- Reviews due today for a user (drives the "/dashboard" recall card).
create or replace view public.v_due_reviews as
select
  sr.user_id,
  sr.question_id,
  sr.next_review_at,
  sr.ease_factor,
  sr.repetitions,
  qb.tema,
  qb.dificultad
from public.spaced_reviews sr
join public.quiz_bank qb on qb.id = sr.question_id
where sr.next_review_at <= now()
  and qb.active = true;

-- Per-user accuracy by topic (drives /perfil progress charts).
create or replace view public.v_user_topic_accuracy as
select
  s.user_id,
  qb.tema,
  count(*)::int                                                  as total_answers,
  sum(case when ea.es_correcta then 1 else 0 end)::int           as correct_answers,
  round(avg(case when ea.es_correcta then 1.0 else 0.0 end), 4)  as accuracy
from public.exam_answers ea
join public.exam_sessions s on s.id = ea.session_id
join public.quiz_bank qb on qb.id = ea.question_id
group by s.user_id, qb.tema;
