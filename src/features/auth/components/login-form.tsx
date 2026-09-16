"use client";

import { useState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [error, setError] = useState("");
  async function action(formData: FormData) {
    setError("");
    const result = await login(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <form action={action} className="rounded-2xl bg-white p-6 shadow-2xl">
      <label className="block text-sm font-medium">Correo</label>
      <input name="email" type="email" required className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-zinc-500" placeholder="lider@dns.org" />
      <label className="mt-5 block text-sm font-medium">Contraseña</label>
      <input name="password" type="password" required className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-zinc-500" placeholder="••••••••" />
      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button className="mt-6 w-full rounded-xl bg-zinc-950 px-4 py-3 font-medium text-white hover:bg-zinc-800">Ingresar</button>
    </form>
  );
}
