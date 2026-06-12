"use client";

import { useMemo, useState } from "react";
import { FileText, Link2, Type, Image as ImageIcon, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchField } from "@/components/ui/SearchField";
import { FilterPill } from "@/components/ui/FilterPill";
import { CertifBadge } from "@/components/ui/CertifBadge";
import { Hibou } from "@/components/ui/Hibou";
import { Spinner, ErrorState, EmptyState } from "@/components/ui/States";
import { useResources } from "@/features/student/hooks";
import type { ResourceCategory, ResourceType } from "@/features/student/types";

const TYPE_META: Record<ResourceType, { label: string; Icon: typeof FileText }> = {
  PDF: { label: "PDF", Icon: FileText },
  LINK: { label: "Lien", Icon: Link2 },
  TEXT: { label: "Texte", Icon: Type },
  IMAGE: { label: "Image", Icon: ImageIcon },
};

const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  ANNALES: "Annales",
  CORRECTION: "Corrigés",
  NOTES: "Notes de cours",
  APPROFONDISSEMENT: "Approfondissement",
  OTHER: "Autre",
};
// Filtres par taxonomie pédagogique (axe principal du design).
const CATEGORY_FILTERS: ResourceCategory[] = [
  "ANNALES",
  "CORRECTION",
  "NOTES",
  "APPROFONDISSEMENT",
];

export default function StudentResourcesPage() {
  // Bibliothèque déjà cloisonnée côté serveur (classe + publiées + audience élève).
  const resources = useResources();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ResourceCategory | "ALL">("ALL");
  const [certifiedOnly, setCertifiedOnly] = useState(false);

  const all = useMemo(() => resources.data ?? [], [resources.data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(
      (r) =>
        (category === "ALL" || r.category === category) &&
        (!certifiedOnly || r.ai_eligible) &&
        (!q ||
          r.title.toLowerCase().includes(q) ||
          (r.chapter_title ?? "").toLowerCase().includes(q)),
    );
  }, [all, query, category, certifiedOnly]);

  const certifiedCount = useMemo(() => all.filter((r) => r.ai_eligible).length, [all]);

  if (resources.isLoading) return <Spinner label="Chargement des ressources…" />;
  if (resources.isError)
    return (
      <ErrorState
        message="Impossible de charger les ressources."
        onRetry={() => resources.refetch()}
      />
    );

  return (
    <>
      <PageHeader
        title="Ressources"
        subtitle="Annales, corrigés, notes de cours et approfondissements publiés par vos enseignants."
      />

      {/* Règle de certification — Prof Hibou */}
      <div className="mb-5 flex items-center gap-3 rounded-card border border-line bg-mint/50 p-4">
        <Hibou pose="hello" size={44} className="shrink-0" />
        <p className="text-sm text-ink/70">
          Une ressource <CertifBadge small className="mx-0.5 align-middle" /> a été{" "}
          <span className="font-semibold text-forest">validée par votre école</span> : ce
          sont les seules qui entraînent <span className="font-semibold">Prof Hibou</span>{" "}
          pour vos quiz et simulations d&apos;examen.
        </p>
      </div>

      {/* Barre d'outils : recherche + filtres */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Rechercher une ressource…"
          className="max-w-xs flex-1"
        />
        <div className="flex flex-wrap items-center gap-1.5">
          <FilterPill active={category === "ALL"} onClick={() => setCategory("ALL")}>
            Toutes
          </FilterPill>
          {CATEGORY_FILTERS.map((c) => (
            <FilterPill key={c} active={category === c} onClick={() => setCategory(c)}>
              {CATEGORY_LABELS[c]}
            </FilterPill>
          ))}
          <FilterPill
            active={certifiedOnly}
            onClick={() => setCertifiedOnly((v) => !v)}
          >
            Certifiées ({certifiedCount})
          </FilterPill>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Aucune ressource"
          message="Aucune ressource ne correspond à votre recherche pour l'instant."
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {filtered.map((r) => {
            const { Icon, label } = TYPE_META[r.type];
            return (
              <li
                key={r.id}
                className="flex items-start gap-3 rounded-card border border-line bg-white p-4 shadow-sm"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-mint text-forest">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-ink">{r.title}</p>
                    <span className="rounded-full bg-mint px-2 py-0.5 text-[10px] font-semibold text-forest">
                      {CATEGORY_LABELS[r.category]}
                    </span>
                    {r.ai_eligible && <CertifBadge small />}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-ink/50">
                    {r.chapter_title ?? "Ressource partagée"} · {label}
                  </p>
                </div>
                {r.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex shrink-0 items-center gap-1 rounded-control bg-soft px-2.5 py-1.5 text-xs font-semibold text-forest transition-colors hover:bg-mint"
                  >
                    Ouvrir <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
