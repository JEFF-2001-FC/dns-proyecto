"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";
import { registerVisitor } from "../actions";
import type { ClanOption, RosterItem } from "../types";

type Props = {
  open: boolean;
  onClose: () => void;
  onAdded: (item: RosterItem) => void;
  clans: ClanOption[];
  meeting: { agapeId: string; meetingTypeId: string; date: string; topic: string };
  defaultClanId?: string;
};

const input =
  "h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus-visible:border-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900/15";

export function ExpressRegisterDialog({ open, onClose, onAdded, clans, meeting, defaultClanId }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  // Sincroniza el <dialog> nativo (foco, Escape y fondo gestionados por el navegador)
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function submit(formData: FormData) {
    const get = (k: string) => String(formData.get(k) ?? "").trim();
    startTransition(async () => {
      const res = await registerVisitor({
        ...meeting,
        firstName: get("firstName"),
        lastName: get("lastName"),
        sex: get("sex") as "male" | "female",
        clanId: get("clanId"),
        phone: get("phone") || undefined,
        guardianPhone: get("guardianPhone") || undefined,
      });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setError("");
      onAdded(res.data);
      onClose();
    });
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="m-0 mt-auto w-full max-w-none rounded-t-3xl p-0 backdrop:bg-zinc-950/40 sm:m-auto sm:max-w-lg sm:rounded-3xl"
    >
      <form action={submit} className="p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Registro express</h2>
            <p className="text-sm text-zinc-500">Se agrega a la lista y queda marcado presente.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full p-2 hover:bg-zinc-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-zinc-700">Nombres</span>
            <input name="firstName" required autoComplete="off" className={input} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-zinc-700">Apellidos</span>
            <input name="lastName" required autoComplete="off" className={input} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-zinc-700">Sexo</span>
            <select name="sex" required defaultValue="" className={input}>
              <option value="" disabled>Elige</option>
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-zinc-700">Clan</span>
            <select name="clanId" required defaultValue={defaultClanId ?? ""} className={input}>
              <option value="" disabled>Elige</option>
              {clans.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-zinc-700">Celular</span>
            <input name="phone" type="tel" inputMode="tel" autoComplete="off" className={input} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-zinc-700">Tel. apoderado</span>
            <input name="guardianPhone" type="tel" inputMode="tel" autoComplete="off" className={input} />
          </label>
        </div>

        {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="mt-5 h-12 w-full rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {pending ? "Registrando…" : "Registrar y marcar presente"}
        </button>
      </form>
    </dialog>
  );
}
