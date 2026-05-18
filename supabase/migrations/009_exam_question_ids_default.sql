-- ════════════════════════════════════════════════════════════════
-- 009 — EXAM SESSION question_ids: enforce NOT NULL + default
-- Migration 008 added the column as nullable with no default.
-- This migration backfills any NULL rows and sets the constraint.
-- ════════════════════════════════════════════════════════════════

-- 1. Backfill any rows that were created before 008 or with NULL
UPDATE public.exam_sessions
SET question_ids = '[]'::jsonb
WHERE question_ids IS NULL;

-- 2. Add NOT NULL and default so future inserts always have a value
ALTER TABLE public.exam_sessions
  ALTER COLUMN question_ids SET DEFAULT '[]'::jsonb,
  ALTER COLUMN question_ids SET NOT NULL;

-- 3. Also ensure expires_at has a sensible default (4 hours from now)
--    for any legacy rows missing it
UPDATE public.exam_sessions
SET expires_at = created_at + INTERVAL '4 hours'
WHERE expires_at IS NULL;
