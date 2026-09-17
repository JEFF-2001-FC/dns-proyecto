import { createClient } from "../../lib/supabase/server";

export async function getDashboard() {
  const supabase = await createClient();

  const [
    { count: adolescentsCount },
    { count: leadersCount },
    { count: upcomingEventsCount },
    { count: activeAlertsCount },
    { data: rawAlerts },
    { data: rawEvents },
  ] = await Promise.all([
    supabase
      .from("adolescents")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),

    supabase
      .from("leaders")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),

    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .gte("starts_at", new Date().toISOString()),

    supabase
      .from("alerts")
      .select("*", { count: "exact", head: true })
      .eq("status", "open"),

    // Traemos las alertas completas
    supabase
      .from("alerts")
      .select("*")
      .eq("status", "open")
      .limit(5),

    // Vista previa de eventos próximos
    supabase
      .from("events")
      .select("id, title, starts_at")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(5),
  ]);

  return {
    adolescents: adolescentsCount ?? 0,
    leaders: leadersCount ?? 0,
    events: upcomingEventsCount ?? 0,
    alerts: activeAlertsCount ?? 0,
    alertPreview:
      rawAlerts?.map((alert: any) => ({
        id: alert.id,
        name: alert.type ?? alert.title ?? "Alerta de seguimiento",
        reason: alert.reason ?? alert.notes ?? alert.description ?? "Requiere atención",
      })) ?? [],
    eventPreview: rawEvents ?? [],
  };
}

export const getDashboardStats = getDashboard;