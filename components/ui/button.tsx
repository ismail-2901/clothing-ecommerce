import { cloneElement, isValidElement, type ButtonHTMLAttributes, type ReactElement } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "solid" | "outline" | "ghost" | "gold";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type SlottableElement = ReactElement<{ className?: string }>;

const variants: Record<ButtonVariant, string> = {
  solid: "bg-foreground text-background hover:bg-stone-800 shadow-sm",
  outline: "border border-border bg-background text-foreground hover:bg-muted",
  ghost: "text-foreground hover:bg-muted",
  gold: "bg-amber-700 text-white hover:bg-amber-800 shadow-sm"
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base"
};

export function Button({
  asChild,
  className,
  variant = "solid",
  size = "md",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const buttonClassName = cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className
  );

  if (asChild && isValidElement(children)) {
    const child = children as SlottableElement;

    return cloneElement(child, {
      className: cn(buttonClassName, child.props.className)
    });
  }

  return (
    <button className={buttonClassName} type={type} {...props}>
      {children}
    </button>
  );
}

