import { api } from "@/lib/api/client";
import type {
  AttendanceRecord,
  AttendanceStatus,
  Chapter,
  ChapterStatus,
  Course,
  Classroom,
  ResourceCategory,
  ResourceItem,
  ResourceStatus,
  ResourceType,
} from "./types";

/** DRF peut renvoyer une liste brute ou un objet paginé : on normalise. */
function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "results" in data) {
    return (data as { results: T[] }).results;
  }
  return [];
}

// --- SIS : classes & présences -------------------------------------------
export async function fetchClassrooms(): Promise<Classroom[]> {
  const { data } = await api.get("/sis/classrooms/");
  return unwrapList<Classroom>(data);
}

export async function fetchAttendance(): Promise<AttendanceRecord[]> {
  const { data } = await api.get("/sis/attendance-records/");
  return unwrapList<AttendanceRecord>(data);
}

export async function createAttendance(input: {
  student: string;
  status: AttendanceStatus;
  date: string;
}): Promise<AttendanceRecord> {
  const { data } = await api.post("/sis/attendance-records/", input);
  return data as AttendanceRecord;
}

export async function updateAttendance(
  id: string,
  status: AttendanceStatus,
): Promise<AttendanceRecord> {
  const { data } = await api.patch(`/sis/attendance-records/${id}/`, { status });
  return data as AttendanceRecord;
}

export async function deleteAttendance(id: string): Promise<void> {
  await api.delete(`/sis/attendance-records/${id}/`);
}

// --- PCS : cours, chapitres, ressources ----------------------------------
export async function fetchCourses(): Promise<Course[]> {
  const { data } = await api.get("/pcs/courses/");
  return unwrapList<Course>(data);
}

export async function fetchChapters(): Promise<Chapter[]> {
  const { data } = await api.get("/pcs/chapters/");
  return unwrapList<Chapter>(data);
}

export async function createCourse(input: {
  title: string;
  description?: string;
  classroom?: string | null;
}): Promise<Course> {
  const { data } = await api.post("/pcs/courses/", input);
  return data as Course;
}

export async function createChapter(input: {
  course: string;
  title: string;
  order: number;
}): Promise<Chapter> {
  const { data } = await api.post("/pcs/chapters/", {
    ...input,
    status: "LOCKED",
  });
  return data as Chapter;
}

export async function updateChapterStatus(
  id: string,
  status: ChapterStatus,
): Promise<Chapter> {
  const { data } = await api.patch(`/pcs/chapters/${id}/`, { status });
  return data as Chapter;
}

export async function createResource(input: {
  chapter: string;
  title: string;
  type: ResourceType;
  category: ResourceCategory;
  url: string;
}): Promise<ResourceItem> {
  const { data } = await api.post("/pcs/resources/", {
    ...input,
    status: "LOCKED",
  });
  return data as ResourceItem;
}

/** Toutes les ressources visibles par le prof (cours + ses ressources autonomes). */
export async function fetchResources(): Promise<ResourceItem[]> {
  const { data } = await api.get("/pcs/resources/");
  return unwrapList<ResourceItem>(data);
}

/** Partage une ressource AUTONOME (hors cours) ciblant une classe, publiée d'emblée. */
export async function createStandaloneResource(input: {
  classroom: string;
  title: string;
  type: ResourceType;
  category: ResourceCategory;
  url: string;
}): Promise<ResourceItem> {
  const { data } = await api.post("/pcs/resources/", {
    ...input,
    status: "UNLOCKED",
    target_audiences: ["STUDENT"],
  });
  return data as ResourceItem;
}

export async function updateResourceStatus(
  id: string,
  status: ResourceStatus,
): Promise<ResourceItem> {
  const { data } = await api.patch(`/pcs/resources/${id}/`, { status });
  return data as ResourceItem;
}

/** Certifie (ou retire la certification d') une ressource → champ backend `ai_eligible`. */
export async function updateResourceCertification(
  id: string,
  ai_eligible: boolean,
): Promise<ResourceItem> {
  const { data } = await api.patch(`/pcs/resources/${id}/`, { ai_eligible });
  return data as ResourceItem;
}
