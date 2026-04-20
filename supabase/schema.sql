-- Supabase schema for PLD-Master (CNBV PLD/FT)
-- Safe for free-tier. Includes: auth profile, customer master ID, RAG, and limits support.

create extension if not exists vector;
create extension if not exists pgcrypto;

-- =========================
-- Master customer identity
-- =========================
create sequence if not exists public.customer_seq start 1;

create or replace function public.generate_public_customer_id()
returns text
language plpgsql
as $$
declare
  seq_value bigint;
begin
  seq_value := nextval('public.customer_seq');
  return 'CL-' || to_char(now(), 'YYYY') || '-' || lpad(seq_value::text, 6, '0');
end;
$$;

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  public_customer_id text not null unique default public.generate_public_customer_id(),
  full_name text,
  total_xp integer not null default 0,
  current_streak integer not null default 0,
  exam_score_prediction numeric(5,2),
  pass_probability numeric(5,2),
  stripe_customer_id text unique,
  external_refs jsonb not null default '{}'::jsonb,
  -- Onboarding & subscription
  tier text not null default 'free' check (tier in ('free', 'premium')),
  exam_date date,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_profiles_updated_at on public.user_profiles;
create trigger trg_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.touch_updated_at();

-- =========================
-- RAG storage
-- =========================
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  file_type text not null default 'pdf',
  content text not null,
  page_count integer not null default 0,
  file_size_bytes integer not null default 0,
  is_global boolean not null default false,  -- true = disponible para todos los usuarios
  created_at timestamptz not null default now()
);

create index if not exists documents_user_id_idx on public.documents(user_id);

-- Optional hard cap: 3 documents by user (enforced in app for now).
-- Future DB trigger can enforce this limit strictly.

create table if not exists public.document_embeddings (
  id bigserial primary key,
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  content text not null,
  embedding vector(768) not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists document_embeddings_document_id_idx
  on public.document_embeddings(document_id);
create index if not exists document_embeddings_user_id_idx
  on public.document_embeddings(user_id);
create index if not exists document_embeddings_embedding_ivfflat
  on public.document_embeddings using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create table if not exists public.study_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  event_type text not null, -- chat|quiz|flashcard|case
  correct boolean,
  topic text,
  difficulty text,
  response_time_ms integer,
  created_at timestamptz not null default now()
);

create index if not exists study_events_user_id_idx on public.study_events(user_id);

-- =========================
-- RPC: vector search
-- =========================
create or replace function public.match_document_embeddings(
  p_user_id uuid,
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  document_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql
stable
as $$
  select
    de.id,
    de.document_id,
    de.content,
    de.metadata,
    1 - (de.embedding <=> query_embedding) as similarity
  from public.document_embeddings de
  join public.documents d on d.id = de.document_id
  where (
    p_user_id is null
    or de.user_id = p_user_id
    or d.is_global = true
  )
    and (1 - (de.embedding <=> query_embedding)) >= match_threshold
  order by de.embedding <=> query_embedding
  limit match_count;
$$;

-- =========================
-- RLS
-- =========================
alter table public.user_profiles enable row level security;
alter table public.documents enable row level security;
alter table public.document_embeddings enable row level security;
alter table public.study_events enable row level security;

drop policy if exists "profiles_select_own" on public.user_profiles;
create policy "profiles_select_own"
on public.user_profiles
for select
using (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.user_profiles;
create policy "profiles_update_own"
on public.user_profiles
for update
using (auth.uid() = user_id);

drop policy if exists "documents_select_own" on public.documents;
create policy "documents_select_own"
on public.documents
for select
using (auth.uid() = user_id or is_global = true);

drop policy if exists "documents_insert_own" on public.documents;
create policy "documents_insert_own"
on public.documents
for insert
with check (auth.uid() = user_id);

drop policy if exists "documents_delete_own" on public.documents;
create policy "documents_delete_own"
on public.documents
for delete
using (auth.uid() = user_id);

drop policy if exists "embeddings_select_own" on public.document_embeddings;
create policy "embeddings_select_own"
on public.document_embeddings
for select
using (
  auth.uid() = user_id
  or exists (
    select 1 from public.documents d
    where d.id = document_id and d.is_global = true
  )
);

drop policy if exists "embeddings_insert_own" on public.document_embeddings;
create policy "embeddings_insert_own"
on public.document_embeddings
for insert
with check (auth.uid() = user_id);

drop policy if exists "events_select_own" on public.study_events;
create policy "events_select_own"
on public.study_events
for select
using (auth.uid() = user_id);

drop policy if exists "events_insert_own" on public.study_events;
create policy "events_insert_own"
on public.study_events
for insert
with check (auth.uid() = user_id);
