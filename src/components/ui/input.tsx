import { cn } from "@/lib/cn";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-[52px] w-full rounded-2xl border-[1.5px] border-line-strong bg-white px-4 text-base text-ink outline-none transition-colors placeholder:text-subtle",
        "focus:border-ink focus-visible:outline-none disabled:bg-paper disabled:text-subtle aria-[invalid=true]:border-danger",
        className,
      )}
      {...props}
    />
  );
}

type FieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  /** Contenido a la derecha de la etiqueta, p. ej. "¿La olvidaste?" */
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function Field({
  label,
  htmlFor,
  error,
  hint,
  aside,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
          {label}
        </label>
        {aside}
      </div>
      {children}
      {error ? (
        <p className="text-sm text-danger">{error}</p>
      ) : hint ? (
        <p className="text-sm text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
