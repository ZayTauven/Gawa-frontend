"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/85 px-4 backdrop-blur-sm sm:px-6">
      <SidebarTrigger className="-ml-1 text-ink/60 hover:text-ink" />
      <Separator orientation="vertical" className="h-5!" />

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">{fullName}</p>
        <p className="text-xs text-ink/50">{ROLE_LABEL[user.uiRole]}</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Menu du compte"
          className="ml-auto rounded-full outline-none focus-visible:ring-2 focus-visible:ring-emerald"
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white ring-2 ring-emerald-soft"
            style={{
              background:
                "linear-gradient(135deg, var(--color-forest), var(--color-emerald))",
            }}
          >
            {initials(user)}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <p className="text-sm font-semibold text-ink">{fullName}</p>
            <p className="truncate text-xs font-normal text-ink/50">
              {user.email}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={handleLogout}>
            <LogOut />
            Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
