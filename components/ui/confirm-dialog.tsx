"use client";

import { useState } from "react";
import * as RDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils/cn";

/**
 * Modal accessible (Radix Dialog) habillé direction Craie vive : overlay encre,
 * carte 14px, fermeture clavier/clic-extérieur gérée par Radix.
 *
 * Usage :
 *   <Dialog>
 *     <DialogTrigger asChild><Button>Ouvrir</Button></DialogTrigger>
 *     <DialogContent title="Titre" description="…">…corps…</DialogContent>
 *   </Dialog>
 */
export const Dialog = RDialog.Root;
export const DialogTrigger = RDialog.Trigger;
export const DialogClose = RDialog.Close;

export function DialogContent({
  title,
  description,
  children,
  footer,
  className,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <RDialog.Portal>
      <RDialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px]" />
      <RDialog.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[min(480px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-card border border-line bg-white p-6 shadow-md focus:outline-none",
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <RDialog.Title className="font-heading text-lg font-bold text-ink">
              {title}
            </RDialog.Title>
            {description && (
              <RDialog.Description className="mt-1 text-sm text-ink/60">
                {description}
              </RDialog.Description>
            )}
          </div>
          <RDialog.Close
            aria-label="Fermer"
            className="shrink-0 rounded-control p-1 text-ink/40 transition-colors hover:bg-soft hover:text-ink"
          >
            <X className="h-4 w-4" />
          </RDialog.Close>
        </div>

        {children}

        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </RDialog.Content>
    </RDialog.Portal>
  );
}

/**
 * Confirmation prête à l'emploi (sur Dialog) : le `children` est le déclencheur.
 * Idéal pour les actions sensibles (verrouiller un contenu, supprimer…).
 */
export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  confirmVariant = "primary",
  onConfirm,
  children,
}: {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: React.ComponentProps<typeof Button>["variant"];
  onConfirm: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        title={title}
        description={description}
        footer={
          <>
            <DialogClose asChild>
              <Button variant="ghost" size="sm">
                {cancelLabel}
              </Button>
            </DialogClose>
            <Button
              variant={confirmVariant}
              size="sm"
              onClick={() => {
                onConfirm();
                setOpen(false);
              }}
            >
              {confirmLabel}
            </Button>
          </>
        }
      />
    </Dialog>
  );
}
