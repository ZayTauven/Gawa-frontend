"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Megaphone, Wallet } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { WelcomeBanner } from "@/components/ui/WelcomeBanner";
import { StickerStat } from "@/components/ui/StickerStat";
import { Spinner, ErrorState, EmptyState } from "@/components/ui/States";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import {
  useAttendance,
  useBroadcasts,
  useChildren,
  useInvoices,
} from "@/features/parent/hooks";
import type { Attendance, Broadcast, Child } from "@/features/parent/types";

function frenchDate(): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

export default function ParentHome() {
  const user = useAuthStore((s) => s.user);
  const children = useChildren();
  const attendance = useAttendance();
  const invoices = useInvoices();
  const broadcasts = useBroadcasts();

  const loading =
    children.isLoading || attendance.isLoading || invoices.isLoading || broadcasts.isLoading;
  const error = children.isError || attendance.isError || invoices.isError;

  const stats = useMemo(() => {
    const att = attendance.data ?? [];
    const absent = att.filter((a) => a.status === "ABSENT").length;
    const late = att.filter((a) => a.status === "LATE").length;
    const inv = invoices.data ?? [];
    const overdue = inv.filter((i) => i.status === "OVERDUE").length;
    const upToDate = inv.length ? ((inv.length - overdue) / inv.length) * 100 : 100;
    return {
      children: children.data?.length ?? 0,
      absent,
      late,
      overdue,
      upToDate,
      overdueAmount: inv
        .filter((i) => i.status === "OVERDUE")
        .reduce((s, i) => s + Number(i.amount || 0), 0),
    };
  }, [children.data, attendance.data, invoices.data]);

  const name = user?.firstName || user?.email?.split("@")[0] || "Parent";

  return (
    <>
      <PageHeader title="Tableau de bord" subtitle="Le suivi de votre enfant, en un coup d'œil." />

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState
          message="Impossible de charger votre espace."
          onRetry={() => {
            children.refetch();
            attendance.refetch();
            invoices.refetch();
          }}
        />
      ) : (
        <div className="rise-stagger space-y-5">
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <WelcomeBanner
                name={name}
                dateLabel={frenchDate()}
                subtitle="Suivez les présences, le carnet de liaison et les paiements de vos enfants."
                ringValue={stats.upToDate}
                ringLabel="Factures à jour"
                sticker="/stickers/student-girl.png"
              />
            </div>
            <FinanceCard count={stats.overdue} amount={stats.overdueAmount} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StickerStat sticker="/stickers/students.png" value={stats.children} label="Mes enfants" tone="emerald" />
            <StickerStat sticker="/stickers/attendance.png" value={stats.absent} label="Absences" tone="orange" />
            <StickerStat sticker="/stickers/question.png" value={stats.late} label="Retards" tone="sky" />
            <StickerStat icon={<Wallet className="h-7 w-7 text-orange" />} value={stats.overdue} label="Factures en retard" tone="violet" />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <ChildrenPanel kids={children.data ?? []} attendance={attendance.data ?? []} />
            <AnnouncementsPanel broadcasts={broadcasts.data ?? []} />
          </div>
        </div>
      )}
    </>
  );
}

function FinanceCard({ count, amount }: { count: number; amount: number }) {
  return (
    <div className="rounded-card border border-line bg-white p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-heading text-base font-bold text-ink">Paiements</h3>
        <Wallet className="h-5 w-5 text-orange" />
      </div>
      <p className="font-heading text-3xl font-extrabold text-orange">{count}</p>
      <p className="text-sm text-ink/60">facture(s) en retard</p>
      <div className="mt-4 rounded-lg bg-orange-soft px-4 py-3">
        <p className="text-xs text-ink/50">Montant dû</p>
        <p className="font-bold text-ink">{amount.toLocaleString("fr-FR")} KMF</p>
      </div>
      <Link href="/dashboard/parent/finance" className="mt-3 inline-block text-sm font-semibold text-forest hover:underline">
        Voir les quittances →
      </Link>
    </div>
  );
}

function ChildrenPanel({ kids, attendance }: { kids: Child[]; attendance: Attendance[] }) {
  const countByStudent = (id: string, status: "ABSENT" | "LATE") =>
    attendance.filter((a) => a.student === id && a.status === status).length;

  return (
    <div className="rounded-card border border-line bg-white p-5 shadow-card lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-base font-bold text-ink">Mes enfants</h3>
        <Link href="/dashboard/parent/carnet" className="flex items-center gap-1 text-sm font-semibold text-forest hover:underline">
          Carnet de liaison <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {kids.length === 0 ? (
        <EmptyState message="Aucun enfant rattaché à votre compte." />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {kids.map((c) => (
            <li key={c.id} className="rounded-lg border border-line p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-forest text-sm font-bold text-white">
                  {(c.first_name?.[0] ?? "?").toUpperCase()}
                </span>
                <div>
                  <p className="font-medium text-ink">{c.last_name} {c.first_name}</p>
                  <p className="text-xs text-ink/50">{c.matricule}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2 text-xs">
                <span className="rounded-full bg-orange-soft px-2.5 py-0.5 font-semibold text-orange">
                  {countByStudent(c.id, "ABSENT")} absence(s)
                </span>
                <span className="rounded-full bg-sky-100 px-2.5 py-0.5 font-semibold text-sky-700">
                  {countByStudent(c.id, "LATE")} retard(s)
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AnnouncementsPanel({ broadcasts }: { broadcasts: Broadcast[] }) {
  return (
    <div className="rounded-card border border-line bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center gap-2">
        <Megaphone className="h-5 w-5 text-forest" />
        <h3 className="font-heading text-base font-bold text-ink">Annonces</h3>
      </div>
      {broadcasts.length === 0 ? (
        <EmptyState message="Aucune annonce de l'école." />
      ) : (
        <ul className="space-y-3">
          {broadcasts.slice(0, 5).map((b) => (
            <li key={b.id} className="rounded-lg bg-soft p-3">
              <p className="text-sm font-semibold text-ink">{b.title}</p>
              <p className="mt-1 line-clamp-2 text-xs text-ink/60">{b.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
