import { cn } from "@/lib/cn";

export function ClanDot({ color, className }: { color?: string | null; className?: string }) {
  return <span aria-hidden className={cn("inline-block h-2.5 w-2.5 shrink-0 rounded-full", className)} style={{ backgroundColor: color ?? "#D8D3C9" }} />;
}