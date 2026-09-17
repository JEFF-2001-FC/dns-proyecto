-- Datos iniciales · se puede ejecutar varias veces (no duplica)

insert into public.periods (year, name, starts_on, ends_on, is_current) values
  (2026, 'Período 2026', '2026-01-01', '2026-12-31', true),
  (2027, 'Período 2027', '2027-01-01', '2027-12-31', false)
on conflict (year) do nothing;

insert into public.clans (name, slug, color, sort_order) values
  ('Águilas',  'aguilas',  '#1F5FAD', 1),
  ('Búfalos',  'bufalos',  '#8A4B20', 2),
  ('Osos',     'osos',     '#3F6B3A', 3),
  ('Mustangs', 'mustangs', '#B23A2E', 4)
on conflict (slug) do nothing;

insert into public.meeting_types (name, description, counts_for_alerts) values
  ('Reunión de ágape', 'Reunión semanal del ágape', true),
  ('Reunión general',  'Reunión de todo el ministerio', true),
  ('Actividad especial', 'No suma para alertas de inasistencia', false)
on conflict (name) do nothing;

insert into public.event_types (name, color) values
  ('Campamento', '#1F5FAD'), ('Retiro', '#3F6B3A'), ('Actividad de clan', '#B23A2E'), ('Culto especial', '#6B4FA0')
on conflict (name) do nothing;

-- Ajusta los nombres a los cursos reales de la Escuela Bíblica
insert into public.bible_school_courses (name, level, sort_order) values
  ('Escuela Bíblica – Nueva Vida en Cristo', 1, 1),
  ('Escuela Bíblica – Fundamentos de la fe', 2, 2),
  ('Escuela Bíblica – Espiritu Santo', 3, 3)
on conflict (name) do nothing;

insert into public.guardian_relationships (name, sort_order) values
  ('Madre', 1), ('Padre', 2), ('Abuelo(a)', 3), ('Tío(a)', 4), ('Hermano(a) mayor', 5), ('Tutor legal', 6)
on conflict (name) do nothing;

insert into public.alert_rules (name, consecutive_absences, severity) values
  ('2 faltas seguidas', 2, 'info'),
  ('3 faltas seguidas', 3, 'warning'),
  ('4 faltas seguidas', 4, 'critical')
on conflict (consecutive_absences) do nothing;

insert into public.app_settings (key, value, description) values
  ('attendance_correction_days', '7',  'Días que un líder puede registrar o corregir asistencia'),
  ('rejected_retention_days',    '90', 'Días que se conserva un registro rechazado'),
  ('timezone',                   '"America/Lima"', 'Zona horaria del ministerio')
on conflict (key) do nothing;
