import Link from "next/link";
import { Download, HeartHandshake } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { addDays, todayLima } from "@/lib/dates";

export const metadata = { title: "Reportes · DNS" };

export default async function ReportesPage() {
  await requireRole("admin");
  const supabase = await createClient();
  const since = addDays(todayLima(), -30);
  const [active, pending, meetings, attendance, connection, events, recentConnection] = await Promise.all([
    supabase.from("adolescents").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("adolescents").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("meetings").select("id", { count: "exact", head: true }).gte("meeting_date", since),
    supabase.from("attendance").select("id", { count: "exact", head: true }).gte("recorded_at", `${since}T00:00:00Z`),
    supabase.from("connection_followups").select("id, status", { count: "exact" }),
    supabase.from("events").select("id, approval_status", { count: "exact" }),
    supabase.from("connection_followups").select("id, adolescent_id, status, occurred_on, next_contact_on, notes").order("occurred_on", { ascending: false }).limit(8),
  ]);
  const connectionRows = connection.data ?? [];
  const eventRows = events.data ?? [];
  const statusCount = (status: string) => connectionRows.filter((row) => row.status === status).length;
  const eventCount = (status: string) => eventRows.filter((row) => row.approval_status === status).length;
  const ids = [...new Set((recentConnection.data ?? []).map((row) => row.adolescent_id))];
  const { data: names } = ids.length ? await supabase.from("v_adolescents").select("id, full_name").in("id", ids) : { data: [] as { id: string | null; full_name: string | null }[] };
  const namesById = new Map((names ?? []).map((item) => [item.id, item.full_name]));
  return <div className="space-y-6"><PageHeader eyebrow="Administración" title="Reportes" description="Vista general del ministerio y de la trazabilidad de Conexión." action={<div className="flex gap-2"><Link href="/api/reportes/maestro.xlsx" className="inline-flex items-center gap-2 rounded-2xl bg-ink px-4 py-2.5 text-sm font-semibold text-white"><Download className="h-4 w-4" />Reporte maestro Excel</Link><Link href="/api/reportes/resumen" className="inline-flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-2.5 text-sm font-semibold"><Download className="h-4 w-4" />CSV</Link></div>} /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Adolescentes activos" value={active.count ?? 0} /><Metric label="Pendientes de aprobar" value={pending.count ?? 0} /><Metric label="Reuniones · 30 días" value={meetings.count ?? 0} /><Metric label="Asistencias · 30 días" value={attendance.count ?? 0} /></div><div className="grid gap-4 lg:grid-cols-2"><section className="rounded-3xl border border-line bg-white p-5"><h2 className="flex items-center gap-2 font-display text-xl font-bold"><HeartHandshake className="h-5 w-5" />Conexión</h2><div className="mt-4 grid grid-cols-2 gap-3"><Metric label="Registros" value={connection.count ?? 0} /><Metric label="Contactados" value={statusCount("contacted")} /><Metric label="Ágape sugerido" value={statusCount("referred")} /><Metric label="Cerrados" value={statusCount("closed")} /></div></section><section className="rounded-3xl border border-line bg-white p-5"><h2 className="font-display text-xl font-bold">Eventos</h2><div className="mt-4 grid grid-cols-3 gap-3"><Metric label="Publicados" value={eventCount("published")} /><Metric label="Pendientes" value={eventCount("pending")} /><Metric label="Rechazados" value={eventCount("rejected")} /></div></section></div><section className="overflow-hidden rounded-3xl border border-line bg-white"><div className="border-b border-line px-5 py-4"><h2 className="font-display text-xl font-bold">Últimos seguimientos de Conexión</h2></div>{(recentConnection.data ?? []).length === 0 ? <p className="p-5 text-sm text-muted">Aún no se registran seguimientos.</p> : <ul className="divide-y divide-line">{(recentConnection.data ?? []).map((item) => <li key={item.id} className="p-4"><p className="font-bold">{namesById.get(item.adolescent_id) ?? "Adolescente"} <span className="font-normal text-muted">· {item.status}</span></p><p className="mt-1 text-sm text-muted">{item.notes}</p><p className="mt-1 text-xs text-subtle">{item.occurred_on}{item.next_contact_on ? ` · Próximo: ${item.next_contact_on}` : ""}</p></li>)}</ul>}</section></div>;
}
function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl bg-paper p-3"><p className="font-display text-3xl font-bold">{value}</p><p className="mt-1 text-sm text-muted">{label}</p></div>; }
