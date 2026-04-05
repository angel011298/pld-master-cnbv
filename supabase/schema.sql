-- Enable pgvector extension
create extension if not exists vector;

-- Table for user progress (XP, streaks, levels)
create table if not exists public.user_progress (
  id uuid primary key default auth.uid(),
  xp integer default 0,
  streak integer default 0,
  level integer default 1,
  last_activity timestamp with time zone default now(),
  completed_modules text[] default '{}',
  updated_at timestamp with time zone default now()
);

-- Table for uploaded documents
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  name text not null,
  file_type text,
  url text,
  content text, -- Extract full text for backup/search
  created_at timestamp with time zone default now()
);

-- Table for document embeddings (RAG)
create table if not exists public.document_embeddings (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents(id) on delete cascade,
  content text not null,
  embedding vector(768), -- Gemini text-embedding-004 default dimension
  metadata jsonb,
  created_at timestamp with time zone default now()
);

-- Table for Q&A cache
create table if not exists public.cache_qa (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  difficulty text,
  tags text[],
  embedding vector(768),
  created_at timestamp with time zone default now()
);

-- RLS Policies (Basic)
alter table public.user_progress enable row level security;
alter table public.documents enable row level security;
alter table public.document_embeddings enable row level security;
alter table public.cache_qa enable row level security;

create policy "Users can view their own progress" on public.user_progress for select using (auth.uid() = id);
create policy "Users can view their own documents" on public.documents for select using (auth.uid() = user_id);

-- Vector Similarity Search Function
create or replace function match_document_embeddings (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    document_embeddings.id,
    document_embeddings.content,
    document_embeddings.metadata,
    1 - (document_embeddings.embedding <=> query_embedding) as similarity
  from document_embeddings
  where 1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
end;
$$;
