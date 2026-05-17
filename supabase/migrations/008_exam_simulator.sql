-- ════════════════════════════════════════════════════════════════
-- 008 — EXAM SIMULATOR (CENEVAL)
-- Adds support for resumable, time-limited 118-question CENEVAL exams.
-- ════════════════════════════════════════════════════════════════

ALTER TABLE public.exam_sessions
  ADD COLUMN IF NOT EXISTS question_ids JSONB,        -- ordered array of 118 question_bank.id
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;    -- start + 4 hours

-- RLS — users only see/modify their own sessions and answers
ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS es_own_read ON public.exam_sessions;
CREATE POLICY es_own_read ON public.exam_sessions
  FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS es_own_insert ON public.exam_sessions;
CREATE POLICY es_own_insert ON public.exam_sessions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS es_own_update ON public.exam_sessions;
CREATE POLICY es_own_update ON public.exam_sessions
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

ALTER TABLE public.exam_answers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ea_own_read ON public.exam_answers;
CREATE POLICY ea_own_read ON public.exam_answers FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.exam_sessions s WHERE s.id = exam_answers.session_id AND s.user_id = auth.uid())
);
DROP POLICY IF EXISTS ea_own_insert ON public.exam_answers;
CREATE POLICY ea_own_insert ON public.exam_answers FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.exam_sessions s WHERE s.id = exam_answers.session_id AND s.user_id = auth.uid())
);
DROP POLICY IF EXISTS ea_own_update ON public.exam_answers;
CREATE POLICY ea_own_update ON public.exam_answers FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.exam_sessions s WHERE s.id = exam_answers.session_id AND s.user_id = auth.uid())
);
