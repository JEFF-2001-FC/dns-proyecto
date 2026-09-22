"use client";

import { FormEvent, useState, useTransition } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { deleteConnectionFollowup, updateConnectionFollowup } from "../actions";

type Adolescent = { id: string; fullName: string };
type Agape = { id: string; name: string };
type Followup = {
  id: string;
  adolescentId: string;
  status: "new" | "contacted" | "scheduled" | "referred" | "closed";
  occurredOn: string;
  availability: string | null;
  suggestedAgapeId: string | null;
  notes: string;
  nextContactOn: string | null;
};

export function ConnectionFollowupManager({ followup, adolescents, agapes }: { followup: Followup; adolescents: Adolescent[]; agapes: Agape[] }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    startTransition(async () => {
      const result = await updateConnectionFollowup({ ...values, id: followup.id });
      setMessage(result.message);
      if (result.ok) setEditing(false);
    });
  }

  function remove() {
    if (!window.confirm("¿Eliminar este seguimiento? Esta acción no se puede deshacer.")) return;
    startTransition(async () => setMessage((await deleteConnectionFollowup(followup.id)).message));
  }

  if (!editing) return (
    <div className="mt-3 flex flex-wrap gap-2">
      <Button type="button" variant="secondary" size="sm" onClick={() => { setEditing(true); setMessage(null); }}><Pencil className="h-4 w-4" /> Editar</Button>
      <Button type="button" variant="danger" size="sm" loading={pending} loadingText="Eliminando…" onClick={remove}><Trash2 className="h-4 w-4" /> Eliminar</Button>
      {message && <p role="status" className="basis-full text-sm text-muted">{message}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} className="mt-4 space-y-3 rounded-2xl border border-line bg-paper p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3"><p className="font-bold">Editar seguimiento</p><Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}><X className="h-4 w-4" /> Cancelar</Button></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Adolescente" htmlFor={`followup-adolescent-${followup.id}`}><Select id={`followup-adolescent-${followup.id}`} name="adolescentId" defaultValue={followup.adolescentId}>{adolescents.map((item) => <option key={item.id} value={item.id}>{item.fullName}</option>)}</Select></Field>
        <Field label="Resultado" htmlFor={`followup-status-${followup.id}`}><Select id={`followup-status-${followup.id}`} name="status" defaultValue={followup.status}><option value="new">Pendiente de contactar</option><option value="contacted">Contactado</option><option value="scheduled">Contacto programado</option><option value="referred">Ágape sugerido</option><option value="closed">Seguimiento cerrado</option></Select></Field>
        <Field label="Fecha de contacto" htmlFor={`followup-date-${followup.id}`}><Input id={`followup-date-${followup.id}`} name="occurredOn" type="date" defaultValue={followup.occurredOn} required /></Field>
        <Field label="Próximo contacto" htmlFor={`followup-next-${followup.id}`} hint="Opcional"><Input id={`followup-next-${followup.id}`} name="nextContactOn" type="date" defaultValue={followup.nextContactOn ?? ""} /></Field>
        <Field label="Ágape sugerido" htmlFor={`followup-agape-${followup.id}`} hint="Opcional"><Select id={`followup-agape-${followup.id}`} name="suggestedAgapeId" defaultValue={followup.suggestedAgapeId ?? ""}><option value="">Aún sin sugerencia</option>{agapes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></Field>
      </div>
      <Field label="Disponibilidad" htmlFor={`followup-availability-${followup.id}`}><textarea id={`followup-availability-${followup.id}`} name="availability" rows={2} maxLength={500} defaultValue={followup.availability ?? ""} className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink" /></Field>
      <Field label="Resumen" htmlFor={`followup-notes-${followup.id}`}><textarea id={`followup-notes-${followup.id}`} name="notes" rows={4} minLength={3} maxLength={2000} defaultValue={followup.notes} required className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink" /></Field>
      {message && <p role="status" className="text-sm text-muted">{message}</p>}
      <Button type="submit" loading={pending} loadingText="Guardando…">Guardar cambios</Button>
    </form>
  );
}
