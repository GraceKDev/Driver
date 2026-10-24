"use client";

import { LayoutGrid, List, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

export type DriveLayout = "grid" | "list";

export function Topbar({
  search,
  onSearchChange,
  onSearchClear,
  layout,
  onLayoutChange,
  showLayout,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  layout: DriveLayout;
  onLayoutChange: (layout: DriveLayout) => void;
  showLayout: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:gap-4 sm:px-6">
        <div role="search" className="relative min-w-0 max-w-xl flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/90"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search files and folders…"
            aria-label="Search files and folders"
            autoComplete="off"
            spellCheck={false}
            maxLength={100}
            className="field-input h-10 text-sm"
            style={{ paddingLeft: "2.25rem", paddingRight: "2.5rem" }}
          />
          {search ? (
            <button
              type="button"
              onClick={onSearchClear}
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-ink-soft/90 hover:bg-ink/5 hover:text-ink"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {showLayout ? (
            <div
              role="group"
              aria-label="Change layout"
              className="flex shrink-0 items-center gap-0.5 rounded-lg border border-line bg-paper-light p-0.5"
            >
              <button
                type="button"
                onClick={() => onLayoutChange("grid")}
                aria-label="Grid layout"
                aria-pressed={layout === "grid"}
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-md",
                  layout === "grid"
                    ? "bg-ink text-paper"
                    : "text-ink-soft hover:bg-paper-deep hover:text-ink",
                )}
              >
                <LayoutGrid aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onLayoutChange("list")}
                aria-label="List layout"
                aria-pressed={layout === "list"}
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-md",
                  layout === "list"
                    ? "bg-ink text-paper"
                    : "text-ink-soft hover:bg-paper-deep hover:text-ink",
                )}
              >
                <List aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
