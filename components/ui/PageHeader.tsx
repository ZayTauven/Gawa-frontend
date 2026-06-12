import { Hibou } from "./Hibou";

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="font-heading text-2xl font-extrabold tracking-tight text-ink">
        {title}
      </h1>
      {subtitle && <p className="mt-1 text-sm text-ink/60">{subtitle}</p>}
    </div>
  );
}

/** Bloc "section en construction" pour les écrans non encore branchés. */
export function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-line bg-white p-10 text-center">
      <Hibou pose="neutral" size={60} />
      <p className="font-heading text-sm font-bold text-ink/70">
        {label}
      </p>
      <p className="text-xs text-ink/45">Bientôt disponible.</p>
    </div>
  );
}
