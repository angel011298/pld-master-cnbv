-- Add subscription tier and exam target date to user_profiles
-- Run this migration after the human sets up Stripe.
-- subscription_tier: set to 'premium' once Stripe webhook confirms payment.
-- exam_target_date: optional, saved from onboarding screen.

alter table public.user_profiles
  add column if not exists subscription_tier text not null default 'free'
    check (subscription_tier in ('free', 'premium'));

alter table public.user_profiles
  add column if not exists exam_target_date date;
