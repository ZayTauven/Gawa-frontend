"use client";

import { useMemo, useState } from "react";
import { Lock, LockOpen, Plus, Share2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { TextInput, Select } from "@/components/ui/Field";
import { CertifBadge } from "@/components/ui/CertifBadge";
import { Spinner, ErrorState, EmptyState } from "@/components/ui/States";
import { toast } from "@/components/ui/Toast";
import { StatusPill } from "@/features/teacher/StatusPill";
import {
  useCertifyResource,
  useChapters,
  useClassrooms,
  useCourses,
  useCreateChapter,
  useCreateCourse,
  useCreateResource,
  useCreateStandaloneResource,
  useResources,
  useToggleChapter,
  useToggleResource,
} from "@/features/teacher/hooks";
import type {
  Chapter,
  Classroom,
  Course,
  ResourceCategory,
  ResourceType,
} from "@/features/teacher/types";

const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  ANNALES: "Annales",
  CORRECTION: "Corrigé",
  NOTES: "Notes de cours",
  APPROFONDISSEMENT: "Approfondissement",
  OTHER: "Autre",
};

const CATEGORY_OPTIONS = (Object.keys(CATEGORY_LABELS) as ResourceCategory[]).map(
  (c) => ({ value: c, label: CATEGORY_LABELS[c] }),
);
const TYPE_OPTIONS = [
  { value: "PDF", label: "PDF" },
  { value: "LINK", label: "Lien" },
  { value: "TEXT", label: "Texte" },
  { value: "IMAGE", label: "Image" },
];

