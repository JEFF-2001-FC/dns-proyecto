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
  return { ok: true, message: user.role === "admin" ? "Adolescente registrado." : "Registro enviado para aprobación del administrador." };
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
