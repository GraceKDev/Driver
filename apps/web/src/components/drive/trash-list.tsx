"use client";

import { FolderOpen, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileGlyph } from "@/components/drive/file-glyph";
import { formatBytes, formatDate } from "@/lib/format";
import type { TrashItemDto } from "@/lib/types";

export function TrashList({
  items,
  restoringId,
  onRestore,
  onDeleteForever,
}: {
  items: TrashItemDto[];
  restoringId: string | null;
  onRestore: (item: TrashItemDto) => void;
  onDeleteForever: (item: TrashItemDto) => void;
}) {
  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const isRestoring = restoringId === item.id;

        return (
          <li
            key={`${item.kind}-${item.id}`}
            className="flex flex-col gap-3 rounded-xl border border-line bg-paper-light px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
          >
            <span
              aria-hidden="true"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-ink/5 bg-manila/75 text-ink"
            >
              {item.kind === "folder" ? (
                <FolderOpen className="h-4.5 w-4.5" strokeWidth={1.7} />
              ) : (
                <FileGlyph
                  contentType=""
                  name={item.name}
                  className="h-4.5 w-4.5"
                />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate font-sans text-sm font-semibold text-ink">
                {item.name}
              </p>
              <p className="mt-1 break-words font-mono text-[9px] uppercase leading-relaxed tracking-[0.08em] text-ink-soft/90">
                {item.kind === "folder" ? "Folder" : "File"}
                {item.sizeBytes !== null
                  ? ` · ${formatBytes(item.sizeBytes)}`
                  : ""}
                {" · deleted "}
                {formatDate(item.deletedAt)}
              </p>
              <p className="mt-1 break-all text-[11px] leading-snug text-ink-soft/90">
                From {item.originalPath || "/"}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Button
                variant="paper"
                size="sm"
                onClick={() => onRestore(item)}
                disabled={isRestoring}
                aria-label={`Restore ${item.name}`}
              >
                <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
                {isRestoring ? "Restoring…" : "Restore"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteForever(item)}
                aria-label={`Delete ${item.name} forever`}
                className="text-marker hover:bg-accent-soft hover:text-marker"
              >
                <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                Delete forever
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
