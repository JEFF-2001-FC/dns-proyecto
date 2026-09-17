import Link from "next/link";
import {
  CalendarRange,
  ClipboardCheck,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { fmtDate, fmtDateTime } from "@/lib/format";
import type { getLeaderDashboard } from "../queries";

type Data = Awaited<ReturnType<typeof getLeaderDashboard>>;

export function LeaderDashboard({ data }: { data: Data }) {
  const greeting = data.leaderName ? `Hola, ${data.leaderName}` : "Hola";

  if (data.agapes.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight">{greeting}</h1>
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="font-medium">Aún no tienes un ágape asignado</p>
          <p className="mt-1 text-sm text-zinc-500">
            Pide a un administrador que te asigne uno para empezar a tomar
            asistencia.
          </p>
        </div>
      </div>
    );
  }

  const firstAgape = data.agapes[0];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-zinc-500">{greeting}</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {data.agapes.map((a) => a.name).join(" y ")}
        </h1>
        {data.clan && (
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-zinc-600">
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: data.clan.color }}
            />
            Clan {data.clan.name}
          </p>
        )}
      </div>

      {/* Acción principal */}
      <Link
        href={`/asistencia?agape=${firstAgape.id}&fecha=${data.today}`}
        className="flex items-center justify-between gap-4 rounded-2xl bg-zinc-900 p-5 text-white transition-colors hover:bg-zinc-800"
      >
        <div>
          <p className="text-lg font-semibold">
            {data.todayRecorded
              ? "Revisar asistencia de hoy"
              : "Tomar asistencia"}
          </p>
          <p className="text-sm text-zinc-300">
            {data.todayRecorded
              ? "Ya hay una reunión registrada hoy. Puedes corregirla."
              : "Registra la reunión de hoy desde tu celular."}
          </p>
        </div>
        <ClipboardCheck className="h-8 w-8 shrink-0" aria-hidden />
      </Link>

      <section className="grid gap-4 sm:grid-cols-2">
        <StatCard
          title="Adolescentes activos"
          value={data.stats?.members ?? 0}
          icon={Users}
        />
        <StatCard
          title="Registros pendientes"
          value={data.stats?.pending ?? 0}
          icon={Clock}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="font-semibold">Última reunión</h2>
          {data.lastMeeting ? (
            <div className="mt-3">
              <p className="text-sm text-zinc-500">
                {fmtDate.format(new Date(`${data.lastMeeting.date}T12:00:00Z`))}
                {data.agapes.length > 1 && `, ${data.lastMeeting.agapeName}`}
              </p>
              <p className="mt-1 font-medium">{data.lastMeeting.topic}</p>
              <p className="mt-4 text-3xl font-semibold">
                {data.lastMeeting.percent !== null
                  ? `${data.lastMeeting.percent}%`
                  : "—"}
              </p>
              <p className="text-sm text-zinc-500">
                {data.lastMeeting.attended} de {data.lastMeeting.recorded}{" "}
                asistieron
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-zinc-500">
              Todavía no hay reuniones registradas.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Próximo evento</h2>
            <Link
              href="/eventos"
              className="text-sm text-zinc-600 underline-offset-4 hover:underline"
            >
              Ver eventos
            </Link>
          </div>
          {data.nextEvent ? (
            <div className="mt-3">
              <p className="inline-flex items-center gap-2 font-medium">
                <CalendarRange className="h-4 w-4 text-zinc-400" aria-hidden />{" "}
                {data.nextEvent.title}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                {fmtDateTime.format(new Date(data.nextEvent.starts_at))}
              </p>
              {data.nextEvent.location && (
                <p className="mt-1 inline-flex items-center gap-1 text-sm text-zinc-500">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />{" "}
                  {data.nextEvent.location}
                </p>
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-zinc-500">
              No hay eventos próximos.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
