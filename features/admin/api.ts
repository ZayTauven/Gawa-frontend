import { api } from "@/lib/api/client";
import type { Classroom, Invoice, SchoolUser, Student } from "./types";

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
