"use client";

import {
  ArrowUpRight,
  Download,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dropdown,
  DropdownTrigger,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
} from "@/components/ui/menu";
import { FileGlyph, getFileTint } from "@/components/drive/file-glyph";
import { cn } from "@/lib/cn";
import {
  fileKindLabel,
  formatBytes,
  formatDate,
  getFileKind,
} from "@/lib/format";
import type { FileDto, FolderDto } from "@/lib/types";

type Layout = "grid" | "list";

type FolderCardProps = {
  folder: FolderDto;
  index: number;
  layout: Layout;
  highlighted?: boolean;
  onOpen: (folder: FolderDto) => void;
  onRename: (folder: FolderDto) => void;
  onDelete: (folder: FolderDto) => void;
};

export function FolderCard({
  folder,
  layout,
  highlighted = false,
  onOpen,
  onRename,
  onDelete,
}: FolderCardProps) {
  if (layout === "list") {
    return (
      <article
        className={cn(
          "relative flex items-center gap-3 rounded-xl border bg-paper-light px-3.5 py-3 hover:bg-paper sm:gap-4",
          highlighted
            ? "border-marker ring-2 ring-marker/15"
            : "border-line hover:border-ink/20",
        )}
      >
        <button
          type="button"
          onClick={() => onOpen(folder)}
          aria-label={`Open folder ${folder.name}`}
          className="flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4"
        >
          <span
            aria-hidden="true"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-ink/5 bg-manila/75 text-ink"
          >
            <FolderOpen className="h-4.5 w-4.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-sans text-sm font-semibold text-ink">
              {folder.name}
            </span>
            <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.1em] text-ink-soft/90">
              Folder · updated {formatDate(folder.updatedAt)}
            </span>
          </span>
        </button>
        {highlighted ? (
          <span className="hidden font-sans text-xs font-medium text-marker sm:inline">
            Found
          </span>
        ) : null}
        <FolderActions
          folder={folder}
          onOpen={onOpen}
          onRename={onRename}
          onDelete={onDelete}
        />
      </article>
    );
  }

  return (
    <article className="relative">
      <button
        type="button"
        onClick={() => onOpen(folder)}
        aria-label={`Open folder ${folder.name}`}
        className="block w-full text-left"
      >
        <div
          className={cn(
            "paper-card flex min-h-[10.75rem] flex-col p-4 paper-shadow-sm hover:border-marker/35 hover:bg-[#fffdf8]",
            highlighted && "border-marker ring-2 ring-marker/15",
          )}
        >
          <div className="flex items-start justify-between gap-3 pr-9">
            <span
              aria-hidden="true"
              className="grid h-10 w-10 place-items-center rounded-lg border border-ink/5 bg-manila/75 text-ink"
            >
              <FolderOpen className="h-5 w-5" strokeWidth={1.7} />
            </span>
          </div>
          <h3 className="mt-5 line-clamp-2 break-words font-sans text-[15px] font-semibold leading-snug text-ink">
            {folder.name}
          </h3>
          <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-soft/90">
            Updated {formatDate(folder.updatedAt)}
          </p>
          <div className="mt-auto flex items-center justify-between gap-3 pt-4">
            <span className="font-sans text-xs font-medium text-marker">
              Open folder
            </span>
            {highlighted ? (
              <span className="font-sans text-[11px] font-medium text-marker">
                Found
              </span>
            ) : (
              <ArrowUpRight
                aria-hidden="true"
                className="h-3.5 w-3.5 text-marker/60"
              />
            )}
          </div>
        </div>
      </button>
      <div className="absolute right-2.5 top-2.5 z-20">
        <FolderActions
          folder={folder}
          onOpen={onOpen}
          onRename={onRename}
          onDelete={onDelete}
        />
      </div>
    </article>
  );
}

