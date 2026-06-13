import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Étiquette « Certifiée » — réservée aux ressources (corrections, annales) validées
 * par un enseignant ou une admin école. Seul le corpus certifié entraîne Prof Hibou.
 * Direction « Craie vive » : pastille vert profond, coche orange clair.
 */
export function CertifBadge({
  small = false,
  certifier,
  className,
}: {
  small?: boolean;
  /** Ex. « Collège de Moroni » — affiché après « Certifiée par … ». */
  certifier?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-forest font-extrabold text-white",
        small ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className,
      )}
    >
      <BadgeCheck
        className={small ? "h-3 w-3" : "h-3.5 w-3.5"}
        strokeWidth={2.2}
        style={{ color: "#ffd9a3" }}
      />
      {certifier ? `Certifiée par ${certifier}` : "Certifiée"}
    </span>
  );
}
