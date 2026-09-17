-- 0008 · Índices y vistas de consulta / reportes

-- =====================================================================
-- A. Índices (columnas usadas por RLS, listados y reportes)
-- =====================================================================
create index idx_aam_agape_current    on public.adolescent_agape_memberships (agape_id) where ended_on is null;
create index idx_aam_adolescent       on public.adolescent_agape_memberships (adolescent_id);
create index idx_acm_clan_current     on public.adolescent_clan_memberships (clan_id) where ended_on is null;
create index idx_acm_adolescent       on public.adolescent_clan_memberships (adolescent_id);
create index idx_laa_agape_current    on public.leader_agape_assignments (agape_id) where ended_on is null;
create index idx_laa_leader           on public.leader_agape_assignments (leader_id);
create index idx_lcm_leader           on public.leader_clan_memberships (leader_id);
create index idx_adolescents_status   on public.adolescents (status);
create index idx_adolescents_name     on public.adolescents (lower(last_name), lower(first_name));
create index idx_ag_guardian          on public.adolescent_guardians (guardian_id);
create index idx_bse_course_period    on public.bible_school_enrollments (course_id, period_id);
create index idx_meetings_agape_date  on public.meetings (agape_id, meeting_date desc);
create index idx_meetings_period      on public.meetings (period_id);
create index idx_meeting_leaders_ldr  on public.meeting_leaders (leader_id);
create index idx_attendance_adol      on public.attendance (adolescent_id);
create index idx_alerts_agape_status  on public.alerts (snapshot_agape_id, status);
create index idx_followups_adol       on public.follow_up_notes (adolescent_id, occurred_at desc);
create index idx_events_starts        on public.events (starts_at);
create index idx_events_clan          on public.events (clan_id) where scope = 'clan';
create index idx_events_agape         on public.events (agape_id) where scope = 'agape';
create index idx_registrations_adol   on public.event_registrations (adolescent_id);
create index idx_registrations_leader on public.event_registrations (leader_id);
create index idx_payments_reg         on public.payments (registration_id);
create index idx_notifications_user   on public.notifications (user_id, read_at);
create index idx_audit_record         on public.audit_log (table_name, record_id);
create index idx_audit_created        on public.audit_log (created_at desc);
create index idx_staging_status       on public.staging_adolescents (import_status, batch);

-- =====================================================================
-- B. Vistas (security_invoker: respetan la RLS de quien consulta)
-- =====================================================================

-- Ficha con ágape, clan y apoderado principal vigentes
create view public.v_adolescents with (security_invoker = true) as
select
  a.id, a.first_name, a.last_name,
  a.first_name || ' ' || a.last_name as full_name,
  a.sex, a.birth_date,
  extract(year from age(public.today_lima(), a.birth_date))::integer as age,
  a.phone, a.school_name, a.status, a.created_at, a.created_by,
  am.agape_id, ag.name as agape_name,
  cm.clan_id, c.name as clan_name, c.color as clan_color,
  g.guardian_name, g.guardian_phone, g.guardian_relationship
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

-- Resumen por reunión (la asistencia provisional se cuenta aparte)
create view public.v_meeting_summary with (security_invoker = true) as
select
  m.id as meeting_id, m.meeting_date, m.topic,
  m.agape_id, ag.name as agape_name,
  m.period_id, mt.name as meeting_type,
  count(at.id) filter (where not at.is_provisional)                                   as recorded,
  count(at.id) filter (where not at.is_provisional and at.status = 'present')         as present,
  count(at.id) filter (where not at.is_provisional and at.status = 'late')            as late,
  count(at.id) filter (where not at.is_provisional and at.status = 'justified')       as justified,
  count(at.id) filter (where not at.is_provisional and at.status = 'absent')          as absent,
  count(at.id) filter (where at.is_provisional)                                       as provisional
from public.meetings m
join public.agapes ag on ag.id = m.agape_id
join public.meeting_types mt on mt.id = m.meeting_type_id
left join public.attendance at on at.meeting_id = m.id
group by m.id, ag.name, mt.name;

-- % de asistencia por adolescente y período (justificadas no penalizan)
create view public.v_attendance_rate with (security_invoker = true) as
select
  at.adolescent_id, m.period_id,
  count(*)                                          as recorded,
  count(*) filter (where at.status in ('present', 'late')) as attended,
  count(*) filter (where at.status = 'justified')   as justified,
  count(*) filter (where at.status = 'absent')      as absent,
  round(100.0 * count(*) filter (where at.status in ('present', 'late'))
        / nullif(count(*) filter (where at.status <> 'justified'), 0), 1) as attendance_pct
from public.attendance at
join public.meetings m on m.id = at.meeting_id
where not at.is_provisional
group by at.adolescent_id, m.period_id;

revoke all on public.v_adolescents, public.v_meeting_summary, public.v_attendance_rate from anon;
grant select on public.v_adolescents, public.v_meeting_summary, public.v_attendance_rate to authenticated;
