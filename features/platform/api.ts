import { api } from "@/lib/api/client";
import type { AccessLog, Invoice, PlatformUser, School } from "./types";

function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "results" in data) {
    return (data as { results: T[] }).results;
  }
  return [];
}

export async function fetchSchools(): Promise<School[]> {
  const { data } = await api.get("/users/schools/");
  return unwrapList<School>(data);
}

export async function fetchPlatformUsers(): Promise<PlatformUser[]> {
  const { data } = await api.get("/users/users/");
  return unwrapList<PlatformUser>(data);
}

export async function fetchPlatformStudentCount(): Promise<number> {
  const { data } = await api.get("/sis/students/");
  return unwrapList<unknown>(data).length;
}

export async function fetchInvoices(): Promise<Invoice[]> {
  const { data } = await api.get("/finance/invoices/");
  return unwrapList<Invoice>(data);
}

export async function fetchAccessLogs(): Promise<AccessLog[]> {
  const { data } = await api.get("/vault/access-logs/");
  return unwrapList<AccessLog>(data);
}

// --- CRUD écoles -----------------------------------------------------------
export async function createSchool(input: {
  code: string;
  name: string;
}): Promise<School> {
  const { data } = await api.post("/users/schools/", { ...input, is_active: true });
  return data as School;
}

export async function updateSchool(
  id: string,
  patch: Partial<Pick<School, "name" | "is_active" | "code">>,
): Promise<School> {
  const { data } = await api.patch(`/users/schools/${id}/`, patch);
  return data as School;
}

export async function deleteSchool(id: string): Promise<void> {
  await api.delete(`/users/schools/${id}/`);
}

// --- Admins d'école --------------------------------------------------------
export async function createSchoolAdmin(input: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  default_school: string;
}): Promise<PlatformUser> {
  const { data } = await api.post("/users/users/", {
    ...input,
    username: input.email,
    role: "SCHOOL_ADMIN",
  });
  return data as PlatformUser;
}

export async function setUserActive(
  id: string,
  isActive: boolean,
): Promise<PlatformUser> {
  const { data } = await api.patch(`/users/users/${id}/`, { is_active: isActive });
  return data as PlatformUser;
}

export async function resetSchoolAdminPassword(
  id: string,
  newPassword: string,
): Promise<void> {
  await api.post(`/users/users/${id}/reset-password/`, { new_password: newPassword });
}
