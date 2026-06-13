"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Transition douce entre les pages du dashboard : fondu + léger glissement.
 * `template.tsx` est re-monté à chaque navigation, ce qui rejoue l'animation.
 */
export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();

  if (reduced) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
