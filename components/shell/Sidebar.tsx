"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  NotebookPen,
  School,
  ShieldCheck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar as UiSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { getRoleHome, getRoleNav, type NavItem } from "@/lib/auth/roles";
import { getRoleAccent } from "@/lib/ui/roleAccent";
import type { UiRole } from "@/lib/auth/types";
import { Logo } from "@/components/ui/Logo";
import { Hibou } from "@/components/ui/Hibou";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  School,
  Wallet,
  BookOpen,
  FolderOpen,
  GraduationCap,
  NotebookPen,
  ShieldCheck,
};

function isActive(pathname: string, item: NavItem): boolean {
  // Exact pour la home du rôle, préfixe pour les sous-pages.
  const depth = item.href.split("/").length;
  if (depth <= 3) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/**
 * Sidebar applicative (shadcn/ui) habillée « Encre & Lumière » via les tokens
 * `--sidebar-*` (fond nuit, accents lumineux). Fixe, rétractable en rail
 * d'icônes (Ctrl/Cmd+B), et servie en sheet sur mobile — le tout géré par
 * les primitives shadcn.
 */
export function Sidebar({ role }: { role: UiRole }) {
  const pathname = usePathname();
  const nav = getRoleNav(role);

  return (
    <UiSidebar collapsible="icon" className="on-night">
      {/* Porte l'accent du rôle jusque dans le sheet mobile (portal hors du
          provider) — display:contents laisse la variable CSS s'hériter. */}
      <div
        style={
          {
            display: "contents",
            "--role-accent": getRoleAccent(role),
          } as React.CSSProperties
        }
      >
      {/* Halo émeraude diffus — profondeur du fond nuit */}
      <div
        className="pointer-events-none absolute -left-24 -top-24 z-0 h-72 w-72 rounded-full opacity-25"
        style={{
          background:
            "radial-gradient(closest-side, var(--color-emerald), transparent)",
        }}
      />

      <SidebarHeader className="relative h-16 justify-center border-b border-sidebar-border px-4">
        <Link href={getRoleHome(role)} className="inline-flex">
          <span className="group-data-[collapsible=icon]:hidden">
            <Logo variant="light" />
          </span>
          <span className="hidden group-data-[collapsible=icon]:inline-flex">
            <Logo variant="light" showWord={false} />
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="relative px-2 py-3">
        <SidebarMenu>
          {nav.map((item) => {
            const Icon = ICONS[item.icon] ?? LayoutDashboard;
            const active = isActive(pathname, item);
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={active}
                  tooltip={item.label}
                  className="data-active:font-bold data-active:shadow-[inset_3px_0_0_var(--role-accent,var(--color-glow))] [&_svg]:size-5"
                  render={
                    <Link href={item.href}>
                      <Icon
                        strokeWidth={2}
                        style={
                          active
                            ? { color: "var(--role-accent, var(--color-glow))" }
                            : undefined
                        }
                      />
                      <span>{item.label}</span>
                    </Link>
                  }
                />
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="relative">
        {/* Copilote de révision — masqué en mode rail */}
        <div className="flex items-center gap-2.5 overflow-hidden rounded-card bg-white/5 p-3 ring-1 ring-white/10 group-data-[collapsible=icon]:hidden">
          <Hibou pose="neutral" size={34} />
          <div className="min-w-0">
            <p className="font-heading text-xs font-bold">Professeur Hibou</p>
            <p className="mt-0.5 text-[10.5px] text-white/60">
              Votre copilote de révision
            </p>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
      </div>
    </UiSidebar>
  );
}
