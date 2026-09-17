-- 0003 · Usuarios, líderes, adolescentes, apoderados e historial (tablas 9 a 18)

-- 9. Perfiles (1 a 1 con auth.users)
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text not null default '',
  role       public.app_role not null default 'leader',
  avatar_url text,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 10. Líderes (persona; puede existir antes de tener cuenta)
create table public.leaders (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete set null,
  first_name text not null,
  last_name  text not null,
  sex        public.sex_type not null,
  birth_date date,
  phone      text,
  email      text,
  status     public.person_status not null default 'active'
             check (status in ('active', 'inactive', 'archived')),
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 11. Asignación líder ↔ ágape con historial (co-líderes LEAD / ASSISTANT)
create table public.leader_agape_assignments (
  id         uuid primary key default gen_random_uuid(),
  leader_id  uuid not null references public.leaders(id) on delete cascade,
  agape_id   uuid not null references public.agapes(id),
  role       public.leader_role not null default 'assistant',
  started_on date not null default public.today_lima(),
  ended_on   date,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  check (ended_on is null or ended_on >= started_on)
);
create unique index uq_leader_agape_active on public.leader_agape_assignments (leader_id, agape_id) where ended_on is null;

-- 12. Membresía líder ↔ clan con historial (un clan vigente)
create table public.leader_clan_memberships (
  id         uuid primary key default gen_random_uuid(),
  leader_id  uuid not null references public.leaders(id) on delete cascade,
  clan_id    uuid not null references public.clans(id),
  started_on date not null default public.today_lima(),
  ended_on   date,
  created_at timestamptz not null default now(),
  check (ended_on is null or ended_on >= started_on)
);
create unique index uq_leader_clan_active on public.leader_clan_memberships (leader_id) where ended_on is null;

-- 13. Adolescentes
create table public.adolescents (
  id               uuid primary key default gen_random_uuid(),
  first_name       text not null,
  last_name        text not null,
  sex              public.sex_type not null,
  birth_date       date,
  phone            text,
  school_name      text,
  status           public.person_status not null default 'active',
  notes            text,
  created_by       uuid references public.profiles(id) on delete set null,
  reviewed_by      uuid references public.profiles(id) on delete set null,
  reviewed_at      timestamptz,
  rejection_reason text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  check (status <> 'rejected' or nullif(trim(rejection_reason), '') is not null)
);

-- 14. Membresía adolescente ↔ ágape con historial (un ágape vigente)
create table public.adolescent_agape_memberships (
  id            uuid primary key default gen_random_uuid(),
  adolescent_id uuid not null references public.adolescents(id) on delete cascade,
  agape_id      uuid not null references public.agapes(id),
  started_on    date not null default public.today_lima(),
  ended_on      date,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  check (ended_on is null or ended_on >= started_on)
);
create unique index uq_adolescent_agape_active on public.adolescent_agape_memberships (adolescent_id) where ended_on is null;

-- 15. Membresía adolescente ↔ clan con historial (un clan vigente)
create table public.adolescent_clan_memberships (
  id            uuid primary key default gen_random_uuid(),
  adolescent_id uuid not null references public.adolescents(id) on delete cascade,
  clan_id       uuid not null references public.clans(id),
  started_on    date not null default public.today_lima(),
  ended_on      date,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  check (ended_on is null or ended_on >= started_on)
);
create unique index uq_adolescent_clan_active on public.adolescent_clan_memberships (adolescent_id) where ended_on is null;

-- 16. Apoderados
create table public.guardians (
  id         uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name  text not null,
  phone      text not null,
  email      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 17. Vínculo adolescente ↔ apoderado
create table public.adolescent_guardians (
  adolescent_id   uuid not null references public.adolescents(id) on delete cascade,
  guardian_id     uuid not null references public.guardians(id) on delete cascade,
  relationship_id uuid references public.guardian_relationships(id),
  is_primary      boolean not null default false,
  created_at      timestamptz not null default now(),
  primary key (adolescent_id, guardian_id)
);
create unique index uq_adolescent_primary_guardian on public.adolescent_guardians (adolescent_id) where is_primary;

-- 18. Avance en Escuela Bíblica
create table public.bible_school_enrollments (
  id            uuid primary key default gen_random_uuid(),
  adolescent_id uuid not null references public.adolescents(id) on delete cascade,
  course_id     uuid not null references public.bible_school_courses(id),
  period_id     uuid not null references public.periods(id),
  status        public.enrollment_status not null default 'in_progress',
  started_on    date not null default public.today_lima(),
  completed_on  date,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (adolescent_id, course_id, period_id),
  check (status <> 'completed' or completed_on is not null)
);

-- Perfil automático al crear un usuario en Auth (el rol NUNCA viene del cliente)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Recrea perfiles de usuarios que ya existían en Auth
insert into public.profiles (id, email, full_name)
select u.id, u.email, coalesce(u.raw_user_meta_data ->> 'full_name', '')
from auth.users u
on conflict (id) do nothing;
