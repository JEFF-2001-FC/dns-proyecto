-- 0015 · Ficha de acompañamiento e historial relevante del adolescente.
create table if not exists public.adolescent_life_profiles (
  adolescent_id uuid primary key references public.adolescents(id) on delete cascade,
  birth_place text, church_name text, district text,
  father_name text, father_occupation text, mother_name text, mother_occupation text,
  sibling_count integer check (sibling_count is null or sibling_count >= 0), family_context text,
  health_conditions text, doctor_notes text, medications text,
  education_situation text, academic_difficulties text, hobbies text,
  guardian_consent boolean not null default false, updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);
create table if not exists public.adolescent_life_events (
  id uuid primary key default gen_random_uuid(), adolescent_id uuid not null references public.adolescents(id) on delete cascade,
  occurred_on date not null default public.today_lima(), body text not null check (length(trim(body)) > 0),
  created_by uuid references public.profiles(id) on delete set null, created_at timestamptz not null default now()
);
create index if not exists idx_life_events_adolescent on public.adolescent_life_events(adolescent_id, occurred_on desc);
alter table public.adolescent_life_profiles enable row level security;
alter table public.adolescent_life_events enable row level security;
drop policy if exists life_profiles_access on public.adolescent_life_profiles;
drop policy if exists life_events_select on public.adolescent_life_events;
drop policy if exists life_events_insert on public.adolescent_life_events;
drop policy if exists life_events_update on public.adolescent_life_events;
create policy life_profiles_access on public.adolescent_life_profiles for all to authenticated using (public.can_view_adolescent(adolescent_id)) with check (public.can_view_adolescent(adolescent_id));
create policy life_events_select on public.adolescent_life_events for select to authenticated using (public.can_view_adolescent(adolescent_id));
create policy life_events_insert on public.adolescent_life_events for insert to authenticated with check (public.can_view_adolescent(adolescent_id));
create policy life_events_update on public.adolescent_life_events for update to authenticated using ((select public.is_admin()) or created_by = auth.uid()) with check ((select public.is_admin()) or created_by = auth.uid());
create or replace function public.life_profile_guard() returns trigger language plpgsql set search_path = public as $$ begin new.updated_at := now(); new.updated_by := auth.uid(); return new; end; $$;
drop trigger if exists life_profile_guard on public.adolescent_life_profiles;
create trigger life_profile_guard before insert or update on public.adolescent_life_profiles for each row execute function public.life_profile_guard();
