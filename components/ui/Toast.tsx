"use client";

import { Toaster as SonnerToaster, toast } from "sonner";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

/**
 * Notifications Gawa — surcouche thémée de `sonner` (accessible, respecte
 * prefers-reduced-motion). Direction Craie vive : carte 14px, filet coloré,
 * icônes sémantiques (émeraude / orange / rose / vert).
 *
 * Usage : monter <Toaster /> une fois (providers), puis appeler `toast.success(...)`.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      gap={10}
      toastOptions={{
        classNames: {
          toast:
            "!rounded-card !border !border-line !border-l-4 !bg-white !shadow-md !p-3.5 !gap-3 !items-start",
          title: "!font-heading !font-bold !text-ink !text-sm",
          description: "!text-ink/60 !text-[13px]",
          success: "!border-l-emerald",
          warning: "!border-l-orange",
          error: "!border-l-rose",
          info: "!border-l-forest",
          closeButton: "!border-line !text-ink/40 hover:!text-ink",
        },
      }}
      icons={{
        success: <CheckCircle2 className="h-5 w-5 text-emerald" strokeWidth={2.2} />,
        warning: <AlertTriangle className="h-5 w-5 text-orange" strokeWidth={2.2} />,
        error: <XCircle className="h-5 w-5 text-rose" strokeWidth={2.2} />,
        info: <Info className="h-5 w-5 text-forest" strokeWidth={2.2} />,
      }}
      closeButton
    />
  );
}

// Réexport pratique : `import { toast } from "@/components/ui/Toast"`.
export { toast };
