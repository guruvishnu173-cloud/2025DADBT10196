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
import {
  useListPapers,
  useMidTypes,
  useNote,
  useSubjects,
} from "@/hooks/useQueries";
import type { PaperFilter, QuestionPaper } from "@/types";
import {
  BookOpen,
  Calendar,
  Download,
  Eye,
  FileSearch,
  FileText,
  Info,
  Search,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(timestamp: bigint): string {
  // Backend timestamps in nanoseconds → convert to ms
  const ms = Number(timestamp / 1_000_000n);
  if (ms === 0) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(ms));
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
      {/* Icon + header */}
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

      {/* Upload date */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-body">
        <Calendar className="w-3 h-3" />
        <span>Uploaded: {formatDate(paper.uploadTimestamp)}</span>
      </div>

      {/* Actions */}
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
  // Draft state (what the user is editing)
  const [draft, setDraft] = useState<{
    year: string;
    subject: string;
    midType: string;
  }>({ year: "", subject: "", midType: "" });

  // Committed filter — null until first "Find Papers" click
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
              {/* Year */}
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

              {/* Subject */}
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

              {/* Mid type */}
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

            {/* Action row */}
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

      {/* Results */}
      <section
        className="container mx-auto px-4 py-8"
        data-ocid="papers.section"
      >
        {/* Site-wide note — shown only when present */}
        {siteNote && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
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

        {!hasSearched ? (
          /* Pre-search prompt */
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
          /* Loading skeleton */
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            data-ocid="papers.loading_state"
          >
            {Array.from({ length: 8 }, (_, i) => `skel-${i}`).map((key) => (
              <PaperCardSkeleton key={key} />
            ))}
          </div>
        ) : papers.length === 0 ? (
          /* Empty state */
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
          /* Results grid */
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
