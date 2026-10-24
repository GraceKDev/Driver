import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "marker"
  | "ink"
  | "paper"
  | "outline"
  | "ghost"
  | "danger"
  | "sticky";

export type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm";

const baseClasses =
  "inline-flex select-none items-center justify-center gap-2 rounded-[10px] border font-sans font-semibold leading-none tracking-[-0.01em] disabled:cursor-not-allowed disabled:opacity-45";

const variantClasses: Record<ButtonVariant, string> = {
  marker:
    "border-marker bg-marker text-paper shadow-[0_1px_2px_rgb(36_33_28_/_0.12)] hover:bg-[#8f3d27]",
  ink: "border-ink bg-ink text-paper shadow-[0_1px_2px_rgb(36_33_28_/_0.12)] hover:bg-ink-soft",
  paper:
    "border-line bg-paper-light text-ink shadow-[0_1px_2px_rgb(36_33_28_/_0.04)] hover:border-ink/25 hover:bg-paper",
  outline:
    "border-line bg-transparent text-ink hover:border-ink/25 hover:bg-paper-light",
  ghost: "border-transparent bg-transparent text-ink-soft hover:bg-ink/5 hover:text-ink",
  danger:
    "border-marker/25 bg-transparent text-marker hover:border-marker/40 hover:bg-accent-soft",
  sticky:
    "border-transparent bg-sticky text-ink shadow-[0_1px_2px_rgb(36_33_28_/_0.08)] hover:bg-[#e0b85b]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-[15px]",
  icon: "h-10 w-10 p-0",
  "icon-sm": "h-8 w-8 p-0",
};

export function buttonClasses({
  variant = "paper",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return cn(baseClasses, variantClasses[variant], sizeClasses[size], className);
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "paper", size = "md", type = "button", ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses({ variant, size, className })}
        {...props}
      />
    );
  },
);
