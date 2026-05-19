-- ─────────────────────────────────────────────────────────────────────────────
-- 016  Admin fixes: auto-profile trigger · admin RLS · QR tracking · reminders
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. New columns on user_profiles ─────────────────────────────────────────────
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS email              text,
  ADD COLUMN IF NOT EXISTS premium_qr_code_id uuid REFERENCES public.premium_qr_codes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS premium_source     text DEFAULT 'organic',
  ADD COLUMN IF NOT EXISTS next_reminder_at   timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_channels  text[] DEFAULT '{}';

-- 2. Admin RLS: allow the super-admin to SELECT all profiles ──────────────────
DROP POLICY IF EXISTS "admin_select_all_profiles" ON public.user_profiles;
CREATE POLICY "admin_select_all_profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  (auth.jwt() ->> 'email') = '553angelortiz@gmail.com'
  OR auth.uid() = user_id
);

-- 3. Auto-create user_profiles row on every new auth.users INSERT ─────────────
--    (covers Google OAuth, magic link, and email/password sign-ups)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id,
    email,
    full_name,
    tier,
    total_xp,
    current_streak,
    onboarding_completed,
    premium_source
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    'free',
    0,
    0,
    false,
    'organic'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Backfill email + missing profiles for existing auth.users ────────────────
-- 4a. Backfill email into existing profiles
UPDATE public.user_profiles up
SET email = au.email
FROM auth.users au
WHERE up.user_id = au.id AND up.email IS NULL;

-- 4b. Create missing profiles for auth.users that have none
INSERT INTO public.user_profiles (user_id, email, full_name, tier, total_xp, current_streak, onboarding_completed, premium_source)
SELECT
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    split_part(au.email, '@', 1)
  ),
  'free', 0, 0, false, 'organic'
FROM auth.users au
LEFT JOIN public.user_profiles up ON up.user_id = au.id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;
