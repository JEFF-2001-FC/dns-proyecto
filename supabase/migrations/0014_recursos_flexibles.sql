-- 0014 · Un material puede ser archivo, enlace o nota.
do $$ begin
  if not exists (select 1 from pg_type where typname = 'material_kind') then
    create type public.material_kind as enum ('file', 'link', 'note');
  end if;
end $$;
alter type public.material_kind add value if not exists 'note';
alter table public.materials
  add column if not exists kind public.material_kind not null default 'file',
  add column if not exists external_url text,
  add column if not exists body text,
  alter column storage_path drop not null,
  alter column file_name drop not null,
  alter column mime_type drop not null,
  alter column size_bytes drop not null;
alter table public.materials drop constraint if exists materials_resource_check;
alter table public.materials add constraint materials_resource_check check (
  (kind = 'file' and storage_path is not null and file_name is not null)
  or (kind = 'link' and external_url ~* '^https?://')
  or (kind = 'note' and nullif(trim(body), '') is not null)
);
