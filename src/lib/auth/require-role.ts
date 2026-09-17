import { redirect } from "next/navigation";
import { requireUser, type AppRole, type SessionUser } from "./require-user";

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
