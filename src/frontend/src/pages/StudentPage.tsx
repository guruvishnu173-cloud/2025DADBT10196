import ErrorBoundary from "@/components/ErrorBoundary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddAdminMessage,
  useAddPublicMessage,
  useAdminMessages,
  useDeleteAdminMessage,
  useDeletePublicMessage,
  useIsAdmin,
  useListPapers,
  useMidTypes,
  useMutateNote,
  useNote,
  usePublicMessages,
  useSubjects,
  useUpdateAdminMessage,
} from "@/hooks/useQueries";
import type {
  AdminMessage,
  PaperFilter,
  PublicMessage,
  QuestionPaper,
} from "@/types";
import {
  BookOpen,
  Calendar,
  Download,
  Eye,
  FileSearch,
  FileText,
  Image,
  Info,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  if (ms === 0) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(ms));
}

// ─── SiteNoteAdmin — inline admin editor for the site note ───────────────────

function SiteNoteAdmin() {
  const { data: siteNote } = useNote();
  const { data: isAdmin } = useIsAdmin();
  const { setNote, clearNote } = useMutateNote();

  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState("");

  if (!isAdmin) return null;

  const handleOpenEdit = () => {
    setDraftText(siteNote?.content ?? "");
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setDraftText("");
  };

  const handleSave = () => {
    const trimmed = draftText.trim();
    if (!trimmed) return;
    setNote.mutate(trimmed, {
      onSuccess: () => {
        setEditing(false);
        setDraftText("");
      },
    });
  };

  const handleClear = () => {
    clearNote.mutate(undefined, {
      onSuccess: () => {
        setEditing(false);
        setDraftText("");
      },
    });
  };

  if (editing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.22 }}
        className="mb-6 rounded-xl border border-primary/30 bg-primary/6 px-4 py-4"
        data-ocid="sitenote.editor"
      >
        <div className="flex items-center gap-2 mb-3">
          <Pencil className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary font-display uppercase tracking-wide">
            {siteNote ? "Edit Note" : "New Note"}
          </span>
        </div>
        <Textarea
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          placeholder="Write a message for all visitors…"
          className="min-h-[90px] text-sm bg-card resize-none font-body"
          maxLength={600}
          autoFocus
          data-ocid="sitenote.textarea"
        />
        <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-body">
            {draftText.trim().length}/600 characters
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={handleCancel}
              disabled={setNote.isPending}
              data-ocid="sitenote.cancel_button"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={handleSave}
              disabled={!draftText.trim() || setNote.isPending}
              data-ocid="sitenote.save_button"
            >
              {setNote.isPending ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                  Saving…
                </span>
              ) : (
                <>Save Note</>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className="mb-2 flex items-center justify-end gap-2"
      data-ocid="sitenote.admin_toolbar"
    >
      {siteNote ? (
        <>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/8"
            onClick={handleOpenEdit}
            data-ocid="sitenote.edit_button"
          >
            <Pencil className="w-3 h-3" />
            Edit Note
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/8"
            onClick={handleClear}
            disabled={clearNote.isPending}
            data-ocid="sitenote.delete_button"
          >
            {clearNote.isPending ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-destructive/40 border-t-destructive rounded-full animate-spin" />
                Removing…
              </span>
            ) : (
              <>
                <Trash2 className="w-3 h-3" />
                Remove Note
              </>
            )}
          </Button>
        </>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/8"
          onClick={handleOpenEdit}
          data-ocid="sitenote.add_button"
        >
          <Plus className="w-3 h-3" />
          Add Note
        </Button>
      )}
    </div>
  );
}

// ─── AdminMessageCard ─────────────────────────────────────────────────────────

