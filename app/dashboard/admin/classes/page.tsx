"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner, ErrorState, EmptyState } from "@/components/ui/States";
import { cn } from "@/lib/utils";
import { useClassrooms } from "@/features/admin/hooks";

export default function AdminClassesPage() {
  const classrooms = useClassrooms();
  const [openId, setOpenId] = useState<string | null>(null);

  if (classrooms.isLoading) return <Spinner label="Chargement des classes…" />;
  if (classrooms.isError)
    return <ErrorState message="Impossible de charger les classes." onRetry={() => classrooms.refetch()} />;

  const classes = classrooms.data ?? [];

  return (
    <>
      <PageHeader title="Classes" subtitle={`${classes.length} classe(s) · effectifs et listes.`} />

      {classes.length === 0 ? (
        <EmptyState message="Aucune classe enregistrée." />
      ) : (
        <div className="space-y-3">
          {classes.map((c) => {
            const open = openId === c.id;
            return (
              <div key={c.id} className="overflow-hidden rounded-card border border-line bg-white shadow-card">
                <button
                  onClick={() => setOpenId(open ? null : c.id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint">
                      <Image src="/stickers/board.png" alt="" width={22} height={22} />
                    </span>
                    <div>
                      <p className="font-medium text-ink">{c.name}</p>
                      <p className="text-xs text-ink/50">{c.academic_year}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-sm text-ink/60">
                      <Users className="h-4 w-4" /> {c.student_count}
                    </span>
                    <ChevronDown
                      className={cn("h-5 w-5 text-ink/40 transition-transform", open && "rotate-180")}
                    />
                  </div>
                </button>

                {open && (
                  <div className="border-t border-line">
                    {c.students.length === 0 ? (
                      <p className="px-5 py-4 text-sm text-ink/50">Aucun élève inscrit.</p>
                    ) : (
                      <ul className="divide-y divide-line">
                        {c.students.map((s) => (
                          <li key={s.id} className="flex items-center justify-between px-5 py-2.5">
                            <span className="text-sm text-ink">
                              {s.last_name} {s.first_name}
                            </span>
                            <span className="text-xs text-ink/45">{s.matricule}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
