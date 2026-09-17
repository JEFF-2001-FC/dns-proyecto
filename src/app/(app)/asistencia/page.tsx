import { requireUser } from "@/lib/auth/require-user";
import { addDays, formatLongDate, isIsoDate, todayLima } from "@/lib/dates";
import { getAttendanceContext, getRoster } from "@/features/attendance/queries";
import { AttendanceFilters } from "@/features/attendance/components/attendance-filters";
import { AttendanceSheet } from "@/features/attendance/components/attendance-sheet";

export const metadata = { title: "Asistencia · DNS" };

type Props = { searchParams: Promise<{ agape?: string; tipo?: string; fecha?: string }> };

export default async function AsistenciaPage({ searchParams }: Props) {
  await requireUser();
  const [params, ctx] = await Promise.all([searchParams, getAttendanceContext()]);

  const header = (
    <div>
      <p className="text-sm text-zinc-500">Pasar lista</p>
      <h1 className="text-3xl font-semibold tracking-tight">Asistencia</h1>
    </div>
  );

  if (ctx.agapes.length === 0 || ctx.meetingTypes.length === 0) {
    return (
      <div className="space-y-6">
        {header}
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="font-medium">{ctx.agapes.length === 0 ? "No tienes un ágape asignado" : "Faltan tipos de reunión"}</p>
          <p className="mt-1 text-sm text-zinc-500">Pide a un administrador que complete la configuración.</p>
        </div>
      </div>
    );
  }

  const today = todayLima();
  const agapeId = ctx.agapes.some((a) => a.id === params.agape) ? params.agape! : ctx.agapes[0].id;
  const meetingType = ctx.meetingTypes.find((t) => t.id === params.tipo) ?? ctx.meetingTypes[0];
  const date = isIsoDate(params.fecha) && params.fecha <= today ? params.fecha : today;

  const minDate = ctx.isAdmin ? undefined : addDays(today, -ctx.correctionDays);
  const editable = ctx.isAdmin || (minDate !== undefined && date >= minDate);

  const { meeting, roster } = await getRoster({ agapeId, meetingTypeId: meetingType.id, date });

  return (
    <div className="space-y-6">
      {header}

      <AttendanceFilters
        agapes={ctx.agapes}
        meetingTypes={ctx.meetingTypes}
        agapeId={agapeId}
        meetingTypeId={meetingType.id}
        date={date}
        minDate={minDate}
      />

      <p className="text-sm text-zinc-600">
        {formatLongDate(date)}
        {meeting ? ", reunión ya registrada" : ", reunión nueva"}
      </p>

      <AttendanceSheet
        key={`${agapeId}-${meetingType.id}-${date}`}
        agapeId={agapeId}
        meetingTypeId={meetingType.id}
        date={date}
        initialTopic={meeting?.topic ?? meetingType.name}
        roster={roster}
        clans={ctx.clans}
        editable={editable}
        readOnlyReason={`Solo se puede registrar o corregir asistencia de los últimos ${ctx.correctionDays} días.`}
      />
    </div>
  );
}
