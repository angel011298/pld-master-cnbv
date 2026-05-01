# PLD-Master Supabase Migrations

## Overview

Migrations are stored in `supabase/migrations/` and are versioned SQL files.

- **001_schema_v2.sql** — Initial feature migration (idempotent, production-safe)
  - Adds: companies, quiz_bank, spaced_reviews, exam_sessions, exam_answers, user_achievements
  - Extends: user_profiles with plan, trial_questions_used, company_id, last_active_at
  - Creates: ENUM pld_topic, triggers for auto-stats, RLS policies

## Applying Migrations

### Option 1: Using Supabase CLI (Recommended for local development)

```bash
# Link to a Supabase project (first time)
npx supabase link --project-ref your-project-ref

# Pull latest schema from remote (optional, if DB changed externally)
npx supabase db pull

# Push local migrations to remote
npx supabase db push
```

### Option 2: Manual SQL in Supabase Dashboard

1. Go to **Supabase Dashboard** > **Project** > **SQL Editor**
2. Create a new query
3. Copy entire contents of `supabase/migrations/001_schema_v2.sql`
4. Run (CTRL+ENTER)
5. Wait for completion (check Logs if errors)

### Option 3: Using psql (CLI access)

If you have `psql` and database credentials:

```bash
psql -h db.xxxxx.supabase.co \
     -U postgres \
     -d postgres \
     -f supabase/migrations/001_schema_v2.sql
```

## Verifying Success

After applying the migration, run verification queries:

1. **Option A: Via Supabase Dashboard SQL Editor**
   - Copy contents of `supabase/verify_schema_v2.sql`
   - Run each query individually to verify tables, columns, indexes, RLS, views

2. **Option B: Via CLI**
   ```bash
   psql -h db.xxxxx.supabase.co \
        -U postgres \
        -d postgres \
        -f supabase/verify_schema_v2.sql
   ```

Expected results:
- ✅ All 6 new tables exist (companies, quiz_bank, spaced_reviews, exam_sessions, exam_answers, user_achievements)
- ✅ 4 new columns in user_profiles (plan, trial_questions_used, company_id, last_active_at)
- ✅ ENUM type pld_topic exists
- ✅ Indexes created on search columns (tema, dificultad, user_id, fecha, etc)
- ✅ RLS enabled on all tables
- ✅ Policies created (select, insert, update, delete per table)
- ✅ 2 views exist (v_due_reviews, v_user_topic_accuracy)
- ✅ Row counts are 0 (fresh schema)

## Schema v2 Details

### New Tables

| Table | Rows | Purpose |
|-------|------|---------|
| `companies` | variable | Corporate accounts (Stripe subscriptions) |
| `quiz_bank` | 200-500 | Curated question bank (added via admin seed) |
| `spaced_reviews` | per user | SM-2 review state (auto-created on first interaction) |
| `exam_sessions` | per user | Practice exams (simulacro/practica/repaso) |
| `exam_answers` | per answer | Per-question responses in a session |
| `user_achievements` | sparse | Unlocked badges |

### New Columns (user_profiles)

```
plan                    text            — trial | premium_individual | corporativo
trial_questions_used    integer         — count of questions used in trial period
company_id              uuid (FK)       — links to companies for corporate users
last_active_at          timestamptz     — last time user accessed the platform
```

### Enums

```
pld_topic — marco_legal | gafi | kyc_cdd | reportes_cnbv | une | sanciones | tipologias
```

### Triggers

- **sync_plan_to_tier** (user_profiles) — keeps legacy `tier` in sync with new `plan`
- **update_quiz_bank_stats** (exam_answers) — auto-updates veces_respondida + tasa_acierto
- **touch_updated_at** (companies, quiz_bank, etc) — auto-updates the `updated_at` column

### Views

- **v_due_reviews** — questions due today per user (drives /dashboard)
- **v_user_topic_accuracy** — accuracy by topic (drives /perfil)

## Rollback (if needed)

If migration fails or you need to revert:

```bash
# Option 1: In Supabase Dashboard > Migrations tab, click "Revert"
# (Supabase tracks executed migrations)

# Option 2: Manual rollback by dropping new tables (destructive!)
drop table if exists public.user_achievements cascade;
drop table if exists public.exam_answers cascade;
drop table if exists public.exam_sessions cascade;
drop table if exists public.spaced_reviews cascade;
drop table if exists public.quiz_bank cascade;
drop table if exists public.companies cascade;
drop type if exists public.pld_topic cascade;

-- Then remove columns from user_profiles
alter table public.user_profiles drop column if exists plan;
alter table public.user_profiles drop column if exists trial_questions_used;
alter table public.user_profiles drop column if exists company_id;
alter table public.user_profiles drop column if exists last_active_at;
```

## Notes

- **Idempotent**: All SQL uses `IF NOT EXISTS` or `IF NOT` patterns. Safe to re-run.
- **Production-safe**: No destructive operations (no DROP TABLE, no column removals).
- **Backwards-compatible**: Legacy `tier` column stays; new `plan` column syncs automatically.
- **RLS**: All new tables have row-level security enabled for data isolation.

## Next Steps

After migration succeeds:

1. **Seed quiz_bank** with 200+ questions via `/api/admin/seed-documents`
2. **Create test company** in Supabase Dashboard (for testing corporate tier)
3. **Run feature tests** on /dashboard, /simulator, /perfil
