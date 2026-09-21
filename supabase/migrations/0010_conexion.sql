-- 0010 · Área de Conexión: permiso puntual para líderes y bitácora de contacto.
-- Una persona de Conexión continúa siendo líder; no se crea un rol global nuevo.

alter table public.leaders
  add column if not exists connection_enabled boolean not null default false;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'connection_status') then
    create type public.connection_status as enum ('new', 'contacted', 'scheduled', 'referred', 'closed');
  end if;
end $$;

create table if not exists public.connection_followups (
  id                 uuid primary key default gen_random_uuid(),
  adolescent_id      uuid not null references public.adolescents(id) on delete cascade,
  status             public.connection_status not null default 'new',
  occurred_on        date not null default public.today_lima(),
  availability       text,
  suggested_agape_id uuid references public.agapes(id) on delete set null,
  notes              text not null check (length(trim(notes)) > 0),
  next_contact_on    date,
  created_by         uuid references public.profiles(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists idx_connection_followups_adolescent
  on public.connection_followups (adolescent_id, occurred_on desc, created_at desc);

-- ADMIN y el líder con el permiso activo son los únicos que pueden acceder.
create or replace function public.can_manage_connection()
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (
    select 1
    from public.leaders l
    join public.profiles p on p.id = l.profile_id and p.active
    where l.profile_id = auth.uid()
      and l.status = 'active'
      and l.connection_enabled
  );
$$;

-- La encargada puede consultar los datos necesarios para orientar al adolescente,
-- incluso antes de que esté asignado a un ágape.
create or replace function public.can_view_adolescent(p_adolescent_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.can_manage_connection() or exists (
    select 1
    from public.adolescent_agape_memberships m
    where m.adolescent_id = p_adolescent_id
      and m.ended_on is null
      and m.agape_id in (select public.my_agape_ids())
  );
$$;

alter table public.connection_followups enable row level security;

drop policy if exists connection_followups_select on public.connection_followups;
drop policy if exists connection_followups_insert on public.connection_followups;
drop policy if exists connection_followups_update on public.connection_followups;
drop policy if exists connection_followups_delete on public.connection_followups;

create policy connection_followups_select on public.connection_followups
  for select to authenticated using ((select public.can_manage_connection()));
create policy connection_followups_insert on public.connection_followups
  for insert to authenticated with check ((select public.can_manage_connection()));
create policy connection_followups_update on public.connection_followups
  for update to authenticated
  using ((select public.can_manage_connection()))
  with check ((select public.can_manage_connection()));
create policy connection_followups_delete on public.connection_followups
  for delete to authenticated using ((select public.is_admin()));

create or replace function public.connection_followups_guard()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  if tg_op = 'INSERT' then
    new.created_by := coalesce(auth.uid(), new.created_by);
  elsif not public.is_admin() and new.created_by is distinct from old.created_by then
    raise exception 'No puedes cambiar quién registró el seguimiento' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists connection_followups_guard on public.connection_followups;
create trigger connection_followups_guard
before insert or update on public.connection_followups
for each row execute function public.connection_followups_guard();

grant execute on function public.can_manage_connection() to authenticated;
