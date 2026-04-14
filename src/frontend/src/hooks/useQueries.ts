import { ExternalBlob, createActor } from "@/backend";
import type { PaperFilter, QuestionPaper } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─── Backend interface (mirrors backend.d.ts) ─────────────────────────────────
interface BackendActor {
  listPapers(filter: PaperFilter): Promise<QuestionPaper[]>;
  getPaper(id: bigint): Promise<QuestionPaper | null>;
  listSubjects(): Promise<string[]>;
  listMidTypes(): Promise<string[]>;
  getVisitorCount(): Promise<bigint>;
  trackVisit(): Promise<bigint>;
  isCallerAdmin(): Promise<boolean>;
  uploadPaper(
    year: string,
    subject: string,
    midType: string,
    storageRef: ExternalBlob,
  ): Promise<bigint>;
  deletePaper(id: bigint): Promise<boolean>;
  addSubject(subject: string): Promise<void>;
  removeSubject(subject: string): Promise<void>;
  addMidType(midType: string): Promise<void>;
  removeMidType(midType: string): Promise<void>;
}

function useBackendActor() {
  const { actor, isFetching } = useActor(createActor);
  return { actor: actor as unknown as BackendActor | null, isFetching };
}

// ─── Papers ───────────────────────────────────────────────────────────────────

export function useListPapers(filter: PaperFilter | null) {
  const { actor, isFetching } = useBackendActor();
  const cleanFilter: PaperFilter = filter ?? {};
  return useQuery<QuestionPaper[]>({
    queryKey: ["papers", cleanFilter],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPapers(cleanFilter);
    },
    enabled: !!actor && !isFetching && filter !== null,
  });
}

export function useGetPaper(id: bigint | null) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<QuestionPaper | null>({
    queryKey: ["paper", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getPaper(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

// ─── Subjects & Mid Types ─────────────────────────────────────────────────────

export function useSubjects() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<string[]>({
    queryKey: ["subjects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSubjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMidTypes() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<string[]>({
    queryKey: ["midTypes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMidTypes();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Visitor Tracking ─────────────────────────────────────────────────────────

export function useVisitCount() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<bigint>({
    queryKey: ["visitCount"],
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.getVisitorCount();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useRecordVisit() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation<bigint, Error, void>({
    mutationFn: async () => {
      if (!actor) return 0n;
      return actor.trackVisit();
    },
    onSuccess: (count) => {
      qc.setQueryData(["visitCount"], count);
    },
  });
}

// ─── Admin Role ───────────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Admin Mutations ──────────────────────────────────────────────────────────

export function useUploadPaper() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation<
    bigint,
    Error,
    { year: string; subject: string; midType: string; file: File }
  >({
    mutationFn: async ({ year, subject, midType, file }) => {
      if (!actor) throw new Error("Actor not ready");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes);
      return actor.uploadPaper(year, subject, midType, blob);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["papers"] });
    },
  });
}

export function useDeletePaper() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation<boolean, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deletePaper(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["papers"] });
    },
  });
}

export function useAddSubject() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation<void, Error, string>({
    mutationFn: async (subject) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addSubject(subject);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useRemoveSubject() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation<void, Error, string>({
    mutationFn: async (subject) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.removeSubject(subject);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useAddMidType() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation<void, Error, string>({
    mutationFn: async (midType) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addMidType(midType);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["midTypes"] });
    },
  });
}

export function useRemoveMidType() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation<void, Error, string>({
    mutationFn: async (midType) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.removeMidType(midType);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["midTypes"] });
    },
  });
}
