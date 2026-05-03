-- =====================================================================
-- PLD-Master CNBV — Company Invitations
-- =====================================================================
-- Tracks pending invitations sent by corporate admins.
-- Token is a UUID generated server-side; expires after 7 days.
-- =====================================================================

create table if not exists public.company_invitations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  invited_by uuid not null references auth.users(id) on delete cascade,
  email text not null,
  token uuid not null unique default gen_random_uuid(),
  accepted_at timestamptz,
  accepted_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz not null default now() + interval '7 days',
  created_at timestamptz not null default now()
);

create index if not exists company_invitations_company_id_idx
  on public.company_invitations(company_id);

create index if not exists company_invitations_token_idx
  on public.company_invitations(token);

create index if not exists company_invitations_email_idx
  on public.company_invitations(email);

-- RLS: only the company admin can see/insert invitations for their company
alter table public.company_invitations enable row level security;

drop policy if exists "invitations_select_admin" on public.company_invitations;
create policy "invitations_select_admin"
on public.company_invitations for select
using (
  exists (
    select 1 from public.companies c
    where c.id = company_invitations.company_id
      and c.admin_user_id = auth.uid()
  )
);

drop policy if exists "invitations_insert_admin" on public.company_invitations;
create policy "invitations_insert_admin"
on public.company_invitations for insert
with check (
  auth.uid() = invited_by
  and exists (
    select 1 from public.companies c
    where c.id = company_invitations.company_id
      and c.admin_user_id = auth.uid()
  )
);
