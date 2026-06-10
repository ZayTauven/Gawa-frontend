import { cn } from "@/lib/utils/cn";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-line bg-white p-5 shadow-sm",
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
      <p className={cn("font-heading text-3xl font-extrabold", accentClass)}>
        {value}
      </p>
      <p className="mt-1 text-sm text-ink/60">{label}</p>
    </Card>
  );
}
