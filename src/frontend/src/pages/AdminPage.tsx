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
import {
  useAddMidType,
  useAddSubject,
  useDeletePaper,
  useIsAdmin,
  useListPapers,
  useMidTypes,
  useRemoveMidType,
  useRemoveSubject,
  useSubjects,
  useUploadPaper,
  useVisitCount,
} from "@/hooks/useQueries";
import type { QuestionPaper } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  BookOpen,
  FileText,
  LogIn,
  Plus,
  ShieldCheck,
  ShieldX,
  Tag,
  Trash2,
  TrendingUp,
  Upload,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

// ─── Visitor Stats Card ───────────────────────────────────────────────────────

function VisitorStatsCard() {
  const { data: visitCount, isLoading } = useVisitCount();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-gradient-to-br from-primary/8 via-card to-accent/8 border border-border rounded-xl p-5 flex items-center gap-5"
      data-ocid="admin.visitor_stats_card"
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Users className="w-6 h-6 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">
          Total Visitors
        </p>
        {isLoading ? (
          <Skeleton className="h-8 w-20 mt-1" />
        ) : (
          <p
            className="font-display font-bold text-3xl text-foreground tabular-nums"
            data-ocid="admin.visitor_count"
          >
            {visitCount !== undefined ? visitCount.toString() : "0"}
          </p>
        )}
      </div>
      <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground font-body">
        <TrendingUp className="w-3.5 h-3.5 text-primary/60" />
        <span>All time</span>
      </div>
    </motion.div>
  );
}

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

function UploadForm({
  subjects,
  midTypes,
}: { subjects: string[]; midTypes: string[] }) {
  const [form, setForm] = useState({
    year: "",
    subject: "",
    midType: "",
  });
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
            Manage question papers and metadata
          </p>
        </div>
      </motion.div>

      <VisitorStatsCard />

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="bg-muted/50">
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
                {/* Header row */}
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
      </Tabs>
    </div>
  );
}

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
                Your account does not have admin privileges. Contact the site
                owner if you believe this is a mistake.
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
