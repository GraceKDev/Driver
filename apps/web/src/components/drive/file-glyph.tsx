import {
  File,
  FileArchive,
  FileAudio,
  FileCode2,
  FileImage,
  FileQuestion,
  FileSpreadsheet,
  FileText,
  FileVideo,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { getFileKind, type FileKind } from "@/lib/format";

const icons: Record<FileKind, LucideIcon> = {
  image: FileImage,
  pdf: FileText,
  document: FileText,
  sheet: FileSpreadsheet,
  slides: FileText,
  archive: FileArchive,
  audio: FileAudio,
  video: FileVideo,
  code: FileCode2,
  text: File,
  other: FileQuestion,
};

// Color coding stays quiet so file names remain the loudest thing in the room.
const tints: Record<FileKind, string> = {
  image: "bg-dusty/60 text-marker",
  pdf: "bg-accent-soft text-marker",
  document: "bg-sticky/35 text-ink",
  sheet: "bg-mint text-olive",
  slides: "bg-sky-soft text-pen",
  archive: "bg-manila/80 text-ink",
  audio: "bg-mint/70 text-pen",
  video: "bg-pen/10 text-pen",
  code: "bg-paper-deep text-ink",
  text: "bg-paper-deep text-ink-soft",
  other: "bg-paper-deep text-ink-soft",
};

export function getFileTint(contentType: string, name: string): string {
  return tints[getFileKind(contentType, name)];
}

export function FileGlyph({
  contentType,
  name,
  className,
}: {
  contentType: string;
  name: string;
  className?: string;
}) {
  const kind = getFileKind(contentType, name);
  const Icon = icons[kind];
  return <Icon aria-hidden="true" className={cn("h-6 w-6", className)} strokeWidth={1.7} />;
}
