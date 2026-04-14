import type { backendInterface, _ImmutableObjectStorageCreateCertificateResult, _ImmutableObjectStorageRefillResult } from "../backend";
import { ExternalBlob } from "../backend";

const mockBlob = ExternalBlob.fromURL("https://example.com/sample.pdf");

export const mockBackend: backendInterface = {
  _immutableObjectStorageBlobsAreLive: async (_hashes: Array<Uint8Array>) => [],
  _immutableObjectStorageBlobsToDelete: async () => [],
  _immutableObjectStorageConfirmBlobDeletion: async (_blobs: Array<Uint8Array>) => undefined,
  _immutableObjectStorageCreateCertificate: async (_blobHash: string): Promise<_ImmutableObjectStorageCreateCertificateResult> => ({ method: "", blob_hash: "" }),
  _immutableObjectStorageRefillCashier: async (_refillInformation: { proposed_top_up_amount?: bigint } | null): Promise<_ImmutableObjectStorageRefillResult> => ({}),
  _immutableObjectStorageUpdateGatewayPrincipals: async () => undefined,
  _initializeAccessControl: async () => undefined,
  addMidType: async () => undefined,
  addSubject: async () => undefined,
  assignCallerUserRole: async () => undefined,
  deletePaper: async () => true,
  getCallerUserRole: async () => { return "admin" as any; },
  getPaper: async () => ({
    id: BigInt(1),
    subject: "CSE",
    year: "2023",
    uploadTimestamp: BigInt(Date.now()),
    midType: "MID-1",
    storageRef: mockBlob,
  }),
  getVisitorCount: async () => BigInt(142),
  isCallerAdmin: async () => true,
  listMidTypes: async () => ["MID-1", "MID-2", "SUPPLE"],
  listPapers: async () => [
    {
      id: BigInt(1),
      subject: "CSE",
      year: "2023",
      uploadTimestamp: BigInt(Date.now()),
      midType: "MID-1",
      storageRef: mockBlob,
    },
    {
      id: BigInt(2),
      subject: "ECE",
      year: "2022",
      uploadTimestamp: BigInt(Date.now()),
      midType: "MID-2",
      storageRef: mockBlob,
    },
    {
      id: BigInt(3),
      subject: "MECH",
      year: "2023",
      uploadTimestamp: BigInt(Date.now()),
      midType: "SUPPLE",
      storageRef: mockBlob,
    },
  ],
  listSubjects: async () => ["CSE", "ECE", "MECH", "CIVIL", "IT"],
  removeMidType: async () => undefined,
  removeSubject: async () => undefined,
  trackVisit: async () => BigInt(143),
  uploadPaper: async () => BigInt(4),
  getNote: async () => null,
  setNote: async () => undefined,
  clearNote: async () => undefined,
};
