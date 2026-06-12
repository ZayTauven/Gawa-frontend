import { useQuery } from "@tanstack/react-query";
import {
  fetchAttempts,
  fetchChapters,
  fetchCourses,
  fetchMyProfile,
  fetchQuizzes,
  fetchResources,
} from "./api";

export const studentKeys = {
  profile: ["student", "profile"] as const,
  courses: ["student", "courses"] as const,
  chapters: ["student", "chapters"] as const,
  quizzes: ["student", "quizzes"] as const,
  attempts: ["student", "attempts"] as const,
  resources: ["student", "resources"] as const,
};

export function useMyProfile() {
  return useQuery({ queryKey: studentKeys.profile, queryFn: fetchMyProfile });
}

export function useCourses() {
  return useQuery({ queryKey: studentKeys.courses, queryFn: fetchCourses });
}

export function useChapters() {
  return useQuery({ queryKey: studentKeys.chapters, queryFn: fetchChapters });
}

export function useQuizzes() {
  return useQuery({ queryKey: studentKeys.quizzes, queryFn: fetchQuizzes });
}

export function useAttempts() {
  return useQuery({ queryKey: studentKeys.attempts, queryFn: fetchAttempts });
}

export function useResources() {
  return useQuery({ queryKey: studentKeys.resources, queryFn: fetchResources });
}
