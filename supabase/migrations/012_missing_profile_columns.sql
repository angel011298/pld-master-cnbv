-- Add columns that the application code expects but were missing from the live DB.
-- onboarding_completed is selected in useUserProfile; its absence caused the entire
-- query to fail silently → dashboard showed 0 XP / 0 Racha even though the data existed.
-- temp_password was added in migration 011 locally but never reached production.

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS temp_password text;

-- Back-fill: treat existing active users as having completed onboarding
UPDATE public.user_profiles
SET onboarding_completed = true
WHERE total_xp > 0 OR current_streak > 0;
