export type Locale = "en" | "nl";

/**
 * The wizard's result, as the client sends it for PDF export.
 *
 * The client resolves all copy (result title, band label, gap text) before
 * sending, so the endpoint stays dumb: it validates, clamps and renders —
 * it never needs the copy tables. The gate is contact info: the download
 * button only appears after the intake form succeeded, and the endpoint
 * re-requires name + email so the artifact is always attributable.
 */
export interface ReportPayload {
  locale: Locale;
  name: string;
  email: string;
  company: string | null;
  resultTitle: string;
  resultBody: string;
  score: number;
  bandLabel: string;
  gaps: { title: string; body: string }[];
  /** Honeypot — bots fill it, humans never see it. */
  website?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clamp = (v: unknown, max: number): string =>
  String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

export type ReportValidation =
  | { ok: true; data: ReportPayload }
  | { ok: false; spam?: true; errors?: Record<string, string> };

export function validateReportPayload(body: unknown): ReportValidation {
  const b = (body ?? {}) as Record<string, unknown>;

  // Honeypot: pretend success upstream, render nothing.
  if (clamp(b.website, 200)) return { ok: false, spam: true };

  const errors: Record<string, string> = {};
  const name = clamp(b.name, 120);
  const email = clamp(b.email, 200);
  if (name.length < 2) errors.name = "name";
  if (!EMAIL_RE.test(email)) errors.email = "email";

  const resultTitle = clamp(b.resultTitle, 200);
  const resultBody = clamp(b.resultBody, 2000);
  if (!resultTitle) errors.resultTitle = "required";

  const rawScore = Number(b.score);
  const score = Number.isFinite(rawScore) ? Math.max(0, Math.min(100, Math.round(rawScore))) : NaN;
  if (Number.isNaN(score)) errors.score = "required";

  const locale: Locale = b.locale === "nl" ? "nl" : "en";

  const gaps = (Array.isArray(b.gaps) ? b.gaps : [])
    .slice(0, 12)
    .map((g) => {
      const it = (g ?? {}) as Record<string, unknown>;
      return { title: clamp(it.title, 200), body: clamp(it.body, 800) };
    })
    .filter((g) => g.title);

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    data: {
      locale,
      name,
      email,
      company: clamp(b.company, 200) || null,
      resultTitle,
      resultBody,
      score,
      bandLabel: clamp(b.bandLabel, 100),
      gaps
    }
  };
}
