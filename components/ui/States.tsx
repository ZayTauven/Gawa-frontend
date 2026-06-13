import { WifiOff } from "lucide-react";
import { Skeleton } from "./skeleton";
import { Hibou } from "./Hibou";

// Réexport : source unique du squelette = ui/skeleton.tsx (shimmer Gawa).
export { Skeleton };

/**
 * Chargement premium : squelette aux formes des dashboards (bannière, cartes,
 * lignes) plutôt qu'un spinner. Le libellé reste annoncé aux lecteurs d'écran.
 */
export function Spinner({ label = "Chargement…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="space-y-5">
      <span className="sr-only">{label}</span>
      <div className="grid gap-5 lg:grid-cols-3">
        <Skeleton className="h-36 rounded-card lg:col-span-2" />
        <Skeleton className="hidden h-36 rounded-card lg:block" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-card border border-line bg-white p-4 shadow-card"
          >
            <Skeleton className="h-14 w-14 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-3.5 w-24" />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-3 rounded-card border border-line bg-white p-5 shadow-card">
        <Skeleton className="h-4 w-40" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
    </div>
  );
}

export function ErrorState({
  message = "Une erreur est survenue.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-card border border-orange/30 bg-orange-soft px-5 py-6 text-center">
      <p className="text-sm font-medium text-[#8A5200]">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 text-sm font-semibold text-forest underline underline-offset-2"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}

/**
 * État vide = moment de personnalité : Prof Hibou réfléchit, ton encourageant.
 * `title` optionnel pour un message à deux niveaux (titre + détail).
 */
export function EmptyState({
  title,
  message,
}: {
  title?: string;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-card border border-dashed border-line bg-white px-5 py-10 text-center">
      <Hibou pose="think" size={68} />
      {title && (
        <p className="mt-1.5 font-heading text-base font-bold text-ink">{title}</p>
      )}
      <p className="max-w-xs text-sm leading-relaxed text-ink/55">{message}</p>
    </div>
  );
}

/**
 * Bannière hors-ligne — rassurante, jamais anxiogène : Hibou dort, il ne panique pas.
 * Offline-first : tout se synchronise au retour du réseau.
 */
export function OfflineBanner({
  message = "Continuez tranquillement — tout se synchronisera au retour du réseau.",
}: {
  message?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-control bg-orange-soft px-4 py-3">
      <Hibou pose="sleep" size={44} className="shrink-0" />
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-sm font-bold text-[#6E4200]">
          <WifiOff className="h-3.5 w-3.5" strokeWidth={2.2} />
          Mode hors-ligne
        </p>
        <p className="mt-0.5 text-[13px] leading-snug text-[#8A5200]">{message}</p>
      </div>
    </div>
  );
}
