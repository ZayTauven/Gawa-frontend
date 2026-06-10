"use client";

import { useMemo } from "react";
import { GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/Card";
import { Spinner, ErrorState, EmptyState } from "@/components/ui/States";
import { useAttempts, useChapters, useQuizzes } from "@/features/student/hooks";

export default function StudentExamsPage() {
  const quizzes = useQuizzes();
  const chapters = useChapters();
  const attempts = useAttempts();

  const chapterTitle = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of chapters.data ?? []) map.set(c.id, c.title);
    return map;
  }, [chapters.data]);

  // meilleur score par quiz
  const bestByQuiz = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of attempts.data ?? []) {
      map.set(a.quiz, Math.max(map.get(a.quiz) ?? 0, a.score));
    }
    return map;
  }, [attempts.data]);

  const stats = useMemo(() => {
    const att = attempts.data ?? [];
    const avg = att.length ? Math.round(att.reduce((s, a) => s + a.score, 0) / att.length) : 0;
    const published = (quizzes.data ?? []).filter((q) => q.status === "PUBLISHED");
    return { avg, attempts: att.length, available: published.length };
  }, [attempts.data, quizzes.data]);

  if (quizzes.isLoading || chapters.isLoading || attempts.isLoading)
    return <Spinner label="Chargement des quiz…" />;
  if (quizzes.isError)
    return <ErrorState message="Impossible de charger les quiz." onRetry={() => quizzes.refetch()} />;

  const published = (quizzes.data ?? []).filter((q) => q.status === "PUBLISHED");

  return (
    <>
      <PageHeader title="Examens" subtitle="Entraînez-vous avec les quiz publiés par vos enseignants." />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Quiz disponibles" value={stats.available} />
        <StatCard label="Quiz tentés" value={stats.attempts} accent="emerald" />
        <StatCard label="Score moyen" value={`${stats.avg}%`} accent="orange" />
      </div>

      {published.length === 0 ? (
        <EmptyState message="Aucun quiz publié pour le moment." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
          <ul className="divide-y divide-line">
            {published.map((q) => {
              const best = bestByQuiz.get(q.id);
              return (
                <li key={q.id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint">
                      <GraduationCap className="h-5 w-5 text-forest" />
                    </span>
                    <div>
                      <p className="font-medium text-ink">{q.title}</p>
                      <p className="text-xs text-ink/50">
                        {chapterTitle.get(q.chapter) ?? "Chapitre"} ·{" "}
                        {q.questions.length} question(s)
                      </p>
                    </div>
                  </div>
                  {best !== undefined ? (
                    <span className="rounded-full bg-emerald-soft px-3 py-1 text-xs font-bold text-forest">
                      Meilleur : {best}%
                    </span>
                  ) : (
                    <span className="rounded-full bg-orange-soft px-3 py-1 text-xs font-semibold text-orange">
                      À tenter
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
