import { cn } from "@/lib/utils";

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
      <span
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-[9px]",
          variant === "light" ? "bg-white/15" : "bg-forest",
        )}
      >
        {/* Professeur Hibou : touffes d'oreilles, lunettes rondes (signature), bec orange */}
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path d="M5.5 7.5 L8 4.5 L9.5 8 Z" fill="#fff" opacity="0.9" />
          <path d="M18.5 7.5 L16 4.5 L14.5 8 Z" fill="#fff" opacity="0.9" />
          <circle cx="8.6" cy="11" r="3.4" stroke="#fff" strokeWidth="1.6" />
          <circle cx="15.4" cy="11" r="3.4" stroke="#fff" strokeWidth="1.6" />
          <circle cx="8.6" cy="11" r="1.5" fill="#fff" />
          <circle cx="15.4" cy="11" r="1.5" fill="#fff" />
          <path d="M12 14.5 L13.8 16.8 Q 12 18.6, 10.2 16.8 Z" fill="#f59e0b" />
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
