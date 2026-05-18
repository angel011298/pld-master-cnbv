-- ════════════════════════════════════════════════════════════════
-- 010 — Study Progress Tracking: Sessions, Responses, and Statistics
-- Tracks user learning activity across all question formats
-- ════════════════════════════════════════════════════════════════

-- 1. study_sessions: High-level session record
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  formato TEXT NOT NULL CHECK (formato IN (
    'flashcard', 'multiple_choice', 'true_false', 'case_study',
    'fill_blank', 'crossword', 'word_search'
  )),
  bloque INT CHECK (bloque IS NULL OR (bloque >= 1 AND bloque <= 8)),
  dificultad TEXT CHECK (dificultad IS NULL OR dificultad IN ('basico', 'intermedio', 'avanzado')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  total_questions INT NOT NULL DEFAULT 0,
  correct_count INT NOT NULL DEFAULT 0,
  score_percentage NUMERIC(5, 2) CHECK (score_percentage IS NULL OR (score_percentage >= 0 AND score_percentage <= 100)),
  xp_earned INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX idx_study_sessions_status ON public.study_sessions(status);
CREATE INDEX idx_study_sessions_formato ON public.study_sessions(formato);
CREATE INDEX idx_study_sessions_bloque ON public.study_sessions(bloque);
CREATE INDEX idx_study_sessions_created_at ON public.study_sessions(created_at DESC);
CREATE INDEX idx_study_sessions_user_created ON public.study_sessions(user_id, created_at DESC);

-- Enable RLS on study_sessions
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own study sessions"
  ON public.study_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study sessions"
  ON public.study_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study sessions"
  ON public.study_sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage study sessions"
  ON public.study_sessions
  USING (current_setting('role') = 'authenticated' OR auth.jwt() ->> 'role' = 'service_role');

-- 2. study_question_responses: Individual question responses
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.study_question_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.study_sessions(id) ON DELETE CASCADE,
  question_id BIGINT NOT NULL REFERENCES public.question_bank(id) ON DELETE CASCADE,
  user_answer TEXT,
  is_correct BOOLEAN NOT NULL,
  response_time_ms INT CHECK (response_time_ms IS NULL OR response_time_ms >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_study_question_responses_session_id
  ON public.study_question_responses(session_id);
CREATE INDEX idx_study_question_responses_question_id
  ON public.study_question_responses(question_id);
CREATE INDEX idx_study_question_responses_created_at
  ON public.study_question_responses(created_at DESC);
CREATE INDEX idx_study_question_responses_is_correct
  ON public.study_question_responses(is_correct);

-- Enable RLS on study_question_responses (users see responses from their own sessions)
ALTER TABLE public.study_question_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view responses from own sessions"
  ON public.study_question_responses
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM public.study_sessions
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert responses in own sessions"
  ON public.study_question_responses
  FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM public.study_sessions
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage responses"
  ON public.study_question_responses
  USING (current_setting('role') = 'authenticated' OR auth.jwt() ->> 'role' = 'service_role');

-- 3. user_study_stats: Aggregated statistics (materialized as table, updated via trigger)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_study_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_sessions INT NOT NULL DEFAULT 0,
  total_questions_answered INT NOT NULL DEFAULT 0,
  accuracy_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0,
  favorite_formato TEXT,
  weakest_bloque INT CHECK (weakest_bloque IS NULL OR (weakest_bloque >= 1 AND weakest_bloque <= 8)),
  sessions_this_week INT NOT NULL DEFAULT 0,
  streak_days INT NOT NULL DEFAULT 0,
  last_session_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_study_stats_updated_at
  ON public.user_study_stats(updated_at DESC);
CREATE INDEX idx_user_study_stats_accuracy
  ON public.user_study_stats(accuracy_percentage DESC);

-- Enable RLS on user_study_stats
ALTER TABLE public.user_study_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own study stats"
  ON public.user_study_stats
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage study stats"
  ON public.user_study_stats
  USING (current_setting('role') = 'authenticated' OR auth.jwt() ->> 'role' = 'service_role');

-- 4. Helper function: Update user_study_stats on session completion
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_user_study_stats(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_total_sessions INT;
  v_total_questions INT;
  v_correct_count INT;
  v_accuracy NUMERIC;
  v_favorite_formato TEXT;
  v_weakest_bloque INT;
  v_sessions_week INT;
  v_last_session TIMESTAMPTZ;
BEGIN
  -- Count total completed sessions
  SELECT COUNT(*)
  INTO v_total_sessions
  FROM public.study_sessions
  WHERE user_id = p_user_id AND status = 'completed';

  -- Count total questions answered
  SELECT COUNT(*)
  INTO v_total_questions
  FROM public.study_question_responses sqr
  INNER JOIN public.study_sessions ss ON sqr.session_id = ss.id
  WHERE ss.user_id = p_user_id;

  -- Count correct answers
  SELECT COUNT(*)
  INTO v_correct_count
  FROM public.study_question_responses sqr
  INNER JOIN public.study_sessions ss ON sqr.session_id = ss.id
  WHERE ss.user_id = p_user_id AND sqr.is_correct = true;

  -- Calculate accuracy percentage
  v_accuracy := CASE
    WHEN v_total_questions = 0 THEN 0
    ELSE ROUND((v_correct_count::NUMERIC / v_total_questions::NUMERIC) * 100, 2)
  END;

  -- Find favorite formato (most sessions in)
  SELECT formato
  INTO v_favorite_formato
  FROM public.study_sessions
  WHERE user_id = p_user_id AND status = 'completed'
  GROUP BY formato
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  -- Find weakest bloque (lowest accuracy where bloque is not null)
  SELECT bloque
  INTO v_weakest_bloque
  FROM (
    SELECT
      ss.bloque,
      COUNT(sqr.id) as total_ans,
      SUM(CASE WHEN sqr.is_correct THEN 1 ELSE 0 END) as correct_ans,
      ROUND(SUM(CASE WHEN sqr.is_correct THEN 1 ELSE 0 END)::NUMERIC / COUNT(sqr.id)::NUMERIC * 100, 2) as acc
    FROM public.study_question_responses sqr
    INNER JOIN public.study_sessions ss ON sqr.session_id = ss.id
    WHERE ss.user_id = p_user_id AND ss.bloque IS NOT NULL AND ss.status = 'completed'
    GROUP BY ss.bloque
  ) bloque_stats
  WHERE total_ans >= 5  -- Only consider bloques with at least 5 answers
  ORDER BY acc ASC
  LIMIT 1;

  -- Count sessions this week
  SELECT COUNT(*)
  INTO v_sessions_week
  FROM public.study_sessions
  WHERE user_id = p_user_id
    AND status = 'completed'
    AND created_at >= now() - INTERVAL '7 days';

  -- Get last session timestamp
  SELECT MAX(created_at)
  INTO v_last_session
  FROM public.study_sessions
  WHERE user_id = p_user_id AND status = 'completed';

  -- Upsert stats
  INSERT INTO public.user_study_stats (
    user_id, total_sessions, total_questions_answered, accuracy_percentage,
    favorite_formato, weakest_bloque, sessions_this_week, last_session_at, updated_at
  ) VALUES (
    p_user_id, v_total_sessions, v_total_questions, v_accuracy,
    v_favorite_formato, v_weakest_bloque, v_sessions_week, v_last_session, now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_sessions = v_total_sessions,
    total_questions_answered = v_total_questions,
    accuracy_percentage = v_accuracy,
    favorite_formato = v_favorite_formato,
    weakest_bloque = v_weakest_bloque,
    sessions_this_week = v_sessions_week,
    last_session_at = v_last_session,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger: Auto-update stats when session completes
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trigger_update_stats_on_session_complete()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update stats when session transitions to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    PERFORM public.update_user_study_stats(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trig_study_session_complete
  AFTER UPDATE ON public.study_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_stats_on_session_complete();

-- 6. Trigger: Auto-update study_sessions.updated_at
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trigger_update_study_sessions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_study_sessions_updated_at
  BEFORE UPDATE ON public.study_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_study_sessions_timestamp();

-- 7. View: Recent study activity (last 7 days)
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.vw_recent_study_activity AS
SELECT
  ss.user_id,
  ss.id as session_id,
  ss.formato,
  ss.bloque,
  ss.dificultad,
  ss.started_at,
  ss.completed_at,
  ss.total_questions,
  ss.correct_count,
  ss.score_percentage,
  ss.xp_earned,
  ss.status,
  EXTRACT(EPOCH FROM (COALESCE(ss.completed_at, now()) - ss.started_at))::INT as duration_seconds
FROM public.study_sessions ss
WHERE ss.created_at >= now() - INTERVAL '7 days'
ORDER BY ss.created_at DESC;

-- 8. View: Question performance by topic (bloque)
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.vw_question_performance_by_bloque AS
SELECT
  ss.user_id,
  ss.bloque,
  COUNT(DISTINCT ss.id) as session_count,
  COUNT(sqr.id) as total_questions,
  SUM(CASE WHEN sqr.is_correct THEN 1 ELSE 0 END) as correct_answers,
  ROUND(
    SUM(CASE WHEN sqr.is_correct THEN 1 ELSE 0 END)::NUMERIC /
    NULLIF(COUNT(sqr.id), 0)::NUMERIC * 100,
    2
  ) as accuracy_percentage,
  ROUND(AVG(sqr.response_time_ms), 0)::INT as avg_response_time_ms
FROM public.study_sessions ss
LEFT JOIN public.study_question_responses sqr ON ss.id = sqr.session_id
WHERE ss.status = 'completed' AND ss.bloque IS NOT NULL
GROUP BY ss.user_id, ss.bloque;

-- 9. Comments for documentation
-- ─────────────────────────────────────────────────────────────────
COMMENT ON TABLE public.study_sessions IS
  'Records high-level study sessions: start time, completion, score, XP earned. One record per user per study activity.';

COMMENT ON TABLE public.study_question_responses IS
  'Individual question responses within a session. Links to question_bank and study_sessions.';

COMMENT ON TABLE public.user_study_stats IS
  'Aggregated statistics per user. Updated via trigger when sessions complete. Used for dashboard metrics.';

COMMENT ON COLUMN public.study_sessions.score_percentage IS
  'Percentage of questions answered correctly in session. Calculated as (correct_count / total_questions) * 100.';

COMMENT ON COLUMN public.study_sessions.xp_earned IS
  'Experience points awarded for session. Formula: correct_count * difficulty_multiplier.';

COMMENT ON COLUMN public.study_question_responses.response_time_ms IS
  'Time in milliseconds from question display to user submission.';

COMMENT ON COLUMN public.user_study_stats.streak_days IS
  'Consecutive days with at least one completed session. Updated by app logic (not in this migration).';

COMMENT ON FUNCTION public.update_user_study_stats IS
  'Recalculates all user study statistics from study_sessions and study_question_responses tables.';
