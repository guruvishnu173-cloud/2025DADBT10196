import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import { useAddLike, useLikeCount } from "@/hooks/useQueries";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { BookOpen, Heart, ShieldCheck } from "lucide-react";
import { Suspense, lazy } from "react";

const FloatingParticles = lazy(() => import("./FloatingParticles"));

export default function Layout() {
  const location = useLocation();
  const isAdmin = location.pathname === "/admin";
  const { data: likeCount } = useLikeCount();
  const { mutate: addLike, isPending: liking } = useAddLike();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.18 0.01 55) 0%, oklch(0.22 0.012 50) 50%, oklch(0.2 0.008 55) 100%)",
      }}
    >
      {/* ── Header ── floating glass card */}
      <header
        className="sticky top-0 z-50 transition-dimensional"
        style={{
          background: "oklch(0.24 0.01 55 / 0.82)",
          backdropFilter: "blur(18px) saturate(160%)",
          WebkitBackdropFilter: "blur(18px) saturate(160%)",
          borderBottom: "1px solid oklch(0.76 0.16 45 / 0.18)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.4), 0 -2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px oklch(0.76 0.16 45 / 0.06)",
        }}
      >
        <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group relative"
            data-ocid="nav.home_link"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-dimensional group-hover:scale-110"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.76 0.16 45) 0%, oklch(0.68 0.18 40) 100%)",
                boxShadow:
                  "0 4px 16px oklch(0.76 0.16 45 / 0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              <BookOpen className="w-5 h-5 text-primary-foreground drop-shadow-sm" />
            </div>
            <span
              className="font-display font-bold text-xl tracking-tight"
              style={{
                color: "oklch(0.94 0.008 55)",
                textShadow: "0 2px 8px rgba(0,0,0,0.4)",
              }}
            >
              VVITU@2025DADBT1018x
            </span>
            {/* Subtle glow line under brand on hover */}
            <span
              className="absolute -bottom-1 left-0 h-0.5 w-0 group-hover:w-full transition-dimensional rounded-full"
              style={{ background: "oklch(0.76 0.16 45 / 0.6)" }}
            />
          </Link>

          {/* Right cluster — logo on top, portals below */}
          <div className="flex flex-col items-end gap-1.5">
            {/* VVIT University logo — float-subtle */}
            <img
              src="/assets/images/vvit_university_guntur.jpg"
              alt="VVIT University Guntur"
              className="h-28 w-auto object-contain rounded float-subtle"
              style={{
                filter:
                  "drop-shadow(0 8px 24px oklch(0.76 0.16 45 / 0.35)) drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
              }}
              data-ocid="header.university_logo"
            />

            {/* Portals row below logo */}
            <div className="flex items-center gap-2">
              {/* Like button — glow-accent on hover */}
              <button
                type="button"
                onClick={() => addLike()}
                disabled={liking}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-body transition-dimensional disabled:opacity-60 cursor-pointer select-none group/like"
                style={{
                  background: "oklch(0.3 0.012 55 / 0.7)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid oklch(0.76 0.16 45 / 0.2)",
                  color: "oklch(0.72 0.01 55)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 0 20px oklch(0.8 0.17 42 / 0.5), 0 0 40px oklch(0.8 0.17 42 / 0.2)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "oklch(0.8 0.17 42 / 0.6)";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "oklch(0.88 0.15 42)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "none";
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "oklch(0.76 0.16 45 / 0.2)";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "oklch(0.72 0.01 55)";
                }}
                data-ocid="header.like_button"
                title="Like this website"
                aria-label="Like this website"
              >
                <Heart className="w-3.5 h-3.5 fill-current transition-dimensional group-hover/like:scale-125" />
                <span className="font-medium tabular-nums">
                  {likeCount !== undefined ? likeCount.toString() : "—"}
                </span>
              </button>

              {/* Admin link — glass-base styling */}
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-body font-medium transition-dimensional"
                style={
                  isAdmin
                    ? {
                        background:
                          "linear-gradient(135deg, oklch(0.76 0.16 45) 0%, oklch(0.68 0.18 40) 100%)",
                        color: "oklch(0.18 0.008 45)",
                        boxShadow: "0 0 16px oklch(0.76 0.16 45 / 0.4)",
                        border: "1px solid oklch(0.76 0.16 45 / 0.5)",
                      }
                    : {
                        background: "oklch(0.3 0.012 55 / 0.5)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid oklch(0.76 0.16 45 / 0.15)",
                        color: "oklch(0.64 0.01 55)",
                      }
                }
                onMouseEnter={(e) => {
                  if (!isAdmin) {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.borderColor = "oklch(0.76 0.16 45 / 0.45)";
                    el.style.color = "oklch(0.88 0.008 55)";
                    el.style.boxShadow = "0 0 12px oklch(0.76 0.16 45 / 0.25)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isAdmin) {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.borderColor = "oklch(0.76 0.16 45 / 0.15)";
                    el.style.color = "oklch(0.64 0.01 55)";
                    el.style.boxShadow = "none";
                  }
                }}
                data-ocid="nav.admin_link"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Orange glow strip */}
        <div
          className="h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, oklch(0.76 0.16 45 / 0.7) 30%, oklch(0.8 0.17 42 / 0.9) 50%, oklch(0.76 0.16 45 / 0.7) 70%, transparent 100%)",
            boxShadow: "0 0 12px oklch(0.76 0.16 45 / 0.5)",
          }}
        />
      </header>

      {/* Sub-nav breadcrumb for admin */}
      {isAdmin && (
        <div
          className="border-b"
          style={{
            background: "oklch(0.21 0.01 55 / 0.9)",
            backdropFilter: "blur(12px)",
            borderColor: "oklch(0.76 0.16 45 / 0.12)",
          }}
        >
          <div className="container mx-auto px-4 h-9 flex items-center gap-2">
            <Link
              to="/"
              className="text-xs transition-dimensional"
              style={{ color: "oklch(0.55 0.01 55)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "oklch(0.76 0.16 45)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "oklch(0.55 0.01 55)";
              }}
              data-ocid="breadcrumb.home_link"
            >
              Home
            </Link>
            <span className="text-xs" style={{ color: "oklch(0.4 0.01 55)" }}>
              /
            </span>
            <span
              className="text-xs font-medium flex items-center gap-1"
              style={{ color: "oklch(0.88 0.008 55)" }}
            >
              <Badge
                variant="outline"
                className="text-xs py-0 px-1.5 font-medium"
                style={{
                  borderColor: "oklch(0.76 0.16 45 / 0.5)",
                  color: "oklch(0.8 0.16 45)",
                  background: "oklch(0.76 0.16 45 / 0.1)",
                  boxShadow: "0 0 8px oklch(0.76 0.16 45 / 0.2)",
                }}
              >
                Admin Panel
              </Badge>
            </span>
          </div>
        </div>
      )}

      {/* Hero strip — Three.js particle background */}
      {!isAdmin && (
        <div
          className="relative overflow-hidden"
          style={{
            minHeight: "220px",
            background:
              "linear-gradient(180deg, oklch(0.19 0.012 50) 0%, oklch(0.22 0.01 55) 100%)",
            borderBottom: "1px solid oklch(0.76 0.16 45 / 0.12)",
          }}
        >
          {/* Three.js particles — lazy loaded */}
          <Suspense fallback={null}>
            <FloatingParticles />
          </Suspense>

          {/* Radial orange glow behind heading */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 70% at 50% 40%, oklch(0.76 0.16 45 / 0.12) 0%, transparent 70%)",
              zIndex: 1,
            }}
          />

          {/* Layered depth planes */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 1 }}
          >
            {/* Back plane */}
            <div
              className="absolute"
              style={{
                bottom: "8%",
                left: "4%",
                width: "28%",
                height: "2px",
                background:
                  "linear-gradient(90deg, transparent, oklch(0.76 0.16 45 / 0.3), transparent)",
                transform: "perspective(600px) rotateX(60deg)",
              }}
            />
            {/* Mid plane */}
            <div
              className="absolute"
              style={{
                bottom: "18%",
                right: "6%",
                width: "22%",
                height: "2px",
                background:
                  "linear-gradient(90deg, transparent, oklch(0.8 0.17 42 / 0.25), transparent)",
                transform: "perspective(600px) rotateX(60deg)",
              }}
            />
          </div>

          {/* Hero text content */}
          <div
            className="relative flex flex-col items-center justify-center py-12 px-4 text-center"
            style={{ zIndex: 2 }}
          >
            <div
              className="perspective-rotate"
              style={{ perspective: "1200px" }}
            >
              <h1
                className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight mb-3 float-subtle"
                style={{
                  color: "oklch(0.95 0.008 55)",
                  textShadow:
                    "0 4px 24px rgba(0,0,0,0.6), 0 0 60px oklch(0.76 0.16 45 / 0.2)",
                  transform: "translateZ(0)",
                }}
              >
                Access the{" "}
                <span
                  style={{
                    color: "oklch(0.76 0.16 45)",
                    textShadow:
                      "0 0 30px oklch(0.76 0.16 45 / 0.5), 0 4px 24px rgba(0,0,0,0.4)",
                  }}
                >
                  Past
                </span>
                .
              </h1>
            </div>
            <p
              className="font-body text-base sm:text-lg max-w-lg opacity-75 mb-1"
              style={{ color: "oklch(0.82 0.008 55)" }}
            >
              VVITU Question Paper Archive — helping juniors prepare smarter.
            </p>
            <div
              className="mt-4 h-0.5 w-24 mx-auto rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, oklch(0.76 0.16 45 / 0.8), transparent)",
                boxShadow: "0 0 8px oklch(0.76 0.16 45 / 0.5)",
              }}
            />
          </div>

          {/* Bottom fade */}
          <div
            className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
            style={{
              background:
                "linear-gradient(0deg, oklch(0.22 0.01 55) 0%, transparent 100%)",
              zIndex: 3,
            }}
          />
        </div>
      )}

      {/* Page content */}
      <main className="flex-1" style={{ background: "oklch(0.22 0.01 55)" }}>
        <Outlet />
      </main>

      {/* Footer — glass-base card */}
      <footer
        className="mt-auto"
        style={{
          background: "oklch(0.19 0.01 55 / 0.95)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid oklch(0.76 0.16 45 / 0.15)",
          boxShadow:
            "0 -8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <div
          className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm font-body"
          style={{ color: "oklch(0.5 0.01 55)" }}
        >
          <div className="flex items-center gap-1.5">
            <BookOpen
              className="w-3.5 h-3.5"
              style={{ color: "oklch(0.76 0.16 45 / 0.7)" }}
            />
            <span>
              VVITU@2025DADBT1018x &copy; {new Date().getFullYear()}. Built with
              love using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-dimensional"
                style={{ color: "oklch(0.76 0.16 45)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.textShadow =
                    "0 0 12px oklch(0.76 0.16 45 / 0.6)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.textShadow =
                    "none";
                }}
              >
                caffeine.ai
              </a>
            </span>
          </div>
          <span className="text-xs" style={{ color: "oklch(0.4 0.01 55)" }}>
            Question paper archive for students
          </span>
        </div>
      </footer>

      <Toaster position="top-right" richColors />
    </div>
  );
}
