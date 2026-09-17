import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";

export const getProfile = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, active")
    .eq("id", user.id)
    .single();

  return data;
});

export async function requireUser() {
  const profile = await getProfile();
  if (!profile || !profile.active) redirect("/login");
  return profile;
}
