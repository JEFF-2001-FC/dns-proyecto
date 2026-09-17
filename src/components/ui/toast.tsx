"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/cn";

type Tone = "success" | "info" | "error";
type Toast = { id: number; title: string; description?: string; tone: Tone };
type ToastInput = Omit<Toast, "id" | "tone"> & { tone?: Tone };

const ToastContext = createContext<(toast: ToastInput) => void>(() => {});

const DURATION = 4000;

const TONE = {
  success: { icon: CheckCircle2, iconClass: "text-[#1E7A34]", bar: "bg-[#1E7A34]" },
  info: { icon: Info, iconClass: "text-[#16457E]", bar: "bg-[#16457E]" },
  error: { icon: TriangleAlert, iconClass: "text-danger", bar: "bg-danger" },
} as const;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-2), { id, tone: "success", ...input }]);
      window.setTimeout(() => dismiss(id), DURATION);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 p-3 sm:items-end sm:p-5"
      >
        {toasts.map((t) => {
          const { icon: Icon, iconClass, bar } = TONE[t.tone];
          return (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto w-full max-w-sm animate-toast-in overflow-hidden rounded-2xl bg-white shadow-[0_12px_32px_rgba(14,14,16,0.25)]"
            >
              <div className="flex items-start gap-3 p-3.5">
                <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconClass)} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold text-ink">{t.title}</p>
                  {t.description && <p className="text-sm text-muted">{t.description}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  aria-label="Cerrar aviso"
                  className="-m-2 grid h-11 w-11 shrink-0 place-items-center rounded-xl text-muted hover:text-ink"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <div className="h-[3px] bg-paper">
                <div className={cn("h-[3px] animate-toast-timer", bar)} />
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

/** Muestra un aviso una sola vez al montar (bienvenida, despedida). Opcionalmente borra la cookie que lo originó. */
export function ToastOnMount({ clearCookie, ...input }: ToastInput & { clearCookie?: string }) {
  const toast = useToast();
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;
    shown.current = true;
    toast(input);
    if (clearCookie) document.cookie = `${clearCookie}=; Max-Age=0; path=/`;
    // Solo al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}