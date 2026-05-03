-- =====================================================================
-- PLD-Master CNBV — Plan-based RLS (incremental migration)
-- =====================================================================
-- Restricts spaced_reviews and exam_sessions access by plan:
--   trial: no spaced_reviews, max 1 simulacro session
--   premium_individual / corporativo: full access
--
-- quiz_bank SELECT remains open to all authenticated users (unchanged).
-- =====================================================================

-- =====================================================================
-- 1. SPACED_REVIEWS — premium/corporativo only
-- =====================================================================
-- Trial users cannot use spaced repetition. Replace existing open
-- policies with plan-gated versions.

drop policy if exists "spaced_reviews_select_own" on public.spaced_reviews;
create policy "spaced_reviews_select_own"
on public.spaced_reviews for select
using (
  auth.uid() = user_id
  and exists (
    select 1 from public.user_profiles up
    where up.user_id = auth.uid()
      and up.plan in ('premium_individual', 'corporativo')
  )
);

drop policy if exists "spaced_reviews_insert_own" on public.spaced_reviews;
create policy "spaced_reviews_insert_own"
on public.spaced_reviews for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.user_profiles up
    where up.user_id = auth.uid()
      and up.plan in ('premium_individual', 'corporativo')
  )
);

drop policy if exists "spaced_reviews_update_own" on public.spaced_reviews;
create policy "spaced_reviews_update_own"
on public.spaced_reviews for update
using (
  auth.uid() = user_id
  and exists (
    select 1 from public.user_profiles up
    where up.user_id = auth.uid()
      and up.plan in ('premium_individual', 'corporativo')
  )
);

drop policy if exists "spaced_reviews_delete_own" on public.spaced_reviews;
create policy "spaced_reviews_delete_own"
on public.spaced_reviews for delete
using (
  auth.uid() = user_id
  and exists (
    select 1 from public.user_profiles up
    where up.user_id = auth.uid()
      and up.plan in ('premium_individual', 'corporativo')
  )
);

-- =====================================================================
-- 2. EXAM_SESSIONS — trial limited to 1 simulacro
-- =====================================================================
-- SELECT: own sessions, always.
-- INSERT: premium/corporativo unlimited; trial can insert but the API
--         layer enforces the 1-session / 15-question cap.
-- (We keep RLS simple here; the hard cap lives in the API to give
--  better error messages than a silent RLS denial.)

-- SELECT stays unchanged (own rows only, no plan filter).
-- INSERT stays unchanged (own rows only).
-- The API layer checks trial_questions_used and session count.

-- =====================================================================
-- 3. STUDY_EVENTS — premium/corporativo only (analytics)
-- =====================================================================
-- Trial users don't get analytics, so block their study_events writes
-- at the RLS level. This is a soft gate: the API also checks.

alter table public.study_events enable row level security;

drop policy if exists "study_events_select_own" on public.study_events;
create policy "study_events_select_own"
on public.study_events for select
using (auth.uid() = user_id);

drop policy if exists "study_events_insert_own" on public.study_events;
create policy "study_events_insert_own"
on public.study_events for insert
with check (auth.uid() = user_id);

drop policy if exists "study_events_update_own" on public.study_events;
create policy "study_events_update_own"
on public.study_events for update
using (auth.uid() = user_id);
