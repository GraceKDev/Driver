import { ArrowLeft, FolderSearch } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="desk-surface flex min-h-screen flex-col">
      <header className="border-b border-line bg-paper/95 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Logo showTagline={false} />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-sans text-sm font-medium text-ink-soft hover:bg-paper-light hover:text-ink"
          >
            <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
            Back home
          </Link>
        </div>
      </header>

      <main
        id="main"
        className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-16 sm:px-6"
      >
        <div className="w-full max-w-xl rounded-2xl border border-line bg-paper-light p-8 text-center shadow-[0_20px_60px_rgb(36_33_28_/_0.08)] sm:p-12">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-manila/70 text-ink">
            <FolderSearch aria-hidden="true" className="h-7 w-7" />
          </span>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-marker">
            404 · drawer not found
          </p>
          <h1 className="mt-3 font-display text-4xl leading-[1.02] tracking-[-0.035em] text-ink sm:text-5xl">
            This drawer is empty.
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
            The page you’re looking for moved, got renamed, or never made it
            out of the pile. The rest of the desk is still here.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className={buttonClasses({ variant: "marker", size: "md" })}
            >
              Back to the desk
            </Link>
            <Link
              href="/drive"
              className={buttonClasses({ variant: "outline", size: "md" })}
            >
              Open My Drive
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
