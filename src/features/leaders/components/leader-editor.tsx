"use client";

import { useMemo, useState, useTransition } from "react";
import { Edit3, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { updateLeader } from "../actions";

type Option = { id: string; name: string };
type Assignment = { id: string; role: "lead" | "assistant" };
type Leader = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sex: "female" | "male";
  profileId: string | null;
  accountEnabled: boolean;
  connectionEnabled: boolean;
  clanId: string;
  agapes: Assignment[];
};

export function LeaderEditor({
  leader,
  agapes,
  clans,
}: {
  leader: Leader;
  agapes: Option[];
  clans: Option[];
}) {
  const [open, setOpen] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>(leader.agapes);
  const [accountEnabled, setAccountEnabled] = useState(leader.accountEnabled);
  const [connectionEnabled, setConnectionEnabled] = useState(leader.connectionEnabled);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const title = useMemo(() => `${leader.firstName} ${leader.lastName}`.trim(), [leader.firstName, leader.lastName]);

  function close() {
    if (pending) return;
    setOpen(false);
    setMessage(null);
    setAssignments(leader.agapes);
    setAccountEnabled(leader.accountEnabled);
    setConnectionEnabled(leader.connectionEnabled);
  }

  function toggle(id: string) {
    setAssignments((current) =>
      current.some((item) => item.id === id)
        ? current.filter((item) => item.id !== id)
        : [...current, { id, role: "lead" }],
    );
  }

  function changeRole(id: string, role: Assignment["role"]) {
    setAssignments((current) => current.map((item) => item.id === id ? { ...item, role } : item));
  }

  function submit(formData: FormData) {
    const value = (name: string) => String(formData.get(name) ?? "").trim();
    start(async () => {
      const result = await updateLeader({
        id: leader.id,
        firstName: value("firstName"),
        lastName: value("lastName"),
        email: value("email"),
        phone: value("phone") || undefined,
        sex: value("sex") as "female" | "male",
        clanId: value("clanId"),
        agapes: assignments,
        accountEnabled,
        connectionEnabled,
      });
      setMessage({ ok: result.ok, text: result.message });
      if (result.ok) setOpen(false);
    });
  }

  return (
    <>
      <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Edit3 className="h-4 w-4" aria-hidden />
        Editar
      </Button>
      <Modal open={open} onClose={close} title={`Editar ${title}`} description="Datos, ágapes y accesos del líder." size="lg">
        <form action={submit} className="space-y-6">
          <section className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nombre" htmlFor={`first-name-${leader.id}`}>
                <Input id={`first-name-${leader.id}`} name="firstName" defaultValue={leader.firstName} required maxLength={80} />
              </Field>
              <Field label="Apellido" htmlFor={`last-name-${leader.id}`}>
                <Input id={`last-name-${leader.id}`} name="lastName" defaultValue={leader.lastName} required maxLength={80} />
              </Field>
              <Field label="Correo" htmlFor={`email-${leader.id}`} hint={leader.profileId ? "También actualiza el usuario de acceso." : "Si no tiene cuenta, úsalo para crearla en Supabase."}>
                <Input id={`email-${leader.id}`} name="email" type="email" defaultValue={leader.email} />
              </Field>
              <Field label="Celular" htmlFor={`phone-${leader.id}`} hint="Opcional">
                <Input id={`phone-${leader.id}`} name="phone" type="tel" inputMode="tel" defaultValue={leader.phone} maxLength={20} />
              </Field>
              <Field label="Sexo" htmlFor={`sex-${leader.id}`}>
                <Select id={`sex-${leader.id}`} name="sex" defaultValue={leader.sex} required>
                  <option value="female">Femenino</option>
                  <option value="male">Masculino</option>
                </Select>
              </Field>
              <Field label="Clan" htmlFor={`clan-${leader.id}`} hint="Independiente del ágape.">
                <Select id={`clan-${leader.id}`} name="clanId" defaultValue={leader.clanId}>
                  <option value="">Sin clan</option>
                  {clans.map((clan) => <option key={clan.id} value={clan.id}>{clan.name}</option>)}
                </Select>
              </Field>
            </div>
          </section>

          <section className="space-y-3 border-t border-line pt-5">
            <h3 className="text-sm font-bold text-ink">Ágapes que dirige</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {agapes.map((agape) => {
                const assignment = assignments.find((item) => item.id === agape.id);
                return (
                  <div key={agape.id} className={`rounded-2xl border p-3 transition-colors ${assignment ? "border-ink bg-paper" : "border-line bg-white"}`}>
                    <label className="flex cursor-pointer items-center gap-2.5 font-semibold text-ink">
                      <input type="checkbox" checked={Boolean(assignment)} onChange={() => toggle(agape.id)} className="h-4 w-4 accent-[#E8491D]" />
                      {agape.name}
                    </label>
                    {assignment && (
                      <Select aria-label={`Rol en ${agape.name}`} value={assignment.role} onChange={(event) => changeRole(agape.id, event.target.value as Assignment["role"])} className="mt-3 h-10 rounded-xl text-sm">
                        <option value="lead">Líder principal</option>
                        <option value="assistant">Co-líder</option>
                      </Select>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="space-y-3 border-t border-line pt-5">
            <h3 className="text-sm font-bold text-ink">Accesos</h3>
            <label className={`flex items-start gap-3 rounded-2xl border p-4 ${leader.profileId ? "border-line bg-white" : "border-line bg-paper text-muted"}`}>
              <input type="checkbox" checked={accountEnabled} disabled={!leader.profileId} onChange={(event) => setAccountEnabled(event.target.checked)} className="mt-1 h-4 w-4 accent-[#E8491D]" />
              <span>
                <span className="block font-semibold text-ink">Puede entrar a DNS</span>
                <span className="text-sm">Al desactivarlo, su cuenta queda inhabilitada y no podrá iniciar sesión.</span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4">
              <input type="checkbox" checked={connectionEnabled} onChange={(event) => setConnectionEnabled(event.target.checked)} className="mt-1 h-4 w-4 accent-[#E8491D]" />
              <span>
                <span className="block font-semibold text-ink">Acceso al módulo Conexión</span>
                <span className="text-sm text-muted">Permite gestionar seguimiento de conexión.</span>
              </span>
            </label>
          </section>

          {message && <p role="status" className={`rounded-2xl px-4 py-3 text-sm font-medium ${message.ok ? "bg-[#E3F4E6] text-[#1E6B32]" : "bg-[#FDE8E4] text-[#9A2A10]"}`}>{message.text}</p>}
          <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={close} disabled={pending}>Cancelar</Button>
            <Button type="submit" size="lg" loading={pending} loadingText="Guardando...">
              <Save className="h-[18px] w-[18px]" aria-hidden />
              Guardar cambios
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
