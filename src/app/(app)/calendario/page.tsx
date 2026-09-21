import { Cake, Download, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/lib/auth/require-user";
import { todayLima } from "@/lib/dates";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Calendario · DNS" };

export default async function CalendarioPage() {
  await requireUser();
  const supabase = await createClient();
  const month = todayLima().slice(5, 7);
  const [{ data }, { data: people }] = await Promise.all([
    supabase.from("events").select("id, title, starts_at, ends_at, location, description, scope, agape:agapes(name), clan:clans(name)").eq("approval_status", "published").order("starts_at").limit(100),
    supabase.from("v_adolescents").select("id, full_name, birth_date, agape_name").eq("status", "active").not("birth_date", "is", null),
  ]);
  const events = data ?? [];
  const { data: resourceRows } = events.length ? await supabase.from("event_resources").select("id, event_id, title, kind, external_url, body, storage_path").in("event_id", events.map((event) => event.id)).order("created_at") : { data: [] as never[] };
  const admin = createAdminClient();
  const resources = await Promise.all((resourceRows ?? []).map(async (resource) => ({ ...resource, url: resource.storage_path ? (await admin.storage.from("dns-event-resources").createSignedUrl(resource.storage_path, 900)).data?.signedUrl ?? null : null })));
  const resourcesByEvent = new Map<string, typeof resources>();
  for (const resource of resources) resourcesByEvent.set(resource.event_id, [...(resourcesByEvent.get(resource.event_id) ?? []), resource]);
  const birthdays = (people ?? []).filter((person) => person.birth_date?.slice(5, 7) === month).sort((a, b) => (a.birth_date ?? "").localeCompare(b.birth_date ?? ""));
  const formatDate = (value: string) => new Intl.DateTimeFormat("es-PE", { dateStyle: "full", timeStyle: "short" }).format(new Date(value));
  return <div className="space-y-6"><PageHeader eyebrow="Ministerio" title="Calendario" description="Eventos publicados y cumpleaños del mes." />
    <section className="rounded-3xl border border-[#F2D0A7] bg-[#FFF4E8] p-5"><div className="flex items-center gap-2"><Cake className="h-5 w-5 text-[#8A4B00]" /><h2 className="font-display text-xl font-bold">Cumpleaños de este mes</h2></div>{birthdays.length === 0 ? <p className="mt-3 text-sm text-muted">No hay cumpleaños registrados este mes.</p> : <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{birthdays.map((person) => <li key={person.id} className="rounded-2xl bg-white px-3 py-2 text-sm"><b>{person.full_name}</b><span className="text-muted"> · {person.birth_date?.slice(8, 10)} de este mes{person.agape_name ? ` · ${person.agape_name}` : ""}</span></li>)}</ul>}</section>
    <section className="rounded-3xl border border-line bg-white">{events.length === 0 ? <p className="p-6 text-sm text-muted">No hay eventos próximos.</p> : <ul className="divide-y divide-line">{events.map((event) => <li key={event.id}><details className="group p-4"><summary className="cursor-pointer list-none"><p className="font-bold">{event.title}</p><p className="mt-1 text-sm text-muted">{formatDate(event.starts_at)}{event.location ? ` · ${event.location}` : ""}</p><p className="mt-1 text-xs text-subtle">{event.scope === "general" ? "Todo el ministerio" : event.agape?.name ?? event.clan?.name} · <span className="group-open:hidden">Ver detalles</span><span className="hidden group-open:inline">Ocultar detalles</span></p></summary><div className="mt-4 rounded-2xl bg-paper p-3 text-sm text-muted"><p>{event.description || "No se agregó una descripción para este evento."}</p>{event.ends_at && <p className="mt-2">Finaliza: {formatDate(event.ends_at)}</p>}{(resourcesByEvent.get(event.id) ?? []).length > 0 && <div className="mt-4 border-t border-line pt-3"><p className="font-semibold text-ink">Material del evento</p><ul className="mt-2 space-y-2">{(resourcesByEvent.get(event.id) ?? []).map((resource) => <li key={resource.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-3 py-2"><span>{resource.title}{resource.kind === "note" && resource.body ? ` · ${resource.body}` : ""}</span>{resource.url && <a href={resource.url} className="inline-flex items-center gap-1 font-semibold text-ink underline"><Download className="h-4 w-4" />Descargar</a>}{resource.external_url && <a href={resource.external_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-ink underline"><ExternalLink className="h-4 w-4" />Abrir enlace</a>}</li>)}</ul></div>}</div></details></li>)}</ul>}</section></div>;
}
