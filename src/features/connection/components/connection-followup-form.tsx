"use client";

import { FormEvent, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { addConnectionFollowup } from "../actions";

type Adolescent = {
  id: string;
  fullName: string;
  status: string | null;
  phone: string | null;
  guardianPhone: string | null;
};

type Agape = { id: string; name: string };

export function ConnectionFollowupForm({
  adolescents,
  agapes,
  today,
}: {
  adolescents: Adolescent[];
  agapes: Agape[];
  today: string;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [selectedId, setSelectedId] = useState(adolescents[0]?.id ?? "");
  const selected = adolescents.find((item) => item.id === selectedId);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    startTransition(async () => {
      const result = await addConnectionFollowup(values);
      setMessage({ ok: result.ok, text: result.message });
      if (result.ok) {
        form.reset();
        setSelectedId(adolescents[0]?.id ?? "");
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-3xl border border-line bg-white p-4 sm:p-5">
      <div>
        <h2 className="font-display text-2xl font-bold">Nuevo seguimiento</h2>
        <p className="mt-1 text-sm text-muted">Cada registro se conserva en la trazabilidad del adolescente.</p>
      </div>

      <Field label="Adolescente" htmlFor="connection-adolescent">
        <Select id="connection-adolescent" name="adolescentId" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} required>
          {adolescents.map((adolescent) => (
            <option key={adolescent.id} value={adolescent.id}>
              {adolescent.fullName}{adolescent.status === "pending" ? " · pendiente" : ""}
            </option>
          ))}
        </Select>
      </Field>

      {selected && (selected.phone || selected.guardianPhone) && (
        <p className="rounded-2xl bg-paper px-3 py-2 text-sm text-muted">
          Contacto: {selected.phone ?? "—"}{selected.phone && selected.guardianPhone ? " · Apoderado: " : ""}{selected.guardianPhone ?? ""}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Resultado" htmlFor="connection-status">
          <Select id="connection-status" name="status" defaultValue="contacted">
            <option value="new">Pendiente de contactar</option>
            <option value="contacted">Contactado</option>
            <option value="scheduled">Contacto programado</option>
            <option value="referred">Ágape sugerido</option>
            <option value="closed">Seguimiento cerrado</option>
          </Select>
        </Field>
        <Field label="Fecha de contacto" htmlFor="connection-date">
          <Input id="connection-date" name="occurredOn" type="date" defaultValue={today} required />
        </Field>
        <Field label="Ágape sugerido" htmlFor="connection-agape" hint="Opcional">
          <Select id="connection-agape" name="suggestedAgapeId" defaultValue="">
            <option value="">Aún sin sugerencia</option>
            {agapes.map((agape) => <option key={agape.id} value={agape.id}>{agape.name}</option>)}
          </Select>
        </Field>
        <Field label="Próximo contacto" htmlFor="connection-next" hint="Opcional">
          <Input id="connection-next" name="nextContactOn" type="date" />
        </Field>
      </div>

      <Field label="Disponibilidad" htmlFor="connection-availability" hint="Días, horarios, zona o preferencias.">
        <textarea id="connection-availability" name="availability" rows={2} maxLength={500} className="w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-ink" />
      </Field>
      <Field label="Resumen" htmlFor="connection-notes">
        <textarea id="connection-notes" name="notes" rows={4} minLength={3} maxLength={2000} required className="w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-ink" placeholder="Qué se conversó, acuerdos y siguiente paso…" />
      </Field>

      {message && <p role="status" className={`rounded-xl px-3 py-2 text-sm font-medium ${message.ok ? "bg-[#E3F4E6] text-[#1E6B32]" : "bg-[#FDE8E4] text-[#9A2A10]"}`}>{message.text}</p>}
      <Button type="submit" loading={pending} loadingText="Guardando…" disabled={!selectedId}>Guardar seguimiento</Button>
    </form>
  );
}
