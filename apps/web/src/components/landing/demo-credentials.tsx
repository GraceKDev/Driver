import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

const DEMO_EMAIL = "demo@chaosdrive.app";
const DEMO_PASSWORD = "ChaosDrive123!";

export function DemoCredentials({
  className,
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        dark
          ? "border-paper/15 bg-paper/[0.045]"
          : "border-line bg-paper-light",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          className={cn(
            "font-sans text-sm font-semibold",
            dark ? "text-paper" : "text-ink",
          )}
        >
          Demo access
        </p>
        <Link
          href="/sign-in"
          className={cn(
            "inline-flex items-center gap-1 font-sans text-xs font-semibold",
            dark
              ? "text-sticky hover:text-paper"
              : "text-marker hover:text-ink",
          )}
        >
          Open the demo
          <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
        </Link>
      </div>
      <p
        className={cn(
          "mt-2 font-display text-xl leading-tight",
          dark ? "text-paper" : "text-ink",
        )}
      >
        Try it with the spare keys.
      </p>
      <dl
        className={cn(
          "mt-3 grid gap-x-3 gap-y-1.5 font-mono text-[10px] leading-relaxed sm:grid-cols-[auto_1fr]",
          dark ? "text-paper/75" : "text-ink-soft",
        )}
      >
        <dt
          className={cn(
            "uppercase tracking-[0.12em]",
            dark ? "text-paper/75" : "text-ink-soft/90",
          )}
        >
          Email
        </dt>
        <dd className="select-all break-all">{DEMO_EMAIL}</dd>
        <dt
          className={cn(
            "uppercase tracking-[0.12em]",
            dark ? "text-paper/75" : "text-ink-soft/90",
          )}
        >
          Password
        </dt>
        <dd className="select-all">{DEMO_PASSWORD}</dd>
      </dl>
    </div>
  );
}
