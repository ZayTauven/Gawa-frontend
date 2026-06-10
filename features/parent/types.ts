export interface Child {
  id: string;
  matricule: string;
  first_name: string;
  last_name: string;
  user: string;
  parent_user: string | null;
  school: string | null;
}

export interface Attendance {
  id: string;
  student: string;
  status: "ABSENT" | "LATE";
  date: string;
}

export interface Invoice {
  id: string;
  student: string;
  amount: string;
  due_date: string;
  status: "PAID" | "PARTIAL" | "OVERDUE" | "PENDING";
  invoice_period: string;
}

export interface LiaisonNote {
  id: string;
  student: string;
  teacher: string;
  teacher_name: string;
  content: string;
  parent_acknowledged: boolean;
  created_at: string;
}

export interface Broadcast {
  id: string;
  school: string | null;
  title: string;
  content: string;
  target_audience: string;
  created_at: string;
}
