import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Timestamp = bigint;
export type PaperId = bigint;
export interface SiteNote {
    content: string;
    updatedAt: Timestamp;
}
export interface PaperFilter {
    subject?: string;
    year?: string;
    midType?: string;
}
export interface QuestionPaper {
    id: PaperId;
    subject: string;
    year: string;
    uploadTimestamp: Timestamp;
    midType: string;
    storageRef: ExternalBlob;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMidType(midType: string): Promise<void>;
    addSubject(subject: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearNote(): Promise<void>;
    deletePaper(id: PaperId): Promise<boolean>;
    getCallerUserRole(): Promise<UserRole>;
    getNote(): Promise<SiteNote | null>;
    getPaper(id: PaperId): Promise<QuestionPaper | null>;
    getVisitorCount(): Promise<bigint>;
    isCallerAdmin(): Promise<boolean>;
    listMidTypes(): Promise<Array<string>>;
    listPapers(filter: PaperFilter): Promise<Array<QuestionPaper>>;
    listSubjects(): Promise<Array<string>>;
    removeMidType(midType: string): Promise<void>;
    removeSubject(subject: string): Promise<void>;
    setNote(content: string): Promise<void>;
    trackVisit(): Promise<bigint>;
    uploadPaper(year: string, subject: string, midType: string, storageRef: ExternalBlob): Promise<PaperId>;
}
