-- 0007 · Seguridad a nivel de fila (RLS) y permisos
-- Las funciones van envueltas en (select ...) para evaluarse una vez por consulta.

-- =====================================================================
-- A. Activar RLS en las 30 tablas y cerrar el acceso anónimo
-- =====================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'periods','clans','agapes','meeting_types','event_types','bible_school_courses','guardian_relationships','app_settings',
    'profiles','leaders','leader_agape_assignments','leader_clan_memberships',
    'adolescents','adolescent_agape_memberships','adolescent_clan_memberships','guardians','adolescent_guardians','bible_school_enrollments',
    'meetings','meeting_leaders','attendance',
    'alert_rules','alerts','follow_up_notes','events','event_registrations','payments',
    'notifications','audit_log','staging_adolescents']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
  end loop;
end $$;

-- =====================================================================
-- B. Catálogos: todos los autenticados leen, solo ADMIN escribe
-- =====================================================================
do $$
declare t text;
begin
  foreach t in array array['periods','clans','agapes','meeting_types','event_types',
                           'bible_school_courses','guardian_relationships','app_settings','alert_rules']
  loop
    execute format('create policy %1$s_select on public.%1$I for select to authenticated using (true)', t);
    execute format('create policy %1$s_admin_insert on public.%1$I for insert to authenticated with check ((select public.is_admin()))', t);
    execute format('create policy %1$s_admin_update on public.%1$I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t);
    execute format('create policy %1$s_admin_delete on public.%1$I for delete to authenticated using ((select public.is_admin()))', t);
  end loop;
end $$;

-- =====================================================================
-- C. Usuarios y líderes
-- =====================================================================
create policy profiles_select on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy profiles_admin_insert on public.profiles for insert to authenticated
  with check ((select public.is_admin()));
create policy profiles_admin_update on public.profiles for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy profiles_admin_delete on public.profiles for delete to authenticated
  using ((select public.is_admin()));

-- Líder: se ve a sí mismo y a sus co-líderes vigentes
create policy leaders_select on public.leaders for select to authenticated
  using (
    (select public.is_admin())
    or profile_id = (select auth.uid())
    or id in (select la.leader_id from public.leader_agape_assignments la
              where la.ended_on is null and la.agape_id in (select public.my_agape_ids()))
  );
create policy leaders_admin_insert on public.leaders for insert to authenticated with check ((select public.is_admin()));
create policy leaders_admin_update on public.leaders for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy leaders_admin_delete on public.leaders for delete to authenticated using ((select public.is_admin()));

create policy leader_agape_assignments_select on public.leader_agape_assignments for select to authenticated
  using (
    (select public.is_admin())
    or leader_id = (select public.current_leader_id())
    or agape_id in (select public.my_agape_ids())
  );
create policy leader_agape_assignments_admin_insert on public.leader_agape_assignments for insert to authenticated with check ((select public.is_admin()));
create policy leader_agape_assignments_admin_update on public.leader_agape_assignments for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy leader_agape_assignments_admin_delete on public.leader_agape_assignments for delete to authenticated using ((select public.is_admin()));

create policy leader_clan_memberships_select on public.leader_clan_memberships for select to authenticated
  using ((select public.is_admin()) or leader_id = (select public.current_leader_id()));
create policy leader_clan_memberships_admin_insert on public.leader_clan_memberships for insert to authenticated with check ((select public.is_admin()));
create policy leader_clan_memberships_admin_update on public.leader_clan_memberships for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy leader_clan_memberships_admin_delete on public.leader_clan_memberships for delete to authenticated using ((select public.is_admin()));

-- =====================================================================
-- D. Adolescentes (el líder registra con la RPC register_adolescent)
-- =====================================================================
create policy adolescents_select on public.adolescents for select to authenticated
  using (
    (select public.is_admin())
    or exists (select 1 from public.adolescent_agape_memberships m
               where m.adolescent_id = adolescents.id and m.ended_on is null
                 and m.agape_id in (select public.my_agape_ids()))
  );
create policy adolescents_admin_insert on public.adolescents for insert to authenticated
  with check ((select public.is_admin()));
create policy adolescents_update on public.adolescents for update to authenticated
  using (
    (select public.is_admin())
    or exists (select 1 from public.adolescent_agape_memberships m
               where m.adolescent_id = adolescents.id and m.ended_on is null
                 and m.agape_id in (select public.my_agape_ids()))
  );
create policy adolescents_admin_delete on public.adolescents for delete to authenticated
  using ((select public.is_admin()));

create policy adolescent_agape_memberships_select on public.adolescent_agape_memberships for select to authenticated
  using ((select public.is_admin()) or agape_id in (select public.my_agape_ids()));
create policy adolescent_agape_memberships_admin_insert on public.adolescent_agape_memberships for insert to authenticated with check ((select public.is_admin()));
create policy adolescent_agape_memberships_admin_update on public.adolescent_agape_memberships for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy adolescent_agape_memberships_admin_delete on public.adolescent_agape_memberships for delete to authenticated using ((select public.is_admin()));

create policy adolescent_clan_memberships_select on public.adolescent_clan_memberships for select to authenticated
  using ((select public.is_admin()) or public.can_view_adolescent(adolescent_id));
create policy adolescent_clan_memberships_admin_insert on public.adolescent_clan_memberships for insert to authenticated with check ((select public.is_admin()));
create policy adolescent_clan_memberships_admin_update on public.adolescent_clan_memberships for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy adolescent_clan_memberships_admin_delete on public.adolescent_clan_memberships for delete to authenticated using ((select public.is_admin()));

-- Apoderados: teléfono visible solo a ADMIN y líderes del ágape del adolescente
create policy guardians_select on public.guardians for select to authenticated
  using (
    (select public.is_admin())
    or exists (select 1 from public.adolescent_guardians ag
               where ag.guardian_id = guardians.id and public.can_view_adolescent(ag.adolescent_id))
  );
create policy guardians_insert on public.guardians for insert to authenticated
  with check ((select public.is_admin()) or (select public.current_leader_id()) is not null);
create policy guardians_update on public.guardians for update to authenticated
  using (
    (select public.is_admin())
    or exists (select 1 from public.adolescent_guardians ag
               where ag.guardian_id = guardians.id and public.can_view_adolescent(ag.adolescent_id))
  );
create policy guardians_admin_delete on public.guardians for delete to authenticated
  using ((select public.is_admin()));

create policy adolescent_guardians_select on public.adolescent_guardians for select to authenticated
  using (public.can_view_adolescent(adolescent_id));
create policy adolescent_guardians_insert on public.adolescent_guardians for insert to authenticated
  with check (public.can_view_adolescent(adolescent_id));
create policy adolescent_guardians_update on public.adolescent_guardians for update to authenticated
  using (public.can_view_adolescent(adolescent_id)) with check (public.can_view_adolescent(adolescent_id));
create policy adolescent_guardians_delete on public.adolescent_guardians for delete to authenticated
  using (public.can_view_adolescent(adolescent_id));

create policy bible_school_enrollments_select on public.bible_school_enrollments for select to authenticated
  using (public.can_view_adolescent(adolescent_id));
create policy bible_school_enrollments_insert on public.bible_school_enrollments for insert to authenticated
  with check (public.can_view_adolescent(adolescent_id));
create policy bible_school_enrollments_update on public.bible_school_enrollments for update to authenticated
  using (public.can_view_adolescent(adolescent_id)) with check (public.can_view_adolescent(adolescent_id));
create policy bible_school_enrollments_admin_delete on public.bible_school_enrollments for delete to authenticated
  using ((select public.is_admin()));

-- =====================================================================
-- E. Reuniones y asistencia
-- =====================================================================
create policy meetings_select on public.meetings for select to authenticated
  using ((select public.is_admin()) or agape_id in (select public.my_agape_ids()));
create policy meetings_insert on public.meetings for insert to authenticated
  with check ((select public.is_admin()) or agape_id in (select public.my_agape_ids()));
create policy meetings_update on public.meetings for update to authenticated
  using ((select public.is_admin()) or agape_id in (select public.my_agape_ids()))
  with check ((select public.is_admin()) or agape_id in (select public.my_agape_ids()));
create policy meetings_admin_delete on public.meetings for delete to authenticated
  using ((select public.is_admin()));

create policy meeting_leaders_select on public.meeting_leaders for select to authenticated
  using (exists (select 1 from public.meetings m where m.id = meeting_leaders.meeting_id));
create policy meeting_leaders_insert on public.meeting_leaders for insert to authenticated
  with check ((select public.is_admin())
              or exists (select 1 from public.meetings m where m.id = meeting_id and m.agape_id in (select public.my_agape_ids())));
create policy meeting_leaders_delete on public.meeting_leaders for delete to authenticated
  using ((select public.is_admin())
         or exists (select 1 from public.meetings m where m.id = meeting_id and m.agape_id in (select public.my_agape_ids())));

create policy attendance_select on public.attendance for select to authenticated
  using ((select public.is_admin())
         or exists (select 1 from public.meetings m
                    where m.id = attendance.meeting_id and m.agape_id in (select public.my_agape_ids())));
create policy attendance_insert on public.attendance for insert to authenticated
  with check ((select public.is_admin()) or public.can_write_attendance(meeting_id, adolescent_id));
create policy attendance_update on public.attendance for update to authenticated
  using ((select public.is_admin()) or public.can_write_attendance(meeting_id, adolescent_id))
  with check ((select public.is_admin()) or public.can_write_attendance(meeting_id, adolescent_id));
create policy attendance_admin_delete on public.attendance for delete to authenticated
  using ((select public.is_admin()));

-- =====================================================================
-- F. Alertas y seguimiento
-- =====================================================================
create policy alerts_select on public.alerts for select to authenticated
  using ((select public.is_admin()) or snapshot_agape_id in (select public.my_agape_ids()));
create policy alerts_update on public.alerts for update to authenticated
  using ((select public.is_admin()) or snapshot_agape_id in (select public.my_agape_ids()))
  with check ((select public.is_admin()) or snapshot_agape_id in (select public.my_agape_ids()));
create policy alerts_admin_insert on public.alerts for insert to authenticated with check ((select public.is_admin()));
create policy alerts_admin_delete on public.alerts for delete to authenticated using ((select public.is_admin()));

create policy follow_up_notes_select on public.follow_up_notes for select to authenticated
  using (public.can_view_adolescent(adolescent_id));
create policy follow_up_notes_insert on public.follow_up_notes for insert to authenticated
  with check (public.can_view_adolescent(adolescent_id));
create policy follow_up_notes_update on public.follow_up_notes for update to authenticated
  using ((select public.is_admin()) or author_id = (select auth.uid()))
  with check ((select public.is_admin()) or author_id = (select auth.uid()));
create policy follow_up_notes_delete on public.follow_up_notes for delete to authenticated
  using ((select public.is_admin()) or author_id = (select auth.uid()));

-- =====================================================================
-- G. Eventos (Opción A), inscripciones y pagos
-- =====================================================================
create policy events_select on public.events for select to authenticated
  using (
    (select public.is_admin())
    or scope = 'general'
    or (scope = 'clan'  and clan_id  in (select public.my_clan_ids()))
    or (scope = 'agape' and agape_id in (select public.my_agape_ids()))
  );
create policy events_admin_insert on public.events for insert to authenticated with check ((select public.is_admin()));
create policy events_admin_update on public.events for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy events_admin_delete on public.events for delete to authenticated using ((select public.is_admin()));

create policy event_registrations_select on public.event_registrations for select to authenticated
  using (
    (select public.is_admin())
    or (adolescent_id is not null and public.can_view_adolescent(adolescent_id))
    or leader_id = (select public.current_leader_id())
  );
create policy event_registrations_insert on public.event_registrations for insert to authenticated
  with check (
    (select public.is_admin())
    or (exists (select 1 from public.events e where e.id = event_id)
        and ((adolescent_id is not null and public.can_view_adolescent(adolescent_id))
             or leader_id = (select public.current_leader_id())))
  );
create policy event_registrations_update on public.event_registrations for update to authenticated
  using (
    (select public.is_admin())
    or (adolescent_id is not null and public.can_view_adolescent(adolescent_id))
    or leader_id = (select public.current_leader_id())
  );
create policy event_registrations_admin_delete on public.event_registrations for delete to authenticated
  using ((select public.is_admin()));

-- Finanzas V1: solo ADMIN. Los pagos no se borran: se anulan.
create policy payments_admin_select on public.payments for select to authenticated using ((select public.is_admin()));
create policy payments_admin_insert on public.payments for insert to authenticated with check ((select public.is_admin()));
create policy payments_admin_update on public.payments for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- =====================================================================
-- H. Sistema
-- =====================================================================
create policy notifications_select_own on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));
create policy notifications_update_own on public.notifications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy notifications_delete_own on public.notifications for delete to authenticated
  using (user_id = (select auth.uid()));
create policy notifications_admin_insert on public.notifications for insert to authenticated
  with check ((select public.is_admin()));

create policy audit_log_admin_select on public.audit_log for select to authenticated
  using ((select public.is_admin()));

create policy staging_adolescents_admin on public.staging_adolescents for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- =====================================================================
-- I. Permisos de ejecución de funciones
-- =====================================================================
revoke execute on all functions in schema public from public, anon;

grant execute on function
  public.today_lima(), public.setting_int(text, integer), public.current_period_id(),
  public.is_admin(), public.current_leader_id(), public.my_agape_ids(), public.my_clan_ids(),
  public.can_view_adolescent(uuid), public.can_write_attendance(uuid, uuid),
  public.register_adolescent(uuid, uuid, text, text, public.sex_type, date, text, text, jsonb),
  public.review_adolescent(uuid, boolean, text),
  public.transfer_adolescent(uuid, uuid, uuid, date),
  public.process_staging_adolescents(text)
to authenticated;

-- Solo sistema (triggers, cron, service_role)
revoke execute on function public.refresh_absence_alerts(), public.purge_rejected_adolescents() from authenticated;
grant execute on all functions in schema public to service_role;
