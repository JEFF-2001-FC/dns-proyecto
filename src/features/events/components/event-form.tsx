"use client";

import { FormEvent, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createEvent } from "../actions";

type Option = { id: string; name: string; kind: "agape" | "clan" };
export function EventForm({ targets, isAdmin }: { targets: Option[]; isAdmin: boolean }) {
  const [scope, setScope] = useState<"general" | "clan" | "agape">(isAdmin ? "general" : "agape");
  const [pending, start] = useTransition(); const [message, setMessage] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = event.currentTarget; const raw = Object.fromEntries(new FormData(form)); const startsAt = String(raw.startsAt); const endsAt = String(raw.endsAt || ""); start(async () => { const result = await createEvent({ ...raw, startsAt: startsAt ? new Date(startsAt).toISOString() : "", endsAt: endsAt ? new Date(endsAt).toISOString() : "" }); setMessage(result.message); if (result.ok) form.reset(); }); }
  const applicable = targets.filter((item) => item.kind === scope);
  return <form onSubmit={submit} className="space-y-4 rounded-3xl border border-line bg-white p-5"><h2 className="font-display text-xl font-bold">Crear evento</h2><div className="grid gap-3 sm:grid-cols-2"><Field label="Título" htmlFor="title"><Input id="title" name="title" required maxLength={160} /></Field><Field label="Alcance" htmlFor="scope"><Select id="scope" name="scope" value={scope} onChange={(event) => setScope(event.target.value as typeof scope)}>{isAdmin && <option value="general">Todo el ministerio</option>}<option value="agape">Mi ágape</option><option value="clan">Mi clan</option></Select></Field>{scope !== "general" && <Field label={scope === "agape" ? "Ágape" : "Clan"} htmlFor="targetId"><Select id="targetId" name="targetId" required defaultValue=""><option value="" disabled>Selecciona</option>{applicable.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></Field>}<Field label="Lugar" htmlFor="location" hint="Opcional"><Input id="location" name="location" maxLength={180} /></Field><Field label="Inicio" htmlFor="startsAt"><Input id="startsAt" name="startsAt" type="datetime-local" required /></Field><Field label="Fin" htmlFor="endsAt" hint="Opcional"><Input id="endsAt" name="endsAt" type="datetime-local" /></Field></div><Field label="Descripción" htmlFor="description" hint="Opcional"><textarea id="description" name="description" rows={3} maxLength={2000} className="w-full rounded-xl border border-line px-3 py-2 text-sm" /></Field>{message && <p role="status" className="text-sm text-muted">{message}</p>}<Button type="submit" loading={pending} loadingText="Guardando…">{isAdmin ? "Publicar evento" : "Enviar para aprobación"}</Button></form>;
}
