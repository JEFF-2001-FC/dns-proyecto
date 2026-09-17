import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  title: string;
  value: number | string;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  /** "dark" = tarjeta negra para destacar (p. ej. alertas) */
  tone?: "light" | "dark";
  className?: string;
  children?: React.ReactNode;
};

export function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  tone = "light",
  className,
  children,
}: Props) {
  const dark = tone === "dark";
  return (
    <div
      className={cn(
        "rounded-3xl p-4 sm:p-5",
        dark ? "bg-ink text-white" : "border border-line bg-white",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn("text-sm", dark ? "text-[#C9C5BD]" : "text-muted")}>
          {title}
        </span>
        {Icon && (
          <Icon
            className={cn("h-5 w-5", dark ? "text-[#C9C5BD]" : "text-subtle")}
            aria-hidden
          />
        )}
      </div>
      <div className="flex items-end justify-between gap-3">
        <p className="mt-1 font-display text-[40px] font-bold leading-tight sm:text-[44px]">
          {value}
        </p>
        {children}
      </div>
      {hint && (
        <div
          className={cn(
            "text-[13px] font-semibold",
            dark ? "text-flame-soft" : "text-muted",
          )}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
