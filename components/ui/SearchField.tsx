import { Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Champ de recherche signature (kit « Champs & filtres », direction Craie vive) :
 * icône loupe + focus émeraude (bord + halo). Cible tactile ≥ 40px (WCAG).
 */
export function SearchField({
  value,
  onChange,
  placeholder = "Rechercher…",
  className,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-control border border-line bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-emerald focus:ring-2 focus:ring-emerald-soft"
        {...props}
      />
    </div>
  );
}
