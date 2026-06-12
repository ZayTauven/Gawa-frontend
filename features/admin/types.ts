export interface Student {
  id: string;
  matricule: string;
  first_name: string;
  last_name: string;
  user: string;
  parent_user: string | null;
  school: string | null;
}

export interface ClassroomStudent {
  id: string;
  matricule: string;
  first_name: string;
  last_name: string;
}

export interface Classroom {
  id: string;
  name: string;
  academic_year: string;
  student_count: number;
  students: ClassroomStudent[];
}

export type InvoiceStatus = "PAID" | "PARTIAL" | "OVERDUE" | "PENDING";

export interface Invoice {
  id: string;
  student: string;
  amount: string;
  due_date: string;
  status: InvoiceStatus;
  invoice_period: string;
}

export interface SchoolUser {
  id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
}

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

export interface AttendanceRecord {
  id: string;
  student: string;
  status: AttendanceStatus;
  date: string;
}

export interface Attempt {
  id: string;
  student: string;
  quiz: string;
  score: number;
  completed_at: string;
}
