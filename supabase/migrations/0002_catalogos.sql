-- 0002 · Catálogos y configuración (tablas 1 a 8)

-- 1. Períodos anuales
create table public.periods (
  id          uuid primary key default gen_random_uuid(),
  year        smallint not null unique check (year between 2020 and 2100),
  name        text not null unique,
  starts_on   date not null,
  ends_on     date not null,
  is_current  boolean not null default false,
  created_at  timestamptz not null default now(),
  check (ends_on > starts_on)
);
create unique index uq_periods_single_current on public.periods (is_current) where is_current;

-- 2. Clanes
create table public.clans (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  slug        text not null unique,
  color       text not null,
  icon        text,
  description text,
  sort_order  smallint not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- 3. Ágapes (independientes del clan)
create table public.agapes (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  description  text,
  meeting_day  smallint check (meeting_day between 0 and 6), -- 0 = domingo
  meeting_time time,
  address      text,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

-- 4. Tipos de reunión
create table public.meeting_types (
  id                uuid primary key default gen_random_uuid(),
  name              text not null unique,
  description       text,
  counts_for_alerts boolean not null default true,
  active            boolean not null default true,
  created_at        timestamptz not null default now()
);

-- 5. Tipos de evento
create table public.event_types (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  color      text,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- 6. Cursos de Escuela Bíblica
create table public.bible_school_courses (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  level       smallint not null default 1,
  description text,
  sort_order  smallint not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- 7. Parentescos de apoderados
create table public.guardian_relationships (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  sort_order smallint not null default 0,
  active     boolean not null default true
);

-- 8. Parámetros del sistema (reglas configurables sin tocar código)
create table public.app_settings (
  key         text primary key,
  value       jsonb not null,
  description text,
  updated_at  timestamptz not null default now(),
  updated_by  uuid
);

create or replace function public.setting_int(p_key text, p_default integer)
returns integer language sql stable security definer set search_path = public as $$
  select coalesce(
    (select (value #>> '{}')::integer from public.app_settings where key = p_key),
    p_default
  );
$$;

create or replace function public.current_period_id()
returns uuid language sql stable security definer set search_path = public as $$
  select coalesce(
    (select id from public.periods where public.today_lima() between starts_on and ends_on order by starts_on desc limit 1),
    (select id from public.periods where is_current limit 1)
  );
$$;
