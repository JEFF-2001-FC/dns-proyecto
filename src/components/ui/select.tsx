import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <span className="relative block">
      <select
        className={cn(
          "h-[52px] w-full appearance-none rounded-2xl border-[1.5px] border-line-strong bg-white px-4 pr-11 text-base text-ink outline-none transition-colors",
          "focus:border-ink disabled:bg-paper disabled:text-subtle aria-[invalid=true]:border-danger",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-subtle"
      />
    </span>
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-[96px] w-full rounded-2xl border-[1.5px] border-line-strong bg-white px-4 py-3 text-base text-ink outline-none transition-colors placeholder:text-subtle",
        "focus:border-ink disabled:bg-paper disabled:text-subtle aria-[invalid=true]:border-danger",
        className,
      )}
      {...props}
    />
  );
}
