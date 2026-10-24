export type UserDto = {
  id: string;
  displayName: string;
  email: string;
  storageUsedBytes: number;
  storageQuotaBytes: number;
};

export type FolderDto = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type FileDto = {
  id: string;
  name: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
};

export type BreadcrumbDto = {
  id: string;
  name: string;
};

export type StorageDto = {
  usedBytes: number;
  quotaBytes: number;
};

export type DriveResponse = {
  folderId: string | null;
  breadcrumbs: BreadcrumbDto[];
  folders: FolderDto[];
  files: FileDto[];
  storage: StorageDto;
};

export type TrashItemDto = {
  id: string;
  name: string;
  kind: "folder" | "file";
  sizeBytes: number | null;
  deletedAt: string;
  originalPath: string;
};

export type TrashResponse = {
  items: TrashItemDto[];
  storage: StorageDto;
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

export type UploadTicketDto = {
  fileId: string;
  uploadUrl: string;
  expiresAt: string;
};

export type ApiErrorPayload = {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string[]>;
};

export type AuthRegisterInput = {
  displayName: string;
  email: string;
  password: string;
};

export type AuthLoginInput = {
  email: string;
  password: string;
};

export type CreateUploadInput = {
  folderId: string | null;
  fileName: string;
  contentType: string;
  sizeBytes: number;
};

export type DriveItemKind = "folder" | "file";
