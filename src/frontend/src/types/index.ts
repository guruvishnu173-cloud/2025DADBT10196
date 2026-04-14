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

export interface VisitStats {
  count: bigint;
}

export type AdminView = "papers" | "subjects" | "midtypes";
