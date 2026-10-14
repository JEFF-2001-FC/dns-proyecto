-- 0017 · Justificaciones, anuncios, nuevos registros y cursos visibles.

alter table public.attendance
  add column if not exists justification_reason text;

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_announcements_active_dates
  on public.announcements (active, starts_at, ends_at, created_at desc);

alter table public.announcements enable row level security;

create policy "announcements_select_authenticated" on public.announcements
  for select to authenticated using (
    active
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );

create policy "announcements_admin_all" on public.announcements
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.announcements_guard()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  if tg_op = 'INSERT' then
    new.created_by := coalesce(new.created_by, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists announcements_guard on public.announcements;
create trigger announcements_guard before insert or update on public.announcements
for each row execute function public.announcements_guard();

drop trigger if exists audit_announcements on public.announcements;
create trigger audit_announcements after insert or update or delete on public.announcements
for each row execute function public.audit_row_change();

alter table public.bible_school_enrollments enable row level security;

create policy "bible_enrollments_select_scope" on public.bible_school_enrollments
  for select to authenticated using (public.can_view_adolescent(adolescent_id));

create policy "bible_enrollments_admin_all" on public.bible_school_enrollments
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace view public.v_new_adolescents with (security_invoker = true) as
select
  a.id,
  a.first_name || ' ' || a.last_name as full_name,
  a.created_at,
  p.full_name as created_by_name,
  p.email as created_by_email,
  am.agape_id,
  ag.name as agape_name,
  cm.clan_id,
  c.name as clan_name
from public.adolescents a
left join public.profiles p on p.id = a.created_by
left join public.adolescent_agape_memberships am on am.adolescent_id = a.id and am.ended_on is null
left join public.agapes ag on ag.id = am.agape_id
left join public.adolescent_clan_memberships cm on cm.adolescent_id = a.id and cm.ended_on is null
left join public.clans c on c.id = cm.clan_id
where a.status = 'active';

grant select on public.v_new_adolescents to authenticated;

-- Desde ahora los registros creados por líderes quedan activos, pero trazables por created_by/created_at.
create or replace function public.adolescents_guard()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();

  if tg_op = 'INSERT' then
    new.created_by := coalesce(new.created_by, auth.uid());
    new.status := coalesce(new.status, 'active'::public.person_status);
    new.reviewed_by := null;
    new.reviewed_at := null;
    new.rejection_reason := null;
  end if;

  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status := 'active';
    new.created_by := auth.uid();
  elsif new.status is distinct from old.status
     or new.created_by is distinct from old.created_by
     or new.reviewed_by is distinct from old.reviewed_by
     or new.reviewed_at is distinct from old.reviewed_at
     or new.rejection_reason is distinct from old.rejection_reason then
    raise exception 'Solo un administrador puede cambiar el estado o la revisión' using errcode = '42501';
  end if;

  return new;
end;
$$;

create or replace function public.register_adolescent(
  p_agape_id    uuid,
  p_clan_id     uuid,
  p_first_name  text,
  p_last_name   text,
  p_sex         public.sex_type,
  p_birth_date  date default null,
  p_phone       text default null,
  p_school_name text default null,
  p_guardian    jsonb default null
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_admin       boolean := public.is_admin();
  v_id          uuid;
  v_guardian_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Inicia sesión para registrar' using errcode = '42501';
  end if;
  if not v_admin and (p_agape_id is null or p_agape_id not in (select public.my_agape_ids())) then
    raise exception 'Solo puedes registrar adolescentes en tu ágape' using errcode = '42501';
  end if;
  if nullif(trim(p_first_name), '') is null or nullif(trim(p_last_name), '') is null then
    raise exception 'Nombre y apellido son obligatorios' using errcode = '22023';
  end if;
  if not exists (select 1 from public.agapes where id = p_agape_id and active) then
    raise exception 'El ágape no existe o está inactivo' using errcode = '22023';
  end if;
  if not exists (select 1 from public.clans where id = p_clan_id and active) then
    raise exception 'El clan no existe o está inactivo' using errcode = '22023';
  end if;
  if exists (
    select 1 from public.adolescents a
    where lower(trim(a.first_name)) = lower(trim(p_first_name))
      and lower(trim(a.last_name))  = lower(trim(p_last_name))
      and a.birth_date is not distinct from p_birth_date
      and a.status <> 'rejected'
  ) then
    raise exception 'Ya existe un adolescente con ese nombre y fecha de nacimiento' using errcode = '23505';
  end if;

  insert into public.adolescents (first_name, last_name, sex, birth_date, phone, school_name, status)
  values (trim(p_first_name), trim(p_last_name), p_sex, p_birth_date,
          nullif(trim(p_phone), ''), nullif(trim(p_school_name), ''), 'active')
  returning id into v_id;

  insert into public.adolescent_agape_memberships (adolescent_id, agape_id, created_by) values (v_id, p_agape_id, auth.uid());
  insert into public.adolescent_clan_memberships  (adolescent_id, clan_id,  created_by) values (v_id, p_clan_id,  auth.uid());

  if nullif(trim(p_guardian ->> 'phone'), '') is not null then
    insert into public.guardians (first_name, last_name, phone, email)
    values (coalesce(nullif(trim(p_guardian ->> 'first_name'), ''), 'Apoderado'),
            coalesce(trim(p_guardian ->> 'last_name'), ''),
            trim(p_guardian ->> 'phone'),
            nullif(trim(p_guardian ->> 'email'), ''))
    returning id into v_guardian_id;

    insert into public.adolescent_guardians (adolescent_id, guardian_id, relationship_id, is_primary)
    values (v_id, v_guardian_id, nullif(p_guardian ->> 'relationship_id', '')::uuid, true);
  end if;

  return v_id;
end;
$$;
