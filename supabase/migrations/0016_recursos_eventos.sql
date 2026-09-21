-- 0016 · Recursos adjuntos a cada evento (PDF, enlace o nota).
alter type public.material_kind add value if not exists 'note';
create table if not exists public.event_resources (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  kind public.material_kind not null default 'file',
  storage_path text unique,
  file_name text,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes > 0),
  external_url text,
  body text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint event_resources_content_check check (
    (kind = 'file' and storage_path is not null and file_name is not null)
    or (kind = 'link' and external_url ~* '^https?://')
    or (kind = 'note' and nullif(trim(body), '') is not null)
  )
);
create index if not exists idx_event_resources_event on public.event_resources(event_id, created_at);
alter table public.event_resources enable row level security;
drop policy if exists event_resources_select on public.event_resources;
drop policy if exists event_resources_insert on public.event_resources;
drop policy if exists event_resources_update on public.event_resources;
drop policy if exists event_resources_delete on public.event_resources;
create policy event_resources_select on public.event_resources for select to authenticated using (true);
create policy event_resources_insert on public.event_resources for insert to authenticated with check (
  (select public.is_admin()) or exists (select 1 from public.events e where e.id = event_id and e.created_by = auth.uid())
);
create policy event_resources_update on public.event_resources for update to authenticated using (
  (select public.is_admin()) or uploaded_by = auth.uid()
) with check ((select public.is_admin()) or uploaded_by = auth.uid());
create policy event_resources_delete on public.event_resources for delete to authenticated using (
  (select public.is_admin()) or uploaded_by = auth.uid()
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('dns-event-resources', 'dns-event-resources', false, 10485760, array['application/pdf'])
on conflict (id) do update set public = false, file_size_limit = 10485760, allowed_mime_types = array['application/pdf'];
drop policy if exists "dns event resources download" on storage.objects;
create policy "dns event resources download" on storage.objects for select to authenticated using (bucket_id = 'dns-event-resources');
