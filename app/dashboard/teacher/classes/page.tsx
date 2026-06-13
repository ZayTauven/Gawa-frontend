"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { FilterPill } from "@/components/ui/FilterPill";
import { Spinner, ErrorState, EmptyState } from "@/components/ui/States";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { dayKey, todayKey } from "@/lib/utils/date";
import {
  useAttendance,
  useClassrooms,
  useSaveAttendance,
  type AttendanceChange,
} from "@/features/teacher/hooks";
import type { AttendanceRecord, CallStatus } from "@/features/teacher/types";

const OPTIONS: { value: CallStatus; label: string; active: string }[] = [
  { value: "PRESENT", label: "Présent", active: "bg-emerald text-white" },
  { value: "LATE", label: "Retard", active: "bg-orange text-white" },
  { value: "ABSENT", label: "Absent", active: "bg-rose text-white" },
];

export default function TeacherClassesPage() {
  const classrooms = useClassrooms();
  const attendance = useAttendance();
  const save = useSaveAttendance();

  // `selectedId` peut rester null : la classe active est alors la première.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Modifications explicites de l'enseignant pour la classe active.
  const [overrides, setOverrides] = useState<Record<string, CallStatus>>({});

  const classes = classrooms.data ?? [];
  const activeId = selectedId ?? classes[0]?.id ?? null;
  const selectedClass = classes.find((c) => c.id === activeId) ?? null;

  // Enregistrements d'aujourd'hui, indexés par élève.
  const todayRecords = useMemo(() => {
    const today = todayKey();
    const map = new Map<string, AttendanceRecord>();
    for (const rec of attendance.data ?? []) {
      if (dayKey(rec.date) === today) map.set(rec.student, rec);
    }
    return map;
  }, [attendance.data]);

  function statusFor(studentId: string): CallStatus {
    return overrides[studentId] ?? todayRecords.get(studentId)?.status ?? "PRESENT";
  }

  function selectClass(id: string) {
    setSelectedId(id);
    setOverrides({});
  }

  function setStatus(studentId: string, value: CallStatus) {
    setOverrides((prev) => ({ ...prev, [studentId]: value }));
  }

  function handleSave() {
    if (!selectedClass) return;
    const changes: AttendanceChange[] = [];
    for (const student of selectedClass.students) {
      const desired = statusFor(student.id);
      const existing = todayRecords.get(student.id);
      const currentStatus: CallStatus = existing?.status ?? "PRESENT";
      if (desired === currentStatus) continue; // rien à faire
      changes.push({ studentId: student.id, desired, existing });
    }

    if (changes.length === 0) {
      toast.info("Aucune modification à enregistrer.");
      return;
    }
    save.mutate(changes, {
      onSuccess: () => {
        setOverrides({});
        toast.success("Appel enregistré", {
          description: `${changes.length} changement(s) synchronisé(s).`,
        });
      },
      onError: () =>
        toast.error("Échec de l'enregistrement", {
          description: "Vérifiez votre connexion et réessayez.",
        }),
    });
  }

  if (classrooms.isLoading) return <Spinner label="Chargement des classes…" />;
  if (classrooms.isError)
    return (
      <ErrorState
        message="Impossible de charger les classes."
        onRetry={() => classrooms.refetch()}
      />
    );

  return (
    <>
      <PageHeader
        title="Mes classes"
        subtitle="Sélectionnez une classe et faites l'appel du jour."
      />

      {classes.length === 0 ? (
        <EmptyState message="Aucune classe rattachée à votre école pour le moment." />
      ) : (
        <div className="rise-stagger space-y-5">
          {/* Sélecteur de classe */}
          <div className="flex flex-wrap gap-2">
            {classes.map((c) => (
              <FilterPill
                key={c.id}
                active={c.id === activeId}
                onClick={() => selectClass(c.id)}
                className="px-4 py-2 text-sm"
              >
                {c.name}
                <span className="ml-2 opacity-60">{c.student_count}</span>
              </FilterPill>
            ))}
          </div>

          {/* Effectif + appel */}
          {selectedClass && (
            <Card className="p-0">
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <div>
                  <h2 className="font-heading text-lg font-bold text-ink">
                    {selectedClass.name}
                  </h2>
                  <p className="text-xs text-ink/50">
                    {selectedClass.academic_year} · {selectedClass.student_count}{" "}
                    élèves
                  </p>
                </div>
                <Button onClick={handleSave} disabled={save.isPending}>
                  {save.isPending ? "Enregistrement…" : "Enregistrer l'appel"}
                </Button>
              </div>

              {selectedClass.students.length === 0 ? (
                <div className="px-5 py-8">
                  <EmptyState message="Aucun élève inscrit dans cette classe." />
                </div>
              ) : (
                <ul className="divide-y divide-line">
                  {selectedClass.students.map((student) => {
                    const value = statusFor(student.id);
                    return (
                      <li
                        key={student.id}
                        className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-medium text-ink">
                            {student.last_name} {student.first_name}
                          </p>
                          <p className="text-xs text-ink/50">{student.matricule}</p>
                        </div>
                        <div className="flex gap-2">
                          {OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => setStatus(student.id, opt.value)}
                              className={cn(
                                "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                                value === opt.value
                                  ? opt.active
                                  : "bg-soft text-ink/60 hover:bg-line",
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          )}
        </div>
      )}
    </>
  );
}
