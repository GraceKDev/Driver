import type { Metadata } from "next";
import { ArrowLeft, Info, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What ChaosDrive collects, where your data lives, and how to delete it. No ads, no selling data, no surprises.",
};

export default function PrivacyPage() {
  return (
    <div className="desk-surface min-h-screen">
      <header className="border-b border-line bg-paper/95">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <Logo showTagline={false} />
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/"
              aria-label="Back home"
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-sans text-sm font-medium text-ink-soft hover:bg-paper-light hover:text-ink"
            >
              <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
              <span className="sm:hidden">Back</span>
              <span className="hidden sm:inline">Back home</span>
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

      <main
        id="main"
        className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16"
      >
        <h1 className="font-display text-4xl leading-[1.02] tracking-[-0.035em] text-ink sm:text-5xl">
          Privacy policy
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          Last updated October 23, 2026
        </p>
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-ink-soft">
          ChaosDrive is a small file-storage app. This page explains what we
          collect, why we collect it, and what happens when you delete
          something. It is written to be read, not skimmed past.
        </p>

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-marker/25 bg-accent-soft px-4 py-4">
          <Info
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-marker"
          />
          <p className="text-sm leading-relaxed text-ink-soft">
            This is a demo. Please don’t upload sensitive, confidential, or
            irreplaceable files. Demo data may be reset periodically.
          </p>
        </div>

        <section className="mt-10 rounded-2xl border border-line bg-paper-light p-6 sm:p-7">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint text-olive">
              <ShieldCheck aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-2xl leading-tight tracking-[-0.02em] text-ink">
                The short version
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                We collect the account details and files you give us so the
                drive can work. We don’t sell your data, show ads, or run
                advertising trackers. You can delete files whenever you like;
                they wait in Trash until you delete them permanently.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-10 space-y-9">
          <section className="border-t border-line pt-7">
            <h2 className="font-display text-2xl leading-tight tracking-[-0.02em] text-ink">
              What we collect
            </h2>
            <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink-soft">
              <p>
                <strong className="font-semibold text-ink">
                  Account details.
                </strong>{" "}
                Your display name, email address, and password. Passwords are
                stored as one-way hashes, never as plain text.
              </p>
              <p>
                <strong className="font-semibold text-ink">
                  Your files and folders.
                </strong>{" "}
                File names, folder paths, sizes, timestamps, and the contents
                of the files you upload.
              </p>
              <p>
                <strong className="font-semibold text-ink">
                  Service logs.
                </strong>{" "}
                Basic request and error information needed to keep the service
                running and diagnose problems. We don’t use it to build
                advertising profiles.
              </p>
            </div>
          </section>

          <section className="border-t border-line pt-7">
            <h2 className="font-display text-2xl leading-tight tracking-[-0.02em] text-ink">
              How we use it
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-ink-soft marker:text-marker">
              <li>
                To sign you in, store and retrieve files, enforce the 5 GB
                quota, and show your folders, search results, storage usage,
                and Trash.
              </li>
              <li>To keep the service reliable, private, and secure.</li>
              <li>
                To understand and fix errors. We do not sell personal data or
                use it for advertising.
              </li>
            </ul>
          </section>

          <section className="border-t border-line pt-7">
            <h2 className="font-display text-2xl leading-tight tracking-[-0.02em] text-ink">
              Where your data lives
            </h2>
            <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink-soft">
              <p>
                Account and file metadata live in the app’s PostgreSQL
                database. File contents live in S3-compatible object storage.
              </p>
              <p>
                If you use a self-hosted copy of ChaosDrive, the person or team
                running that copy controls the data and infrastructure. This
                policy describes the public demo, not every self-hosted
                instance.
              </p>
            </div>
          </section>

          <section className="border-t border-line pt-7">
            <h2 className="font-display text-2xl leading-tight tracking-[-0.02em] text-ink">
              Cookies and sessions
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
              ChaosDrive uses a session cookie to keep you signed in. We don’t
              use advertising cookies, cross-site tracking pixels, or
              third-party analytics cookies.
            </p>
          </section>

          <section className="border-t border-line pt-7">
            <h2 className="font-display text-2xl leading-tight tracking-[-0.02em] text-ink">
              Retention and deletion
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-ink-soft marker:text-marker">
              <li>
                Deleting a file moves it to Trash. It stays there until you
                restore it or choose to delete it permanently.
              </li>
              <li>
                Deleting permanently removes the file from object storage and
                its metadata from the database.
              </li>
              <li>
                The public demo may be reset or cleaned up periodically. To
                request deletion of an account, contact the operator of the
                instance.
              </li>
            </ul>
          </section>

          <section className="border-t border-line pt-7">
            <h2 className="font-display text-2xl leading-tight tracking-[-0.02em] text-ink">
              Security
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
              Passwords are hashed, files are private to your account, and
              downloads use short-lived signed links. No system is perfectly
              secure, so please don’t upload sensitive or irreplaceable files
              to the public demo.
            </p>
          </section>

          <section className="border-t border-line pt-7">
            <h2 className="font-display text-2xl leading-tight tracking-[-0.02em] text-ink">
              Children
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
              ChaosDrive isn’t directed at children under 13, and we don’t
              knowingly collect their personal data.
            </p>
          </section>

          <section className="border-t border-line pt-7">
            <h2 className="font-display text-2xl leading-tight tracking-[-0.02em] text-ink">
              Changes to this policy
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
              If this policy changes, we’ll update the date at the top.
              Continued use after an update means you accept the revised
              policy.
            </p>
          </section>

          <section className="border-t border-line pt-7">
            <h2 className="font-display text-2xl leading-tight tracking-[-0.02em] text-ink">
              Contact
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
              Questions about privacy or a deletion request? Email{" "}
              <a
                href="mailto:privacy@chaosdrive.app"
                className="font-medium text-marker underline decoration-marker/30 underline-offset-4 hover:text-ink hover:decoration-ink/30"
              >
                privacy@chaosdrive.app
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-line bg-paper-deep/40">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-ink-soft">
            © 2026 ChaosDrive
          </p>
          <nav
            aria-label="Legal and account"
            className="flex flex-wrap items-center gap-x-5 gap-y-2"
          >
            <Link
              href="/"
              className="font-sans text-sm text-ink-soft hover:text-ink"
            >
              Home
            </Link>
            <Link
              href="/privacy"
              aria-current="page"
              className="font-sans text-sm font-medium text-ink"
            >
              Privacy
            </Link>
            <Link
              href="/sign-in"
              className="font-sans text-sm text-ink-soft hover:text-ink"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
