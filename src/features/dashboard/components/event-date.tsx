import { cn } from "@/lib/cn";

const monthFmt = new Intl.DateTimeFormat("es-PE", { month: "short", timeZone: "America/Lima" });
const dayFmt = new Intl.DateTimeFormat("es-PE", { day: "2-digit", timeZone: "America/Lima" });

/** Bloque de fecha estilo calendario: OCT / 03. Usa el color del clan si el evento es de clan. */
export function EventDate({ iso, color, className }: { iso: string; color?: string | null; className?: string }) {
  const date = new Date(iso);
  return (
    <div
      className={cn("flex h-14 w-[52px] shrink-0 flex-col items-center justify-center rounded-xl text-white", className)}
      style={{ backgroundColor: color ?? "#0E0E10" }}
    >
      <span className={cn("text-[11px] font-semibold uppercase", !color && "text-flame-soft")}>
        {monthFmt.format(date).replace(".", "")}
      </span>
      <span className="font-display text-2xl font-bold leading-none">{dayFmt.format(date)}</span>
    </div>
  );
}