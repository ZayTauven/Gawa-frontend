import { cn } from "@/lib/utils/cn";
import type { ChapterStatus, ResourceStatus } from "./types";

const LABELS: Record<string, { text: string; cls: string }> = {
  UNLOCKED: { text: "Publié", cls: "bg-emerald-soft text-forest" },
  LOCKED: { text: "Verrouillé", cls: "bg-soft text-ink/50" },
  DRAFT: { text: "Brouillon", cls: "bg-orange-soft text-orange" },
};

export function StatusPill({ status }: { status: ChapterStatus | ResourceStatus }) {
  const meta = LABELS[status] ?? LABELS.LOCKED;
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
        meta.cls,
      )}
    >
      {meta.text}
    </span>
  );
}
