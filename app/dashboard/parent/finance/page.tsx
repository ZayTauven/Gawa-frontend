"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/Card";
import { Spinner, ErrorState, EmptyState } from "@/components/ui/States";
import { cn } from "@/lib/utils";
import { useChildren, useInvoices } from "@/features/parent/hooks";
import type { Invoice } from "@/features/parent/types";

const STATUS_META: Record<Invoice["status"], { label: string; cls: string }> = {
  PAID: { label: "Payée", cls: "bg-emerald-soft text-forest" },
  PARTIAL: { label: "Partielle", cls: "bg-sky-100 text-sky-700" },
  PENDING: { label: "En attente", cls: "bg-orange-soft text-orange" },
  OVERDUE: { label: "En retard", cls: "bg-rose-100 text-rose-600" },
};

export default function ParentFinancePage() {
  const invoices = useInvoices();
  const children = useChildren();

  const childName = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of children.data ?? [])
      map.set(c.id, `${c.last_name} ${c.first_name}`.trim() || c.matricule);
    return map;
  }, [children.data]);

  const totals = useMemo(() => {
    const list = invoices.data ?? [];
    const due = list
      .filter((i) => i.status === "OVERDUE" || i.status === "PENDING")
      .reduce((s, i) => s + Number(i.amount || 0), 0);
    return { count: list.length, due };
  }, [invoices.data]);

  if (invoices.isLoading) return <Spinner label="Chargement des factures…" />;
  if (invoices.isError)
    return <ErrorState message="Impossible de charger les factures." onRetry={() => invoices.refetch()} />;

  const list = invoices.data ?? [];

  return (
    <>
      <PageHeader title="Finance" subtitle="Les factures et quittances de vos enfants." />

      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <StatCard label="Factures" value={totals.count} />
        <StatCard label="Reste à payer (KMF)" value={totals.due.toLocaleString("fr-FR")} accent="orange" />
      </div>

      <div className="overflow-hidden rounded-card border border-line bg-white shadow-card">
        {list.length === 0 ? (
          <div className="p-6">
            <EmptyState message="Aucune facture." />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {list.map((inv) => {
              const meta = STATUS_META[inv.status];
              return (
                <li key={inv.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="font-medium text-ink">{childName.get(inv.student) ?? "Enfant"}</p>
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
