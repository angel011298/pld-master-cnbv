-- ============================================================
-- MIGRATION 002 — FASE 4: V1.0 con B2B + Foro + CFDI 4.0
-- + Precio Escalonado + Referidos + Blog + Testimonios
-- Idempotente: safe to re-run.
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- Role column on user_profiles (super_admin, user)
-- ============================================================
alter table public.user_profiles
  add column if not exists role text not null default 'user';

alter table public.user_profiles
  add column if not exists access_level text not null default 'free';
  -- 'free' | 'premium' | 'b2b_active'

alter table public.user_profiles
  add column if not exists access_expires_at timestamptz;

alter table public.user_profiles
  add column if not exists exam_cycle text;
  -- 'jun_2026' | 'oct_2026' | 'recertificacion_5anos'

alter table public.user_profiles
  add column if not exists organization_id uuid;

-- ============================================================
-- Organizations (B2B)
-- ============================================================
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rfc text,
  razon_social text,
  regimen_fiscal text,
  email_contacto text,
  telefono text,
  max_seats integer not null default 20,
  used_seats integer not null default 0,
  admin_user_id uuid references auth.users(id) on delete set null,
  access_level text not null default 'b2b_active',
  access_expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists organizations_admin_user_idx
  on public.organizations(admin_user_id);

-- ============================================================
-- Organization Members
-- ============================================================
create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  role text not null default 'member', -- 'admin' | 'member'
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  unique (organization_id, email)
);

create index if not exists org_members_org_idx
  on public.organization_members(organization_id);
create index if not exists org_members_user_idx
  on public.organization_members(user_id);

-- ============================================================
-- Pricing config (precio escalonado)
-- ============================================================
create table if not exists public.pricing_config (
  id uuid primary key default gen_random_uuid(),
  phase text not null,
  price_cents integer not null,
  active boolean not null default false,
  label text,
  valid_from timestamptz,
  valid_until timestamptz,
  updated_at timestamptz not null default now()
);

insert into public.pricing_config (phase, price_cents, active, label)
select 'launch', 149900, true, 'Precio de lanzamiento — ¡Solo por tiempo limitado!'
where not exists (select 1 from public.pricing_config where phase = 'launch');

insert into public.pricing_config (phase, price_cents, active, label)
select 'standard', 199900, false, 'Precio regular'
where not exists (select 1 from public.pricing_config where phase = 'standard');

insert into public.pricing_config (phase, price_cents, active, label)
select 'post_testimonials', 249900, false, 'Acceso completo'
where not exists (select 1 from public.pricing_config where phase = 'post_testimonials');

insert into public.pricing_config (phase, price_cents, active, label)
select 'post_exam', 299900, false, 'Acceso premium con Foro + CFDI'
where not exists (select 1 from public.pricing_config where phase = 'post_exam');

-- ============================================================
-- Purchases (Stripe individuales + B2B)
-- ============================================================
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  stripe_session_id text unique not null,
  purchase_type text not null,   -- 'individual' | 'b2b'
  amount_cents integer not null,
  seats integer not null default 1,
  status text not null default 'pending', -- 'pending' | 'completed' | 'refunded'
  exam_cycle text,
  cfdi_emitido boolean not null default false,
  cfdi_uuid text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists purchases_user_idx on public.purchases(user_id);
create index if not exists purchases_org_idx on public.purchases(organization_id);

