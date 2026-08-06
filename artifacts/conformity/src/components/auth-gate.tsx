import { useState, useEffect, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetAdminSession, useAdminLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ArrowLeft, Lock, ShieldCheck, Boxes, FileCheck2, AlertOctagon } from "lucide-react";

const HIGHLIGHTS = [
  { icon: Boxes, title: "Assess every product", body: "Guided CRA conformity from scope to Declaration of Conformity." },
  { icon: AlertOctagon, title: "Handle vulnerabilities", body: "Article 14 clocks, CISA KEV correlation, ENISA reporting." },
  { icon: FileCheck2, title: "Produce the evidence", body: "Executive reports and technical files, generated and sealed." },
];

export function AuthGate({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const { data: session, isLoading } = useGetAdminSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const login = useAdminLogin({ mutation: { onSuccess: () => qc.invalidateQueries() } });

  // Lock body scroll while the full-screen sign-in overlay is shown so the
  // workbench shell behind it can't peek through on short viewports.
  const gated = !isLoading && !session?.authenticated;
  useEffect(() => {
    if (!gated) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [gated]);

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background p-8">
        <Skeleton className="h-96 w-full max-w-sm rounded-2xl" />
      </div>
    );
  }

  if (session?.authenticated) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto w-full lg:grid lg:grid-cols-[1.1fr_1fr] bg-background text-foreground">
      {/* ── Brand panel — fixed navy in both themes (styleguide §2.4) ───────── */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 xl:p-16 text-white bg-[#0F1F2E]">
        {/* engineering grid + orange glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #8ea3bd22 1px, transparent 1px), linear-gradient(to bottom, #8ea3bd22 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 80% 60% at 30% 20%, #000 60%, transparent 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-24 w-[520px] h-[520px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(28 100% 53% / 0.22), transparent 70%)" }}
        />

        <div className="relative z-10">
          <a
            href="/"
            aria-label="OXOT — home"
            className="inline-flex items-center gap-2 select-none no-underline"
          >
            <span className="font-sans text-[15px] font-semibold tracking-[0.28em]">
              O<span className="text-primary">X</span>OT
            </span>
            <span className="text-[10px] font-sans font-semibold tracking-widest text-white/50 uppercase border-l border-white/20 pl-2">
              Conformity
            </span>
          </a>
        </div>

        <div className="relative z-10 max-w-lg">
          <span className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-[0.18em] text-primary mb-5">
            <span className="inline-block w-6 h-px bg-primary" />
            EU Cyber Resilience Act · Regulation 2024/2847
          </span>
          <h1 className="font-serif text-4xl xl:text-5xl font-normal leading-[1.08] tracking-tight text-balance">
            The conformity execution layer for products with digital elements.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-white/70">
            One evidence system across CRA, NIS2, IEC 62443 and the AI Act — so your teams prove
            compliance instead of chasing it.
          </p>

          <ul className="mt-10 space-y-5">
            {HIGHLIGHTS.map((h) => (
              <li key={h.title} className="flex items-start gap-3.5">
                <span className="mt-0.5 grid place-items-center w-9 h-9 rounded-lg bg-primary/15 text-primary shrink-0">
                  <h.icon className="w-4.5 h-4.5" />
                </span>
                <div>
                  <div className="font-medium text-white leading-snug">{h.title}</div>
                  <div className="text-sm text-white/60 leading-relaxed">{h.body}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 font-serif text-sm text-white/50">
          Operational e<span className="text-primary">X</span>cellence in Operational Technology
        </div>
      </aside>

      {/* ── Sign-in panel ──────────────────────────────────────────────────── */}
      <main className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="w-full max-w-sm mx-auto">
          {/* wordmark on mobile only (brand panel is hidden there) */}
          <a
            href="/"
            aria-label="OXOT — home"
            className="lg:hidden inline-flex items-center gap-2 select-none no-underline mb-10"
          >
            <span className="font-sans text-[15px] font-semibold tracking-[0.28em] text-foreground">
              O<span className="text-primary">X</span>OT
            </span>
            <span className="text-[10px] font-sans font-semibold tracking-widest text-muted-foreground uppercase border-l border-border pl-2">
              Conformity
            </span>
          </a>

          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-3">
            <ShieldCheck className="w-4 h-4 text-primary" /> Secure workbench access
          </div>
          <h2 className="font-serif text-3xl font-normal tracking-tight text-foreground">
            Sign in to the Workbench
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            The conformity execution layer is restricted to authorized accounts.
          </p>

          <form
            className="mt-8 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              login.mutate({ data: { username, password } });
            }}
          >
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-sm font-medium text-foreground">
                Username
              </label>
              <Input
                id="username"
                className="rounded-lg h-11"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                placeholder="you@organisation"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                id="password"
                type="password"
                className="rounded-lg h-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••••"
              />
            </div>

            {login.isError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
                <AlertOctagon className="w-4 h-4 shrink-0" />
                Those credentials were not accepted. Please try again.
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full h-11 rounded-lg gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm cta-lift"
              disabled={login.isPending || !username || !password}
            >
              {login.isPending ? (
                "Signing in…"
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <a
            href="/"
            className="mt-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to oxot.ai
          </a>
        </div>
      </main>
    </div>
  );
}
