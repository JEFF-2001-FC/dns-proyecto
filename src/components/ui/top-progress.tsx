"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

/** Barra fina animada. `active` la muestra (p. ej. mientras se envía un formulario). */
export function TopProgress({ active, className }: { active: boolean; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[90] h-[3px] overflow-hidden transition-opacity duration-200",
        active ? "opacity-100" : "opacity-0",
        className,
      )}
    >
      <div className="h-full w-2/5 animate-progress rounded-full bg-flame" />
    </div>
  );
}

/**
 * Barra de carga entre páginas: se activa al tocar un enlace interno
 * y se oculta cuando cambia la ruta. Manipula el DOM directamente (sin re-render).
 */
export function RouteProgress() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const timeout = useRef<number | undefined>(undefined);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    bar.style.opacity = "0";
    window.clearTimeout(timeout.current);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as HTMLElement | null)?.closest("a");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      const bar = barRef.current;
      if (!bar) return;
      bar.style.opacity = "1";
      // Seguridad: si la navegación falla, ocultar a los 10 s
      window.clearTimeout(timeout.current);
      timeout.current = window.setTimeout(() => (bar.style.opacity = "0"), 10000);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden
      style={{ opacity: 0 }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-[3px] overflow-hidden transition-opacity duration-200"
    >
      <div className="h-full w-2/5 animate-progress rounded-full bg-flame" />
    </div>
  );
}