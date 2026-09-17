import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Spinner } from "./spinner";

export const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-2 rounded-2xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-ink text-white hover:bg-ink-soft",
        secondary: "border border-line-strong bg-white text-ink hover:bg-paper",
        danger: "bg-danger text-white hover:bg-[#912018]",
        flame: "bg-flame text-ink hover:bg-flame-soft",
        ghost: "text-ink hover:bg-ink/5",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-sm",
        lg: "h-[54px] px-5 text-base",
      },
      block: { true: "w-full" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Props = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    loadingText?: string;
  };

export function Button({
  className,
  variant,
  size,
  block,
  loading,
  loadingText,
  disabled,
  children,
  ...props
}: Props) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, block }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner className="h-5 w-5" />}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}
