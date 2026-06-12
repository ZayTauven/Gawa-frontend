"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { Tooltip } from "@/components/ui/Tooltip";
import type { AuthUser, UiRole } from "@/lib/auth/types";

const ROLE_LABEL: Record<UiRole, string> = {
  platform: "Superadmin plateforme",
  admin: "Administration",
  teacher: "Enseignant",
  student: "Élève",
  parent: "Parent",
};

function initials(user: AuthUser): string {
  const a = user.firstName?.[0] ?? "";
  const b = user.lastName?.[0] ?? "";
  const fallback = user.email?.[0]?.toUpperCase() ?? "?";
  return (a + b).toUpperCase() || fallback;
}

export function Topbar({ user }: { user: AuthUser }) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-white px-6">
      <div>
        <p className="text-sm font-semibold text-ink">{fullName}</p>
        <p className="text-xs text-ink/50">{ROLE_LABEL[user.uiRole]}</p>
      </div>

      <div className="flex items-center gap-4">
        <Tooltip content={`${fullName} · ${ROLE_LABEL[user.uiRole]}`}>
          <span className="flex h-9 w-9 cursor-default items-center justify-center rounded-full bg-forest text-sm font-bold text-white">
            {initials(user)}
          </span>
        </Tooltip>
        <Tooltip content="Se déconnecter">
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Se déconnecter"
            className="flex items-center gap-2 rounded-control px-3 py-2 text-sm font-medium text-ink/60 transition-colors hover:bg-soft hover:text-ink"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </Tooltip>
      </div>
    </header>
  );
}
