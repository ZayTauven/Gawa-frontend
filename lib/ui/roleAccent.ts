import type { UiRole } from "@/lib/auth/types";

/**
 * Accent lumineux par univers de rôle — vit uniquement sur les surfaces nuit
 * (item actif de la sidebar, anneau de la bannière) : différenciation subtile
 * sans fragmenter l'identité. Toutes les teintes sont lisibles sur `night`.
 */
const ROLE_ACCENT: Record<UiRole, string> = {
  platform: "var(--color-glow)", // émeraude lumineuse — maîtrise du réseau
  admin: "#9be8c5", // menthe claire — rigueur sereine
  teacher: "var(--color-chalk)", // craie — l'enseignant au tableau
  student: "#6fc8f5", // ciel — progression, encouragement
  parent: "#f2a6b4", // rose doux — lien avec l'école (distinct du rose erreur)
};

export function getRoleAccent(role: UiRole): string {
  return ROLE_ACCENT[role];
}
