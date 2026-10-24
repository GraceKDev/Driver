import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function AuthPanel({
  title,
  description,
  children,
  footer,
  className,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      <div className="paper-card paper-shadow-lg p-6 sm:p-8">
        <span
          aria-hidden="true"
          className="mb-6 block h-1 w-12 rounded-full bg-marker"
        />
        <h1 className="max-w-[20rem] font-display text-[2.4rem] leading-[1.02] tracking-[-0.035em] text-ink sm:text-[2.7rem]">
          {title}
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
          {description}
        </p>

        <div className="mt-7">{children}</div>
      </div>

      <div className="mt-6 text-center">{footer}</div>
    </div>
  );
}
