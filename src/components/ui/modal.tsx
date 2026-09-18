"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Ancho máximo en escritorio. En celular siempre sube desde abajo. */
  size?: "md" | "lg";
};

/**
 * <dialog> nativo: el navegador gestiona foco, Escape y fondo.
 * En celular entra como hoja desde abajo; en escritorio, centrado.
 */
export function Modal({ open, onClose, title, description, children, size = "md" }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const max = size === "lg" ? "sm:max-w-2xl" : "sm:max-w-lg";

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className={`m-0 mt-auto max-h-[92dvh] w-full max-w-none rounded-t-3xl bg-white p-0 text-ink backdrop:bg-ink/40 sm:m-auto sm:rounded-3xl ${max}`}
    >
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-white px-5 pb-3 pt-5 sm:rounded-t-3xl">
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-bold leading-tight">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="-mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted hover:bg-paper hover:text-ink"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="px-5 pb-5 pt-4">{children}</div>
    </dialog>
  );
}
