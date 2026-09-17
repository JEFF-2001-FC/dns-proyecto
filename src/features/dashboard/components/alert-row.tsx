import Link from "next/link";
import { Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Alerta = {
  id: string;
  severity: "info" | "warning" | "critical";
  absences: number | null;
  name: string;
  agape: string | null;
  phone: string | null;
};

const TONE = {
  critical: "critical",
  warning: "warning",
  info: "info",
} as const;

/** Fila de alerta con botón para llamar al apoderado. */
export function AlertRow({ alerta }: { alerta: Alerta }) {
  const callLink = alerta.phone
    ? ["tel", alerta.phone.replace(/\s+/g, "")].join(":")
    : null;

  return (
    <div className="flex items-center gap-2.5">
      <Badge tone={TONE[alerta.severity]}>
        {(alerta.absences ?? "?") + " faltas"}
      </Badge>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{alerta.name}</p>
        {alerta.agape ? (
          <p className="truncate text-xs text-muted">{alerta.agape}</p>
        ) : null}
      </div>
      {callLink ? (
        <Link
          href={callLink}
          prefetch={false}
          aria-label={"Llamar al apoderado de " + alerta.name}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-line px-2.5 text-sm font-semibold hover:bg-paper"
        >
          <Phone className="h-4 w-4" aria-hidden />
          Llamar
        </Link>
      ) : null}
    </div>
  );
}
