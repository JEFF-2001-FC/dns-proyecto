-- 0006 · Funciones de acceso, reglas de negocio, auditoría y RPCs
-- Convención: auth.uid() nulo = service_role / SQL Editor / cron (confiable).

-- =====================================================================
-- A. Ámbito del usuario actual
-- =====================================================================

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select p.role = 'admin' and p.active from public.profiles p where p.id = auth.uid()), false);
$$;

create or replace function public.current_leader_id()
returns uuid language sql stable security definer set search_path = public as $$
  select l.id
  from public.leaders l
  join public.profiles p on p.id = l.profile_id and p.active
  where l.profile_id = auth.uid() and l.status = 'active'
  limit 1;
$$;

-- Ágapes que el líder dirige hoy (LEAD o ASSISTANT: mismo acceso)
create or replace function public.my_agape_ids()
returns setof uuid language sql stable security definer set search_path = public as $$
  select distinct a.agape_id
  from public.leader_agape_assignments a
  where a.leader_id = public.current_leader_id()
    and a.started_on <= public.today_lima()
    and (a.ended_on is null or a.ended_on >= public.today_lima());
$$;

create or replace function public.my_clan_ids()
returns setof uuid language sql stable security definer set search_path = public as $$
  select m.clan_id
  from public.leader_clan_memberships m
  where m.leader_id = public.current_leader_id()
    and m.started_on <= public.today_lima()
    and (m.ended_on is null or m.ended_on >= public.today_lima());
$$;

