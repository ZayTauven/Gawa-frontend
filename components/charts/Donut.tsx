/** Un segment du donut : valeur (en % du total 100) + couleur. */
export type DonutSegment = { value: number; color: string };

/**
 * Donut multi-segments (ex. état des paiements : réglé / en attente / relance).
 * Les valeurs sont exprimées en pourcentage (somme ≈ 100).
 * Kit data-viz Gawa, direction Craie vive.
 */
export function Donut({
  segments,
  size = 120,
  stroke = 16,
  label,
  sub,
}: {
  segments: DonutSegment[];
  size?: number;
  stroke?: number;
  label?: React.ReactNode;
  sub?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  // Décalage cumulé de chaque segment (sans mutation en cours de rendu).
  const offsets = segments.reduce<number[]>((acc, s, i) => {
    acc.push((acc[i - 1] ?? 0) + (segments[i - 1]?.value ?? 0));
    return acc;
  }, []);
  return (
    <div style={{ position: "relative", width: size, height: size, flex: "none" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-mint)" strokeWidth={stroke} />
        {segments.map((s, i) => {
          const off = c * (1 - offsets[i] / 100);
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${(c * s.value) / 100} ${c}`}
              strokeDashoffset={off - c}
            />
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: size * 0.2, fontWeight: 800, fontFamily: "var(--font-heading)", color: "var(--color-ink)", lineHeight: 1 }}>
          {label}
        </span>
        {sub && <span style={{ fontSize: 9.5, color: "rgba(16,41,31,0.42)", fontWeight: 600, marginTop: 2 }}>{sub}</span>}
      </div>
    </div>
  );
}
