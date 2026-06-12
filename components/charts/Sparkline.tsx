"use client";

import { useId } from "react";

/** Construit le tracé lissé (courbe de Bézier) + points extrêmes pour l'aire. */
function sparkPath(data: number[], w: number, h: number, pad = 2) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const pts = data.map((v, i): [number, number] => [
    pad + (i / (data.length - 1)) * (w - pad * 2),
    pad + (1 - (v - min) / span) * (h - pad * 2),
  ]);
  let dline = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    const mx = (px + x) / 2;
    dline += ` Q${px} ${py}, ${mx} ${(py + y) / 2}`;
    if (i === pts.length - 1) dline += ` T${x} ${y}`;
  }
  return { dline, first: pts[0], last: pts[pts.length - 1] };
}

/**
 * Sparkline (aire dégradée + ligne lissée) — tendance compacte dans une carte-stat.
 * Kit data-viz Gawa, direction Craie vive.
 */
export function Sparkline({
  data,
  color = "var(--color-emerald)",
  width = 110,
  height = 44,
  className,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  const gid = useId();
  const { dline, first, last } = sparkPath(data, width, height);
  const area = `${dline} L${last[0]} ${height - 1} L${first[0]} ${height - 1} Z`;
  return (
    <svg
      width={width}
      height={height}
      aria-hidden="true"
      className={className}
      style={{ display: "block", flex: "none" }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={dline} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
