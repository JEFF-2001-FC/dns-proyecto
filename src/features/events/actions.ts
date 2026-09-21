"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/require-role";
import { requireUser } from "@/lib/auth/require-user";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const eventSchema = z.object({
  title: z.string().trim().min(3).max(160), description: z.string().trim().max(2_000).optional(), scope: z.enum(["general", "clan", "agape"]), targetId: z.union([z.uuid(), z.literal("")]), startsAt: z.string().datetime(), endsAt: z.union([z.string().datetime(), z.literal("")]).optional(), location: z.string().trim().max(180).optional(),
});

export async function createEvent(input: unknown): Promise<{ ok: boolean; message: string }> {
  const user = await requireUser(); const parsed = eventSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Revisa título, fecha y alcance del evento." };
  const value = parsed.data;
  if (value.scope !== "general" && !value.targetId) return { ok: false, message: "Selecciona el ágape o clan del evento." };
  if (user.role !== "admin" && value.scope === "general") return { ok: false, message: "Solo administración crea eventos generales." };
  if (value.endsAt && value.endsAt < value.startsAt) return { ok: false, message: "La fecha de cierre no puede ser anterior al inicio." };
  const supabase = await createClient();
  const { error } = await supabase.from("events").insert({ title: value.title, description: value.description || null, starts_at: value.startsAt, ends_at: value.endsAt || null, location: value.location || null, scope: value.scope, clan_id: value.scope === "clan" ? value.targetId : null, agape_id: value.scope === "agape" ? value.targetId : null });
  if (error) return { ok: false, message: error.message };
  revalidatePath("/eventos"); revalidatePath("/calendario"); revalidatePath("/admin/eventos-pendientes"); revalidatePath("/inicio");
  return { ok: true, message: user.role === "admin" ? "Evento publicado." : "Evento enviado al administrador para aprobación." };
}

export async function reviewEvent(eventId: string, publish: boolean): Promise<{ ok: boolean; message: string }> {
  await requireRole("admin"); if (!z.uuid().safeParse(eventId).success) return { ok: false, message: "Evento no válido." };
  const supabase = await createClient(); const { error } = await supabase.from("events").update({ approval_status: publish ? "published" : "rejected" }).eq("id", eventId).eq("approval_status", "pending");
  if (error) return { ok: false, message: error.message };
  revalidatePath("/eventos"); revalidatePath("/calendario"); revalidatePath("/admin/eventos-pendientes"); revalidatePath("/inicio");
  return { ok: true, message: publish ? "Evento publicado." : "Evento rechazado." };
}

export async function uploadEventResource(eventId: string, formData: FormData): Promise<void> {
  const user = await requireUser(); if (!z.uuid().safeParse(eventId).success) throw new Error("Evento no válido.");
  const title = String(formData.get("title") ?? "").trim(); const kind = String(formData.get("kind") ?? "file"); const externalUrl = String(formData.get("externalUrl") ?? "").trim(); const body = String(formData.get("body") ?? "").trim(); const file = formData.get("file");
  if (!title || !["file", "link", "note"].includes(kind)) throw new Error("Completa el título y el tipo de recurso.");
  if (kind === "link" && !/^https?:\/\//i.test(externalUrl)) throw new Error("Escribe un enlace válido que empiece con https://.");
  if (kind === "note" && !body) throw new Error("Escribe el contenido de la nota.");
  if (kind === "file" && (!(file instanceof File) || file.size === 0 || file.type !== "application/pdf")) throw new Error("Selecciona un archivo PDF.");
  if (kind === "file" && file instanceof File && file.size > 10 * 1024 * 1024) throw new Error("El PDF supera el límite de 10 MB.");
  const supabase = await createClient(); const { data: event } = await supabase.from("events").select("created_by").eq("id", eventId).maybeSingle();
  if (!event || (user.role !== "admin" && event.created_by !== user.id)) throw new Error("Solo quien creó el evento puede adjuntar recursos.");
  const admin = createAdminClient(); let path: string | null = null;
  if (kind === "file" && file instanceof File) { const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_"); path = `${eventId}/${Date.now()}-${crypto.randomUUID()}-${safeName}`; const { error } = await admin.storage.from("dns-event-resources").upload(path, file, { contentType: file.type, upsert: false }); if (error) throw new Error(error.message); }
  const { error } = await admin.from("event_resources").insert({ event_id: eventId, title, kind: kind as "file" | "link" | "note", external_url: kind === "link" ? externalUrl : null, body: kind === "note" ? body : null, storage_path: path, file_name: kind === "file" && file instanceof File ? file.name : null, mime_type: kind === "file" && file instanceof File ? file.type : null, size_bytes: kind === "file" && file instanceof File ? file.size : null, uploaded_by: user.id });
  if (error) { if (path) await admin.storage.from("dns-event-resources").remove([path]); throw new Error(error.message); }
  revalidatePath("/eventos"); revalidatePath("/calendario"); revalidatePath("/inicio");
}
