-- 0009 · Paleta oficial de clanes (tokens accesibles) y contexto del líder
-- Ágape y clan siguen siendo independientes: esta migración NO toca las tablas
-- de membresía, solo el color de los clanes y la lectura del contexto del líder.

-- =====================================================================
-- A. Tokens de color por clan
--    color      → color sólido (punto, borde, acento)
--    color_soft → fondo del badge
--    color_ink  → texto sobre color_soft (contraste AA garantizado)
-- =====================================================================

alter table public.clans
  add column if not exists color_soft text,
  add column if not exists color_ink  text;

update public.clans set
  color      = '#C62828',
  color_soft = '#FDE8E4',
  color_ink  = '#9A2A10',
  sort_order = 1
where slug = 'aguilas';

update public.clans set
  color      = '#E0A100',
  color_soft = '#FDF1D8',
  color_ink  = '#7A4B00',
  sort_order = 2
where slug = 'bufalos';

update public.clans set
  color      = '#2E7D32',
  color_soft = '#E3F4E6',
  color_ink  = '#1E6B32',
  sort_order = 3
where slug = 'mustangs';

update public.clans set
  color      = '#1F5FAD',
  color_soft = '#E6EEF8',
  color_ink  = '#16457E',
  sort_order = 4
where slug = 'osos';

-- Ningún clan puede quedarse sin tokens (protege clanes creados a mano)
update public.clans
set color_soft = coalesce(color_soft, '#F5F3EE'),
    color_ink  = coalesce(color_ink,  '#2A2A2E')
where color_soft is null or color_ink is null;

alter table public.clans
  alter column color_soft set not null,
  alter column color_ink  set not null,
  alter column color_soft set default '#F5F3EE',
  alter column color_ink  set default '#2A2A2E';

-- Constraints idempotentes (la migración puede reejecutarse sin error)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'clans_color_hex') then
    alter table public.clans add constraint clans_color_hex check (color ~* '^#[0-9a-f]{6}$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'clans_color_soft_hex') then
    alter table public.clans add constraint clans_color_soft_hex check (color_soft ~* '^#[0-9a-f]{6}$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'clans_color_ink_hex') then
    alter table public.clans add constraint clans_color_ink_hex check (color_ink ~* '^#[0-9a-f]{6}$');
  end if;
end $$;

-- =====================================================================
-- B. v_adolescents · se añaden los dos tokens nuevos AL FINAL
--    (create or replace view exige mismo orden de columnas + nuevas al final)
-- =====================================================================

create or replace view public.v_adolescents with (security_invoker = true) as
select
  a.id, a.first_name, a.last_name,
  a.first_name || ' ' || a.last_name as full_name,
  a.sex, a.birth_date,
  extract(year from age(public.today_lima(), a.birth_date))::integer as age,
  a.phone, a.school_name, a.status, a.created_at, a.created_by,
  am.agape_id, ag.name as agape_name,
  cm.clan_id, c.name as clan_name, c.color as clan_color,
  g.guardian_name, g.guardian_phone, g.guardian_relationship,
  c.slug       as clan_slug,
  c.color_soft as clan_color_soft,
  c.color_ink  as clan_color_ink
from public.adolescents a
left join public.adolescent_agape_memberships am on am.adolescent_id = a.id and am.ended_on is null
left join public.agapes ag on ag.id = am.agape_id
left join public.adolescent_clan_memberships cm on cm.adolescent_id = a.id and cm.ended_on is null
left join public.clans c on c.id = cm.clan_id
left join lateral (
  select gu.first_name || ' ' || gu.last_name as guardian_name,
         gu.phone as guardian_phone,
         gr.name as guardian_relationship
  from public.adolescent_guardians x
  join public.guardians gu on gu.id = x.guardian_id
  left join public.guardian_relationships gr on gr.id = x.relationship_id
  where x.adolescent_id = a.id and x.is_primary
  limit 1
) g on true;

-- =====================================================================
-- C. v_my_context · ágape y clan vigentes del usuario conectado
--    Sustituye a duplicar agape_id / clan_id dentro de public.profiles:
--    la verdad sigue viviendo en las tablas de asignación con historial.
--    Un líder con varios ágapes devuelve una fila por ágape.
-- =====================================================================

create or replace view public.v_my_context with (security_invoker = true) as
select
  p.id                as profile_id,
  p.full_name,
  p.role,
  l.id                as leader_id,
  la.agape_id,
  ag.name             as agape_name,
  la.role             as agape_role,
  lc.clan_id,
  c.name              as clan_name,
  c.slug              as clan_slug,
  c.color             as clan_color,
  c.color_soft        as clan_color_soft,
  c.color_ink         as clan_color_ink
from public.profiles p
left join public.leaders l on l.profile_id = p.id
left join public.leader_agape_assignments la
       on la.leader_id = l.id
      and la.started_on <= public.today_lima()
      and (la.ended_on is null or la.ended_on >= public.today_lima())
left join public.agapes ag on ag.id = la.agape_id
left join public.leader_clan_memberships lc
       on lc.leader_id = l.id
      and lc.started_on <= public.today_lima()
      and (lc.ended_on is null or lc.ended_on >= public.today_lima())
left join public.clans c on c.id = lc.clan_id
where p.id = auth.uid();

revoke all on public.v_my_context from anon;
grant select on public.v_my_context to authenticated;
