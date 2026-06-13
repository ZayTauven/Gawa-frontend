"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { ArrowRight, ShieldCheck, Wallet } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { WelcomeBanner } from "@/components/ui/WelcomeBanner";
import { StickerStat } from "@/components/ui/StickerStat";
import { Spinner, ErrorState, EmptyState } from "@/components/ui/States";
import { Gauge, Donut, LegendRow } from "@/components/charts";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import {
  useAccessLogs,
  useInvoices,
  usePlatformStudentCount,
  usePlatformUsers,
  useSchools,
} from "@/features/platform/hooks";
import type { AccessLog, Invoice, School } from "@/features/platform/types";

type PayStatus = Invoice["status"];
const PAY_TONES: Record<PayStatus, { color: string; label: string }> = {
  PAID: { color: "var(--color-emerald)", label: "Réglées" },
  PARTIAL: { color: "var(--color-orange)", label: "Partielles" },
  PENDING: { color: "#94A3B8", label: "En attente" },
  OVERDUE: { color: "var(--color-rose)", label: "En retard" },
};
const PAY_ORDER: PayStatus[] = ["PAID", "PARTIAL", "PENDING", "OVERDUE"];

const LOG_TONES: Record<AccessLog["action_type"], { color: string; label: string }> = {
  SEAL: { color: "var(--color-emerald)", label: "Scellement" },
  DECRYPT: { color: "var(--color-orange)", label: "Déchiffrement" },
  PRINT: { color: "#3B82F6", label: "Impression" },
  FAILED_ATTEMPT: { color: "var(--color-rose)", label: "Échecs" },
};
const LOG_ORDER: AccessLog["action_type"][] = ["SEAL", "DECRYPT", "PRINT", "FAILED_ATTEMPT"];

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
    const invList = invoices.data ?? [];
    const overdue = invList.filter((i) => i.status === "OVERDUE");
    const overdueAmount = overdue.reduce((sum, i) => sum + Number(i.amount || 0), 0);
    const paid = invList.filter((i) => i.status === "PAID").length;

    // Répartition paiements réseau (donut) + répartition des accès archives (donut).
    const payByStatus = PAY_ORDER.map((status) => ({
      status,
      count: invList.filter((i) => i.status === status).length,
    })).filter((s) => s.count > 0);
    const logList = logs.data ?? [];
    const logByType = LOG_ORDER.map((type) => ({
      type,
      count: logList.filter((l) => l.action_type === type).length,
    })).filter((s) => s.count > 0);

    return {
      schools: schoolList.length,
      activeSchools: active,
      activeRate: schoolList.length ? (active / schoolList.length) * 100 : 0,
      users: users.data?.length ?? 0,
      students: students.data ?? 0,
      overdueCount: overdue.length,
      overdueAmount,
      recoveryRate: invList.length ? (paid / invList.length) * 100 : 0,
      payByStatus,
      payTotal: invList.length || 1,
      logByType,
      logTotal: logList.length || 1,
    };
  }, [schools.data, users.data, students.data, invoices.data, logs.data]);

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
        <div className="rise-stagger space-y-5">
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

          {/* Bande console : santé réseau */}
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="flex flex-col items-center rounded-card border border-line bg-white p-5 shadow-card">
              <h3 className="mb-2 self-start font-heading text-base font-bold text-ink">
                Écoles actives
              </h3>
              <Gauge value={stats.activeRate} sub={`${stats.activeSchools}/${stats.schools}`} />
            </div>

            <DonutPanel
              title="Paiements réseau"
              centerLabel={`${Math.round(stats.recoveryRate)}%`}
              centerSub="réglées"
              total={stats.payTotal}
              items={stats.payByStatus.map((s) => ({
                color: PAY_TONES[s.status].color,
                label: PAY_TONES[s.status].label,
                count: s.count,
              }))}
              empty="Aucune facture sur le réseau."
            />

            <DonutPanel
              title="Accès aux archives"
              centerLabel={String(stats.logByType.reduce((s, x) => s + x.count, 0))}
              centerSub="accès"
              total={stats.logTotal}
              items={stats.logByType.map((s) => ({
                color: LOG_TONES[s.type].color,
                label: LOG_TONES[s.type].label,
                count: s.count,
              }))}
              empty="Aucun accès au coffre-fort."
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

function DonutPanel({
  title,
  centerLabel,
  centerSub,
  total,
  items,
  empty,
}: {
  title: string;
  centerLabel: string;
  centerSub: string;
  total: number;
  items: { color: string; label: string; count: number }[];
  empty: string;
}) {
  return (
    <div className="rounded-card border border-line bg-white p-5 shadow-card">
      <h3 className="mb-4 font-heading text-base font-bold text-ink">{title}</h3>
      {items.length === 0 ? (
        <EmptyState message={empty} />
      ) : (
        <div className="flex items-center gap-4">
          <Donut
            segments={items.map((i) => ({ value: (i.count / total) * 100, color: i.color }))}
            size={104}
            label={centerLabel}
            sub={centerSub}
          />
          <div className="min-w-0 flex-1">
            {items.map((i) => (
              <LegendRow key={i.label} color={i.color} label={i.label} value={i.count} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OverdueCard({ count, amount }: { count: number; amount: number }) {
  return (
    <div className="rounded-card border border-line bg-white p-5 shadow-card">
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
    <div className="rounded-card border border-line bg-white p-5 shadow-card lg:col-span-2">
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
  SEAL: { text: "Scellement", cls: "bg-glow/15 text-glow" },
  DECRYPT: { text: "Déchiffrement", cls: "bg-chalk/15 text-chalk" },
  PRINT: { text: "Impression", cls: "bg-sky-400/15 text-sky-300" },
  FAILED_ATTEMPT: { text: "Tentative échouée", cls: "bg-rose/20 text-rose-300" },
};

/**
 * Coffre-fort d'archives : la zone la plus sensible du produit reçoit le
 * traitement le plus grave — fond nuit, sceau or, journal d'accès.
 */
function SecurityPanel({ logs }: { logs: AccessLog[] }) {
  return (
    <div className="on-night relative overflow-hidden rounded-card bg-night p-5 text-white shadow-night ring-1 ring-seal/30">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-15"
        style={{
          background:
            "radial-gradient(closest-side, var(--color-seal), transparent)",
        }}
      />
      <div className="relative mb-1 flex items-center justify-between">
        <h3 className="font-heading text-base font-bold">Accès aux archives</h3>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-seal/15 ring-1 ring-seal/40">
          <ShieldCheck className="h-4 w-4 text-seal" />
        </span>
      </div>
      <p className="relative mb-4 text-[11px] uppercase tracking-widest text-seal/80">
        Coffre-fort · chiffré · journalisé
      </p>

      {logs.length === 0 ? (
        <p className="relative py-6 text-center text-sm text-white/50">
          Aucun accès au coffre-fort enregistré.
        </p>
      ) : (
        <ul className="relative space-y-3">
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
                  <p className="truncate text-sm text-white/90">{log.admin_email}</p>
                  <p className="nums text-xs text-white/45">
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
