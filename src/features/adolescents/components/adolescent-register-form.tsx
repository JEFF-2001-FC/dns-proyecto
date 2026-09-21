"use client";

import Link from "next/link";
import { FormEvent, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { registerAdolescent } from "../actions";

type Option = { id: string; name: string };

export function AdolescentRegisterForm({ agapes, clans, relationships }: { agapes: Option[]; clans: Option[]; relationships: Option[] }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    startTransition(async () => {
      const result = await registerAdolescent(Object.fromEntries(new FormData(form)));
      setMessage({ ok: result.ok, text: result.message });
      if (result.ok) form.reset();
    });
  }
  return <form onSubmit={submit} className="space-y-5">
    <section className="rounded-3xl border border-line bg-white p-5"><h2 className="font-display text-xl font-bold">Datos personales</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><Field label="Nombres" htmlFor="firstName"><Input id="firstName" name="firstName" required maxLength={60} /></Field><Field label="Apellidos" htmlFor="lastName"><Input id="lastName" name="lastName" required maxLength={60} /></Field><Field label="Sexo" htmlFor="sex"><Select id="sex" name="sex" required defaultValue=""><option value="" disabled>Selecciona</option><option value="female">Femenino</option><option value="male">Masculino</option></Select></Field><Field label="Fecha de nacimiento" htmlFor="birthDate" hint="Opcional"><Input id="birthDate" name="birthDate" type="date" /></Field><Field label="Celular" htmlFor="phone" hint="Opcional"><Input id="phone" name="phone" type="tel" maxLength={20} /></Field><Field label="Colegio" htmlFor="schoolName" hint="Opcional"><Input id="schoolName" name="schoolName" maxLength={120} /></Field></div></section>
    <section className="rounded-3xl border border-line bg-white p-5"><h2 className="font-display text-xl font-bold">Grupo</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><Field label="Ágape" htmlFor="agapeId"><Select id="agapeId" name="agapeId" required defaultValue=""><option value="" disabled>Selecciona un ágape</option>{agapes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></Field><Field label="Clan" htmlFor="clanId"><Select id="clanId" name="clanId" required defaultValue=""><option value="" disabled>Selecciona un clan</option>{clans.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></Field></div></section>
    <section className="rounded-3xl border border-line bg-white p-5"><h2 className="font-display text-xl font-bold">Apoderado</h2><p className="mt-1 text-sm text-muted">Opcional, pero recomendado para mantener contacto.</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><Field label="Nombres" htmlFor="guardianFirstName"><Input id="guardianFirstName" name="guardianFirstName" maxLength={60} /></Field><Field label="Apellidos" htmlFor="guardianLastName"><Input id="guardianLastName" name="guardianLastName" maxLength={60} /></Field><Field label="Celular" htmlFor="guardianPhone"><Input id="guardianPhone" name="guardianPhone" type="tel" maxLength={20} /></Field><Field label="Parentesco" htmlFor="guardianRelationshipId"><Select id="guardianRelationshipId" name="guardianRelationshipId" defaultValue=""><option value="">Selecciona</option>{relationships.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></Field></div></section>
    {message && <p role="status" className={`rounded-xl px-3 py-2 text-sm font-medium ${message.ok ? "bg-[#E3F4E6] text-[#1E6B32]" : "bg-[#FDE8E4] text-[#9A2A10]"}`}>{message.text}</p>}
    <div className="flex justify-end gap-2"><Link href="/adolescentes" className="rounded-xl px-4 py-2 text-sm font-semibold text-muted hover:bg-paper">Cancelar</Link><Button type="submit" loading={pending} loadingText="Guardando…">Registrar adolescente</Button></div>
  </form>;
}
