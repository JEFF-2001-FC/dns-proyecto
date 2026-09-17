import { createClient } from "@/lib/supabase/server";
import { todayLima } from "@/lib/dates";

const OPEN_ALERTS = ["open", "in_progress"] as const;

export type UpcomingEvent = {
  id: string;
  title: string;
  starts_at: string;
  location: string | null;
};

/* ------------------------------------------------------------------ */
/* ADMIN: métricas globales del ministerio                             */
/* ------------------------------------------------------------------ */
export async function getAdminDashboard() {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const [
    adolescents,
    pending,
    agapes,
    alertsCount,
    leaders,
    assignments,
    alertRows,
    eventRows,
  ] = await Promise.all([
    supabase
      .from("adolescents")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("adolescents")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("agapes")
      .select("id", { count: "exact", head: true })
      .eq("active", true),
    supabase
      .from("alerts")
      .select("id", { count: "exact", head: true })
      .in("status", OPEN_ALERTS),
    supabase
      .from("leaders")
      .select("id, first_name, last_name")
      .eq("status", "active")
      .order("last_name"),
    supabase
      .from("leader_agape_assignments")
      .select("leader_id")
      .is("ended_on", null),
    supabase
      .from("alerts")
      .select(
        "id, severity, message, adolescent:adolescents(first_name, last_name)",
      )
      .in("status", OPEN_ALERTS)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("events")
      .select("id, title, starts_at, location")
      .gte("starts_at", nowIso)
      .order("starts_at")
      .limit(5),
  ]);

  // Control de líderes: activos que hoy no dirigen ningún ágape
  const assigned = new Set((assignments.data ?? []).map((a) => a.leader_id));
  const activeLeaders = leaders.data ?? [];
  const unassigned = activeLeaders.filter((l) => !assigned.has(l.id));

  return {
    totals: {
      adolescents: adolescents.count ?? 0,
      pending: pending.count ?? 0,
      agapes: agapes.count ?? 0,
      alerts: alertsCount.count ?? 0,
      leaders: activeLeaders.length,
      unassignedLeaders: unassigned.length,
    },
    unassignedLeaders: unassigned
      .slice(0, 5)
      .map((l) => ({ id: l.id, name: `${l.first_name} ${l.last_name}` })),
    alerts: (alertRows.data ?? []).map((a) => ({
      id: a.id,
      severity: a.severity,
      message: a.message,
      name: a.adolescent
        ? `${a.adolescent.first_name} ${a.adolescent.last_name}`
        : "Adolescente",
    })),
    events: (eventRows.data ?? []) as UpcomingEvent[],
  };
}

/* ------------------------------------------------------------------ */
/* LÍDER: métricas operativas de su ágape y clan                       */
/* RLS ya limita todo a sus ágapes; aquí solo se arma el resumen.      */
/* ------------------------------------------------------------------ */
export async function getLeaderDashboard(profileId: string) {
  const supabase = await createClient();
  const today = todayLima();

  const { data: leader } = await supabase
    .from("leaders")
    .select(
      `id, first_name,
       assignments:leader_agape_assignments(role, ended_on, agape:agapes(id, name)),
       clans:leader_clan_memberships(ended_on, clan:clans(name, color))`,
    )
    .eq("profile_id", profileId)
    .maybeSingle();

  const agapes = (leader?.assignments ?? [])
    .filter((a) => a.ended_on === null && a.agape)
    .map((a) => ({ id: a.agape!.id, name: a.agape!.name, role: a.role }));
  const clan =
    (leader?.clans ?? []).find((c) => c.ended_on === null)?.clan ?? null;
  const agapeIds = agapes.map((a) => a.id);

  if (agapeIds.length === 0) {
    return {
      leaderName: leader?.first_name ?? null,
      agapes,
      clan,
      today,
      stats: null,
      lastMeeting: null,
      todayRecorded: false,
      nextEvent: null,
    };
  }

  const [members, pending, lastMeeting, todayMeeting, nextEvent] =
    await Promise.all([
      supabase
        .from("v_adolescents")
        .select("id", { count: "exact", head: true })
        .in("agape_id", agapeIds)
        .eq("status", "active"),
      supabase
        .from("v_adolescents")
        .select("id", { count: "exact", head: true })
        .in("agape_id", agapeIds)
        .eq("status", "pending"),
      supabase
        .from("v_meeting_summary")
        .select(
          "meeting_id, meeting_date, topic, agape_name, recorded, present, late, provisional",
        )
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
        .select("id, title, starts_at, location")
        .gte("starts_at", new Date().toISOString())
        .order("starts_at")
        .limit(1)
        .maybeSingle(),
    ]);

  const lm = lastMeeting.data;
  const attended = (lm?.present ?? 0) + (lm?.late ?? 0);
  const recorded = lm?.recorded ?? 0;

  return {
    leaderName: leader?.first_name ?? null,
    agapes,
    clan,
    today,
    stats: { members: members.count ?? 0, pending: pending.count ?? 0 },
    lastMeeting: lm
      ? {
          date: lm.meeting_date as string,
          topic: lm.topic ?? "",
          agapeName: lm.agape_name ?? "",
          attended,
          recorded,
          percent:
            recorded > 0 ? Math.round((attended / recorded) * 100) : null,
        }
      : null,
    todayRecorded: (todayMeeting.count ?? 0) > 0,
    nextEvent: (nextEvent.data ?? null) as UpcomingEvent | null,
  };
}
