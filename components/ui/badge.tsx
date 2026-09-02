import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "success" | "danger" | "warning" | "muted";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variants: Record<BadgeVariant, string> = {
  default: "bg-foreground text-background",
  success: "bg-success/10 text-success",
  danger: "bg-danger/10 text-danger",
  warning: "bg-amber-100 text-amber-800",
  muted: "bg-muted text-muted-foreground"
};

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.08em]",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
