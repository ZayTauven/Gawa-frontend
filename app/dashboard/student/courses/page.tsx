"use client";

import { useMemo } from "react";
import { FileText, Lock } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner, ErrorState, EmptyState } from "@/components/ui/States";
import { useChapters, useCourses } from "@/features/student/hooks";
import type { Chapter } from "@/features/student/types";

export default function StudentCoursesPage() {
  const courses = useCourses();
  const chapters = useChapters();

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
    return <Spinner label="Chargement de vos cours…" />;
  if (courses.isError || chapters.isError)
    return <ErrorState message="Impossible de charger les cours." onRetry={() => { courses.refetch(); chapters.refetch(); }} />;

  const courseList = courses.data ?? [];

  return (
    <>
      <PageHeader title="Mes cours" subtitle="Les chapitres et ressources débloqués par vos enseignants." />

      {courseList.length === 0 ? (
        <EmptyState message="Aucun cours disponible pour le moment." />
      ) : (
        <div className="space-y-5">
          {courseList.map((course) => {
            const all = chaptersByCourse.get(course.id) ?? [];
            const unlocked = all.filter((c) => c.status === "UNLOCKED");
            const lockedCount = all.length - unlocked.length;
            return (
              <div key={course.id} className="overflow-hidden rounded-card border border-line bg-white shadow-sm">
                <div className="border-b border-line px-5 py-4">
                  <h2 className="font-heading text-lg font-bold text-ink">{course.title}</h2>
                  <p className="text-xs text-ink/50">{course.teacher_name}</p>
                </div>

                {unlocked.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-ink/50">
                    Aucun chapitre débloqué pour l&apos;instant.
                  </p>
                ) : (
                  <div className="divide-y divide-line">
                    {unlocked.map((chapter) => {
                      const res = chapter.resources.filter((r) => r.status === "UNLOCKED");
                      return (
                        <div key={chapter.id} className="px-5 py-4">
                          <p className="font-medium text-ink">
                            {chapter.order}. {chapter.title}
                          </p>
                          {res.length === 0 ? (
                            <p className="mt-2 text-xs text-ink/40">Aucune ressource.</p>
                          ) : (
                            <ul className="mt-3 space-y-2 pl-2">
                              {res.map((r) => (
                                <li key={r.id} className="flex items-center gap-2 rounded-lg bg-soft px-3 py-2">
                                  <FileText className="h-4 w-4 text-forest" />
                                  <span className="text-sm text-ink">{r.title}</span>
                                  <span className="ml-auto rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-ink/50 ring-1 ring-line">
                                    {r.type}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {lockedCount > 0 && (
                  <div className="flex items-center gap-2 border-t border-line bg-soft px-5 py-2.5 text-xs text-ink/50">
                    <Lock className="h-3.5 w-3.5" />
                    {lockedCount} chapitre(s) encore verrouillé(s) par l&apos;enseignant.
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
