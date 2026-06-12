/**
 * Ligne de légende pour graphes (pastille couleur + libellé + valeur, détail optionnel).
 * Kit data-viz Gawa, direction Craie vive.
 */
export function LegendRow({
  color,
  label,
  value,
  detail,
}: {
  color: string;
  label: string;
  value: React.ReactNode;
  detail?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 py-1.5 text-[12.3px]">
      <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: color }} />
      <span className="min-w-0 flex-1 truncate font-semibold text-ink/60">{label}</span>
      <span className="font-heading font-extrabold text-ink">{value}</span>
      {detail && <span className="text-[10.5px] text-ink/40">{detail}</span>}
    </div>
  );
}
