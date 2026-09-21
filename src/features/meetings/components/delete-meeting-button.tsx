"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteMeeting } from "../actions";

export function DeleteMeetingButton({ meetingId }: { meetingId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  function remove() { startTransition(async () => { const result = await deleteMeeting(meetingId); setMessage(result.message); }); }
  if (!confirming) return <Button size="sm" variant="ghost" onClick={() => setConfirming(true)}>Eliminar</Button>;
  return <div className="flex flex-wrap items-center gap-2"><span className="text-xs text-danger">¿Eliminar reunión y asistencias?</span><Button size="sm" variant="danger" loading={pending} onClick={remove}>Sí, eliminar</Button><Button size="sm" variant="secondary" disabled={pending} onClick={() => setConfirming(false)}>Cancelar</Button>{message && <span role="status" className="text-xs text-muted">{message}</span>}</div>;
}
