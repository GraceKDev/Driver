import type {
  ApiErrorPayload,
  AuthLoginInput,
  AuthRegisterInput,
  CreateUploadInput,
  DriveResponse,
  FileDto,
  FolderDto,
  SearchResponse,
  TrashResponse,
  UploadTicketDto,
  UserDto,
} from "@/lib/types";

const PROXY_PREFIX = "/api/proxy";

export class ApiError extends Error {
  readonly status: number;
  readonly payload: ApiErrorPayload | null;

  constructor(status: number, payload: ApiErrorPayload | null) {
    super(payload?.title || payload?.detail || `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }

  get title(): string | undefined {
    return this.payload?.title;
  }

  get detail(): string | undefined {
    return this.payload?.detail;
  }

  get fieldErrors(): Record<string, string[]> {
    return this.payload?.errors ?? {};
  }
}

export function friendlyMessage(
  error: unknown,
  fallback = "Something went sideways on the desk. Try again.",
): string {
  if (!(error instanceof ApiError)) {
    return "Couldn’t reach the desk. Check your connection and try again.";
  }

  if (error.status === 400 && Object.keys(error.fieldErrors).length > 0) {
    return (
      Object.values(error.fieldErrors).flat().find(Boolean) ??
      "Check the highlighted fields and try again."
    );
  }

  if (error.status === 401) {
    return error.title || "Your session has ended. Sign in again to get back to your desk.";
  }

  if (error.status === 403) {
    return error.title || "That move isn’t allowed here.";
  }

  if (error.status === 404) {
    return error.title || "That item isn’t on the desk anymore.";
  }

  if (error.status === 409) {
    return error.title || "Something with that name is already in this folder.";
  }

  if (error.status === 413) {
    return error.title || "That file is too big for this drawer.";
  }

  if (error.status === 423) {
    return error.title || "That account is temporarily locked. Try again in a few minutes.";
  }

  if (error.status === 429) {
    return error.title || "A few too many tries. Give it a minute, then try again.";
  }

  if (error.status >= 500) {
    return error.title || "The desk is having a moment. Try again in a little bit.";
  }

  return error.title || error.detail || fallback;
}

let redirectingToSignIn = false;

function redirectIfUnauthorized(status: number): void {
  if (
    status !== 401 ||
    redirectingToSignIn ||
    typeof window === "undefined" ||
    !window.location.pathname.startsWith("/drive")
  ) {
    return;
  }

  redirectingToSignIn = true;
  const next = `${window.location.pathname}${window.location.search}`;
  window.location.replace(`/sign-in?next=${encodeURIComponent(next)}`);
}

function isErrorPayload(value: unknown): value is ApiErrorPayload {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("accept", "application/json");

  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(`${PROXY_PREFIX}${path}`, {
    ...init,
    headers,
    credentials: "same-origin",
    cache: "no-store",
  });

  if (response.status === 204) {
    if (!response.ok) {
      throw new ApiError(response.status, null);
    }
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  let payload: unknown = null;

  if (contentType.includes("application/json")) {
    payload = await response.json().catch(() => null);
  } else {
    payload = await response.text().catch(() => "");
  }

  if (!response.ok) {
    redirectIfUnauthorized(response.status);
    throw new ApiError(
      response.status,
      isErrorPayload(payload) ? payload : null,
    );
  }

  return payload as T;
}

function jsonBody(value: unknown): string {
  return JSON.stringify(value);
}

function withQuery(path: string, params: Record<string, string | null | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export const api = {
  register(input: AuthRegisterInput): Promise<UserDto> {
    return apiFetch<UserDto>("/auth/register", {
      method: "POST",
      body: jsonBody(input),
    });
  },

  login(input: AuthLoginInput): Promise<UserDto> {
    return apiFetch<UserDto>("/auth/login", {
      method: "POST",
      body: jsonBody(input),
    });
  },

  logout(): Promise<void> {
    return apiFetch<void>("/auth/logout", { method: "POST" });
  },

  me(signal?: AbortSignal): Promise<UserDto> {
    return apiFetch<UserDto>("/auth/me", { signal });
  },

  drive(folderId: string | null, signal?: AbortSignal): Promise<DriveResponse> {
    return apiFetch<DriveResponse>(
      withQuery("/drive", { folderId }),
      { signal },
    );
  },

  trash(signal?: AbortSignal): Promise<TrashResponse> {
    return apiFetch<TrashResponse>("/drive/trash", { signal });
  },

  search(term: string, signal?: AbortSignal): Promise<SearchResponse> {
    return apiFetch<SearchResponse>(
      withQuery("/drive/search", { q: term }),
      { signal },
    );
  },

  createFolder(name: string, parentId: string | null): Promise<FolderDto> {
    return apiFetch<FolderDto>("/folders", {
      method: "POST",
      body: jsonBody({ name, parentId }),
    });
  },

  renameFolder(id: string, name: string): Promise<FolderDto> {
    return apiFetch<FolderDto>(`/folders/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: jsonBody({ name }),
    });
  },

  deleteFolder(id: string): Promise<void> {
    return apiFetch<void>(`/folders/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  restoreFolder(id: string): Promise<FolderDto> {
    return apiFetch<FolderDto>(
      `/folders/${encodeURIComponent(id)}/restore`,
      { method: "POST" },
    );
  },

  deleteFolderForever(id: string): Promise<void> {
    return apiFetch<void>(
      `/folders/${encodeURIComponent(id)}/permanent`,
      { method: "DELETE" },
    );
  },

  createUploadTicket(input: CreateUploadInput): Promise<UploadTicketDto> {
    return apiFetch<UploadTicketDto>("/files/uploads", {
      method: "POST",
      body: jsonBody(input),
    });
  },

  completeUpload(fileId: string, signal?: AbortSignal): Promise<FileDto> {
    return apiFetch<FileDto>(
      `/files/${encodeURIComponent(fileId)}/complete`,
      { method: "POST", signal },
    );
  },

  downloadUrl(fileId: string): Promise<{ url: string }> {
    return apiFetch<{ url: string }>(
      `/files/${encodeURIComponent(fileId)}/download`,
    );
  },

  renameFile(id: string, name: string): Promise<FileDto> {
    return apiFetch<FileDto>(`/files/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: jsonBody({ name }),
    });
  },

  deleteFile(id: string): Promise<void> {
    return apiFetch<void>(`/files/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  restoreFile(id: string): Promise<FileDto> {
    return apiFetch<FileDto>(`/files/${encodeURIComponent(id)}/restore`, {
      method: "POST",
    });
  },

  deleteFileForever(id: string): Promise<void> {
    return apiFetch<void>(`/files/${encodeURIComponent(id)}/permanent`, {
      method: "DELETE",
    });
  },
};
