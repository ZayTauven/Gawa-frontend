import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "accent" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

// Craie vive : primaire = vert profond, accent = orange (CTA secondaire/encouragement),
// secondaire = menthe bordée, ghost = discret.
const VARIANTS: Record<Variant, string> = {
  primary: "bg-forest text-white hover:opacity-95",
  accent: "bg-orange text-[#231300] hover:opacity-95",
  secondary: "border border-line bg-mint text-forest hover:bg-emerald-soft",
  ghost: "text-ink/70 hover:bg-soft hover:text-ink",
  danger: "bg-rose text-white hover:opacity-95",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
