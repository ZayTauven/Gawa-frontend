import { cn } from "@/lib/utils"

/**
 * Squelette de chargement — shimmer premium Gawa (classe `.skeleton`,
 * désactivé sous prefers-reduced-motion) plutôt que le pulse shadcn.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("skeleton", className)}
      {...props}
    />
  )
}

export { Skeleton }
