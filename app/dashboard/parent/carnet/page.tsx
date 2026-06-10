"use client";

import { useState } from "react";
import { NotebookPen } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner, ErrorState, EmptyState } from "@/components/ui/States";
import { cn } from "@/lib/utils/cn";
import { useCarnet, useChildren } from "@/features/parent/hooks";

export default function ParentCarnetPage() {
  const children = useChildren();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const list = children.data ?? [];
  const activeId = selectedId ?? list[0]?.id ?? null;
  const carnet = useCarnet(activeId);

  if (children.isLoading) return <Spinner label="Chargement…" />;
  if (children.isError)
    return <ErrorState message="Impossible de charger vos enfants." onRetry={() => children.refetch()} />;

  return (
    <>
      <PageHeader title="Carnet de liaison" subtitle="Les mots des enseignants concernant votre enfant." />

      {list.length === 0 ? (
        <EmptyState message="Aucun enfant rattaché à votre compte." />
      ) : (
        <>
          {list.length > 1 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {list.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                    c.id === activeId
                      ? "bg-forest text-white"
                      : "bg-white text-ink/70 ring-1 ring-line hover:bg-soft",
                  )}
                >
                  {c.first_name} {c.last_name}
                </button>
              ))}
            </div>
          )}

          {carnet.isLoading ? (
            <Spinner label="Chargement du carnet…" />
          ) : carnet.isError ? (
            <ErrorState message="Impossible de charger le carnet." onRetry={() => carnet.refetch()} />
          ) : (carnet.data ?? []).length === 0 ? (
            <EmptyState message="Aucun mot de liaison pour le moment." />
          ) : (
            <ul className="space-y-3">
              {(carnet.data ?? []).map((note) => (
                <li key={note.id} className="rounded-xl border border-line bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mint">
                      <NotebookPen className="h-5 w-5 text-forest" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-ink">{note.teacher_name || "Enseignant"}</p>
                        <span className="shrink-0 text-xs text-ink/40">
                          {new Intl.DateTimeFormat("fr-FR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          }).format(new Date(note.created_at))}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-ink/80">{note.content}</p>
                      {note.parent_acknowledged && (
                        <span className="mt-3 inline-block rounded-full bg-emerald-soft px-2.5 py-0.5 text-xs font-semibold text-forest">
                          Lu
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}
