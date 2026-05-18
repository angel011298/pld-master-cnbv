-- ════════════════════════════════════════════════════════════════
-- 010 — EXAM SESSIONS question_ids GIN index
-- Improves query performance for JSONB array lookups on question_ids.
-- ════════════════════════════════════════════════════════════════

-- Create GIN index for efficient JSONB array queries
-- Supports @>, ?, ?|, ?& operators on the question_ids array
CREATE INDEX IF NOT EXISTS idx_exam_sessions_question_ids_gin
ON public.exam_sessions USING GIN (question_ids);

-- Create index on (user_id, exam_type, estado) for typical session lookups
CREATE INDEX IF NOT EXISTS idx_exam_sessions_user_exam_status
ON public.exam_sessions (user_id, exam_type, estado);
