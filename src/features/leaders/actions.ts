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

const assignmentSchema = z.object({ id: z.string().uuid(), role: z.enum(["lead", "assistant"]) });
const updateSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(80),
  email: z.email().optional().or(z.literal("")),
  password: z.string().max(72).optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional(),
  sex: z.enum(["female", "male"]),
  clanId: z.string().uuid().optional().or(z.literal("")),
  agapes: z.array(assignmentSchema),
  accountEnabled: z.boolean(),
  connectionEnabled: z.boolean(),
});

export type UpdateLeaderInput = z.infer<typeof updateSchema>;

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

const agapeSchema = z.string().trim().min(3, "Escribe un nombre de al menos 3 caracteres").max(120);

export async function createAgape(name: string): Promise<{ ok: boolean; message: string }> {
  await requireRole("admin");
  const parsed = agapeSchema.safeParse(name);
  if (!parsed.success) return { ok: false, message: "Escribe un nombre de ágape válido." };

  const admin = createAdminClient();
  const { error } = await admin.from("agapes").insert({ name: parsed.data, active: true });
  if (error) {
    return {
      ok: false,
      message: error.code === "23505" ? "Ya existe un ágape con ese nombre." : error.message,
    };
  }

  revalidatePath("/lideres");
  return { ok: true, message: `Ágape “${parsed.data}” creado. Ahora puedes seleccionarlo.` };
}

function limaDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function updateLeader(input: UpdateLeaderInput): Promise<CreateLeaderResult> {
  await requireRole("admin");
  const parsed = updateSchema.safeParse({
    ...input,
    email: input.email?.trim().toLowerCase() || "",
    password: input.password?.trim() || "",
    phone: input.phone?.trim() || undefined,
    clanId: input.clanId || "",
  });
  if (!parsed.success) return { ok: false, message: "Revisa los datos del líder." };

  const data = parsed.data;
  const admin = createAdminClient();
  const email = data.email || null;
  const password = data.password || "";
  const fullName = `${data.firstName} ${data.lastName}`.trim();

  const { data: leader, error: leaderError } = await admin
    .from("leaders")
    .select("id, profile_id")
    .eq("id", data.id)
    .maybeSingle();
  if (leaderError || !leader) return { ok: false, message: "No se encontró el líder." };

  if (email) {
    const { data: duplicate } = await admin
      .from("leaders")
      .select("id")
      .ilike("email", email)
      .neq("id", data.id)
      .maybeSingle();
    if (duplicate) return { ok: false, message: "Otro líder ya usa ese correo." };
  }

  const { error: updateError } = await admin
    .from("leaders")
    .update({
      first_name: data.firstName,
      last_name: data.lastName,
      email,
      phone: data.phone || null,
      sex: data.sex,
      status: data.accountEnabled ? "active" : "inactive",
      connection_enabled: data.connectionEnabled,
    })
    .eq("id", data.id);
  if (updateError) return { ok: false, message: updateError.message };

  if (leader.profile_id) {
    const { error: profileError } = await admin
      .from("profiles")
      .update({ full_name: fullName, email, active: data.accountEnabled })
      .eq("id", leader.profile_id);
    if (profileError) return { ok: false, message: profileError.message };

    const { error: authError } = await admin.auth.admin.updateUserById(leader.profile_id, {
      email: email ?? undefined,
      user_metadata: { full_name: fullName },
    });
    if (authError) return { ok: false, message: authError.message };
  } else if (email || password) {
    if (!email) return { ok: false, message: "Escribe un correo para crear la cuenta de acceso." };
    if (password.length < 8) return { ok: false, message: "La contraseña temporal debe tener al menos 8 caracteres." };

    const { data: account, error: accountError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (accountError || !account.user) {
      return { ok: false, message: accountError?.message ?? "No se pudo crear la cuenta de acceso." };
    }

    const removeAccount = () => admin.auth.admin.deleteUser(account.user.id);
    const { error: profileError } = await admin
      .from("profiles")
      .update({ full_name: fullName, email, active: data.accountEnabled })
      .eq("id", account.user.id);
    if (profileError) {
      await removeAccount();
      return { ok: false, message: profileError.message };
    }

    const { error: linkError } = await admin
      .from("leaders")
      .update({ profile_id: account.user.id, status: data.accountEnabled ? "active" : "inactive" })
      .eq("id", data.id);
    if (linkError) {
      await removeAccount();
      return { ok: false, message: linkError.message };
    }
  }

  const today = limaDate();
  const { data: currentAgapes, error: agapesError } = await admin
    .from("leader_agape_assignments")
    .select("id, agape_id, role")
    .eq("leader_id", data.id)
    .is("ended_on", null);
  if (agapesError) return { ok: false, message: agapesError.message };

  const wanted = new Map(data.agapes.map((item) => [item.id, item.role]));
  const active = currentAgapes ?? [];
  const keep = new Set<string>();
  for (const row of active) {
    const nextRole = wanted.get(row.agape_id);
    if (nextRole === row.role) {
      keep.add(row.agape_id);
      continue;
    }
    const { error } = await admin.from("leader_agape_assignments").update({ ended_on: today }).eq("id", row.id);
    if (error) return { ok: false, message: error.message };
  }

  const inserts = data.agapes
    .filter((item) => !keep.has(item.id))
    .map((item) => ({ leader_id: data.id, agape_id: item.id, role: item.role }));
  if (inserts.length) {
    const { error } = await admin.from("leader_agape_assignments").insert(inserts);
    if (error) return { ok: false, message: error.message };
  }

  const { data: currentClan, error: clanError } = await admin
    .from("leader_clan_memberships")
    .select("id, clan_id")
    .eq("leader_id", data.id)
    .is("ended_on", null)
    .maybeSingle();
  if (clanError) return { ok: false, message: clanError.message };

  const nextClan = data.clanId || null;
  if ((currentClan?.clan_id ?? null) !== nextClan) {
    if (currentClan) {
      const { error } = await admin.from("leader_clan_memberships").update({ ended_on: today }).eq("id", currentClan.id);
      if (error) return { ok: false, message: error.message };
    }
    if (nextClan) {
      const { error } = await admin.from("leader_clan_memberships").insert({ leader_id: data.id, clan_id: nextClan });
      if (error) return { ok: false, message: error.message };
    }
  }

  revalidatePath("/lideres");
  revalidatePath("/inicio");
  revalidatePath("/conexion");
  return { ok: true, message: "Líder actualizado." };
}

export async function setLeaderConnectionAccess(
  leaderId: string,
  enabled: boolean,
): Promise<{ ok: boolean; message: string }> {
  await requireRole("admin");
  if (!z.uuid().safeParse(leaderId).success) {
    return { ok: false, message: "Líder no válido." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("leaders")
    .update({ connection_enabled: enabled })
    .eq("id", leaderId);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/lideres");
  revalidatePath("/inicio");
  revalidatePath("/conexion");
  return { ok: true, message: enabled ? "Acceso a Conexión activado." : "Acceso a Conexión desactivado." };
}

/** Activa o bloquea el acceso completo de un líder a DNS. */
export async function setLeaderAccountAccess(leaderId: string, enabled: boolean): Promise<{ ok: boolean; message: string }> {
  await requireRole("admin");
  if (!z.uuid().safeParse(leaderId).success) return { ok: false, message: "Líder no válido." };
  const admin = createAdminClient();
  const { data: leader, error: leaderError } = await admin.from("leaders").select("profile_id").eq("id", leaderId).maybeSingle();
  if (leaderError || !leader?.profile_id) return { ok: false, message: "Este líder aún no tiene una cuenta vinculada." };
  const { error: profileError } = await admin.from("profiles").update({ active: enabled }).eq("id", leader.profile_id);
  if (profileError) return { ok: false, message: profileError.message };
  const { error: statusError } = await admin.from("leaders").update({ status: enabled ? "active" : "inactive" }).eq("id", leaderId);
  if (statusError) return { ok: false, message: statusError.message };
  revalidatePath("/lideres");
  revalidatePath("/inicio");
  return { ok: true, message: enabled ? "Cuenta reactivada." : "Cuenta inhabilitada. Ya no podrá entrar a DNS." };
}
