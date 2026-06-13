"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Champ de recherche signature (kit « Champs & filtres ») : icône loupe +
 * focus émeraude, bâti sur l'Input shadcn. Cible tactile ≥ 40px (WCAG).
 */
export function SearchField({
  value,
  onChange,
  placeholder = "Rechercher…",
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "onChange" | "value"> & {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 bg-white pl-9 pr-3"
        {...props}
      />
    </div>
  );
}
