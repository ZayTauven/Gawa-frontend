"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { ArrowRight, Users, Wallet } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { WelcomeBanner } from "@/components/ui/WelcomeBanner";
import { StickerStat } from "@/components/ui/StickerStat";
import { Spinner, ErrorState, EmptyState } from "@/components/ui/States";
import { Donut, BarChart, LegendRow } from "@/components/charts";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { todayKey, dayKey } from "@/lib/utils/date";
import {
  useAttendance,
  useAttempts,
  useClassrooms,
  useInvoices,
  useSchoolUsers,
  useStudents,
} from "@/features/admin/hooks";
import type { Classroom, InvoiceStatus } from "@/features/admin/types";

function shortLabel(t: string): string {
  return t.length > 11 ? `${t.slice(0, 10)}…` : t;
}

// Palette sémantique des statuts de facture (kit Craie vive).
const PAYMENT_TONES: Record<InvoiceStatus, { color: string; label: string }> = {
  PAID: { color: "var(--color-emerald)", label: "Réglées" },
  PARTIAL: { color: "var(--color-orange)", label: "Partielles" },
  PENDING: { color: "#94A3B8", label: "En attente" },
  OVERDUE: { color: "var(--color-rose)", label: "En retard" },
};
const PAYMENT_ORDER: InvoiceStatus[] = ["PAID", "PARTIAL", "PENDING", "OVERDUE"];

function frenchDate(): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

export default function AdminHome() {
  const user = useAuthStore((s) => s.user);
  const students = useStudents();
  const classrooms = useClassrooms();
  const invoices = useInvoices();
  const users = useSchoolUsers();
  const attendance = useAttendance();
  const attempts = useAttempts();

  const loading =
    students.isLoading ||
    classrooms.isLoading ||
    invoices.isLoading ||
    users.isLoading ||
    attendance.isLoading ||
    attempts.isLoading;
  const error =
    students.isError || classrooms.isError || invoices.isError || users.isError;

  const stats = useMemo(() => {
    const invList = invoices.data ?? [];
    const paid = invList.filter((i) => i.status === "PAID").length;
    const overdue = invList.filter((i) => i.status === "OVERDUE");
    const overdueAmount = overdue.reduce((s, i) => s + Number(i.amount || 0), 0);
    const teachers = (users.data ?? []).filter((u) => u.role === "TEACHER").length;

    // Répartition par statut → donut des paiements.
    const byStatus = PAYMENT_ORDER.map((status) => ({
      status,
      count: invList.filter((i) => i.status === status).length,
    })).filter((s) => s.count > 0);
    const totalInv = invList.length || 1;

    // Décisionnel 1 — taux de présence par classe (aujourd'hui), via l'appel.
    const today = todayKey();
    const statusByStudent = new Map(
      (attendance.data ?? [])
        .filter((a) => dayKey(a.date) === today)
        .map((a) => [a.student, a.status]),
    );
    const presenceByClass = (classrooms.data ?? []).map((c) => {
      const total = c.student_count ?? c.students.length;
      const bad = c.students.filter((s) => {
        const st = statusByStudent.get(s.id);
        return st === "ABSENT" || st === "LATE";
      }).length;
      const rate = total > 0 ? Math.round(((total - bad) / total) * 100) : 100;
      return { label: shortLabel(c.name), value: rate };
    });

    // Décisionnel 2 — évolution des progrès : score moyen des quiz par mois.
    const monthly = new Map<string, { sum: number; n: number }>();
    for (const a of attempts.data ?? []) {
      const d = new Date(a.completed_at);
      if (Number.isNaN(+d)) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const cur = monthly.get(key) ?? { sum: 0, n: 0 };
      cur.sum += a.score;
      cur.n += 1;
      monthly.set(key, cur);
    }
    const progress = [...monthly.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, { sum, n }]) => {
        const [y, mo] = key.split("-").map(Number);
        const label = new Intl.DateTimeFormat("fr-FR", { month: "short" })
          .format(new Date(y, mo - 1, 1))
          .replace(".", "");
        return { label, value: Math.round(sum / n) };
      });

    return {
      students: students.data?.length ?? 0,
      classes: classrooms.data?.length ?? 0,
      teachers,
      overdueCount: overdue.length,
      overdueAmount,
      recoveryRate: invList.length ? (paid / invList.length) * 100 : 0,
      invoiceTotal: invList.length,
      byStatus,
      totalInv,
      presenceByClass,
      progress,
    };
  }, [students.data, classrooms.data, invoices.data, users.data, attendance.data, attempts.data]);

  const name = user?.firstName || user?.email?.split("@")[0] || "Directeur";

  return (
    <>
      <PageHeader title="Tableau de bord" subtitle="Pilotage de votre établissement." />

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState
          message="Impossible de charger les données de l'établissement."
          onRetry={() => {
            students.refetch();
            classrooms.refetch();
            invoices.refetch();
            users.refetch();
            attendance.refetch();
            attempts.refetch();
          }}
        />
      ) : (
        <div className="rise-stagger space-y-5">
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <WelcomeBanner
                name={name}
                dateLabel={frenchDate()}
                subtitle="Suivez vos effectifs, vos classes et la santé financière de l'école."
                ringValue={stats.recoveryRate}
                ringLabel={`Taux de recouvrement · ${stats.invoiceTotal} facture(s)`}
                sticker="/stickers/diploma.png"
              />
            </div>
            <PaymentsCard
              byStatus={stats.byStatus}
              total={stats.totalInv}
              recoveryRate={stats.recoveryRate}
              overdueAmount={stats.overdueAmount}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StickerStat sticker="/stickers/students.png" value={stats.students} label="Élèves" tone="emerald" />
            <StickerStat sticker="/stickers/classes.png" value={stats.classes} label="Classes" tone="sky" />
            <StickerStat sticker="/stickers/prof.png" value={stats.teachers} label="Enseignants" tone="violet" />
            <StickerStat icon={<Wallet className="h-7 w-7 text-orange" />} value={stats.overdueCount} label="Factures en retard" tone="orange" />
          </div>

          {/* Bande décisionnelle : présence opérationnelle + progrès pédagogique */}
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-card border border-line bg-white p-5 shadow-card">
              <h3 className="font-heading text-base font-bold text-ink">
                Taux de présence par classe
              </h3>
              <p className="mb-3 text-xs text-ink/50">
                Aujourd&apos;hui · repérez les classes à risque de décrochage
              </p>
              {stats.presenceByClass.length === 0 ? (
                <EmptyState message="Aucune classe à afficher." />
              ) : (
                <BarChart
                  data={stats.presenceByClass}
                  color="var(--color-emerald)"
                  highlight={stats.presenceByClass.reduce(
                    (wi, b, i, arr) => (b.value < arr[wi].value ? i : wi),
                    0,
                  )}
                  unit="%"
                  height={170}
                />
              )}
            </div>

            <div className="rounded-card border border-line bg-white p-5 shadow-card">
              <h3 className="font-heading text-base font-bold text-ink">
                Évolution des progrès
              </h3>
              <p className="mb-3 text-xs text-ink/50">
                Score moyen des quiz par mois · l&apos;effet pédagogique
              </p>
              {stats.progress.length === 0 ? (
                <EmptyState message="Pas encore assez de quiz tentés pour mesurer les progrès." />
              ) : (
                <BarChart
                  data={stats.progress}
                  color="var(--color-emerald)"
                  highlight={stats.progress.length - 1}
                  unit="%"
                  height={170}
                />
              )}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <ClassesPanel classes={classrooms.data ?? []} />
            <QuickLinks />
          </div>
        </div>
      )}
    </>
  );
}

