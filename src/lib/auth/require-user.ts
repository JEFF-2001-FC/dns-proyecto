import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export type SessionUser = {
  id: string;
  email: string | null;
  full_name: string;
  role: AppRole;
  active: boolean;
};

/**
 * Usuario de la sesión + su perfil. `cache` hace que layout, página y acciones
 * compartan una sola consulta por request.
 * Devuelve null si no hay sesión o si el usuario no tiene fila en `profiles`.
 */
export const getProfile = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email ?? user.email ?? null,
    full_name: profile.full_name,
    role: profile.role,
    active: profile.active,
  };
});

export async function requireUser(): Promise<SessionUser> {
  const profile = await getProfile();

  if (!profile) redirect("/login?error=sin-perfil");
  if (!profile.active) redirect("/login?error=inactivo");

  return profile;
}
