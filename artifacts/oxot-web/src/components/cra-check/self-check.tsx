import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, RotateCcw, AlertTriangle, Lightbulb, Check, Clock } from "lucide-react";
import { RunwaySvg } from "@/components/cra-check/runway-svg";

// English-only on the platform site; the NL result-copy branches are retained
// but unused (no /api/session consent flow here — the lead form is the gate).
type Locale = "en" | "nl";
import {
  applyCategoryChange,
  classify,
  gaps,
  readinessScore,
  readinessBand,
  scoreBreakdown,
  type CraClass,
  type SelfCheckAnswers,
  type Position,
  type HasDigital,
  type Category,
  type EvidenceItem,
  type Role,
  type PortfolioSize,
  type DeployContext,
  type EvidenceLiving,
  type SelfCheckCopyV2,
} from "@/lib/cra-selfcheck";

interface Option { value: string; label: string; insight?: string }
interface Question { id: string; type: "single" | "bool" | "multi"; label: string; options: Option[] }
interface BandCopy { title: string; note: string }

/**
 * Pre-rendered evidence-viewer embeds for the gap column, keyed by the same
 * EvidenceItem keys `gaps()` returns (sbom/risk/cvd — the three required
 * artifacts). Built server-side by the page and passed in as already-rendered
 * elements (not as raw `copy` + component imports) because two of the three
 * viewers (attestation-panel.tsx) read files off disk at module scope — they
 * are server components by design and must never enter this "use client"
 * file's bundle. This mirrors Next.js's documented "Server Components as
 * props to Client Components" composition pattern.
 */
export interface GapEmbeds {
  sbom?: ReactNode;
  cvd?: ReactNode;
  risk?: ReactNode;
}

export interface SelfCheckCopy {
  title: string;
  intro: string;
  disclaimer: string;
  scarcityNote: string;
  progress: string;
  continue: string;
  insightLabel: string;
  deadlineLabel: string;
  nav: { back: string; restart: string; seeResult: string; selectAll: string };
  encouragement: string[];
  questions: Question[];
  resultTitle: string;
  readiness: { label: string; outOf: string; bands: Record<"on_track" | "behind" | "at_risk", BandCopy> };
  gaps: { label: string; noneLabel: string; none: string; items: Record<string, string> };
  results: Record<string, { headline: string; body: string; route: string }>;
  nowActions: Record<string, string>;
  nowLabel: string;
  manufacturerWarning: string;
  annexNote: string;
  review: {
    title: string;
    body: string;
    bullets: string[];
    reassurance: string;
    form: {
      name: string; namePh: string; email: string; emailPh: string; company: string; companyPh: string;
      role: string; rolePh: string; blocker: string; blockerPh: string; submit: string; submitting: string;
      errName: string; errEmail: string; errGeneric: string; errRate: string;
    };
    success: { heading: string; body: string; scheduleHeading: string; scheduleFallback: string };
  };
  v2: SelfCheckCopyV2;
}

type Scheduling = { provider: "none" | "calcom" | "calendly"; url: string };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEADLINE = Date.UTC(2027, 11, 11); // 11 Dec 2027

const opt =
  "w-full rounded-lg border border-border bg-background px-4 py-3 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
const optSel = "border-primary bg-primary/10 text-foreground ring-1 ring-primary";
const field =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const BAND_COLOR: Record<"on_track" | "behind" | "at_risk", string> = {
  on_track: "text-emerald-600 dark:text-emerald-400",
  behind: "text-amber-600 dark:text-amber-400",
  at_risk: "text-red-600 dark:text-red-400",
};
const BAND_BAR: Record<"on_track" | "behind" | "at_risk", string> = {
  on_track: "bg-emerald-500",
  behind: "bg-amber-500",
  at_risk: "bg-red-500",
};
// Arc stroke per readiness band (semantic; identical in dark/light).
const ARC_HEX: Record<"on_track" | "behind" | "at_risk", string> = {
  on_track: "#2f9e63", behind: "#c9891a", at_risk: "#d8452f",
};
// Class-coloured left accent + eyebrow dot for the classification card.
const CLASS_ACCENT: Record<CraClass, string> = {
  DEFAULT: "border-l-emerald-500", CLASS_I: "border-l-amber-500", CLASS_II: "border-l-orange-500",
  CRITICAL: "border-l-red-500", NEEDS_REVIEW: "border-l-primary", OUT_OF_SCOPE_LIKELY: "border-l-muted-foreground",
};
const CLASS_DOT: Record<CraClass, string> = {
  DEFAULT: "bg-emerald-500", CLASS_I: "bg-amber-500", CLASS_II: "bg-orange-500",
  CRITICAL: "bg-red-500", NEEDS_REVIEW: "bg-primary", OUT_OF_SCOPE_LIKELY: "bg-muted-foreground",
};

