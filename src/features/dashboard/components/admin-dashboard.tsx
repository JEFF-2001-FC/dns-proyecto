import Link from "next/link";
import { AlertRow } from "./alert-row";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ClanDot } from "@/components/ui/clan-dot";
import { fmtDateTime } from "@/lib/format";
import type { getAdminDashboard } from "../queries";
import { EventDate } from "./event-date";

type Data = Awaited<ReturnType<typeof getAdminDashboard>>;

export function AdminDashboard({
  data,
  greeting,
  firstName,
}: {
  data: Data;
  greeting: string;
  firstName: string;
}) {
  const { totals } = data;
  const title = firstName ? greeting + ", " + firstName : greeting;

  return (
    <div className="space-y-5 lg:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[40px] font-extrabold leading-none sm:text-5xl">
            {title}
          </h1>
          <p className="mt-2 text-[15px] text-muted">
            Así va el ministerio esta semana.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/eventos"
            className={buttonVariants({ variant: "secondary" })}
          >
            Nuevo evento
          </Link>
          <Link
            href="/adolescentes?estado=pendiente"
            className={buttonVariants({ variant: "primary" })}
          >
            Aprobar pendientes
            {totals.pending > 0 && <Badge tone="flame">{totals.pending}</Badge>}
          </Link>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        <StatCard
          title="Adolescentes activos"
          value={totals.adolescents}
          hint={
            totals.newThisMonth > 0 ? (
              <span className="text-[#2F6B3A]">
                {"+" + totals.newThisMonth + " este mes"}
              </span>
            ) : (
              "Sin altas este mes"
            )
          }
        />
        <StatCard
          title="Asistencia última semana"
          value={
            data.lastWeek.percent !== null ? data.lastWeek.percent + "%" : "—"
          }
          hint={
            data.lastWeek.counted > 0
              ? data.lastWeek.attended +
                " de " +
                data.lastWeek.counted +
                " registros"
              : "Sin reuniones registradas"
          }
        >
          <div aria-hidden className="mb-2 hidden h-10 items-end gap-1 sm:flex">
            {data.weeklyPercents.map((p, i) => (
              <div
                key={i}
                className={
                  i === data.weeklyPercents.length - 1
                    ? "w-2 rounded bg-ink"
                    : "w-2 rounded bg-line-strong"
                }
                style={{ height: Math.max(12, p ?? 0) + "%" }}
              />
            ))}
          </div>
        </StatCard>
        <StatCard
          title="Pendientes de aprobación"
          value={totals.pending}
          hint={
            <Link
              href="/adolescentes?estado=pendiente"
              className="text-ink underline underline-offset-4"
            >
              Revisar registros
            </Link>
          }
        />
        <StatCard
          title="Alertas activas"
          value={totals.alerts}
          tone="dark"
          hint={
            totals.criticalAlerts > 0
              ? totals.criticalAlerts + " críticas por atender"
              : "Ninguna crítica"
          }
        />
      </section>

      <section className="grid gap-3 lg:grid-cols-3 lg:gap-4">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Asistencia por clan"
            action={
              <span className="text-sm text-muted">Últimas 4 semanas</span>
            }
          />
          <div className="mt-5 flex flex-col gap-4">
            {data.clans.map((clan) => (
              <div key={clan.id} className="flex items-center gap-3.5">
                <div className="flex w-24 items-center gap-2 text-sm font-semibold">
                  <ClanDot color={clan.color} />
                  {clan.name}
                </div>
                <div className="h-3 flex-1 rounded-full bg-[#EFECE6]">
                  <div
                    className="h-3 rounded-full"
                    style={{
                      width: (clan.percent ?? 0) + "%",
                      backgroundColor: clan.color,
                    }}
                  />
                </div>
                <div className="w-11 text-right text-sm font-bold">
                  {clan.percent !== null ? clan.percent + "%" : "—"}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="flex flex-col">
          <CardHeader
            title="Requieren seguimiento"
            action={
              <Link
                href="/alertas"
                className="text-sm font-semibold hover:text-flame-dark"
              >
                Ver todas
              </Link>
            }
          />
          <div className="mt-4 flex flex-col gap-3">
            {data.alerts.length === 0 && (
              <p className="text-sm text-muted">No hay alertas activas.</p>
            )}
            {data.alerts.map((alerta) => (
              <AlertRow key={alerta.id} alerta={alerta} />
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-3 lg:grid-cols-3 lg:gap-4">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Próximos eventos"
            action={
              <Link
                href="/eventos"
                className="text-sm font-semibold hover:text-flame-dark"
              >
                Ver eventos
              </Link>
            }
          />
          {data.events.length === 0 && (
            <p className="mt-3 text-sm text-muted">
              Aún no hay eventos programados.
            </p>
          )}
          {data.events.length > 0 && (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {data.events.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-3 rounded-2xl border border-[#EFECE6] p-3"
                >
                  <EventDate iso={e.starts_at} color={e.color} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{e.title}</p>
                    <p className="truncate text-xs text-muted">
                      {e.location ?? fmtDateTime.format(new Date(e.starts_at))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Control de líderes"
            action={
              <Link
                href="/lideres"
                className="text-sm font-semibold hover:text-flame-dark"
              >
                Gestionar
              </Link>
            }
          />
          <div className="mt-3 flex gap-6">
            <div>
              <p className="font-display text-[32px] font-bold leading-none">
                {totals.leaders}
              </p>
              <p className="text-xs text-muted">activos</p>
            </div>
            <div>
              <p
                className={
                  totals.unassignedLeaders > 0
                    ? "font-display text-[32px] font-bold leading-none text-[#9A2A10]"
                    : "font-display text-[32px] font-bold leading-none"
                }
              >
                {totals.unassignedLeaders}
              </p>
              <p className="text-xs text-muted">sin ágape</p>
            </div>
          </div>
          {data.unassignedLeaders.length > 0 && (
            <p className="mt-3 rounded-2xl bg-[#FDF1D8] px-3 py-2.5 text-sm text-[#6B4200]">
              {"Asigna ágape a " +
                data.unassignedLeaders.join(", ") +
                (totals.unassignedLeaders > data.unassignedLeaders.length
                  ? " y otros."
                  : ".")}
            </p>
          )}
          {data.unassignedLeaders.length === 0 && (
            <p className="mt-3 text-sm text-muted">
              Todos los líderes tienen ágape.
            </p>
          )}
        </Card>
      </section>
    </div>
  );
}
