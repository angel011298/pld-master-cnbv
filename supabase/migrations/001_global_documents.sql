-- Migration 001: Global documents support
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/xuwestiepwhlbdnwyblb/sql/new

-- 1. Add is_global column to documents
alter table public.documents
  add column if not exists is_global boolean not null default false;

-- 2. Update RLS: allow all authenticated users to read global documents
drop policy if exists "documents_select_own" on public.documents;
create policy "documents_select_own"
on public.documents
for select
using (auth.uid() = user_id or is_global = true);

-- 3. Update RLS: allow all authenticated users to read embeddings of global docs
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

-- 4. Update match_document_embeddings RPC to include global documents
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

-- 5. Allow service_role to insert global documents (bypasses RLS for admin seed)
-- (service_role already bypasses RLS by default in Supabase)
