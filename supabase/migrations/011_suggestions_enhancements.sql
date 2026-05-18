-- ──────────────────────────────────────────────────────────────────────────
-- Migration 011 — Suggestions enhancements + user temp_password
-- ──────────────────────────────────────────────────────────────────────────

-- 1. Add `type` column to suggestions (text | voice)
ALTER TABLE public.suggestions
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'text';

-- 2. Add `read_at` so admin can mark suggestions as seen
ALTER TABLE public.suggestions
  ADD COLUMN IF NOT EXISTS read_at timestamptz;

-- 3. Add `temp_password` to user_profiles for admin-created accounts
--    Only populated by the admin create-user flow; null for self-registered users.
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS temp_password text;

-- 4. Drop any existing admin read policy (idempotent)
DROP POLICY IF EXISTS "Admin can read all suggestions" ON public.suggestions;
DROP POLICY IF EXISTS "Service role bypass" ON public.suggestions;

-- 5. Allow service role full access (used by the admin API endpoint)
CREATE POLICY "Service role bypass"
  ON public.suggestions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 6. Extra index for admin time-range queries
CREATE INDEX IF NOT EXISTS idx_suggestions_type ON public.suggestions(type);
