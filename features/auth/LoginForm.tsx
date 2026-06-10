"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { getRoleHome } from "@/lib/auth/roles";
import { Logo } from "@/components/ui/Logo";

export function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      router.replace(getRoleHome(user.uiRole));
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 401) {
        setError("Email ou mot de passe incorrect.");
      } else if (err instanceof AxiosError && !err.response) {
        setError("Serveur injoignable. Vérifiez que le backend est démarré.");
      } else {
        setError("Connexion impossible. Réessayez.");
      }
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center text-center">
        <Logo className="scale-125" />
        <h1 className="mt-6 text-2xl font-extrabold text-ink">
          Espace administration
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          Connectez-vous pour accéder à votre tableau de bord.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@ecole.km"
            className="mt-1 w-full rounded-lg border border-line bg-white px-4 py-2.5 outline-none transition-colors focus:border-forest"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-1 w-full rounded-lg border border-line bg-white px-4 py-2.5 outline-none transition-colors focus:border-forest"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-orange-soft px-4 py-2.5 text-sm font-medium text-orange"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-forest px-5 py-3 font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
        >
          {submitting ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
