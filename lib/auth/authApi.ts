import { api } from "@/lib/api/client";
import type { TokenPair } from "./types";

/** Authentifie via email + mot de passe (JWT). */
export async function loginRequest(
  email: string,
  password: string,
): Promise<TokenPair> {
  const { data } = await api.post<TokenPair>("/auth/token/", {
    email,
    password,
  });
  return data;
}
