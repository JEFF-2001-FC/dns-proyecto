import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva("inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-0.5 text-xs font-bold", {
  variants: {
    tone: {
      neutral: "bg-paper text-muted",
      critical: "bg-[#FDE8E4] text-[#9A2A10]",
      warning: "bg-[#FDF1D8] text-[#7A4B00]",
      success: "bg-[#E3F4E6] text-[#1E6B32]",
      info: "bg-[#E6EEF8] text-[#16457E]",
      flame: "bg-flame text-ink",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export function Badge({ className, tone, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}