"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { reviewAdolescent } from "../actions";

export function ReviewActions({ adolescentId }: { adolescentId: string }) {
  const [pending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [message, setMessage] = useState("");
  function review(approve: boolean) { startTransition(async () => { const result = await reviewAdolescent(adolescentId, approve, reason); setMessage(result.message); }); }
  return <div className="mt-3"><div className="flex flex-wrap gap-2"><Button size="sm" loading={pending} onClick={() => review(true)}>Aprobar</Button><Button size="sm" variant="secondary" disabled={pending} onClick={() => setRejecting(true)}>Rechazar</Button></div>{rejecting && <div className="mt-3 flex flex-wrap gap-2"><input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Motivo del rechazo" className="min-w-56 flex-1 rounded-xl border border-line px-3 py-2 text-sm" /><Button size="sm" variant="danger" disabled={pending || !reason.trim()} onClick={() => review(false)}>Confirmar rechazo</Button></div>}{message && <p role="status" className="mt-2 text-sm text-muted">{message}</p>}</div>;
}
