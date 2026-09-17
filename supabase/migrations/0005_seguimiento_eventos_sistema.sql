-- 0005 · Alertas y seguimiento, eventos e inscripciones, finanzas y sistema (tablas 22 a 30)

-- 22. Reglas de alerta por inasistencias consecutivas
create table public.alert_rules (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null unique,
  consecutive_absences integer not null unique check (consecutive_absences > 0),
  severity             public.alert_severity not null,
  active               boolean not null default true,
  created_at           timestamptz not null default now()
);

-- 23. Alertas
create table public.alerts (
  id                   uuid primary key default gen_random_uuid(),
  adolescent_id        uuid not null references public.adolescents(id) on delete cascade,
  rule_id              uuid references public.alert_rules(id) on delete set null,
  severity             public.alert_severity not null,
  status               public.alert_status not null default 'open',
  message              text not null,
  consecutive_absences integer,
  snapshot_agape_id    uuid references public.agapes(id),
  snapshot_clan_id     uuid references public.clans(id),
  assigned_leader_id   uuid references public.leaders(id) on delete set null,
  resolution_note      text,
  resolved_at          timestamptz,
  resolved_by          uuid references public.profiles(id) on delete set null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create unique index uq_alerts_one_open on public.alerts (adolescent_id) where status in ('open', 'in_progress');

-- 24. Seguimiento (bitácora de contacto con el adolescente)
create table public.follow_up_notes (
  id            uuid primary key default gen_random_uuid(),
  adolescent_id uuid not null references public.adolescents(id) on delete cascade,
  alert_id      uuid references public.alerts(id) on delete set null,
  author_id     uuid references public.profiles(id) on delete set null,
  type          public.follow_up_type not null default 'note',
  body          text not null check (length(trim(body)) > 0),
  occurred_at   timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

-- 25. Eventos (calendario)
create table public.events (
  id                    uuid primary key default gen_random_uuid(),
  title                 text not null,
  description           text,
  event_type_id         uuid references public.event_types(id),
  scope                 public.event_scope not null default 'general',
  clan_id               uuid references public.clans(id),
  agape_id              uuid references public.agapes(id),
  period_id             uuid references public.periods(id),
  starts_at             timestamptz not null,
  ends_at               timestamptz,
  location              text,
  requires_registration boolean not null default false,
  capacity              integer check (capacity is null or capacity > 0),
  fee_amount            numeric(10,2) not null default 0 check (fee_amount >= 0),
  registration_deadline timestamptz,
  created_by            uuid references public.profiles(id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at),
  check (
       (scope = 'general' and clan_id is null and agape_id is null)
    or (scope = 'clan'    and clan_id is not null and agape_id is null)
    or (scope = 'agape'   and agape_id is not null and clan_id is null)
  )
);

-- 26. Inscripciones a eventos (adolescente o líder)
create table public.event_registrations (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references public.events(id) on delete cascade,
  adolescent_id uuid references public.adolescents(id) on delete cascade,
  leader_id     uuid references public.leaders(id) on delete cascade,
  status        public.registration_status not null default 'registered',
  amount_due    numeric(10,2) not null default 0 check (amount_due >= 0),
  notes         text,
  registered_by uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (num_nonnulls(adolescent_id, leader_id) = 1),
  unique (event_id, adolescent_id),
  unique (event_id, leader_id)
);

-- 27. Pagos (base para finanzas)
create table public.payments (
  id              uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.event_registrations(id) on delete restrict,
  amount          numeric(10,2) not null check (amount > 0),
  method          public.payment_method not null,
  status          public.payment_status not null default 'valid',
  paid_at         timestamptz not null default now(),
  reference       text,
  received_by     uuid references public.profiles(id) on delete set null,
  voided_by       uuid references public.profiles(id) on delete set null,
  voided_reason   text,
  created_at      timestamptz not null default now(),
  check (status <> 'voided' or nullif(trim(voided_reason), '') is not null)
);

-- 28. Notificaciones internas
create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  title      text not null,
  message    text not null,
  link       text,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

-- 29. Auditoría (solo escribe el trigger)
create table public.audit_log (
  id         bigint generated always as identity primary key,
  actor_id   uuid references public.profiles(id) on delete set null,
  action     text not null,
  table_name text not null,
  record_id  text,
  metadata   jsonb,
  created_at timestamptz not null default now()
);

-- 30. Carga masiva de adolescentes desde CSV (zona de preparación)
--     Columnas en texto para importar el CSV tal cual desde Table Editor.
create table public.staging_adolescents (
  id                    bigint generated always as identity primary key,
  batch                 text not null default to_char(now() at time zone 'America/Lima', 'YYYY-MM-DD'),
  first_name            text,
  last_name             text,
  sex                   text,   -- M / F
  birth_date            text,   -- AAAA-MM-DD o DD/MM/AAAA
  phone                 text,
  school_name           text,
  agape_name            text,
  clan_name             text,
  guardian_first_name   text,
  guardian_last_name    text,
  guardian_phone        text,
  guardian_relationship text,
  bible_course          text,
  import_status         public.import_status not null default 'pending',
  import_error          text,
  adolescent_id         uuid references public.adolescents(id) on delete set null,
  created_at            timestamptz not null default now()
);
