import { ExternalBlob, createActor } from "@/backend";
import type {
  AdminMessage,
  PaperFilter,
  PublicMessage,
  QuestionPaper,
  SiteNote,
} from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─── Backend interface (mirrors backend.d.ts) ─────────────────────────────────
interface BackendActor {
  listPapers(filter: PaperFilter): Promise<QuestionPaper[]>;
  getPaper(id: bigint): Promise<QuestionPaper | null>;
  listSubjects(): Promise<string[]>;
  listMidTypes(): Promise<string[]>;
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
  getNote(): Promise<SiteNote | null>;
  setNote(content: string): Promise<void>;
  clearNote(): Promise<void>;
  // Likes
  getLikeCount(): Promise<bigint>;
  addLike(): Promise<bigint>;
  // Admin messages
  listAdminMessages(): Promise<AdminMessage[]>;
  addAdminMessage(
    content: string,
    imageRef: string | null,
  ): Promise<AdminMessage>;
  updateAdminMessage(
    id: bigint,
    content: string,
    imageRef: string | null,
  ): Promise<void>;
  deleteAdminMessage(id: bigint): Promise<void>;
  // Public messages
  listPublicMessages(): Promise<PublicMessage[]>;
  addPublicMessage(content: string, authorName: string): Promise<PublicMessage>;
  deletePublicMessage(id: bigint): Promise<void>;
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

// ─── Likes ────────────────────────────────────────────────────────────────────

export function useLikeCount() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<bigint>({
    queryKey: ["likeCount"],
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.getLikeCount();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddLike() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation<bigint, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addLike();
    },
    onSuccess: (count) => {
      qc.setQueryData(["likeCount"], count);
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

// ─── Site Note ────────────────────────────────────────────────────────────────

export function useNote() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<SiteNote | null>({
    queryKey: ["siteNote"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getNote();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMutateNote() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();

  const setNote = useMutation<void, Error, string>({
    mutationFn: async (content) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.setNote(content);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["siteNote"] });
    },
  });

  const clearNote = useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.clearNote();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["siteNote"] });
    },
  });

  return { setNote, clearNote };
}

// ─── Admin Messages ───────────────────────────────────────────────────────────

export function useAdminMessages() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<AdminMessage[]>({
    queryKey: ["adminMessages"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAdminMessages();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddAdminMessage() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation<
    AdminMessage,
    Error,
    { content: string; imageRef: string | null }
  >({
    mutationFn: async ({ content, imageRef }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addAdminMessage(content, imageRef);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminMessages"] });
    },
  });
}

export function useUpdateAdminMessage() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation<
    void,
    Error,
    { id: bigint; content: string; imageRef: string | null }
  >({
    mutationFn: async ({ id, content, imageRef }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateAdminMessage(id, content, imageRef);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminMessages"] });
    },
  });
}

export function useDeleteAdminMessage() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation<void, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteAdminMessage(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminMessages"] });
    },
  });
}

// ─── Public Messages ──────────────────────────────────────────────────────────

export function usePublicMessages() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<PublicMessage[]>({
    queryKey: ["publicMessages"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPublicMessages();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddPublicMessage() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation<
    PublicMessage,
    Error,
    { content: string; authorName: string }
  >({
    mutationFn: async ({ content, authorName }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addPublicMessage(content, authorName);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["publicMessages"] });
    },
  });
}

export function useDeletePublicMessage() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation<void, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deletePublicMessage(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["publicMessages"] });
    },
  });
}
