import { redirect } from "next/navigation";
import { requireUser, type AppRole, type SessionUser } from "./require-user";
import { createClient } from "@/lib/supabase/server";

/**
 * Exige uno o varios roles. Reutiliza la sesión en caché de requireUser.
 * Uso: await requireRole("admin")  ·  await requireRole(["admin", "leader"])
 */
export async function requireRole(roles: AppRole | AppRole[]): Promise<{ user: SessionUser; profile: SessionUser }> {
  const user = await requireUser();
  const allowed = Array.isArray(roles) ? roles : [roles];

  if (!allowed.includes(user.role)) redirect("/inicio");

  return { user, profile: user };
}

/** Exige el permiso puntual de Conexión; el admin conserva acceso total. */
export async function requireConnectionAccess(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role === "admin") return user;

  const supabase = await createClient();
  const { data } = await supabase
    .from("leaders")
    .select("connection_enabled")
    .eq("profile_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!data?.connection_enabled) redirect("/inicio");
  return user;
}
