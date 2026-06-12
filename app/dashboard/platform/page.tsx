"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { ArrowRight, ShieldCheck, Wallet } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { WelcomeBanner } from "@/components/ui/WelcomeBanner";
import { StickerStat } from "@/components/ui/StickerStat";
import { Spinner, ErrorState, EmptyState } from "@/components/ui/States";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import {
  useAccessLogs,
  useInvoices,
  usePlatformStudentCount,
  usePlatformUsers,
  useSchools,
} from "@/features/platform/hooks";
import type { AccessLog, School } from "@/features/platform/types";

function frenchDate(): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

export default function PlatformHome() {
  const user = useAuthStore((s) => s.user);
  const schools = useSchools();
  const users = usePlatformUsers();
  const students = usePlatformStudentCount();
  const invoices = useInvoices();
  const logs = useAccessLogs();

  const loading =
    schools.isLoading ||
    users.isLoading ||
    students.isLoading ||
    invoices.isLoading ||
    logs.isLoading;
  const error =
    schools.isError || users.isError || students.isError || invoices.isError;

  const stats = useMemo(() => {
    const schoolList = schools.data ?? [];
    const active = schoolList.filter((s) => s.is_active).length;
    const overdue = (invoices.data ?? []).filter((i) => i.status === "OVERDUE");
    const overdueAmount = overdue.reduce((sum, i) => sum + Number(i.amount || 0), 0);
    return {
      schools: schoolList.length,
      activeSchools: active,
      activeRate: schoolList.length ? (active / schoolList.length) * 100 : 0,
      users: users.data?.length ?? 0,
      students: students.data ?? 0,
      overdueCount: overdue.length,
      overdueAmount,
    };
  }, [schools.data, users.data, students.data, invoices.data]);

  const name = user?.firstName || user?.email?.split("@")[0] || "Pilote";

  return (
    <>
      <PageHeader
        title="Pilotage plateforme"
        subtitle="Vue consolidée de toutes les écoles Gawa."
      />

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState
          message="Impossible de charger la console de pilotage."
          onRetry={() => {
            schools.refetch();
            users.refetch();
            students.refetch();
            invoices.refetch();
            logs.refetch();
          }}
        />
      ) : (
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <WelcomeBanner
                name={name}
                dateLabel={frenchDate()}
                subtitle="Supervisez les établissements, les accès et la santé financière du réseau."
                ringValue={stats.activeRate}
                ringLabel={`${stats.activeSchools} école(s) active(s) sur ${stats.schools}`}
                sticker="/stickers/online.png"
              />
            </div>
            <OverdueCard count={stats.overdueCount} amount={stats.overdueAmount} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StickerStat
              sticker="/stickers/classes.png"
              value={stats.schools}
              label="Écoles"
              caption={`${stats.activeSchools} active(s)`}
              tone="emerald"
            />
            <StickerStat
              sticker="/stickers/prof.png"
              value={stats.users}
              label="Utilisateurs"
              tone="sky"
            />
            <StickerStat
              sticker="/stickers/students.png"
              value={stats.students}
              label="Élèves"
              tone="violet"
            />
            <StickerStat
              icon={<Wallet className="h-7 w-7 text-orange" />}
              value={stats.overdueCount}
              label="Factures en retard"
              tone="orange"
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <SchoolsPanel schools={schools.data ?? []} />
            <SecurityPanel logs={logs.data ?? []} />
          </div>
        </div>
      )}
    </>
  );
}

function OverdueCard({ count, amount }: { count: number; amount: number }) {
  return (
    <div className="rounded-card border border-line bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-heading text-base font-bold text-ink">
          Santé financière
        </h3>
        <Wallet className="h-5 w-5 text-orange" />
      </div>
      <p className="font-heading text-3xl font-extrabold text-orange">{count}</p>
      <p className="text-sm text-ink/60">facture(s) en retard sur le réseau</p>
      <div className="mt-4 rounded-lg bg-orange-soft px-4 py-3">
        <p className="text-xs text-ink/50">Montant impayé</p>
        <p className="font-bold text-ink">
          {amount.toLocaleString("fr-FR")} KMF
        </p>
      </div>
    </div>
  );
}

function SchoolsPanel({ schools }: { schools: School[] }) {
  return (
    <div className="rounded-card border border-line bg-white p-5 shadow-sm lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-base font-bold text-ink">Écoles</h3>
        <Link
          href="/dashboard/platform/schools"
          className="flex items-center gap-1 text-sm font-semibold text-forest hover:underline"
        >
          Gérer les écoles <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {schools.length === 0 ? (
        <EmptyState message="Aucune école enregistrée pour le moment." />
      ) : (
        <ul className="divide-y divide-line">
          {schools.slice(0, 6).map((s) => (
            <li key={s.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint">
                  <Image src="/stickers/classes.png" alt="" width={22} height={22} />
                </span>
                <div>
                  <p className="font-medium text-ink">{s.name}</p>
                  <p className="text-xs text-ink/50">{s.code}</p>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  s.is_active
                    ? "bg-emerald-soft text-forest"
                    : "bg-soft text-ink/50"
                }`}
              >
                {s.is_active ? "Active" : "Inactive"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const ACTION_LABEL: Record<AccessLog["action_type"], { text: string; cls: string }> = {
  SEAL: { text: "Scellement", cls: "bg-emerald-soft text-forest" },
  DECRYPT: { text: "Déchiffrement", cls: "bg-orange-soft text-orange" },
  PRINT: { text: "Impression", cls: "bg-sky-100 text-sky-700" },
  FAILED_ATTEMPT: { text: "Tentative échouée", cls: "bg-rose-100 text-rose-600" },
};

function SecurityPanel({ logs }: { logs: AccessLog[] }) {
  return (
    <div className="rounded-card border border-line bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-base font-bold text-ink">
          Accès aux archives
        </h3>
        <ShieldCheck className="h-5 w-5 text-forest" />
      </div>

      {logs.length === 0 ? (
        <EmptyState message="Aucun accès au coffre-fort enregistré." />
      ) : (
        <ul className="space-y-3">
          {logs.slice(0, 6).map((log) => {
            const meta = ACTION_LABEL[log.action_type];
            return (
              <li key={log.id} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.cls}`}
                >
                  {meta.text}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink">{log.admin_email}</p>
                  <p className="text-xs text-ink/45">
                    {log.target_matricule} ·{" "}
                    {new Intl.DateTimeFormat("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(log.timestamp))}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