function FolderActions({
  folder,
  onOpen,
  onRename,
  onDelete,
}: {
  folder: FolderDto;
  onOpen: (folder: FolderDto) => void;
  onRename: (folder: FolderDto) => void;
  onDelete: (folder: FolderDto) => void;
}) {
  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Actions for folder ${folder.name}`}
        >
          <MoreHorizontal aria-hidden="true" className="h-4 w-4" />
        </Button>
      </DropdownTrigger>
      <MenuContent>
        <MenuLabel>
          <span className="block max-w-[13rem] truncate">{folder.name}</span>
        </MenuLabel>
        <MenuItem onSelect={() => onOpen(folder)}>
          <FolderOpen aria-hidden="true" className="h-4 w-4" />
          Open
        </MenuItem>
        <MenuItem onSelect={() => onRename(folder)}>
          <Pencil aria-hidden="true" className="h-4 w-4" />
          Rename
        </MenuItem>
        <MenuSeparator />
        <MenuItem
          onSelect={() => onDelete(folder)}
          className="text-marker data-[highlighted]:bg-accent-soft"
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
          Move to Trash
        </MenuItem>
      </MenuContent>
    </Dropdown>
  );
}

type FileCardProps = {
  file: FileDto;
  index: number;
  layout: Layout;
  highlighted?: boolean;
  onDownload: (file: FileDto) => void;
  onRename: (file: FileDto) => void;
  onDelete: (file: FileDto) => void;
};

export function FileCard({
  file,
  layout,
  highlighted = false,
  onDownload,
  onRename,
  onDelete,
}: FileCardProps) {
  const kind = getFileKind(file.contentType, file.name);
  const tint = getFileTint(file.contentType, file.name);

  if (layout === "list") {
    return (
      <article
        className={cn(
          "relative flex items-center gap-3 rounded-xl border bg-paper-light px-3.5 py-3 hover:bg-paper sm:gap-4",
          highlighted
            ? "border-marker ring-2 ring-marker/15"
            : "border-line hover:border-ink/20",
        )}
      >
        <button
          type="button"
          onClick={() => onDownload(file)}
          aria-label={`Download ${file.name}`}
          className="flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4"
        >
          <span
            aria-hidden="true"
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-ink/5",
              tint,
            )}
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
            <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.1em] text-ink-soft/90">
              {fileKindLabel(kind)} · {formatBytes(file.sizeBytes)} ·{" "}
              {formatDate(file.updatedAt)}
            </span>
          </span>
        </button>
        {highlighted ? (
          <span className="hidden font-sans text-xs font-medium text-marker sm:inline">
            Found
          </span>
        ) : null}
        <FileActions
          file={file}
          onDownload={onDownload}
          onRename={onRename}
          onDelete={onDelete}
        />
      </article>
    );
  }

  return (
    <article className="relative">
      <button
        type="button"
        onClick={() => onDownload(file)}
        aria-label={`Download ${file.name}`}
        className="block w-full text-left"
      >
        <div
          className={cn(
            "paper-card flex min-h-[10.75rem] flex-col p-4 paper-shadow-sm hover:border-marker/35 hover:bg-[#fffdf8]",
            highlighted && "border-marker ring-2 ring-marker/15",
          )}
        >
          <div className="flex items-start justify-between gap-3 pr-9">
            <span
              aria-hidden="true"
              className={cn(
                "grid h-10 w-10 place-items-center rounded-lg border border-ink/5",
                tint,
              )}
            >
              <FileGlyph
                contentType={file.contentType}
                name={file.name}
                className="h-5 w-5"
              />
            </span>
          </div>
          <h3 className="mt-5 line-clamp-2 break-words font-sans text-[15px] font-semibold leading-snug text-ink">
            {file.name}
          </h3>
          <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-soft/90">
            {fileKindLabel(kind)} · {formatBytes(file.sizeBytes)} ·{" "}
            {formatDate(file.updatedAt)}
          </p>
          <div className="mt-auto flex items-center justify-between gap-3 pt-4">
            <span className="font-sans text-xs font-medium text-pen">
              Download
            </span>
            {highlighted ? (
              <span className="font-sans text-[11px] font-medium text-marker">
                Found
              </span>
            ) : (
              <Download
                aria-hidden="true"
                className="h-3.5 w-3.5 text-pen/55"
              />
            )}
          </div>
        </div>
      </button>
      <div className="absolute right-2.5 top-2.5 z-20">
        <FileActions
          file={file}
          onDownload={onDownload}
          onRename={onRename}
          onDelete={onDelete}
        />
      </div>
    </article>
  );
}

function FileActions({
  file,
  onDownload,
  onRename,
  onDelete,
}: {
  file: FileDto;
  onDownload: (file: FileDto) => void;
  onRename: (file: FileDto) => void;
  onDelete: (file: FileDto) => void;
}) {
  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Actions for file ${file.name}`}
          className="bg-paper-light/55"
        >
          <MoreHorizontal aria-hidden="true" className="h-4 w-4" />
        </Button>
      </DropdownTrigger>
      <MenuContent>
        <MenuLabel>
          <span className="block max-w-[13rem] truncate">{file.name}</span>
        </MenuLabel>
        <MenuItem onSelect={() => onDownload(file)}>
          <Download aria-hidden="true" className="h-4 w-4" />
          Download
        </MenuItem>
        <MenuItem onSelect={() => onRename(file)}>
          <Pencil aria-hidden="true" className="h-4 w-4" />
          Rename
        </MenuItem>
        <MenuSeparator />
        <MenuItem
          onSelect={() => onDelete(file)}
          className="text-marker data-[highlighted]:bg-accent-soft"
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
          Move to Trash
        </MenuItem>
      </MenuContent>
    </Dropdown>
  );
}
