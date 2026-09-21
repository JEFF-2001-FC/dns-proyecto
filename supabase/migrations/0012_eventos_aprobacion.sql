-- 0012 · Eventos creados por líderes: revisión antes de publicarse.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'event_approval_status') then
    create type public.event_approval_status as enum ('pending', 'published', 'rejected');
  end if;
end $$;

alter table public.events
  add column if not exists approval_status public.event_approval_status not null default 'published',
  add column if not exists reviewed_by uuid references public.profiles(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists rejection_reason text;

create or replace function public.events_guard()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  if tg_op = 'INSERT' then new.created_by := coalesce(new.created_by, auth.uid()); end if;
  if tg_op = 'UPDATE' and auth.uid() is not null and public.is_admin()
     and new.approval_status is distinct from old.approval_status then
    new.reviewed_by := auth.uid();
    new.reviewed_at := now();
  end if;
  if auth.uid() is not null and not public.is_admin() then
    if new.scope = 'agape' and new.agape_id not in (select public.my_agape_ids()) then
      raise exception 'Solo puedes crear eventos para tus ágapes' using errcode = '42501';
    end if;
    if new.scope = 'clan' and new.clan_id not in (select public.my_clan_ids()) then
      raise exception 'Solo puedes crear eventos para tu clan' using errcode = '42501';
    end if;
    if new.scope = 'general' then raise exception 'Solo administración crea eventos generales' using errcode = '42501'; end if;
    new.approval_status := 'pending'; new.reviewed_by := null; new.reviewed_at := null; new.rejection_reason := null;
  end if;
  return new;
end;
$$;
drop trigger if exists events_guard on public.events;
create trigger events_guard before insert or update on public.events for each row execute function public.events_guard();

drop policy if exists events_select on public.events;
drop policy if exists events_admin_insert on public.events;
drop policy if exists events_admin_update on public.events;
drop policy if exists events_admin_delete on public.events;
create policy events_select on public.events for select to authenticated using (
  (select public.is_admin()) or created_by = auth.uid() or (approval_status = 'published' and (
    scope = 'general' or (scope = 'clan' and clan_id in (select public.my_clan_ids())) or (scope = 'agape' and agape_id in (select public.my_agape_ids()))
  ))
);
create policy events_insert on public.events for insert to authenticated with check (
  (select public.is_admin()) or (scope = 'agape' and agape_id in (select public.my_agape_ids())) or (scope = 'clan' and clan_id in (select public.my_clan_ids()))
);
create policy events_update on public.events for update to authenticated using ((select public.is_admin()) or (created_by = auth.uid() and approval_status = 'pending')) with check ((select public.is_admin()) or (created_by = auth.uid() and approval_status = 'pending'));
create policy events_delete on public.events for delete to authenticated using ((select public.is_admin()) or (created_by = auth.uid() and approval_status = 'pending'));