export default function TeacherResourcesPage() {
  const courses = useCourses();
  const chapters = useChapters();
  const classrooms = useClassrooms();
  const createCourse = useCreateCourse();

  const [newCourse, setNewCourse] = useState("");
  const [newCourseRoom, setNewCourseRoom] = useState("ALL");

  const chaptersByCourse = useMemo(() => {
    const map = new Map<string, Chapter[]>();
    for (const ch of chapters.data ?? []) {
      const list = map.get(ch.course) ?? [];
      list.push(ch);
      map.set(ch.course, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.order - b.order);
    return map;
  }, [chapters.data]);

  if (courses.isLoading || chapters.isLoading)
    return <Spinner label="Chargement de vos ressources…" />;
  if (courses.isError || chapters.isError)
    return (
      <ErrorState
        message="Impossible de charger les cours."
        onRetry={() => {
          courses.refetch();
          chapters.refetch();
        }}
      />
    );

  const courseList = courses.data ?? [];
  const rooms = classrooms.data ?? [];
  const roomName = new Map(rooms.map((r) => [r.id, r.name]));
  // Une classe cible + l'option « Toute l'école » (cours/ressource partagés largement).
  const roomOptions = [
    ...rooms.map((r) => ({ value: r.id, label: r.name })),
    { value: "ALL", label: "Toute l'école" },
  ];

  return (
    <>
      <PageHeader
        title="Mes ressources"
        subtitle="Créez vos cours et débloquez chapitres et ressources à votre rythme."
      />

      {/* Création de cours (rattaché à une classe) */}
      <Card className="mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const title = newCourse.trim();
            if (!title) return;
            createCourse.mutate(
              { title, classroom: newCourseRoom === "ALL" ? null : newCourseRoom },
              {
                onSuccess: () => {
                  setNewCourse("");
                  toast.success("Cours créé", { description: title });
                },
                onError: () => toast.error("Échec de la création du cours."),
              },
            );
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <TextInput
            value={newCourse}
            onChange={(e) => setNewCourse(e.target.value)}
            placeholder="Titre d'un nouveau cours (ex. Mathématiques 3ème)"
            className="flex-1"
          />
          <Select
            value={newCourseRoom}
            onValueChange={setNewCourseRoom}
            className="sm:w-52"
            options={roomOptions}
          />
          <Button type="submit" disabled={createCourse.isPending}>
            <Plus className="h-4 w-4" />
            {createCourse.isPending ? "Création…" : "Créer le cours"}
          </Button>
        </form>
        <p className="mt-2 text-xs text-ink/50">
          La classe choisie détermine quels élèves verront ce cours et ses ressources.
        </p>
      </Card>

      {/* Ressources partagées hors cours */}
      <StandaloneResources rooms={rooms} />

      {courseList.length === 0 ? (
        <EmptyState message="Vous n'avez pas encore de cours. Créez-en un ci-dessus." />
      ) : (
        <div className="space-y-5">
          {courseList.map((course) => (
            <CourseBlock
              key={course.id}
              course={course}
              chapters={chaptersByCourse.get(course.id) ?? []}
              roomLabel={course.classroom ? roomName.get(course.classroom) : undefined}
            />
          ))}
        </div>
      )}
    </>
  );
}

function StandaloneResources({ rooms }: { rooms: Classroom[] }) {
  const resources = useResources();
  const shareResource = useCreateStandaloneResource();
  const certify = useCertifyResource();
  const toggle = useToggleResource();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ResourceCategory>("ANNALES");
  const [type, setType] = useState<ResourceType>("PDF");
  const [room, setRoom] = useState("");
  const [url, setUrl] = useState("");

  const roomName = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of rooms) m.set(r.id, r.name);
    return m;
  }, [rooms]);

  // Ressources autonomes = sans chapitre (partagées hors cours).
  const standalone = (resources.data ?? []).filter((r) => r.chapter === null);
  const effectiveRoom = room || rooms[0]?.id || "";

  return (
    <Card className="mb-6 p-0">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="font-heading text-lg font-bold text-ink">
            Ressources partagées (hors cours)
          </h2>
          <p className="text-xs text-ink/50">
            Partagez une ressource à une classe précise, sans la rattacher à un cours.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setOpen((v) => !v)}
          disabled={rooms.length === 0}
        >
          <Share2 className="h-4 w-4" />
          Partager
        </Button>
      </div>

      {rooms.length === 0 && (
        <p className="px-5 py-4 text-sm text-ink/50">
          Aucune classe dans votre école : créez-en une avant de partager une ressource.
        </p>
      )}

      {open && rooms.length > 0 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const t = title.trim();
            if (!t || !effectiveRoom) return;
            shareResource.mutate(
              { classroom: effectiveRoom, title: t, type, category, url: url.trim() },
              {
                onSuccess: () => {
                  setTitle("");
                  setUrl("");
                  setOpen(false);
                  toast.success("Ressource partagée", {
                    description: `${t} → ${roomName.get(effectiveRoom) ?? "classe"}`,
                  });
                },
                onError: () => toast.error("Échec du partage de la ressource."),
              },
            );
          }}
          className="flex flex-col gap-2 border-b border-line bg-soft px-5 py-4 sm:flex-row sm:flex-wrap sm:items-center"
        >
          <TextInput
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de la ressource"
            className="flex-1 sm:min-w-48"
          />
          <Select
            value={effectiveRoom}
            onValueChange={setRoom}
            className="sm:w-44"
            options={rooms.map((r) => ({ value: r.id, label: r.name }))}
          />
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as ResourceCategory)}
            className="sm:w-44"
            options={CATEGORY_OPTIONS}
          />
          <Select
            value={type}
            onValueChange={(v) => setType(v as ResourceType)}
            className="sm:w-32"
            options={TYPE_OPTIONS}
          />
          <TextInput
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL (optionnel)"
            className="flex-1 sm:min-w-48"
          />
          <Button type="submit" size="sm" disabled={shareResource.isPending}>
            {shareResource.isPending ? "Partage…" : "Partager"}
          </Button>
        </form>
      )}

      {resources.isLoading ? (
        <p className="px-5 py-4 text-sm text-ink/50">Chargement…</p>
      ) : standalone.length === 0 ? (
        <p className="px-5 py-4 text-sm text-ink/50">
          Aucune ressource partagée hors cours pour l&apos;instant.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {standalone.map((res) => {
            const published = res.status === "UNLOCKED";
            return (
              <li
                key={res.id}
                className="flex items-center justify-between gap-3 px-5 py-3"
              >
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="rounded bg-soft px-1.5 py-0.5 text-[10px] font-bold text-ink/50 ring-1 ring-line">
                    {res.type}
                  </span>
                  <span className="rounded-full bg-mint px-2 py-0.5 text-[10px] font-semibold text-forest">
                    {CATEGORY_LABELS[res.category]}
                  </span>
                  <span className="truncate text-sm text-ink">{res.title}</span>
                  {res.classroom && (
                    <span className="rounded-full bg-soft px-2 py-0.5 text-[10px] font-semibold text-ink/60">
                      {roomName.get(res.classroom) ?? "Classe"}
                    </span>
                  )}
                  <StatusPill status={res.status} />
                  {res.ai_eligible && <CertifBadge small />}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    onClick={() =>
                      certify.mutate(
                        { id: res.id, aiEligible: !res.ai_eligible },
                        {
                          onSuccess: () =>
                            toast.success(
                              res.ai_eligible ? "Certification retirée" : "Ressource certifiée",
                            ),
                          onError: () => toast.error("Certification impossible."),
                        },
                      )
                    }
                    disabled={certify.isPending}
                    className="text-xs font-semibold text-ink/50 underline hover:text-forest disabled:opacity-50"
                  >
                    {res.ai_eligible ? "Retirer certif." : "Certifier"}
                  </button>
                  <button
                    onClick={() =>
                      toggle.mutate(
                        { id: res.id, status: published ? "LOCKED" : "UNLOCKED" },
                        {
                          onSuccess: () =>
                            toast.success(published ? "Ressource masquée" : "Ressource publiée"),
                          onError: () => toast.error("Action impossible."),
                        },
                      )
                    }
                    disabled={toggle.isPending}
                    className="text-xs font-semibold text-forest underline disabled:opacity-50"
                  >
                    {published ? "Masquer" : "Publier"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function CourseBlock({
  course,
  chapters,
  roomLabel,
}: {
  course: Course;
  chapters: Chapter[];
  roomLabel?: string;
}) {
  const createChapter = useCreateChapter();
  const [title, setTitle] = useState("");

  return (
    <Card className="p-0">
      <div className="border-b border-line px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-heading text-lg font-bold text-ink">{course.title}</h2>
          <span className="rounded-full bg-mint px-2.5 py-0.5 text-[11px] font-semibold text-forest">
            {roomLabel ?? "Toute l'école"}
          </span>
        </div>
        <p className="mt-1 text-xs text-ink/50">
          {chapters.length} chapitre(s) ·{" "}
          {chapters.filter((c) => c.status === "UNLOCKED").length} publié(s)
        </p>
      </div>

      <div className="divide-y divide-line">
        {chapters.length === 0 ? (
          <p className="px-5 py-4 text-sm text-ink/50">
            Aucun chapitre pour l&apos;instant.
          </p>
        ) : (
          chapters.map((chapter) => (
            <ChapterRow key={chapter.id} chapter={chapter} />
          ))
        )}
      </div>

      {/* Ajout de chapitre */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const t = title.trim();
          if (!t) return;
          createChapter.mutate(
            { course: course.id, title: t, order: chapters.length + 1 },
            {
              onSuccess: () => {
                setTitle("");
                toast.success("Chapitre ajouté", { description: t });
              },
              onError: () => toast.error("Échec de l'ajout du chapitre."),
            },
          );
        }}
        className="flex flex-col gap-2 border-t border-line bg-soft px-5 py-3 sm:flex-row"
      >
        <TextInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ajouter un chapitre…"
          className="flex-1"
        />
        <Button type="submit" variant="secondary" size="sm" disabled={createChapter.isPending}>
          <Plus className="h-4 w-4" />
          Chapitre
        </Button>
      </form>
    </Card>
  );
}

function ChapterRow({ chapter }: { chapter: Chapter }) {
  const toggleChapter = useToggleChapter();
  const toggleResource = useToggleResource();
  const certifyResource = useCertifyResource();
  const createResource = useCreateResource();

  const [resTitle, setResTitle] = useState("");
  const [resType, setResType] = useState<ResourceType>("PDF");
  const [resCategory, setResCategory] = useState<ResourceCategory>("NOTES");
  const [resUrl, setResUrl] = useState("");
  const [showForm, setShowForm] = useState(false);

  const published = chapter.status === "UNLOCKED";

  function setPublished(next: boolean) {
    toggleChapter.mutate(
      { id: chapter.id, status: next ? "UNLOCKED" : "LOCKED" },
      {
        onSuccess: () =>
          toast.success(next ? "Chapitre publié" : "Chapitre verrouillé", {
            description: chapter.title,
          }),
        onError: () => toast.error("Action impossible. Réessayez."),
      },
    );
  }

  return (
    <div className="px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-medium text-ink">
            {chapter.order}. {chapter.title}
          </span>
          <StatusPill status={chapter.status} />
        </div>
        {published ? (
          // Verrouiller retire l'accès aux élèves → on confirme.
          <ConfirmDialog
            title="Verrouiller ce chapitre ?"
            description="Les élèves n'y auront plus accès jusqu'à un nouveau déblocage."
            confirmLabel="Verrouiller"
            confirmVariant="danger"
            onConfirm={() => setPublished(false)}
          >
            <Button variant="ghost" size="sm" disabled={toggleChapter.isPending}>
              <Lock className="h-4 w-4" /> Verrouiller
            </Button>
          </ConfirmDialog>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            disabled={toggleChapter.isPending}
            onClick={() => setPublished(true)}
          >
            <LockOpen className="h-4 w-4" /> Publier
          </Button>
        )}
      </div>

      {/* Ressources du chapitre */}
      {chapter.resources.length > 0 && (
        <ul className="mt-3 space-y-2 pl-4">
          {chapter.resources.map((res) => {
            const resPublished = res.status === "UNLOCKED";
            return (
              <li
                key={res.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-soft px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-ink/50 ring-1 ring-line">
                    {res.type}
                  </span>
                  <span className="rounded-full bg-mint px-2 py-0.5 text-[10px] font-semibold text-forest">
                    {CATEGORY_LABELS[res.category]}
                  </span>
                  <span className="truncate text-sm text-ink">{res.title}</span>
                  <StatusPill status={res.status} />
                  {res.ai_eligible && <CertifBadge small />}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    onClick={() =>
                      certifyResource.mutate(
                        { id: res.id, aiEligible: !res.ai_eligible },
                        {
                          onSuccess: () =>
                            toast.success(
                              res.ai_eligible
                                ? "Certification retirée"
                                : "Ressource certifiée",
                              {
                                description: res.ai_eligible
                                  ? res.title
                                  : "Elle pourra entraîner Prof Hibou.",
                              },
                            ),
                          onError: () =>
                            toast.error("Certification impossible", {
                              description: "Seules les ressources pédagogiques sont éligibles.",
                            }),
                        },
                      )
                    }
                    disabled={certifyResource.isPending}
                    className="text-xs font-semibold text-ink/50 underline hover:text-forest disabled:opacity-50"
                  >
                    {res.ai_eligible ? "Retirer certif." : "Certifier"}
                  </button>
                  <button
                    onClick={() =>
                      toggleResource.mutate(
                        { id: res.id, status: resPublished ? "LOCKED" : "UNLOCKED" },
                        {
                          onSuccess: () =>
                            toast.success(
                              resPublished ? "Ressource verrouillée" : "Ressource publiée",
                              { description: res.title },
                            ),
                          onError: () => toast.error("Action impossible. Réessayez."),
                        },
                      )
                    }
                    disabled={toggleResource.isPending}
                    className="text-xs font-semibold text-forest underline disabled:opacity-50"
                  >
                    {resPublished ? "Verrouiller" : "Publier"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Ajout de ressource */}
      {showForm ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const t = resTitle.trim();
            if (!t) return;
            createResource.mutate(
              {
                chapter: chapter.id,
                title: t,
                type: resType,
                category: resCategory,
                url: resUrl.trim(),
              },
              {
                onSuccess: () => {
                  setResTitle("");
                  setResUrl("");
                  setShowForm(false);
                  toast.success("Ressource ajoutée", { description: t });
                },
                onError: () => toast.error("Échec de l'ajout de la ressource."),
              },
            );
          }}
          className="mt-3 flex flex-col gap-2 rounded-control border border-line p-3 sm:flex-row sm:items-center"
        >
          <TextInput
            value={resTitle}
            onChange={(e) => setResTitle(e.target.value)}
            placeholder="Titre de la ressource"
            className="flex-1"
          />
          <Select
            value={resCategory}
            onValueChange={(v) => setResCategory(v as ResourceCategory)}
            className="sm:w-44"
            options={(Object.keys(CATEGORY_LABELS) as ResourceCategory[]).map((c) => ({
              value: c,
              label: CATEGORY_LABELS[c],
            }))}
          />
          <Select
            value={resType}
            onValueChange={(v) => setResType(v as ResourceType)}
            className="sm:w-32"
            options={[
              { value: "PDF", label: "PDF" },
              { value: "LINK", label: "Lien" },
              { value: "TEXT", label: "Texte" },
              { value: "IMAGE", label: "Image" },
            ]}
          />
          <TextInput
            value={resUrl}
            onChange={(e) => setResUrl(e.target.value)}
            placeholder="URL (optionnel)"
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={createResource.isPending}>
            Ajouter
          </Button>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mt-3 flex items-center gap-1 text-xs font-semibold text-ink/50 hover:text-forest"
        >
          <Plus className="h-3.5 w-3.5" /> Ajouter une ressource
        </button>
      )}
    </div>
  );
}
