import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    label: "Make a desk",
    copy: "Sign up and land on a fresh sheet of paper. Your 5 GB is already waiting.",
  },
  {
    number: "02",
    label: "Make a mess",
    copy: "Create folders, drag files in, and let the upload tray keep track of the heavy lifting.",
  },
  {
    number: "03",
    label: "Find it again",
    copy: "Search by name, follow the breadcrumbs, or rescue something from Trash. No filing manual required.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-b border-line bg-paper-deep/55 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-6 md:grid-cols-[1fr_0.8fr] md:items-end">
          <div>
            <h2 className="max-w-xl font-display text-4xl leading-[1.02] tracking-[-0.03em] text-ink sm:text-5xl">
              Three steps. Then it’s yours.
            </h2>
          </div>
          <p className="max-w-sm text-[15px] leading-relaxed text-ink-soft md:justify-self-end">
            No onboarding maze. No seventeen-step setup wizard. Just a clean
            desk and a place to put things.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-line bg-paper-light">
          <ol className="grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
            {steps.map((step) => (
              <li key={step.number} className="p-6 sm:p-8">
                <p className="font-display text-5xl leading-none tracking-[-0.04em] text-marker/85">
                  {step.number}
                </p>
                <h3 className="mt-6 font-display text-2xl tracking-[-0.02em] text-ink">
                  {step.label}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
                  {step.copy}
                </p>
              </li>
            ))}
          </ol>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line bg-paper px-6 py-5 sm:px-8">
            <p className="max-w-md font-display text-xl leading-tight text-ink-soft">
              That’s it. Go make a mess.
            </p>
            <Link
              href="/sign-up"
              className={buttonClasses({ variant: "marker", size: "md" })}
            >
              Start your desk
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
