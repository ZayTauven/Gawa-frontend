"use client";

import * as RTooltip from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils/cn";

/**
 * Aide contextuelle accessible (Radix Tooltip) habillée Craie vive : bulle encre,
 * petite flèche. Monter <TooltipProvider> une fois à la racine (providers).
 *
 * Usage : <Tooltip content="Synchronisé il y a 2 min"><button>…</button></Tooltip>
 */
export function TooltipProvider({
  delayDuration = 300,
  children,
}: {
  delayDuration?: number;
  children: React.ReactNode;
}) {
  return (
    <RTooltip.Provider delayDuration={delayDuration}>{children}</RTooltip.Provider>
  );
}

export function Tooltip({
  content,
  side = "top",
  children,
  className,
}: {
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  /** L'élément déclencheur (bouton, icône…). */
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <RTooltip.Root>
      <RTooltip.Trigger asChild>{children}</RTooltip.Trigger>
      <RTooltip.Portal>
        <RTooltip.Content
          side={side}
          sideOffset={6}
          className={cn(
            "z-50 max-w-xs rounded-control bg-ink px-2.5 py-1.5 text-xs font-medium text-white shadow-md",
            className,
          )}
        >
          {content}
          <RTooltip.Arrow className="fill-ink" />
        </RTooltip.Content>
      </RTooltip.Portal>
    </RTooltip.Root>
  );
}
