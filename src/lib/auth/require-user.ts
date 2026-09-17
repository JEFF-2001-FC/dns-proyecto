import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";

export const getProfile = cache(async () => {
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

  return {
    id: user.id,
    email: user.email,
    role: profile?.role ?? "user",
    active: profile?.active ?? true,
    ...profile,
  };
});

export async function requireUser() {
  const profile = await getProfile();

  if (!profile || profile.active === false) {
    redirect("/login");
  }

  return profile;
}
