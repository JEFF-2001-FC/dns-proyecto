import * as XLSX from "xlsx";
import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";

const text = (value: string | number | boolean | null | undefined) => value ?? "";

function addSheet(book: XLSX.WorkBook, name: string, rows: Record<string, unknown>[], widths: number[]) {
  const sheet = XLSX.utils.json_to_sheet(rows);
  sheet["!cols"] = widths.map((width) => ({ wch: width }));
  XLSX.utils.book_append_sheet(book, sheet, name);
}

export async function GET(request: Request) {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") return new NextResponse("No autorizado", { status: 403 });

  const params = new URL(request.url).searchParams; const agapeId = params.get("agape") ?? ""; const from = params.get("from") ?? ""; const to = params.get("to") ?? "";
  const supabase = await createClient();
  let adolescentQuery = supabase.from("v_adolescents").select("id, full_name, status, age, birth_date, phone, guardian_name, guardian_phone, school_name, agape_name, clan_name, created_at").order("full_name");
  let meetingQuery = supabase.from("meetings").select("id, agape_id, meeting_type_id, meeting_date, topic, description, created_at").order("meeting_date", { ascending: false });
  let eventQuery = supabase.from("events").select("title, starts_at, ends_at, scope, approval_status, location, description, created_at, agape_id").order("starts_at", { ascending: false });
  let followupQuery = supabase.from("connection_followups").select("adolescent_id, status, occurred_on, availability, notes, next_contact_on, suggested_agape_id, created_at").order("occurred_on", { ascending: false });
  if (agapeId) { adolescentQuery = adolescentQuery.eq("agape_id", agapeId); meetingQuery = meetingQuery.eq("agape_id", agapeId); eventQuery = eventQuery.or(`scope.eq.general,agape_id.eq.${agapeId}`); }
  if (from) { meetingQuery = meetingQuery.gte("meeting_date", from); eventQuery = eventQuery.gte("starts_at", `${from}T00:00:00Z`); followupQuery = followupQuery.gte("occurred_on", from); }
  if (to) { meetingQuery = meetingQuery.lte("meeting_date", to); eventQuery = eventQuery.lte("starts_at", `${to}T23:59:59Z`); followupQuery = followupQuery.lte("occurred_on", to); }
  const [adolescents, meetings, attendance, eventRows, followups, agapes, meetingTypes] = await Promise.all([
    adolescentQuery, meetingQuery,
    supabase.from("attendance").select("adolescent_id, meeting_id, status, notes, recorded_at").order("recorded_at", { ascending: false }),
    eventQuery, followupQuery,
    supabase.from("agapes").select("id, name"),
    supabase.from("meeting_types").select("id, name"),
  ]);
  const adolescentById = new Map((adolescents.data ?? []).map((row) => [row.id, row.full_name]));
  const meetingById = new Map((meetings.data ?? []).map((row) => [row.id, row]));
  const agapeById = new Map((agapes.data ?? []).map((row) => [row.id, row.name]));
  const typeById = new Map((meetingTypes.data ?? []).map((row) => [row.id, row.name]));

  const book = XLSX.utils.book_new();
  addSheet(book, "Adolescentes", (adolescents.data ?? []).map((row) => ({
    Nombre: text(row.full_name), Estado: text(row.status), Edad: text(row.age), "Fecha de nacimiento": text(row.birth_date),
    "Ágape": text(row.agape_name), Clan: text(row.clan_name), Celular: text(row.phone), Apoderado: text(row.guardian_name),
    "Teléfono apoderado": text(row.guardian_phone), "Centro de estudios": text(row.school_name), "Registrado el": text(row.created_at),
  })), [28, 14, 10, 18, 22, 18, 16, 28, 20, 28, 24]);
  addSheet(book, "Asistencia", (attendance.data ?? []).map((row) => {
    const meeting = meetingById.get(row.meeting_id);
    return { Adolescente: text(adolescentById.get(row.adolescent_id)), Fecha: text(meeting?.meeting_date), "Ágape": text(agapeById.get(meeting?.agape_id ?? "")), Tema: text(meeting?.topic), Estado: text(row.status), Observaciones: text(row.notes), "Registrado el": text(row.recorded_at) };
  }), [28, 16, 22, 32, 14, 44, 24]);
  addSheet(book, "Reuniones", (meetings.data ?? []).map((row) => ({
    Fecha: text(row.meeting_date), "Ágape": text(agapeById.get(row.agape_id)), Tipo: text(typeById.get(row.meeting_type_id)),
    Tema: text(row.topic), Descripción: text(row.description), "Creada el": text(row.created_at),
  })), [16, 22, 22, 32, 50, 24]);
  addSheet(book, "Eventos", (eventRows.data ?? []).map((row) => ({
    Título: text(row.title), Inicio: text(row.starts_at), Fin: text(row.ends_at), Alcance: text(row.scope), Estado: text(row.approval_status),
    Lugar: text(row.location), Descripción: text(row.description), "Creado el": text(row.created_at),
  })), [32, 24, 24, 14, 14, 28, 52, 24]);
  addSheet(book, "Conexión", (followups.data ?? []).map((row) => ({
    Adolescente: text(adolescentById.get(row.adolescent_id)), Estado: text(row.status), Fecha: text(row.occurred_on),
    Disponibilidad: text(row.availability), "Ágape sugerido": text(agapeById.get(row.suggested_agape_id ?? "")),
    Notas: text(row.notes), "Próximo contacto": text(row.next_contact_on), "Registrado el": text(row.created_at),
  })), [28, 16, 16, 28, 24, 60, 20, 24]);

  return new NextResponse(XLSX.write(book, { type: "buffer", bookType: "xlsx" }), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=reporte-maestro-dns.xlsx",
    },
  });
}
