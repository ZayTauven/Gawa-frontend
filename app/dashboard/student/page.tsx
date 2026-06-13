"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, BookOpen, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { WelcomeBanner } from "@/components/ui/WelcomeBanner";
import { StickerStat } from "@/components/ui/StickerStat";
import { Spinner, ErrorState, EmptyState } from "@/components/ui/States";
import { Gauge, ChartStat, BarChart } from "@/components/charts";
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

function shortLabel(t: string): string {
  return t.length > 11 ? `${t.slice(0, 10)}…` : t;
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

  // Toutes les métriques sont DÉRIVÉES des données réelles de l'API.
  const m = useMemo(() => {
    const att = [...(attempts.data ?? [])].sort(
      (a, b) => +new Date(a.completed_at) - +new Date(b.completed_at),
    );
    const scores = att.map((a) => a.score);
    const avg = scores.length
      ? Math.round(scores.reduce((s, x) => s + x, 0) / scores.length)
      : 0;
    const delta = scores.length >= 2 ? scores[scores.length - 1] - scores[0] : 0;

    const chs = chapters.data ?? [];
    const unlocked = chs.filter((c) => c.status === "UNLOCKED").length;

    const publishedQuizzes = (quizzes.data ?? []).filter((q) => q.status === "PUBLISHED");

    // Meilleur score par quiz → barres « Scores par quiz », barre forte = meilleur.
    const bestByQuiz = new Map<string, number>();
    for (const a of att) bestByQuiz.set(a.quiz, Math.max(bestByQuiz.get(a.quiz) ?? 0, a.score));
    const quizTitle = new Map((quizzes.data ?? []).map((q) => [q.id, q.title]));
    const quizBars = [...bestByQuiz.entries()]
      .map(([qid, score]) => ({ label: shortLabel(quizTitle.get(qid) ?? "Quiz"), value: score }))
      .slice(0, 7);
    const bestIdx = quizBars.reduce((bi, b, i, arr) => (b.value > arr[bi].value ? i : bi), 0);

    // Activité de révision : nb de quiz tentés par jour sur 7 jours (via completed_at).
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activity = Array.from({ length: 7 }, (_, k) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - k));
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      const count = att.filter((a) => {
        const t = new Date(a.completed_at);
        return t >= d && t < next;
      }).length;
      const label = new Intl.DateTimeFormat("fr-FR", { weekday: "short" })
        .format(d)
        .replace(".", "");
      return { label, value: count };
    });

    return {
      scores,
      avg,
      delta,
      unlocked,
      attemptCount: att.length,
      coursesCount: courses.data?.length ?? 0,
      availableQuizzes: publishedQuizzes.length,
      quizBars,
      bestIdx,
      activity,
    };
  }, [attempts.data, chapters.data, quizzes.data, courses.data]);

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
        <div className="rise-stagger space-y-5">
          {/* Héro + jauge de performance */}
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <WelcomeBanner
                name={name}
                dateLabel={frenchDate()}
                subtitle="Révisez vos chapitres débloqués et entraînez-vous avec les quiz."
                ringValue={m.avg}
                ringLabel={`Score moyen sur ${m.attemptCount} quiz tenté(s)`}
                sticker="/stickers/student-hand.png"
              />
            </div>
            <div className="flex flex-col items-center justify-center rounded-card border border-line bg-white p-5 shadow-card">
              <h3 className="mb-1 self-start font-heading text-base font-bold text-ink">
                Performance globale
              </h3>
              <Gauge value={m.avg} sub={`${m.attemptCount} quiz tenté(s)`} />
            </div>
          </div>

          {/* Stats — console (sparkline quand on a une série réelle) */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {m.scores.length >= 2 ? (
              <ChartStat
                sticker="/stickers/bulb.png"
                tone="orange"
                color="var(--color-orange)"
                value={`${m.avg}%`}
                label="Score moyen"
                delta={m.delta > 0 ? `+${m.delta} pts` : undefined}
                data={m.scores}
              />
            ) : (
              <StickerStat sticker="/stickers/bulb.png" value={`${m.avg}%`} label="Score moyen" tone="orange" />
            )}
            <StickerStat sticker="/stickers/courses.png" value={m.coursesCount} label="Mes cours" tone="emerald" />
            <StickerStat sticker="/stickers/chapters.png" value={m.unlocked} label="Chapitres débloqués" tone="sky" />
            <StickerStat sticker="/stickers/diploma.png" value={m.availableQuizzes} label="Quiz disponibles" tone="violet" />
          </div>

          {/* Graphes — scores par quiz + activité de révision */}
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="rounded-card border border-line bg-white p-5 shadow-card lg:col-span-2">
              <h3 className="mb-4 font-heading text-base font-bold text-ink">Scores par quiz</h3>
              {m.quizBars.length === 0 ? (
                <EmptyState message="Tentez un quiz pour voir vos scores apparaître ici." />
              ) : (
                <BarChart data={m.quizBars} highlight={m.bestIdx} unit="%" height={170} />
              )}
            </div>
            <div className="rounded-card border border-line bg-white p-5 shadow-card">
              <h3 className="font-heading text-base font-bold text-ink">Activité de révision</h3>
              <p className="mb-3 text-xs text-ink/50">Quiz tentés · 7 derniers jours</p>
              <BarChart data={m.activity} unit="" height={150} />
            </div>
          </div>

          {/* Cours + résultats + examens */}
          <div className="grid gap-5 lg:grid-cols-3">
            <CoursesPanel courses={courses.data ?? []} />
            <div className="space-y-5">
              <ResultsCard attempts={attempts.data ?? []} quizzes={quizzes.data ?? []} />
              <ExamsLink />
            </div>
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
    <div className="rounded-card border border-line bg-white p-5 shadow-card">
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
                  a.score >= 50 ? "bg-emerald-soft text-forest" : "bg-rose-soft text-rose"
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
    <div className="rounded-card border border-line bg-white p-5 shadow-card lg:col-span-2">
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
                <span className="flex h-10 w-10 items-center justify-center rounded-control bg-mint">
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
    <div className="rounded-card border border-line bg-white p-5 shadow-card">
      <h3 className="mb-4 font-heading text-base font-bold text-ink">Préparer les examens</h3>
      <Link
        href="/dashboard/student/exams"
        className="flex items-center gap-3 rounded-control bg-forest p-4 text-white transition-opacity hover:opacity-95"
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
