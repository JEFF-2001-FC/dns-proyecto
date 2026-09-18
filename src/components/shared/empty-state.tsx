import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Qué se podrá hacer aquí: lista corta, para que la pantalla vacía explique el módulo. */
  bullets?: string[];
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, bullets, action, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-3xl border border-dashed border-line-strong bg-white px-6 py-12 text-center",
        className,
      )}
    >
      {Icon && (
        <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-paper text-subtle">
          <Icon className="h-7 w-7" aria-hidden />
        </span>
      )}
      <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
      {description && <p className="mt-1.5 max-w-md text-sm text-muted">{description}</p>}

      {bullets && bullets.length > 0 && (
        <ul className="mt-5 grid w-full max-w-lg gap-2 text-left">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 rounded-xl bg-paper px-3.5 py-2.5 text-sm text-ink">
              <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-flame" />
              {b}
            </li>
          ))}
        </ul>
      )}

      {action && <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}
