"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/require-role";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";

const registrationSchema = z.object({
  firstName: z.string().trim().min(2).max(60),
  lastName: z.string().trim().min(2).max(60),
  sex: z.enum(["male", "female"]),
  birthDate: z.union([z.iso.date(), z.literal("")]).optional(),
  phone: z.string().trim().max(20).optional(),
  schoolName: z.string().trim().max(120).optional(),
  agapeId: z.uuid(),
  clanId: z.uuid(),
  guardianFirstName: z.string().trim().max(60).optional(),
  guardianLastName: z.string().trim().max(60).optional(),
  guardianPhone: z.string().trim().max(20).optional(),
  guardianRelationshipId: z.union([z.uuid(), z.literal("")]).optional(),
});

const updateSchema = registrationSchema.extend({
  guardianName: z.string().trim().max(120).optional(),
  guardianRelationshipId: z.union([z.uuid(), z.literal("")]).optional(),
});

export async function updateAdolescent(adolescentId: string, input: unknown): Promise<{ ok: boolean; message: string }> {
  const user = await requireUser();
  if (!z.uuid().safeParse(adolescentId).success) return { ok: false, message: "Adolescente no válido." };
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Revisa los datos del adolescente." };
  const value = parsed.data;
  if (value.birthDate && value.birthDate > new Date().toISOString().slice(0, 10)) return { ok: false, message: "La fecha de nacimiento no puede ser futura." };
  const supabase = await createClient();

  const { data: current, error: currentError } = await supabase.from("adolescents").select("id").eq("id", adolescentId).maybeSingle();
  if (currentError || !current) return { ok: false, message: "No se encontró el adolescente o no tienes acceso a sus datos." };
  if (user.role !== "admin") {
    const { data: assignment } = await supabase.from("adolescent_agape_memberships").select("agape_id").eq("adolescent_id", adolescentId).is("ended_on", null).maybeSingle();
    if (!assignment || assignment.agape_id !== value.agapeId) return { ok: false, message: "Solo puedes editar adolescentes de tus ágapes." };
  }

  const { error } = await supabase.rpc("update_adolescent_profile", {
    p_adolescent_id: adolescentId, p_first_name: value.firstName, p_last_name: value.lastName,
    p_sex: value.sex, p_birth_date: value.birthDate || null, p_phone: value.phone || null,
    p_school_name: value.schoolName || null, p_agape_id: value.agapeId, p_clan_id: value.clanId,
    p_guardian_name: value.guardianName || null, p_guardian_phone: value.guardianPhone || null,
    p_guardian_relationship_id: value.guardianRelationshipId || null,
  });
  if (error) return { ok: false, message: error.message.includes("42501") ? "No tienes permiso para editar este adolescente." : "No se pudieron guardar los cambios." };

  revalidatePath("/adolescentes");
  revalidatePath(`/adolescentes/${adolescentId}`);
  revalidatePath("/asistencia");
  return { ok: true, message: "Datos del adolescente actualizados." };
}

export async function registerAdolescent(input: unknown): Promise<{ ok: boolean; message: string }> {
  const user = await requireUser();
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Revisa los datos obligatorios del adolescente." };
  const value = parsed.data;
  if (value.birthDate && value.birthDate > new Date().toISOString().slice(0, 10)) {
    return { ok: false, message: "La fecha de nacimiento no puede ser futura." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("register_adolescent", {
    p_agape_id: value.agapeId,
    p_clan_id: value.clanId,
    p_first_name: value.firstName,
    p_last_name: value.lastName,
    p_sex: value.sex,
    p_birth_date: value.birthDate || undefined,
    p_phone: value.phone || undefined,
    p_school_name: value.schoolName || undefined,
    p_guardian: value.guardianPhone ? {
      first_name: value.guardianFirstName || "Apoderado",
      last_name: value.guardianLastName || "",
      phone: value.guardianPhone,
      relationship_id: value.guardianRelationshipId || "",
    } : undefined,
  });
  if (error) return { ok: false, message: error.code === "23505" ? "Ya existe un adolescente con esos datos." : error.message };

  revalidatePath("/adolescentes");
  revalidatePath("/admin/aprobaciones");
  revalidatePath("/inicio");
  return { ok: true, message: "Adolescente registrado." };
}

export async function reviewAdolescent(adolescentId: string, approve: boolean, reason?: string): Promise<{ ok: boolean; message: string }> {
  await requireRole("admin");
  if (!z.uuid().safeParse(adolescentId).success) return { ok: false, message: "Registro no válido." };
  if (!approve && !reason?.trim()) return { ok: false, message: "Indica el motivo del rechazo." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("review_adolescent", {
    p_adolescent_id: adolescentId,
    p_approve: approve,
    p_reason: reason?.trim() || undefined,
  });
  if (error) return { ok: false, message: error.message };
  revalidatePath("/adolescentes");
  revalidatePath("/admin/aprobaciones");
  revalidatePath("/inicio");
  return { ok: true, message: approve ? "Adolescente aprobado." : "Adolescente rechazado." };
}
