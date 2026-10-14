"use client";

import Link from "next/link";
import { FormEvent, useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { registerAdolescent } from "../actions";

type Option = { id: string; name: string };

export function AdolescentRegisterForm({
  agapes,
  clans,
  relationships,
}: {
  agapes: Option[];
  clans: Option[];
  relationships: Option[];
}) {
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

  return (
    <form onSubmit={submit} className="space-y-5">
      <section className="rounded-3xl border border-line bg-[#FFFDF8] p-5">
        <h2 className="font-display text-2xl font-bold text-ink">Ficha rápida de ingreso</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Primero registra los datos mínimos del adolescente. Luego, desde su ficha, puedes completar salud, familia, estudios y seguimiento.
        </p>
      </section>

      <Section title="1. Datos del adolescente" description="Estos campos identifican a la persona dentro del ministerio.">
        <Field label="Nombres" htmlFor="firstName" hint="Como aparece en su documento o como se registrará en DNS.">
          <Input id="firstName" name="firstName" placeholder="Ej. José Luis" required maxLength={60} />
        </Field>
        <Field label="Apellidos" htmlFor="lastName">
          <Input id="lastName" name="lastName" placeholder="Ej. Flores Ramos" required maxLength={60} />
        </Field>
        <Field label="Sexo" htmlFor="sex">
          <Select id="sex" name="sex" required defaultValue="">
            <option value="" disabled>Selecciona una opción</option>
            <option value="female">Femenino</option>
            <option value="male">Masculino</option>
          </Select>
        </Field>
        <Field label="Fecha de nacimiento" htmlFor="birthDate" hint="Opcional; sirve para calcular la edad.">
          <Input id="birthDate" name="birthDate" type="date" />
        </Field>
        <Field label="Celular del adolescente" htmlFor="phone" hint="Opcional; si no tiene, déjalo vacío.">
          <Input id="phone" name="phone" type="tel" inputMode="tel" placeholder="Ej. 987654321" maxLength={20} />
        </Field>
        <Field label="Colegio o centro de estudios" htmlFor="schoolName" hint="Opcional.">
          <Input id="schoolName" name="schoolName" placeholder="Ej. I.E. Santa Rosa" maxLength={120} />
        </Field>
      </Section>

      <Section title="2. Ubicación en DNS" description="El ágape define quién lo acompaña; el clan ayuda para reportes y actividades.">
        <Field label="Ágape" htmlFor="agapeId" hint="El grupo donde será acompañado.">
          <Select id="agapeId" name="agapeId" required defaultValue="">
            <option value="" disabled>Selecciona un ágape</option>
            {agapes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </Select>
        </Field>
        <Field label="Clan" htmlFor="clanId" hint="Selecciona el clan actual.">
          <Select id="clanId" name="clanId" required defaultValue="">
            <option value="" disabled>Selecciona un clan</option>
            {clans.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </Select>
        </Field>
      </Section>

      <Section title="3. Apoderado" description="Opcional, pero recomendado para contacto y autorización.">
        <Field label="Nombres del apoderado" htmlFor="guardianFirstName">
          <Input id="guardianFirstName" name="guardianFirstName" placeholder="Ej. María Elena" maxLength={60} />
        </Field>
        <Field label="Apellidos del apoderado" htmlFor="guardianLastName">
          <Input id="guardianLastName" name="guardianLastName" placeholder="Ej. Ramos Peña" maxLength={60} />
        </Field>
        <Field label="Celular del apoderado" htmlFor="guardianPhone" hint="Si llenas este campo, se guarda el apoderado.">
          <Input id="guardianPhone" name="guardianPhone" type="tel" inputMode="tel" placeholder="Ej. 999888777" maxLength={20} />
        </Field>
        <Field label="Parentesco" htmlFor="guardianRelationshipId">
          <Select id="guardianRelationshipId" name="guardianRelationshipId" defaultValue="">
            <option value="">Selecciona si corresponde</option>
            {relationships.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </Select>
        </Field>
      </Section>

      {message && (
        <p role="status" className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium ${message.ok ? "bg-[#E3F4E6] text-[#1E6B32]" : "bg-[#FDE8E4] text-[#9A2A10]"}`}>
          {message.ok && <CheckCircle2 className="h-4 w-4" aria-hidden />}
          {message.text}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 rounded-3xl border border-line bg-white p-4 sm:flex-row sm:justify-end">
        <Link href="/adolescentes" className="inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-semibold text-muted hover:bg-paper">
          Cancelar
        </Link>
        <Button type="submit" loading={pending} loadingText="Guardando...">Registrar adolescente</Button>
      </div>
    </form>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-white p-5">
      <div className="mb-4">
        <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
