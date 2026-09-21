-- 0013 · Biblioteca privada de materiales para líderes.
create table if not exists public.materials (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (length(trim(title)) > 0),
  description text,
  storage_path text not null unique,
  file_name   text not null,
  mime_type   text not null,
  size_bytes  bigint not null check (size_bytes > 0),
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);
alter table public.materials enable row level security;
drop policy if exists materials_select on public.materials;
drop policy if exists materials_admin_write on public.materials;
create policy materials_select on public.materials for select to authenticated using (true);
create policy materials_admin_write on public.materials for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('dns-materials', 'dns-materials', false, 10485760, array['application/pdf'])
on conflict (id) do update set public = false, file_size_limit = 10485760, allowed_mime_types = array['application/pdf'];

drop policy if exists "dns materials download" on storage.objects;
create policy "dns materials download" on storage.objects for select to authenticated using (bucket_id = 'dns-materials');
