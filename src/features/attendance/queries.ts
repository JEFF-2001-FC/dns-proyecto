import { createClient } from "@/lib/supabase/server";
import type { AttendanceContext, AttendanceStatus, Option, RosterItem } from "./types";

/** Catálogos y alcance del usuario para la pantalla de asistencia (RLS decide qué ve cada uno). */
export async function getAttendanceContext(): Promise<AttendanceContext> {
  const supabase = await createClient();

  const [admin, types, clans, days] = await Promise.all([
    supabase.rpc("is_admin"),
    supabase.from("meeting_types").select("id, name").eq("active", true).order("name"),
    supabase.from("clans").select("id, name, color").eq("active", true).order("sort_order"),
    supabase.rpc("setting_int", { p_key: "attendance_correction_days", p_default: 7 }),
  ]);

  const isAdmin = admin.data === true;
  let agapes: Option[] = [];

  if (isAdmin) {
    const { data } = await supabase.from("agapes").select("id, name").eq("active", true).order("name");
    agapes = data ?? [];
  } else {
    const { data: ids } = await supabase.rpc("my_agape_ids");
    const list = (ids ?? []) as string[];
    if (list.length) {
      const { data } = await supabase.from("agapes").select("id, name").in("id", list).order("name");
      agapes = data ?? [];
    }
  }

  return {
    isAdmin,
    agapes,
    meetingTypes: types.data ?? [],
    clans: clans.data ?? [],
    correctionDays: typeof days.data === "number" ? days.data : 7,
  };
}

type RosterRow = {
  id: string;
  full_name: string;
  last_name: string;
  status: "pending" | "active";
  clan_id: string | null;
  clan_name: string | null;
  clan_color: string | null;
};

export function toRosterItem(row: RosterRow, attendance?: { status: AttendanceStatus; is_provisional: boolean }): RosterItem {
  return {
    id: row.id,
    fullName: row.full_name,
    lastName: row.last_name,
    status: row.status,
    clanId: row.clan_id,
    clanName: row.clan_name,
    clanColor: row.clan_color,
    attendance: attendance?.status ?? null,
    isProvisional: attendance?.is_provisional ?? row.status === "pending",
  };
}

export const ROSTER_COLUMNS = "id, full_name, last_name, status, clan_id, clan_name, clan_color";

/** Lista del ágape + reunión (si ya existe) + asistencia guardada. */
export async function getRoster(params: { agapeId: string; meetingTypeId: string; date: string }) {
  const supabase = await createClient();

  const [meetingRes, rosterRes] = await Promise.all([
    supabase
      .from("meetings")
      .select("id, topic")
      .eq("agape_id", params.agapeId)
      .eq("meeting_type_id", params.meetingTypeId)
      .eq("meeting_date", params.date)
      .maybeSingle(),
    supabase
      .from("v_adolescents")
      .select(ROSTER_COLUMNS)
      .eq("agape_id", params.agapeId)
      .in("status", ["pending", "active"])
      .order("last_name")
      .order("first_name"),
  ]);

  if (rosterRes.error) throw new Error(rosterRes.error.message);

  const meeting = meetingRes.data;
  const saved = new Map<string, { status: AttendanceStatus; is_provisional: boolean }>();

  if (meeting) {
    const { data } = await supabase
      .from("attendance")
      .select("adolescent_id, status, is_provisional")
      .eq("meeting_id", meeting.id);
    for (const r of data ?? []) saved.set(r.adolescent_id, { status: r.status, is_provisional: r.is_provisional });
  }

  return {
    meeting: meeting as { id: string; topic: string } | null,
    roster: ((rosterRes.data ?? []) as RosterRow[]).map((row) => toRosterItem(row, saved.get(row.id))),
  };
}
