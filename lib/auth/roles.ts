import type { BackendRole, UiRole } from "./types";

/** Mappe un rôle backend vers le rôle d'interface. */
export function toUiRole(role: BackendRole): UiRole {
  switch (role) {
    case "PLATFORM_SUPERADMIN":
      return "platform";
    case "SCHOOL_ADMIN":
    case "ADMIN":
      return "admin";
    case "TEACHER":
      return "teacher";
    case "STUDENT":
      return "student";
    case "PARENT":
      return "parent";
  }
}

/** Élément de navigation latérale. `icon` = nom d'icône lucide résolu dans la Sidebar. */
export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

/** Source unique de vérité : navigation par rôle d'interface. */
const ROLE_NAV: Record<UiRole, NavItem[]> = {
  platform: [
    { label: "Pilotage", href: "/dashboard/platform", icon: "LayoutDashboard" },
    { label: "Écoles", href: "/dashboard/platform/schools", icon: "School" },
    { label: "Admins d'école", href: "/dashboard/platform/admins", icon: "ShieldCheck" },
  ],
  admin: [
    { label: "Tableau de bord", href: "/dashboard/admin", icon: "LayoutDashboard" },
    { label: "Élèves", href: "/dashboard/admin/students", icon: "Users" },
    { label: "Classes", href: "/dashboard/admin/classes", icon: "School" },
    { label: "Finance", href: "/dashboard/admin/finance", icon: "Wallet" },
  ],
  teacher: [
    { label: "Tableau de bord", href: "/dashboard/teacher", icon: "LayoutDashboard" },
    { label: "Mes classes", href: "/dashboard/teacher/classes", icon: "Users" },
    { label: "Ressources", href: "/dashboard/teacher/resources", icon: "BookOpen" },
  ],
  student: [
    { label: "Tableau de bord", href: "/dashboard/student", icon: "LayoutDashboard" },
    { label: "Mes cours", href: "/dashboard/student/courses", icon: "BookOpen" },
    { label: "Ressources", href: "/dashboard/student/resources", icon: "FolderOpen" },
    { label: "Examens", href: "/dashboard/student/exams", icon: "GraduationCap" },
  ],
  parent: [
    { label: "Tableau de bord", href: "/dashboard/parent", icon: "LayoutDashboard" },
    { label: "Carnet de liaison", href: "/dashboard/parent/carnet", icon: "NotebookPen" },
    { label: "Finance", href: "/dashboard/parent/finance", icon: "Wallet" },
  ],
};

export function getRoleNav(role: UiRole): NavItem[] {
  return ROLE_NAV[role];
}

/** Route d'accueil par rôle (première entrée de navigation). */
export function getRoleHome(role: UiRole): string {
  return ROLE_NAV[role][0].href;
}

/** Préfixes d'URL autorisés pour un rôle (contrôle d'accès côté client). */
export function getRoleAllowedPrefixes(role: UiRole): string[] {
  return [`/dashboard/${role}`];
}

/** Vrai si le chemin est autorisé pour ce rôle. */
export function isPathAllowed(role: UiRole, path: string): boolean {
  return getRoleAllowedPrefixes(role).some((prefix) => path.startsWith(prefix));
}
