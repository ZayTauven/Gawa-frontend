"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner, ErrorState, EmptyState } from "@/components/ui/States";
import { useClassrooms, useStudents } from "@/features/admin/hooks";

const PAGE_SIZE = 10;

export default function AdminStudentsPage() {
  const students = useStudents();
  const classrooms = useClassrooms();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  // élève -> nom de classe (via la M2M classroom.students)
  const classByStudent = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of classrooms.data ?? []) {
      for (const s of c.students) map.set(s.id, c.name);
    }
    return map;
  }, [classrooms.data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = students.data ?? [];
    if (!q) return list;
    return list.filter(
      (s) =>
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
        s.matricule.toLowerCase().includes(q),
    );
  }, [students.data, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const rows = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  if (students.isLoading) return <Spinner label="Chargement des élèves…" />;
  if (students.isError)
    return <ErrorState message="Impossible de charger les élèves." onRetry={() => students.refetch()} />;

  return (
    <>
      <PageHeader title="Élèves" subtitle={`${filtered.length} élève(s) dans l'établissement.`} />

      <div className="relative mb-4 max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder="Rechercher (nom ou matricule)…"
          className="w-full rounded-lg border border-line bg-white px-3 py-2 pl-9 text-sm outline-none focus:border-forest"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState message="Aucun élève ne correspond." />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mint text-sm font-bold text-forest">
                    {(s.first_name?.[0] ?? "?").toUpperCase()}
                  </span>
                  <div>
                    <p className="font-medium text-ink">
                      {s.last_name} {s.first_name}
                    </p>
                    <p className="text-xs text-ink/50">{s.matricule}</p>
                  </div>
                </div>
                <span className="rounded-full bg-soft px-2.5 py-0.5 text-xs font-semibold text-ink/60">
                  {classByStudent.get(s.id) ?? "Non affecté"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <button
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
            className="rounded-lg px-3 py-1.5 font-medium text-forest disabled:opacity-40"
          >
            Précédent
          </button>
          <span className="text-ink/50">Page {current + 1} / {pageCount}</span>
          <button
            disabled={current >= pageCount - 1}
            onClick={() => setPage(current + 1)}
            className="rounded-lg px-3 py-1.5 font-medium text-forest disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      )}
    </>
  );
}
