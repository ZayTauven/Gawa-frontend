import { useQuery } from "@tanstack/react-query";
import {
  fetchAttendance,
  fetchBroadcasts,
  fetchCarnet,
  fetchChildren,
  fetchInvoices,
} from "./api";

export const parentKeys = {
  children: ["parent", "children"] as const,
  attendance: ["parent", "attendance"] as const,
  invoices: ["parent", "invoices"] as const,
  broadcasts: ["parent", "broadcasts"] as const,
  carnet: (id: string) => ["parent", "carnet", id] as const,
};

export function useChildren() {
  return useQuery({ queryKey: parentKeys.children, queryFn: fetchChildren });
}

export function useAttendance() {
  return useQuery({ queryKey: parentKeys.attendance, queryFn: fetchAttendance });
}

export function useInvoices() {
  return useQuery({ queryKey: parentKeys.invoices, queryFn: fetchInvoices });
}

export function useBroadcasts() {
  return useQuery({ queryKey: parentKeys.broadcasts, queryFn: fetchBroadcasts });
}

export function useCarnet(studentId: string | null) {
  return useQuery({
    queryKey: parentKeys.carnet(studentId ?? "none"),
    queryFn: () => fetchCarnet(studentId as string),
    enabled: !!studentId,
  });
}
