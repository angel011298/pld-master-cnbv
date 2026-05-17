-- ════════════════════════════════════════════════════════════════
-- 007 — QUESTION BANK V2
-- New 8-block taxonomy + 7-format question bank for CENEVAL prep.
-- Replaces quiz_bank (renamed to quiz_bank_legacy for safety).
--
-- Bloques:
--   1) Marco Legal PLD/FT
--   2) Definiciones
--   3) KYC / Identificación del Cliente
--   4) Reportes a CNBV
--   5) Estructura UNE / Oficial Cumplimiento
--   6) Sanciones y Listas
--   7) Tipologías y Operaciones Sospechosas
--   8) 40 Recomendaciones GAFI
--
-- Formatos:
--   multiple_choice | true_false | flashcard | case_study
--   fill_blank | crossword | word_search
--
-- Dificultades: basico | intermedio | avanzado
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.question_bank (
  id BIGSERIAL PRIMARY KEY,
  bloque INTEGER NOT NULL CHECK (bloque BETWEEN 1 AND 8),
  dificultad TEXT NOT NULL CHECK (dificultad IN ('basico','intermedio','avanzado')),
  formato TEXT NOT NULL CHECK (formato IN (
    'multiple_choice','true_false','flashcard','case_study',
    'fill_blank','crossword','word_search'
  )),
  stem TEXT NOT NULL,
  options JSONB,
  correct_answer JSONB NOT NULL,
  explanation TEXT,
  source_document TEXT,
  source_pages TEXT,
  tags TEXT[],
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','review','archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qb_bloque_dif_fmt ON public.question_bank(bloque, dificultad, formato);
CREATE INDEX IF NOT EXISTS idx_qb_status ON public.question_bank(status);
CREATE INDEX IF NOT EXISTS idx_qb_active_random ON public.question_bank(formato, dificultad) WHERE status='active';

CREATE TABLE IF NOT EXISTS public.question_generation_jobs (
  id BIGSERIAL PRIMARY KEY,
  bloque INTEGER NOT NULL CHECK (bloque BETWEEN 1 AND 8),
  dificultad TEXT NOT NULL CHECK (dificultad IN ('basico','intermedio','avanzado')),
  formato TEXT NOT NULL,
  target_count INTEGER NOT NULL,
  generated_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','completed','failed','cancelled')),
  error TEXT,
  triggered_by UUID REFERENCES auth.users(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qgj_status ON public.question_generation_jobs(status, created_at DESC);

CREATE OR REPLACE VIEW public.v_question_bank_progress AS
SELECT
  bloque,
  dificultad,
  formato,
  COUNT(*) FILTER (WHERE status='active') AS active_count,
  COUNT(*) FILTER (WHERE status='review') AS review_count,
  COUNT(*) AS total_count
FROM public.question_bank
GROUP BY bloque, dificultad, formato;

ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS qb_read ON public.question_bank;
CREATE POLICY qb_read ON public.question_bank FOR SELECT TO authenticated USING (status='active');

ALTER TABLE public.question_generation_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS qgj_read ON public.question_generation_jobs;
CREATE POLICY qgj_read ON public.question_generation_jobs FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.touch_question_bank_updated()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_qb_updated ON public.question_bank;
CREATE TRIGGER trg_qb_updated BEFORE UPDATE ON public.question_bank
  FOR EACH ROW EXECUTE FUNCTION public.touch_question_bank_updated();

-- Migrate the 235 legacy quiz_bank rows into the new schema.
-- Mapping tema (text) → bloque (1-8) is a best-fit; rows can be re-classified later.
INSERT INTO public.question_bank (
  bloque, dificultad, formato, stem, options, correct_answer,
  explanation, source_document, status
)
SELECT
  CASE tema
    WHEN 'Marco Regulatorio y Autoridades'            THEN 1
    WHEN 'Definiciones PLD/FT'                        THEN 2
    WHEN 'Procedimientos de Cumplimiento'             THEN 3
    WHEN 'Reportes y Documentación'                   THEN 4
    WHEN 'Actitud y Ética Profesional'                THEN 5
    WHEN 'Identificación de Operaciones Sospechosas'  THEN 7
    WHEN 'Casos Prácticos Aplicados'                  THEN 7
    ELSE 1
  END,
  CASE dificultad
    WHEN 'fácil'   THEN 'basico'
    WHEN 'medio'   THEN 'intermedio'
    WHEN 'difícil' THEN 'avanzado'
    ELSE 'intermedio'
  END,
  'multiple_choice',
  pregunta,
  opciones,
  jsonb_build_object('index', respuesta_correcta),
  explicacion,
  COALESCE(fuente, 'quiz_bank_legacy'),
  'active'
FROM public.quiz_bank
ON CONFLICT DO NOTHING;

ALTER TABLE IF EXISTS public.quiz_bank RENAME TO quiz_bank_legacy;
