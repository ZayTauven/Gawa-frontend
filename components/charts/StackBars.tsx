/** Une colonne empilée : deux séries (a au-dessous, b au-dessus) + libellé. */
export type StackDatum = { label: string; a: number; b: number };

/**
 * Barres empilées arrondies (ex. activité de révision : lecture vs quiz par jour).
 * Kit data-viz Gawa, direction Craie vive.
 */
export function StackBars({
  data,
  width = 330,
  height = 170,
  colors = ["var(--color-emerald)", "var(--color-orange)"],
}: {
  data: StackDatum[];
  width?: number;
  height?: number;
  /** [couleur série a, couleur série b]. */
  colors?: [string, string];
}) {
  const max = Math.max(...data.map((x) => x.a + x.b)) * 1.1 || 1;
  const bw = 18;
  const baseY = height - 22;
  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      style={{ display: "block" }}
    >
      {data.map((x, i) => {
        const cx = 12 + ((i + 0.5) / data.length) * (width - 24);
        const ha = (x.a / max) * (baseY - 12);
        const hb = (x.b / max) * (baseY - 12);
        return (
          <g key={i}>
            {x.b > 0 && (
              <rect x={cx - bw / 2} y={baseY - ha - hb - 3} width={bw} height={hb} rx="6" fill={colors[1]} />
            )}
            {x.a > 0 && <rect x={cx - bw / 2} y={baseY - ha} width={bw} height={ha} rx="6" fill={colors[0]} />}
            <text
              x={cx}
              y={height - 7}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill="rgba(16,41,31,0.42)"
              fontFamily="var(--font-sans)"
            >
              {x.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
