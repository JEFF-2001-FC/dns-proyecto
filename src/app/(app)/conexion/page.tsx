import { HeartHandshake } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { requireConnectionAccess } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { todayLima } from "@/lib/dates";
import { ConnectionFollowupForm } from "@/features/connection/components/connection-followup-form";

export const metadata = { title: "Conexión · DNS" };

const STATUS_LABEL: Record<string, string> = {
  new: "Pendiente",
  contacted: "Contactado",
  scheduled: "Programado",
  referred: "Ágape sugerido",
  closed: "Cerrado",
};

export default async function ConexionPage() {
  await requireConnectionAccess();
  const supabase = await createClient();
  const [adolescentsResult, agapesResult, followupsResult] = await Promise.all([
    supabase.from("v_adolescents").select("id, full_name, status, phone, guardian_phone").in("status", ["pending", "active"]).order("created_at", { ascending: false }).limit(150),
    supabase.from("agapes").select("id, name").eq("active", true).order("name"),
    supabase.from("connection_followups").select("id, adolescent_id, status, occurred_on, availability, suggested_agape_id, notes, next_contact_on, created_at").order("occurred_on", { ascending: false }).order("created_at", { ascending: false }).limit(80),
  ]);

  const adolescents = (adolescentsResult.data ?? []).flatMap((row) => row.id && row.full_name ? [{
    id: row.id,
    fullName: row.full_name,
    status: row.status,
    phone: row.phone,
    guardianPhone: row.guardian_phone,
  }] : []);
  const agapes = agapesResult.data ?? [];
  const adolescentNames = new Map(adolescents.map((item) => [item.id, item.fullName]));
  const agapeNames = new Map(agapes.map((item) => [item.id, item.name]));
  const followups = followupsResult.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Área especial"
        title="Conexión"
        description="Acompaña a adolescentes nuevos: registra cada contacto, su disponibilidad y el ágape que mejor les puede recibir. El historial queda disponible para administración."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Adolescentes por contactar" value={adolescents.filter((item) => item.status === "pending").length} />
        <Metric label="Seguimientos registrados" value={followups.length} />
        <Metric label="Próximos contactos" value={followups.filter((item) => item.next_contact_on && item.next_contact_on >= todayLima()).length} />
      </div>

      {adolescents.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-white p-8 text-center">
          <HeartHandshake className="mx-auto h-8 w-8 text-muted" aria-hidden />
          <p className="mt-3 font-bold">Aún no hay adolescentes disponibles para seguimiento</p>
        </div>
      ) : <ConnectionFollowupForm adolescents={adolescents} agapes={agapes} today={todayLima()} />}

      <section className="rounded-3xl border border-line bg-white">
        <div className="border-b border-line px-4 py-4 sm:px-5"><h2 className="font-display text-2xl font-bold">Historial reciente</h2></div>
        {followups.length === 0 ? <p className="p-5 text-sm text-muted">Aún no se han registrado seguimientos.</p> : (
          <ul className="divide-y divide-line">
            {followups.map((item) => (
              <li key={item.id} className="p-4 sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold">{adolescentNames.get(item.adolescent_id) ?? "Adolescente"}</p>
                  <span className="rounded-full bg-paper px-2.5 py-1 text-xs font-bold text-muted">{STATUS_LABEL[item.status]}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{item.notes}</p>
                <p className="mt-2 text-xs text-subtle">
                  {item.occurred_on}{item.availability ? ` · ${item.availability}` : ""}{item.suggested_agape_id ? ` · Sugiere: ${agapeNames.get(item.suggested_agape_id) ?? "Ágape"}` : ""}{item.next_contact_on ? ` · Próximo contacto: ${item.next_contact_on}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-3xl border border-line bg-white p-4"><p className="font-display text-3xl font-bold">{value}</p><p className="mt-1 text-sm text-muted">{label}</p></div>;
}