-- Un líder ve al adolescente si hoy pertenece a uno de sus ágapes
create or replace function public.can_view_adolescent(p_adolescent_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (
    select 1
    from public.adolescent_agape_memberships m
    where m.adolescent_id = p_adolescent_id
      and m.ended_on is null
      and m.agape_id in (select public.my_agape_ids())
  );
$$;

-- Asistencia: reunión de mi ágape, adolescente vigente en ese ágape,
-- pendiente o activo, y reunión dentro de la ventana de corrección.
create or replace function public.can_write_attendance(p_meeting_id uuid, p_adolescent_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.meetings m
    join public.adolescent_agape_memberships am
      on am.adolescent_id = p_adolescent_id and am.agape_id = m.agape_id and am.ended_on is null
    join public.adolescents a
      on a.id = p_adolescent_id and a.status in ('pending', 'active')
    where m.id = p_meeting_id
      and m.agape_id in (select public.my_agape_ids())
      and m.meeting_date <= public.today_lima()
      and m.meeting_date >= public.today_lima() - public.setting_int('attendance_correction_days', 7)
  );
$$;

-- =====================================================================
-- B. Triggers de reglas de negocio
-- =====================================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['leaders','guardians','bible_school_enrollments','meetings','attendance',
                           'alerts','events','event_registrations']
  loop
    execute format('create trigger set_updated_at before update on public.%I
                    for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- Perfiles: nadie cambia su propio rol, estado o correo
create or replace function public.profiles_guard()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  if auth.uid() is not null and not public.is_admin()
     and (new.id is distinct from old.id or new.email is distinct from old.email
          or new.role is distinct from old.role or new.active is distinct from old.active) then
    raise exception 'No puedes cambiar tu rol, estado ni correo' using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger profiles_guard before update on public.profiles
for each row execute function public.profiles_guard();

-- Adolescentes: lo que registra un líder entra PENDING; solo ADMIN revisa
create or replace function public.adolescents_guard()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();

  if tg_op = 'INSERT' then
    new.created_by := coalesce(new.created_by, auth.uid());
  end if;

  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.created_by := auth.uid();
    new.reviewed_by := null;
    new.reviewed_at := null;
    new.rejection_reason := null;
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
create trigger adolescents_guard before insert or update on public.adolescents
for each row execute function public.adolescents_guard();

-- Reuniones: período automático y ventana de días para líderes
create or replace function public.meetings_guard()
returns trigger language plpgsql set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := coalesce(new.created_by, auth.uid());
  end if;

  if new.period_id is null then
    select id into new.period_id
    from public.periods
    where new.meeting_date between starts_on and ends_on
    order by starts_on desc limit 1;
    if new.period_id is null then
      raise exception 'No hay un período configurado que incluya el %', new.meeting_date using errcode = '23502';
    end if;
  end if;

  if auth.uid() is not null and not public.is_admin()
     and new.meeting_date < public.today_lima() - public.setting_int('attendance_correction_days', 7) then
    raise exception 'Solo puedes registrar reuniones de los últimos % días',
      public.setting_int('attendance_correction_days', 7) using errcode = '42501';
  end if;

  return new;
end;
$$;
create trigger meetings_guard before insert or update on public.meetings
for each row execute function public.meetings_guard();

-- Asistencia: marca provisional si el adolescente está pendiente
create or replace function public.attendance_guard()
returns trigger language plpgsql set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.recorded_by := coalesce(auth.uid(), new.recorded_by);
    new.recorded_at := now();
  else
    new.recorded_at := old.recorded_at;
    new.recorded_by := case when new.status is distinct from old.status
                            then coalesce(auth.uid(), old.recorded_by) else old.recorded_by end;
  end if;
  new.is_provisional := coalesce(
    (select a.status = 'pending' from public.adolescents a where a.id = new.adolescent_id), false);
  return new;
end;
$$;
create trigger attendance_guard before insert or update on public.attendance
for each row execute function public.attendance_guard();

-- Inscripciones: monto desde el evento, cupo, fecha límite y límites al líder
create or replace function public.event_registrations_guard()
returns trigger language plpgsql set search_path = public as $$
declare
  v_event public.events;
  v_taken integer;
begin
  select * into v_event from public.events where id = new.event_id;

  if tg_op = 'INSERT' then
    new.registered_by := coalesce(auth.uid(), new.registered_by);

    if auth.uid() is not null and not public.is_admin() then
      if not v_event.requires_registration then
        raise exception 'Este evento no tiene inscripciones' using errcode = '42501';
      end if;
      if v_event.registration_deadline is not null and now() > v_event.registration_deadline then
        raise exception 'Las inscripciones cerraron' using errcode = '42501';
      end if;
      new.status := 'registered';
      new.amount_due := v_event.fee_amount;
    end if;

    if v_event.capacity is not null then
      select count(*) into v_taken from public.event_registrations
      where event_id = new.event_id and status <> 'cancelled';
      if v_taken >= v_event.capacity then
        raise exception 'El evento ya no tiene cupos' using errcode = '23514';
      end if;
    end if;

  elsif auth.uid() is not null and not public.is_admin() then
    if new.amount_due is distinct from old.amount_due
       or new.event_id is distinct from old.event_id
       or new.adolescent_id is distinct from old.adolescent_id
       or new.leader_id is distinct from old.leader_id
       or (new.status is distinct from old.status and new.status <> 'cancelled') then
      raise exception 'Un líder solo puede cancelar la inscripción o editar notas' using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;
create trigger event_registrations_guard before insert or update on public.event_registrations
for each row execute function public.event_registrations_guard();

-- Alertas: cierre con fecha y responsable; el líder no altera el origen
create or replace function public.alerts_guard()
returns trigger language plpgsql set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin()
     and (new.adolescent_id is distinct from old.adolescent_id
          or new.rule_id is distinct from old.rule_id
          or new.severity is distinct from old.severity
          or new.message is distinct from old.message
          or new.snapshot_agape_id is distinct from old.snapshot_agape_id
          or new.snapshot_clan_id is distinct from old.snapshot_clan_id) then
    raise exception 'Solo puedes cambiar el estado, responsable o nota de la alerta' using errcode = '42501';
  end if;

  if new.status in ('resolved', 'dismissed') and old.status not in ('resolved', 'dismissed') then
    new.resolved_at := now();
    new.resolved_by := auth.uid();
  elsif new.status in ('open', 'in_progress') then
    new.resolved_at := null;
    new.resolved_by := null;
  end if;

  return new;
end;
$$;
create trigger alerts_guard before update on public.alerts
for each row execute function public.alerts_guard();

-- Seguimiento: el autor siempre es quien escribe
create or replace function public.follow_up_notes_guard()
returns trigger language plpgsql set search_path = public as $$
begin
  if auth.uid() is not null then
    new.author_id := case when tg_op = 'UPDATE' then old.author_id else auth.uid() end;
  end if;
  return new;
end;
$$;
create trigger follow_up_notes_guard before insert or update on public.follow_up_notes
for each row execute function public.follow_up_notes_guard();

-- Pagos: quién recibió y quién anuló
create or replace function public.payments_guard()
returns trigger language plpgsql set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.received_by := coalesce(auth.uid(), new.received_by);
  elsif new.status = 'voided' and old.status = 'valid' then
    new.voided_by := auth.uid();
  elsif old.status = 'voided' then
    raise exception 'Un pago anulado no se modifica' using errcode = '42501';
  elsif new.amount is distinct from old.amount then
    raise exception 'Para corregir un monto, anula el pago y registra otro' using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger payments_guard before insert or update on public.payments
for each row execute function public.payments_guard();

-- =====================================================================
-- C. Auditoría automática
-- =====================================================================

create or replace function public.audit_row_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_old jsonb := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end;
  v_new jsonb := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end;
  v_row jsonb := coalesce(v_new, v_old);
begin
  insert into public.audit_log (actor_id, action, table_name, record_id, metadata)
  values (
    auth.uid(),
    lower(tg_op),
    tg_table_name,
    coalesce(v_row ->> 'id', v_row ->> 'key',
             nullif(concat_ws(':', v_row ->> 'adolescent_id', v_row ->> 'guardian_id',
                                   v_row ->> 'meeting_id', v_row ->> 'leader_id'), '')),
    jsonb_strip_nulls(jsonb_build_object('old', v_old, 'new', v_new))
  );
  return null;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'periods','clans','agapes','meeting_types','event_types','bible_school_courses','app_settings','alert_rules',
    'profiles','leaders','leader_agape_assignments','leader_clan_memberships',
    'adolescents','adolescent_agape_memberships','adolescent_clan_memberships','guardians','adolescent_guardians',
    'bible_school_enrollments','meetings','meeting_leaders','attendance','alerts','follow_up_notes',
    'events','event_registrations','payments']
  loop
    execute format('create trigger audit_%1$s after insert or update or delete on public.%1$I
                    for each row execute function public.audit_row_change()', t);
  end loop;
end $$;

-- =====================================================================
-- D. RPCs de negocio
-- =====================================================================

-- Registro de adolescente con ágape, clan y apoderado en una sola operación.
-- p_guardian: {"first_name","last_name","phone","email","relationship_id"}
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
          nullif(trim(p_phone), ''), nullif(trim(p_school_name), ''),
          case when v_admin then 'active' else 'pending' end::public.person_status)
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

-- Aprobación / rechazo (solo ADMIN). Aprobar vuelve definitiva la asistencia provisional.
create or replace function public.review_adolescent(
  p_adolescent_id uuid,
  p_approve       boolean,
  p_reason        text default null
)
returns public.adolescents language plpgsql security definer set search_path = public as $$
declare
  v_row public.adolescents;
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede aprobar o rechazar' using errcode = '42501';
  end if;
  if not p_approve and nullif(trim(p_reason), '') is null then
    raise exception 'Indica el motivo del rechazo' using errcode = '22023';
  end if;

  update public.adolescents
     set status = case when p_approve then 'active' else 'rejected' end::public.person_status,
         reviewed_by = auth.uid(),
         reviewed_at = now(),
         rejection_reason = case when p_approve then null else trim(p_reason) end
   where id = p_adolescent_id and status = 'pending'
  returning * into v_row;

  if not found then
    raise exception 'El adolescente no existe o ya fue revisado' using errcode = 'P0002';
  end if;

  if p_approve then
    update public.attendance set is_provisional = false where adolescent_id = p_adolescent_id;
  end if;

  if v_row.created_by is not null and v_row.created_by <> auth.uid() then
    insert into public.notifications (user_id, title, message, link)
    values (v_row.created_by,
            case when p_approve then 'Registro aprobado' else 'Registro rechazado' end,
            v_row.first_name || ' ' || v_row.last_name ||
              case when p_approve then ' ya es parte de tu ágape.' else '. Motivo: ' || v_row.rejection_reason end,
            '/adolescentes/' || v_row.id);
  end if;

  return v_row;
end;
$$;

-- Cambio de ágape y/o clan conservando historial (solo ADMIN)
create or replace function public.transfer_adolescent(
  p_adolescent_id uuid,
  p_agape_id      uuid default null,
  p_clan_id       uuid default null,
  p_effective_on  date default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_on date := coalesce(p_effective_on, public.today_lima());
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede transferir' using errcode = '42501';
  end if;

  if p_agape_id is not null and not exists (
    select 1 from public.adolescent_agape_memberships
    where adolescent_id = p_adolescent_id and ended_on is null and agape_id = p_agape_id
  ) then
    update public.adolescent_agape_memberships
       set ended_on = greatest(started_on, v_on)
     where adolescent_id = p_adolescent_id and ended_on is null;
    insert into public.adolescent_agape_memberships (adolescent_id, agape_id, started_on, created_by)
    values (p_adolescent_id, p_agape_id, v_on, auth.uid());
  end if;

  if p_clan_id is not null and not exists (
    select 1 from public.adolescent_clan_memberships
    where adolescent_id = p_adolescent_id and ended_on is null and clan_id = p_clan_id
  ) then
    update public.adolescent_clan_memberships
       set ended_on = greatest(started_on, v_on)
     where adolescent_id = p_adolescent_id and ended_on is null;
    insert into public.adolescent_clan_memberships (adolescent_id, clan_id, started_on, created_by)
    values (p_adolescent_id, p_clan_id, v_on, auth.uid());
  end if;
end;
$$;

-- Alertas por inasistencias consecutivas (se ejecuta tras guardar asistencia)
create or replace function public.refresh_absence_alerts()
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_count integer;
begin
  with current_members as (
    select m.adolescent_id, m.agape_id, m.started_on
    from public.adolescent_agape_memberships m
    join public.adolescents a on a.id = m.adolescent_id and a.status = 'active'
    where m.ended_on is null
  ),
  recorded as (
    select c.adolescent_id, c.agape_id, att.status,
           row_number() over (partition by c.adolescent_id order by mt.meeting_date desc, mt.created_at desc) as rn
    from current_members c
    join public.meetings mt on mt.agape_id = c.agape_id and mt.meeting_date >= c.started_on
    join public.meeting_types ty on ty.id = mt.meeting_type_id and ty.counts_for_alerts
    join public.attendance att on att.meeting_id = mt.id and att.adolescent_id = c.adolescent_id
  ),
  streaks as (
    select adolescent_id, agape_id,
           coalesce(min(rn) filter (where status <> 'absent') - 1, count(*))::integer as absences
    from recorded
    group by adolescent_id, agape_id
  ),
  to_create as (
    select s.adolescent_id, s.agape_id, s.absences, r.id as rule_id, r.severity,
           (select cm.clan_id from public.adolescent_clan_memberships cm
             where cm.adolescent_id = s.adolescent_id and cm.ended_on is null limit 1) as clan_id
    from streaks s
    join lateral (
      select ar.id, ar.severity from public.alert_rules ar
      where ar.active and ar.consecutive_absences <= s.absences
      order by ar.consecutive_absences desc limit 1
    ) r on true
    where not exists (
      select 1 from public.alerts al
      where al.adolescent_id = s.adolescent_id and al.status in ('open', 'in_progress')
    )
  ),
  inserted as (
    insert into public.alerts (adolescent_id, rule_id, severity, message, consecutive_absences,
                               snapshot_agape_id, snapshot_clan_id)
    select t.adolescent_id, t.rule_id, t.severity,
           a.first_name || ' ' || a.last_name || ' faltó a ' || t.absences || ' reuniones seguidas',
           t.absences, t.agape_id, t.clan_id
    from to_create t
    join public.adolescents a on a.id = t.adolescent_id
    on conflict do nothing
    returning id, adolescent_id, snapshot_agape_id, message
  ),
  notified as (
    insert into public.notifications (user_id, title, message, link)
    select distinct l.profile_id, 'Nueva alerta de asistencia', i.message, '/alertas/' || i.id
    from inserted i
    join public.leader_agape_assignments la on la.agape_id = i.snapshot_agape_id and la.ended_on is null
    join public.leaders l on l.id = la.leader_id and l.status = 'active' and l.profile_id is not null
    returning 1
  )
  select count(*) into v_count from inserted;

  return v_count;
end;
$$;

create or replace function public.attendance_refresh_alerts()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.refresh_absence_alerts();
  return null;
end;
$$;
create trigger attendance_refresh_alerts
after insert or update on public.attendance
for each statement execute function public.attendance_refresh_alerts();

-- Retención de rechazados (programar con pg_cron, ver README)
create or replace function public.purge_rejected_adolescents()
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_count integer;
begin
  delete from public.adolescents
   where status = 'rejected'
     and reviewed_at < now() - make_interval(days => public.setting_int('rejected_retention_days', 90));
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- Importa filas pendientes de staging_adolescents (solo ADMIN o SQL Editor)
create or replace function public.process_staging_adolescents(p_batch text default null)
returns table (imported integer, failed integer)
language plpgsql security definer set search_path = public as $$
declare
  r             public.staging_adolescents;
  v_sex         public.sex_type;
  v_birth       date;
  v_agape       uuid;
  v_clan        uuid;
  v_rel         uuid;
  v_course      uuid;
  v_period      uuid := public.current_period_id();
  v_id          uuid;
  v_guardian_id uuid;
  v_ok          integer := 0;
  v_bad         integer := 0;
begin
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'Solo un administrador puede importar' using errcode = '42501';
  end if;

  for r in
    select * from public.staging_adolescents
    where import_status = 'pending' and (p_batch is null or batch = p_batch)
    order by id
  loop
    begin
      if nullif(trim(r.first_name), '') is null or nullif(trim(r.last_name), '') is null then
        raise exception 'Faltan nombre o apellido';
      end if;

      v_sex := case upper(left(trim(coalesce(r.sex, '')), 1))
                 when 'M' then 'male' when 'H' then 'male' when 'F' then 'female' end;
      if v_sex is null then raise exception 'Sexo no válido: "%" (usa M o F)', r.sex; end if;

      v_birth := case
        when nullif(trim(r.birth_date), '') is null then null
        when trim(r.birth_date) ~ '^\d{4}-\d{2}-\d{2}$' then trim(r.birth_date)::date
        when trim(r.birth_date) ~ '^\d{1,2}/\d{1,2}/\d{4}$' then to_date(trim(r.birth_date), 'DD/MM/YYYY')
      end;
      if nullif(trim(r.birth_date), '') is not null and v_birth is null then
        raise exception 'Fecha no válida: "%"', r.birth_date;
      end if;

      select id into v_agape from public.agapes where lower(trim(name)) = lower(trim(r.agape_name));
      if v_agape is null then raise exception 'Ágape no encontrado: "%"', r.agape_name; end if;

      select id into v_clan from public.clans
      where lower(trim(name)) = lower(trim(r.clan_name)) or slug = lower(trim(r.clan_name));
      if v_clan is null then raise exception 'Clan no encontrado: "%"', r.clan_name; end if;

      if exists (
        select 1 from public.adolescents a
        where lower(trim(a.first_name)) = lower(trim(r.first_name))
          and lower(trim(a.last_name)) = lower(trim(r.last_name))
          and a.birth_date is not distinct from v_birth
          and a.status <> 'rejected'
      ) then
        raise exception 'Duplicado: ya existe con ese nombre y fecha';
      end if;

      insert into public.adolescents (first_name, last_name, sex, birth_date, phone, school_name, status)
      values (trim(r.first_name), trim(r.last_name), v_sex, v_birth,
              nullif(trim(r.phone), ''), nullif(trim(r.school_name), ''), 'active')
      returning id into v_id;

      insert into public.adolescent_agape_memberships (adolescent_id, agape_id, created_by) values (v_id, v_agape, auth.uid());
      insert into public.adolescent_clan_memberships  (adolescent_id, clan_id,  created_by) values (v_id, v_clan,  auth.uid());

      if nullif(trim(r.guardian_phone), '') is not null then
        v_rel := null;
        select id into v_rel from public.guardian_relationships
        where lower(trim(name)) = lower(trim(r.guardian_relationship));

        insert into public.guardians (first_name, last_name, phone)
        values (coalesce(nullif(trim(r.guardian_first_name), ''), 'Apoderado'),
                coalesce(trim(r.guardian_last_name), ''), trim(r.guardian_phone))
        returning id into v_guardian_id;

        insert into public.adolescent_guardians (adolescent_id, guardian_id, relationship_id, is_primary)
        values (v_id, v_guardian_id, v_rel, true);
      end if;

      if nullif(trim(r.bible_course), '') is not null then
        v_course := null;
        select id into v_course from public.bible_school_courses where lower(trim(name)) = lower(trim(r.bible_course));
        if v_course is null then raise exception 'Curso no encontrado: "%"', r.bible_course; end if;
        if v_period is null then raise exception 'No hay período vigente para el curso'; end if;
        insert into public.bible_school_enrollments (adolescent_id, course_id, period_id)
        values (v_id, v_course, v_period);
      end if;

      update public.staging_adolescents
         set import_status = 'imported', import_error = null, adolescent_id = v_id
       where id = r.id;
      v_ok := v_ok + 1;

    exception when others then
      update public.staging_adolescents
         set import_status = 'error', import_error = sqlerrm
       where id = r.id;
      v_bad := v_bad + 1;
    end;
  end loop;

  return query select v_ok, v_bad;
end;
$$;
