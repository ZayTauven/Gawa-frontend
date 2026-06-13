"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { getRoleHome, isPathAllowed } from "@/lib/auth/roles";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import { Logo } from "@/components/ui/Logo";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getRoleAccent } from "@/lib/ui/roleAccent";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (status === "idle" || status === "loading") return;

    if (status !== "authenticated" || !user) {
      router.replace("/login");
      return;
    }

    // Route hors périmètre du rôle → renvoi vers sa home.
    if (!isPathAllowed(user.uiRole, pathname)) {
      router.replace(getRoleHome(user.uiRole));
    }
  }, [status, user, pathname, router]);

  // Tant que la session n'est pas résolue (ou accès refusé), on évite le flash.
  if (status !== "authenticated" || !user || !isPathAllowed(user.uiRole, pathname)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-night">
        <Logo variant="light" />
        <p className="animate-pulse text-sm text-white/50">Chargement…</p>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={{ "--role-accent": getRoleAccent(user.uiRole) } as React.CSSProperties}
    >
      <Sidebar role={user.uiRole} />
      <SidebarInset className="min-w-0 bg-paper">
        <Topbar user={user} />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
