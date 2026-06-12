"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { getRoleHome } from "@/lib/auth/roles";
import { LoginForm } from "@/features/auth/LoginForm";

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
    <main className="flex min-h-screen items-center justify-center bg-soft px-6">
      <div className="w-full max-w-sm rounded-card bg-white p-8 shadow-sm ring-1 ring-line">
        <LoginForm />
      </div>
    </main>
  );
}
