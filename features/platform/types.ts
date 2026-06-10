export interface School {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export type PlatformRole =
  | "PLATFORM_SUPERADMIN"
  | "SCHOOL_ADMIN"
  | "ADMIN"
  | "TEACHER"
  | "STUDENT"
  | "PARENT";

export interface PlatformUser {
  id: string;
  email: string;
  role: PlatformRole;
  first_name: string;
  last_name: string;
  default_school_code: string | null;
  is_active: boolean;
}

export interface Invoice {
  id: string;
  student: string;
  amount: string;
  due_date: string;
  status: "PAID" | "PARTIAL" | "OVERDUE" | "PENDING";
  invoice_period: string;
}

export interface AccessLog {
  id: string;
  school_code: string | null;
  action_type: "SEAL" | "DECRYPT" | "PRINT" | "FAILED_ATTEMPT";
  admin_email: string;
  target_matricule: string;
  timestamp: string;
  ip_address: string;
}
