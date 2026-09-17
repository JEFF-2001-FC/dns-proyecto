"use client";

import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center">
      <TriangleAlert className="mx-auto h-8 w-8 text-amber-500" aria-hidden />
      <h1 className="mt-4 text-lg font-semibold text-zinc-900">No se pudo cargar esta sección</h1>
      <p className="mt-1 text-sm text-zinc-500">Revisa tu conexión e inténtalo otra vez. Si se repite, avisa al administrador.</p>
      {error.digest && <p className="mt-2 text-xs text-zinc-400">Código: {error.digest}</p>}
      <button
        onClick={reset}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
      >
        <RotateCcw className="h-4 w-4" aria-hidden /> Reintentar
      </button>
    </div>
  );
}
