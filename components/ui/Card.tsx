import { cn } from "@/lib/utils";

export function Card({
  className,
  interactive = false,
  children,
}: {
  className?: string;
  /** Lift discret au survol — réservé aux cartes cliquables/explorables. */
  interactive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-white p-5 shadow-card",
        interactive && "lift",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  accent = "forest",
}: {
  label: string;
  value: string | number;
  accent?: "forest" | "orange" | "emerald";
}) {
  const accentClass = {
    forest: "text-forest",
    orange: "text-orange",
    emerald: "text-emerald",
  }[accent];

  return (
    <Card>
      <p className={cn("nums font-heading text-3xl font-extrabold", accentClass)}>
        {value}
      </p>
      <p className="mt-1 text-sm text-ink/60">{label}</p>
    </Card>
  );
}
