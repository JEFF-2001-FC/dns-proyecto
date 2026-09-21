"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export async function resolveAlert(alertId: string, formData: FormData) {
  const { user } = await requireRole("admin");
  if (!z.uuid().safeParse(alertId).success) throw new Error("Alerta no válida.");
  const note = String(formData.get("resolution_note") ?? "").trim();
  if (!note) throw new Error("Escribe cómo se atendió la alerta.");
  const supabase = await createClient();
  const { data: alert, error: findError } = await supabase.from("alerts").select("adolescent_id").eq("id", alertId).maybeSingle();
  if (findError || !alert) throw new Error("No se encontró la alerta.");
  const { error } = await supabase.from("alerts").update({ status: "resolved", resolution_note: note, resolved_at: new Date().toISOString(), resolved_by: user.id }).eq("id", alertId);
  if (error) throw new Error(error.message);
  await supabase.from("follow_up_notes").insert({ adolescent_id: alert.adolescent_id, alert_id: alertId, body: note, type: "note", author_id: user.id });
  revalidatePath("/alertas"); revalidatePath(`/adolescentes/${alert.adolescent_id}`); revalidatePath("/inicio");
}
