"use client";

import { useState } from "react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { SearchField } from "./SearchField";
import { EmptyState } from "./States";
import { cn } from "@/lib/utils/cn";

/**
 * Table de données outillée (recherche + tri + pagination + export CSV),
 * bâtie sur @tanstack/react-table et habillée direction Craie vive.
 * Logique de table déléguée à la lib ; on ne style que la coque.
 */
export function DataTable<T>({
  columns,
  data,
  searchPlaceholder = "Rechercher…",
  enableSearch = true,
  pageSize = 10,
  exportFileName,
  toolbar,
  emptyMessage = "Aucune donnée à afficher.",
  className,
}: {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  searchPlaceholder?: string;
  enableSearch?: boolean;
  pageSize?: number;
  /** Si fourni, affiche un bouton d'export CSV (nom de fichier sans extension). */
  exportFileName?: string;
  /** Slot pour des filtres additionnels (ex. <FilterPill/>) à droite de la recherche. */
  toolbar?: React.ReactNode;
  emptyMessage?: string;
  className?: string;
}) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  // TanStack Table gère sa propre mémoïsation ; le React Compiler saute déjà ce
  // composant automatiquement — on neutralise le bruit de lint correspondant.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  function exportCsv() {
    const visible = table.getVisibleLeafColumns();
    const head = visible.map((c) =>
      typeof c.columnDef.header === "string" ? c.columnDef.header : c.id,
    );
    const lines = table.getFilteredRowModel().rows.map((row) =>
      visible
        .map((c) => {
          const v = row.getValue(c.id);
          const s = v == null ? "" : String(v);
          return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(";"),
    );
    const csv = [head.join(";"), ...lines].join("\r\n");
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportFileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const rows = table.getRowModel().rows;
  const { pageIndex } = table.getState().pagination;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {(enableSearch || toolbar || exportFileName) && (
        <div className="flex flex-wrap items-center gap-3">
          {enableSearch && (
            <SearchField
              value={globalFilter}
              onChange={setGlobalFilter}
              placeholder={searchPlaceholder}
              className="max-w-xs flex-1"
            />
          )}
          {toolbar}
          {exportFileName && (
            <button
              type="button"
              onClick={exportCsv}
              className="ml-auto inline-flex items-center gap-2 rounded-control border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink/70 transition-colors hover:text-ink"
            >
              <Download className="h-4 w-4" />
              Exporter
            </button>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-card border border-line bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-line bg-soft/60">
                  {hg.headers.map((header) => {
                    const sortable = header.column.getCanSort();
                    return (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-ink/50"
                      >
                        {header.isPlaceholder ? null : sortable ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className="inline-flex items-center gap-1.5 hover:text-ink"
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <ArrowUpDown className="h-3 w-3 opacity-60" />
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-mint/40">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-ink">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="p-6">
            <EmptyState message={emptyMessage} />
          </div>
        )}
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink/50">
            Page {pageIndex + 1} / {table.getPageCount()} ·{" "}
            {table.getFilteredRowModel().rows.length} résultat(s)
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="inline-flex items-center gap-1 rounded-control px-3 py-1.5 font-medium text-forest disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </button>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="inline-flex items-center gap-1 rounded-control px-3 py-1.5 font-medium text-forest disabled:opacity-40"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