function AdminMessageCard({
  msg,
  index,
  isAdmin,
}: {
  msg: AdminMessage;
  index: number;
  isAdmin: boolean;
}) {
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
      { onSuccess: () => setEditing(false) },
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="bg-card border border-border rounded-xl overflow-hidden"
      data-ocid={`admin-msg.item.${index + 1}`}
    >
      {msg.imageRef && (
        <img
          src={msg.imageRef}
          alt="Admin message attachment"
          className="w-full max-h-64 object-cover border-b border-border"
          data-ocid={`admin-msg.image.${index + 1}`}
        />
      )}
      <div className="px-4 py-3 space-y-2">
        {editing ? (
          <div className="space-y-3">
            <Textarea
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              className="text-sm resize-none min-h-[80px]"
              data-ocid={`admin-msg.edit_textarea.${index + 1}`}
              autoFocus
            />
            <Input
              value={draftImageRef}
              onChange={(e) => setDraftImageRef(e.target.value)}
              placeholder="Image URL (JPG/GIF) — leave blank to remove"
              className="text-sm h-9"
              data-ocid={`admin-msg.edit_imageref.${index + 1}`}
            />
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
                className="h-8 text-xs text-muted-foreground"
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
            <p className="text-sm font-body text-foreground leading-relaxed whitespace-pre-wrap">
              {msg.content}
            </p>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground font-body">
                {formatDate(msg.createdAt)}
                {msg.updatedAt !== msg.createdAt && " (edited)"}
              </span>
              {isAdmin && (
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                    onClick={() => setEditing(true)}
                    aria-label="Edit message"
                    data-ocid={`admin-msg.edit_button.${index + 1}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => deleteMsg(msg.id)}
                    disabled={deleting}
                    aria-label="Delete message"
                    data-ocid={`admin-msg.delete_button.${index + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─── AdminMessagesSection ─────────────────────────────────────────────────────

function AdminMessagesSection() {
  const { data: messages = [], isLoading } = useAdminMessages();
  const { data: isAdmin } = useIsAdmin();
  const { mutate: addMsg, isPending: adding } = useAddAdminMessage();

  const [showForm, setShowForm] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newImageRef, setNewImageRef] = useState("");

  const sorted = [...messages].sort((a, b) =>
    Number(b.createdAt - a.createdAt),
  );

  const handleAdd = () => {
    const content = newContent.trim();
    if (!content) return;
    addMsg(
      { content, imageRef: newImageRef.trim() || null },
      {
        onSuccess: () => {
          setNewContent("");
          setNewImageRef("");
          setShowForm(false);
        },
      },
    );
  };

  return (
    <section
      className="bg-muted/30 border-t border-b border-border"
      data-ocid="admin-messages.section"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-accent-foreground" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-foreground">
                Message from Admin
              </h2>
              <p className="text-xs text-muted-foreground font-body">
                Updates and announcements from the site administrator
              </p>
            </div>
          </div>
          {isAdmin && !showForm && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/8 h-8"
              onClick={() => setShowForm(true)}
              data-ocid="admin-messages.add_button"
            >
              <Plus className="w-3 h-3" />
              Add Message
            </Button>
          )}
        </div>

        {/* Add form (admin only) */}
        {isAdmin && showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 rounded-xl border border-primary/25 bg-card p-4 space-y-3"
            data-ocid="admin-messages.add_form"
          >
            <p className="text-xs font-semibold text-primary font-display uppercase tracking-wide flex items-center gap-1.5">
              <Pencil className="w-3 h-3" /> New Message
            </p>
            <Textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Write your message to visitors…"
              className="min-h-[90px] text-sm resize-none font-body"
              autoFocus
              data-ocid="admin-messages.content_textarea"
            />
            <div className="flex items-center gap-2">
              <Image className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <Input
                value={newImageRef}
                onChange={(e) => setNewImageRef(e.target.value)}
                placeholder="Image/GIF URL (optional)"
                className="text-sm h-9 flex-1"
                data-ocid="admin-messages.imageref_input"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={handleAdd}
                disabled={!newContent.trim() || adding}
                data-ocid="admin-messages.submit_button"
              >
                {adding ? "Posting…" : "Post Message"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs text-muted-foreground"
                onClick={() => {
                  setShowForm(false);
                  setNewContent("");
                  setNewImageRef("");
                }}
                data-ocid="admin-messages.cancel_button"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {/* Message list */}
        {isLoading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            data-ocid="admin-messages.loading_state"
          >
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div
            className="flex flex-col items-center gap-3 py-10 text-center"
            data-ocid="admin-messages.empty_state"
          >
            <MessageCircle className="w-8 h-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground font-body">
              No messages from admin yet.
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            data-ocid="admin-messages.list"
          >
            {sorted.map((msg, i) => (
              <AdminMessageCard
                key={msg.id.toString()}
                msg={msg}
                index={i}
                isAdmin={!!isAdmin}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── PublicMessageCard ────────────────────────────────────────────────────────

function PublicMessageCard({
  msg,
  index,
  isAdmin,
}: {
  msg: PublicMessage;
  index: number;
  isAdmin: boolean;
}) {
  const { mutate: deleteMsg, isPending } = useDeletePublicMessage();

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, delay: index * 0.04 }}
      className="bg-card border border-border rounded-xl px-4 py-3 flex items-start gap-3"
      data-ocid={`public-msg.item.${index + 1}`}
    >
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 font-display font-bold text-sm text-primary uppercase">
        {msg.authorName.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-sm font-semibold text-foreground font-display truncate">
            {msg.authorName}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-muted-foreground font-body">
              {formatDate(msg.createdAt)}
            </span>
            {isAdmin && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => deleteMsg(msg.id)}
                disabled={isPending}
                aria-label="Delete message"
                data-ocid={`public-msg.delete_button.${index + 1}`}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm font-body text-foreground leading-relaxed break-words">
          {msg.content}
        </p>
      </div>
    </motion.div>
  );
}

// ─── PublicMessagesSection ────────────────────────────────────────────────────

function PublicMessagesSection() {
  const { data: messages = [], isLoading } = usePublicMessages();
  const { data: isAdmin } = useIsAdmin();
  const { mutate: addMsg, isPending: adding } = useAddPublicMessage();

  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const sorted = [...messages].sort((a, b) =>
    Number(b.createdAt - a.createdAt),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimName = name.trim();
    const trimContent = content.trim();
    if (!trimName || !trimContent) return;
    addMsg(
      { content: trimContent, authorName: trimName },
      {
        onSuccess: () => {
          setName("");
          setContent("");
        },
      },
    );
  };

  return (
    <section
      className="bg-background border-t border-border"
      data-ocid="public-messages.section"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Send className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-foreground">
              Message to Admin
            </h2>
            <p className="text-xs text-muted-foreground font-body">
              Share your thoughts, requests or feedback — visible to everyone
            </p>
          </div>
        </div>

        {/* Post form */}
        <form
          onSubmit={handleSubmit}
          className="mb-6 bg-card border border-border rounded-xl p-4 space-y-3"
          data-ocid="public-messages.form"
        >
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="h-9 text-sm"
            maxLength={60}
            required
            data-ocid="public-messages.name_input"
          />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your message here…"
            className="min-h-[80px] text-sm resize-none font-body"
            maxLength={500}
            required
            data-ocid="public-messages.content_textarea"
          />
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-body">
              {content.trim().length}/500 characters
            </span>
            <Button
              type="submit"
              size="sm"
              className="gap-1.5 h-8 text-xs"
              disabled={!name.trim() || !content.trim() || adding}
              data-ocid="public-messages.submit_button"
            >
              <Send className="w-3.5 h-3.5" />
              {adding ? "Posting…" : "Post Message"}
            </Button>
          </div>
        </form>

        {/* Message list */}
        {isLoading ? (
          <div className="space-y-3" data-ocid="public-messages.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div
            className="flex flex-col items-center gap-3 py-10 text-center"
            data-ocid="public-messages.empty_state"
          >
            <MessageCircle className="w-8 h-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground font-body">
              No messages yet. Be the first to leave a message!
            </p>
          </div>
        ) : (
          <div className="space-y-3" data-ocid="public-messages.list">
            {sorted.map((msg, i) => (
              <PublicMessageCard
                key={msg.id.toString()}
                msg={msg}
                index={i}
                isAdmin={!!isAdmin}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── PaperCard ────────────────────────────────────────────────────────────────

function PaperCard({ paper, index }: { paper: QuestionPaper; index: number }) {
  const midColors: Record<string, string> = {
    "Mid-1": "bg-accent/15 text-accent-foreground border-accent/30",
    "Mid-2": "bg-primary/10 text-primary border-primary/30",
    "End Sem": "bg-secondary text-secondary-foreground border-border",
    Supplementary: "bg-muted text-muted-foreground border-border",
  };
  const badgeClass =
    midColors[paper.midType] ?? "bg-muted text-muted-foreground border-border";

  const pdfUrl = paper.storageRef.getDirectURL();
  const filename = `${paper.year}-${paper.subject.replace(/\s+/g, "-")}-${paper.midType.replace(/\s+/g, "-")}.pdf`;

  const handleView = () => {
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.055 }}
      className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:shadow-md hover:border-primary/25 transition-smooth group"
      data-ocid={`paper.item.${index + 1}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/12 transition-smooth">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-foreground text-sm leading-snug line-clamp-2">
            {paper.subject}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-body">
            Year: {paper.year}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`text-xs font-medium shrink-0 ${badgeClass}`}
        >
          {paper.midType}
        </Badge>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-body">
        <Calendar className="w-3 h-3" />
        <span>Uploaded: {formatDate(paper.uploadTimestamp)}</span>
      </div>

      <div className="flex gap-2 mt-auto">
        <Button
          size="sm"
          variant="default"
          className="flex-1 gap-1.5 text-xs"
          onClick={handleView}
          data-ocid={`paper.view_button.${index + 1}`}
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-1.5 text-xs border-accent/40 text-accent-foreground bg-accent/8 hover:bg-accent/15"
          asChild
          data-ocid={`paper.download_button.${index + 1}`}
        >
          <a href={pdfUrl} download={filename}>
            <Download className="w-3.5 h-3.5" />
            Download
          </a>
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function PaperCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-2/5" />
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1 rounded-md" />
        <Skeleton className="h-8 flex-1 rounded-md" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudentPage() {
  const [draft, setDraft] = useState<{
    year: string;
    subject: string;
    midType: string;
  }>({ year: "", subject: "", midType: "" });

  const [committedFilter, setCommittedFilter] = useState<PaperFilter | null>(
    null,
  );
  const [hasSearched, setHasSearched] = useState(false);

  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects();
  const { data: midTypes = [], isLoading: midTypesLoading } = useMidTypes();
  const { data: papers = [], isLoading: papersLoading } =
    useListPapers(committedFilter);
  const { data: siteNote } = useNote();

  const handleFind = () => {
    const filter: PaperFilter = {};
    if (draft.year.trim()) filter.year = draft.year.trim();
    if (draft.subject) filter.subject = draft.subject;
    if (draft.midType) filter.midType = draft.midType;
    setCommittedFilter(filter);
    setHasSearched(true);
  };

  const handleClear = () => {
    setDraft({ year: "", subject: "", midType: "" });
    setCommittedFilter(null);
    setHasSearched(false);
  };

  const hasActiveFilter = draft.year || draft.subject || draft.midType;

  return (
    <ErrorBoundary>
      {/* Hero */}
      <section className="bg-primary/5 border-b border-border">
        <div className="container mx-auto px-4 py-10 sm:py-14">
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium font-body mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              Question Paper Archive
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground leading-tight">
              Find Your <span className="text-primary">Question Papers</span>
            </h1>
            <p className="text-muted-foreground text-base font-body mt-3 max-w-lg">
              Search previous year exam papers by year, subject, and exam type.
              View online or download as PDF — completely free.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter form */}
      <section className="bg-muted/40 border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            data-ocid="filter.panel"
          >
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-4 h-4 text-primary" />
              <h2 className="font-display font-semibold text-sm text-foreground">
                Search Filters
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="filter-year"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Academic Year
                </Label>
                <Input
                  id="filter-year"
                  placeholder="e.g. 2023"
                  value={draft.year}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, year: e.target.value }))
                  }
                  className="h-9 text-sm bg-card"
                  data-ocid="filter.year_input"
                  maxLength={10}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Subject
                </Label>
                <Select
                  value={draft.subject}
                  onValueChange={(v) => setDraft((d) => ({ ...d, subject: v }))}
                  disabled={subjectsLoading}
                >
                  <SelectTrigger
                    className="h-9 text-sm bg-card"
                    data-ocid="filter.subject_select"
                  >
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Exam Type
                </Label>
                <Select
                  value={draft.midType}
                  onValueChange={(v) => setDraft((d) => ({ ...d, midType: v }))}
                  disabled={midTypesLoading}
                >
                  <SelectTrigger
                    className="h-9 text-sm bg-card"
                    data-ocid="filter.midtype_select"
                  >
                    <SelectValue placeholder="Select Exam Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {midTypes.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-5">
              <Button
                onClick={handleFind}
                className="gap-2 px-6"
                data-ocid="filter.find_button"
              >
                <Search className="w-4 h-4" />
                Find Papers
              </Button>
              {hasActiveFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  onClick={handleClear}
                  data-ocid="filter.clear_button"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Admin Messages section */}
      <AdminMessagesSection />

      {/* Public Messages section */}
      <PublicMessagesSection />

      {/* Results */}
      <section
        className="container mx-auto px-4 py-8"
        data-ocid="papers.section"
      >
        {/* ── Note zone: admin editor + public note banner ── */}
        <AnimatePresence mode="sync">
          <SiteNoteAdmin key="admin-note-controls" />

          {siteNote && (
            <motion.div
              key="sitenote-banner"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="mb-6 flex gap-3 rounded-xl border border-primary/25 bg-primary/8 px-4 py-3.5"
              data-ocid="sitenote.card"
            >
              <div className="mt-0.5 flex-shrink-0">
                <Info className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-body text-foreground leading-relaxed whitespace-pre-wrap">
                {siteNote.content}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {!hasSearched ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center gap-4 py-20 text-center"
            data-ocid="papers.pre_search_state"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center">
              <FileSearch className="w-8 h-8 text-primary/60" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-semibold text-lg text-foreground">
                Ready to find papers?
              </h3>
              <p className="text-sm text-muted-foreground font-body max-w-xs">
                Select your year, subject, and exam type above, then click{" "}
                <span className="font-medium text-foreground">Find Papers</span>{" "}
                to browse the archive.
              </p>
            </div>
          </motion.div>
        ) : papersLoading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            data-ocid="papers.loading_state"
          >
            {Array.from({ length: 8 }, (_, i) => `skel-${i}`).map((key) => (
              <PaperCardSkeleton key={key} />
            ))}
          </div>
        ) : papers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center gap-4 py-20 text-center"
            data-ocid="papers.empty_state"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-semibold text-lg text-foreground">
                No papers found
              </h3>
              <p className="text-sm text-muted-foreground font-body max-w-xs">
                No question papers match your filters. Try adjusting the year,
                subject, or exam type.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              data-ocid="papers.empty_state.clear_button"
            >
              Clear filters
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-muted-foreground font-body">
                <span className="font-semibold text-foreground">
                  {papers.length}
                </span>{" "}
                paper{papers.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {papers.map((paper, i) => (
                <PaperCard key={paper.id.toString()} paper={paper} index={i} />
              ))}
            </div>
          </>
        )}
      </section>
    </ErrorBoundary>
  );
}
