import { UserRoundCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ClanBadge } from "@/components/ui/clan-badge";
import { initials } from "@/components/layout/nav-config";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { LeaderManager } from "@/features/leaders/components/leader-manager";
import { ConnectionAccessToggle } from "@/features/leaders/components/connection-access-toggle";
import { LeaderAccountToggle } from "@/features/leaders/components/leader-account-toggle";

export const metadata = { title: "Líderes · DNS" };

const AGAPE_ROLE: Record<string, string> = { lead: "Líder", assistant: "Co-líder" };

export default async function LideresPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: leaders } = await supabase
    .from("leaders")
    .select(
      "id, first_name, last_name, phone, email, status, profile_id, connection_enabled, leader_agape_assignments(agape_id, role, ended_on, agapes(name)), leader_clan_memberships(clan_id, ended_on, clans(name, slug, color, color_soft, color_ink))",
    )
    .order("last_name");

  const { data: agapes } = await supabase.from("agapes").select("id, name").eq("active", true).order("name");
  const { data: clans } = await supabase.from("clans").select("id, name").eq("active", true).order("sort_order");

  const list = leaders ?? [];
  const profileIds = list.flatMap((leader) => leader.profile_id ? [leader.profile_id] : []);
  const { data: profiles } = profileIds.length ? await supabase.from("profiles").select("id, active").in("id", profileIds) : { data: [] as { id: string; active: boolean }[] };
  const { data: activity } = profileIds.length ? await supabase.from("audit_log").select("actor_id, created_at").in("actor_id", profileIds).order("created_at", { ascending: false }).limit(500) : { data: [] as { actor_id: string | null; created_at: string }[] };
  const accountActive = new Map((profiles ?? []).map((profile) => [profile.id, profile.active]));
  const lastActivity = new Map<string, string>();
  for (const row of activity ?? []) if (row.actor_id && !lastActivity.has(row.actor_id)) lastActivity.set(row.actor_id, row.created_at);
  const sinCorreo = list.filter((l) => !l.email?.trim()).length;
  const sinCuenta = list.filter((l) => l.email?.trim() && !l.profile_id).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administración"
        title="Líderes"
        description="Quién dirige cada ágape, a qué clan pertenece y si ya tiene cuenta para entrar. Cada líder mantiene sus propios datos desde Mi perfil; tú puedes revisarlos y corregirlos."
        action={<LeaderManager agapes={agapes ?? []} clans={clans ?? []} />}
      />

      {(sinCorreo > 0 || sinCuenta > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {sinCuenta > 0 && (
            <div className="rounded-3xl border border-line bg-white p-4">
              <p className="font-display text-[34px] font-bold leading-tight text-flame-dark">{sinCuenta}</p>
              <p className="text-sm text-muted">
                {sinCuenta === 1 ? "líder tiene correo pero aún no tiene cuenta" : "líderes tienen correo pero aún no tienen cuenta"}.
                Créala en Supabase → Authentication → Add user con ese mismo correo: se vincula sola con su ficha.
              </p>
            </div>
          )}
          {sinCorreo > 0 && (
            <div className="rounded-3xl border border-line bg-white p-4">
              <p className="font-display text-[34px] font-bold leading-tight text-ink">{sinCorreo}</p>
              <p className="text-sm text-muted">
                {sinCorreo === 1 ? "líder sin correo registrado" : "líderes sin correo registrado"}.
                Sin correo no se le puede crear cuenta de acceso.
              </p>
            </div>
          )}
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState
          icon={UserRoundCheck}
          title="Todavía no hay líderes registrados"
          description="Los líderes se cargan desde la hoja LIDERES de la plantilla, o se crean uno a uno en Supabase."
          bullets={[
            "Cada líder necesita un correo para recibir su cuenta de acceso",
            "Un ágape puede tener un líder y varios co-líderes, todos con el mismo acceso",
            "El clan del líder es independiente del ágape que dirige",
          ]}
        />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white">
          {list.map((l) => {
            const name = `${l.first_name} ${l.last_name}`.trim();
            const agapes = (l.leader_agape_assignments ?? []).filter((a) => a.ended_on === null);
            const clanRow = (l.leader_clan_memberships ?? []).find((c) => c.ended_on === null);
            const clan = clanRow?.clans;

            return (
              <li key={l.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-paper text-sm font-bold text-ink">
                    {initials(name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{name}</p>
                    <p className="truncate text-sm text-muted">
                      {l.email || l.phone || "Sin contacto registrado"}
                    </p>
                    <p className="mt-0.5 text-xs text-subtle">{l.profile_id && lastActivity.get(l.profile_id) ? `Última actividad: ${new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(lastActivity.get(l.profile_id)!))}` : "Aún no registra actividad"}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {agapes.length === 0 ? (
                    <span className="rounded-lg bg-[#FDF1D8] px-2 py-0.5 text-xs font-bold text-[#7A4B00]">
                      Sin ágape
                    </span>
                  ) : (
                    agapes.map((a) => (
                      <span
                        key={a.agape_id}
                        className="rounded-lg bg-paper px-2 py-0.5 text-xs font-bold text-muted"
                      >
                        {a.agapes?.name ?? "Ágape"} · {AGAPE_ROLE[a.role] ?? a.role}
                      </span>
                    ))
                  )}
                  {clan && (
                    <ClanBadge
                      clan={{
                        name: clan.name,
                        slug: clan.slug,
                        color: clan.color,
                        colorSoft: clan.color_soft,
                        colorInk: clan.color_ink,
                      }}
                    />
                  )}
                  {!l.profile_id && (
                    <span className="rounded-lg bg-[#FDE8E4] px-2 py-0.5 text-xs font-bold text-[#9A2A10]">
                      Sin cuenta
                    </span>
                  )}
                  {l.profile_id && (
                    <><LeaderAccountToggle leaderId={l.id} enabled={accountActive.get(l.profile_id) ?? false} /><ConnectionAccessToggle leaderId={l.id} enabled={l.connection_enabled} /></>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
