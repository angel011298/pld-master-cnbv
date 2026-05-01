-- =================================================================
-- PLD-Master Schema v2 — Verification Queries
-- =================================================================
-- Run in Supabase SQL Editor after applying migrations/001_schema_v2.sql
-- to verify all tables, columns, indexes, and RLS policies exist.
-- =================================================================

-- 1. Verify new tables exist
select
  table_name,
  table_schema,
  to_regclass(table_schema || '.' || table_name) is not null as exists
from information_schema.tables
where table_schema = 'public'
  and table_name in ('companies', 'quiz_bank', 'spaced_reviews', 'exam_sessions', 'exam_answers', 'user_achievements')
order by table_name;

-- 2. Verify new columns in user_profiles
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'user_profiles'
  and column_name in ('plan', 'trial_questions_used', 'company_id', 'last_active_at')
order by column_name;

-- 3. Verify ENUM type pld_topic exists
select typname, typcategory
from pg_type
where typname = 'pld_topic';

-- 4. Count indexes per table
select
  tablename,
  count(*) as index_count
from pg_indexes
where schemaname = 'public'
  and tablename in ('companies', 'quiz_bank', 'spaced_reviews', 'exam_sessions', 'exam_answers', 'user_achievements', 'user_profiles')
group by tablename
order by tablename;

-- 5. Verify RLS is enabled on new tables
select
  schemaname,
  tablename,
  pg_catalog.has_table_privilege(format('%I.%I', schemaname, tablename), 'SELECT') as has_privilege
from pg_tables
where schemaname = 'public'
  and tablename in ('companies', 'quiz_bank', 'spaced_reviews', 'exam_sessions', 'exam_answers', 'user_achievements');

-- 6. Count RLS policies per table
select
  schemaname,
  tablename,
  count(*) as policy_count
from pg_policies
where schemaname = 'public'
  and tablename in ('companies', 'quiz_bank', 'spaced_reviews', 'exam_sessions', 'exam_answers', 'user_achievements')
group by schemaname, tablename
order by tablename;

-- 7. Verify views exist
select table_schema, table_name
from information_schema.views
where table_schema = 'public'
  and table_name in ('v_due_reviews', 'v_user_topic_accuracy')
order by table_name;

-- 8. Quick row count (should be 0 if fresh migration)
select 'companies' as table_name, count(*) as row_count from public.companies
union all
select 'quiz_bank', count(*) from public.quiz_bank
union all
select 'spaced_reviews', count(*) from public.spaced_reviews
union all
select 'exam_sessions', count(*) from public.exam_sessions
union all
select 'exam_answers', count(*) from public.exam_answers
union all
select 'user_achievements', count(*) from public.user_achievements
order by table_name;
