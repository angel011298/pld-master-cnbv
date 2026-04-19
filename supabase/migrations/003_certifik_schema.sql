-- Migration 003: Certifik tables (used by NextAuth + Stripe checkout)
-- Run in Supabase SQL Editor
-- NOTE: Uses public schema with "certifik_" prefix for Supabase free-tier compatibility

-- =========================================================
-- Users extended profile (NextAuth stores minimal data;
-- certifik_users holds access_level and billing status)
-- =========================================================
create table if not exists public.certifik_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  access_level text not null default 'free'
    check (access_level in ('free', 'premium', 'b2b_active', 'super_admin')),
  access_expires_at timestamptz,
  role text not null default 'user'
    check (role in ('user', 'super_admin')),
  organization_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists certifik_users_email_idx on public.certifik_users(email);

-- =========================================================
-- Organizations (B2B)
-- =========================================================
create table if not exists public.certifik_organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  access_level text not null default 'free'
    check (access_level in ('free', 'b2b_active')),
  access_expires_at timestamptz,
  total_seats integer not null default 0,
  used_seats integer not null default 0,
  created_at timestamptz not null default now()
);

-- =========================================================
-- Purchases
-- =========================================================
create table if not exists public.certifik_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  organization_id uuid references public.certifik_organizations(id),
  stripe_session_id text unique,
  stripe_payment_intent_id text unique,
  purchase_type text not null default 'individual'
    check (purchase_type in ('individual', 'b2b')),
  amount_cents integer not null,
  seats integer not null default 1,
  exam_cycle text not null default 'jun_2026',
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'failed', 'refunded')),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists certifik_purchases_user_id_idx on public.certifik_purchases(user_id);
create index if not exists certifik_purchases_stripe_session_idx on public.certifik_purchases(stripe_session_id);

-- =========================================================
-- Pricing config (admin-managed)
-- =========================================================
create table if not exists public.certifik_pricing_config (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price_cents integer not null,
  currency text not null default 'mxn',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Seed default price
insert into public.certifik_pricing_config (name, price_cents, active)
values ('Acceso Individual', 199900, true)
on conflict do nothing;

-- =========================================================
-- Auto-update updated_at on certifik_users
-- =========================================================
drop trigger if exists trg_certifik_users_updated_at on public.certifik_users;
create trigger trg_certifik_users_updated_at
before update on public.certifik_users
for each row execute function public.touch_updated_at();

-- =========================================================
-- RLS
-- =========================================================
alter table public.certifik_users enable row level security;
alter table public.certifik_purchases enable row level security;
alter table public.certifik_pricing_config enable row level security;
alter table public.certifik_organizations enable row level security;

-- Pricing is publicly readable
drop policy if exists "pricing_select_all" on public.certifik_pricing_config;
create policy "pricing_select_all"
on public.certifik_pricing_config for select using (true);
