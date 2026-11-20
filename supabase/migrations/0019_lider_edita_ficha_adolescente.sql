-- 0019 · Permitir que líderes actualicen la ficha de acompañamiento
-- RLS ya limita la fila al adolescente de un ágape accesible para el usuario.
grant insert, update on public.adolescent_life_profiles to authenticated;

drop policy if exists life_profiles_access on public.adolescent_life_profiles;
create policy life_profiles_access on public.adolescent_life_profiles
  for all to authenticated
  using (public.can_view_adolescent(adolescent_id))
  with check (public.can_view_adolescent(adolescent_id));

-- Mantiene el alcance de la fila original al editar y solo permite actualizar
-- datos descriptivos; estado, autor y revisión siguen bajo control admin.
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
    if auth.uid() is not null and not public.is_admin() then
      new.status := 'active';
      new.created_by := auth.uid();
    end if;
    return new;
  end if;

  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if new.id is distinct from old.id
     or new.status is distinct from old.status
     or new.created_by is distinct from old.created_by
     or new.reviewed_by is distinct from old.reviewed_by
     or new.reviewed_at is distinct from old.reviewed_at
     or new.rejection_reason is distinct from old.rejection_reason then
    raise exception 'Solo un administrador puede cambiar el estado o la revisión' using errcode = '42501';
  end if;

  if not public.can_view_adolescent(old.id) then
    raise exception 'No puedes editar adolescentes fuera de tus ágapes' using errcode = '42501';
  end if;

  return new;
end;
$$;