function PaymentsCard({
  byStatus,
  total,
  recoveryRate,
  overdueAmount,
}: {
  byStatus: { status: InvoiceStatus; count: number }[];
  total: number;
  recoveryRate: number;
  overdueAmount: number;
}) {
  const segments = byStatus.map((s) => ({
    value: (s.count / total) * 100,
    color: PAYMENT_TONES[s.status].color,
  }));

  return (
    <div className="rounded-card border border-line bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-base font-bold text-ink">État des paiements</h3>
        <Wallet className="h-5 w-5 text-orange" />
      </div>
      {byStatus.length === 0 ? (
        <EmptyState message="Aucune facture émise." />
      ) : (
        <>
          <div className="flex items-center gap-4">
            <Donut
              segments={segments}
              size={104}
              label={`${Math.round(recoveryRate)}%`}
              sub="réglées"
            />
            <div className="min-w-0 flex-1">
              {byStatus.map((s) => (
                <LegendRow
                  key={s.status}
                  color={PAYMENT_TONES[s.status].color}
                  label={PAYMENT_TONES[s.status].label}
                  value={s.count}
                />
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-control bg-orange-soft px-4 py-3">
            <div>
              <p className="text-xs text-ink/50">Montant impayé</p>
              <p className="font-bold text-ink">{overdueAmount.toLocaleString("fr-FR")} KMF</p>
            </div>
            <Link
              href="/dashboard/admin/finance"
              className="text-sm font-semibold text-forest hover:underline"
            >
              Détail →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function ClassesPanel({ classes }: { classes: Classroom[] }) {
  return (
    <div className="rounded-card border border-line bg-white p-5 shadow-card lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-base font-bold text-ink">Classes</h3>
        <Link
          href="/dashboard/admin/classes"
          className="flex items-center gap-1 text-sm font-semibold text-forest hover:underline"
        >
          Voir tout <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {classes.length === 0 ? (
        <EmptyState message="Aucune classe enregistrée." />
      ) : (
        <ul className="divide-y divide-line">
          {classes.slice(0, 6).map((c) => (
            <li key={c.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint">
                  <Image src="/stickers/board.png" alt="" width={22} height={22} />
                </span>
                <div>
                  <p className="font-medium text-ink">{c.name}</p>
                  <p className="text-xs text-ink/50">{c.academic_year}</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-sm text-ink/60">
                <Users className="h-4 w-4" /> {c.student_count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function QuickLinks() {
  const links = [
    { href: "/dashboard/admin/students", label: "Gérer les élèves", sticker: "/stickers/students.png" },
    { href: "/dashboard/admin/classes", label: "Voir les classes", sticker: "/stickers/classes.png" },
    { href: "/dashboard/admin/finance", label: "Suivi des paiements", sticker: "/stickers/attendance.png" },
  ];
  return (
    <div className="rounded-card border border-line bg-white p-5 shadow-card">
      <h3 className="mb-4 font-heading text-base font-bold text-ink">Accès rapides</h3>
      <div className="space-y-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-center gap-3 rounded-lg bg-soft p-3 transition-colors hover:bg-mint"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
              <Image src={l.sticker} alt="" width={20} height={20} />
            </span>
            <span className="text-sm font-semibold text-ink">{l.label}</span>
            <ArrowRight className="ml-auto h-4 w-4 text-ink/40" />
          </Link>
        ))}
      </div>
    </div>
  );
}
