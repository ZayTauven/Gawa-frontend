"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/Card";
import { Spinner, ErrorState, EmptyState } from "@/components/ui/States";
import { cn } from "@/lib/utils/cn";
import { useInvoices, useStudents } from "@/features/admin/hooks";
import type { InvoiceStatus } from "@/features/admin/types";

const STATUS_META: Record<InvoiceStatus, { label: string; cls: string }> = {
  PAID: { label: "Payée", cls: "bg-emerald-soft text-forest" },
  PARTIAL: { label: "Partielle", cls: "bg-sky-100 text-sky-700" },
  PENDING: { label: "En attente", cls: "bg-orange-soft text-orange" },
  OVERDUE: { label: "En retard", cls: "bg-rose-100 text-rose-600" },
};

const FILTERS: { value: "ALL" | InvoiceStatus; label: string }[] = [
  { value: "ALL", label: "Toutes" },
  { value: "OVERDUE", label: "En retard" },
  { value: "PENDING", label: "En attente" },
  { value: "PARTIAL", label: "Partielles" },
  { value: "PAID", label: "Payées" },
];

export default function AdminFinancePage() {
  const invoices = useInvoices();
  const students = useStudents();
  const [filter, setFilter] = useState<"ALL" | InvoiceStatus>("ALL");

  const studentName = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of students.data ?? []) {
      map.set(s.id, `${s.last_name} ${s.first_name}`.trim() || s.matricule);
    }
    return map;
  }, [students.data]);

  const totals = useMemo(() => {
    const list = invoices.data ?? [];
    const billed = list.reduce((s, i) => s + Number(i.amount || 0), 0);
    const overdue = list
      .filter((i) => i.status === "OVERDUE")
      .reduce((s, i) => s + Number(i.amount || 0), 0);
    return { billed, overdue, count: list.length };
  }, [invoices.data]);

  const rows = useMemo(() => {
    const list = invoices.data ?? [];
    return filter === "ALL" ? list : list.filter((i) => i.status === filter);
  }, [invoices.data, filter]);

  if (invoices.isLoading) return <Spinner label="Chargement des factures…" />;
  if (invoices.isError)
    return <ErrorState message="Impossible de charger les factures." onRetry={() => invoices.refetch()} />;

  return (
    <>
      <PageHeader title="Finance" subtitle="Suivi des factures et des paiements de l'établissement." />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Factures émises" value={totals.count} />
        <StatCard label="Total facturé (KMF)" value={totals.billed.toLocaleString("fr-FR")} accent="emerald" />
        <StatCard label="En retard (KMF)" value={totals.overdue.toLocaleString("fr-FR")} accent="orange" />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
              filter === f.value
                ? "bg-forest text-white"
                : "bg-white text-ink/70 ring-1 ring-line hover:bg-soft",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-card border border-line bg-white shadow-sm">
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState message="Aucune facture pour ce filtre." />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((inv) => {
              const meta = STATUS_META[inv.status];
              return (
                <li key={inv.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="font-medium text-ink">
                      {studentName.get(inv.student) ?? "Élève"}
                    </p>
                    <p className="text-xs text-ink/50">
                      {inv.invoice_period} · échéance{" "}
                      {new Intl.DateTimeFormat("fr-FR").format(new Date(inv.due_date))}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-ink">
                      {Number(inv.amount).toLocaleString("fr-FR")} KMF
                    </span>
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", meta.cls)}>
                      {meta.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
