import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  clearTokens,
  getAccessToken,
  getActiveSchoolId,
  getRefreshToken,
  setAccessToken,
} from "./tokens";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/** Callback déclenché quand le refresh échoue définitivement (déconnexion). */
let onAuthFailure: (() => void) | null = null;
export function setAuthFailureHandler(handler: () => void) {
  onAuthFailure = handler;
}

// --- Requête : injection du Bearer et du contexte école -------------------
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);

  const schoolId = getActiveSchoolId();
  if (schoolId) config.headers.set("X-School-ID", schoolId);

  return config;
});

// --- Réponse : refresh automatique du token sur 401 -----------------------
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    // Appel direct (hors instance) pour éviter la récursion d'intercepteur.
    const { data } = await axios.post<{ access: string }>(
      `${API_BASE_URL}/auth/token/refresh/`,
      { refresh },
      { headers: { "Content-Type": "application/json" } },
    );
    setAccessToken(data.access);
    return data.access;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const isAuthCall = original?.url?.includes("/auth/token");

    if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;

      // Mutualise un unique refresh concurrent.
      refreshing = refreshing ?? refreshAccessToken();
      const newAccess = await refreshing;
      refreshing = null;

      if (newAccess) {
        original.headers = { ...original.headers, Authorization: `Bearer ${newAccess}` };
        return api(original);
      }

      clearTokens();
      onAuthFailure?.();
    }

    return Promise.reject(error);
  },
);
