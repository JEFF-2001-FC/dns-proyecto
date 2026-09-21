import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";

const quote = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
export async function GET() {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") return new NextResponse("No autorizado", { status: 403 });
  const supabase = await createClient();
  const [adolescents, meetings, events, followups] = await Promise.all([
    supabase.from("v_adolescents").select("full_name, status, agape_name, clan_name").order("full_name"),
    supabase.from("v_meeting_summary").select("meeting_date, agape_name, meeting_type, topic, recorded, present, late, absent").order("meeting_date", { ascending: false }),
    supabase.from("events").select("title, starts_at, scope, approval_status, location").order("starts_at"),
    supabase.from("connection_followups").select("adolescent_id, status, occurred_on, availability, notes, next_contact_on").order("occurred_on", { ascending: false }),
  ]);
  const rows = [
    ["REPORTE DNS", ""],
    ["Adolescentes", ""],
    ["Nombre", "Estado", "Ágape", "Clan"],
    ...(adolescents.data ?? []).map((row) => [row.full_name, row.status, row.agape_name, row.clan_name]),
    [], ["Reuniones", ""], ["Fecha", "Ágape", "Tipo", "Tema", "Registrados", "Presentes", "Tardanzas", "Faltas"],
    ...(meetings.data ?? []).map((row) => [row.meeting_date, row.agape_name, row.meeting_type, row.topic, row.recorded, row.present, row.late, row.absent]),
    [], ["Eventos", ""], ["Título", "Inicio", "Alcance", "Estado", "Lugar"],
    ...(events.data ?? []).map((row) => [row.title, row.starts_at, row.scope, row.approval_status, row.location]),
    [], ["Conexión", ""], ["Adolescente ID", "Estado", "Fecha", "Disponibilidad", "Notas", "Próximo contacto"],
    ...(followups.data ?? []).map((row) => [row.adolescent_id, row.status, row.occurred_on, row.availability, row.notes, row.next_contact_on]),
  ];
  const csv = "\uFEFF" + rows.map((row) => row.map(quote).join(",")).join("\n");
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=reporte-dns.csv" } });
}
