import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { DeleteMeetingButton } from "@/features/meetings/components/delete-meeting-button";

export const metadata = { title: "Reuniones · DNS" };

export default async function ReunionesPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase.from("meetings").select("id, agape_id, meeting_type_id, meeting_date, topic, agape:agapes(name), type:meeting_types(name), attendance(id)").order("meeting_date", { ascending: false }).limit(100);
  const meetings = data ?? [];
  return <div className="space-y-6"><PageHeader eyebrow="Asistencia" title="Reuniones" description={user.role === "admin" ? "Historial de reuniones de todos los ágapes." : "Puedes corregir o eliminar reuniones recientes de tus ágapes."} action={<Link href="/asistencia" className="rounded-2xl bg-ink px-4 py-2.5 text-sm font-semibold text-white">Registrar asistencia</Link>} /><section className="overflow-hidden rounded-3xl border border-line bg-white">{meetings.length === 0 ? <p className="p-6 text-sm text-muted">Aún no se han registrado reuniones.</p> : <ul className="divide-y divide-line">{meetings.map((meeting) => <li key={meeting.id} className="flex flex-col gap-3 p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-bold">{meeting.topic}</p><p className="mt-1 text-sm text-muted">{meeting.meeting_date} · {meeting.agape?.name ?? "Ágape"} · {meeting.type?.name ?? "Reunión"} · {meeting.attendance.length} asistencias</p></div><div className="flex flex-wrap items-center gap-1"><Link href={`/asistencia?agape=${meeting.agape_id}&tipo=${meeting.meeting_type_id}&fecha=${meeting.meeting_date}`} className="rounded-xl border border-line px-3 py-2 text-sm font-semibold">Editar</Link><DeleteMeetingButton meetingId={meeting.id} /></div></div></li>)}</ul>}</section></div>;
}
