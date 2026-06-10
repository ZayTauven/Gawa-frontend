/** Rôles tels que définis côté backend (gawa_core/permissions.py). */
export type BackendRole =
  | "PLATFORM_SUPERADMIN"
  | "SCHOOL_ADMIN"
  | "ADMIN"
  | "TEACHER"
  | "STUDENT"
  | "PARENT";

/** Rôles d'interface (regroupent SCHOOL_ADMIN + ADMIN sous "admin"). */
export type UiRole = "platform" | "admin" | "teacher" | "student" | "parent";

/** Claims embarqués dans le JWT d'accès (cf. EmailOrUsernameTokenSerializer). */
export interface JwtClaims {
  user_id: string;
  role: BackendRole;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  default_school_id: string | null;
  school_ids: string[];
  exp: number;
}

/** Utilisateur connecté, dérivé des claims JWT. */
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  backendRole: BackendRole;
  uiRole: UiRole;
  defaultSchoolId: string | null;
  schoolIds: string[];
}

export interface TokenPair {
  access: string;
  refresh: string;
}
