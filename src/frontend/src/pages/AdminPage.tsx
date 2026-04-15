import ErrorBoundary from "@/components/ErrorBoundary";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddAdminMessage,
  useAddMidType,
  useAddSubject,
  useAdminMessages,
  useDeleteAdminMessage,
  useDeletePaper,
  useDeletePublicMessage,
  useIsAdmin,
  useListPapers,
  useMidTypes,
  useMutateNote,
  useNote,
  usePublicMessages,
  useRemoveMidType,
  useRemoveSubject,
  useSubjects,
  useUpdateAdminMessage,
  useUploadPaper,
} from "@/hooks/useQueries";
import type { AdminMessage, PublicMessage, QuestionPaper } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  BookOpen,
  FileText,
  Image,
  LogIn,
  MessageCircle,
  MessageSquare,
  Pencil,
  Plus,
  Send,
  ShieldCheck,
  ShieldX,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Tag Manager ─────────────────────────────────────────────────────────────

function TagManager({
  title,
  icon: Icon,
  items,
  onAdd,
  onRemove,
  ocidPrefix,
}: {
  title: string;
  icon: React.ElementType;
  items: string[];
  onAdd: (val: string) => Promise<void>;
  onRemove: (val: string) => Promise<void>;
  ocidPrefix: string;
}) {
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    const v = inputVal.trim();
    if (!v) return;
    setLoading(true);
    try {
      await onAdd(v);
      setInputVal("");
      toast.success(`Added "${v}"`);
    } catch {
      toast.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="font-display font-semibold text-foreground text-sm">
          {title}
        </h3>
      </div>
      <div className="flex gap-2">
        <Input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={`Add new ${title.toLowerCase()}…`}
          className="h-9 text-sm"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          data-ocid={`${ocidPrefix}.input`}
        />
        <Button
          size="sm"
          className="h-9 gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground"
          onClick={handleAdd}
          disabled={loading || !inputVal.trim()}
          data-ocid={`${ocidPrefix}.add_button`}
        >
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2" data-ocid={`${ocidPrefix}.list`}>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No items yet</p>
        ) : (
          items.map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="gap-1.5 pr-1 py-1"
              data-ocid={`${ocidPrefix}.item`}
            >
              {item}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    className="w-4 h-4 rounded-sm hover:bg-destructive/20 hover:text-destructive flex items-center justify-center transition-colors"
                    aria-label={`Remove ${item}`}
                    data-ocid={`${ocidPrefix}.delete_button`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent data-ocid={`${ocidPrefix}.dialog`}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Remove &ldquo;{item}&rdquo;?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove the item from the list. Existing papers
                      using this value will not be affected.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      data-ocid={`${ocidPrefix}.cancel_button`}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={async () => {
                        try {
                          await onRemove(item);
                          toast.success(`Removed "${item}"`);
                        } catch {
                          toast.error("Failed to remove item");
                        }
                      }}
                      data-ocid={`${ocidPrefix}.confirm_button`}
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Upload Form ──────────────────────────────────────────────────────────────

function UploadForm({
  subjects,
  midTypes,
}: { subjects: string[]; midTypes: string[] }) {
  const [form, setForm] = useState({ year: "", subject: "", midType: "" });
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: uploadPaper, isPending } = useUploadPaper();

  const isValid = form.year && form.subject && form.midType && file;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    if (picked.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      e.target.value = "";
      return;
    }
    setFile(picked);
  };

  const resetForm = () => {
    setForm({ year: "", subject: "", midType: "" });
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !file) return;
    try {
      await uploadPaper({ ...form, file });
      resetForm();
      toast.success("Paper uploaded successfully");
    } catch {
      toast.error("Failed to upload paper");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-ocid="upload.form">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="year" className="text-sm">
            Academic Year
          </Label>
          <Input
            id="year"
            placeholder="e.g. 2023-24"
            value={form.year}
            onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
            required
            data-ocid="upload.year_input"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="subject" className="text-sm">
            Subject
          </Label>
          <Input
            id="subject"
            placeholder="Select or type subject"
            list="subjects-list"
            value={form.subject}
            onChange={(e) =>
              setForm((f) => ({ ...f, subject: e.target.value }))
            }
            required
            data-ocid="upload.subject_input"
          />
          <datalist id="subjects-list">
            {subjects.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="midType" className="text-sm">
            Exam Type
          </Label>
          <Input
            id="midType"
            placeholder="e.g. Mid-1, End Sem"
            list="midtypes-list"
            value={form.midType}
            onChange={(e) =>
              setForm((f) => ({ ...f, midType: e.target.value }))
            }
            required
            data-ocid="upload.midtype_input"
          />
          <datalist id="midtypes-list">
            {midTypes.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pdfFile" className="text-sm">
            PDF File
          </Label>
          <div className="relative">
            <input
              id="pdfFile"
              ref={fileRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              required
              className="sr-only"
              data-ocid="upload.file_input"
            />
            <label
              htmlFor="pdfFile"
              className="flex items-center gap-2.5 w-full h-10 px-3 rounded-md border border-input bg-background text-sm cursor-pointer hover:bg-muted/40 transition-colors"
            >
              <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
              <span
                className={
                  file ? "text-foreground truncate" : "text-muted-foreground"
                }
              >
                {file ? file.name : "Choose PDF file…"}
              </span>
            </label>
          </div>
          {file && (
            <p className="text-xs text-muted-foreground font-body">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={!isValid || isPending}
          className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
          data-ocid="upload.submit_button"
        >
          <Upload className="w-4 h-4" />
          {isPending ? "Uploading…" : "Upload Paper"}
        </Button>
        {(form.year || form.subject || form.midType || file) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetForm}
            className="text-muted-foreground h-9"
            data-ocid="upload.reset_button"
          >
            Clear
          </Button>
        )}
      </div>
    </form>
  );
}

// ─── Paper Row ────────────────────────────────────────────────────────────────

function PaperRow({ paper, index }: { paper: QuestionPaper; index: number }) {
  const { mutateAsync: deletePaper, isPending } = useDeletePaper();

  const uploadDate = paper.uploadTimestamp
    ? new Date(Number(paper.uploadTimestamp) / 1_000_000).toLocaleDateString(
        "en-IN",
        { day: "2-digit", month: "short", year: "numeric" },
      )
    : "—";

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
      data-ocid={`papers.item.${index + 1}`}
    >
      <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
        <span className="font-medium text-foreground truncate">
          {paper.subject}
        </span>
        <span className="text-muted-foreground">{paper.year}</span>
        <Badge
          variant="outline"
          className="w-fit text-xs border-accent/40 text-accent-foreground"
        >
          {paper.midType}
        </Badge>
        <span className="text-xs text-muted-foreground font-body">
          {uploadDate}
        </span>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            aria-label="Delete paper"
            data-ocid={`papers.delete_button.${index + 1}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent data-ocid="papers.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this paper?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{paper.subject}</strong> — {paper.year} / {paper.midType}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="papers.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending}
              onClick={async () => {
                try {
                  await deletePaper(paper.id);
                  toast.success("Paper deleted");
                } catch {
                  toast.error("Failed to delete paper");
                }
              }}
              data-ocid="papers.delete.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Site Note Manager ────────────────────────────────────────────────────────

function SiteNoteManager() {
  const { data: siteNote, isLoading } = useNote();
  const { setNote, clearNote } = useMutateNote();
  const [draft, setDraft] = useState("");
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (!synced && siteNote !== undefined) {
      setDraft(siteNote?.content ?? "");
      setSynced(true);
    }
  }, [siteNote, synced]);

  const handleSave = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    try {
      await setNote.mutateAsync(trimmed);
      toast.success("Site note saved");
    } catch {
      toast.error("Failed to save note");
    }
  };

  const handleClear = async () => {
    try {
      await clearNote.mutateAsync();
      setDraft("");
      setSynced(false);
      toast.success("Site note cleared");
    } catch {
      toast.error("Failed to clear note");
    }
  };

  return (
    <div
      className="bg-card border border-border rounded-xl p-6 space-y-5"
      data-ocid="sitenote.panel"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <MessageSquare className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-foreground">
            Site-wide Note
          </h2>
          <p className="text-sm text-muted-foreground font-body mt-0.5">
            This message is shown to all students just above the question paper
            archive. Leave it blank or clear it to hide the banner.
          </p>
        </div>
      </div>

      {isLoading ? (
        <Skeleton
          className="h-20 w-full rounded-lg"
          data-ocid="sitenote.loading_state"
        />
      ) : siteNote ? (
        <div
          className="rounded-lg border border-primary/20 bg-primary/6 px-4 py-3"
          data-ocid="sitenote.preview"
        >
          <p className="text-xs font-medium text-primary mb-1 uppercase tracking-wide">
            Currently visible to students
          </p>
          <p className="text-sm font-body text-foreground whitespace-pre-wrap leading-relaxed">
            {siteNote.content}
          </p>
        </div>
      ) : (
        <div
          className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3"
          data-ocid="sitenote.empty_state"
        >
          <p className="text-sm text-muted-foreground font-body italic">
            No note is currently displayed. Write one below to publish it.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label
          htmlFor="sitenote-textarea"
          className="text-sm font-medium text-foreground"
        >
          Note Content
        </Label>
        <Textarea
          id="sitenote-textarea"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type your message for students here…"
          rows={4}
          className="resize-y text-sm font-body"
          data-ocid="sitenote.textarea"
        />
        <p className="text-xs text-muted-foreground font-body">
          {draft.trim().length} characters
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Button
          onClick={handleSave}
          disabled={setNote.isPending || !draft.trim()}
          className="gap-2"
          data-ocid="sitenote.save_button"
        >
          {setNote.isPending ? "Saving…" : "Save Note"}
        </Button>

        {siteNote && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/8 hover:text-destructive"
                disabled={clearNote.isPending}
                data-ocid="sitenote.clear_button"
              >
                <Trash2 className="w-4 h-4" />
                {clearNote.isPending ? "Clearing…" : "Clear Note"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent data-ocid="sitenote.dialog">
              <AlertDialogHeader>
                <AlertDialogTitle>Clear site note?</AlertDialogTitle>
                <AlertDialogDescription>
                  The note will be removed and no longer shown to students.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-ocid="sitenote.cancel_button">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleClear}
                  data-ocid="sitenote.confirm_button"
                >
                  Clear note
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}

// ─── Admin Message Manager ────────────────────────────────────────────────────

function AdminMessageRow({ msg, index }: { msg: AdminMessage; index: number }) {
  const { mutate: deleteMsg, isPending: deleting } = useDeleteAdminMessage();
  const { mutate: updateMsg, isPending: updating } = useUpdateAdminMessage();
  const [editing, setEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(msg.content);
  const [draftImageRef, setDraftImageRef] = useState(msg.imageRef ?? "");

  const handleSave = () => {
    updateMsg(
      {
        id: msg.id,
        content: draftContent.trim(),
        imageRef: draftImageRef.trim() || null,
      },
      {
        onSuccess: () => {
          setEditing(false);
          toast.success("Message updated");
        },
      },
    );
  };

  return (
    <div
      className="border border-border rounded-xl overflow-hidden bg-card"
      data-ocid={`admin-msg.item.${index + 1}`}
    >
      {msg.imageRef && !editing && (
        <img
          src={msg.imageRef}
          alt="Attachment"
          className="w-full max-h-48 object-cover border-b border-border"
        />
      )}
      <div className="p-4 space-y-2">
        {editing ? (
          <div className="space-y-3">
            <Textarea
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              className="text-sm resize-none min-h-[80px]"
              autoFocus
              data-ocid={`admin-msg.edit_textarea.${index + 1}`}
            />
            <div className="flex items-center gap-2">
              <Image className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <Input
                value={draftImageRef}
                onChange={(e) => setDraftImageRef(e.target.value)}
                placeholder="Image URL (JPG/GIF) — leave blank to remove"
                className="text-sm h-9 flex-1"
                data-ocid={`admin-msg.edit_imageref.${index + 1}`}
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={handleSave}
                disabled={!draftContent.trim() || updating}
                data-ocid={`admin-msg.save_button.${index + 1}`}
              >
                {updating ? "Saving…" : "Save"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs"
                onClick={() => {
                  setEditing(false);
                  setDraftContent(msg.content);
                  setDraftImageRef(msg.imageRef ?? "");
                }}
                data-ocid={`admin-msg.cancel_button.${index + 1}`}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm font-body text-foreground whitespace-pre-wrap leading-relaxed">
              {msg.content}
            </p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground font-body">
                {new Date(Number(msg.createdAt) / 1_000_000).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  },
                )}
              </span>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                  onClick={() => setEditing(true)}
                  aria-label="Edit"
                  data-ocid={`admin-msg.edit_button.${index + 1}`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    deleteMsg(msg.id);
                    toast.success("Message deleted");
                  }}
                  disabled={deleting}
                  aria-label="Delete"
                  data-ocid={`admin-msg.delete_button.${index + 1}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AdminMessagesManager() {
  const { data: messages = [], isLoading } = useAdminMessages();
  const { mutate: addMsg, isPending: adding } = useAddAdminMessage();
  const [content, setContent] = useState("");
  const [imageRef, setImageRef] = useState("");

  const sorted = [...messages].sort((a, b) =>
    Number(b.createdAt - a.createdAt),
  );

  const handleAdd = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    addMsg(
      { content: trimmed, imageRef: imageRef.trim() || null },
      {
        onSuccess: () => {
          setContent("");
          setImageRef("");
          toast.success("Message posted");
        },
        onError: () => toast.error("Failed to post message"),
      },
    );
  };

  return (
    <div className="space-y-5" data-ocid="admin-messages.panel">
      {/* Compose */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <MessageCircle className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground text-sm">
            Post New Message
          </h3>
        </div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a message to display to all visitors…"
          className="min-h-[90px] text-sm resize-none font-body"
          data-ocid="admin-messages.content_textarea"
        />
        <div className="flex items-center gap-2">
          <Image className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <Input
            value={imageRef}
            onChange={(e) => setImageRef(e.target.value)}
            placeholder="Image/GIF URL (optional)"
            className="text-sm h-9 flex-1"
            data-ocid="admin-messages.imageref_input"
          />
        </div>
        <Button
          size="sm"
          className="gap-2 h-9"
          onClick={handleAdd}
          disabled={!content.trim() || adding}
          data-ocid="admin-messages.submit_button"
        >
          <Send className="w-3.5 h-3.5" />
          {adding ? "Posting…" : "Post Message"}
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3" data-ocid="admin-messages.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div
          className="flex flex-col items-center gap-3 py-10 text-center"
          data-ocid="admin-messages.empty_state"
        >
          <MessageCircle className="w-8 h-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No messages posted yet.
          </p>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          data-ocid="admin-messages.list"
        >
          {sorted.map((msg, i) => (
            <AdminMessageRow key={msg.id.toString()} msg={msg} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Public Messages Moderator ────────────────────────────────────────────────

function PublicMessagesModerator() {
  const { data: messages = [], isLoading } = usePublicMessages();
  const { mutate: deleteMsg } = useDeletePublicMessage();

  const sorted = [...messages].sort((a, b) =>
    Number(b.createdAt - a.createdAt),
  );

  return (
    <div className="space-y-4" data-ocid="public-messages.panel">
      <div className="flex items-center gap-2 mb-1">
        <Send className="w-4 h-4 text-primary" />
        <div>
          <h3 className="font-display font-semibold text-foreground text-sm">
            Public Messages
          </h3>
          <p className="text-xs text-muted-foreground font-body">
            Messages from visitors. You can delete any for moderation.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="public-messages.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div
          className="flex flex-col items-center gap-3 py-10 text-center"
          data-ocid="public-messages.empty_state"
        >
          <Send className="w-8 h-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No public messages yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="public-messages.list">
          {sorted.map((msg: PublicMessage, i: number) => (
            <div
              key={msg.id.toString()}
              className="flex items-start gap-3 bg-card border border-border rounded-xl px-4 py-3"
              data-ocid={`public-msg.item.${i + 1}`}
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-display font-bold text-sm text-primary uppercase">
                {msg.authorName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-semibold text-foreground truncate font-display">
                    {msg.authorName}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground font-body">
                      {new Date(
                        Number(msg.createdAt) / 1_000_000,
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          aria-label="Delete message"
                          data-ocid={`public-msg.delete_button.${i + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent
                        data-ocid={`public-msg.dialog.${i + 1}`}
                      >
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete this message?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Message from <strong>{msg.authorName}</strong> will
                            be permanently removed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            data-ocid={`public-msg.cancel_button.${i + 1}`}
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                              deleteMsg(msg.id);
                              toast.success("Message removed");
                            }}
                            data-ocid={`public-msg.confirm_button.${i + 1}`}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <p className="text-sm font-body text-foreground break-words leading-relaxed">
                  {msg.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

function AdminDashboard() {
  const { data: papers = [], isLoading: papersLoading } = useListPapers({});
  const { data: subjects = [] } = useSubjects();
  const { data: midTypes = [] } = useMidTypes();
  const { mutateAsync: addSubject } = useAddSubject();
  const { mutateAsync: removeSubject } = useRemoveSubject();
  const { mutateAsync: addMidType } = useAddMidType();
  const { mutateAsync: removeMidType } = useRemoveMidType();

  return (
    <div
      className="container mx-auto px-4 py-8 space-y-8 max-w-5xl"
      data-ocid="admin.panel"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            Admin Panel
          </h1>
          <p className="text-sm text-muted-foreground font-body">
            Manage question papers, messages, and metadata
          </p>
        </div>
      </motion.div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="bg-muted/50 flex-wrap h-auto gap-1">
          <TabsTrigger
            value="upload"
            className="gap-1.5"
            data-ocid="admin.upload_tab"
          >
            <Upload className="w-4 h-4" />
            Upload Paper
          </TabsTrigger>
          <TabsTrigger
            value="papers"
            className="gap-1.5"
            data-ocid="admin.papers_tab"
          >
            <BookOpen className="w-4 h-4" />
            All Papers
            {papers.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs py-0 px-1.5">
                {papers.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="metadata"
            className="gap-1.5"
            data-ocid="admin.metadata_tab"
          >
            <Tag className="w-4 h-4" />
            Subjects &amp; Types
          </TabsTrigger>
          <TabsTrigger
            value="sitenote"
            className="gap-1.5"
            data-ocid="admin.sitenote_tab"
          >
            <MessageSquare className="w-4 h-4" />
            Site Note
          </TabsTrigger>
          <TabsTrigger
            value="adminmessages"
            className="gap-1.5"
            data-ocid="admin.adminmessages_tab"
          >
            <MessageCircle className="w-4 h-4" />
            Admin Messages
          </TabsTrigger>
          <TabsTrigger
            value="publicmessages"
            className="gap-1.5"
            data-ocid="admin.publicmessages_tab"
          >
            <Send className="w-4 h-4" />
            Public Messages
          </TabsTrigger>
        </TabsList>

        {/* Upload tab */}
        <TabsContent value="upload">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div>
              <h2 className="font-display font-semibold text-foreground">
                Upload New Paper
              </h2>
              <p className="text-sm text-muted-foreground font-body mt-0.5">
                Fill in the paper details. Only PDF format is supported.
              </p>
            </div>
            <UploadForm subjects={subjects} midTypes={midTypes} />
          </div>
        </TabsContent>

        {/* Papers list tab */}
        <TabsContent value="papers">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-display font-semibold text-foreground">
              All Uploaded Papers
            </h2>
            {papersLoading ? (
              <div className="space-y-2" data-ocid="papers.loading_state">
                {Array.from({ length: 5 }, (_, i) => `skel-${i}`).map((key) => (
                  <Skeleton key={key} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : papers.length === 0 ? (
              <div
                className="flex flex-col items-center gap-3 py-12 text-center"
                data-ocid="papers.empty_state"
              >
                <BookOpen className="w-10 h-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No papers uploaded yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2" data-ocid="papers.list">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-3 text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  <span>Subject</span>
                  <span>Year</span>
                  <span>Type</span>
                  <span>Uploaded</span>
                </div>
                {papers.map((paper, i) => (
                  <PaperRow key={paper.id.toString()} paper={paper} index={i} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Metadata tab */}
        <TabsContent value="metadata">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <TagManager
                title="Subjects"
                icon={BookOpen}
                items={subjects}
                onAdd={addSubject}
                onRemove={removeSubject}
                ocidPrefix="subjects"
              />
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <TagManager
                title="Exam Types"
                icon={Tag}
                items={midTypes}
                onAdd={addMidType}
                onRemove={removeMidType}
                ocidPrefix="midtypes"
              />
            </div>
          </div>
        </TabsContent>

        {/* Site Note tab */}
        <TabsContent value="sitenote">
          <SiteNoteManager />
        </TabsContent>

        {/* Admin Messages tab */}
        <TabsContent value="adminmessages">
          <div className="bg-card border border-border rounded-xl p-6">
            <AdminMessagesManager />
          </div>
        </TabsContent>

        {/* Public Messages tab */}
        <TabsContent value="publicmessages">
          <div className="bg-card border border-border rounded-xl p-6">
            <PublicMessagesModerator />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Admin Page ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { loginStatus, login, clear } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success";
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();

  if (!isLoggedIn) {
    return (
      <ErrorBoundary>
        <div className="flex flex-col items-center justify-center gap-6 min-h-[60vh] p-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-1">
              <h2 className="font-display font-bold text-2xl text-foreground">
                Admin Access Required
              </h2>
              <p className="text-muted-foreground font-body text-sm max-w-sm">
                Sign in with Internet Identity to access the admin panel and
                manage question papers.
              </p>
            </div>
            <Button
              onClick={() => login()}
              className="gap-2 px-6"
              data-ocid="admin.login_button"
            >
              <LogIn className="w-4 h-4" />
              Sign in with Internet Identity
            </Button>
          </motion.div>
        </div>
      </ErrorBoundary>
    );
  }

  const signOutBar = (
    <div className="border-b border-border bg-muted/30">
      <div className="container mx-auto px-4 py-2 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => clear()}
          className="text-xs text-muted-foreground gap-1.5 h-7"
          data-ocid="admin.logout_button"
        >
          Sign out
        </Button>
      </div>
    </div>
  );

  if (adminLoading) {
    return (
      <ErrorBoundary>
        {signOutBar}
        <div
          className="flex items-center justify-center min-h-[40vh]"
          data-ocid="admin.loading_state"
        >
          <div className="flex flex-col items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <Skeleton className="h-4 w-36" />
            <p className="text-sm text-muted-foreground font-body">
              Verifying admin role…
            </p>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (!isAdmin) {
    return (
      <ErrorBoundary>
        {signOutBar}
        <div
          className="flex flex-col items-center justify-center gap-6 min-h-[60vh] p-8 text-center"
          data-ocid="admin.access_denied"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <ShieldX className="w-8 h-8 text-destructive" />
            </div>
            <div className="space-y-1">
              <h2 className="font-display font-bold text-2xl text-foreground">
                Access Denied
              </h2>
              <p className="text-muted-foreground font-body text-sm max-w-sm">
                Your account does not have admin privileges.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => clear()}
              className="gap-2"
              data-ocid="admin.signout_button"
            >
              Sign out
            </Button>
          </motion.div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      {signOutBar}
      <AdminDashboard />
    </ErrorBoundary>
  );
}
