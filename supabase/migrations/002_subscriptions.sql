-- Migration 002: Add subscription fields to user_profiles
-- Run this in Supabase SQL Editor

alter table public.user_profiles
  add column if not exists subscription_status text not null default 'free'
    check (subscription_status in ('free', 'active', 'cancelled', 'past_due')),
  add column if not exists subscription_id text unique,
  add column if not exists price_id text,
  add column if not exists current_period_end timestamptz,
  add column if not exists payment_intent_id text unique;

-- Allow service role to insert/update profiles (needed for webhook)
drop policy if exists "profiles_insert_service" on public.user_profiles;
create policy "profiles_insert_service"
on public.user_profiles
for insert
with check (true);

drop policy if exists "profiles_update_service" on public.user_profiles;
-- Existing update policy uses auth.uid() = user_id which works for user self-update.
-- Webhook updates use service role key which bypasses RLS, so no extra policy needed.

comment on column public.user_profiles.subscription_status is
  'Stripe subscription state: free | active | cancelled | past_due';
