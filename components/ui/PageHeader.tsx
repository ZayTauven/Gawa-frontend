export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-extrabold text-ink">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-ink/60">{subtitle}</p>}
    </div>
  );
}

/** Bloc "section en construction" pour les écrans non encore branchés. */
export function ComingSoon({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-white p-10 text-center">
      <p className="text-sm font-medium text-ink/50">
        {label} — bientôt disponible.
      </p>
    </div>
  );
}
