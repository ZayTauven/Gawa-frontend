import { useQuery } from "@tanstack/react-query";
import {
  fetchAttendance,
  fetchAttempts,
  fetchClassrooms,
  fetchInvoices,
  fetchSchoolUsers,
  fetchStudents,
} from "./api";

export const adminKeys = {
  students: ["admin", "students"] as const,
  classrooms: ["admin", "classrooms"] as const,
  invoices: ["admin", "invoices"] as const,
  users: ["admin", "users"] as const,
  attendance: ["admin", "attendance"] as const,
  attempts: ["admin", "attempts"] as const,
};

export function useStudents() {
  return useQuery({ queryKey: adminKeys.students, queryFn: fetchStudents });
}

export function useClassrooms() {
  return useQuery({ queryKey: adminKeys.classrooms, queryFn: fetchClassrooms });
}

export function useInvoices() {
  return useQuery({ queryKey: adminKeys.invoices, queryFn: fetchInvoices });
}

export function useSchoolUsers() {
  return useQuery({ queryKey: adminKeys.users, queryFn: fetchSchoolUsers });
}

export function useAttendance() {
  return useQuery({ queryKey: adminKeys.attendance, queryFn: fetchAttendance });
}

export function useAttempts() {
  return useQuery({ queryKey: adminKeys.attempts, queryFn: fetchAttempts });
}
