import { cn } from "@/lib/utils/cn";

/**
 * Pastille de filtre (kit « Champs & filtres », direction Craie vive) :
 * actif = fond vert profond / texte blanc ; au repos = carte bordée.
 */
export function FilterPill({
  active = false,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
        active
          ? "bg-forest text-white"
          : "border border-line bg-white text-ink/60 hover:text-ink",
        className,
      )}
      {...props}
    />
  );
}
