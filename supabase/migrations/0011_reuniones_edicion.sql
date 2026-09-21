-- 0011 · Corrección de reuniones para líderes dentro de la misma ventana
-- configurada para asistencia. El admin puede eliminar en cualquier fecha.

drop policy if exists meetings_admin_delete on public.meetings;
create policy meetings_delete_correction_window on public.meetings
  for delete to authenticated
  using (
    (select public.is_admin())
    or (
      agape_id in (select public.my_agape_ids())
      and meeting_date >= public.today_lima() - public.setting_int('attendance_correction_days', 7)
      and meeting_date <= public.today_lima()
    )
  );
