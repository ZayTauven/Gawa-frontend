/**
 * Stockage des jetons et du contexte école — module pur (pas de React).
 * Partagé entre le client axios et le store d'authentification.
 */
const ACCESS_KEY = "gawa.access";
const REFRESH_KEY = "gawa.refresh";
const SCHOOL_KEY = "gawa.activeSchoolId";

const hasWindow = () => typeof window !== "undefined";

export function getAccessToken(): string | null {
  return hasWindow() ? window.localStorage.getItem(ACCESS_KEY) : null;
}

export function getRefreshToken(): string | null {
  return hasWindow() ? window.localStorage.getItem(REFRESH_KEY) : null;
}

export function getActiveSchoolId(): string | null {
  return hasWindow() ? window.localStorage.getItem(SCHOOL_KEY) : null;
}

export function setTokens(access: string, refresh: string): void {
  if (!hasWindow()) return;
  window.localStorage.setItem(ACCESS_KEY, access);
  window.localStorage.setItem(REFRESH_KEY, refresh);
}

export function setAccessToken(access: string): void {
  if (!hasWindow()) return;
  window.localStorage.setItem(ACCESS_KEY, access);
}

export function setActiveSchoolId(schoolId: string | null): void {
  if (!hasWindow()) return;
  if (schoolId) window.localStorage.setItem(SCHOOL_KEY, schoolId);
  else window.localStorage.removeItem(SCHOOL_KEY);
}

export function clearTokens(): void {
  if (!hasWindow()) return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem(SCHOOL_KEY);
}
