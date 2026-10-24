import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { DemoCredentials } from "@/components/landing/demo-credentials";

const productLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#storage", label: "Storage" },
];

const accountLinks = [
  { href: "/sign-in", label: "Sign in" },
  { href: "/sign-up", label: "Create a drive" },
  { href: "/drive", label: "Open my drive" },
];

export function LandingFooter() {
  return (
    <footer className="on-dark border-t border-paper/10 bg-ink pb-8 pt-14 text-paper sm:pt-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.35fr_0.6fr_0.6fr_1fr]">
          <div>
            <Logo variant="paper" showTagline />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-paper/75">
              A warm home for nested folders, big uploads, second thoughts,
              and everything you keep meaning to organize.
            </p>
          </div>

          <nav aria-label="Product">
            <h2 className="font-mono text-[9px] uppercase tracking-[0.14em] text-paper/75">
              Product
            </h2>
            <ul className="mt-4 space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="font-sans text-sm text-paper/75 hover:text-sticky"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Account">
            <h2 className="font-mono text-[9px] uppercase tracking-[0.14em] text-paper/75">
              Account
            </h2>
            <ul className="mt-4 space-y-2.5">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-paper/75 hover:text-sticky"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <DemoCredentials dark />
        </div>

        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-paper/10 pt-5 sm:flex-row sm:items-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-paper/75">
            © 2026 ChaosDrive. Paper cuts included.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              href="/privacy"
              className="font-sans text-sm text-paper/75 hover:text-sticky"
            >
              Privacy
            </Link>
            <p className="font-sans text-sm text-paper/75">
              Built for the beautifully disorganized.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
