import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { renameMyAgape, updateMyProfile } from "@/features/profile/actions";

export const metadata = { title: "Mi perfil · DNS" };

export default async function PerfilPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: leader } = await supabase.from("leaders").select("first_name, last_name, phone, email, leader_agape_assignments(agape_id, ended_on, agapes(name))").eq("profile_id", user.id).maybeSingle();
  const agapes = (leader?.leader_agape_assignments ?? []).filter((item) => item.ended_on === null);
  const isLeader = user.role === "leader";
  return <div className="space-y-6"><PageHeader eyebrow="DNS" title="Mi perfil" description="Actualiza tus datos personales y, si eres líder, el nombre de los ágapes que acompañas." />
    <section className="rounded-3xl border border-line bg-white p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-display text-2xl font-bold">Datos personales</h2><p className="text-sm text-muted">{isLeader ? "Líder" : "Administrador"} · {user.email ?? leader?.email ?? "Sin correo"}</p></div><span className="rounded-full bg-[#E3F4E6] px-3 py-1 text-xs font-bold text-[#1E6B32]">Cuenta activa</span></div><form action={updateMyProfile} className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Nombres<input name="first_name" required defaultValue={leader?.first_name ?? user.full_name.split(" ")[0] ?? ""} className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 font-normal" /></label><label className="text-sm font-semibold">Apellidos<input name="last_name" required defaultValue={leader?.last_name ?? user.full_name.split(" ").slice(1).join(" ")} className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 font-normal" /></label><label className="text-sm font-semibold sm:col-span-2">Celular<input name="phone" defaultValue={leader?.phone ?? ""} placeholder="Ej. 999 999 999" className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 font-normal" /></label><div className="sm:col-span-2"><button className="rounded-2xl bg-ink px-4 py-2.5 text-sm font-semibold text-white">Guardar mis datos</button></div></form></section>
    {isLeader && <section className="rounded-3xl border border-line bg-white p-5 sm:p-6"><h2 className="font-display text-2xl font-bold">Mis ágapes</h2><p className="mt-1 text-sm text-muted">El nombre se comparte con los co-líderes y los adolescentes asignados.</p>{agapes.length === 0 ? <p className="mt-4 text-sm text-muted">Aún no tienes un ágape asignado.</p> : <div className="mt-4 space-y-3">{agapes.map((item) => <form key={item.agape_id} action={renameMyAgape.bind(null, item.agape_id)} className="flex flex-col gap-2 rounded-2xl bg-paper p-3 sm:flex-row sm:items-center"><input name="name" required defaultValue={item.agapes?.name ?? ""} className="min-w-0 flex-1 rounded-xl border border-line bg-white px-3 py-2 text-sm" /><button className="rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold">Guardar nombre</button></form>)}</div>}</section>}
  </div>;
}
