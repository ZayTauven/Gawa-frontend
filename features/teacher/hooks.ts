import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { todayAttendanceIso } from "@/lib/utils/date";
import {
  createAttendance,
  createChapter,
  createCourse,
  createResource,
  createStandaloneResource,
  deleteAttendance,
  fetchAttendance,
  fetchChapters,
  fetchClassrooms,
  fetchCourses,
  fetchResources,
  updateAttendance,
  updateChapterStatus,
  updateResourceCertification,
  updateResourceStatus,
} from "./api";
import type {
  AttendanceRecord,
  CallStatus,
  ChapterStatus,
  ResourceStatus,
} from "./types";

export const teacherKeys = {
  classrooms: ["teacher", "classrooms"] as const,
  attendance: ["teacher", "attendance"] as const,
  courses: ["teacher", "courses"] as const,
  chapters: ["teacher", "chapters"] as const,
  resources: ["teacher", "resources"] as const,
};

export function useClassrooms() {
  return useQuery({ queryKey: teacherKeys.classrooms, queryFn: fetchClassrooms });
}

export function useAttendance() {
  return useQuery({ queryKey: teacherKeys.attendance, queryFn: fetchAttendance });
}

export function useCourses() {
  return useQuery({ queryKey: teacherKeys.courses, queryFn: fetchCourses });
}

export function useChapters() {
  return useQuery({ queryKey: teacherKeys.chapters, queryFn: fetchChapters });
}

/** Une décision d'appel pour un élève, avec son éventuel enregistrement existant du jour. */
export interface AttendanceChange {
  studentId: string;
  desired: CallStatus;
  existing?: AttendanceRecord;
}

/**
 * Persiste l'appel : crée/modifie un enregistrement pour ABSENT/LATE,
 * supprime celui qui repasse PRESENT. Aligné sur la sémantique backend.
 */
export function useSaveAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (changes: AttendanceChange[]) => {
      const date = todayAttendanceIso();
      for (const change of changes) {
        const { desired, existing, studentId } = change;
        if (desired === "PRESENT") {
          if (existing) await deleteAttendance(existing.id);
          continue;
        }
        if (existing) {
          if (existing.status !== desired) await updateAttendance(existing.id, desired);
        } else {
          await createAttendance({ student: studentId, status: desired, date });
        }
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.attendance }),
  });
}

export function useToggleChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ChapterStatus }) =>
      updateChapterStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.chapters }),
  });
}

export function useToggleResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ResourceStatus }) =>
      updateResourceStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherKeys.chapters });
      qc.invalidateQueries({ queryKey: teacherKeys.resources });
    },
  });
}

export function useCertifyResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, aiEligible }: { id: string; aiEligible: boolean }) =>
      updateResourceCertification(id, aiEligible),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherKeys.chapters });
      qc.invalidateQueries({ queryKey: teacherKeys.resources });
    },
  });
}

/** Ressources autonomes (hors cours) que le prof a partagées. */
export function useResources() {
  return useQuery({ queryKey: teacherKeys.resources, queryFn: fetchResources });
}

export function useCreateStandaloneResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createStandaloneResource,
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.resources }),
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.courses }),
  });
}

export function useCreateChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createChapter,
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.chapters }),
  });
}

export function useCreateResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createResource,
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.chapters }),
  });
}
