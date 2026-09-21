import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { resolveAlert } from "@/features/alerts/actions";

export const metadata = { title: "Alertas · DNS" };
const tone: Record<string, string> = { low: "bg-[#FDF1D8] text-[#7A4B00]", medium: "bg-[#FDE8E4] text-[#9A2A10]", high: "bg-[#FDE8E4] text-[#9A2A10]", critical: "bg-ink text-white" };

export default async function AlertasPage() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data } = await supabase.from("alerts").select("id, adolescent_id, severity, status, message, consecutive_absences, created_at, adolescent:adolescents(first_name, last_name), agape:agapes!alerts_snapshot_agape_id_fkey(name)").in("status", ["open", "in_progress"]).order("created_at", { ascending: false });
  const alerts = data ?? [];
  return <div className="space-y-6"><PageHeader eyebrow="Administración" title="Alertas" description="Ausencias consecutivas que requieren acompañamiento. Se generan automáticamente al registrar asistencia." />
    <section className="overflow-hidden rounded-3xl border border-line bg-white">{alerts.length === 0 ? <div className="p-8 text-center"><CheckCircle2 className="mx-auto h-9 w-9 text-[#2E7D32]" /><p className="mt-3 font-bold">No hay alertas activas</p><p className="mt-1 text-sm text-muted">Todo está al día por ahora.</p></div> : <ul className="divide-y divide-line">{alerts.map((alert) => <li key={alert.id} className="p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="flex items-center gap-2 font-bold"><AlertTriangle className="h-4 w-4 text-[#C23A1A]" />{alert.adolescent ? `${alert.adolescent.first_name} ${alert.adolescent.last_name}` : "Adolescente"}</p><p className="mt-1 text-sm text-muted">{alert.message}</p><p className="mt-1 text-xs text-subtle">{alert.agape?.name ?? "Sin ágape"} · {new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(alert.created_at))}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tone[alert.severity] ?? "bg-paper"}`}>{alert.consecutive_absences ?? 0} faltas · {alert.severity}</span></div><details className="mt-3"><summary className="cursor-pointer text-sm font-semibold underline">Registrar atención y cerrar alerta</summary><form action={resolveAlert.bind(null, alert.id)} className="mt-2 flex flex-col gap-2 sm:flex-row"><input name="resolution_note" required placeholder="Ej. Se habló con el apoderado; volverá el sábado." className="min-w-0 flex-1 rounded-xl border border-line px-3 py-2 text-sm" /><button className="rounded-xl bg-ink px-3 py-2 text-sm font-semibold text-white">Cerrar alerta</button></form></details></li>)}</ul>}</section></div>;
}
