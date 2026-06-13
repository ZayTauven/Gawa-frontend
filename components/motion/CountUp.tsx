"use client";

import { useEffect, useRef } from "react";
import { animate, useReducedMotion } from "motion/react";

/**
 * Chiffre animé par count-up à l'apparition (stats de dashboard).
 * Rend la valeur finale telle quelle si reduced-motion ou valeur non numérique.
 */
export function CountUp({
  value,
  duration = 0.8,
}: {
  value: string | number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const numeric = typeof value === "number" && Number.isFinite(value);

  useEffect(() => {
    if (!numeric || reduced || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        node.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [value, numeric, reduced, duration]);

  // La valeur finale est rendue côté serveur (SEO/no-JS) puis animée au mount.
  return <span ref={ref}>{value}</span>;
}
