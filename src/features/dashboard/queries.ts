import { createClient } from "@/lib/supabase/server";
import { addDays, todayLima } from "@/lib/dates";

const OPEN_ALERTS = ["open", "in_progress"] as const;

export type UpcomingEvent = {
  id: string;
  title: string;
  starts_at: string;
  location: string | null;
  color: string | null;
};

type AttendanceRow = {
  status: string;
  adolescent_id: string;
  meeting: { meeting_date: string } | null;
};

const daysBetween = (from: string, to: string) =>
  Math.round(
    (Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) /
      86_400_000,
  );
const pct = (attended: number, counted: number) =>
  counted > 0 ? Math.round((attended / counted) * 100) : null;

/* ------------------------------------------------------------------ */
/* ADMIN: métricas globales del ministerio                             */
/* ------------------------------------------------------------------ */
export async function getAdminDashboard() {
  const supabase = await createClient();
  const today = todayLima();
  const since = addDays(today, -27); // últimas 4 semanas
  const monthStart = `${today.slice(0, 8)}01`;
  const nowIso = new Date().toISOString();

  const [
    adolescents,
    newThisMonth,
    pending,
    alertsCount,
    criticalCount,
    leaders,
    assignments,
    clans,
    roster,
    attendance,
    alertRows,
    eventRows,
    agapes,
    birthdayPeople,
  ] = await Promise.all([
    supabase
      .from("adolescents")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("adolescents")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .gte("created_at", monthStart),
    supabase
      .from("adolescents")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("alerts")
      .select("id", { count: "exact", head: true })
      .in("status", OPEN_ALERTS),
    supabase
      .from("alerts")
      .select("id", { count: "exact", head: true })
      .in("status", OPEN_ALERTS)
      .eq("severity", "critical"),
    supabase
      .from("leaders")
      .select("id, first_name, last_name")
      .eq("status", "active")
      .order("first_name"),
    supabase
      .from("leader_agape_assignments")
      .select("leader_id")
      .is("ended_on", null),
    supabase
      .from("clans")
      .select("id, name, color")
      .eq("active", true)
      .order("sort_order"),
    supabase.from("v_adolescents").select("id, clan_id").eq("status", "active"),
    supabase
      .from("attendance")
      .select("status, adolescent_id, meeting:meetings!inner(meeting_date)")
      .eq("is_provisional", false)
      .gte("meeting.meeting_date", since),
    supabase
      .from("alerts")
      .select(
        "id, severity, consecutive_absences, adolescent_id, snapshot_agape_id, adolescent:adolescents(first_name, last_name)",
      )
      .in("status", OPEN_ALERTS)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("events")
      .select("id, title, starts_at, location, clan:clans(color)")
      .gte("starts_at", nowIso)
      .order("starts_at")
      .limit(3),
    supabase.from("agapes").select("id, name"),
    supabase.from("v_adolescents").select("id, full_name, birth_date, agape_name").eq("status", "active").not("birth_date", "is", null),
  ]);

  // Asistencia: por semana (4 barras) y por clan
  const clanOf = new Map((roster.data ?? []).map((r) => [r.id, r.clan_id]));
  const weeks = Array.from({ length: 4 }, () => ({ attended: 0, counted: 0 }));
  const byClan = new Map<string, { attended: number; counted: number }>();

  for (const row of (attendance.data ?? []) as AttendanceRow[]) {
    if (!row.meeting || row.status === "justified") continue;
    const attended = row.status === "present" || row.status === "late" ? 1 : 0;
    const week = Math.min(
      3,
      Math.floor(daysBetween(row.meeting.meeting_date, today) / 7),
    );
    weeks[week].attended += attended;
    weeks[week].counted += 1;

    const clanId = clanOf.get(row.adolescent_id);
    if (clanId) {
      const acc = byClan.get(clanId) ?? { attended: 0, counted: 0 };
      acc.attended += attended;
      acc.counted += 1;
      byClan.set(clanId, acc);
    }
  }

  // Teléfono del apoderado para el botón "Llamar"
  const alertList = alertRows.data ?? [];
  const alertIds = alertList.map((a) => a.adolescent_id);
  const { data: guardians } = alertIds.length
    ? await supabase
        .from("v_adolescents")
        .select("id, guardian_phone")
        .in("id", alertIds)
    : { data: [] as { id: string | null; guardian_phone: string | null }[] };
  const phoneOf = new Map(
    (guardians ?? []).map((g) => [g.id, g.guardian_phone]),
  );
  const agapeName = new Map((agapes.data ?? []).map((a) => [a.id, a.name]));

  const assigned = new Set((assignments.data ?? []).map((a) => a.leader_id));
  const activeLeaders = leaders.data ?? [];
  const unassigned = activeLeaders.filter((l) => !assigned.has(l.id));

  return {
    totals: {
      adolescents: adolescents.count ?? 0,
      newThisMonth: newThisMonth.count ?? 0,
      pending: pending.count ?? 0,
      alerts: alertsCount.count ?? 0,
      criticalAlerts: criticalCount.count ?? 0,
      leaders: activeLeaders.length,
      unassignedLeaders: unassigned.length,
    },
    lastWeek: {
      percent: pct(weeks[0].attended, weeks[0].counted),
      attended: weeks[0].attended,
      counted: weeks[0].counted,
    },
    weeklyPercents: [...weeks].reverse().map((w) => pct(w.attended, w.counted)),
    clans: (clans.data ?? []).map((c) => {
      const acc = byClan.get(c.id);
      return {
        id: c.id,
        name: c.name,
        color: c.color,
        percent: acc ? pct(acc.attended, acc.counted) : null,
      };
    }),
    alerts: alertList.map((a) => ({
      id: a.id,
      severity: a.severity,
      absences: a.consecutive_absences,
      name: a.adolescent
        ? `${a.adolescent.first_name} ${a.adolescent.last_name}`
        : "Adolescente",
      agape: a.snapshot_agape_id
        ? (agapeName.get(a.snapshot_agape_id) ?? null)
        : null,
      phone: phoneOf.get(a.adolescent_id) ?? null,
    })),
    unassignedLeaders: unassigned.slice(0, 3).map((l) => l.first_name),
    events: (eventRows.data ?? []).map((e) => ({
      id: e.id,
      title: e.title,
      starts_at: e.starts_at,
      location: e.location,
      color: e.clan?.color ?? null,
    })) as UpcomingEvent[],
    birthdays: (birthdayPeople.data ?? []).filter((person) => person.birth_date?.slice(5, 7) === today.slice(5, 7)).sort((a, b) => (a.birth_date ?? "").localeCompare(b.birth_date ?? "")).map((person) => ({ id: person.id ?? "", name: person.full_name ?? "Adolescente", day: Number(person.birth_date?.slice(8, 10)), agape: person.agape_name ?? null })),
  };
}

