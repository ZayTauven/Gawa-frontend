import type { DonutSegment } from "./Donut";

/**
 * Barre de distribution en ticks — « la natte devenue diagramme » : le motif tissé
 * sert à montrer la donnée (ex. présence par classe). Kit data-viz Craie vive.
 */
export function TickBar({
  segments,
  height = 26,
  count = 46,
  className,
}: {
  segments: DonutSegment[];
  height?: number;
  /** Nombre de ticks affichés (résolution visuelle). */
  count?: number;
  className?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const ticks: string[] = [];
  let segIdx = 0;
  let used = 0;
  for (let i = 0; i < count; i++) {
    const frac = (i + 0.5) / count;
    while (segIdx < segments.length - 1 && frac > (used + segments[segIdx].value) / total) {
      used += segments[segIdx].value;
      segIdx++;
    }
    ticks.push(segments[segIdx].color);
  }
  return (
    <div className={className} style={{ display: "flex", gap: 3, width: "100%", height, alignItems: "stretch" }}>
      {ticks.map((c, i) => (
        <span key={i} style={{ flex: 1, borderRadius: 99, background: c }} />
      ))}
    </div>
  );
}
