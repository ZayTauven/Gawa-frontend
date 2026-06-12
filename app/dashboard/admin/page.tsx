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
import {
  useClassrooms,
  useInvoices,
  useSchoolUsers,
  useStudents,
} from "@/features/admin/hooks";
import type { Classroom, Invoice, InvoiceStatus } from "@/features/admin/types";

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

  const loading =
    students.isLoading || classrooms.isLoading || invoices.isLoading || users.isLoading;
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

    // Collecte des frais : somme encaissée (factures réglées) par mois, via due_date.
    const collecte = collectByMonth(invList);

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
      collecte,
    };
  }, [students.data, classrooms.data, invoices.data, users.data]);

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
          }}
        />
      ) : (
        <div className="space-y-5">
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

          {/* Collecte des frais par mois */}
          <div className="rounded-card border border-line bg-white p-5 shadow-sm">
            <h3 className="font-heading text-base font-bold text-ink">Collecte des frais</h3>
            <p className="mb-3 text-xs text-ink/50">Montant encaissé par mois (factures réglées)</p>
            {stats.collecte.length === 0 ? (
              <EmptyState message="Aucun encaissement enregistré pour l'instant." />
            ) : (
              <BarChart
                data={stats.collecte}
                color="var(--color-emerald)"
                highlight={stats.collecte.length - 1}
                unit=" KMF"
                height={170}
              />
            )}
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

/** Regroupe le montant encaissé (factures réglées) par mois, via due_date. */
function collectByMonth(invoices: Invoice[]): { label: string; value: number }[] {
  const sums = new Map<string, number>();
  for (const inv of invoices) {
    if (inv.status !== "PAID" || !inv.due_date) continue;
    const d = new Date(inv.due_date);
    if (Number.isNaN(+d)) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    sums.set(key, (sums.get(key) ?? 0) + Number(inv.amount || 0));
  }
  return [...sums.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, value]) => {
      const [y, mo] = key.split("-").map(Number);
      const label = new Intl.DateTimeFormat("fr-FR", { month: "short" })
        .format(new Date(y, mo - 1, 1))
        .replace(".", "");
      return { label, value: Math.round(value) };
    });
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
    <div className="rounded-card border border-line bg-white p-5 shadow-sm">
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
    <div className="rounded-card border border-line bg-white p-5 shadow-sm lg:col-span-2">
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
    <div className="rounded-card border border-line bg-white p-5 shadow-sm">
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
