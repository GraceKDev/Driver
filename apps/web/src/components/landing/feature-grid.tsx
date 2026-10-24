import {
  CloudUpload,
  FolderTree,
  HardDrive,
  RotateCcw,
  Search,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

type Feature = {
  index: string;
  title: string;
  copy: string;
  note: string;
  icon: LucideIcon;
  className: string;
  iconTone: string;
};

const features: Feature[] = [
  {
    index: "01",
    title: "Nested folders",
    copy: "Folders inside folders inside “I’ll sort this later.” Build a sensible taxonomy or keep piling. It holds.",
    note: "Yes, folders can have folders.",
    icon: FolderTree,
    className: "lg:col-span-3",
    iconTone: "bg-manila/70 text-ink",
  },
  {
    index: "02",
    title: "Drag, drop, done",
    copy: "Drop files up to 100 MB. They upload straight to storage while a quiet tray tells you exactly what’s happening.",
    note: "100 MB max per file.",
    icon: CloudUpload,
    className: "lg:col-span-3",
    iconTone: "bg-mint text-olive",
  },
  {
    index: "03",
    title: "Find the pile",
    copy: "Search folders and files by name, with the full path included — so you can remember where “final_final.pdf” actually lives.",
    note: "No more clicking every drawer.",
    icon: Search,
    className: "lg:col-span-2",
    iconTone: "bg-dusty/70 text-marker",
  },
  {
    index: "04",
    title: "Trash with a conscience",
    copy: "Delete sends things to Trash first. Restore them whenever you like. “Delete forever” only happens when you truly mean it.",
    note: "Undo is a love language.",
    icon: RotateCcw,
    className: "lg:col-span-2",
    iconTone: "bg-sticky/45 text-ink",
  },
  {
    index: "05",
    title: "5 GB to fill",
    copy: "Enough room for receipts, references, screenshots, and the one folder you keep meaning to clean out. Your desk, your quota.",
    note: "Roughly one beautiful mess.",
    icon: HardDrive,
    className: "lg:col-span-2",
    iconTone: "bg-sky-soft text-pen",
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;

  return (
    <article
      className={cn(
        "paper-card flex flex-col p-6 paper-shadow-sm hover:border-ink/25 sm:p-7",
        feature.className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className={cn(
            "grid h-11 w-11 place-items-center rounded-xl border border-ink/10",
            feature.iconTone,
          )}
        >
          <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
        </span>
        <span className="font-mono text-[10px] tracking-[0.16em] text-ink-soft/90">
          {feature.index}
        </span>
      </div>

      <h3 className="mt-5 font-display text-[1.7rem] leading-tight tracking-[-0.02em] text-ink">
        {feature.title}
      </h3>
      <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
        {feature.copy}
      </p>
      <p className="mt-auto border-t border-line pt-4 font-sans text-xs font-medium text-marker">
        {feature.note}
      </p>
    </article>
  );
}

export function FeatureGrid() {
  return (
    <section
      id="features"
      className="scroll-mt-20 border-b border-line bg-paper py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-6 border-b border-line pb-9 md:grid-cols-[1.1fr_0.9fr] md:items-end">
          <div>
            <h2 className="max-w-xl font-display text-4xl leading-[1.02] tracking-[-0.03em] text-ink sm:text-5xl">
              A place for every pile.
            </h2>
          </div>
          <p className="max-w-md text-[15px] leading-relaxed text-ink-soft md:justify-self-end">
            Five useful things, lightly organized. Everything you need to put
            something down and find it again later — without turning your desk
            into a project.
          </p>
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
