import Link from "next/link";
import { ArrowRight, Cake, HeartHandshake, MapPin } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { Card } from "@/components/ui/card";
import { fmtDate } from "@/lib/format";
import { formatTime, weekdayOf, WEEKDAYS } from "@/lib/dates";
import type { getLeaderDashboard } from "../queries";
import { EventDate } from "./event-date";

type Data = Awaited<ReturnType<typeof getLeaderDashboard>>;

function Ring({ percent }: { percent: number | null }) {
  const value = percent ?? 0;
  const circumference = 2 * Math.PI * 15.5;
  return (
    <div className="relative h-[84px] w-[84px] shrink-0">
      <svg viewBox="0 0 36 36" aria-hidden className="h-full w-full -rotate-90">
        <circle
          cx="18"
          cy="18"
          r="15.5"
          fill="none"
          stroke="#EFECE6"
          strokeWidth="4"
        />
        <circle
          cx="18"
          cy="18"
          r="15.5"
          fill="none"
          stroke="#0E0E10"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * circumference} ${circumference}`}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-display text-2xl font-bold">
        {percent !== null ? `${percent}%` : "—"}
      </span>
    </div>
  );
}

export function LeaderDashboard({ data }: { data: Data }) {
  const greeting = data.leaderName ? `Hola, ${data.leaderName}` : "Hola";

  if (data.agapes.length === 0) {
    return (
      <div className="space-y-5">
        <h1 className="font-display text-4xl font-extrabold leading-none">
          {greeting}
        </h1>
        <Card className="border-dashed p-8 text-center">
          <p className="font-semibold">Aún no tienes un ágape asignado</p>
          <p className="mt-1 text-sm text-muted">
            Pide a un administrador que te asigne uno para empezar a tomar
            asistencia.
          </p>
        </Card>
      </div>
    );
  }

  const agape = data.agapes[0];
  const isMeetingDay =
    agape.meetingDay !== null && agape.meetingDay === weekdayOf(data.today);
  const time = formatTime(agape.meetingTime);
  const when = isMeetingDay
    ? ["HOY", agape.name, time].filter(Boolean).join(" · ")
    : [
        agape.name,
        agape.meetingDay !== null
          ? `reunión los ${WEEKDAYS[agape.meetingDay]}`
          : null,
      ]
        .filter(Boolean)
        .join(" · ");

  return (
    <div className="space-y-3 lg:space-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
          {data.clan && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-bold text-white"
              style={{ backgroundColor: data.clan.color }}
            >
              {data.clan.name}
            </span>
          )}
          {agape.role === "lead" ? "Líder principal" : "Co-líder"}
        </div>
        <h1 className="mt-2 font-display text-4xl font-extrabold leading-none sm:text-5xl">
          {greeting}
        </h1>
      </div>

      <Link
        href={`/asistencia?agape=${agape.id}&fecha=${data.today}`}
        className="group flex items-center justify-between gap-3 rounded-[22px] bg-ink p-[18px] text-white transition-colors hover:bg-ink-soft"
      >
        <div className="min-w-0">
          <p className="truncate text-xs font-bold uppercase tracking-wider text-flame-soft">
            {when}
          </p>
          <p className="mt-1 font-display text-[28px] font-bold leading-tight">
            {data.todayRecorded
              ? "Revisar asistencia de hoy"
              : "Tomar asistencia"}
          </p>
          <p className="text-sm text-[#C9C5BD]">
            {data.todayRecorded
              ? "Ya registraste hoy; puedes corregirla."
              : `${data.stats?.members ?? 0} adolescentes en lista`}
          </p>
        </div>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-flame text-ink transition-transform group-hover:translate-x-0.5">
          <ArrowRight className="h-[22px] w-[22px]" aria-hidden />
        </span>
      </Link>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="Adolescentes"
          value={data.stats?.members ?? 0}
          hint={
            data.stats?.newThisMonth ? (
              <span className="text-[#2F6B3A]">
                +{data.stats.newThisMonth} este mes
              </span>
            ) : undefined
          }
        />
        <StatCard
          title="Por aprobar"
          value={data.stats?.pending ?? 0}
          hint={
            data.stats?.pending ? (
              <span className="text-[#7A4B00]">Visitantes nuevos</span>
            ) : (
              "Todo al día"
            )
          }
        />
      </div>

      <Link
        href={data.connectionEnabled ? "/conexion" : "/inicio"}
        aria-disabled={!data.connectionEnabled}
        tabIndex={data.connectionEnabled ? undefined : -1}
        className={`flex items-center justify-between rounded-[22px] border p-4 ${
          data.connectionEnabled
            ? "border-[#B8DEC0] bg-[#EAF7EC] text-[#1E6B32] hover:bg-[#E3F4E6]"
            : "cursor-not-allowed border-line bg-paper text-muted"
        }`}
      >
        <span className="flex items-center gap-3">
          <span className={`grid h-10 w-10 place-items-center rounded-xl ${data.connectionEnabled ? "bg-[#2E7D32] text-white" : "bg-line text-muted"}`}>
            <HeartHandshake className="h-5 w-5" aria-hidden />
          </span>
          <span>
            <span className="block font-bold">Conexión</span>
            <span className="block text-sm">{data.connectionEnabled ? "Activa: registrar seguimientos" : "No tienes este acceso"}</span>
          </span>
        </span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${data.connectionEnabled ? "bg-white/80" : "bg-white"}`}>
          {data.connectionEnabled ? "Activa" : "Inactiva"}
        </span>
      </Link>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="flex items-center gap-4 p-4">
          <Ring percent={data.lastMeeting?.percent ?? null} />
          <div className="min-w-0">
            {data.lastMeeting ? (
              <>
                <p className="text-sm text-muted">
                  Última reunión ·{" "}
                  {fmtDate.format(
                    new Date(`${data.lastMeeting.date}T17:00:00Z`),
                  )}
                </p>
                <p className="mt-0.5 font-bold">
                  {data.lastMeeting.attended} de {data.lastMeeting.recorded}{" "}
                  asistieron
                </p>
                <p className="truncate text-sm text-muted">
                  {data.lastMeeting.topic}
                </p>
              </>
            ) : (
              <>
                <p className="font-bold">Aún no hay reuniones</p>
                <p className="text-sm text-muted">
                  Tu primera asistencia aparecerá aquí.
                </p>
              </>
            )}
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4">
          {data.nextEvent ? (
            <>
              <EventDate
                iso={data.nextEvent.starts_at}
                color={data.nextEvent.color}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted">Próximo evento</p>
                <p className="truncate font-bold">{data.nextEvent.title}</p>
                {data.nextEvent.location && (
                  <p className="flex items-center gap-1 truncate text-sm text-muted">
                    <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {data.nextEvent.location}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div>
              <p className="text-sm text-muted">Próximo evento</p>
              <p className="font-bold">No hay eventos próximos</p>
            </div>
          )}
        </Card>
      </div>

      {data.birthdays.length > 0 && (
        <div className="flex items-center gap-2.5 rounded-[22px] bg-[#FFF4E8] px-4 py-3 text-sm text-[#6B3A00]">
          <Cake className="h-5 w-5 shrink-0" aria-hidden />
          <p>
            <strong>Cumpleaños este mes:</strong>{" "}
            {data.birthdays
              .slice(0, 4)
              .map((b) => `${b.name} (${b.day})`)
              .join(", ")}
            {data.birthdays.length > 4 && ` y ${data.birthdays.length - 4} más`}
          </p>
        </div>
      )}
    </div>
  );
}
