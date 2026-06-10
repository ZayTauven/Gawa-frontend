"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { ArrowRight, BookOpen, Users, WifiOff } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { WelcomeBanner } from "@/components/ui/WelcomeBanner";
import { StickerStat } from "@/components/ui/StickerStat";
import { Spinner, ErrorState } from "@/components/ui/States";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { todayKey, dayKey } from "@/lib/utils/date";
import {
  useAttendance,
  useChapters,
  useClassrooms,
  useCourses,
} from "@/features/teacher/hooks";

function frenchDate(): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

export default function TeacherHome() {
  const user = useAuthStore((s) => s.user);
  const classrooms = useClassrooms();
  const courses = useCourses();
  const chapters = useChapters();
  const attendance = useAttendance();

  const loading =
    classrooms.isLoading ||
    courses.isLoading ||
    chapters.isLoading ||
    attendance.isLoading;
  const error =
    classrooms.isError || courses.isError || chapters.isError || attendance.isError;

  const stats = useMemo(() => {
    const today = todayKey();
    const classList = classrooms.data ?? [];
    const studentTotal = classList.reduce(
      (sum, c) => sum + (c.student_count ?? c.students.length),
      0,
    );
    const chapterList = chapters.data ?? [];
    const publishedChapters = chapterList.filter(
      (c) => c.status === "UNLOCKED",
    ).length;
    const todayRecords = (attendance.data ?? []).filter(
      (a) => dayKey(a.date) === today,
    );
    const late = todayRecords.filter((a) => a.status === "LATE").length;
    const absent = todayRecords.filter((a) => a.status === "ABSENT").length;
    const present = Math.max(0, studentTotal - late - absent);
    const presenceRate = studentTotal > 0 ? (present / studentTotal) * 100 : 100;
    const publishRate =
      chapterList.length > 0
        ? (publishedChapters / chapterList.length) * 100
        : 0;

    return {
      classes: classList.length,
      students: studentTotal,
      courses: courses.data?.length ?? 0,
      publishedChapters,
      totalChapters: chapterList.length,
      present,
      late,
      absent,
      presenceRate,
      publishRate,
    };
  }, [classrooms.data, courses.data, chapters.data, attendance.data]);

  const name = user?.firstName || user?.email?.split("@")[0] || "Professeur";

  return (
    <>
      <PageHeader title="Tableau de bord" subtitle="Votre journée d'enseignement, en un coup d'œil." />

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState
          message="Impossible de charger vos données. Le backend est-il démarré ?"
          onRetry={() => {
            classrooms.refetch();
            courses.refetch();
            chapters.refetch();
            attendance.refetch();
          }}
        />
      ) : (
        <div className="space-y-5">
          {/* Rangée A : bienvenue + présences du jour */}
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <WelcomeBanner
                name={name}
                dateLabel={frenchDate()}
                subtitle="Faites l'appel, suivez vos classes et publiez vos cours à votre rythme."
                ringValue={stats.publishRate}
                ringLabel={`${stats.publishedChapters} chapitre(s) publié(s) sur ${stats.totalChapters}`}
                sticker="/stickers/teacher.png"
              />
            </div>
            <PresenceCard
              present={stats.present}
              late={stats.late}
              absent={stats.absent}
              total={stats.students}
            />
          </div>

          {/* Rangée B : statistiques */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StickerStat
              sticker="/stickers/classes.png"
              value={stats.classes}
              label="Mes classes"
              tone="emerald"
            />
            <StickerStat
              sticker="/stickers/students.png"
              value={stats.students}
              label="Élèves suivis"
              tone="sky"
            />
            <StickerStat
              sticker="/stickers/courses.png"
              value={stats.courses}
              label="Mes cours"
              tone="orange"
            />
            <StickerStat
              sticker="/stickers/chapters.png"
              value={`${stats.publishedChapters}/${stats.totalChapters}`}
              label="Chapitres publiés"
              tone="violet"
            />
          </div>

          {/* Rangée C : classes + raccourcis */}
          <div className="grid gap-5 lg:grid-cols-3">
            <MyClasses
              classes={(classrooms.data ?? []).map((c) => ({
                id: c.id,
                name: c.name,
                year: c.academic_year,
                count: c.student_count ?? c.students.length,
              }))}
            />
            <Shortcuts />
          </div>
        </div>
      )}
    </>
  );
}

function PresenceCard({
  present,
  late,
  absent,
  total,
}: {
  present: number;
  late: number;
  absent: number;
  total: number;
}) {
  const rows = [
    { label: "Présents", value: present, color: "bg-emerald", text: "text-emerald" },
    { label: "Retards", value: late, color: "bg-orange", text: "text-orange" },
    { label: "Absents", value: absent, color: "bg-rose-500", text: "text-rose-500" },
  ];
  const safeTotal = total || 1;

  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-base font-bold text-ink">
          Présences aujourd&apos;hui
        </h3>
        <Image src="/stickers/attendance.png" alt="" width={32} height={32} />
      </div>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink/60">{row.label}</span>
              <span className={`font-bold ${row.text}`}>{row.value}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-soft">
              <div
                className={`h-full rounded-full ${row.color}`}
                style={{ width: `${(row.value / safeTotal) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MyClasses({
  classes,
}: {
  classes: { id: string; name: string; year: string; count: number }[];
}) {
  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-sm lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-base font-bold text-ink">Mes classes</h3>
        <Link
          href="/dashboard/teacher/classes"
          className="text-sm font-semibold text-forest hover:underline"
        >
          Voir tout
        </Link>
      </div>

      {classes.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink/50">
          Aucune classe rattachée à votre école.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {classes.slice(0, 5).map((c) => (
            <li key={c.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint">
                  <Image src="/stickers/board.png" alt="" width={22} height={22} />
                </span>
                <div>
                  <p className="font-medium text-ink">{c.name}</p>
                  <p className="text-xs text-ink/50">{c.year}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-sm text-ink/60">
                  <Users className="h-4 w-4" /> {c.count}
                </span>
                <Link
                  href="/dashboard/teacher/classes"
                  className="flex items-center gap-1 rounded-lg bg-soft px-3 py-1.5 text-sm font-semibold text-forest hover:bg-mint"
                >
                  Appel <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Shortcuts() {
  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-heading text-base font-bold text-ink">Raccourcis</h3>
      <div className="space-y-3">
        <Link
          href="/dashboard/teacher/classes"
          className="flex items-center gap-3 rounded-lg bg-forest p-4 text-white transition-opacity hover:opacity-95"
        >
          <Users className="h-5 w-5" />
          <span className="text-sm font-semibold">Faire l&apos;appel</span>
          <ArrowRight className="ml-auto h-4 w-4" />
        </Link>
        <Link
          href="/dashboard/teacher/resources"
          className="flex items-center gap-3 rounded-lg bg-mint p-4 text-forest transition-colors hover:bg-emerald-soft"
        >
          <BookOpen className="h-5 w-5" />
          <span className="text-sm font-semibold">Gérer mes ressources</span>
          <ArrowRight className="ml-auto h-4 w-4" />
        </Link>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-lg bg-orange-soft p-4">
        <WifiOff className="mt-0.5 h-5 w-5 shrink-0 text-orange" />
        <p className="text-xs text-ink/70">
          L&apos;appel fonctionne aussi hors connexion sur l&apos;application
          mobile : vos saisies se synchronisent au retour du réseau.
        </p>
      </div>
    </div>
  );
}
