-- Profile settings columns for daily goals and notification preferences
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS daily_xp_goal integer NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS notification_email_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notification_study_reminder boolean NOT NULL DEFAULT true;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_profiles_daily_xp_goal_check'
  ) THEN
    ALTER TABLE public.user_profiles
      ADD CONSTRAINT user_profiles_daily_xp_goal_check
      CHECK (daily_xp_goal IN (10, 25, 50, 100));
  END IF;
END$$;
