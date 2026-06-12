import { api } from "@/lib/api/client";
import type { Attempt, Chapter, Course, Quiz, Resource, StudentProfile } from "./types";

function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "results" in data) {
    return (data as { results: T[] }).results;
  }
  return [];
}

export async function fetchMyProfile(): Promise<StudentProfile | null> {
  const { data } = await api.get("/sis/students/");
  return unwrapList<StudentProfile>(data)[0] ?? null;
}

export async function fetchCourses(): Promise<Course[]> {
  const { data } = await api.get("/pcs/courses/");
  return unwrapList<Course>(data);
}

export async function fetchChapters(): Promise<Chapter[]> {
  const { data } = await api.get("/pcs/chapters/");
  return unwrapList<Chapter>(data);
}

export async function fetchQuizzes(): Promise<Quiz[]> {
  const { data } = await api.get("/exam/quizzes/");
  return unwrapList<Quiz>(data);
}

export async function fetchAttempts(): Promise<Attempt[]> {
  const { data } = await api.get("/exam/attempts/");
  return unwrapList<Attempt>(data);
}

/**
 * Bibliothèque de ressources visibles par l'élève — déjà filtrée côté serveur
 * (classe de l'élève + publiées + audience STUDENT, ressources autonomes incluses).
 */
export async function fetchResources(): Promise<Resource[]> {
  const { data } = await api.get("/pcs/resources/");
  return unwrapList<Resource>(data);
}
