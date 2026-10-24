import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { DemoCredentials } from "@/components/landing/demo-credentials";
import { HeroPreview } from "@/components/landing/hero-preview";
import { buttonClasses } from "@/components/ui/button";

const proofPoints = [
  "5 GB free",
  "100 MB per file",
  "Trash with restore",
];

export function HeroSection() {
  return (
    <section className="relative border-b border-line/80">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:pb-28 lg:pt-20">
        <div className="relative z-10">
          <h1 className="max-w-2xl font-display text-[3.25rem] font-medium leading-[0.98] tracking-[-0.035em] text-ink sm:text-6xl lg:text-[4.6rem]">
            A calmer home for your{" "}
            <span className="text-marker">beautiful mess.</span>
          </h1>

          <p className="mt-7 max-w-xl text-[17px] leading-relaxed text-ink-soft">
            Nested folders, big uploads, and a trash can with a conscience.
            ChaosDrive is a warm, local-first corner of the cloud for people
            whose filing system is mostly vibes.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/sign-up"
              className={buttonClasses({ variant: "marker", size: "lg" })}
            >
              Create your drive
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              href="/sign-in"
              className={buttonClasses({ variant: "outline", size: "lg" })}
            >
              Explore the demo
            </Link>
          </div>

          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
            {proofPoints.map((point) => (
              <li
                key={point}
                className="inline-flex items-center gap-2 font-sans text-[13px] text-ink-soft"
              >
                <span
                  aria-hidden="true"
                  className="grid h-4 w-4 place-items-center rounded-full bg-mint text-olive"
                >
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>

          <DemoCredentials className="mt-9 max-w-md" />
        </div>

        <div className="relative">
          <HeroPreview />
        </div>
      </div>
    </section>
  );
}
