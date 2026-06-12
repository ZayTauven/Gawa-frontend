export interface StudentProfile {
  id: string;
  matricule: string;
  first_name: string;
  last_name: string;
  user: string;
  school: string | null;
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

export interface Resource {
  id: string;
  chapter: string | null;
  chapter_title: string | null;
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
  resources: Resource[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  teacher_name: string;
  chapter_count: number;
  classroom: string | null;
}

export interface Quiz {
  id: string;
  chapter: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  questions: { id: string; text: string }[];
}

export interface Attempt {
  id: string;
  student: string;
  quiz: string;
  score: number;
  completed_at: string;
}
