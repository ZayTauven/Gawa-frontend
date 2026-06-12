"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Spinner, ErrorState } from "@/components/ui/States";
import { useClassrooms, useStudents } from "@/features/admin/hooks";
import type { Student } from "@/features/admin/types";

export default function AdminStudentsPage() {
  const students = useStudents();
  const classrooms = useClassrooms();

  // élève -> nom de classe (via la M2M classroom.students)
  const classByStudent = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of classrooms.data ?? []) {
      for (const s of c.students) map.set(s.id, c.name);
    }
    return map;
  }, [classrooms.data]);

  const columns = useMemo<ColumnDef<Student, unknown>[]>(
    () => [
      {
        id: "name",
        header: "Élève",
        accessorFn: (s) => `${s.last_name} ${s.first_name}`,
        cell: ({ row, getValue }) => (
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mint text-sm font-bold text-forest">
              {(row.original.first_name?.[0] ?? "?").toUpperCase()}
            </span>
            <span className="font-medium text-ink">{getValue() as string}</span>
          </div>
        ),
      },
      {
        accessorKey: "matricule",
        header: "Matricule",
        cell: ({ getValue }) => (
          <span className="text-ink/60">{getValue() as string}</span>
        ),
      },
      {
        id: "classe",
        header: "Classe",
        accessorFn: (s) => classByStudent.get(s.id) ?? "Non affecté",
        cell: ({ getValue }) => (
          <span className="rounded-full bg-soft px-2.5 py-0.5 text-xs font-semibold text-ink/60">
            {getValue() as string}
          </span>
        ),
      },
    ],
    [classByStudent],
  );

  if (students.isLoading) return <Spinner label="Chargement des élèves…" />;
  if (students.isError)
    return (
      <ErrorState
        message="Impossible de charger les élèves."
        onRetry={() => students.refetch()}
      />
    );

  const list = students.data ?? [];

  return (
    <>
      <PageHeader
        title="Élèves"
        subtitle={`${list.length} élève(s) dans l'établissement.`}
      />
      <DataTable
        columns={columns}
        data={list}
        searchPlaceholder="Rechercher (nom, matricule ou classe)…"
        exportFileName="eleves-gawa"
        emptyMessage="Aucun élève ne correspond."
      />
    </>
  );
}
