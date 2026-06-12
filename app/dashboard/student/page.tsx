"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, BookOpen, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { WelcomeBanner } from "@/components/ui/WelcomeBanner";
import { StickerStat } from "@/components/ui/StickerStat";
import { Spinner, ErrorState, EmptyState } from "@/components/ui/States";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import {
  useAttempts,
  useChapters,
  useCourses,
  useQuizzes,
} from "@/features/student/hooks";
import type { Course, Quiz, Attempt } from "@/features/student/types";

function frenchDate(): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

export default function StudentHome() {
  const user = useAuthStore((s) => s.user);
  const courses = useCourses();
  const chapters = useChapters();
  const quizzes = useQuizzes();
  const attempts = useAttempts();

  const loading =
    courses.isLoading || chapters.isLoading || quizzes.isLoading || attempts.isLoading;
  const error = courses.isError || chapters.isError || quizzes.isError || attempts.isError;

  const stats = useMemo(() => {
    const unlocked = (chapters.data ?? []).filter((c) => c.status === "UNLOCKED").length;
    const published = (quizzes.data ?? []).filter((q) => q.status === "PUBLISHED").length;
    const att = attempts.data ?? [];
    const avg = att.length
      ? Math.round(att.reduce((s, a) => s + a.score, 0) / att.length)
      : 0;
    return {
      courses: courses.data?.length ?? 0,
      unlocked,
      published,
      avg,
      attempts: att.length,
    };
  }, [courses.data, chapters.data, quizzes.data, attempts.data]);

  const name = user?.firstName || user?.email?.split("@")[0] || "Élève";

  return (
    <>
      <PageHeader title="Tableau de bord" subtitle="Vos cours débloqués et votre progression." />

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState
          message="Impossible de charger votre espace."
          onRetry={() => {
            courses.refetch();
            chapters.refetch();
            quizzes.refetch();
            attempts.refetch();
          }}
        />
      ) : (
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <WelcomeBanner
                name={name}
                dateLabel={frenchDate()}
                subtitle="Révisez vos chapitres débloqués et entraînez-vous avec les quiz."
                ringValue={stats.avg}
                ringLabel={`Score moyen sur ${stats.attempts} quiz tenté(s)`}
                sticker="/stickers/student-hand.png"
              />
            </div>
            <ResultsCard attempts={attempts.data ?? []} quizzes={quizzes.data ?? []} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StickerStat sticker="/stickers/courses.png" value={stats.courses} label="Mes cours" tone="emerald" />
            <StickerStat sticker="/stickers/chapters.png" value={stats.unlocked} label="Chapitres débloqués" tone="sky" />
            <StickerStat sticker="/stickers/diploma.png" value={stats.published} label="Quiz disponibles" tone="violet" />
            <StickerStat sticker="/stickers/bulb.png" value={`${stats.avg}%`} label="Score moyen" tone="orange" />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <CoursesPanel courses={courses.data ?? []} />
            <ExamsLink />
          </div>
        </div>
      )}
    </>
  );
}

function ResultsCard({ attempts, quizzes }: { attempts: Attempt[]; quizzes: Quiz[] }) {
  const titleById = new Map(quizzes.map((q) => [q.id, q.title]));
  const recent = [...attempts]
    .sort((a, b) => +new Date(b.completed_at) - +new Date(a.completed_at))
    .slice(0, 4);
  return (
    <div className="rounded-card border border-line bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-heading text-base font-bold text-ink">Mes derniers résultats</h3>
      {recent.length === 0 ? (
        <EmptyState message="Aucun quiz tenté pour l'instant." />
      ) : (
        <ul className="space-y-3">
          {recent.map((a) => (
            <li key={a.id} className="flex items-center justify-between">
              <span className="truncate text-sm text-ink">
                {titleById.get(a.quiz) ?? "Quiz"}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  a.score >= 50 ? "bg-emerald-soft text-forest" : "bg-rose-100 text-rose-600"
                }`}
              >
                {a.score}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CoursesPanel({ courses }: { courses: Course[] }) {
  return (
    <div className="rounded-card border border-line bg-white p-5 shadow-sm lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-base font-bold text-ink">Mes cours</h3>
        <Link href="/dashboard/student/courses" className="flex items-center gap-1 text-sm font-semibold text-forest hover:underline">
          Voir tout <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {courses.length === 0 ? (
        <EmptyState message="Aucun cours disponible pour le moment." />
      ) : (
        <ul className="divide-y divide-line">
          {courses.slice(0, 5).map((c) => (
            <li key={c.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint">
                  <BookOpen className="h-5 w-5 text-forest" />
                </span>
                <div>
                  <p className="font-medium text-ink">{c.title}</p>
                  <p className="text-xs text-ink/50">{c.teacher_name}</p>
                </div>
              </div>
              <span className="text-xs text-ink/50">{c.chapter_count} chapitre(s)</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ExamsLink() {
  return (
    <div className="rounded-card border border-line bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-heading text-base font-bold text-ink">Préparer les examens</h3>
      <Link
        href="/dashboard/student/exams"
        className="flex items-center gap-3 rounded-lg bg-forest p-4 text-white transition-opacity hover:opacity-95"
      >
        <GraduationCap className="h-5 w-5" />
        <span className="text-sm font-semibold">M&apos;entraîner aux quiz</span>
        <ArrowRight className="ml-auto h-4 w-4" />
      </Link>
      <p className="mt-3 text-xs text-ink/50">
        Les simulations vous préparent au brevet et au bac dans les conditions réelles.
      </p>
    </div>
  );
}
