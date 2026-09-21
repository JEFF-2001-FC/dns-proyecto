"use client";

import { LoaderCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { setLeaderAccountAccess } from "../actions";

export function LeaderAccountToggle({ leaderId, enabled }: { leaderId: string; enabled: boolean }) {
  const [active, setActive] = useState(enabled);
  const [pending, startTransition] = useTransition();
  function change() {
    const next = !active;
    if (!next && !window.confirm("¿Inhabilitar esta cuenta? El líder ya no podrá ingresar a DNS hasta que la reactives.")) return;
    setActive(next);
    startTransition(async () => { const result = await setLeaderAccountAccess(leaderId, next); if (!result.ok) setActive(!next); });
  }
  return <button type="button" onClick={change} disabled={pending} className={`inline-flex h-8 items-center gap-2 rounded-full px-3 text-xs font-bold disabled:cursor-wait ${active ? "bg-[#E3F4E6] text-[#1E6B32]" : "bg-[#FDE8E4] text-[#9A2A10]"}`}><span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-[#2E7D32]" : "bg-[#C23A1A]"}`} />{active ? "Cuenta activa" : "Cuenta inhabilitada"}{pending && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}</button>;
}
