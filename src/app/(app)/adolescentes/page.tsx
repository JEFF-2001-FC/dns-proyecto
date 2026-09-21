import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Adolescentes · DNS" };

const STATUS: Record<string, string> = { pending: "Pendiente", active: "Activo", inactive: "Inactivo", archived: "Archivado", rejected: "Rechazado" };

export default async function AdolescentesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await requireUser();
  const { q = "" } = await searchParams;
  const supabase = await createClient();
  let query = supabase.from("v_adolescents").select("id, full_name, age, status, agape_name, clan_name, guardian_name, guardian_phone, phone, school_name, birth_date, created_at").neq("status", "rejected").order("created_at", { ascending: false }).limit(100);
  const term = q.trim().replace(/[%(),]/g, " ");
  if (term) query = query.or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%`);
  const { data } = await query;
  const items = (data ?? []).filter((item) => item.id && item.full_name);
  const pending = items.filter((item) => item.status === "pending").length;

  return <div className="space-y-6">
    <PageHeader eyebrow="Ministerio" title="Adolescentes" description={user.role === "admin" ? "Registros de todos los ágapes y sus estados de aprobación." : "Los adolescentes de tus ágapes. Los nuevos registros se envían a aprobación."} action={<div className="flex gap-2">{user.role === "admin" && <Link href="/admin/aprobaciones" className="rounded-2xl border border-line bg-white px-4 py-2.5 text-sm font-semibold">Aprobaciones{pending ? ` (${pending})` : ""}</Link>}<Link href="/adolescentes/nuevo" className="rounded-2xl bg-ink px-4 py-2.5 text-sm font-semibold text-white">Registrar adolescente</Link></div>} />
    <form role="search" className="flex gap-2"><input name="q" defaultValue={q} placeholder="Buscar por nombre o apellido" className="w-full max-w-md rounded-xl border border-line px-3 py-2 text-sm" /><button className="rounded-xl border border-line px-3 py-2 text-sm font-semibold">Buscar</button></form>
    <section className="overflow-hidden rounded-3xl border border-line bg-white">{items.length === 0 ? <p className="p-6 text-sm text-muted">Aún no hay adolescentes para mostrar.</p> : <ul className="divide-y divide-line">{items.map((item) => <li key={item.id!}><details className="group p-4"><summary className="flex cursor-pointer list-none flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">{item.full_name}{item.age !== null && ` · ${item.age} años`}</p><p className="mt-0.5 text-sm text-muted">{item.agape_name ?? "Sin ágape"} · {item.clan_name ?? "Sin clan"} <span className="group-open:hidden">· Ver resumen</span></p></div><span className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ${item.status === "pending" ? "bg-[#FDF1D8] text-[#7A4B00]" : "bg-[#E3F4E6] text-[#1E6B32]"}`}>{STATUS[item.status ?? ""] ?? "Sin estado"}</span></summary><div className="mt-4 grid gap-3 rounded-2xl bg-paper p-4 text-sm sm:grid-cols-3"><div><p className="font-bold text-ink">Contacto</p><p className="mt-1 text-muted">{item.phone || "Sin celular"}</p><p className="text-muted">{item.guardian_name || "Sin apoderado"}{item.guardian_phone ? ` · ${item.guardian_phone}` : ""}</p></div><div><p className="font-bold text-ink">Datos básicos</p><p className="mt-1 text-muted">Nacimiento: {item.birth_date || "No registrado"}</p><p className="text-muted">{item.school_name || "Sin centro de estudios"}</p></div><div><p className="font-bold text-ink">Acompañamiento</p><p className="mt-1 text-muted">Ficha personal e historial de seguimiento.</p><Link href={`/adolescentes/${item.id}`} className="mt-3 inline-block font-semibold underline">Abrir ficha</Link></div></div></details></li>)}</ul>}</section>
  </div>;
}
