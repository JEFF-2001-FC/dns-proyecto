import { PageHeader } from "@/components/shared/page-header";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { ReviewActions } from "@/features/adolescents/components/review-actions";

export const metadata = { title: "Aprobaciones · DNS" };

export default async function AprobacionesPage() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data } = await supabase.from("v_adolescents").select("id, full_name, age, agape_name, clan_name, guardian_name, guardian_phone, created_at").eq("status", "pending").order("created_at");
  const items = (data ?? []).filter((item) => item.id && item.full_name);
  return <div className="space-y-6"><PageHeader eyebrow="Administración" title="Aprobaciones" description="Revisa los adolescentes registrados por líderes. Al aprobarlos, su asistencia provisional queda confirmada." /><section className="rounded-3xl border border-line bg-white">{items.length === 0 ? <p className="p-6 text-sm text-muted">No hay registros pendientes.</p> : <ul className="divide-y divide-line">{items.map((item) => <li key={item.id!} className="p-4"><p className="font-bold">{item.full_name}{item.age !== null && ` · ${item.age} años`}</p><p className="mt-1 text-sm text-muted">{item.agape_name ?? "Sin ágape"} · {item.clan_name ?? "Sin clan"}{item.guardian_phone ? ` · ${item.guardian_name ?? "Apoderado"}: ${item.guardian_phone}` : ""}</p><ReviewActions adolescentId={item.id!} /></li>)}</ul>}</section></div>;
}
