"use client";

import { useState, useTransition } from "react";
import { KeyRound, ShieldCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { CreateAgapeButton } from "./create-agape-button";
import { Select } from "@/components/ui/select";
import { createLeader } from "../actions";

type Option = { id: string; name: string };
type Assignment = { id: string; role: "lead" | "assistant" };

export function LeaderManager({ agapes, clans }: { agapes: Option[]; clans: Option[] }) {
  const [open, setOpen] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  function close() {
    if (!pending) {
      setOpen(false);
      setMessage(null);
      setAssignments([]);
    }
  }

  function toggle(id: string) {
    setAssignments((current) => current.some((item) => item.id === id)
      ? current.filter((item) => item.id !== id)
      : [...current, { id, role: "lead" }]);
  }

  function changeRole(id: string, role: Assignment["role"]) {
    setAssignments((current) => current.map((item) => item.id === id ? { ...item, role } : item));
  }

  function submit(formData: FormData) {
    const value = (name: string) => String(formData.get(name) ?? "").trim();
    start(async () => {
      const result = await createLeader({
        firstName: value("firstName"), lastName: value("lastName"), email: value("email"),
        phone: value("phone") || undefined, sex: value("sex") as "female" | "male",
        password: value("password"), clanId: value("clanId") || undefined, agapes: assignments,
      });
      setMessage({ ok: result.ok, text: result.message });
      if (result.ok) {
        (document.getElementById("new-leader-form") as HTMLFormElement | null)?.reset();
        setAssignments([]);
      }
    });
  }

  return <>
    <Button size="lg" onClick={() => setOpen(true)}><UserPlus className="h-[18px] w-[18px]" aria-hidden />Nuevo líder</Button>
    <Modal open={open} onClose={close} title="Registrar líder" description="Ficha, acceso y asignaciones en un solo paso." size="lg">
      <form id="new-leader-form" action={submit} className="space-y-6">
        <section className="space-y-3">
          <Step number="1" title="Datos personales" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nombre" htmlFor="leader-first-name"><Input id="leader-first-name" name="firstName" placeholder="Ej. Andrea" required maxLength={80} /></Field>
            <Field label="Apellido" htmlFor="leader-last-name"><Input id="leader-last-name" name="lastName" placeholder="Ej. Rojas" required maxLength={80} /></Field>
            <Field label="Celular" htmlFor="leader-phone" hint="Opcional"><Input id="leader-phone" name="phone" type="tel" inputMode="tel" maxLength={20} /></Field>
            <Field label="Sexo" htmlFor="leader-sex"><Select id="leader-sex" name="sex" defaultValue="" required><option value="" disabled>Selecciona una opción</option><option value="female">Femenino</option><option value="male">Masculino</option></Select></Field>
          </div>
        </section>

        <section className="space-y-3 border-t border-line pt-5">
          <Step number="2" title="Cuenta de acceso" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Correo" htmlFor="leader-email"><Input id="leader-email" name="email" type="email" placeholder="nombre@correo.com" required /></Field>
            <Field label="Contraseña temporal" htmlFor="leader-password" hint="Mínimo 8 caracteres."><Input id="leader-password" name="password" type="password" minLength={8} autoComplete="new-password" required /></Field>
          </div>
          <p className="flex gap-2 rounded-2xl bg-[#E6EEF8] px-3.5 py-3 text-sm text-[#16457E]"><KeyRound className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />Comparte la contraseña solo con el líder. Podrá cambiarla después desde recuperación de contraseña.</p>
        </section>

        <section className="space-y-3 border-t border-line pt-5">
          <Step number="3" title="Lugar en el ministerio" />
          <p className="text-sm text-muted">Selecciona todos los ágapes que dirigirá. Solo verá los adolescentes de estos grupos.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {agapes.map((agape) => {
              const assignment = assignments.find((item) => item.id === agape.id);
              return <div key={agape.id} className={`rounded-2xl border p-3 transition-colors ${assignment ? "border-ink bg-paper" : "border-line bg-white"}`}>
                <label className="flex cursor-pointer items-center gap-2.5 font-semibold text-ink"><input type="checkbox" checked={Boolean(assignment)} onChange={() => toggle(agape.id)} className="h-4 w-4 accent-[#E8491D]" />{agape.name}</label>
                {assignment && <Select aria-label={`Rol en ${agape.name}`} value={assignment.role} onChange={(event) => changeRole(agape.id, event.target.value as Assignment["role"])} className="mt-3 h-10 rounded-xl text-sm"><option value="lead">Líder principal</option><option value="assistant">Co-líder</option></Select>}
              </div>;
            })}
          </div>
          <CreateAgapeButton />
          <Field label="Clan" htmlFor="leader-clan" hint="Opcional; es independiente del ágape."><Select id="leader-clan" name="clanId" defaultValue=""><option value="">Sin clan por ahora</option>{clans.map((clan) => <option key={clan.id} value={clan.id}>{clan.name}</option>)}</Select></Field>
        </section>

        {message && <p role="status" className={`rounded-2xl px-4 py-3 text-sm font-medium ${message.ok ? "bg-[#E3F4E6] text-[#1E6B32]" : "bg-[#FDE8E4] text-[#9A2A10]"}`}>{message.text}</p>}
        <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end"><Button type="button" variant="ghost" onClick={close} disabled={pending}>Cancelar</Button><Button type="submit" size="lg" loading={pending} loadingText="Creando cuenta…"><ShieldCheck className="h-[18px] w-[18px]" aria-hidden />Crear líder y acceso</Button></div>
      </form>
    </Modal>
  </>;
}

function Step({ number, title }: { number: string; title: string }) {
  return <div className="flex items-center gap-2 text-sm font-bold text-ink"><span className="grid h-7 w-7 place-items-center rounded-full bg-paper">{number}</span>{title}</div>;
}
