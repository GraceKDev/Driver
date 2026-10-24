import {
  FileText,
  Folder,
  HardDrive,
  Image as ImageIcon,
  Search,
  Trash2,
} from "lucide-react";

const folders = [
  { name: "Invoices", meta: "12 files", tone: "bg-manila" },
  { name: "Design refs", meta: "8 files", tone: "bg-mint" },
  { name: "Top secret", meta: "3 files", tone: "bg-accent-soft" },
  { name: "Travel", meta: "5 files", tone: "bg-sky-soft" },
];

const files = [
  { name: "Q3 invoice.pdf", meta: "2.4 MB", icon: FileText },
  { name: "moodboard.png", meta: "8.1 MB", icon: ImageIcon },
  { name: "notes.txt", meta: "12 KB", icon: FileText },
];

export function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <div
        aria-hidden="true"
        className="absolute -inset-x-4 bottom-0 top-10 rounded-[28px] bg-paper-deep/80"
      />

      <div
        role="img"
        aria-label="Preview of the ChaosDrive app: a sidebar with My Drive, Trash, and storage, plus folder and recent file cards."
        className="paper-card paper-shadow-lg relative overflow-hidden"
      >
        <div className="flex items-center gap-2 border-b border-line bg-paper px-3.5 py-2.5">
          <span aria-hidden="true" className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-marker/55" />
            <span className="h-2 w-2 rounded-full bg-sticky" />
            <span className="h-2 w-2 rounded-full bg-olive/55" />
          </span>
          <span className="mx-auto rounded-md border border-line bg-paper-light px-3 py-1 font-mono text-[8px] text-ink-soft/90">
            chaosdrive.app/drive
          </span>
        </div>

        <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[126px_1fr]">
          <aside className="border-r border-line bg-paper p-2.5 sm:p-3">
            <p className="px-1 font-display text-[15px] font-medium tracking-[-0.02em]">
              Chaos<span className="text-marker">Drive</span>
            </p>

            <div className="mt-4 rounded-md bg-marker px-2 py-1.5 text-center font-sans text-[9px] font-semibold text-paper">
              + New
            </div>

            <nav aria-hidden="true" className="mt-4 space-y-1">
              <span className="flex items-center gap-1.5 rounded-md bg-accent-soft px-2 py-1.5 font-sans text-[9px] font-semibold text-marker">
                <HardDrive className="h-3 w-3" />
                My Drive
              </span>
              <span className="flex items-center gap-1.5 rounded-md px-2 py-1.5 font-sans text-[9px] font-medium text-ink-soft">
                <Trash2 className="h-3 w-3" />
                Trash
              </span>
            </nav>

            <div className="mt-5 border-t border-line pt-3">
              <p className="px-1 font-mono text-[7px] uppercase tracking-[0.12em] text-ink-soft/90">
                Storage
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                <div className="h-full w-[34%] rounded-full bg-pen" />
              </div>
              <p className="mt-1.5 px-1 font-mono text-[7px] text-ink-soft/90">
                1.7 / 5 GB
              </p>
            </div>
          </aside>

          <div className="min-w-0 bg-paper-light p-3 sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[7px] uppercase tracking-[0.14em] text-ink-soft/90">
                  My Drive
                </p>
                <p className="mt-0.5 font-display text-xl leading-none tracking-[-0.02em]">
                  Your desk
                </p>
              </div>
              <span className="rounded-full border border-line px-2 py-1 font-mono text-[7px] uppercase tracking-[0.08em] text-ink-soft">
                5 GB free
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-lg border border-line bg-paper px-2.5 py-2 text-ink-soft/90">
              <Search aria-hidden="true" className="h-3 w-3" />
              <span className="font-sans text-[9px]">
                Search files and folders
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {folders.map((folder) => (
                <div
                  key={folder.name}
                  className="rounded-lg border border-line bg-paper-light p-2.5"
                >
                  <span
                    aria-hidden="true"
                    className={`grid h-7 w-7 place-items-center rounded-md ${folder.tone}`}
                  >
                    <Folder className="h-3.5 w-3.5 text-ink/70" />
                  </span>
                  <p className="mt-2 truncate font-sans text-[10px] font-semibold text-ink">
                    {folder.name}
                  </p>
                  <p className="mt-0.5 font-mono text-[7px] uppercase tracking-[0.08em] text-ink-soft/90">
                    {folder.meta}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-lg border border-line bg-paper p-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-sans text-[9px] font-semibold text-ink">
                  Recent files
                </span>
                <span className="font-mono text-[7px] uppercase tracking-[0.08em] text-ink-soft/90">
                  3 items
                </span>
              </div>
              <div className="mt-2 space-y-1.5">
                {files.map((file) => {
                  const Icon = file.icon;
                  return (
                    <div
                      key={file.name}
                      className="flex items-center gap-2 rounded-md border border-line/70 bg-paper-light px-2 py-1.5"
                    >
                      <span
                        aria-hidden="true"
                        className="grid h-5 w-5 place-items-center rounded bg-manila/65"
                      >
                        <Icon className="h-3 w-3 text-ink/65" />
                      </span>
                      <span className="min-w-0 flex-1 truncate font-sans text-[9px] text-ink">
                        {file.name}
                      </span>
                      <span className="font-mono text-[7px] text-ink-soft/90">
                        {file.meta}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 left-4 hidden rounded-lg border border-line bg-sticky px-3 py-2 shadow-[0_2px_8px_rgb(36_33_28_/_0.08)] sm:block">
        <p className="font-mono text-[7px] uppercase tracking-[0.12em] text-ink/85">
          Trash first
        </p>
        <p className="mt-0.5 font-display text-sm leading-none">
          Second thoughts welcome.
        </p>
      </div>
    </div>
  );
}
