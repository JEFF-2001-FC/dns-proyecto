import { createClient } from "../../lib/supabase/server";

export async function getDashboardStats() {
  const supabase = await createClient();

  const [
    { count: adolescentsCount },
    { count: leadersCount },
    { count: upcomingEventsCount },
    { count: activeAlertsCount },
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
  ]);

  return {
    adolescentsCount: adolescentsCount ?? 0,
    leadersCount: leadersCount ?? 0,
    upcomingEventsCount: upcomingEventsCount ?? 0,
    activeAlertsCount: activeAlertsCount ?? 0,
  };
}
