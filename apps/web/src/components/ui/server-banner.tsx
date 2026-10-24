import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

export function ServerBanner({
  message,
  className,
}: {
  message: string | null;
  className?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2.5 rounded-lg border border-marker/25 bg-accent-soft px-3.5 py-3 text-sm text-ink",
        className,
      )}
    >
      <CircleAlert
        aria-hidden="true"
        className="mt-0.5 h-4 w-4 shrink-0 text-marker"
      />
      <p className="leading-snug">{message}</p>
    </div>
  );
}
