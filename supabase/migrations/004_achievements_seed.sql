-- =====================================================================
-- PLD-Master CNBV — Achievements Seed Data
-- =====================================================================
-- Global list of available achievements. The app inserts rows into
-- user_achievements as users unlock them.
-- =====================================================================

create table if not exists public.achievements (
  key text primary key,
  name text not null,
  description text not null,
  icon text not null default 'Trophy',
  created_at timestamptz not null default now()
);

-- Seed achievements (idempotent: only insert if not exists)
insert into public.achievements (key, name, description, icon)
values
  ('primera_leccion', 'Primera Lección', 'Completaste tu primera lección', 'Sparkles'),
  ('racha_3', 'En Racha', 'Racha de 3 días consecutivos', 'Flame'),
  ('racha_7', 'Estudiante Dedicado', 'Una semana de estudio continuo', 'Zap'),
  ('primer_simulacro', 'Primer Simulacro', 'Completaste tu primer simulacro', 'CheckCircle'),
  ('aprobado_simulacro', 'Aprobado', 'Obtuviste 80%+ en un simulacro', 'Award'),
  ('maestro_gafi', 'Maestro GAFI', '20 preguntas de GAFI respondidas correctamente', 'Target'),
  ('experto_pld', 'Experto PLD', 'Dominas todos los temas al 80%+', 'Crown')
on conflict (key) do nothing;
