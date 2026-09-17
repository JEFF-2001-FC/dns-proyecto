"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BYE_COOKIE, WELCOME_COOKIE } from "./constants";

export type LoginState = { error: string | null; email: string };

const firstName = (fullName: string | null | undefined) =>
  (fullName ?? "").trim().split(/\s+/)[0] ?? "";

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Escribe tu correo y tu contraseña.", email };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: "Correo o contraseña incorrectos.", email };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", data.user.id)
    .maybeSingle();

  const cookieStore = await cookies();
  cookieStore.set(
    WELCOME_COOKIE,
    encodeURIComponent(firstName(profile?.full_name)),
    {
      path: "/",
      maxAge: 60,
      sameSite: "lax",
      httpOnly: false, // lo borra el navegador después de mostrar el aviso
    },
  );

  redirect("/inicio");
}

export async function signOut() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let name = "";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();
    name = firstName(profile?.full_name);
  }

  await supabase.auth.signOut();

  const cookieStore = await cookies();
  cookieStore.set(
    BYE_COOKIE,
    JSON.stringify({ name, email: user?.email ?? "" }),
    {
      path: "/login",
      maxAge: 60,
      sameSite: "lax",
      httpOnly: true,
    },
  );

  redirect("/login");
}
