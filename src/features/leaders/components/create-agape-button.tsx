"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAgape } from "../actions";

export function CreateAgapeButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    start(async () => {
      const result = await createAgape(name);
      setMessage({ ok: result.ok, text: result.message });
      if (result.ok) {
        setName("");
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-2xl border border-dashed border-line-strong bg-paper p-3.5">
      {!open ? (
        <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden />
          Crear otro ágape
        </Button>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); submit(); } }}
            placeholder="Ej. Alexis y Jefferson"
            aria-label="Nombre del nuevo ágape"
            maxLength={120}
            autoFocus
          />
          <Button type="button" onClick={submit} loading={pending} loadingText="Creando…" disabled={!name.trim()}>
            Crear
          </Button>
          <Button type="button" variant="ghost" onClick={() => { setOpen(false); setMessage(null); }} disabled={pending}>
            Cancelar
          </Button>
        </div>
      )}
      {message && <p role="status" className={`mt-2 text-sm font-medium ${message.ok ? "text-[#1E6B32]" : "text-danger"}`}>{message.text}</p>}
    </div>
  );
}