/** Animated semicircular readiness gauge (0–100). CSS-transition on the arc's
 *  stroke-dashoffset (no layout thrash → INP-safe); renders the final state
 *  immediately under prefers-reduced-motion. `score` is display-only, unchanged. */
function ReadinessArc({ score, band, label, outOf }: { score: number; band: "on_track" | "behind" | "at_risk"; label: string; outOf: string }) {
  const [off, setOff] = useState(100);
  const reduce = typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => {
    if (reduce) { setOff(100 - score); return; }
    const t = setTimeout(() => setOff(100 - score), 90);
    return () => clearTimeout(t);
  }, [score, reduce]);
  return (
    <svg viewBox="0 0 200 118" className="w-[168px] shrink-0" role="img" aria-label={`${label}: ${score} ${outOf}`}>
      <path d="M16 104 A84 84 0 0 1 184 104" fill="none" stroke="currentColor" strokeOpacity={0.16} className="text-foreground" strokeWidth={13} strokeLinecap="round" pathLength={100} />
      <path d="M16 104 A84 84 0 0 1 184 104" fill="none" stroke={ARC_HEX[band]} strokeWidth={13} strokeLinecap="round" pathLength={100} strokeDasharray={100} strokeDashoffset={off} style={reduce ? undefined : { transition: "stroke-dashoffset 0.9s cubic-bezier(.16,1,.3,1)" }} />
      <text x={100} y={90} textAnchor="middle" className="text-foreground" fill="currentColor" style={{ font: "600 40px/1 var(--font-display)" }}>{score}</text>
      <text x={100} y={108} textAnchor="middle" className="text-muted-foreground" fill="currentColor" style={{ font: "600 9px/1 system-ui", letterSpacing: "1.4px" }}>{outOf.toUpperCase()}</text>
    </svg>
  );
}

// Dynamic step order: role -> portfolioSize -> position -> hasDigital -> category
// -> deployContext (ONLY when category is classII/unsure — the PLC/industrial-or-unsure
// gate) -> becomesManufacturer -> euMarket -> evidence (carries the evidenceLiving row).
export function computeStepIds(category: Category | undefined): string[] {
  const ids = ["role", "portfolioSize", "position", "hasDigital", "category"];
  if (category === "classII" || category === "unsure") ids.push("deployContext");
  ids.push("becomesManufacturer", "euMarket", "evidence");
  return ids;
}

