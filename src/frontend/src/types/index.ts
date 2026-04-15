import type { ExternalBlob } from "@/backend";

export interface QuestionPaper {
  id: bigint;
  year: string;
  subject: string;
  midType: string;
  storageRef: ExternalBlob;
  uploadTimestamp: bigint;
}

export interface PaperFilter {
  year?: string;
  subject?: string;
  midType?: string;
}

export type AdminView = "papers" | "subjects" | "midtypes";

export interface SiteNote {
  content: string;
  updatedAt: bigint;
}

export interface AdminMessage {
  id: bigint;
  content: string;
  imageRef: string | null;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface PublicMessage {
  id: bigint;
  content: string;
  authorName: string;
  createdAt: bigint;
}