-- ============================================================
-- CFDIs (facturación timbrada via SW SAPiens)
-- ============================================================
create table if not exists public.cfdis (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid references public.purchases(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,

  emisor_rfc text not null,
  emisor_nombre text not null,
  emisor_regimen_fiscal text not null,

  receptor_rfc text not null,
  receptor_nombre text not null,
  receptor_regimen_fiscal text not null,
  receptor_uso_cfdi text not null,

  subtotal numeric(10,2) not null,
  iva numeric(10,2) not null,
  total numeric(10,2) not null,

  uuid_fiscal text unique,
  fecha_timbrado timestamptz,
  xml_cfdi text,
  pdf_url text,

  status text not null default 'pendiente',
    -- 'pendiente' | 'timbrado' | 'cancelado' | 'error'
  sw_folio text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cfdis_purchase_idx on public.cfdis(purchase_id);
create index if not exists cfdis_user_idx on public.cfdis(user_id);
create index if not exists cfdis_status_idx on public.cfdis(status);

drop trigger if exists trg_cfdis_updated_at on public.cfdis;
create trigger trg_cfdis_updated_at
before update on public.cfdis
for each row execute function public.touch_updated_at();

-- ============================================================
-- Exam questions bank (135 CNBV PLD/FT questions)
-- ============================================================
create table if not exists public.exam_questions (
  id uuid primary key default gen_random_uuid(),
  area text not null,            -- 'normativa' | 'operaciones_sospechosas' | ...
  difficulty text not null default 'medio', -- 'facil' | 'medio' | 'dificil'
  question text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_option text not null,  -- 'a' | 'b' | 'c' | 'd'
  explanation text,
  source text,                   -- referencia legal / articulo
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists exam_questions_area_idx on public.exam_questions(area);
create index if not exists exam_questions_active_idx on public.exam_questions(active) where active = true;

drop trigger if exists trg_exam_questions_updated_at on public.exam_questions;
create trigger trg_exam_questions_updated_at
before update on public.exam_questions
for each row execute function public.touch_updated_at();

-- ============================================================
-- Exam attempts (simulacro cronometrado + diagnóstico)
-- ============================================================
create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null,             -- 'diagnostic' | 'simulacro' | 'estudio'
  area text,
  total_questions integer not null default 0,
  correct_answers integer not null default 0,
  score_percent numeric(5,2),
  duration_seconds integer,
  completed boolean not null default false,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists exam_attempts_user_idx on public.exam_attempts(user_id);

create table if not exists public.exam_attempt_answers (
  id bigserial primary key,
  attempt_id uuid not null references public.exam_attempts(id) on delete cascade,
  question_id uuid not null references public.exam_questions(id) on delete cascade,
  selected_option text,
  is_correct boolean,
  answered_at timestamptz not null default now()
);

create index if not exists exam_attempt_answers_attempt_idx on public.exam_attempt_answers(attempt_id);

-- ============================================================
-- Tasa de aprobación real (resultado CNBV)
-- ============================================================
create table if not exists public.exam_results_real (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_date date,
  exam_cycle text,
  passed boolean,
  reported_at timestamptz not null default now(),
  unique (user_id, exam_cycle)
);

-- ============================================================
-- FORO DE COMUNIDAD
-- ============================================================
create table if not exists public.forum_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  icon text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

insert into public.forum_categories (name, slug, description, icon, order_index)
select 'Dudas del Examen', 'dudas-examen', 'Preguntas sobre temas específicos del examen CNBV PLD/FT', '📚', 1
where not exists (select 1 from public.forum_categories where slug = 'dudas-examen');

insert into public.forum_categories (name, slug, description, icon, order_index)
select 'Experiencias', 'experiencias', 'Comparte tu experiencia con el examen CNBV', '💬', 2
where not exists (select 1 from public.forum_categories where slug = 'experiencias');

insert into public.forum_categories (name, slug, description, icon, order_index)
select 'Normativa', 'normativa', 'Novedades CNBV y cambios regulatorios', '📋', 3
where not exists (select 1 from public.forum_categories where slug = 'normativa');

insert into public.forum_categories (name, slug, description, icon, order_index)
select 'Networking', 'networking', 'Conecta con otros compliance officers', '🤝', 4
where not exists (select 1 from public.forum_categories where slug = 'networking');

insert into public.forum_categories (name, slug, description, icon, order_index)
select 'Sugerencias', 'sugerencias', 'Feedback para mejorar Certifik PLD', '💡', 5
where not exists (select 1 from public.forum_categories where slug = 'sugerencias');

create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.forum_categories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  is_pinned boolean not null default false,
  is_solved boolean not null default false,
  views integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists forum_posts_category_idx on public.forum_posts(category_id);
create index if not exists forum_posts_user_idx on public.forum_posts(user_id);

drop trigger if exists trg_forum_posts_updated_at on public.forum_posts;
create trigger trg_forum_posts_updated_at
before update on public.forum_posts
for each row execute function public.touch_updated_at();

create table if not exists public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  is_accepted_answer boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists forum_replies_post_idx on public.forum_replies(post_id);

drop trigger if exists trg_forum_replies_updated_at on public.forum_replies;
create trigger trg_forum_replies_updated_at
before update on public.forum_replies
for each row execute function public.touch_updated_at();

create table if not exists public.forum_votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid references public.forum_posts(id) on delete cascade,
  reply_id uuid references public.forum_replies(id) on delete cascade,
  vote_type text not null, -- 'up' | 'down'
  created_at timestamptz not null default now(),
  constraint forum_votes_target_chk check (
    (post_id is not null and reply_id is null)
    or (post_id is null and reply_id is not null)
  )
);

create unique index if not exists forum_votes_user_post_uniq
  on public.forum_votes(user_id, post_id) where post_id is not null;
create unique index if not exists forum_votes_user_reply_uniq
  on public.forum_votes(user_id, reply_id) where reply_id is not null;

-- ============================================================
-- REFERIDOS
-- ============================================================
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references auth.users(id) on delete cascade,
  referred_user_id uuid references auth.users(id) on delete set null,
  referral_code text unique not null,
  status text not null default 'pending', -- 'pending' | 'converted' | 'paid'
  reward_amount integer not null default 20000, -- centavos
  created_at timestamptz not null default now(),
  converted_at timestamptz
);

create index if not exists referrals_referrer_idx on public.referrals(referrer_user_id);

-- ============================================================
-- BLOG
-- ============================================================
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  content text not null,
  excerpt text,
  published boolean not null default false,
  published_at timestamptz,
  author_id uuid references auth.users(id) on delete set null,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_published_idx on public.blog_posts(published) where published = true;

drop trigger if exists trg_blog_posts_updated_at on public.blog_posts;
create trigger trg_blog_posts_updated_at
before update on public.blog_posts
for each row execute function public.touch_updated_at();

-- ============================================================
-- TESTIMONIOS (social proof en landing)
-- ============================================================
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  content text not null,
  rating integer not null default 5,
  user_name text,
  user_role text,
  approved boolean not null default false,
  show_on_landing boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists testimonials_landing_idx
  on public.testimonials(show_on_landing) where show_on_landing = true;

-- ============================================================
-- NOTIFICATIONS (emails enviados)
-- ============================================================
create table if not exists public.email_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  kind text not null, -- 'welcome' | 'exam_30d' | 'exam_7d' | 'motivational' | 'post_exam' | 'expiration' | 'recertificacion'
  sent_at timestamptz,
  status text not null default 'queued', -- 'queued' | 'sent' | 'failed'
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists email_notifications_user_idx on public.email_notifications(user_id);

-- ============================================================
-- RLS — new tables
-- ============================================================
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.purchases enable row level security;
alter table public.cfdis enable row level security;
alter table public.exam_questions enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.exam_attempt_answers enable row level security;
alter table public.exam_results_real enable row level security;
alter table public.forum_categories enable row level security;
alter table public.forum_posts enable row level security;
alter table public.forum_replies enable row level security;
alter table public.forum_votes enable row level security;
alter table public.referrals enable row level security;
alter table public.blog_posts enable row level security;
alter table public.testimonials enable row level security;
alter table public.pricing_config enable row level security;
alter table public.email_notifications enable row level security;

-- Pricing — read public (active prices), update only service role
drop policy if exists "pricing_read_all" on public.pricing_config;
create policy "pricing_read_all" on public.pricing_config
for select using (true);

-- Organizations — only org admin & members can read
drop policy if exists "organizations_read_member" on public.organizations;
create policy "organizations_read_member" on public.organizations
for select using (
  auth.uid() = admin_user_id
  or exists (
    select 1 from public.organization_members om
    where om.organization_id = organizations.id
      and om.user_id = auth.uid()
  )
);

-- Org Members — same scope
drop policy if exists "org_members_read" on public.organization_members;
create policy "org_members_read" on public.organization_members
for select using (
  auth.uid() = user_id
  or exists (
    select 1 from public.organizations o
    where o.id = organization_members.organization_id
      and o.admin_user_id = auth.uid()
  )
);

-- Purchases — user sees own
drop policy if exists "purchases_read_own" on public.purchases;
create policy "purchases_read_own" on public.purchases
for select using (
  auth.uid() = user_id
  or exists (
    select 1 from public.organizations o
    where o.id = purchases.organization_id and o.admin_user_id = auth.uid()
  )
);

-- CFDIs — user sees own
drop policy if exists "cfdis_read_own" on public.cfdis;
create policy "cfdis_read_own" on public.cfdis
for select using (
  auth.uid() = user_id
  or exists (
    select 1 from public.organizations o
    where o.id = cfdis.organization_id and o.admin_user_id = auth.uid()
  )
);

-- Exam questions — read for anyone authenticated
drop policy if exists "exam_questions_read_auth" on public.exam_questions;
create policy "exam_questions_read_auth" on public.exam_questions
for select using (auth.role() = 'authenticated' and active = true);

-- Exam attempts — user sees own
drop policy if exists "exam_attempts_read_own" on public.exam_attempts;
create policy "exam_attempts_read_own" on public.exam_attempts
for select using (auth.uid() = user_id);

drop policy if exists "exam_attempts_insert_own" on public.exam_attempts;
create policy "exam_attempts_insert_own" on public.exam_attempts
for insert with check (auth.uid() = user_id);

drop policy if exists "exam_attempts_update_own" on public.exam_attempts;
create policy "exam_attempts_update_own" on public.exam_attempts
for update using (auth.uid() = user_id);

drop policy if exists "exam_answers_read_own" on public.exam_attempt_answers;
create policy "exam_answers_read_own" on public.exam_attempt_answers
for select using (
  exists (
    select 1 from public.exam_attempts ea
    where ea.id = exam_attempt_answers.attempt_id
      and ea.user_id = auth.uid()
  )
);

drop policy if exists "exam_answers_insert_own" on public.exam_attempt_answers;
create policy "exam_answers_insert_own" on public.exam_attempt_answers
for insert with check (
  exists (
    select 1 from public.exam_attempts ea
    where ea.id = exam_attempt_answers.attempt_id
      and ea.user_id = auth.uid()
  )
);

-- Exam results real — user sees own, inserts own
drop policy if exists "exam_results_read_own" on public.exam_results_real;
create policy "exam_results_read_own" on public.exam_results_real
for select using (auth.uid() = user_id);

drop policy if exists "exam_results_insert_own" on public.exam_results_real;
create policy "exam_results_insert_own" on public.exam_results_real
for insert with check (auth.uid() = user_id);

-- FORO
drop policy if exists "forum_categories_read_all" on public.forum_categories;
create policy "forum_categories_read_all" on public.forum_categories
for select using (true);

drop policy if exists "forum_posts_read_all" on public.forum_posts;
create policy "forum_posts_read_all" on public.forum_posts
for select using (true);

drop policy if exists "forum_posts_insert_premium" on public.forum_posts;
create policy "forum_posts_insert_premium" on public.forum_posts
for insert with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.user_profiles up
    where up.user_id = auth.uid()
      and up.access_level in ('premium', 'b2b_active', 'super_admin')
  )
);

