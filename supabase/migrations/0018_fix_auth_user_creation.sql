-- 0018 · Arreglo para creación de usuarios desde Supabase Auth
-- Evita "Database error creating new user" cuando el trigger crea public.profiles.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do update
    set email = excluded.email,
        full_name = case
          when nullif(public.profiles.full_name, '') is null then excluded.full_name
          else public.profiles.full_name
        end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

grant usage on schema public to supabase_auth_admin;
grant insert, update, select on public.profiles to supabase_auth_admin;
grant execute on function public.handle_new_user() to supabase_auth_admin;
