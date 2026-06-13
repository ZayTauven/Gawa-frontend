"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, WifiOff, BookOpen } from "lucide-react";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { getRoleHome } from "@/lib/auth/roles";
import { LoginForm } from "@/features/auth/LoginForm";
import { Logo } from "@/components/ui/Logo";
import { Hibou } from "@/components/ui/Hibou";

export default function LoginPage() {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  // Déjà connecté → redirige vers le tableau de bord du rôle.
  useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(getRoleHome(user.uiRole));
    }
  }, [status, user, router]);

  return (
    <main className="flex min-h-screen bg-paper">
      {/* Panneau de marque — le « tableau d'école » : nuit, craie et lumière. */}
      <section className="on-night relative hidden w-[44%] flex-col justify-between overflow-hidden bg-night p-10 text-white lg:flex">
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-25"
          style={{
            background:
              "radial-gradient(closest-side, var(--color-emerald), transparent)",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(closest-side, var(--color-glow), transparent)",
          }}
        />

        <Logo variant="light" className="relative" />

        <div className="relative">
          <Hibou pose="hello" size={84} />
          <h1 className="mt-6 max-w-md font-heading text-3xl font-extrabold leading-snug">
            L&apos;école, organisée.
            <br />
            <span className="text-glow">Même sans réseau.</span>
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
            Élèves, cours, examens et finances de votre établissement, dans un
            espace unique et sécurisé.
          </p>
        </div>

        <ul className="relative space-y-3 text-sm text-white/70">
          <li className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 shrink-0 text-glow" />
            Archives chiffrées, accès journalisés
          </li>
          <li className="flex items-center gap-3">
            <WifiOff className="h-4 w-4 shrink-0 text-glow" />
            Conçu pour les connexions instables
          </li>
          <li className="flex items-center gap-3">
            <BookOpen className="h-4 w-4 shrink-0 text-glow" />
            L&apos;enseignant reste au centre
          </li>
        </ul>
      </section>

      {/* Panneau formulaire — papier clair, carte sobre. */}
      <section className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-rise rounded-card bg-white p-8 shadow-card ring-1 ring-line">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
