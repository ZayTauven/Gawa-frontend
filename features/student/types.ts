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

export interface Resource {
  id: string;
  chapter: string;
  title: string;
  type: "PDF" | "LINK" | "TEXT" | "IMAGE";
  url: string;
  status: ResourceStatus;
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
