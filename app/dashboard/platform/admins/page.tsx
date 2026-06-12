"use client";

import { useMemo, useState } from "react";
import { KeyRound, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Spinner, ErrorState, EmptyState } from "@/components/ui/States";
import {
  useCreateSchoolAdmin,
  usePlatformUsers,
  useResetAdminPassword,
  useSchools,
  useSetUserActive,
} from "@/features/platform/hooks";
import type { PlatformUser } from "@/features/platform/types";

const inputCls =
  "rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-emerald focus:ring-2 focus:ring-emerald-soft";

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
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher (email ou école)…"
            className={`${inputCls} w-full pl-9`}
          />
        </div>
        <Button onClick={() => setShowCreate((v) => !v)}>
          <Plus className="h-4 w-4" /> Nouvel admin
        </Button>
      </div>

      {showCreate && (
        <form
          onSubmit={submit}
          className="mb-4 grid gap-3 rounded-card border border-line bg-white p-4 shadow-sm sm:grid-cols-2"
        >
          <label className="text-sm font-medium text-ink">
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`${inputCls} mt-1 w-full`}
              placeholder="directeur@ecole.km"
            />
          </label>
          <label className="text-sm font-medium text-ink">
            École
            <select
              value={form.default_school}
              onChange={(e) => setForm({ ...form, default_school: e.target.value })}
              className={`${inputCls} mt-1 w-full`}
            >
              <option value="">— Choisir —</option>
              {schoolList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-ink">
            Prénom
            <input
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              className={`${inputCls} mt-1 w-full`}
            />
          </label>
          <label className="text-sm font-medium text-ink">
            Nom
            <input
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              className={`${inputCls} mt-1 w-full`}
            />
          </label>
          <label className="text-sm font-medium text-ink sm:col-span-2">
            Mot de passe initial (min. 8 caractères)
            <input
              type="text"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`${inputCls} mt-1 w-full`}
              placeholder="••••••••"
            />
          </label>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={createAdmin.isPending}>
              {createAdmin.isPending ? "Création…" : "Créer et affecter"}
            </Button>
            {createAdmin.isError && (
              <span className="ml-3 text-sm text-orange">
                Échec (email déjà utilisé ?).
              </span>
            )}
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-card border border-line bg-white shadow-sm">
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

  const fullName =
    [admin.first_name, admin.last_name].filter(Boolean).join(" ") || admin.email;

  return (
    <li className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
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
            const pwd = prompt(`Nouveau mot de passe pour ${admin.email} (min. 8) :`);
            if (!pwd) return;
            if (pwd.length < 8) {
              alert("Le mot de passe doit faire au moins 8 caractères.");
              return;
            }
            resetPwd.mutate(
              { id: admin.id, password: pwd },
              {
                onSuccess: () => {
                  setDone("Mot de passe réinitialisé");
                  setTimeout(() => setDone(null), 3000);
                },
              },
            );
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
    </li>
  );
}
