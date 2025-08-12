export type NoteType = 
  | "general" 
  | "medication" 
  | "vitals" 
  | "behavior" 
  | "incident" 
  | "care_plan" 
  | "communication";

export type NotePriority = "low" | "medium" | "high" | "urgent";

export type NoteStatus = "draft" | "submitted" | "reviewed" | "archived";

export interface CareNote {
  id: string;
  patientId: string;
  authorId: string;
  authorName: string;
  authorRole: "caregiver" | "reviewer";
  noteType: NoteType;
  title: string;
  content: string;
  priority: NotePriority;
  status: NoteStatus;
  tags?: string[];
  isPrivate: boolean;
  followUpRequired: boolean;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCareNoteRequest {
  patientId: string;
  authorId: string;
  authorName: string;
  authorRole: "caregiver" | "reviewer";
  noteType?: NoteType;
  title: string;
  content: string;
  priority?: NotePriority;
  tags?: string[];
  isPrivate?: boolean;
  followUpRequired?: boolean;
  followUpDate?: string;
}

export interface UpdateCareNoteRequest {
  title?: string;
  content?: string;
  priority?: NotePriority;
  status?: NoteStatus;
  tags?: string[];
  isPrivate?: boolean;
  followUpRequired?: boolean;
  followUpDate?: string;
}
