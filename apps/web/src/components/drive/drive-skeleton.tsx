import { Logo } from "@/components/brand/logo";

export function DriveSkeleton({
  label = "Finding your desk…",
}: {
  label?: string;
}) {
  return (
    <div className="desk-surface min-h-screen">
      <div className="mx-auto flex max-w-[1440px]">
        <aside className="hidden min-h-screen w-[17rem] shrink-0 flex-col border-r border-line bg-paper-light/80 px-3.5 py-5 lg:flex">
          <div className="px-1">
            <Logo href="/drive" />
          </div>
          <div className="mt-6 h-10 rounded-lg bg-manila/45" />
          <div className="mt-7 space-y-2">
            <div className="h-2.5 w-20 rounded bg-paper-deep" />
            <div className="h-9 rounded-lg bg-paper-deep/60" />
            <div className="h-9 rounded-lg bg-paper-deep/40" />
          </div>
          <div className="mt-6 h-20 rounded-xl border border-line bg-paper" />
          <div className="mt-auto h-14 rounded-xl border border-line bg-paper" />
        </aside>

        <div className="min-w-0 flex-1">
          <div className="border-b border-line bg-paper/95">
            <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
              <div className="h-10 min-w-0 max-w-xl flex-1 rounded-lg bg-paper-deep/60" />
              <div className="ml-auto h-9 w-[4.75rem] rounded-lg bg-paper-deep/50" />
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-line bg-paper/95 px-4 py-3 lg:hidden">
            <Logo href="/drive" compact showTagline={false} />
            <span className="h-9 w-24 rounded-lg bg-manila/40" />
          </div>

          <main
            aria-busy="true"
            className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6"
          >
            <p
              role="status"
              className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft/90"
            >
              {label}
            </p>
            <div className="mt-4 h-10 w-56 rounded-lg bg-paper-deep/70" />
            <div className="mt-3 h-3.5 w-80 max-w-full rounded bg-paper-deep/50" />
            <div className="mt-7 h-24 rounded-2xl border border-dashed border-line bg-paper-light/50" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <div
                  key={index}
                  className="h-44 rounded-xl border border-line bg-paper-light/50"
                />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
