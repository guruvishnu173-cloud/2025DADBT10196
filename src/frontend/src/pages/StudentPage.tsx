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
import { useCallback, useRef, useState } from "react";

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

// ─── 3D Tilt Hook ─────────────────────────────────────────────────────────────

function use3DTilt(strength = 12) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, scale: 1 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateY = ((x - cx) / cx) * strength;
      const rotateX = -((y - cy) / cy) * strength;
      setTilt({ rotateX, rotateY, scale: 1.03 });
    },
    [strength],
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0, scale: 1 });
  }, []);

  return { ref, tilt, handleMouseMove, handleMouseLeave };
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
        className="mb-6 rounded-xl glass-elevated depth-layer-2 border-primary/40 px-4 py-4"
        style={{
          borderColor: "oklch(var(--primary) / 0.4)",
          background: "oklch(var(--card) / 0.9)",
        }}
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
          className="min-h-[90px] text-sm resize-none font-body"
          style={{ background: "oklch(var(--background) / 0.6)" }}
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
              className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground transition-dimensional"
              onClick={handleCancel}
              disabled={setNote.isPending}
              data-ocid="sitenote.cancel_button"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs gap-1.5 transition-dimensional active:scale-95 active:translate-y-px glow-primary"
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
            className="h-7 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10 transition-dimensional active:scale-95"
            onClick={handleOpenEdit}
            data-ocid="sitenote.edit_button"
          >
            <Pencil className="w-3 h-3" />
            Edit Note
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 transition-dimensional active:scale-95"
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
          className="h-7 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10 transition-dimensional active:scale-95"
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
  const { ref, tilt, handleMouseMove, handleMouseLeave } = use3DTilt(6);

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
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${tilt.scale})`,
        transition: "transform 0.4s cubic-bezier(0.23, 1, 0.320, 1)",
        transformStyle: "preserve-3d",
        background: "oklch(var(--card) / 0.85)",
        backdropFilter: "blur(16px)",
        border: "1px solid oklch(var(--border) / 0.35)",
      }}
      className="rounded-xl overflow-hidden depth-layer-3"
      data-ocid={`admin-msg.item.${index + 1}`}
    >
      {msg.imageRef && (
        <div className="overflow-hidden" style={{ perspective: "800px" }}>
          <img
            src={msg.imageRef}
            alt="Admin message attachment"
            className="w-full max-h-64 object-cover border-b border-border/30 transition-dimensional hover:scale-105"
            data-ocid={`admin-msg.image.${index + 1}`}
          />
        </div>
      )}
      <div className="px-4 py-3 space-y-2">
        {editing ? (
          <div className="space-y-3">
            <Textarea
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              className="text-sm resize-none min-h-[80px]"
              style={{ background: "oklch(var(--background) / 0.6)" }}
              data-ocid={`admin-msg.edit_textarea.${index + 1}`}
              autoFocus
            />
            <Input
              value={draftImageRef}
              onChange={(e) => setDraftImageRef(e.target.value)}
              placeholder="Image URL (JPG/GIF) — leave blank to remove"
              className="text-sm h-9"
              style={{ background: "oklch(var(--background) / 0.6)" }}
              data-ocid={`admin-msg.edit_imageref.${index + 1}`}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="h-8 text-xs gap-1.5 transition-dimensional active:scale-95 active:translate-y-px"
                onClick={handleSave}
                disabled={!draftContent.trim() || updating}
                data-ocid={`admin-msg.save_button.${index + 1}`}
              >
                {updating ? "Saving…" : "Save"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs text-muted-foreground transition-dimensional"
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
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-primary transition-dimensional"
                    onClick={() => setEditing(true)}
                    aria-label="Edit message"
                    data-ocid={`admin-msg.edit_button.${index + 1}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-dimensional"
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
      style={{
        background: "oklch(var(--muted) / 0.2)",
        borderTop: "1px solid oklch(var(--border) / 0.5)",
        borderBottom: "1px solid oklch(var(--border) / 0.5)",
      }}
      data-ocid="admin-messages.section"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            {/* Glowing icon orb */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center depth-layer-2"
              style={{
                background:
                  "linear-gradient(135deg, oklch(var(--accent) / 0.25), oklch(var(--primary) / 0.15))",
                boxShadow:
                  "0 0 16px oklch(var(--accent) / 0.25), 0 4px 12px rgba(0,0,0,0.2)",
                border: "1px solid oklch(var(--accent) / 0.3)",
              }}
            >
              <MessageCircle
                className="w-4.5 h-4.5 text-primary"
                style={{ width: "1.125rem", height: "1.125rem" }}
              />
            </div>
            <div>
              <h2
                className="font-display font-semibold text-foreground"
                style={{
                  textShadow:
                    "0 0 20px oklch(var(--primary) / 0.35), 0 1px 3px rgba(0,0,0,0.3)",
                }}
              >
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
              className="gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10 h-8 transition-dimensional active:scale-95 active:translate-y-px"
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
            className="mb-5 rounded-xl p-4 space-y-3 glass-elevated depth-layer-2"
            style={{
              borderColor: "oklch(var(--primary) / 0.3)",
              boxShadow:
                "0 0 24px oklch(var(--primary) / 0.12), 0 8px 24px rgba(0,0,0,0.2)",
            }}
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
              style={{ background: "oklch(var(--background) / 0.6)" }}
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
                style={{ background: "oklch(var(--background) / 0.6)" }}
                data-ocid="admin-messages.imageref_input"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="h-8 text-xs gap-1.5 transition-dimensional active:scale-95 active:translate-y-px glow-primary"
                onClick={handleAdd}
                disabled={!newContent.trim() || adding}
                data-ocid="admin-messages.submit_button"
              >
                {adding ? "Posting…" : "Post Message"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs text-muted-foreground transition-dimensional"
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
            <MessageCircle
              className="w-8 h-8"
              style={{ color: "oklch(var(--muted-foreground) / 0.4)" }}
            />
            <p className="text-sm text-muted-foreground font-body">
              No messages from admin yet.
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            style={{ perspective: "1200px" }}
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
      className="rounded-xl px-4 py-3 flex items-start gap-3 transition-dimensional hover:translate-y-[-2px]"
      style={{
        background: "oklch(var(--card) / 0.8)",
        backdropFilter: "blur(12px)",
        border: "1px solid oklch(var(--border) / 0.3)",
        boxShadow:
          "0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
      data-ocid={`public-msg.item.${index + 1}`}
    >
      {/* Avatar orb — floats subtly */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-display font-bold text-sm uppercase"
        style={{
          background:
            "linear-gradient(135deg, oklch(var(--primary) / 0.25), oklch(var(--accent) / 0.15))",
          border: "1px solid oklch(var(--primary) / 0.3)",
          boxShadow: "0 0 12px oklch(var(--primary) / 0.2)",
          color: "oklch(var(--primary))",
        }}
      >
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
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-dimensional"
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
      style={{
        background: "oklch(var(--background))",
        borderTop: "1px solid oklch(var(--border) / 0.4)",
      }}
      data-ocid="public-messages.section"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center depth-layer-2"
            style={{
              background:
                "linear-gradient(135deg, oklch(var(--primary) / 0.2), oklch(var(--accent) / 0.1))",
              boxShadow:
                "0 0 16px oklch(var(--primary) / 0.2), 0 4px 12px rgba(0,0,0,0.2)",
              border: "1px solid oklch(var(--primary) / 0.25)",
            }}
          >
            <Send
              style={{
                width: "1.125rem",
                height: "1.125rem",
                color: "oklch(var(--primary))",
              }}
            />
          </div>
          <div>
            <h2
              className="font-display font-semibold text-foreground"
              style={{
                textShadow:
                  "0 0 20px oklch(var(--primary) / 0.3), 0 1px 3px rgba(0,0,0,0.3)",
              }}
            >
              Message to Admin
            </h2>
            <p className="text-xs text-muted-foreground font-body">
              Share your thoughts, requests or feedback — visible to everyone
            </p>
          </div>
        </div>

        {/* Post form — glass elevated */}
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-xl p-4 space-y-3 glass-elevated depth-layer-2"
          style={{
            boxShadow:
              "0 0 28px oklch(var(--primary) / 0.1), 0 8px 24px rgba(0,0,0,0.2)",
            border: "1px solid oklch(var(--primary) / 0.2)",
          }}
          data-ocid="public-messages.form"
        >
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="h-9 text-sm transition-dimensional focus:shadow-[0_0_12px_oklch(var(--primary)/0.25)]"
            style={{ background: "oklch(var(--background) / 0.6)" }}
            maxLength={60}
            required
            data-ocid="public-messages.name_input"
          />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your message here…"
            className="min-h-[80px] text-sm resize-none font-body transition-dimensional"
            style={{ background: "oklch(var(--background) / 0.6)" }}
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
              className="gap-1.5 h-8 text-xs transition-dimensional active:scale-95 active:translate-y-px glow-primary"
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
            <MessageCircle
              className="w-8 h-8"
              style={{ color: "oklch(var(--muted-foreground) / 0.4)" }}
            />
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
  const { ref, tilt, handleMouseMove, handleMouseLeave } = use3DTilt(14);

  const midBadgeStyles: Record<string, React.CSSProperties> = {
    "Mid-1": {
      background: "oklch(var(--accent) / 0.2)",
      border: "1px solid oklch(var(--accent) / 0.4)",
      color: "oklch(var(--accent-foreground))",
    },
    "Mid-2": {
      background: "oklch(var(--primary) / 0.15)",
      border: "1px solid oklch(var(--primary) / 0.4)",
      color: "oklch(var(--primary))",
    },
    "End Sem": {
      background: "oklch(var(--secondary) / 0.8)",
      border: "1px solid oklch(var(--border))",
      color: "oklch(var(--secondary-foreground))",
    },
    Supplementary: {
      background: "oklch(var(--muted) / 0.8)",
      border: "1px solid oklch(var(--border))",
      color: "oklch(var(--muted-foreground))",
    },
  };

  const badgeStyle =
    midBadgeStyles[paper.midType] ?? midBadgeStyles.Supplementary;

  const pdfUrl = paper.storageRef.getDirectURL();
  const filename = `${paper.year}-${paper.subject.replace(/\s+/g, "-")}-${paper.midType.replace(/\s+/g, "-")}.pdf`;

  const handleView = () => {
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  const isHovering =
    Math.abs(tilt.rotateX) > 0.5 || Math.abs(tilt.rotateY) > 0.5;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.055 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="rounded-xl p-5 flex flex-col gap-3 group cursor-default"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateY(${isHovering ? -8 : 0}px) translateZ(${isHovering ? 20 : 0}px) scale(${tilt.scale})`,
        transition:
          "transform 0.4s cubic-bezier(0.23, 1, 0.320, 1), box-shadow 0.4s cubic-bezier(0.23, 1, 0.320, 1), border-color 0.4s ease",
        transformStyle: "preserve-3d",
        background: "oklch(var(--card) / 0.9)",
        backdropFilter: "blur(16px)",
        border: isHovering
          ? "1px solid oklch(var(--primary) / 0.5)"
          : "1px solid oklch(var(--border) / 0.4)",
        boxShadow: isHovering
          ? "0 24px 48px rgba(0,0,0,0.4), 0 -6px 16px rgba(0,0,0,0.2), 0 0 28px oklch(var(--primary) / 0.2), inset 0 1px 0 rgba(255,255,255,0.12)"
          : "0 4px 12px rgba(0,0,0,0.15), 0 -1px 4px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
      data-ocid={`paper.item.${index + 1}`}
    >
      {/* Glass overlay shimmer */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)",
          opacity: isHovering ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      />

      <div className="flex items-start gap-3 relative">
        {/* File icon with glow */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-dimensional"
          style={{
            background: isHovering
              ? "linear-gradient(135deg, oklch(var(--primary) / 0.25), oklch(var(--accent) / 0.15))"
              : "oklch(var(--primary) / 0.1)",
            boxShadow: isHovering
              ? "0 0 16px oklch(var(--primary) / 0.35), 0 4px 8px rgba(0,0,0,0.2)"
              : "none",
            border: `1px solid oklch(var(--primary) / ${isHovering ? "0.3" : "0.15"})`,
            transition: "all 0.4s cubic-bezier(0.23, 1, 0.320, 1)",
          }}
        >
          <FileText
            className="w-5 h-5"
            style={{
              color: "oklch(var(--primary))",
              filter: isHovering
                ? "drop-shadow(0 0 6px oklch(var(--primary) / 0.6))"
                : "none",
              transition: "filter 0.4s ease",
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-foreground text-sm leading-snug line-clamp-2">
            {paper.subject}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-body">
            Year: {paper.year}
          </p>
        </div>
        <span
          className="text-xs font-medium shrink-0 px-2 py-0.5 rounded-full"
          style={badgeStyle}
        >
          {paper.midType}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-body relative">
        <Calendar
          className="w-3 h-3"
          style={{ color: "oklch(var(--primary) / 0.6)" }}
        />
        <span>Uploaded: {formatDate(paper.uploadTimestamp)}</span>
      </div>

      <div className="flex gap-2 mt-auto relative">
        <Button
          size="sm"
          className="flex-1 gap-1.5 text-xs transition-dimensional active:scale-95 active:translate-y-px"
          style={{
            boxShadow: isHovering
              ? "0 0 12px oklch(var(--primary) / 0.3)"
              : "none",
            transition: "all 0.3s ease",
          }}
          onClick={handleView}
          data-ocid={`paper.view_button.${index + 1}`}
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-1.5 text-xs transition-dimensional active:scale-95 active:translate-y-px"
          style={{
            borderColor: "oklch(var(--accent) / 0.45)",
            color: "oklch(var(--accent-foreground))",
            background: isHovering
              ? "oklch(var(--accent) / 0.2)"
              : "oklch(var(--accent) / 0.08)",
            boxShadow: isHovering
              ? "0 0 12px oklch(var(--accent) / 0.25)"
              : "none",
            transition: "all 0.3s ease",
          }}
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
    <div
      className="rounded-xl p-5 flex flex-col gap-3"
      style={{
        background: "oklch(var(--card) / 0.7)",
        backdropFilter: "blur(12px)",
        border: "1px solid oklch(var(--border) / 0.3)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
      }}
    >
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
      {/* ── Hero ── */}
      <section
        style={{
          background:
            "linear-gradient(180deg, oklch(var(--primary) / 0.08) 0%, oklch(var(--background)) 100%)",
          borderBottom: "1px solid oklch(var(--border) / 0.4)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient glow blobs */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "-40px",
            right: "-60px",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background: "oklch(var(--primary) / 0.08)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "-20px",
            left: "10%",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "oklch(var(--accent) / 0.06)",
            filter: "blur(50px)",
            pointerEvents: "none",
          }}
        />
        <div className="container mx-auto px-4 py-10 sm:py-14 relative">
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl"
          >
            {/* Tag pill — glass */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.35 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium font-body mb-4"
              style={{
                background: "oklch(var(--primary) / 0.12)",
                border: "1px solid oklch(var(--primary) / 0.3)",
                color: "oklch(var(--primary))",
                boxShadow: "0 0 16px oklch(var(--primary) / 0.15)",
              }}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Question Paper Archive
            </motion.div>

            <h1
              className="font-display font-bold text-3xl sm:text-4xl text-foreground leading-tight"
              style={{
                textShadow:
                  "0 2px 12px rgba(0,0,0,0.3), 0 0 40px oklch(var(--primary) / 0.15)",
              }}
            >
              Find Your{" "}
              <span
                style={{
                  color: "oklch(var(--primary))",
                  textShadow:
                    "0 0 24px oklch(var(--primary) / 0.5), 0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                Question Papers
              </span>
            </h1>
            <p className="text-muted-foreground text-base font-body mt-3 max-w-lg">
              Search previous year exam papers by year, subject, and exam type.
              View online or download as PDF — completely free.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Filter form ── */}
      <section
        style={{
          background: "oklch(var(--muted) / 0.15)",
          borderBottom: "1px solid oklch(var(--border) / 0.4)",
        }}
      >
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="rounded-2xl p-6 glass-elevated depth-layer-2"
            style={{
              boxShadow:
                "0 0 32px oklch(var(--primary) / 0.08), 0 8px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.07)",
              border: "1px solid oklch(var(--border) / 0.3)",
            }}
            data-ocid="filter.panel"
          >
            <div className="flex items-center gap-2.5 mb-5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(var(--primary) / 0.2), oklch(var(--accent) / 0.1))",
                  border: "1px solid oklch(var(--primary) / 0.25)",
                  boxShadow: "0 0 12px oklch(var(--primary) / 0.2)",
                }}
              >
                <Search
                  className="w-4 h-4"
                  style={{ color: "oklch(var(--primary))" }}
                />
              </div>
              <h2
                className="font-display font-semibold text-sm text-foreground"
                style={{
                  textShadow:
                    "0 0 16px oklch(var(--primary) / 0.25), 0 1px 3px rgba(0,0,0,0.2)",
                }}
              >
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
                  className="h-9 text-sm transition-dimensional"
                  style={{
                    background: "oklch(var(--background) / 0.7)",
                    border: "1px solid oklch(var(--input) / 0.7)",
                  }}
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
                    className="h-9 text-sm transition-dimensional"
                    style={{
                      background: "oklch(var(--background) / 0.7)",
                      border: "1px solid oklch(var(--input) / 0.7)",
                    }}
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
                    className="h-9 text-sm transition-dimensional"
                    style={{
                      background: "oklch(var(--background) / 0.7)",
                      border: "1px solid oklch(var(--input) / 0.7)",
                    }}
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
                className="gap-2 px-6 transition-dimensional active:scale-95 active:translate-y-px"
                style={{
                  boxShadow:
                    "0 0 20px oklch(var(--primary) / 0.3), 0 4px 12px rgba(0,0,0,0.2)",
                }}
                data-ocid="filter.find_button"
              >
                <Search className="w-4 h-4" />
                Find Papers
              </Button>
              {hasActiveFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-dimensional"
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

      {/* ── Results ── */}
      <section
        className="container mx-auto px-4 py-8"
        data-ocid="papers.section"
      >
        {/* Note zone: admin editor + public note banner */}
        <AnimatePresence mode="sync">
          <SiteNoteAdmin key="admin-note-controls" />

          {siteNote && (
            <motion.div
              key="sitenote-banner"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="mb-6 flex gap-3 rounded-xl px-4 py-3.5"
              style={{
                background: "oklch(var(--primary) / 0.1)",
                backdropFilter: "blur(12px)",
                border: "1px solid oklch(var(--primary) / 0.35)",
                boxShadow:
                  "0 0 20px oklch(var(--primary) / 0.2), 0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
                animation: "pulse-glow 3s ease-in-out infinite",
              }}
              data-ocid="sitenote.card"
            >
              <div className="mt-0.5 flex-shrink-0">
                <Info
                  className="w-4 h-4"
                  style={{
                    color: "oklch(var(--primary))",
                    filter: "drop-shadow(0 0 6px oklch(var(--primary) / 0.5))",
                  }}
                />
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
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center depth-layer-2 float-medium"
              style={{
                background:
                  "linear-gradient(135deg, oklch(var(--primary) / 0.15), oklch(var(--accent) / 0.08))",
                border: "1px solid oklch(var(--primary) / 0.25)",
                boxShadow:
                  "0 0 24px oklch(var(--primary) / 0.2), 0 8px 24px rgba(0,0,0,0.2)",
              }}
            >
              <FileSearch
                className="w-8 h-8"
                style={{
                  color: "oklch(var(--primary) / 0.7)",
                  filter: "drop-shadow(0 0 8px oklch(var(--primary) / 0.4))",
                }}
              />
            </div>
            <div className="space-y-1">
              <h3
                className="font-display font-semibold text-lg text-foreground"
                style={{
                  textShadow:
                    "0 0 16px oklch(var(--primary) / 0.2), 0 1px 3px rgba(0,0,0,0.2)",
                }}
              >
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
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center depth-layer-1"
              style={{
                background: "oklch(var(--muted) / 0.6)",
                border: "1px solid oklch(var(--border) / 0.3)",
              }}
            >
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
              className="transition-dimensional active:scale-95"
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
            {/* 3D perspective wrapper so cards tilt in shared 3D space */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              style={{ perspective: "1600px", perspectiveOrigin: "50% 40%" }}
            >
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
