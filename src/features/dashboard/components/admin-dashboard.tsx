import Link from "next/link";
import {
  AlertCircle,
  Clock,
  Home,
  UserRoundCheck,
  UserRoundX,
  Users,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { fmtDateTime } from "@/lib/format";
import type { getAdminDashboard } from "../queries";

type Data = Awaited<ReturnType<typeof getAdminDashboard>>;

const SEVERITY: Record<string, { label: string; className: string }> = {
  critical: { label: "Crítica", className: "bg-red-50 text-red-700" },
  warning: { label: "Atención", className: "bg-amber-50 text-amber-700" },
  info: { label: "Aviso", className: "bg-sky-50 text-sky-700" },
};

export function AdminDashboard({ data }: { data: Data }) {
  const { totals } = data;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-zinc-500">Panel del ministerio</p>
        <h1 className="text-3xl font-semibold tracking-tight">Inicio</h1>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Adolescentes activos"
          value={totals.adolescents}
          icon={Users}
        />
        <StatCard
          title="Pendientes de aprobación"
          value={totals.pending}
          icon={Clock}
        />
        <StatCard title="Ágapes activos" value={totals.agapes} icon={Home} />
        <StatCard
          title="Líderes activos"
          value={totals.leaders}
          icon={UserRoundCheck}
        />
        <StatCard
          title="Líderes sin ágape"
          value={totals.unassignedLeaders}
          icon={UserRoundX}
        />
        <StatCard
          title="Alertas activas"
          value={totals.alerts}
          icon={AlertCircle}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Alertas activas</h2>
            <Link
              href="/alertas"
              className="text-sm text-zinc-600 underline-offset-4 hover:underline"
            >
              Ver todas
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {data.alerts.length ? (
              data.alerts.map((a) => {
                const sev = SEVERITY[a.severity] ?? SEVERITY.info;
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{a.name}</p>
                      <p className="truncate text-xs text-zinc-500">
                        {a.message}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${sev.className}`}
                    >
                      {sev.label}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-zinc-500">No hay alertas activas.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Control de líderes</h2>
              <Link
                href="/lideres"
                className="text-sm text-zinc-600 underline-offset-4 hover:underline"
              >
                Gestionar
              </Link>
            </div>
            {data.unassignedLeaders.length ? (
              <>
                <p className="mt-1 text-sm text-zinc-500">
                  Activos sin ágape asignado:
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {data.unassignedLeaders.map((l) => (
                    <li
                      key={l.id}
                      className="rounded-lg bg-amber-50 px-3 py-2 text-amber-900"
                    >
                      {l.name}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-2 text-sm text-zinc-500">
                Todos los líderes activos tienen un ágape asignado.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="font-semibold">Próximos eventos</h2>
            <div className="mt-4 space-y-3">
              {data.events.length ? (
                data.events.map((e) => (
                  <div
                    key={e.id}
                    className="rounded-xl border border-zinc-100 p-3"
                  >
                    <p className="font-medium">{e.title}</p>
                    <p className="text-xs text-zinc-500">
                      {fmtDateTime.format(new Date(e.starts_at))}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500">Aún no hay eventos.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