/* ------------------------------------------------------------------ */
/* LÍDER: métricas operativas de su ágape y clan                       */
/* RLS ya limita todo a sus ágapes; aquí solo se arma el resumen.      */
/* ------------------------------------------------------------------ */
export async function getLeaderDashboard(profileId: string) {
  const supabase = await createClient();
  const today = todayLima();
  const monthStart = `${today.slice(0, 8)}01`;

  const { data: leader } = await supabase
    .from("leaders")
    .select(
      `id, first_name, connection_enabled,
       assignments:leader_agape_assignments(role, ended_on, agape:agapes(id, name, meeting_day, meeting_time)),
       clans:leader_clan_memberships(ended_on, clan:clans(name, color))`,
    )
    .eq("profile_id", profileId)
    .maybeSingle();

  const agapes = (leader?.assignments ?? [])
    .filter((a) => a.ended_on === null && a.agape)
    .map((a) => ({
      id: a.agape!.id,
      name: a.agape!.name,
      role: a.role,
      meetingDay: a.agape!.meeting_day,
      meetingTime: a.agape!.meeting_time,
    }));
  const clan =
    (leader?.clans ?? []).find((c) => c.ended_on === null)?.clan ?? null;
  const agapeIds = agapes.map((a) => a.id);

  const base = {
    leaderName: leader?.first_name ?? null,
    agapes,
    clan,
    today,
    connectionEnabled: leader?.connection_enabled ?? false,
  };

  if (agapeIds.length === 0) {
    return {
      ...base,
      stats: null,
      lastMeeting: null,
      todayRecorded: false,
      nextEvent: null,
      birthdays: [],
    };
  }

  const [
    members,
    newThisMonth,
    pending,
    lastMeeting,
    todayMeeting,
    nextEvent,
    people,
  ] = await Promise.all([
    supabase
      .from("v_adolescents")
      .select("id", { count: "exact", head: true })
      .in("agape_id", agapeIds)
      .eq("status", "active"),
    supabase
      .from("v_adolescents")
      .select("id", { count: "exact", head: true })
      .in("agape_id", agapeIds)
      .eq("status", "active")
      .gte("created_at", monthStart),
    supabase
      .from("v_adolescents")
      .select("id", { count: "exact", head: true })
      .in("agape_id", agapeIds)
      .eq("status", "pending"),
    supabase
      .from("v_meeting_summary")
      .select("meeting_date, topic, agape_name, recorded, present, late")
      .in("agape_id", agapeIds)
      .order("meeting_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("meetings")
      .select("id", { count: "exact", head: true })
      .in("agape_id", agapeIds)
      .eq("meeting_date", today),
    supabase
      .from("events")
      .select("id, title, starts_at, location, clan:clans(color)")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at")
      .limit(1)
      .maybeSingle(),
    supabase
      .from("v_adolescents")
      .select("first_name, birth_date")
      .in("agape_id", agapeIds)
      .eq("status", "active")
      .not("birth_date", "is", null),
  ]);

  const month = today.slice(5, 7);
  const birthdays = (people.data ?? [])
    .filter((p) => p.birth_date?.slice(5, 7) === month)
    .map((p) => ({
      name: p.first_name ?? "",
      day: Number(p.birth_date!.slice(8, 10)),
    }))
    .sort((a, b) => a.day - b.day);

  const lm = lastMeeting.data;
  const attended = (lm?.present ?? 0) + (lm?.late ?? 0);
  const recorded = lm?.recorded ?? 0;
  const ev = nextEvent.data;

  return {
    ...base,
    stats: {
      members: members.count ?? 0,
      newThisMonth: newThisMonth.count ?? 0,
      pending: pending.count ?? 0,
    },
    lastMeeting: lm
      ? {
          date: lm.meeting_date as string,
          topic: lm.topic ?? "",
          agapeName: lm.agape_name ?? "",
          attended,
          recorded,
          percent: pct(attended, recorded),
        }
      : null,
    todayRecorded: (todayMeeting.count ?? 0) > 0,
    nextEvent: ev
      ? ({
          id: ev.id,
          title: ev.title,
          starts_at: ev.starts_at,
          location: ev.location,
          color: ev.clan?.color ?? null,
        } as UpcomingEvent)
      : null,
    birthdays,
  };
}
