"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteAdolescent } from "../actions";

export function DeleteAdolescentButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function remove() {
    if (!window.confirm(`¿Eliminar a ${name}? También se eliminarán sus asistencias, seguimientos y ficha personal. Esta acción no se puede deshacer.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteAdolescent(id);
      if (!result.ok) setError(result.message);
    });
  }

  return <span className="inline-flex flex-col items-start">
    <button type="button" onClick={remove} disabled={pending} className="inline-flex items-center gap-1 font-semibold text-danger underline underline-offset-2 disabled:opacity-60">
      <Trash2 aria-hidden className="h-3.5 w-3.5" /> {pending ? "Eliminando…" : "Eliminar"}
    </button>
    {error && <span role="alert" className="text-xs text-danger">{error}</span>}
  </span>;
}
