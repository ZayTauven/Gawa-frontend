"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { SearchField } from "@/components/ui/SearchField";
import { TextInput } from "@/components/ui/form-field";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Spinner, ErrorState, EmptyState } from "@/components/ui/States";
import {
  useCreateSchool,
  useDeleteSchool,
  useSchools,
  useUpdateSchool,
} from "@/features/platform/hooks";
import type { School } from "@/features/platform/types";

const PAGE_SIZE = 8;

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
        <SearchField
          value={query}
          onChange={(v) => { setQuery(v); setPage(0); }}
          placeholder="Rechercher (code ou nom)…"
          className="max-w-xs flex-1"
        />
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
          className="mb-4 flex flex-col gap-4 rounded-card border border-line bg-white p-5 shadow-card sm:flex-row sm:items-end"
        >
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor="school-code" className="text-sm font-medium text-ink">Code</label>
            <TextInput
              id="school-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ex. LYC-MOR"
            />
          </div>
          <div className="flex flex-[2] flex-col gap-1.5">
            <label htmlFor="school-name" className="text-sm font-medium text-ink">
              Nom de l&apos;établissement
            </label>
            <TextInput
              id="school-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex. Lycée de Moroni"
            />
          </div>
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

      <div className="overflow-hidden rounded-card border border-line bg-white shadow-card">
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
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
          >
            Précédent
          </Button>
          <span className="text-sm text-ink/50">
            Page {current + 1} / {pageCount}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={current >= pageCount - 1}
            onClick={() => setPage(current + 1)}
          >
            Suivant
          </Button>
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
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-56"
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
            <ConfirmDialog
              title={`Supprimer « ${school.name} » ?`}
              description="Cette action est irréversible. L'école et toutes ses données seront supprimées."
              confirmLabel="Supprimer"
              confirmVariant="danger"
              onConfirm={() => remove.mutate(school.id)}
            >
              <Button size="sm" variant="danger" disabled={remove.isPending}>
                Supprimer
              </Button>
            </ConfirmDialog>
          </>
        )}
      </div>
    </li>
  );
}
