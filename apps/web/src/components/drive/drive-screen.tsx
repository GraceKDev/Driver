"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ChevronRight,
  FolderPlus,
  RefreshCw,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, type ChangeEvent } from "react";
import { CreateFolderDialog, DeleteDialog, RenameDialog } from "@/components/drive/dialogs";
import { DriveSkeleton } from "@/components/drive/drive-skeleton";
import { EmptyState } from "@/components/drive/empty-state";
import { FileCard, FolderCard } from "@/components/drive/drive-cards";
import { Notice, type NoticeMessage } from "@/components/drive/notice";
import { SearchResults } from "@/components/drive/search-results";
import { Sidebar, type DriveView } from "@/components/drive/sidebar";
import { StorageMeter } from "@/components/drive/storage-meter";
import { Topbar, type DriveLayout } from "@/components/drive/topbar";
import { TrashList } from "@/components/drive/trash-list";
import { UploadQueue } from "@/components/drive/upload-queue";
import { UploadZone } from "@/components/drive/upload-zone";
import { Button, buttonClasses } from "@/components/ui/button";
import { ApiError, api, friendlyMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import { driveHref, pluralize } from "@/lib/format";
import { invalidateDriveData } from "@/lib/query-utils";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useUploads } from "@/lib/use-uploads";
import type {
  BreadcrumbDto,
  FileDto,
  FolderDto,
  StorageDto,
  TrashItemDto,
  UserDto,
} from "@/lib/types";

type RenameTarget = {
  kind: "folder" | "file";
  id: string;
  name: string;
};

type DeleteTarget = RenameTarget & {
  mode: "trash" | "forever";
};

function driveTitle(folderId: string | null, breadcrumbs: BreadcrumbDto[]) {
  if (!folderId) {
    return "My Drive";
  }
  return breadcrumbs[breadcrumbs.length - 1]?.name ?? "A folder";
}

function DriveCardsSkeleton({ label }: { label: string }) {
  return (
    <div aria-busy="true" aria-label={label} className="mt-7 space-y-8">
      <div>
        <div className="mb-3 h-2.5 w-20 rounded bg-paper-deep" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className="h-44 rounded-xl border border-line bg-paper-light/50"
            />
          ))}
        </div>
      </div>
      <p className="sr-only">{label}</p>
    </div>
  );
}

