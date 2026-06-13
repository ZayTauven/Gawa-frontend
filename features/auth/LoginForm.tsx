"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { getRoleHome } from "@/lib/auth/roles";
import { Logo } from "@/components/ui/Logo";
import { Hibou } from "@/components/ui/Hibou";

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
        {/* Sur desktop, la marque vit dans le panneau nuit à gauche. */}
        <div className="flex flex-col items-center lg:hidden">
          <Hibou pose="hello" size={72} />
          <Logo className="mt-3 scale-110" />
        </div>
        <h1 className="mt-5 font-heading text-2xl font-extrabold tracking-tight text-ink lg:mt-0">
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
            className="mt-1 w-full rounded-control border border-line bg-white px-4 py-2.5 outline-none transition-colors focus:border-emerald focus:ring-2 focus:ring-emerald-soft"
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
            className="mt-1 w-full rounded-control border border-line bg-white px-4 py-2.5 outline-none transition-colors focus:border-emerald focus:ring-2 focus:ring-emerald-soft"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-control bg-orange-soft px-4 py-2.5 text-sm font-medium text-[#8A5200]"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-control bg-forest px-5 py-3 font-semibold text-white shadow-card transition-[background-color,box-shadow] hover:bg-deeper hover:shadow-lift disabled:opacity-60"
        >
          {submitting ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
