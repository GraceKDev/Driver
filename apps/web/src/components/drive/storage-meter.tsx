import { formatBytes, percentOf } from "@/lib/format";
import type { StorageDto } from "@/lib/types";
import { cn } from "@/lib/cn";

export function StorageMeter({
  storage,
  className,
  compact = false,
}: {
  storage: StorageDto;
  className?: string;
  compact?: boolean;
}) {
  const quota =
    storage.quotaBytes > 0 ? storage.quotaBytes : 5 * 1024 * 1024 * 1024;
  const used = Math.max(0, storage.usedBytes);
  const percent = percentOf(used, quota);
  const isFull = percent >= 90;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-sans text-xs font-medium text-ink-soft/90">
          Storage
        </p>
        <p className="font-mono text-[9px] tracking-[0.02em] text-ink-soft/90">
          {formatBytes(used)} / {formatBytes(quota)}
        </p>
      </div>
      <div
        role="progressbar"
        aria-label="Storage used"
        aria-valuemin={0}
        aria-valuemax={quota}
        aria-valuenow={Math.min(used, quota)}
        aria-valuetext={`${formatBytes(used)} of ${formatBytes(quota)} used`}
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper-deep"
      >
        <div
          className={cn("h-full rounded-full", isFull ? "bg-marker" : "bg-pen")}
          style={{ width: `${percent}%` }}
        />
      </div>
      {!compact ? (
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-[11px] text-ink-soft/90">
            {isFull ? "Time for a tidy." : "Room to grow."}
          </p>
          <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-ink-soft/90">
            {Math.round(percent)}% full
          </p>
        </div>
      ) : null}
    </div>
  );
}
