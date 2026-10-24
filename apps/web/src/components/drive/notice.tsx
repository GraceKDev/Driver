"use client";

import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/cn";

export type NoticeTone = "success" | "error";

export type NoticeMessage = {
  tone: NoticeTone;
  message: string;
};

export function Notice({
  notice,
  onDismiss,
  className,
}: {
  notice: NoticeMessage | null;
  onDismiss: () => void;
  className?: string;
}) {
  if (!notice) {
    return null;
  }

  const isError = notice.tone === "error";
  const Icon = isError ? AlertTriangle : CheckCircle2;

  return (
    <div
      role={isError ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 shadow-[0_1px_2px_rgb(36_33_28_/_0.04)]",
        isError
          ? "border-marker/25 bg-accent-soft"
          : "border-olive/25 bg-mint/60",
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0",
          isError ? "text-marker" : "text-olive",
        )}
      />
      <p className="min-w-0 flex-1 text-sm leading-relaxed text-ink">
        {notice.message}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss message"
        className="-mr-1.5 -mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-md text-ink-soft hover:bg-ink/5 hover:text-ink"
      >
        <X aria-hidden="true" className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