drop policy if exists "forum_posts_update_own" on public.forum_posts;
create policy "forum_posts_update_own" on public.forum_posts
for update using (auth.uid() = user_id);

drop policy if exists "forum_posts_delete_own" on public.forum_posts;
create policy "forum_posts_delete_own" on public.forum_posts
for delete using (auth.uid() = user_id);

drop policy if exists "forum_replies_read_all" on public.forum_replies;
create policy "forum_replies_read_all" on public.forum_replies
for select using (true);

drop policy if exists "forum_replies_insert_premium" on public.forum_replies;
create policy "forum_replies_insert_premium" on public.forum_replies
for insert with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.user_profiles up
    where up.user_id = auth.uid()
      and up.access_level in ('premium', 'b2b_active', 'super_admin')
  )
);

drop policy if exists "forum_replies_update_own" on public.forum_replies;
create policy "forum_replies_update_own" on public.forum_replies
for update using (auth.uid() = user_id);

drop policy if exists "forum_votes_insert_auth" on public.forum_votes;
create policy "forum_votes_insert_auth" on public.forum_votes
for insert with check (auth.uid() = user_id);

drop policy if exists "forum_votes_read_all" on public.forum_votes;
create policy "forum_votes_read_all" on public.forum_votes
for select using (true);

drop policy if exists "forum_votes_delete_own" on public.forum_votes;
create policy "forum_votes_delete_own" on public.forum_votes
for delete using (auth.uid() = user_id);

-- Referrals — user sees own
drop policy if exists "referrals_read_own" on public.referrals;
create policy "referrals_read_own" on public.referrals
for select using (auth.uid() = referrer_user_id);

drop policy if exists "referrals_insert_own" on public.referrals;
create policy "referrals_insert_own" on public.referrals
for insert with check (auth.uid() = referrer_user_id);

-- Blog — public read of published
drop policy if exists "blog_read_published" on public.blog_posts;
create policy "blog_read_published" on public.blog_posts
for select using (published = true);

-- Testimonials — public read of approved/landing
drop policy if exists "testimonials_read_landing" on public.testimonials;
create policy "testimonials_read_landing" on public.testimonials
for select using (approved = true and show_on_landing = true);

drop policy if exists "testimonials_insert_own" on public.testimonials;
create policy "testimonials_insert_own" on public.testimonials
for insert with check (auth.uid() = user_id);

-- Email notifications — user sees own
drop policy if exists "email_notifs_read_own" on public.email_notifications;
create policy "email_notifs_read_own" on public.email_notifications
for select using (auth.uid() = user_id);
