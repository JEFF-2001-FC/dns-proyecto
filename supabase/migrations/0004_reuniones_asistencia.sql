-- 0004 · Reuniones y asistencia (tablas 19 a 21)

-- 19. Reuniones
create table public.meetings (
  id              uuid primary key default gen_random_uuid(),
  agape_id        uuid not null references public.agapes(id),
  period_id       uuid not null references public.periods(id),
  meeting_type_id uuid not null references public.meeting_types(id),
  meeting_date    date not null,
  topic           text not null,
  description     text,
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (agape_id, meeting_type_id, meeting_date)
);

-- 20. Líderes que dirigieron / estuvieron en la reunión
create table public.meeting_leaders (
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  leader_id  uuid not null references public.leaders(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (meeting_id, leader_id)
);

-- 21. Asistencia (provisional si el adolescente aún está pendiente)
create table public.attendance (
  id             uuid primary key default gen_random_uuid(),
  meeting_id     uuid not null references public.meetings(id) on delete cascade,
  adolescent_id  uuid not null references public.adolescents(id) on delete cascade,
  status         public.attendance_status not null,
  is_provisional boolean not null default false,
  notes          text,
  recorded_by    uuid references public.profiles(id) on delete set null,
  recorded_at    timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (meeting_id, adolescent_id)
);
