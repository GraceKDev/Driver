"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ChevronRight,
  Download,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/drive/empty-state";
import { FileGlyph } from "@/components/drive/file-glyph";
import { api, friendlyMessage } from "@/lib/api";
import { formatBytes, pluralize } from "@/lib/format";
import type { SearchResponse } from "@/lib/types";

type SearchFile = SearchResponse["files"][number];

export function SearchResults({
  term,
  onOpenFolder,
  onDownload,
  onClear,
}: {
  term: string;
  onOpenFolder: (folderId: string) => void;
  onDownload: (file: SearchFile) => void;
  onClear: () => void;
}) {
  const searchQuery = useQuery({
    queryKey: ["search", term],
    queryFn: ({ signal }) => api.search(term, signal),
  });

  const folders = searchQuery.data?.folders ?? [];
  const files = searchQuery.data?.files ?? [];
  const total = folders.length + files.length;

  return (
    <section aria-labelledby="search-heading">
      <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1
            id="search-heading"
            className="max-w-2xl break-words font-display text-4xl leading-tight tracking-[-0.03em] text-ink sm:text-5xl"
          >
            “{term}”
          </h1>
          <p
            aria-live="polite"
            className="mt-2 text-sm text-ink-soft/90"
          >
            {searchQuery.isPending
              ? "Rummaging through every drawer…"
              : searchQuery.isError
                ? "The search drawer got stuck."
                : total === 0
                  ? "Not a scrap in sight."
                  : `${pluralize(total, "match", "matches")} pulled from the pile.`}
          </p>
        </div>
        <Button
          variant="outline"
          size="md"
          onClick={onClear}
          className="shrink-0 self-start sm:self-auto"
        >
          Close search
        </Button>
      </div>

      {searchQuery.isPending ? (
        <div
          aria-busy="true"
          aria-label="Searching files and folders"
          className="mt-6 space-y-2"
        >
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-xl border border-line bg-paper-light px-4 py-4"
            >
              <span className="h-9 w-9 shrink-0 rounded-lg bg-paper-deep" />
              <span className="min-w-0 flex-1 space-y-2">
                <span className="block h-2.5 w-2/5 rounded bg-paper-deep" />
                <span className="block h-2 w-3/5 rounded bg-paper-deep/70" />
              </span>
            </div>
          ))}
          <p className="sr-only">Searching…</p>
        </div>
      ) : searchQuery.isError ? (
        <div
          role="alert"
          className="mt-6 flex flex-col items-start gap-3 rounded-xl border border-marker/25 bg-accent-soft px-4 py-4 sm:flex-row sm:items-center"
        >
          <AlertTriangle
            aria-hidden="true"
            className="h-5 w-5 shrink-0 text-marker"
          />
          <div className="min-w-0 flex-1">
            <p className="font-sans text-sm font-semibold text-ink">
              The search came back empty-handed.
            </p>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">
              {friendlyMessage(searchQuery.error)}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void searchQuery.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : total === 0 ? (
        <EmptyState
          kind="search"
          title="No scraps with that name."
          description="Try a shorter word, a different spelling, or take a wander through My Drive instead."
          action={
            <Button variant="paper" size="md" onClick={onClear}>
              Back to the desk
            </Button>
          }
          className="mt-6"
        />
      ) : (
        <div className="mt-7 space-y-8">
          {folders.length > 0 ? (
            <section aria-labelledby="search-folders-heading">
              <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-line pb-2">
                <h2
                  id="search-folders-heading"
                  className="font-sans text-xs font-medium text-ink-soft"
                >
                  Folders
                </h2>
                <span className="font-mono text-[10px] text-ink-soft/90">
                  {folders.length}
                </span>
              </div>
              <ul className="space-y-2">
                {folders.map((folder) => (
                  <li key={folder.id}>
                    <button
                      type="button"
                      onClick={() => onOpenFolder(folder.id)}
                      className="flex w-full items-center gap-3 rounded-xl border border-line bg-paper-light px-4 py-3 text-left hover:border-ink/20 hover:bg-paper"
                    >
                      <span
                        aria-hidden="true"
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-manila/75 text-ink"
                      >
                        <FolderOpen className="h-4.5 w-4.5" strokeWidth={1.7} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-sans text-sm font-semibold text-ink">
                          {folder.name}
                        </span>
                        <span className="mt-0.5 block truncate font-mono text-[9px] uppercase tracking-[0.08em] text-ink-soft/90">
                          {folder.path}
                        </span>
                      </span>
                      <ChevronRight
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-ink-soft/90"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {files.length > 0 ? (
            <section aria-labelledby="search-files-heading">
              <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-line pb-2">
                <h2
                  id="search-files-heading"
                  className="font-sans text-xs font-medium text-ink-soft"
                >
                  Files
                </h2>
                <span className="font-mono text-[10px] text-ink-soft/90">
                  {files.length}
                </span>
              </div>
              <ul className="space-y-2">
                {files.map((file) => (
                  <li key={file.id}>
                    <button
                      type="button"
                      onClick={() => onDownload(file)}
                      aria-label={`Download ${file.name}`}
                      className="flex w-full items-center gap-3 rounded-xl border border-line bg-paper-light px-4 py-3 text-left hover:border-ink/20 hover:bg-paper"
                    >
                      <span
                        aria-hidden="true"
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-paper-deep/60 text-ink"
                      >
                        <FileGlyph
                          contentType={file.contentType}
                          name={file.name}
                          className="h-4.5 w-4.5"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-sans text-sm font-semibold text-ink">
                          {file.name}
                        </span>
                        <span className="mt-0.5 block truncate font-mono text-[9px] uppercase tracking-[0.08em] text-ink-soft/90">
                          {formatBytes(file.sizeBytes)} · {file.path}
                        </span>
                      </span>
                      <Download
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-ink-soft/90"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </section>
  );
}
