import { getDashboard } from "@/features/dashboard/queries";
import { StatCard } from "@/components/shared/stat-card";
import { AlertCircle, CalendarDays, Users, UserRoundCheck } from "lucide-react";
import { fmtDateTime } from "@/lib/format";

export default async function InicioPage() {
  const data = await getDashboard();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-zinc-500">Panel principal</p>
        <h1 className="text-3xl font-semibold tracking-tight">Inicio</h1>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Adolescentes" value={data.adolescents} icon={Users} />
        <StatCard title="Líderes" value={data.leaders} icon={UserRoundCheck} />
        <StatCard
          title="Próximos eventos"
          value={data.events}
          icon={CalendarDays}
        />
        <StatCard
          title="Alertas activas"
          value={data.alerts}
          icon={AlertCircle}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="font-semibold">Seguimiento</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Adolescentes que requieren atención.
          </p>
          <div className="mt-6 space-y-3">
            {data.alertPreview.length ? (
              data.alertPreview.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-100 p-4"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-zinc-500">{item.reason}</p>
                  </div>
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                    Atención
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">
                No hay alertas pendientes.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="font-semibold">Próximos eventos</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Coordinación general del ministerio.
          </p>
          <div className="mt-6 space-y-3">
            {data.eventPreview.length ? (
              data.eventPreview.map((event) => (
                <div
                  key={event.id}
                  className="rounded-xl border border-zinc-100 p-4"
                >
                  <p className="font-medium">{event.title}</p>
                  <p className="text-xs text-zinc-500">
                    {fmtDateTime.format(new Date(event.starts_at))}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">Aún no hay eventos.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