function ErrorPanel({
  title,
  message,
  onRetry,
  missing,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
  missing?: boolean;
}) {
  return (
    <div
      role="alert"
      className="mt-7 flex flex-col items-start gap-4 rounded-2xl border border-marker/25 bg-accent-soft px-5 py-6 sm:flex-row"
    >
      <span
        aria-hidden="true"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-paper-light text-marker"
      >
        <AlertTriangle className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-2xl leading-tight tracking-[-0.02em] text-ink">
          {title}
        </h2>
        <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-ink-soft">
          {message}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        {onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
            Try again
          </Button>
        ) : null}
        {missing ? (
          <Link
            href={driveHref(null)}
            className={buttonClasses({ variant: "paper", size: "sm" })}
          >
            Back to My Drive
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function MeError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <div className="desk-surface flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-line bg-paper-light p-6 shadow-[0_20px_60px_rgb(36_33_28_/_0.1)] sm:p-8">
        <h1 className="font-display text-3xl leading-tight tracking-[-0.03em] text-ink">
          The desk wouldn’t open.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          {friendlyMessage(error)}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="marker" size="md" onClick={onRetry}>
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            Try again
          </Button>
          <Link
            href="/sign-in?next=/drive"
            className={buttonClasses({ variant: "outline", size: "md" })}
          >
            Sign in again
          </Link>
        </div>
      </div>
    </div>
  );
}

function StorageForMobile({ storage }: { storage: StorageDto }) {
  return <StorageMeter storage={storage} compact className="mt-4 max-w-xs lg:hidden" />;
}

export function DriveScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const rawFolder = searchParams.get("folder");
  const folderId = rawFolder && rawFolder.trim().length > 0 ? rawFolder : null;
  const view: DriveView = searchParams.get("view") === "trash" ? "trash" : "drive";
  const highlightedId = searchParams.get("highlight");

  const routeKey = `${view}:${folderId ?? "root"}`;
  const [searchDraft, setSearchDraft] = useState({
    routeKey,
    value: "",
  });
  const searchQuery = searchDraft.routeKey === routeKey ? searchDraft.value : "";
  const setSearchQuery = (value: string) => {
    setSearchDraft({ routeKey, value });
  };
  const trimmedSearch = searchQuery.trim();
  const debouncedSearch = useDebouncedValue(trimmedSearch, 280);
  const activeSearchTerm =
    debouncedSearch.length > 0 ? debouncedSearch : trimmedSearch;
  const isSearching = trimmedSearch.length > 0;

  const [layout, setLayout] = useState<DriveLayout>("grid");
  const [notice, setNotice] = useState<NoticeMessage | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<RenameTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploads = useUploads();

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: ({ signal }) => api.me(signal),
  });

  const driveQuery = useQuery({
    queryKey: ["drive", folderId],
    queryFn: ({ signal }) => api.drive(folderId, signal),
    enabled: view === "drive",
  });

  const trashQuery = useQuery({
    queryKey: ["trash"],
    queryFn: ({ signal }) => api.trash(signal),
    enabled: view === "trash",
  });

  const showNotice = (tone: NoticeMessage["tone"], message: string) => {
    setNotice({ tone, message });
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFiles = (files: File[]) => {
    uploads.addFiles(files, view === "drive" ? folderId : null);
  };

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const openFolder = (folder: FolderDto) => {
    setSearchQuery("");
    router.push(driveHref(folder.id));
  };

  const openFolderById = (id: string) => {
    setSearchQuery("");
    router.push(driveHref(id));
  };

  const handleDownload = async (file: { id: string; name: string }) => {
    try {
      const { url } = await api.downloadUrl(file.id);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.rel = "noopener";
      anchor.download = file.name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      showNotice("success", `Download started for “${file.name}”.`);
    } catch (error) {
      showNotice("error", friendlyMessage(error));
    }
  };

  const handleRestore = async (item: TrashItemDto) => {
    setRestoringId(item.id);
    try {
      if (item.kind === "folder") {
        await api.restoreFolder(item.id);
      } else {
        await api.restoreFile(item.id);
      }
      invalidateDriveData(queryClient);
      showNotice("success", `“${item.name}” is back on the desk.`);
    } catch (error) {
      showNotice("error", friendlyMessage(error));
    } finally {
      setRestoringId(null);
    }
  };

  const requestDeleteFile = (file: FileDto) => {
    setDeleteTarget({ kind: "file", id: file.id, name: file.name, mode: "trash" });
  };

  const requestDeleteFolder = (folder: FolderDto) => {
    setDeleteTarget({
      kind: "folder",
      id: folder.id,
      name: folder.name,
      mode: "trash",
    });
  };

  const requestRenameFile = (file: FileDto) => {
    setRenameTarget({ kind: "file", id: file.id, name: file.name });
  };

  const requestRenameFolder = (folder: FolderDto) => {
    setRenameTarget({ kind: "folder", id: folder.id, name: folder.name });
  };

  if (meQuery.isPending) {
    return <DriveSkeleton />;
  }

  if (meQuery.isError || !meQuery.data) {
    return (
      <MeError
        error={meQuery.error}
        onRetry={() => void meQuery.refetch()}
      />
    );
  }

  const user: UserDto = meQuery.data;
  const currentStorage = view === "trash" ? trashQuery.data?.storage : driveQuery.data?.storage;
  const storage: StorageDto = currentStorage ?? {
    usedBytes: user.storageUsedBytes,
    quotaBytes: user.storageQuotaBytes,
  };

  const breadcrumbs = driveQuery.data?.breadcrumbs ?? [];
  const folders = driveQuery.data?.folders ?? [];
  const files = driveQuery.data?.files ?? [];
  const totalItems = folders.length + files.length;
  const title = driveTitle(folderId, breadcrumbs);
  const missingFolder =
    driveQuery.error instanceof ApiError && driveQuery.error.status === 404;

  const cardGrid =
    layout === "grid"
      ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      : "space-y-2";
  const sectionHeading =
    "mb-3 flex items-baseline justify-between gap-3 border-b border-line pb-2";

  return (
    <div className="desk-surface min-h-screen overflow-x-clip">
      <Sidebar
        user={user}
        storage={storage}
        view={view}
        onNewFolder={() => setCreateOpen(true)}
        onUpload={openFilePicker}
        onNavigate={() => setSearchQuery("")}
      />

      <div className="lg:pl-[17rem]">
        <Topbar
          search={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchClear={() => setSearchQuery("")}
          layout={layout}
          onLayoutChange={setLayout}
          showLayout={!isSearching && view === "drive"}
        />

        <main
          id="main"
          className="mx-auto max-w-6xl px-4 pb-16 pt-5 sm:px-6 sm:pt-7"
        >
          <Notice
            notice={notice}
            onDismiss={() => setNotice(null)}
            className="mb-4"
          />

          {uploads.items.length > 0 ? (
            <UploadQueue
              items={uploads.items}
              onDismiss={uploads.dismissUpload}
              onClearFinished={uploads.clearFinished}
              className="mb-6"
            />
          ) : null}

          {isSearching ? (
            <SearchResults
              term={activeSearchTerm}
              onOpenFolder={openFolderById}
              onDownload={handleDownload}
              onClear={() => setSearchQuery("")}
            />
          ) : view === "trash" ? (
            <>
              <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="font-display text-4xl leading-tight tracking-[-0.03em] text-ink sm:text-5xl">
                    Trash
                  </h1>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft/90">
                    second thoughts, kept in a drawer
                  </p>
                </div>
                <Link
                  href={driveHref(null)}
                  className={buttonClasses({ variant: "outline", size: "md" })}
                >
                  Back to My Drive
                </Link>
              </div>

              <StorageForMobile storage={storage} />

              {trashQuery.isPending ? (
                <DriveCardsSkeleton label="Taking inventory of second thoughts…" />
              ) : trashQuery.isError ? (
                <ErrorPanel
                  title="The trash drawer is jammed."
                  message={friendlyMessage(trashQuery.error)}
                  onRetry={() => void trashQuery.refetch()}
                />
              ) : (trashQuery.data?.items.length ?? 0) === 0 ? (
                <EmptyState
                  kind="trash"
                  title="Nothing in the bin."
                  description="No half-regrets here. Anything you delete will wait in this drawer until you decide."
                  action={
                    <Link
                      href={driveHref(null)}
                      className={buttonClasses({ variant: "paper", size: "md" })}
                    >
                      Back to My Drive
                    </Link>
                  }
                  className="mt-7"
                />
              ) : (
                <div className="mt-7">
                  <div className={sectionHeading}>
                    <h2 className="font-sans text-xs font-medium text-ink-soft">
                      Waiting for a decision
                    </h2>
                    <span className="font-mono text-[10px] text-ink-soft/90">
                      {pluralize(trashQuery.data?.items.length ?? 0, "item")}
                    </span>
                  </div>
                  <TrashList
                    items={trashQuery.data?.items ?? []}
                    restoringId={restoringId}
                    onRestore={handleRestore}
                    onDeleteForever={(item) =>
                      setDeleteTarget({
                        kind: item.kind,
                        id: item.id,
                        name: item.name,
                        mode: "forever",
                      })
                    }
                  />
                  <p className="mt-6 text-xs leading-relaxed text-ink-soft/90">
                    Delete forever means forever. No undo after that.
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  {folderId ? (
                    <nav
                      aria-label="Breadcrumb"
                      className="flex flex-wrap items-center gap-1 font-sans text-xs text-ink-soft/90"
                    >
                      <Link href={driveHref(null)} className="hover:text-ink">
                        My Drive
                      </Link>
                      {breadcrumbs.map((crumb) => {
                        const current = crumb.id === folderId;
                        return (
                          <span
                            key={crumb.id}
                            className="flex min-w-0 items-center gap-1"
                          >
                            <ChevronRight
                              aria-hidden="true"
                              className="h-3 w-3 shrink-0"
                            />
                            <Link
                              href={driveHref(crumb.id)}
                              aria-current={current ? "page" : undefined}
                              className={cn(
                                "max-w-[12rem] truncate hover:text-ink",
                                current && "text-ink",
                              )}
                            >
                              {crumb.name}
                            </Link>
                          </span>
                        );
                      })}
                    </nav>
                  ) : null}

                  <h1
                    className={cn(
                      "break-words font-display text-4xl leading-tight tracking-[-0.03em] text-ink sm:text-5xl",
                      folderId && "mt-2",
                    )}
                  >
                    {title}
                  </h1>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft/90">
                    {folderId
                      ? "everything you put in this drawer"
                      : "everything you promised to sort later"}
                  </p>
                  <p className="mt-2.5 font-sans text-xs text-ink-soft/90">
                    {driveQuery.data
                      ? `${pluralize(folders.length, "folder")} · ${pluralize(
                          files.length,
                          "file",
                        )}`
                      : "opening the drawer…"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setCreateOpen(true)}
                  >
                    <FolderPlus aria-hidden="true" className="h-4 w-4" />
                    New folder
                  </Button>
                  <Button
                    variant="ink"
                    size="md"
                    onClick={openFilePicker}
                  >
                    <Upload aria-hidden="true" className="h-4 w-4" />
                    Upload
                  </Button>
                </div>
              </div>

              <StorageForMobile storage={storage} />

              {driveQuery.isPending ? (
                <DriveCardsSkeleton label="Opening the drawer…" />
              ) : driveQuery.isError ? (
                <ErrorPanel
                  title={
                    missingFolder
                      ? "That drawer isn’t here."
                      : "The drawer got stuck."
                  }
                  message={
                    missingFolder
                      ? "It may have moved to Trash, or the link is out of date. The rest of the desk is still where you left it."
                      : friendlyMessage(driveQuery.error)
                  }
                  onRetry={
                    missingFolder ? undefined : () => void driveQuery.refetch()
                  }
                  missing={missingFolder}
                />
              ) : totalItems === 0 ? (
                <EmptyState
                  kind={folderId ? "folder" : "root"}
                  title={
                    folderId ? "This drawer is empty." : "An empty desk. Suspicious."
                  }
                  description={
                    folderId
                      ? "A blank slate, or maybe you already moved everything out. Either way, it’s tidy in here."
                      : "Start with a folder, or drop a file and let the beautiful mess begin."
                  }
                  action={
                    <>
                      <Button
                        variant="paper"
                        size="md"
                        onClick={() => setCreateOpen(true)}
                      >
                        <FolderPlus aria-hidden="true" className="h-4 w-4" />
                        New folder
                      </Button>
                      <Button
                        variant="marker"
                        size="md"
                        onClick={openFilePicker}
                      >
                        <Upload aria-hidden="true" className="h-4 w-4" />
                        Upload a file
                      </Button>
                    </>
                  }
                  className="mt-7"
                />
              ) : (
                <>
                  <div className="mt-5">
                    <UploadZone onBrowse={openFilePicker} onFiles={handleFiles} />
                  </div>

                  <div className="mt-7 space-y-8">
                    {folders.length > 0 ? (
                      <section aria-labelledby="folders-heading">
                        <div className={sectionHeading}>
                          <h2
                            id="folders-heading"
                            className="font-sans text-xs font-medium text-ink-soft"
                          >
                            Folders
                          </h2>
                          <span className="font-mono text-[10px] text-ink-soft/90">
                            {folders.length}
                          </span>
                        </div>
                        <div className={cardGrid}>
                          {folders.map((folder, index) => (
                            <FolderCard
                              key={folder.id}
                              folder={folder}
                              index={index}
                              layout={layout}
                              highlighted={highlightedId === folder.id}
                              onOpen={openFolder}
                              onRename={requestRenameFolder}
                              onDelete={requestDeleteFolder}
                            />
                          ))}
                        </div>
                      </section>
                    ) : null}

                    {files.length > 0 ? (
                      <section aria-labelledby="files-heading">
                        <div className={sectionHeading}>
                          <h2
                            id="files-heading"
                            className="font-sans text-xs font-medium text-ink-soft"
                          >
                            Files
                          </h2>
                          <span className="font-mono text-[10px] text-ink-soft/90">
                            {files.length}
                          </span>
                        </div>
                        <div className={cardGrid}>
                          {files.map((file, index) => (
                            <FileCard
                              key={file.id}
                              file={file}
                              index={index}
                              layout={layout}
                              highlighted={highlightedId === file.id}
                              onDownload={handleDownload}
                              onRename={requestRenameFile}
                              onDelete={requestDeleteFile}
                            />
                          ))}
                        </div>
                      </section>
                    ) : null}
                  </div>

                  <p className="mt-10 border-t border-line pt-4 text-xs leading-relaxed text-ink-soft/90">
                    Nothing here is judged. Except the folder called “stuff”.
                  </p>
                </>
              )}
            </>
          )}
        </main>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInput}
      />

      {createOpen ? (
        <CreateFolderDialog
          open
          onOpenChange={setCreateOpen}
          parentId={view === "drive" ? folderId : null}
          onCreated={(message) => {
            setCreateOpen(false);
            showNotice("success", message);
          }}
        />
      ) : null}

      {renameTarget ? (
        <RenameDialog
          open
          onOpenChange={(open) => {
            if (!open) {
              setRenameTarget(null);
            }
          }}
          kind={renameTarget.kind}
          id={renameTarget.id}
          currentName={renameTarget.name}
          onRenamed={(message) => {
            setRenameTarget(null);
            showNotice("success", message);
          }}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteDialog
          open
          onOpenChange={(open) => {
            if (!open) {
              setDeleteTarget(null);
            }
          }}
          mode={deleteTarget.mode}
          kind={deleteTarget.kind}
          id={deleteTarget.id}
          name={deleteTarget.name}
          onDeleted={(message) => {
            setDeleteTarget(null);
            showNotice("success", message);
          }}
        />
      ) : null}
    </div>
  );
}
