"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/require-user";
import { createAdminClient } from "@/lib/supabase/admin";

const profileSchema = z.object({ firstName: z.string().trim().min(2).max(80), lastName: z.string().trim().min(2).max(80), phone: z.string().trim().max(20) });

export async function updateMyProfile(formData: FormData) {
  const user = await requireUser();
  const parsed = profileSchema.safeParse({ firstName: formData.get("first_name"), lastName: formData.get("last_name"), phone: formData.get("phone") });
  if (!parsed.success) throw new Error("Revisa tu nombre y celular.");
  const { firstName, lastName, phone } = parsed.data;
  const admin = createAdminClient();
  const { error: profileError } = await admin.from("profiles").update({ full_name: `${firstName} ${lastName}` }).eq("id", user.id);
  if (profileError) throw new Error(profileError.message);
  const { error: leaderError } = await admin.from("leaders").update({ first_name: firstName, last_name: lastName, phone: phone || null }).eq("profile_id", user.id);
  if (leaderError) throw new Error(leaderError.message);
  revalidatePath("/perfil"); revalidatePath("/lideres"); revalidatePath("/inicio");
}

export async function renameMyAgape(agapeId: string, formData: FormData) {
  const user = await requireUser();
  const name = z.string().trim().min(3).max(120).safeParse(formData.get("name"));
  if (!z.uuid().safeParse(agapeId).success || !name.success) throw new Error("Escribe un nombre de ágape válido.");
  const admin = createAdminClient();
  const { data: leader } = await admin.from("leaders").select("id").eq("profile_id", user.id).maybeSingle();
  if (!leader) throw new Error("Tu cuenta no tiene una ficha de líder vinculada.");
  const { data: assignment } = await admin.from("leader_agape_assignments").select("leader_id").eq("leader_id", leader.id).eq("agape_id", agapeId).is("ended_on", null).maybeSingle();
  if (!assignment) throw new Error("No puedes editar un ágape que no tienes asignado.");
  const { error } = await admin.from("agapes").update({ name: name.data }).eq("id", agapeId);
  if (error) throw new Error(error.message);
  revalidatePath("/perfil"); revalidatePath("/lideres"); revalidatePath("/inicio");
}
