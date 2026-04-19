CREATE SCHEMA IF NOT EXISTS certifik;

-- Tabla: users (base)
CREATE TABLE certifik.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  google_id TEXT UNIQUE,
  role TEXT DEFAULT 'user', -- 'user' | 'super_admin'
  access_level TEXT DEFAULT 'free', -- 'free' | 'premium' | 'b2b_active'
  access_expires_at TIMESTAMP,
  exam_date DATE,
  exam_cycle TEXT, -- 'jun_2026' | 'oct_2026'
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

ALTER TABLE certifik.users ENABLE ROW LEVEL SECURITY;

-- Tabla: organizations (B2B)
CREATE TABLE certifik.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rfc TEXT,
  razon_social TEXT,
  email_contacto TEXT,
  max_seats INTEGER DEFAULT 20,
  used_seats INTEGER DEFAULT 0,
  admin_user_id UUID REFERENCES certifik.users(id),
  access_level TEXT DEFAULT 'b2b_active',
  access_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- Tabla: purchases
CREATE TABLE certifik.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES certifik.users(id),
  organization_id UUID REFERENCES certifik.organizations(id),
  stripe_session_id TEXT UNIQUE NOT NULL,
  purchase_type TEXT NOT NULL, -- 'individual' | 'b2b'
  amount_cents INTEGER NOT NULL,
  seats INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending', -- 'pending' | 'completed' | 'refunded' | 'failed'
  exam_cycle TEXT,
  cfdi_emitido BOOLEAN DEFAULT FALSE,
  cfdi_uuid TEXT,
  created_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP
);

-- Tabla: questions
CREATE TABLE certifik.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- ["opción 1", "opción 2", "opción 3", "opción 4"]
  correct_answer_index INTEGER NOT NULL, -- 0, 1, 2, o 3
  explanation TEXT NOT NULL,
  topic TEXT NOT NULL, -- "Marco Normativo", "Operaciones Sospechosas", etc
  difficulty TEXT DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  source_document TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Tabla: user_responses
CREATE TABLE certifik.user_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES certifik.users(id),
  question_id UUID REFERENCES certifik.questions(id),
  answer_index INTEGER,
  is_correct BOOLEAN,
  time_spent_seconds INTEGER,
  created_at TIMESTAMP DEFAULT now()
);

-- Tabla: exam_attempts
CREATE TABLE certifik.exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES certifik.users(id),
  score_total INTEGER,
  score_percentage INTEGER,
  results_by_topic JSONB,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- Tabla: exam_results_real (KPI: tasa de aprobación real)
CREATE TABLE certifik.exam_results_real (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES certifik.users(id),
  exam_date DATE,
  exam_cycle TEXT,
  passed BOOLEAN,
  reported_at TIMESTAMP DEFAULT now()
);

-- Tabla: forum_categories
CREATE TABLE certifik.forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

-- Tabla: forum_posts
CREATE TABLE certifik.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES certifik.forum_categories(id),
  user_id UUID REFERENCES certifik.users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_solved BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Tabla: forum_replies
CREATE TABLE certifik.forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES certifik.forum_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES certifik.users(id),
  content TEXT NOT NULL,
  is_accepted_answer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Tabla: forum_votes
CREATE TABLE certifik.forum_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES certifik.users(id),
  post_id UUID REFERENCES certifik.forum_posts(id),
  reply_id UUID REFERENCES certifik.forum_replies(id),
  vote_type TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, reply_id)
);

-- Tabla: cfdis
CREATE TABLE certifik.cfdis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID REFERENCES certifik.purchases(id),
  user_id UUID REFERENCES certifik.users(id),
  uuid_fiscal TEXT UNIQUE,
  status TEXT DEFAULT 'pendiente',
  xml_cfdi TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Tabla: pricing_config
CREATE TABLE certifik.pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  active BOOLEAN DEFAULT FALSE,
  label TEXT,
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  updated_at TIMESTAMP DEFAULT now()
);

-- Índices
CREATE INDEX idx_users_email ON certifik.users(email);
CREATE INDEX idx_users_google_id ON certifik.users(google_id);
CREATE INDEX idx_purchases_user ON certifik.purchases(user_id);
CREATE INDEX idx_purchases_stripe_session ON certifik.purchases(stripe_session_id);
CREATE INDEX idx_questions_topic ON certifik.questions(topic);
CREATE INDEX idx_user_responses_user ON certifik.user_responses(user_id);
CREATE INDEX idx_forum_posts_category ON certifik.forum_posts(category_id);
CREATE INDEX idx_forum_posts_user ON certifik.forum_posts(user_id);
CREATE INDEX idx_forum_replies_post ON certifik.forum_replies(post_id);

-- RLS Policies (básico)
CREATE POLICY "users_can_read_own" ON certifik.users FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY "users_can_update_own" ON certifik.users FOR UPDATE
  USING (auth.uid() = id);

-- Seed pricing config
INSERT INTO certifik.pricing_config (phase, price_cents, active, label) VALUES
  ('launch', 149900, TRUE, 'Precio de lanzamiento'),
  ('standard', 199900, FALSE, 'Precio regular'),
  ('post_testimonials', 249900, FALSE, 'Acceso completo'),
  ('post_exam', 299900, FALSE, 'Premium con Foro + CFDI');
