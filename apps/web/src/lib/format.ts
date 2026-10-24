const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB"] as const;

export function formatBytes(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || !Number.isFinite(bytes) || bytes < 0) {
    return "—";
  }

  if (bytes === 0) {
    return "0 B";
  }

  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    BYTE_UNITS.length - 1,
  );
  const value = bytes / 1024 ** exponent;
  const decimals = exponent === 0 ? 0 : value >= 10 ? 1 : 2;

  return `${value.toFixed(decimals).replace(/\.0+$/, "").replace(/(\.\d)0$/, "$1")} ${
    BYTE_UNITS[exponent]
  }`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function percentOf(used: number, total: number): number {
  if (!Number.isFinite(used) || !Number.isFinite(total) || total <= 0) {
    return 0;
  }

  return clamp((used / total) * 100, 0, 100);
}

export function getInitials(name: string): string {
  const clean = name.trim();
  if (!clean) {
    return "??";
  }

  const parts = clean.split(/\s+/).filter(Boolean);
  const initials =
    parts.length > 1
      ? `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`
      : clean.slice(0, 2);

  return initials.toUpperCase();
}

export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`,
): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export type FileKind =
  | "image"
  | "pdf"
  | "document"
  | "sheet"
  | "slides"
  | "archive"
  | "audio"
  | "video"
  | "code"
  | "text"
  | "other";

export function getFileKind(contentType: string, name: string): FileKind {
  const type = contentType.toLowerCase();
  const extension = name.split(".").pop()?.toLowerCase() ?? "";

  if (type.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(extension)) {
    return "image";
  }
  if (type === "application/pdf" || extension === "pdf") {
    return "pdf";
  }
  if (
    type.includes("spreadsheet") ||
    type.includes("csv") ||
    ["xls", "xlsx", "csv", "numbers"].includes(extension)
  ) {
    return "sheet";
  }
  if (
    type.includes("presentation") ||
    ["ppt", "pptx", "key"].includes(extension)
  ) {
    return "slides";
  }
  if (
    type.startsWith("text/") ||
    type.includes("word") ||
    type.includes("document") ||
    ["doc", "docx", "rtf", "md", "txt", "pages"].includes(extension)
  ) {
    return "document";
  }
  if (
    type.includes("zip") ||
    type.includes("compressed") ||
    ["zip", "rar", "7z", "tar", "gz"].includes(extension)
  ) {
    return "archive";
  }
  if (type.startsWith("audio/")) {
    return "audio";
  }
  if (type.startsWith("video/")) {
    return "video";
  }
  if (
    type.includes("javascript") ||
    type.includes("json") ||
    type.includes("xml") ||
    ["js", "ts", "tsx", "jsx", "json", "html", "css", "py", "cs"].includes(extension)
  ) {
    return "code";
  }

  return "other";
}

export function fileKindLabel(kind: FileKind): string {
  const labels: Record<FileKind, string> = {
    image: "Image",
    pdf: "PDF",
    document: "Doc",
    sheet: "Sheet",
    slides: "Slides",
    archive: "Archive",
    audio: "Audio",
    video: "Video",
    code: "Code",
    text: "Text",
    other: "File",
  };

  return labels[kind];
}

export function driveHref(
  folderId: string | null,
  highlight?: string | null,
): string {
  const params = new URLSearchParams();
  if (folderId) {
    params.set("folder", folderId);
  }
  if (highlight) {
    params.set("highlight", highlight);
  }

  const query = params.toString();
  return query ? `/drive?${query}` : "/drive";
}

export const TRASH_HREF = "/drive?view=trash";

export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
