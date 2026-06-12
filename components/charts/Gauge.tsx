/**
 * Jauge semi-donut (ex. performance globale). Valeur 0–100.
 * Kit data-viz Gawa, direction Craie vive.
 */
export function Gauge({
  value,
  size = 150,
  stroke = 17,
  color = "var(--color-emerald)",
  label,
  sub,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  /** Texte central (ex. « 78% »). Par défaut la valeur arrondie en %. */
  label?: React.ReactNode;
  sub?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const half = Math.PI * r;
  const cy = size / 2;
  const arc = `M ${stroke / 2} ${cy} A ${r} ${r} 0 0 1 ${size - stroke / 2} ${cy}`;
  return (
    <div style={{ position: "relative", width: size, height: size * 0.62, flex: "none" }}>
      <svg
        width={size}
        height={size * 0.62}
        aria-hidden="true"
        style={{ display: "block", overflow: "visible" }}
      >
        <path d={arc} fill="none" stroke="var(--color-mint)" strokeWidth={stroke} strokeLinecap="round" />
        <path
          d={arc}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={half}
          strokeDashoffset={half * (1 - clamped / 100)}
        />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, textAlign: "center" }}>
        <p
          style={{
            margin: 0,
            fontSize: size * 0.19,
            fontWeight: 800,
            fontFamily: "var(--font-heading)",
            lineHeight: 1,
            color: "var(--color-ink)",
          }}
        >
          {label ?? `${Math.round(clamped)}%`}
        </p>
        {sub && (
          <p style={{ margin: "3px 0 0", fontSize: 10.5, color: "rgba(16,41,31,0.42)", fontWeight: 600 }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}
