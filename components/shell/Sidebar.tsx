"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  NotebookPen,
  School,
  ShieldCheck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { getRoleNav, type NavItem } from "@/lib/auth/roles";
import type { UiRole } from "@/lib/auth/types";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils/cn";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  School,
  Wallet,
  BookOpen,
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

export function Sidebar({ role }: { role: UiRole }) {
  const pathname = usePathname();
  const nav = getRoleNav(role);

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-white lg:flex">
      <div className="flex h-16 items-center border-b border-line px-6">
        <Link href="/dashboard">
          <Logo />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map((item) => {
          const Icon = ICONS[item.icon] ?? LayoutDashboard;
          const active = isActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-mint text-forest"
                  : "text-ink/60 hover:bg-soft hover:text-ink",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
