export type ApiUser = {
  id: string;
  displayName: string;
  email: string;
  storageUsedBytes: number;
  storageQuotaBytes: number;
};

export type ApiFolder = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiFile = {
  id: string;
  name: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
};

export type Breadcrumb = {
  id: string;
  name: string;
};

export type Storage = {
  usedBytes: number;
  quotaBytes: number;
};

export type DriveResponse = {
  folderId: string | null;
  breadcrumbs: Breadcrumb[];
  folders: ApiFolder[];
  files: ApiFile[];
  storage: Storage;
};

export type TrashItem = {
  id: string;
  name: string;
  kind: "folder" | "file";
  sizeBytes: number | null;
  deletedAt: string;
  originalPath: string;
};

export type TrashResponse = {
  items: TrashItem[];
  storage: Storage;
};

export type SearchResponse = {
  folders: Array<{ id: string; name: string; path: string }>;
  files: Array<{
    id: string;
    name: string;
    contentType: string;
    sizeBytes: number;
    folderId: string | null;
    path: string;
  }>;
};

export type UploadTicket = {
  fileId: string;
  uploadUrl: string;
  expiresAt: string;
};

export type ApiError = {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string[]>;
};
