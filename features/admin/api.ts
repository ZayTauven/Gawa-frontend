import { api } from "@/lib/api/client";
import type {
  AttendanceRecord,
  Attempt,
  Classroom,
  Invoice,
  SchoolUser,
  Student,
} from "./types";

function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "results" in data) {
    return (data as { results: T[] }).results;
  }
  return [];
}

export async function fetchStudents(): Promise<Student[]> {
  const { data } = await api.get("/sis/students/");
  return unwrapList<Student>(data);
}

export async function fetchClassrooms(): Promise<Classroom[]> {
  const { data } = await api.get("/sis/classrooms/");
  return unwrapList<Classroom>(data);
}

export async function fetchInvoices(): Promise<Invoice[]> {
  const { data } = await api.get("/finance/invoices/");
  return unwrapList<Invoice>(data);
}

export async function fetchSchoolUsers(): Promise<SchoolUser[]> {
  const { data } = await api.get("/users/users/");
  return unwrapList<SchoolUser>(data);
}

// Présence (école entière, scopée par X-School-ID) → taux de présence par classe.
export async function fetchAttendance(): Promise<AttendanceRecord[]> {
  const { data } = await api.get("/sis/attendance-records/");
  return unwrapList<AttendanceRecord>(data);
}

// Tentatives de quiz (école entière) → évolution des progrès (score moyen/mois).
export async function fetchAttempts(): Promise<Attempt[]> {
  const { data } = await api.get("/exam/attempts/");
  return unwrapList<Attempt>(data);
}
