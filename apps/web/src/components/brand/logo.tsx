import Link from "next/link";
import { cn } from "@/lib/cn";

function FolderMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      className={cn("h-6 w-6", className)}
      fill="none"
    >
      <path
        d="M4.5 9.5h7.7l2.2-3H27a2 2 0 0 1 2 2v17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-14a2 2 0 0 1 1.5-2Z"
        fill="var(--color-manila)"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M3 14.2h26"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9 21.2c2.2-1.5 4.1 1.4 6.3 0s4 1.4 6.2 0 3.2 1 4.5 0"
        stroke="var(--color-marker)"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({
  href = "/",
  className,
  variant = "ink",
  showTagline = true,
  compact = false,
}: {
  href?: string;
  className?: string;
  variant?: "ink" | "paper";
  showTagline?: boolean;
  compact?: boolean;
}) {
  const isPaper = variant === "paper";

  return (
    <Link
      href={href}
      aria-label="ChaosDrive home"
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-[10px] shadow-[0_1px_2px_rgb(36_33_28_/_0.14)]",
          compact ? "h-9 w-9" : "h-10 w-10",
          isPaper
            ? "border border-paper/25 bg-paper text-ink"
            : "border border-ink/10 bg-ink text-paper",
        )}
      >
        <FolderMark className={compact ? "h-5 w-5" : "h-[1.35rem] w-[1.35rem]"} />
      </span>
      <span className="leading-none">
        <span
          className={cn(
            "block font-display font-medium tracking-[-0.02em]",
            compact ? "text-lg" : "text-[1.35rem]",
            isPaper ? "text-paper" : "text-ink",
          )}
        >
          Chaos<span className={isPaper ? "text-sticky" : "text-marker"}>Drive</span>
        </span>
        {showTagline ? (
          <span
            className={cn(
              "mt-1 block font-mono text-[8px] uppercase tracking-[0.16em]",
              isPaper ? "text-paper/75" : "text-ink-soft/90",
            )}
          >
            A local-first drive
          </span>
        ) : null}
      </span>
    </Link>
  );
}
