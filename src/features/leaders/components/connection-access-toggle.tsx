"use client";

import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { setLeaderConnectionAccess } from "../actions";

export function ConnectionAccessToggle({
  leaderId,
  enabled,
}: {
  leaderId: string;
  enabled: boolean;
}) {
  const [active, setActive] = useState(enabled);
  const [pending, startTransition] = useTransition();

  function change() {
    const next = !active;
    setActive(next);
    startTransition(async () => {
      const result = await setLeaderConnectionAccess(leaderId, next);
      if (!result.ok) setActive(!next);
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={`Acceso a Conexión: ${active ? "activo" : "inactivo"}`}
      onClick={change}
      disabled={pending}
      className={`inline-flex h-8 items-center gap-2 rounded-full px-3 text-xs font-bold transition-colors disabled:cursor-wait ${
        active
          ? "bg-[#E3F4E6] text-[#1E6B32]"
          : "bg-paper text-muted hover:bg-line"
      }`}
    >
      <span className={`h-3 w-3 rounded-full ${active ? "bg-[#2E7D32]" : "bg-[#A8A49C]"}`} />
      Conexión {active ? "activa" : "inactiva"}
      {pending && <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden />}
    </button>
  );
}
