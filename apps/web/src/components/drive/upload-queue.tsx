"use client";

import { AlertTriangle, Check, FileUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatBytes, pluralize } from "@/lib/format";
import type { UploadItem, UploadStatus } from "@/lib/use-uploads";

const statusLabels: Record<UploadStatus, string> = {
  queued: "Queued",
  preparing: "Preparing",
  uploading: "Uploading",
  finishing: "Finishing",
  done: "Filed away",
  error: "Didn’t make it",
};

function statusLine(item: UploadItem): string {
  if (item.status === "uploading") {
    return `Uploading ${item.progress}%`;
  }
  if (item.status === "done") {
    return "Filed away";
  }
  if (item.status === "error") {
    return "Didn’t make it";
  }
  return statusLabels[item.status];
}

export function UploadQueue({
  items,
  onDismiss,
  onClearFinished,
  className,
}: {
  items: UploadItem[];
  onDismiss: (id: string) => void;
  onClearFinished: () => void;
  className?: string;
}) {
  if (items.length === 0) {
    return null;
  }

  const active = items.filter(
    (item) => item.status !== "done" && item.status !== "error",
  ).length;
  const finished = items.length - active;
  const doneCount = items.filter((item) => item.status === "done").length;
  const errorCount = items.filter((item) => item.status === "error").length;

  return (
    <section
      aria-label="Uploads"
      className={cn(
        "overflow-hidden rounded-2xl border border-line bg-paper-light shadow-[0_1px_2px_rgb(36_33_28_/_0.04)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <FileUp aria-hidden="true" className="h-4 w-4 text-pen" />
          <h2 className="font-sans text-sm font-semibold text-ink">Uploads</h2>
          <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-ink-soft/90">
            {active > 0
              ? `${pluralize(active, "file")} in flight`
              : `${doneCount} filed${
                  errorCount > 0 ? ` · ${errorCount} stuck` : ""
                }`}
          </span>
        </div>
        {finished > 0 ? (
          <Button variant="ghost" size="sm" onClick={onClearFinished}>
            Clear finished
          </Button>
        ) : null}
      </div>

      <ul className="divide-y divide-line">
        {items.map((item) => {
          const isSettled = item.status === "done" || item.status === "error";
          const barWidth =
            item.status === "done"
              ? 100
              : item.status === "error"
                ? 100
                : item.progress;

          return (
            <li key={item.id} className="px-4 py-3">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full",
                    item.status === "error"
                      ? "bg-accent-soft text-marker"
                      : item.status === "done"
                        ? "bg-mint text-olive"
                        : "bg-manila text-ink",
                  )}
                >
                  {item.status === "done" ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  ) : item.status === "error" ? (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  ) : (
                    <FileUp className="h-3.5 w-3.5" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <p className="min-w-0 flex-1 truncate font-sans text-[13px] font-medium text-ink">
                      {item.name}
                    </p>
                    <p
                      className={cn(
                        "font-mono text-[8px] uppercase tracking-[0.1em]",
                        item.status === "error"
                          ? "text-marker"
                          : item.status === "done"
                            ? "text-olive"
                            : "text-ink-soft/90",
                      )}
                    >
                      {statusLine(item)}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div
                      role="progressbar"
                      aria-label={`Upload progress for ${item.name}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={barWidth}
                      className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-deep"
                    >
                      <div
                        className={cn(
                          "h-full rounded-full",
                          item.status === "error"
                            ? "bg-marker"
                            : item.status === "done"
                              ? "bg-olive"
                              : "bg-pen",
                        )}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <span className="shrink-0 font-mono text-[8px] text-ink-soft/90">
                      {formatBytes(item.sizeBytes)}
                    </span>
                  </div>
                  {item.error ? (
                    <p className="mt-1.5 text-xs leading-snug text-marker">
                      {item.error}
                    </p>
                  ) : null}
                </div>

                {isSettled ? (
                  <button
                    type="button"
                    onClick={() => onDismiss(item.id)}
                    aria-label={`Dismiss ${item.name}`}
                    className="-mr-1 grid h-7 w-7 shrink-0 place-items-center rounded-md text-ink-soft/90 hover:bg-ink/5 hover:text-ink"
                  >
                    <X aria-hidden="true" className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
