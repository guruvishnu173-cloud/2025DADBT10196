import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import { useAddLike, useLikeCount } from "@/hooks/useQueries";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { BookOpen, Heart, ShieldCheck } from "lucide-react";

export default function Layout() {
  const location = useLocation();
  const isAdmin = location.pathname === "/admin";
  const { data: likeCount } = useLikeCount();
  const { mutate: addLike, isPending: liking } = useAddLike();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-xs sticky top-0 z-50">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            data-ocid="nav.home_link"
          >
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-xs group-hover:bg-primary/90 transition-smooth">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground tracking-tight">
              VVITU@2025DADBT1018x
            </span>
          </Link>

          {/* Right cluster — logo on top, portals below */}
          <div className="flex flex-col items-end gap-1.5">
            {/* VVIT University logo */}
            <img
              src="/assets/images/vvit_university_guntur.jpg"
              alt="VVIT University Guntur"
              className="h-28 w-auto object-contain rounded"
              data-ocid="header.university_logo"
            />

            {/* Portals row below logo */}
            <div className="flex items-center gap-2">
              {/* Like button */}
              <button
                type="button"
                onClick={() => addLike()}
                disabled={liking}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-body hover:bg-rose-100 hover:text-rose-600 transition-smooth disabled:opacity-60 cursor-pointer select-none"
                data-ocid="header.like_button"
                title="Like this website"
                aria-label="Like this website"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span className="font-medium tabular-nums">
                  {likeCount !== undefined ? likeCount.toString() : "—"}
                </span>
              </button>

              {/* Admin link */}
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-body font-medium transition-smooth ${
                  isAdmin
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                data-ocid="nav.admin_link"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Active route indicator strip */}
        <div className="h-0.5 bg-gradient-to-r from-primary via-primary/60 to-transparent w-1/3" />
      </header>

      {/* Sub-nav breadcrumb for admin */}
      {isAdmin && (
        <div className="bg-muted/40 border-b border-border">
          <div className="container mx-auto px-4 h-9 flex items-center gap-2">
            <Link
              to="/"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              data-ocid="breadcrumb.home_link"
            >
              Home
            </Link>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs font-medium text-foreground flex items-center gap-1">
              <Badge
                variant="outline"
                className="text-xs py-0 px-1.5 border-accent text-accent-foreground font-medium"
              >
                Admin Panel
              </Badge>
            </span>
          </div>
        </div>
      )}

      {/* Page content */}
      <main className="flex-1 bg-background">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground font-body">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-primary/60" />
            <span>
              VVITU@2025DADBT1018x &copy; {new Date().getFullYear()}. Built with
              love using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </span>
          </div>
          <span className="text-xs opacity-60">
            Question paper archive for students
          </span>
        </div>
      </footer>

      <Toaster position="top-right" richColors />
    </div>
  );
}
