"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Spinner, ErrorState, EmptyState } from "@/components/ui/States";
import {
  useCreateSchool,
  useDeleteSchool,
  useSchools,
  useUpdateSchool,
} from "@/features/platform/hooks";
import type { School } from "@/features/platform/types";

const PAGE_SIZE = 8;
const inputCls =
  "rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-forest";

export default function SchoolsPage() {
  const schools = useSchools();
  const createSchool = useCreateSchool();

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = schools.data ?? [];
    if (!q) return list;
    return list.filter(
      (s) =>
        s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
    );
  }, [schools.data, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const rows = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  if (schools.isLoading) return <Spinner label="Chargement des écoles…" />;
  if (schools.isError)
    return <ErrorState message="Impossible de charger les écoles." onRetry={() => schools.refetch()} />;

  return (
    <>
      <PageHeader title="Écoles" subtitle="Créez et administrez les établissements du réseau." />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Rechercher (code ou nom)…"
            className={`${inputCls} w-full pl-9`}
          />
        </div>
        <Button onClick={() => setShowCreate((v) => !v)}>
          <Plus className="h-4 w-4" /> Nouvelle école
        </Button>
      </div>

      {showCreate && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!code.trim() || !name.trim()) return;
            createSchool.mutate(
              { code: code.trim().toUpperCase(), name: name.trim() },
              {
                onSuccess: () => {
                  setCode("");
                  setName("");
                  setShowCreate(false);
                },
              },
            );
          }}
          className="mb-4 flex flex-col gap-3 rounded-xl border border-line bg-white p-4 shadow-sm sm:flex-row sm:items-end"
        >
          <label className="flex-1 text-sm font-medium text-ink">
            Code
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ex. LYC-MOR"
              className={`${inputCls} mt-1 w-full`}
            />
          </label>
          <label className="flex-[2] text-sm font-medium text-ink">
            Nom de l&apos;établissement
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex. Lycée de Moroni"
              className={`${inputCls} mt-1 w-full`}
            />
          </label>
          <Button type="submit" disabled={createSchool.isPending}>
            {createSchool.isPending ? "Création…" : "Créer"}
          </Button>
        </form>
      )}
      {createSchool.isError && (
        <p className="mb-3 text-sm text-orange">
          Échec de création (code déjà utilisé ?).
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState message="Aucune école ne correspond." />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((school) => (
              <SchoolRow key={school.id} school={school} />
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
          <span className="text-ink/50">
            Page {current + 1} / {pageCount}
          </span>
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

function SchoolRow({ school }: { school: School }) {
  const update = useUpdateSchool();
  const remove = useDeleteSchool();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(school.name);

  return (
    <li className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="rounded bg-soft px-2 py-1 text-xs font-bold text-ink/60 ring-1 ring-line">
          {school.code}
        </span>
        {editing ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${inputCls} w-56`}
          />
        ) : (
          <span className="font-medium text-ink">{school.name}</span>
        )}
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            school.is_active ? "bg-emerald-soft text-forest" : "bg-soft text-ink/50"
          }`}
        >
          {school.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {editing ? (
          <>
            <Button
              size="sm"
              disabled={update.isPending}
              onClick={() =>
                update.mutate(
                  { id: school.id, patch: { name: name.trim() } },
                  { onSuccess: () => setEditing(false) },
                )
              }
            >
              Enregistrer
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setName(school.name);
                setEditing(false);
              }}
            >
              Annuler
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
              Modifier
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={update.isPending}
              onClick={() =>
                update.mutate({
                  id: school.id,
                  patch: { is_active: !school.is_active },
                })
              }
            >
              {school.is_active ? "Désactiver" : "Activer"}
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={remove.isPending}
              onClick={() => {
                if (confirm(`Supprimer l'école « ${school.name} » ?`)) {
                  remove.mutate(school.id);
                }
              }}
            >
              Supprimer
            </Button>
          </>
        )}
      </div>
    </li>
  );
}
