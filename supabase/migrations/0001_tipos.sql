-- 0001 · Extensiones y tipos del dominio DNS
create extension if not exists pgcrypto;

create type public.app_role            as enum ('admin', 'leader');
create type public.person_status       as enum ('pending', 'active', 'inactive', 'archived', 'rejected');
create type public.sex_type            as enum ('male', 'female');
create type public.leader_role         as enum ('lead', 'assistant');
create type public.attendance_status   as enum ('present', 'absent', 'justified', 'late');
create type public.alert_severity      as enum ('info', 'warning', 'critical');
create type public.alert_status        as enum ('open', 'in_progress', 'resolved', 'dismissed');
create type public.event_scope         as enum ('general', 'clan', 'agape');
create type public.enrollment_status   as enum ('in_progress', 'completed', 'dropped');
create type public.follow_up_type      as enum ('note', 'call', 'message', 'visit');
create type public.registration_status as enum ('registered', 'confirmed', 'cancelled', 'attended');
create type public.payment_method      as enum ('cash', 'transfer', 'yape', 'plin', 'card', 'other');
create type public.payment_status      as enum ('valid', 'voided');
create type public.import_status       as enum ('pending', 'imported', 'error');

-- Fecha "de hoy" en Lima: todas las reglas por días usan esta función.
create or replace function public.today_lima()
returns date language sql stable set search_path = public as $$
  select (now() at time zone 'America/Lima')::date;
$$;
