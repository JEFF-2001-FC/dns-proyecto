-- =====================================================================
-- RESET del esquema v1 (12 tablas) antes de aplicar el modelo de 30 tablas.
-- BORRA TODOS LOS DATOS de esas tablas. Úsalo solo si aún no hay datos reales.
-- Los usuarios de Supabase Auth NO se borran; su perfil se recrea en 0003.
-- =====================================================================

drop trigger if exists on_auth_user_created on auth.users;

drop table if exists
  public.audit_log, public.notifications, public.alerts, public.alert_rules,
  public.events, public.attendance, public.meetings, public.adolescents,
  public.leaders, public.agapes, public.profiles, public.clans
cascade;

drop function if exists
  public.handle_new_user(), public.current_role(), public.current_leader_id(),
  public.current_agape_id(), public.current_clan_id(), public.is_admin(),
  public.can_write_attendance(uuid, uuid), public.adolescents_guard(),
  public.profiles_guard(), public.audit_row_change(),
  public.review_adolescent(uuid, boolean, text), public.purge_rejected_adolescents()
cascade;

drop type if exists
  public.app_role, public.person_status, public.attendance_status,
  public.alert_severity, public.alert_status, public.event_scope
cascade;
