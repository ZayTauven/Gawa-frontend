export type AttendanceStatus = "ABSENT" | "LATE";
/** PRESENT n'est jamais persisté : c'est l'absence d'enregistrement (cf. backend). */
export type CallStatus = "PRESENT" | AttendanceStatus;

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

export interface AttendanceRecord {
  id: string;
  student: string;
  status: AttendanceStatus;
  date: string;
  is_synced: boolean;
}

export type ChapterStatus = "DRAFT" | "LOCKED" | "UNLOCKED";
export type ResourceStatus = "LOCKED" | "UNLOCKED";
export type ResourceType = "PDF" | "LINK" | "TEXT" | "IMAGE";
/** Taxonomie pédagogique (champ backend `category`). */
export type ResourceCategory =
  | "ANNALES"
  | "CORRECTION"
  | "NOTES"
  | "APPROFONDISSEMENT"
  | "OTHER";

export interface ResourceItem {
  id: string;
  chapter: string;
  chapter_title: string;
  title: string;
  type: ResourceType;
  category: ResourceCategory;
  url: string;
  status: ResourceStatus;
  /** Ressource certifiée (validée pour entraîner Prof Hibou). Champ backend `ai_eligible`. */
  ai_eligible: boolean;
  document_class: string;
  target_audiences: string[];
}

export interface Chapter {
  id: string;
  course: string;
  course_title: string;
  title: string;
  order: number;
  status: ChapterStatus;
  resources: ResourceItem[];
}

export interface Course {
  id: string;
  teacher: string;
  classroom: string | null;
  title: string;
  description: string;
  teacher_name: string;
  chapter_count: number;
}
