import { cn } from "@/lib/cn";

/**
 * Insignia de clan.
 * Los colores viven en public.clans (color / color_soft / color_ink) y llegan
 * desde la vista v_adolescents. La paleta de abajo es solo un respaldo para
 * cuando la fila no trae tokens (clan recién creado a mano, datos antiguos).
 */
export const CLAN_FALLBACK = {
  aguilas: { color: "#C62828", soft: "#FDE8E4", ink: "#9A2A10" },
  bufalos: { color: "#E0A100", soft: "#FDF1D8", ink: "#7A4B00" },
  mustangs: { color: "#2E7D32", soft: "#E3F4E6", ink: "#1E6B32" },
  osos: { color: "#1F5FAD", soft: "#E6EEF8", ink: "#16457E" },
} as const;

const NEUTRAL = { color: "#D8D3C9", soft: "#F5F3EE", ink: "#5E5A53" };

export type ClanTokens = {
  name?: string | null;
  slug?: string | null;
  color?: string | null;
  colorSoft?: string | null;
  colorInk?: string | null;
};

/** Resuelve los tres tokens: fila de la BD → respaldo por slug → neutro. */
export function clanTokens(clan?: ClanTokens | null) {
  const fallback = (clan?.slug && CLAN_FALLBACK[clan.slug as keyof typeof CLAN_FALLBACK]) || NEUTRAL;
  return {
    color: clan?.color ?? fallback.color,
    soft: clan?.colorSoft ?? fallback.soft,
    ink: clan?.colorInk ?? fallback.ink,
  };
}

export function ClanBadge({
  clan,
  className,
  emptyLabel = "Sin clan",
}: {
  clan?: ClanTokens | null;
  className?: string;
  emptyLabel?: string;
}) {
  const t = clanTokens(clan);
  const label = clan?.name ?? emptyLabel;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-0.5 text-xs font-bold",
        className,
      )}
      style={{ backgroundColor: t.soft, color: t.ink }}
    >
      <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: t.color }} />
      {label}
    </span>
  );
}

/** Barra vertical de color usada a la izquierda de cada fila de la lista. */
export function ClanBar({ clan, className }: { clan?: ClanTokens | null; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("h-8 w-1.5 shrink-0 rounded-full", className)}
      style={{ backgroundColor: clanTokens(clan).color }}
    />
  );
}
