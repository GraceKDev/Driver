"use client";

import { UploadCloud } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { MAX_UPLOAD_BYTES, formatBytes } from "@/lib/format";

export function UploadZone({
  onBrowse,
  onFiles,
}: {
  onBrowse: () => void;
  onFiles: (files: File[]) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const depthRef = useRef(0);

  const handleDragEnter = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    depthRef.current += 1;
    setDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    depthRef.current = Math.max(0, depthRef.current - 1);
    if (depthRef.current === 0) {
      setDragging(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    depthRef.current = 0;
    setDragging(false);
    const files = Array.from(event.dataTransfer.files ?? []);
    if (files.length > 0) {
      onFiles(files);
    }
  };

  return (
    <section
      aria-label="Upload files"
      onDragEnter={handleDragEnter}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-dashed px-5 py-5 sm:flex-row sm:items-center sm:justify-between",
        dragging
          ? "border-pen bg-sky-soft/60"
          : "border-line bg-paper-light/45",
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-manila/75 text-ink"
        >
          <UploadCloud className="h-5 w-5" strokeWidth={1.7} />
        </span>
        <div className="min-w-0">
          <p className="font-sans text-sm font-semibold text-ink">
            {dragging ? "Let go — the desk can take it." : "Drop files here"}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft/90">
            Or choose them from your computer. Up to{" "}
            {formatBytes(MAX_UPLOAD_BYTES)} each.
          </p>
        </div>
      </div>
      <Button
        variant="paper"
        size="md"
        onClick={onBrowse}
        className="w-full shrink-0 sm:w-auto"
      >
        <UploadCloud aria-hidden="true" className="h-4 w-4" />
        Choose files
      </Button>
    </section>
  );
}
