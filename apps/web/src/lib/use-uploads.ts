"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, friendlyMessage } from "@/lib/api";
import { MAX_UPLOAD_BYTES, formatBytes } from "@/lib/format";
import { invalidateDriveData } from "@/lib/query-utils";

export type UploadStatus =
  | "queued"
  | "preparing"
  | "uploading"
  | "finishing"
  | "done"
  | "error";

export type UploadItem = {
  id: string;
  name: string;
  sizeBytes: number;
  progress: number;
  status: UploadStatus;
  error?: string;
};

type UploadJob = {
  itemId: string;
  file: File;
  folderId: string | null;
};

const CONCURRENCY = 2;

class UploadSendError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadSendError";
  }
}

function sendToStorage(
  url: string,
  file: File,
  contentType: string,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", url, true);
    request.setRequestHeader("Content-Type", contentType);

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }
      const percent = Math.round((event.loaded / event.total) * 100);
      onProgress(Math.min(99, Math.max(1, percent)));
    };

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve();
        return;
      }
      reject(
        new UploadSendError(
          "Storage refused the file. Give it a moment and try again.",
        ),
      );
    };

    request.onerror = () => {
      reject(
        new UploadSendError(
          "The file didn’t reach storage. Check your connection and try again.",
        ),
      );
    };

    request.onabort = () => {
      reject(new UploadSendError("That upload was interrupted. Try again."));
    };

    request.send(file);
  });
}

function makeUploadId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useUploads() {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<UploadItem[]>([]);
  const queueRef = useRef<UploadJob[]>([]);
  const activeRef = useRef(0);
  const pumpRef = useRef<() => void>(() => undefined);

  const updateItem = useCallback(
    (id: string, patch: Partial<UploadItem>) => {
      setItems((current) =>
        current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      );
    },
    [],
  );

  const runJob = useCallback(
    async (job: UploadJob) => {
      const { itemId, file, folderId } = job;

      try {
        updateItem(itemId, { status: "preparing", progress: 0 });
        const contentType = file.type.trim() || "application/octet-stream";
        const ticket = await api.createUploadTicket({
          folderId,
          fileName: file.name,
          contentType,
          sizeBytes: file.size,
        });

        updateItem(itemId, { status: "uploading", progress: 1 });
        await sendToStorage(
          ticket.uploadUrl,
          file,
          contentType,
          (progress) => updateItem(itemId, { progress }),
        );

        updateItem(itemId, { status: "finishing", progress: 100 });
        const saved = await api.completeUpload(ticket.fileId);
        updateItem(itemId, {
          status: "done",
          progress: 100,
          name: saved.name,
          sizeBytes: saved.sizeBytes,
          error: undefined,
        });
        invalidateDriveData(queryClient);
      } catch (error) {
        updateItem(itemId, {
          status: "error",
          error:
            error instanceof UploadSendError
              ? error.message
              : friendlyMessage(
                  error,
                  "That file didn’t make it onto the desk. Try again.",
                ),
        });
      }
    },
    [queryClient, updateItem],
  );

  const pump = useCallback(() => {
    while (activeRef.current < CONCURRENCY && queueRef.current.length > 0) {
      const job = queueRef.current.shift();
      if (!job) {
        break;
      }
      activeRef.current += 1;
      void runJob(job).finally(() => {
        activeRef.current = Math.max(0, activeRef.current - 1);
        pumpRef.current();
      });
    }
  }, [runJob]);

  useEffect(() => {
    pumpRef.current = pump;
  }, [pump]);

  const addFiles = useCallback(
    (files: File[], folderId: string | null) => {
      const nextItems: UploadItem[] = [];
      const jobs: UploadJob[] = [];

      files.forEach((file) => {
        const itemId = makeUploadId();
        const base = {
          id: itemId,
          name: file.name || "Untitled file",
          sizeBytes: file.size,
          progress: 0,
        };

        if (file.size <= 0) {
          nextItems.push({
            ...base,
            status: "error",
            error: "That file is empty, so there’s nothing to file away.",
          });
          return;
        }

        if (file.size > MAX_UPLOAD_BYTES) {
          nextItems.push({
            ...base,
            status: "error",
            error: `That file is larger than the ${formatBytes(
              MAX_UPLOAD_BYTES,
            )} limit. Try a smaller copy.`,
          });
          return;
        }

        nextItems.push({ ...base, status: "queued" });
        jobs.push({ itemId, file, folderId });
      });

      if (nextItems.length === 0) {
        return;
      }

      setItems((current) => [...current, ...nextItems]);
      queueRef.current.push(...jobs);
      pump();
    },
    [pump],
  );

  const dismissUpload = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const clearFinished = useCallback(() => {
    setItems((current) =>
      current.filter(
        (item) => item.status !== "done" && item.status !== "error",
      ),
    );
  }, []);

  return { items, addFiles, dismissUpload, clearFinished };
}
