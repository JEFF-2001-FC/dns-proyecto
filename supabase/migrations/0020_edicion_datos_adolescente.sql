-- 0020 · Edición controlada de datos básicos desde la aplicación
create or replace function public.update_adolescent_profile(
  p_adolescent_id uuid,
  p_first_name text,
  p_last_name text,
  p_sex public.sex_type,
  p_birth_date date,
  p_phone text,
  p_school_name text,
  p_agape_id uuid,
  p_clan_id uuid,
  p_guardian_name text,
  p_guardian_phone text,
  p_guardian_relationship_id uuid
)
returns void language plpgsql security invoker set search_path = public as $$
declare
  v_guardian_id uuid;
  v_first text;
  v_last text;
begin
  if auth.uid() is null or not public.can_view_adolescent(p_adolescent_id) then
    raise exception 'No tienes permiso para editar este adolescente' using errcode = '42501';
  end if;
  if nullif(trim(p_first_name), '') is null or nullif(trim(p_last_name), '') is null then
    raise exception 'Nombres y apellidos son obligatorios' using errcode = '22023';
  end if;
  if p_birth_date > public.today_lima() then
    raise exception 'La fecha de nacimiento no puede ser futura' using errcode = '22023';
  end if;
  if not exists (select 1 from public.agapes where id = p_agape_id and active)
     or (not public.is_admin() and p_agape_id not in (select public.my_agape_ids())) then
    raise exception 'No puedes asignar el adolescente a ese ágape' using errcode = '42501';
  end if;
  if not exists (select 1 from public.clans where id = p_clan_id and active) then
    raise exception 'El clan no existe o está inactivo' using errcode = '22023';
  end if;

  update public.adolescents set
    first_name = trim(p_first_name), last_name = trim(p_last_name), sex = p_sex,
    birth_date = p_birth_date, phone = nullif(trim(p_phone), ''), school_name = nullif(trim(p_school_name), '')
  where id = p_adolescent_id;
  if not found then raise exception 'No se encontró el adolescente'; end if;

  if not exists (select 1 from public.adolescent_agape_memberships where adolescent_id = p_adolescent_id and ended_on is null and agape_id = p_agape_id) then
    update public.adolescent_agape_memberships set ended_on = public.today_lima()
    where adolescent_id = p_adolescent_id and ended_on is null;
    insert into public.adolescent_agape_memberships (adolescent_id, agape_id, created_by)
    values (p_adolescent_id, p_agape_id, auth.uid());
  end if;

  if not exists (select 1 from public.adolescent_clan_memberships where adolescent_id = p_adolescent_id and ended_on is null and clan_id = p_clan_id) then
    update public.adolescent_clan_memberships set ended_on = public.today_lima()
    where adolescent_id = p_adolescent_id and ended_on is null;
    insert into public.adolescent_clan_memberships (adolescent_id, clan_id, created_by)
    values (p_adolescent_id, p_clan_id, auth.uid());
  end if;

  if nullif(trim(p_guardian_phone), '') is null then
    delete from public.adolescent_guardians ag
    using public.guardians g
    where ag.adolescent_id = p_adolescent_id and ag.is_primary and g.id = ag.guardian_id;
    delete from public.guardians g
    where not exists (select 1 from public.adolescent_guardians ag where ag.guardian_id = g.id);
    return;
  end if;

  v_first := coalesce(nullif(trim(split_part(coalesce(p_guardian_name, ''), ' ', 1)), ''), 'Apoderado');
  v_last := nullif(trim(regexp_replace(coalesce(p_guardian_name, ''), '^\S+\s*', '')), '');
  select g.id into v_guardian_id from public.adolescent_guardians ag
  join public.guardians g on g.id = ag.guardian_id
  where ag.adolescent_id = p_adolescent_id and ag.is_primary limit 1;

  if v_guardian_id is null then
    insert into public.guardians (first_name, last_name, phone)
    values (v_first, coalesce(v_last, ''), trim(p_guardian_phone)) returning id into v_guardian_id;
    insert into public.adolescent_guardians (adolescent_id, guardian_id, relationship_id, is_primary)
    values (p_adolescent_id, v_guardian_id, p_guardian_relationship_id, true);
  else
    update public.guardians set first_name = v_first, last_name = coalesce(v_last, ''), phone = trim(p_guardian_phone)
    where id = v_guardian_id;
    update public.adolescent_guardians set relationship_id = p_guardian_relationship_id
    where adolescent_id = p_adolescent_id and guardian_id = v_guardian_id;
  end if;
end;
$$;

revoke execute on function public.update_adolescent_profile(
  uuid, text, text, public.sex_type, date, text, text, uuid, uuid, text, text, uuid
) from public, anon;
grant execute on function public.update_adolescent_profile(
  uuid, text, text, public.sex_type, date, text, text, uuid, uuid, text, text, uuid
) to authenticated;
