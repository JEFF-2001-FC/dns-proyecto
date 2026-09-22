"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireConnectionAccess } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  adolescentId: z.uuid(),
  status: z.enum(["new", "contacted", "scheduled", "referred", "closed"]),
  occurredOn: z.iso.date(),
  availability: z.string().trim().max(500).optional(),
  suggestedAgapeId: z.union([z.uuid(), z.literal("")]).optional(),
  notes: z.string().trim().min(3, "Escribe un resumen del contacto.").max(2_000),
  nextContactOn: z.union([z.iso.date(), z.literal("")]).optional(),
});

export type ConnectionResult = { ok: boolean; message: string };

const updateSchema = schema.extend({ id: z.uuid() });

export async function addConnectionFollowup(input: unknown): Promise<ConnectionResult> {
  await requireConnectionAccess();
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  }

  const value = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("connection_followups").insert({
    adolescent_id: value.adolescentId,
    status: value.status,
    occurred_on: value.occurredOn,
    availability: value.availability || null,
    suggested_agape_id: value.suggestedAgapeId || null,
    notes: value.notes,
    next_contact_on: value.nextContactOn || null,
  });

  if (error) return { ok: false, message: error.message };
  revalidatePath("/conexion");
  return { ok: true, message: "Seguimiento registrado en el historial." };
}

/** Corrige un seguimiento sin perder su autor ni su fecha de creación. */
export async function updateConnectionFollowup(input: unknown): Promise<ConnectionResult> {
  await requireConnectionAccess();
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  }

  const value = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("connection_followups")
    .update({
      adolescent_id: value.adolescentId,
      status: value.status,
      occurred_on: value.occurredOn,
      availability: value.availability || null,
      suggested_agape_id: value.suggestedAgapeId || null,
      notes: value.notes,
      next_contact_on: value.nextContactOn || null,
    })
    .eq("id", value.id);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/conexion");
  return { ok: true, message: "Seguimiento actualizado." };
}

/** La eliminación queda reservada para administración por la política de la base de datos. */
export async function deleteConnectionFollowup(id: string): Promise<ConnectionResult> {
  const user = await requireConnectionAccess();
  if (user.role !== "admin") return { ok: false, message: "Solo administración puede eliminar seguimientos." };
  if (!z.uuid().safeParse(id).success) return { ok: false, message: "Seguimiento inválido." };

  const supabase = await createClient();
  const { error } = await supabase.from("connection_followups").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/conexion");
  return { ok: true, message: "Seguimiento eliminado." };
}
