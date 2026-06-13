"use client";

import { useMemo, useState } from "react";
import { KeyRound, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { SearchField } from "@/components/ui/SearchField";
import { Field, TextInput, Select } from "@/components/ui/form-field";
import { Spinner, ErrorState, EmptyState } from "@/components/ui/States";
import {
  useCreateSchoolAdmin,
  usePlatformUsers,
  useResetAdminPassword,
  useSchools,
  useSetUserActive,
} from "@/features/platform/hooks";
import type { PlatformUser } from "@/features/platform/types";

export default function AdminsPage() {
  const users = usePlatformUsers();
  const schools = useSchools();
  const createAdmin = useCreateSchoolAdmin();

  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    default_school: "",
  });

  const admins = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = (users.data ?? []).filter((u) => u.role === "SCHOOL_ADMIN");
    if (!q) return list;
    return list.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        (u.default_school_code ?? "").toLowerCase().includes(q),
    );
  }, [users.data, query]);

  if (users.isLoading || schools.isLoading)
    return <Spinner label="Chargement des admins…" />;
  if (users.isError)
    return <ErrorState message="Impossible de charger les utilisateurs." onRetry={() => users.refetch()} />;

  const schoolList = schools.data ?? [];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.password || form.password.length < 8 || !form.default_school)
      return;
    createAdmin.mutate(form, {
      onSuccess: () => {
        setForm({ email: "", first_name: "", last_name: "", password: "", default_school: "" });
        setShowCreate(false);
      },
    });
  }

  return (
    <>
      <PageHeader
        title="Admins d'école"
        subtitle="Créez les comptes administrateurs et affectez-les à un établissement."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Rechercher (email ou école)…"
          className="max-w-xs flex-1"
        />
        <Button onClick={() => setShowCreate((v) => !v)}>
          <Plus className="h-4 w-4" /> Nouvel admin
        </Button>
      </div>

      {showCreate && (
        <form
          onSubmit={submit}
          className="mb-4 grid gap-4 rounded-card border border-line bg-white p-5 shadow-card sm:grid-cols-2"
        >
          <Field label="Email">
            <TextInput
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="directeur@ecole.km"
            />
          </Field>
          <Field label="École">
            <Select
              value={form.default_school}
              onValueChange={(v) => setForm({ ...form, default_school: v })}
              placeholder="— Choisir —"
              options={schoolList.map((s) => ({
                value: s.id,
                label: `${s.name} (${s.code})`,
              }))}
            />
          </Field>
          <Field label="Prénom">
            <TextInput
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            />
          </Field>
          <Field label="Nom">
            <TextInput
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            />
          </Field>
          <Field label="Mot de passe initial (min. 8 caractères)" className="sm:col-span-2">
            <TextInput
              type="text"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </Field>
          <div className="flex items-center gap-3 sm:col-span-2">
            <Button type="submit" disabled={createAdmin.isPending}>
              {createAdmin.isPending ? "Création…" : "Créer et affecter"}
            </Button>
            {createAdmin.isError && (
              <span className="text-sm text-orange">
                Échec (email déjà utilisé ?).
              </span>
            )}
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-card border border-line bg-white shadow-card">
        {admins.length === 0 ? (
          <div className="p-6">
            <EmptyState message="Aucun administrateur d'école." />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {admins.map((admin) => (
              <AdminRow key={admin.id} admin={admin} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function AdminRow({ admin }: { admin: PlatformUser }) {
  const setActive = useSetUserActive();
  const resetPwd = useResetAdminPassword();
  const [done, setDone] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [newPwd, setNewPwd] = useState("");

  const fullName =
    [admin.first_name, admin.last_name].filter(Boolean).join(" ") || admin.email;

  function handleReset() {
    resetPwd.mutate(
      { id: admin.id, password: newPwd },
      {
        onSuccess: () => {
          setDone("Mot de passe réinitialisé");
          setResetOpen(false);
          setNewPwd("");
          setTimeout(() => setDone(null), 3000);
        },
      },
    );
  }

  return (
    <li className="flex flex-col">
      <div className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-sm font-bold text-white">
            {(admin.first_name?.[0] ?? admin.email[0]).toUpperCase()}
          </span>
          <div>
            <p className="font-medium text-ink">{fullName}</p>
            <p className="text-xs text-ink/50">
              {admin.email} · {admin.default_school_code ?? "—"}
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              admin.is_active ? "bg-emerald-soft text-forest" : "bg-rose-100 text-rose-600"
            }`}
          >
            {admin.is_active ? "Actif" : "Désactivé"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {done && <span className="text-xs font-medium text-emerald">{done}</span>}
          <Button
            size="sm"
            variant="ghost"
            disabled={resetPwd.isPending}
            onClick={() => {
              setResetOpen((v) => !v);
              setNewPwd("");
            }}
          >
            <KeyRound className="h-4 w-4" /> Reset MDP
          </Button>
          <Button
            size="sm"
            variant={admin.is_active ? "ghost" : "secondary"}
            disabled={setActive.isPending}
            onClick={() => setActive.mutate({ id: admin.id, isActive: !admin.is_active })}
          >
            {admin.is_active ? "Désactiver" : "Réactiver"}
          </Button>
        </div>
      </div>

      {resetOpen && (
        <div className="flex flex-wrap items-center gap-2 border-t border-line bg-soft px-5 py-3">
          <TextInput
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            placeholder="Nouveau mot de passe (min. 8 caractères)"
            className="flex-1"
          />
          <Button
            size="sm"
            disabled={resetPwd.isPending || newPwd.length < 8}
            onClick={handleReset}
          >
            {resetPwd.isPending ? "Réinitialisation…" : "Réinitialiser"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setResetOpen(false);
              setNewPwd("");
            }}
          >
            Annuler
          </Button>
        </div>
      )}
    </li>
  );
}
