"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/require-role";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";

const eventSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(2_000).optional(),
  scope: z.enum(["general", "clan", "agape"]),
  targetId: z.union([z.uuid(), z.literal("")]),
  startsAt: z.string().datetime(),
  endsAt: z.union([z.string().datetime(), z.literal("")]).optional(),
  location: z.string().trim().max(180).optional(),
});

export async function createEvent(input: unknown): Promise<{ ok: boolean; message: string }> {
  const user = await requireUser();
  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Revisa título, fecha y alcance del evento." };
  const value = parsed.data;
  if (value.scope !== "general" && !value.targetId) return { ok: false, message: "Selecciona el ágape o clan del evento." };
  if (user.role !== "admin" && value.scope === "general") return { ok: false, message: "Solo administración crea eventos generales." };
  if (value.endsAt && value.endsAt < value.startsAt) return { ok: false, message: "La fecha de cierre no puede ser anterior al inicio." };
  const supabase = await createClient();
  const { error } = await supabase.from("events").insert({
    title: value.title, description: value.description || null, starts_at: value.startsAt,
    ends_at: value.endsAt || null, location: value.location || null, scope: value.scope,
    clan_id: value.scope === "clan" ? value.targetId : null,
    agape_id: value.scope === "agape" ? value.targetId : null,
  });
  if (error) return { ok: false, message: error.message };
  revalidatePath("/eventos"); revalidatePath("/calendario"); revalidatePath("/admin/eventos-pendientes"); revalidatePath("/inicio");
  return { ok: true, message: user.role === "admin" ? "Evento publicado." : "Evento enviado al administrador para aprobación." };
}

export async function reviewEvent(eventId: string, publish: boolean): Promise<{ ok: boolean; message: string }> {
  await requireRole("admin");
  if (!z.uuid().safeParse(eventId).success) return { ok: false, message: "Evento no válido." };
  const supabase = await createClient();
  const { error } = await supabase.from("events").update({ approval_status: publish ? "published" : "rejected" }).eq("id", eventId).eq("approval_status", "pending");
  if (error) return { ok: false, message: error.message };
  revalidatePath("/eventos"); revalidatePath("/calendario"); revalidatePath("/admin/eventos-pendientes"); revalidatePath("/inicio");
  return { ok: true, message: publish ? "Evento publicado." : "Evento rechazado." };
}
