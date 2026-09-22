"use client";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deleteEvent } from "../actions";
export function DeleteEventButton({ eventId }: { eventId: string }) { const [pending, start] = useTransition(); return <button type="button" disabled={pending} onClick={() => { if (window.confirm("¿Eliminar este evento? También se eliminarán sus recursos e inscripciones.")) start(() => deleteEvent(eventId)); }} className="inline-flex items-center gap-1 rounded-xl border border-[#F3C6BD] px-2.5 py-1.5 text-xs font-semibold text-[#9A2A10]"><Trash2 className="h-3.5 w-3.5" />{pending ? "Eliminando…" : "Eliminar"}</button>; }
