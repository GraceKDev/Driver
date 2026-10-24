import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type EmptyKind = "root" | "folder" | "trash" | "search";

function EmptyDoodle({ kind }: { kind: EmptyKind }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 150 110"
      fill="none"
      className="mx-auto h-24 w-36 text-ink/45"
    >
      {kind === "trash" ? (
        <>
          <path
            d="M47 34h56l-6 58H53z"
            fill="var(--color-manila)"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M41 30h68M62 30l4-9h18l4 9"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M65 48v30M76 48v30M87 48v30"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity=".45"
          />
        </>
      ) : kind === "search" ? (
        <>
          <path
            d="M38 38h48v45H38z"
            fill="var(--color-paper-light)"
            stroke="currentColor"
            strokeWidth="2.2"
          />
          <path
            d="M48 52h27M48 61h21M48 70h25"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity=".4"
          />
          <circle
            cx="88"
            cy="65"
            r="20"
            fill="var(--color-sticky)"
            fillOpacity=".35"
            stroke="currentColor"
            strokeWidth="2.2"
          />
          <path
            d="M102 80l16 16"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M88 57v11"
            stroke="var(--color-marker)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="88" cy="74" r="1.5" fill="var(--color-marker)" />
        </>
      ) : (
        <>
          <path
            d="M30 49h34l7-10h48v45H30z"
            fill="var(--color-manila)"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M30 58h88v33H30z"
            fill="var(--color-paper-light)"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M46 76c5-4 9 3 14 0s9 3 14 0 9 3 14 0"
            stroke="var(--color-marker)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

export function EmptyState({
  kind,
  title,
  description,
  action,
  className,
}: {
  kind: EmptyKind;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-line bg-paper-light/65 px-6 py-12 text-center sm:px-10 sm:py-16",
        className,
      )}
    >
      <EmptyDoodle kind={kind} />
      <h2 className="mt-5 font-display text-2xl leading-tight tracking-[-0.02em] text-ink sm:text-3xl">
        {title}
      </h2>
      <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-ink-soft">
        {description}
      </p>
      {action ? (
        <div className="mt-7 flex flex-wrap justify-center gap-3">{action}</div>
      ) : null}
    </div>
  );
}
