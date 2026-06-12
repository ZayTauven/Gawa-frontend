"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { ArrowRight, Users, Wallet } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { WelcomeBanner } from "@/components/ui/WelcomeBanner";
import { StickerStat } from "@/components/ui/StickerStat";
import { Spinner, ErrorState, EmptyState } from "@/components/ui/States";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import {
  useClassrooms,
  useInvoices,
  useSchoolUsers,
  useStudents,
} from "@/features/admin/hooks";
import type { Classroom } from "@/features/admin/types";

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
    return {
      students: students.data?.length ?? 0,
      classes: classrooms.data?.length ?? 0,
      teachers,
      overdueCount: overdue.length,
      overdueAmount,
      recoveryRate: invList.length ? (paid / invList.length) * 100 : 0,
      invoiceTotal: invList.length,
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
            <FinanceCard count={stats.overdueCount} amount={stats.overdueAmount} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StickerStat sticker="/stickers/students.png" value={stats.students} label="Élèves" tone="emerald" />
            <StickerStat sticker="/stickers/classes.png" value={stats.classes} label="Classes" tone="sky" />
            <StickerStat sticker="/stickers/prof.png" value={stats.teachers} label="Enseignants" tone="violet" />
            <StickerStat icon={<Wallet className="h-7 w-7 text-orange" />} value={stats.overdueCount} label="Factures en retard" tone="orange" />
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

function FinanceCard({ count, amount }: { count: number; amount: number }) {
  return (
    <div className="rounded-card border border-line bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-heading text-base font-bold text-ink">Finances</h3>
        <Wallet className="h-5 w-5 text-orange" />
      </div>
      <p className="font-heading text-3xl font-extrabold text-orange">{count}</p>
      <p className="text-sm text-ink/60">facture(s) en retard</p>
      <div className="mt-4 rounded-lg bg-orange-soft px-4 py-3">
        <p className="text-xs text-ink/50">Montant impayé</p>
        <p className="font-bold text-ink">{amount.toLocaleString("fr-FR")} KMF</p>
      </div>
      <Link
        href="/dashboard/admin/finance"
        className="mt-3 inline-block text-sm font-semibold text-forest hover:underline"
      >
        Voir les factures →
      </Link>
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
