/** Une barre du graphe : libellé court + valeur. */
export type Bar = { label: string; value: number };

/**
 * Barres arrondies avec point fort saturé + tooltip encre (kit data-viz Craie vive).
 * Les barres non surlignées restent en émeraude désaturé (opacity 0.3).
 */
export function BarChart({
  data,
  width = 320,
  height = 150,
  color = "var(--color-emerald)",
  highlight = -1,
  tipText,
  unit = "%",
}: {
  data: Bar[];
  width?: number;
  height?: number;
  color?: string;
  /** Index de la barre mise en avant (-1 = aucune). */
  highlight?: number;
  tipText?: string;
  unit?: string;
}) {
  const max = Math.max(...data.map((x) => x.value)) * 1.15 || 1;
  const bw = Math.min(26, (width - 30) / data.length - 12);
  const baseY = height - 22;
  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      style={{ display: "block" }}
    >
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <line
          key={g}
          x1="0"
          x2={width}
          y1={baseY - (baseY - 14) * g}
          y2={baseY - (baseY - 14) * g}
          stroke="var(--color-line)"
          strokeWidth="1"
          strokeDasharray="3 4"
        />
      ))}
      {data.map((x, i) => {
        const cx = 15 + ((i + 0.5) / data.length) * (width - 30);
        const bh = Math.max(6, (x.value / max) * (baseY - 14));
        const hi = i === highlight;
        return (
          <g key={i}>
            <rect
              x={cx - bw / 2}
              y={baseY - bh}
              width={bw}
              height={bh}
              rx={Math.min(7, bw / 2)}
              fill={color}
              opacity={hi ? 1 : 0.3}
            />
            <text
              x={cx}
              y={height - 7}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill={hi ? "var(--color-ink)" : "rgba(16,41,31,0.42)"}
              fontFamily="var(--font-sans)"
            >
              {x.label}
            </text>
            {hi && (
              <g>
                <rect x={cx - 30} y={baseY - bh - 30} width="60" height="22" rx="7" fill="var(--color-ink)" />
                <path
                  d={`M${cx - 5} ${baseY - bh - 8} L${cx + 5} ${baseY - bh - 8} L${cx} ${baseY - bh - 3} Z`}
                  fill="var(--color-ink)"
                />
                <text
                  x={cx}
                  y={baseY - bh - 15}
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight="800"
                  fill="#fff"
                  fontFamily="var(--font-heading)"
                >
                  {tipText ?? `${x.value}${unit}`}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
