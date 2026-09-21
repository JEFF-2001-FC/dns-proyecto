import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { EventForm } from "@/features/events/components/event-form";
import { EventResourceForm } from "@/features/events/components/event-resource-form";
export const metadata = { title: "Eventos · DNS" };
const LABEL: Record<string, string> = { pending: "Pendiente de aprobación", published: "Publicado", rejected: "Rechazado" };
export default async function EventosPage() {
  const user = await requireUser(); const supabase = await createClient();
  const [eventsResult, agapesResult, clansResult] = await Promise.all([
    supabase.from("events").select("id, title, description, starts_at, ends_at, location, scope, approval_status, created_by, agape:agapes(name), clan:clans(name)").order("starts_at", { ascending: true }).limit(100),
    user.role === "admin" ? supabase.from("agapes").select("id, name").eq("active", true) : supabase.from("v_my_context").select("agape_id, agape_name").not("agape_id", "is", null),
    user.role === "admin" ? supabase.from("clans").select("id, name").eq("active", true) : supabase.from("v_my_context").select("clan_id, clan_name").not("clan_id", "is", null),
  ]);
  const targets = [
    ...(user.role === "admin" ? (agapesResult.data ?? []).map((item) => ({ ...item, kind: "agape" as const })) : (agapesResult.data ?? []).flatMap((item) => "agape_id" in item && item.agape_id && item.agape_name ? [{ id: item.agape_id, name: item.agape_name, kind: "agape" as const }] : [])),
    ...(user.role === "admin" ? (clansResult.data ?? []).map((item) => ({ ...item, kind: "clan" as const })) : (clansResult.data ?? []).flatMap((item) => "clan_id" in item && item.clan_id && item.clan_name ? [{ id: item.clan_id, name: item.clan_name, kind: "clan" as const }] : [])),
  ];
  const typedTargets = targets as unknown as { id: string; name: string; kind: "agape" | "clan" }[];
  const events = eventsResult.data ?? [];
  return <div className="space-y-6"><PageHeader eyebrow="Calendario" title="Eventos" description={user.role === "admin" ? "Publica eventos generales y revisa propuestas de líderes." : "Propón eventos para tu ágape o clan; administración los publicará."} action={user.role === "admin" ? <Link href="/admin/eventos-pendientes" className="rounded-2xl border border-line bg-white px-4 py-2.5 text-sm font-semibold">Propuestas pendientes</Link> : undefined} /><EventForm targets={typedTargets} isAdmin={user.role === "admin"} /><section className="overflow-hidden rounded-3xl border border-line bg-white">{events.length === 0 ? <p className="p-6 text-sm text-muted">No hay eventos por mostrar.</p> : <ul className="divide-y divide-line">{events.map((event) => <li key={event.id} className="p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-bold">{event.title}</p><span className="rounded-full bg-paper px-2 py-1 text-xs font-bold text-muted">{LABEL[event.approval_status]}</span></div><p className="mt-1 text-sm text-muted">{new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.starts_at))} · {event.location ?? "Sin lugar"} · {event.scope === "general" ? "General" : event.agape?.name ?? event.clan?.name}</p>{event.description && <p className="mt-2 text-sm text-muted">{event.description}</p>}{(user.role === "admin" || event.created_by === user.id) && <EventResourceForm eventId={event.id} />}</li>)}</ul>}</section></div>;
}
