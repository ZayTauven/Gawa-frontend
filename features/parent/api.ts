import { api } from "@/lib/api/client";
import type { Attendance, Broadcast, Child, Invoice, LiaisonNote } from "./types";

function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "results" in data) {
    return (data as { results: T[] }).results;
  }
  return [];
}

export async function fetchChildren(): Promise<Child[]> {
  const { data } = await api.get("/sis/students/");
  return unwrapList<Child>(data);
}

export async function fetchAttendance(): Promise<Attendance[]> {
  const { data } = await api.get("/sis/attendance-records/");
  return unwrapList<Attendance>(data);
}

export async function fetchInvoices(): Promise<Invoice[]> {
  const { data } = await api.get("/finance/invoices/");
  return unwrapList<Invoice>(data);
}

export async function fetchBroadcasts(): Promise<Broadcast[]> {
  const { data } = await api.get("/finance/broadcast-messages/");
  return unwrapList<Broadcast>(data);
}

export async function fetchCarnet(studentId: string): Promise<LiaisonNote[]> {
  const { data } = await api.get(`/sis/students/${studentId}/carnet/`);
  return unwrapList<LiaisonNote>(data);
}