export function CraSelfCheck({
  locale,
  copy,
  initialAnswers,
  openOnCategory,
  gapEmbeds,
}: {
  locale: Locale;
  copy: SelfCheckCopy;
  initialAnswers?: Partial<SelfCheckAnswers>;
  openOnCategory?: boolean;
  /** Optional — omit to render the gap list exactly as before (never-breaking). */
  gapEmbeds?: GapEmbeds;
}) {
  const [answers, setAnswers] = useState<SelfCheckAnswers>(() => (initialAnswers ? { ...initialAnswers } : {}));
  const [step, setStep] = useState(() => {
    if (!openOnCategory) return 0;
    const idx = computeStepIds(initialAnswers?.category).indexOf("category");
    return idx === -1 ? 0 : idx;
  });
  const [phase, setPhase] = useState<"quiz" | "result">("quiz");
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // submission
  const [subState, setSubState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  // Captured at submit so the PDF download stays attributable after the form
  // clears. The gate is this contact info; the endpoint re-requires it.
  const [lead, setLead] = useState<{ name: string; email: string; company: string } | null>(null);
  const [pdfState, setPdfState] = useState<"idle" | "loading" | "error">("idle");
  const [scheduling, setScheduling] = useState<Scheduling | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [topError, setTopError] = useState<string | null>(null);

  useEffect(() => {
    // Client-only so the countdown never causes a hydration mismatch.
    setDaysLeft(Math.max(0, Math.ceil((DEADLINE - Date.now()) / 86_400_000)));
  }, []);

  const stepIds = useMemo(() => computeStepIds(answers.category), [answers.category]);
  const total = stepIds.length;

  // Resolves a step id to renderable question data, whether it comes from the
  // v1 copy.questions array or the v2 copy.v2.* question blocks.
  function questionFor(id: string): { label: string; options: Option[]; type: "single" | "bool" | "multi" } | null {
    if (id === "portfolioSize") return { label: copy.v2.portfolioQuestion.label, options: copy.v2.portfolioQuestion.options, type: "single" };
    if (id === "deployContext") return { label: copy.v2.deployQuestion.label, options: copy.v2.deployQuestion.options, type: "single" };
    const found = copy.questions.find((qq) => qq.id === id);
    return found ? { label: found.label, options: found.options, type: found.type } : null;
  }

  function next() {
    if (step + 1 >= total) {
      setPhase("result");
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setStep(step + 1);
    }
  }

  function setSingle(qid: string, value: string) {
    setAnswers((a) => {
      const nextA = { ...a };
      if (qid === "position") nextA.position = value as Position;
      else if (qid === "hasDigital") nextA.hasDigital = value as HasDigital;
      else if (qid === "category") return applyCategoryChange(nextA, value as Category);
      else if (qid === "becomesManufacturer") nextA.becomesManufacturer = value === "yes";
      else if (qid === "euMarket") nextA.euMarket = value === "yes";
      else if (qid === "portfolioSize") nextA.portfolioSize = value as PortfolioSize;
      else if (qid === "deployContext") nextA.deployContext = value as DeployContext;
      return nextA;
    });
  }

  function toggleMulti(value: EvidenceItem) {
    setAnswers((a) => {
      if (value === "none") {
        const has = (a.evidence ?? []).includes("none");
        return { ...a, evidence: has ? [] : ["none"] };
      }
      const cur = new Set(a.evidence ?? []);
      cur.delete("none");
      if (cur.has(value)) cur.delete(value);
      else cur.add(value);
      return { ...a, evidence: [...cur] };
    });
  }

  function selectedValue(qid: string): string | undefined {
    if (qid === "position") return answers.position;
    if (qid === "hasDigital") return answers.hasDigital;
    if (qid === "category") return answers.category;
    if (qid === "becomesManufacturer")
      return answers.becomesManufacturer === undefined ? undefined : answers.becomesManufacturer ? "yes" : "no";
    if (qid === "euMarket")
      return answers.euMarket === undefined ? undefined : answers.euMarket ? "yes" : "no";
    if (qid === "portfolioSize") return answers.portfolioSize;
    if (qid === "deployContext") return answers.deployContext;
    return undefined;
  }

  function restart() {
    setAnswers({});
    setStep(0);
    setPhase("quiz");
    setSubState("idle");
    setErrors({});
    setTopError(null);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const result = useMemo(() => classify(answers), [answers]);
  const score = useMemo(() => readinessScore(answers), [answers]);
  const band = useMemo(() => readinessBand(answers), [answers]);
  const myGaps = useMemo(() => gaps(answers), [answers]);
  const breakdown = useMemo(() => scoreBreakdown(answers), [answers]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubState("submitting");
    setErrors({});
    setTopError(null);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const fe: Record<string, string> = {};
    if (name.length < 2) fe.name = copy.review.form.errName;
    if (!EMAIL_RE.test(email)) fe.email = copy.review.form.errEmail;
    if (Object.keys(fe).length) { setErrors(fe); setSubState("idle"); return; }

    // The lead form's free-text "role" field (job title) wins when filled in;
    // otherwise fall back to the quiz's structured role pick (answers.role).
    const roleFreeText = String(fd.get("role") ?? "").trim();
    const payload = {
      name,
      email,
      company: String(fd.get("company") ?? ""),
      role: roleFreeText || (answers.role ?? null),
      segment: result.segment,
      source: "cra_selfcheck",
      blocker: String(fd.get("blocker") ?? ""),
      message: `CRA self-check — ${result.craClass}, readiness ${score}/100 (${band}). Gaps: ${myGaps.join(", ") || "none"}.`,
      website: fd.get("website"), // honeypot
      locale,
    };
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setLead({ name, email: String(fd.get("email") ?? ""), company: String(fd.get("company") ?? "") });
        setScheduling(data.scheduling ?? { provider: "none", url: "" });
        setSubState("success");
        return;
      }
      if (res.status === 429) setTopError(copy.review.form.errRate);
      else if (data.errors && typeof data.errors === "object") setErrors(
        Object.fromEntries(Object.entries(data.errors).map(([k]) => [k, k === "email" ? copy.review.form.errEmail : copy.review.form.errName]))
      );
      else setTopError(copy.review.form.errGeneric);
      setSubState("error");
    } catch {
      setTopError(copy.review.form.errGeneric);
      setSubState("error");
    }
  }

  // ---------------- RESULT ----------------
  if (phase === "result") {
    const r = copy.results[result.resultKey];
    const bandCopy = copy.readiness.bands[band];
    const roleKey = answers.role ?? "other";
    // The downloadable artifact of the verdict above. Same data, as a document —
    // delivered as a direct download, never by email (owner requirement).
    const DL = locale === "nl"
      ? { label: "Download uw rapport (PDF)", loading: "PDF wordt gemaakt…", err: "Downloaden mislukte — probeer het opnieuw.", promise: "Na verzenden downloadt u uw resultaat direct als PDF — geen e-mail nodig." }
      : { label: "Download your report (PDF)", loading: "Preparing your PDF…", err: "Download failed — please try again.", promise: "After you submit, download your result immediately as a PDF — no email required." };
    async function downloadPdf() {
      if (!lead) return;
      setPdfState("loading");
      try {
        const res = await fetch("/api/selfcheck/report", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            locale,
            name: lead.name,
            email: lead.email,
            company: lead.company,
            resultTitle: r.headline,
            resultBody: [r.body, r.route].filter(Boolean).join(" "),
            score,
            bandLabel: bandCopy.title,
            gaps: myGaps.map((g) => ({ title: copy.gaps.items[g] ?? String(g), body: "" }))
          })
        });
        if (!res.ok) throw new Error(String(res.status));
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `OXOT-CRA-readiness-${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setPdfState("idle");
      } catch {
        setPdfState("error");
      }
    }
    return (
      <div ref={topRef} className="space-y-4">
        {/* Role-toned header */}
        <p className="px-1 text-sm font-medium leading-relaxed text-foreground">{copy.v2.roleHeaders[roleKey]}</p>

        {/* Readiness gauge — animated arc */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <ReadinessArc score={score} band={band} label={copy.readiness.label} outOf={copy.readiness.outOf} />
            <div className="min-w-0 flex-1 self-stretch">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{copy.readiness.label}</p>
                {daysLeft != null && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {daysLeft.toLocaleString()} {copy.deadlineLabel}
                  </span>
                )}
              </div>
              <p className={`mt-2 text-lg font-semibold ${BAND_COLOR[band]}`}>{bandCopy.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{bandCopy.note}</p>
            </div>
          </div>
        </div>

        {/* Itemised score deltas */}
        {breakdown.deltas.length > 0 && (
          <ul className="flex flex-wrap gap-2 px-1">
            {breakdown.deltas.map((d) => (
              <li
                key={d.key}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  d.points >= 0
                    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
                    : "border-destructive/30 bg-destructive/5 text-destructive"
                }`}
              >
                {copy.v2.deltaLabels[d.key] ?? d.key}
              </li>
            ))}
          </ul>
        )}

        {/* Classification readout */}
        <div className={`rounded-xl border border-l-4 border-border ${CLASS_ACCENT[result.craClass]} bg-card p-5 shadow-sm`}>
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span className={`h-2 w-2 shrink-0 rounded-full ${CLASS_DOT[result.craClass]}`} aria-hidden="true" />
            {copy.resultTitle}
          </p>
          <h3 className="mt-2 text-2xl font-semibold leading-tight text-foreground [font-family:var(--font-display)]">{r.headline}</h3>
          {result.becomesManufacturerFlag && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-xs text-foreground">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <span>{copy.manufacturerWarning}</span>
            </div>
          )}
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
          <p className="mt-3 text-sm font-medium text-foreground">{r.route}</p>
          <div className="mt-3 rounded-lg border border-border bg-background p-3 text-sm">
            <span className="font-semibold text-primary">{copy.nowLabel}: </span>
            <span className="text-foreground">{copy.nowActions[result.nowActionKey]}</span>
          </div>
        </div>

        {/* Gaps */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {myGaps.length ? copy.gaps.label : copy.gaps.noneLabel}
          </p>
          {/* CISO dialect: lead with the Annex I evidence bar before the gap list. */}
          {roleKey === "ciso" && <p className="mt-2 text-xs text-muted-foreground">{copy.annexNote}</p>}
          {myGaps.length === 0 ? (
            <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {copy.gaps.none}
            </p>
          ) : (
            <ul className="mt-2 space-y-3">
              {myGaps.map((g) => {
                const closure = copy.v2.gapClosure[g];
                // Proof at the moment of gap: an inline evidence-viewer teaser under
                // the gapClosure one-liner, only for gaps the visitor actually has.
                const embed = gapEmbeds?.[g as keyof GapEmbeds];
                return (
                  <li key={g} className="text-sm text-foreground">
                    <div className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                      <span>{copy.gaps.items[g]}</span>
                    </div>
                    {closure && (
                      <a
                        href={closure.href}
                        className="mt-2 ml-3.5 block rounded-lg border border-border bg-background p-3 text-xs leading-relaxed transition-colors hover:border-primary hover:bg-primary/5"
                      >
                        <span className="font-semibold text-primary">{closure.title}</span>
                        <span className="mt-1 block text-muted-foreground">{closure.body}</span>
                      </a>
                    )}
                    {embed && <div className="mt-2 ml-3.5">{embed}</div>}
                  </li>
                );
              })}
            </ul>
          )}
          {/* Engineering dialect: reinforce the backlog framing after the gap list. */}
          {roleKey === "engineering" && (
            <p className="mt-3 text-sm font-medium text-foreground">{copy.v2.roleHeaders.engineering}</p>
          )}
          {roleKey !== "ciso" && <p className="mt-3 text-xs text-muted-foreground">{copy.annexNote}</p>}
          {answers.evidenceLiving && (
            <p className="mt-3 text-xs text-muted-foreground">{copy.v2.evidenceLivingClose[answers.evidenceLiving]}</p>
          )}
        </div>

        {/* Runway: can the portfolio make the wall? */}
        {answers.portfolioSize && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground">{copy.v2.runway.title}</h3>
            <div className="mt-3">
              <RunwaySvg portfolioSize={answers.portfolioSize} copy={copy.v2.runway} now={new Date()} />
            </div>
          </div>
        )}

        {/* S7-1500 callout — only when deployment context upgraded the classification */}
        {result.classIIFlag && (
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-foreground">{copy.v2.s7Callout.text}</p>
            <p className="mt-1 text-xs text-muted-foreground">{copy.v2.s7Callout.source}</p>
          </div>
        )}

        {/* Reporting-clock strip, directly above the review form */}
        <p className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          {copy.v2.reportingClock}
        </p>

        {/* Submission / review */}
        {subState === "success" ? (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-5">
            <h3 className="text-lg font-semibold text-foreground">{copy.review.success.heading}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy.review.success.body}</p>
            <button
              type="button"
              onClick={downloadPdf}
              disabled={pdfState === "loading"}
              className="cta-lift mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium !text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60"
            >
              {pdfState === "loading" ? DL.loading : DL.label}
            </button>
            {pdfState === "error" ? <p className="mt-2 text-xs text-destructive">{DL.err}</p> : null}
            {scheduling && scheduling.provider !== "none" && scheduling.url ? (
              <div className="mt-4">
                <p className="text-sm font-medium text-foreground">{copy.review.success.scheduleHeading}</p>
                <iframe src={scheduling.url} title={copy.review.success.scheduleHeading} className="mt-2 h-[560px] w-full rounded-lg border border-border" />
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">{copy.review.success.scheduleFallback}</p>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground">{copy.review.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy.review.body}</p>
            <p className="mt-2 text-xs font-medium text-primary-ink">{DL.promise}</p>
            <ul className="mt-3 space-y-1.5">
              {copy.review.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {b}
                </li>
              ))}
            </ul>
            <form onSubmit={onSubmit} className="mt-5 space-y-3" noValidate>
              {topError && <div className="rounded-lg border border-orange-500/50 bg-orange-500/10 p-3 text-sm">{topError}</div>}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <input name="name" className={field} placeholder={copy.review.form.namePh} aria-label={copy.review.form.name} autoComplete="name" />
                  {errors.name && <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">{errors.name}</p>}
                </div>
                <div>
                  <input name="email" type="email" className={field} placeholder={copy.review.form.emailPh} aria-label={copy.review.form.email} autoComplete="email" />
                  {errors.email && <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">{errors.email}</p>}
                </div>
                <input name="company" className={field} placeholder={copy.review.form.companyPh} aria-label={copy.review.form.company} autoComplete="organization" />
                <input name="role" className={field} placeholder={copy.review.form.rolePh} aria-label={copy.review.form.role} autoComplete="organization-title" />
              </div>
              <textarea name="blocker" rows={2} className={field} placeholder={copy.review.form.blockerPh} aria-label={copy.review.form.blocker} />
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <input name="website" tabIndex={-1} autoComplete="off" />
              </div>
              <Button type="submit" size="lg" disabled={subState === "submitting"} className="w-full">
                {subState === "submitting" ? copy.review.form.submitting : copy.review.form.submit}
                {subState !== "submitting" && <ArrowRight />}
              </Button>
              <p className="text-center text-xs text-muted-foreground">{copy.review.reassurance}</p>
              <p className="text-center text-xs text-muted-foreground">{copy.v2.programmeStrip}</p>
            </form>
          </div>
        )}

        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] text-muted-foreground">{copy.disclaimer}</p>
          <button type="button" onClick={restart} className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <RotateCcw className="h-3 w-3" /> {copy.nav.restart}
          </button>
        </div>
      </div>
    );
  }

  // ---------------- QUIZ ----------------
  const stepId = stepIds[step];
  const pct = Math.round((step / total) * 100);
  const progressHeader = (
    <>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">
          {copy.progress.replace("{n}", String(step + 1)).replace("{total}", String(total))}
        </span>
        <span className="text-primary">{copy.encouragement[Math.min(step, copy.encouragement.length - 1)]}</span>
      </div>
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
    </>
  );
  const backButton = (
    <button type="button" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40">
      <ArrowLeft className="h-3 w-3" /> {copy.nav.back}
    </button>
  );

  // Role: one-tap chips, advances immediately on click — no separate Continue.
  if (stepId === "role") {
    return (
      <div ref={topRef} className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        {progressHeader}
        <h2 className="text-base font-semibold text-foreground">{copy.v2.roleQuestion.label}</h2>
        <div role="radiogroup" aria-label={copy.v2.roleQuestion.label} className="mt-4 grid gap-2 sm:grid-cols-2">
          {copy.v2.roleQuestion.options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={answers.role === o.value}
              onClick={() => {
                setAnswers((a) => ({ ...a, role: o.value as Role }));
                next();
              }}
              className={`${opt} ${answers.role === o.value ? optSel : ""}`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between">
          {backButton}
          <span aria-hidden="true" />
        </div>
      </div>
    );
  }

  const qd = questionFor(stepId)!;
  const selected = selectedValue(stepId);
  const selectedOpt = qd.options.find((o) => o.value === selected);
  const evidence = answers.evidence ?? [];

  return (
    <div ref={topRef} className="rounded-xl border border-border bg-card p-6 shadow-sm">
      {progressHeader}

      <h2 className="text-base font-semibold text-foreground">{qd.label}</h2>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {qd.type === "multi"
          ? qd.options.map((o) => {
              const on = evidence.includes(o.value as EvidenceItem);
              return (
                <button key={o.value} type="button" onClick={() => toggleMulti(o.value as EvidenceItem)}
                  className={`${opt} ${on ? optSel : ""} flex items-center gap-3`} aria-pressed={on}>
                  <span className={`grid h-4 w-4 shrink-0 place-items-center rounded border text-[10px] ${on ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                    {on ? "✓" : ""}
                  </span>
                  {o.label}
                </button>
              );
            })
          : qd.options.map((o) => (
              <button key={o.value} type="button" onClick={() => setSingle(stepId, o.value)}
                className={`${opt} ${selected === o.value ? optSel : ""}`}>
                {o.label}
              </button>
            ))}
      </div>

      {/* Evidence-living: single-choice row appended to the evidence screen (no new step) */}
      {stepId === "evidence" && (
        <div className="mt-5 border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-foreground">{copy.v2.evidenceLivingQuestion.label}</h3>
          <div role="radiogroup" aria-label={copy.v2.evidenceLivingQuestion.label} className="mt-3 grid gap-2 sm:grid-cols-3">
            {copy.v2.evidenceLivingQuestion.options.map((o) => (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={answers.evidenceLiving === o.value}
                onClick={() => setAnswers((a) => ({ ...a, evidenceLiving: o.value as EvidenceLiving }))}
                className={`${opt} ${answers.evidenceLiving === o.value ? optSel : ""}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Per-answer grounded reframe */}
      {qd.type !== "multi" && selectedOpt?.insight && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs leading-relaxed text-foreground">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span><span className="font-semibold text-primary">{copy.insightLabel}: </span>{selectedOpt.insight}</span>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between">
        {backButton}
        {qd.type === "multi" ? (
          <Button type="button" onClick={next}>{copy.nav.seeResult}<ArrowRight /></Button>
        ) : (
          <Button type="button" onClick={next} disabled={selected === undefined}>
            {step + 1 >= total ? copy.nav.seeResult : copy.continue}
            <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  );
}
