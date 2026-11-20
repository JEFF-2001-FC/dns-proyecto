"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { updateAdolescent } from "../actions";

type Option = { id: string; name: string };
export type AdolescentEditData = {
  id: string; first_name: string; last_name: string; sex: "male" | "female"; birth_date: string | null;
  phone: string | null; school_name: string | null; agape_id: string; clan_id: string;
  guardian_name: string | null; guardian_phone: string | null; guardian_relationship_id: string | null;
};

export function EditAdolescentDialog({ adolescent, agapes, clans, relationships }: {
  adolescent: AdolescentEditData; agapes: Option[]; clans: Option[]; relationships: Option[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await updateAdolescent(adolescent.id, Object.fromEntries(formData));
      setMessage(result.message);
      if (result.ok) setOpen(false);
    });
  }

  return <>
    <button type="button" onClick={() => { setMessage(null); setOpen(true); }} className="inline-flex items-center gap-1 font-semibold underline underline-offset-2">
      <Pencil aria-hidden className="h-3.5 w-3.5" /> Editar datos
    </button>
    {message && <span role="status" className="sr-only">{message}</span>}
    <Modal open={open} onClose={() => setOpen(false)} title="Editar adolescente" description="Actualiza sus datos personales y su ubicación en DNS." size="lg">
      <form action={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombres" htmlFor={`first-${adolescent.id}`}><Input id={`first-${adolescent.id}`} name="firstName" required maxLength={60} defaultValue={adolescent.first_name} /></Field>
          <Field label="Apellidos" htmlFor={`last-${adolescent.id}`}><Input id={`last-${adolescent.id}`} name="lastName" required maxLength={60} defaultValue={adolescent.last_name} /></Field>
          <Field label="Sexo" htmlFor={`sex-${adolescent.id}`}><Select id={`sex-${adolescent.id}`} name="sex" defaultValue={adolescent.sex}><option value="female">Femenino</option><option value="male">Masculino</option></Select></Field>
          <Field label="Fecha de nacimiento" htmlFor={`birth-${adolescent.id}`}><Input id={`birth-${adolescent.id}`} name="birthDate" type="date" defaultValue={adolescent.birth_date ?? ""} /></Field>
          <Field label="Celular" htmlFor={`phone-${adolescent.id}`}><Input id={`phone-${adolescent.id}`} name="phone" type="tel" maxLength={20} defaultValue={adolescent.phone ?? ""} /></Field>
          <Field label="Colegio o centro de estudios" htmlFor={`school-${adolescent.id}`}><Input id={`school-${adolescent.id}`} name="schoolName" maxLength={120} defaultValue={adolescent.school_name ?? ""} /></Field>
          <Field label="Ágape" htmlFor={`agape-${adolescent.id}`}><Select id={`agape-${adolescent.id}`} name="agapeId" defaultValue={adolescent.agape_id}>{agapes.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</Select></Field>
          <Field label="Clan" htmlFor={`clan-${adolescent.id}`}><Select id={`clan-${adolescent.id}`} name="clanId" defaultValue={adolescent.clan_id}>{clans.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</Select></Field>
          <Field label="Nombre del apoderado" htmlFor={`guardian-name-${adolescent.id}`}><Input id={`guardian-name-${adolescent.id}`} name="guardianName" maxLength={120} defaultValue={adolescent.guardian_name ?? ""} /></Field>
          <Field label="Celular del apoderado" htmlFor={`guardian-phone-${adolescent.id}`}><Input id={`guardian-phone-${adolescent.id}`} name="guardianPhone" type="tel" maxLength={20} defaultValue={adolescent.guardian_phone ?? ""} /></Field>
          <Field label="Parentesco" htmlFor={`relationship-${adolescent.id}`}><Select id={`relationship-${adolescent.id}`} name="guardianRelationshipId" defaultValue={adolescent.guardian_relationship_id ?? ""}><option value="">Sin especificar</option>{relationships.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</Select></Field>
        </div>
        {message && <p role="status" className="text-sm text-danger">{message}</p>}
        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button type="submit" loading={pending} loadingText="Guardando...">Guardar cambios</Button>
        </div>
      </form>
    </Modal>
  </>;
}
