import { createClient } from "@/lib/supabase/server";

export async function getDashboard() {
  const supabase = await createClient();

  const [adolescents, leaders, events, alerts, alertPreview, eventPreview] = await Promise.all([
    supabase.from("adolescents").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("leaders").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("events").select("id", { count: "exact", head: true }).gte("starts_at", new Date().toISOString()),
    supabase.from("alerts").select("id", { count: "exact", head: true }).in("status", ["open", "in_progress"]),
    supabase.from("alerts").select("id, severity, message, adolescents(first_name,last_name)").in("status", ["open", "in_progress"]).order("created_at", { ascending: false }).limit(5),
    supabase.from("events").select("id,title,starts_at").gte("starts_at", new Date().toISOString()).order("starts_at").limit(5)
  ]);

  return {
    adolescents: adolescents.count ?? 0,
    leaders: leaders.count ?? 0,
    events: events.count ?? 0,
    alerts: alerts.count ?? 0,
    alertPreview: (alertPreview.data ?? []).map((x: any) => ({
      id: x.id,
      name: x.adolescents ? `${x.adolescents.first_name} ${x.adolescents.last_name}` : "Adolescente",
      reason: x.message
    })),
    eventPreview: eventPreview.data ?? []
  };
}
