import { cn } from "@/lib/cn";

type Props = {
  /** Línea pequeña sobre el título: sección o contexto. */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Botones a la derecha (o debajo, en celular). */
  action?: React.ReactNode;
  className?: string;
};

export function PageHeader({ eyebrow, title, description, action, className }: Props) {
  return (
    <header className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-subtle">{eyebrow}</p>
        )}
        <h1 className="font-display text-[32px] font-extrabold leading-tight text-ink sm:text-[38px]">
          {title}
        </h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
    </header>
  );
}
