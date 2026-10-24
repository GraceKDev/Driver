import { ArrowRight, Check, HardDrive } from "lucide-react";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

const trustPoints = [
  {
    title: "Private by default",
    copy: "Everything lives behind your sign-in. No accidental public drawer, no mystery sharing link.",
  },
  {
    title: "Trash first",
    copy: "Delete sends things to Trash. Restore them, or choose delete forever only when you’re sure.",
  },
  {
    title: "Direct uploads",
    copy: "Files go straight to storage with honest progress. No mystery spinner, no silent failure.",
  },
  {
    title: "Calm by design",
    copy: "No confetti, no bouncing drawers, no surprise wiggles. Just paper, ink, and your stuff.",
  },
];

export function TrustSection() {
  return (
    <section
      id="storage"
      className="scroll-mt-20 border-b border-line bg-paper py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-6 md:grid-cols-[1fr_0.8fr] md:items-end">
          <div>
            <h2 className="max-w-xl font-display text-4xl leading-[1.02] tracking-[-0.03em] text-ink sm:text-5xl">
              Five gigabytes of room.
            </h2>
          </div>
          <p className="max-w-sm text-[15px] leading-relaxed text-ink-soft md:justify-self-end">
            For the good stuff and the “maybe later” stuff. Your storage meter
            lives in the drive, so you always know where you stand.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="paper-card paper-shadow-sm flex flex-col p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-sans text-sm font-medium text-ink-soft/90">
                  Your quota
                </p>
                <p className="mt-2 font-display text-6xl leading-none tracking-[-0.05em] text-ink sm:text-7xl">
                  5<span className="ml-2 font-display text-3xl text-marker">GB</span>
                </p>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-manila/70 text-ink">
                <HardDrive aria-hidden="true" className="h-5 w-5" />
              </span>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between gap-4 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-soft/90">
                <span>Sample drawer</span>
                <span>1.7 GB of 5 GB</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-paper-deep">
                <div
                  className="h-full rounded-full bg-pen"
                  style={{ width: "34%" }}
                />
              </div>
              <div className="mt-2 flex justify-between font-sans text-xs text-ink-soft/90">
                <span>Organized-ish</span>
                <span>Room to grow</span>
              </div>
            </div>

            <p className="mt-8 max-w-md text-sm leading-relaxed text-ink-soft">
              Enough for receipts, references, screenshots, and at least one
              folder called{" "}
              <span className="rounded bg-paper-deep px-1.5 py-0.5 font-mono text-[11px] text-ink">
                final-final-v3
              </span>
              . No guessing, no surprise overages.
            </p>

            <div className="mt-auto pt-8">
              <Link
                href="/sign-up"
                className={buttonClasses({ variant: "ink", size: "md" })}
              >
                Claim your 5 GB
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </article>

          <article className="paper-card paper-shadow-sm p-6 sm:p-8">
            <h3 className="font-display text-3xl leading-tight tracking-[-0.02em] text-ink">
              Your desk, handled with care.
            </h3>

            <ul className="mt-7 grid gap-x-6 gap-y-5 sm:grid-cols-2">
              {trustPoints.map((point) => (
                <li key={point.title} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mint text-olive"
                  >
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <div>
                    <h4 className="font-sans text-sm font-semibold text-ink">
                      {point.title}
                    </h4>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                      {point.copy}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-7 border-t border-line pt-5">
              <p className="font-display text-xl leading-tight text-ink-soft">
                “A clean desk is just a desk you haven’t used yet.”
              </p>
              <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft/90">
                — the ChaosDrive desk manual
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
