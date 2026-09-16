-- DNS seed inicial. No crea usuarios.
insert into public.clans (name, slug, color, icon, description)
values
('Águilas','aguilas','#DC2626','🦅','Clan Águilas'),
('Búfalos','bufalos','#EAB308','🦬','Clan Búfalos'),
('Osos','osos','#2563EB','🐻','Clan Osos'),
('Mustangs','mustangs','#16A34A','🐎','Clan Mustangs')
on conflict (slug) do update set
  name=excluded.name,
  color=excluded.color,
  icon=excluded.icon,
  description=excluded.description;

insert into public.alert_rules (name, consecutive_absences, severity)
values
('Atención',1,'warning'),
('Seguimiento',2,'warning'),
('Alerta crítica',3,'critical')
on conflict do nothing;
