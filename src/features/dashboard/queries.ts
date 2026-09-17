import { createClient } from "@/lib/supabase/server";

const OPEN_ALERT_STATUSES = ["open", "in_progress"] as const;

/** Resumen del inicio. Todas las consultas respetan RLS: el líder ve su ágape, el admin todo. */
export async function getDashboard() {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const [adolescents, leaders, events, alerts, alertRows, eventRows] = await Promise.all([
    supabase.from("adolescents").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("leaders").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("events").select("id", { count: "exact", head: true }).gte("starts_at", nowIso),
    supabase.from("alerts").select("id", { count: "exact", head: true }).in("status", OPEN_ALERT_STATUSES),
    supabase
      .from("alerts")
      .select("id, severity, status, message, created_at, adolescent:adolescents(first_name, last_name)")
      .in("status", OPEN_ALERT_STATUSES)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("events").select("id, title, starts_at").gte("starts_at", nowIso).order("starts_at").limit(5),
  ]);

  return {
    adolescents: adolescents.count ?? 0,
    leaders: leaders.count ?? 0,
    events: events.count ?? 0,
    alerts: alerts.count ?? 0,
    alertPreview: (alertRows.data ?? []).map((alert) => ({
      id: alert.id,
      name: alert.adolescent ? `${alert.adolescent.first_name} ${alert.adolescent.last_name}` : "Adolescente",
      reason: alert.message,
      severity: alert.severity,
      status: alert.status,
    })),
    eventPreview: eventRows.data ?? [],
  };
}

export const getDashboardStats = getDashboard;
