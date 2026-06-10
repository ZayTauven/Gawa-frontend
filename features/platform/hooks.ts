import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSchool,
  createSchoolAdmin,
  deleteSchool,
  fetchAccessLogs,
  fetchInvoices,
  fetchPlatformStudentCount,
  fetchPlatformUsers,
  fetchSchools,
  resetSchoolAdminPassword,
  setUserActive,
  updateSchool,
} from "./api";

export const platformKeys = {
  schools: ["platform", "schools"] as const,
  users: ["platform", "users"] as const,
  students: ["platform", "students"] as const,
  invoices: ["platform", "invoices"] as const,
  accessLogs: ["platform", "access-logs"] as const,
};

export function useSchools() {
  return useQuery({ queryKey: platformKeys.schools, queryFn: fetchSchools });
}

export function usePlatformUsers() {
  return useQuery({ queryKey: platformKeys.users, queryFn: fetchPlatformUsers });
}

export function usePlatformStudentCount() {
  return useQuery({
    queryKey: platformKeys.students,
    queryFn: fetchPlatformStudentCount,
  });
}

export function useInvoices() {
  return useQuery({ queryKey: platformKeys.invoices, queryFn: fetchInvoices });
}

export function useAccessLogs() {
  return useQuery({ queryKey: platformKeys.accessLogs, queryFn: fetchAccessLogs });
}

// --- Mutations -------------------------------------------------------------
export function useCreateSchool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSchool,
    onSuccess: () => qc.invalidateQueries({ queryKey: platformKeys.schools }),
  });
}

export function useUpdateSchool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: { name?: string; is_active?: boolean; code?: string };
    }) => updateSchool(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: platformKeys.schools }),
  });
}

export function useDeleteSchool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSchool,
    onSuccess: () => qc.invalidateQueries({ queryKey: platformKeys.schools }),
  });
}

export function useCreateSchoolAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSchoolAdmin,
    onSuccess: () => qc.invalidateQueries({ queryKey: platformKeys.users }),
  });
}

export function useSetUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setUserActive(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: platformKeys.users }),
  });
}

export function useResetAdminPassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      resetSchoolAdminPassword(id, password),
  });
}
