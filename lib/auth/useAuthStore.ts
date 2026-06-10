import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import {
  clearTokens,
  getAccessToken,
  setActiveSchoolId as persistSchoolId,
  setTokens,
} from "@/lib/api/tokens";
import { loginRequest } from "./authApi";
import { toUiRole } from "./roles";
import type { AuthUser, JwtClaims } from "./types";

function decodeUser(accessToken: string): AuthUser | null {
  try {
    const c = jwtDecode<JwtClaims>(accessToken);
    if (!c.role) return null;
    return {
      id: c.user_id,
      email: c.email,
      firstName: c.first_name ?? "",
      lastName: c.last_name ?? "",
      backendRole: c.role,
      uiRole: toUiRole(c.role),
      defaultSchoolId: c.default_school_id ?? null,
      schoolIds: c.school_ids ?? [],
    };
  } catch {
    return null;
  }
}

interface AuthState {
  user: AuthUser | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  activeSchoolId: string | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  bootstrap: () => void;
  setActiveSchoolId: (schoolId: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",
  activeSchoolId: null,

  login: async (email, password) => {
    set({ status: "loading" });
    const { access, refresh } = await loginRequest(email, password);
    const user = decodeUser(access);
    if (!user) {
      set({ status: "unauthenticated" });
      throw new Error("Jeton invalide.");
    }
    setTokens(access, refresh);
    const schoolId = user.defaultSchoolId;
    persistSchoolId(schoolId);
    set({ user, status: "authenticated", activeSchoolId: schoolId });
    return user;
  },

  logout: () => {
    clearTokens();
    set({ user: null, status: "unauthenticated", activeSchoolId: null });
  },

  bootstrap: () => {
    const token = getAccessToken();
    const user = token ? decodeUser(token) : null;
    if (user) {
      set({
        user,
        status: "authenticated",
        activeSchoolId: user.defaultSchoolId,
      });
    } else {
      clearTokens();
      set({ user: null, status: "unauthenticated", activeSchoolId: null });
    }
  },

  setActiveSchoolId: (schoolId) => {
    persistSchoolId(schoolId);
    set({ activeSchoolId: schoolId });
  },
}));
