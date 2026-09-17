import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-shimmer rounded-xl bg-[linear-gradient(90deg,#E9E5DE_0%,#F6F4EF_50%,#E9E5DE_100%)] bg-[length:1200px_100%]",
        className,
      )}
    />
  );
}