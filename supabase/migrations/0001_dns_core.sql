-- DNS CORE
-- PostgreSQL / Supabase
create extension if not exists pgcrypto;

create type public.app_role as enum ('admin','leader');
create type public.person_status as enum ('active','inactive','archived');
create type public.attendance_status as enum ('present','absent','justified','late');
create type public.alert_severity as enum ('info','warning','critical');
create type public.alert_status as enum ('open','in_progress','resolved','dismissed');
create type public.event_scope as enum ('general','clan','agape');

create table public.clans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  color text not null,
  icon text,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text not null default '',
  role public.app_role not null default 'leader',
  avatar_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.agapes (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid not null references public.clans(id),
  name text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(clan_id, name)
);

create table public.leaders (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id),
  clan_id uuid not null references public.clans(id),
  agape_id uuid references public.agapes(id),
  active boolean not null default true,
  joined_at date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.adolescents (
  id uuid primary key default gen_random_uuid(),
  agape_id uuid not null references public.agapes(id),
  first_name text not null,
  last_name text not null,
  birth_date date,
  status public.person_status not null default 'active',
  joined_at date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  agape_id uuid not null references public.agapes(id),
  leader_id uuid references public.leaders(id),
  meeting_date date not null,
  topic text not null,
  description text,
  created_at timestamptz not null default now()
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  adolescent_id uuid not null references public.adolescents(id),
  status public.attendance_status not null,
  notes text,
  created_at timestamptz not null default now(),
  unique(meeting_id, adolescent_id)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  scope public.event_scope not null default 'general',
  clan_id uuid references public.clans(id),
  agape_id uuid references public.agapes(id),
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  check (
    (scope = 'general' and clan_id is null and agape_id is null)
    or (scope = 'clan' and clan_id is not null and agape_id is null)
    or (scope = 'agape' and agape_id is not null)
  )
);

create table public.alert_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  consecutive_absences integer not null check (consecutive_absences > 0),
  severity public.alert_severity not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  adolescent_id uuid not null references public.adolescents(id),
  severity public.alert_severity not null,
  status public.alert_status not null default 'open',
  message text not null,
  consecutive_absences integer,
  snapshot_agape_id uuid references public.agapes(id),
  snapshot_clan_id uuid references public.clans(id),
  assigned_to uuid references public.leaders(id),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id),
  action text not null,
  table_name text not null,
  record_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index idx_adolescents_agape on public.adolescents(agape_id);
create index idx_meetings_agape_date on public.meetings(agape_id, meeting_date desc);
create index idx_attendance_adolescent on public.attendance(adolescent_id);
create index idx_events_starts_at on public.events(starts_at);
create index idx_alerts_status on public.alerts(status);

-- Auth profile creation
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id,email,full_name)
  values(new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name',''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Helper functions for RLS
create or replace function public.current_role()
returns public.app_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_leader_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.leaders where profile_id = auth.uid() and active = true limit 1;
$$;

create or replace function public.current_agape_id()
returns uuid language sql stable security definer set search_path = public as $$
  select agape_id from public.leaders where profile_id = auth.uid() and active = true limit 1;
$$;

create or replace function public.current_clan_id()
returns uuid language sql stable security definer set search_path = public as $$
  select clan_id from public.leaders where profile_id = auth.uid() and active = true limit 1;
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.clans enable row level security;
alter table public.agapes enable row level security;
alter table public.leaders enable row level security;
alter table public.adolescents enable row level security;
alter table public.meetings enable row level security;
alter table public.attendance enable row level security;
alter table public.events enable row level security;
alter table public.alert_rules enable row level security;
alter table public.alerts enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_log enable row level security;

create policy profiles_self_or_admin_select on public.profiles for select using (id = auth.uid() or public.current_role()='admin');
create policy profiles_admin_write on public.profiles for all using (public.current_role()='admin') with check (public.current_role()='admin');

create policy clans_authenticated_select on public.clans for select using (auth.uid() is not null);
create policy clans_admin_write on public.clans for all using (public.current_role()='admin') with check (public.current_role()='admin');

create policy agapes_authenticated_select on public.agapes for select using (auth.uid() is not null);
create policy agapes_admin_write on public.agapes for all using (public.current_role()='admin') with check (public.current_role()='admin');

create policy leaders_self_or_admin_select on public.leaders for select using (profile_id=auth.uid() or public.current_role()='admin');
create policy leaders_admin_write on public.leaders for all using (public.current_role()='admin') with check (public.current_role()='admin');

create policy adolescents_scoped_select on public.adolescents for select using (
  public.current_role()='admin' or agape_id=public.current_agape_id()
);
create policy adolescents_scoped_insert on public.adolescents for insert with check (
  public.current_role()='admin' or agape_id=public.current_agape_id()
);
create policy adolescents_scoped_update on public.adolescents for update using (
  public.current_role()='admin' or agape_id=public.current_agape_id()
) with check (
  public.current_role()='admin' or agape_id=public.current_agape_id()
);

create policy meetings_scoped on public.meetings for all using (
  public.current_role()='admin' or agape_id=public.current_agape_id()
) with check (
  public.current_role()='admin' or agape_id=public.current_agape_id()
);

create policy attendance_scoped on public.attendance for all using (
  public.current_role()='admin'
  or exists(select 1 from public.meetings m where m.id=meeting_id and m.agape_id=public.current_agape_id())
) with check (
  public.current_role()='admin'
  or exists(select 1 from public.meetings m where m.id=meeting_id and m.agape_id=public.current_agape_id())
);

create policy events_authenticated_select on public.events for select using (auth.uid() is not null);
create policy events_admin_write on public.events for all using (public.current_role()='admin') with check (public.current_role()='admin');

create policy alert_rules_admin on public.alert_rules for all using (public.current_role()='admin') with check (public.current_role()='admin');

create policy alerts_scoped_select on public.alerts for select using (
  public.current_role()='admin'
  or snapshot_agape_id=public.current_agape_id()
);
create policy alerts_scoped_update on public.alerts for update using (
  public.current_role()='admin'
  or snapshot_agape_id=public.current_agape_id()
) with check (
  public.current_role()='admin'
  or snapshot_agape_id=public.current_agape_id()
);

create policy notifications_own on public.notifications for all using (user_id=auth.uid()) with check (user_id=auth.uid());

create policy audit_admin_select on public.audit_log for select using (public.current_role()='admin');
create policy audit_insert_authenticated on public.audit_log for insert with check (actor_id=auth.uid());

-- Future-ready tables for finances/registrations can be added in later migrations.
