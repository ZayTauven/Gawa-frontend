import { cn } from "@/lib/utils/cn";

/** Marque Gawa compacte pour le web-admin (pastille hibou + wordmark). */
export function Logo({
  className,
  variant = "dark",
  showWord = true,
}: {
  className?: string;
  variant?: "dark" | "light";
  showWord?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-forest">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <circle cx="8.5" cy="10" r="3.2" fill="#fff" />
          <circle cx="15.5" cy="10" r="3.2" fill="#fff" />
          <circle cx="8.5" cy="10" r="1.4" fill="#0f2e25" />
          <circle cx="15.5" cy="10" r="1.4" fill="#0f2e25" />
          <path d="M12 12.5l1.6 2.4h-3.2L12 12.5Z" fill="#f59e0b" />
        </svg>
      </span>
      {showWord && (
        <span
          className={cn(
            "font-heading text-lg font-extrabold tracking-tight",
            variant === "light" ? "text-white" : "text-ink",
          )}
        >
          Gawa
        </span>
      )}
    </span>
  );
}
