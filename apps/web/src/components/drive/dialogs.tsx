"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, X } from "lucide-react";
import {
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { ServerBanner } from "@/components/ui/server-banner";
import { ApiError, api, friendlyMessage } from "@/lib/api";
import { invalidateDriveData } from "@/lib/query-utils";
import type { DriveItemKind } from "@/lib/types";

function PaperDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  initialFocusRef,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
  initialFocusRef?: RefObject<HTMLElement | null>;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-ink/45" />
        <Dialog.Content
          onOpenAutoFocus={(event) => {
            if (initialFocusRef?.current) {
              event.preventDefault();
              initialFocusRef.current.focus();
            }
          }}
          className="fixed left-1/2 top-1/2 z-[70] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-paper-light p-6 shadow-[0_24px_80px_rgb(36_33_28_/_0.22)] outline-none sm:p-7"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-display text-2xl leading-tight tracking-[-0.02em] text-ink">
                {title}
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Close dialog"
                className="shrink-0"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="mt-2.5 text-sm leading-relaxed text-ink-soft">
            {description}
          </Dialog.Description>
          <div className="mt-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function validateName(raw: string): string | null {
  const name = raw.trim();
  if (!name) {
    return "A name is required.";
  }
  if (name.length > 255) {
    return "Keep the name to 255 characters or fewer.";
  }
  if (name.includes("/") || name.includes("\\")) {
    return "Names cannot contain slashes.";
  }
  return null;
}

export function CreateFolderDialog({
  open,
  onOpenChange,
  parentId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId: string | null;
  onCreated: (message: string) => void;
}) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (folderName: string) => api.createFolder(folderName, parentId),
    onSuccess: (folder) => {
      invalidateDriveData(queryClient);
      onCreated(`Folder “${folder.name}” created.`);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.fieldErrors.name?.[0]) {
        setFieldError(error.fieldErrors.name[0]);
      }
      setServerError(friendlyMessage(error));
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);
    const error = validateName(name);
    setFieldError(error);
    if (error) {
      return;
    }
    mutation.mutate(name.trim());
  };

  return (
    <PaperDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New folder"
      description="Give the pile a name. You can always rename it when the pile changes its mind."
      initialFocusRef={inputRef}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <ServerBanner message={serverError} />
        <TextField
          ref={inputRef}
          id="new-folder-name"
          label="Folder name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setFieldError(null);
          }}
          placeholder="Tax receipts, probably"
          maxLength={255}
          required
          error={fieldError ?? undefined}
          disabled={mutation.isPending}
        />
        <div className="flex flex-wrap justify-end gap-3 pt-1">
          <Button
            variant="outline"
            size="md"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="marker"
            size="md"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Making folder…" : "Create folder"}
          </Button>
        </div>
      </form>
    </PaperDialog>
  );
}

export function RenameDialog({
  open,
  onOpenChange,
  kind,
  id,
  currentName,
  onRenamed,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: DriveItemKind;
  id: string;
  currentName: string;
  onRenamed: (message: string) => void;
}) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(currentName);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (nextName: string) =>
      kind === "folder"
        ? api.renameFolder(id, nextName)
        : api.renameFile(id, nextName),
    onSuccess: (item) => {
      invalidateDriveData(queryClient);
      onRenamed(`Renamed to “${item.name}”.`);
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        const message =
          error.fieldErrors.name?.[0] ?? error.fieldErrors.fileName?.[0];
        if (message) {
          setFieldError(message);
        }
      }
      setServerError(friendlyMessage(error));
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);
    const error = validateName(name);
    setFieldError(error);
    if (error) {
      return;
    }
    mutation.mutate(name.trim());
  };

  return (
    <PaperDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Rename ${kind}`}
      description="A clearer name, a calmer desk. The contents stay exactly where they are."
      initialFocusRef={inputRef}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <ServerBanner message={serverError} />
        <TextField
          ref={inputRef}
          id="rename-item-name"
          label={`${kind === "folder" ? "Folder" : "File"} name`}
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setFieldError(null);
          }}
          maxLength={255}
          required
          error={fieldError ?? undefined}
          disabled={mutation.isPending}
        />
        <div className="flex flex-wrap justify-end gap-3 pt-1">
          <Button
            variant="outline"
            size="md"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="marker"
            size="md"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Renaming…" : "Save name"}
          </Button>
        </div>
      </form>
    </PaperDialog>
  );
}

export function DeleteDialog({
  open,
  onOpenChange,
  mode,
  kind,
  id,
  name,
  onDeleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "trash" | "forever";
  kind: DriveItemKind;
  id: string;
  name: string;
  onDeleted: (message: string) => void;
}) {
  const queryClient = useQueryClient();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const isForever = mode === "forever";

  const mutation = useMutation({
    mutationFn: () => {
      if (isForever) {
        return kind === "folder"
          ? api.deleteFolderForever(id)
          : api.deleteFileForever(id);
      }
      return kind === "folder" ? api.deleteFolder(id) : api.deleteFile(id);
    },
    onSuccess: () => {
      invalidateDriveData(queryClient);
      onDeleted(
        isForever
          ? `“${name}” is gone for good.`
          : `“${name}” moved to Trash. You can restore it there.`,
      );
    },
    onError: (error) => {
      setServerError(friendlyMessage(error));
    },
  });

  return (
    <PaperDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isForever ? "Delete forever?" : `Move ${kind} to Trash?`}
      description={
        isForever
          ? `“${name}” will be removed permanently. This cannot be undone.`
          : kind === "folder"
            ? `“${name}” and everything inside will go to Trash. You can restore the folder later.`
            : `“${name}” will go to Trash. You can bring it back whenever you like.`
      }
      initialFocusRef={cancelRef}
    >
      <div className="space-y-4">
        <ServerBanner message={serverError} />
        {isForever ? (
          <div className="flex items-start gap-3 rounded-lg border border-marker/25 bg-accent-soft px-3.5 py-3">
            <Trash2
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0 text-marker"
            />
            <p className="text-xs leading-relaxed text-ink-soft">
              Permanent means permanent. If there is any doubt, move it to
              Trash and sleep on it.
            </p>
          </div>
        ) : null}
        <div className="flex flex-wrap justify-end gap-3 pt-1">
          <Button
            ref={cancelRef}
            variant="outline"
            size="md"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            {isForever ? "Keep it" : "Cancel"}
          </Button>
          <Button
            variant="marker"
            size="md"
            onClick={() => {
              setServerError(null);
              mutation.mutate();
            }}
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? "Deleting…"
              : isForever
                ? "Delete forever"
                : "Move to Trash"}
          </Button>
        </div>
      </div>
    </PaperDialog>
  );
}
