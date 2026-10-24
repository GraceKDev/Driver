import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";

const assurances = [
  { value: "5 GB", label: "free storage" },
  { value: "Private", label: "by default" },
  { value: "Trash", label: "before forever" },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="desk-surface min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[1.02fr_0.98fr]">
        <aside className="paper-grain relative flex flex-col overflow-hidden border-b border-line bg-paper-deep/65 px-5 pb-9 pt-5 sm:px-9 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-12 lg:py-10">
          <div className="flex items-center justify-between gap-4">
            <Logo href="/" />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-sans text-sm font-medium text-ink-soft hover:bg-paper/60 hover:text-ink"
            >
              <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
              Back home
            </Link>
          </div>

          <div className="my-auto hidden max-w-xl py-12 lg:block lg:py-20">
            <blockquote className="font-display text-[2.6rem] leading-[1.01] tracking-[-0.04em] text-ink sm:text-[3.4rem]">
              “A tidy desk is a sign of a person who hasn’t started yet.”
            </blockquote>

            <div className="mt-10 grid max-w-md grid-cols-3 gap-3 border-t border-line pt-6">
              {assurances.map((item) => (
                <div key={item.label}>
                  <p className="font-display text-2xl leading-none tracking-[-0.02em] text-ink">
                    {item.value}
                  </p>
                  <p className="mt-1.5 font-sans text-[11px] leading-tight text-ink-soft/90">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <p className="hidden font-mono text-[8px] uppercase tracking-[0.16em] text-ink-soft/90 lg:block">
            ChaosDrive — a local-first drive
          </p>
        </aside>

        <main
          id="main"
          className="flex items-center justify-center px-4 py-10 sm:px-8 lg:min-h-screen lg:py-14"
        >
          <div className="w-full max-w-[460px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
