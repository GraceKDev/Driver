import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { buttonClasses } from "@/components/ui/button";

const sectionLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#storage", label: "Storage" },
];

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-paper/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Logo showTagline={false} />

        <nav
          aria-label="Landing page"
          className="hidden items-center gap-7 lg:flex"
        >
          {sectionLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-sans text-sm font-medium text-ink-soft hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="hidden px-1 py-1 font-sans text-sm font-medium text-ink-soft hover:text-ink sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className={buttonClasses({ variant: "marker", size: "sm" })}
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
