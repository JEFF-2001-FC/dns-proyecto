"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(80),
  email: z.email(),
  phone: z.string().trim().max(20).optional(),
  sex: z.enum(["female", "male"]),
  password: z.string().min(8).max(72),
  clanId: z.string().uuid().optional(),
  agapes: z.array(z.object({ id: z.string().uuid(), role: z.enum(["lead", "assistant"]) })).min(1),
});

export type CreateLeaderInput = z.infer<typeof schema>;
export type CreateLeaderResult = { ok: boolean; message: string };

export async function createLeader(input: CreateLeaderInput): Promise<CreateLeaderResult> {
  await requireRole("admin");
  const parsed = schema.safeParse({ ...input, email: input.email?.trim().toLowerCase(), phone: input.phone?.trim() || undefined, clanId: input.clanId || undefined });
  if (!parsed.success) return { ok: false, message: "Revisa los campos obligatorios y la contraseña (mínimo 8 caracteres)." };

  const data = parsed.data;
  const admin = createAdminClient();
  const { data: duplicate } = await admin.from("leaders").select("id").ilike("email", data.email).maybeSingle();
  if (duplicate) return { ok: false, message: "Ya existe una ficha de líder con ese correo." };

  const { data: account, error: accountError } = await admin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: { full_name: `${data.firstName} ${data.lastName}`.trim() },
  });
  if (accountError || !account.user) return { ok: false, message: accountError?.message ?? "No se pudo crear la cuenta." };

  const removeAccount = () => admin.auth.admin.deleteUser(account.user.id);
  const { data: leader, error: leaderError } = await admin.from("leaders").insert({
    profile_id: account.user.id, first_name: data.firstName, last_name: data.lastName,
    email: data.email, phone: data.phone || null, sex: data.sex, status: "active",
  }).select("id").single();
  if (leaderError || !leader) {
    await removeAccount();
    return { ok: false, message: leaderError?.message ?? "No se pudo crear la ficha del líder." };
  }

  const { error: assignmentError } = await admin.from("leader_agape_assignments").insert(
    data.agapes.map((agape) => ({ leader_id: leader.id, agape_id: agape.id, role: agape.role })),
  );
  if (assignmentError) {
    await admin.from("leaders").delete().eq("id", leader.id);
    await removeAccount();
    return { ok: false, message: assignmentError.message };
  }
  if (data.clanId) {
    const { error: clanError } = await admin.from("leader_clan_memberships").insert({ leader_id: leader.id, clan_id: data.clanId });
    if (clanError) {
      await admin.from("leaders").delete().eq("id", leader.id);
      await removeAccount();
      return { ok: false, message: clanError.message };
    }
  }

  revalidatePath("/lideres");
  return { ok: true, message: `${data.firstName} ya tiene cuenta y acceso a DNS.` };
}
