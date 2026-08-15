/**
 * Article 13 retention clocks.
 *
 * Three distinct duties, each "10 years or the support period, whichever is
 * longer" — but they do NOT share a start date, so they cannot share a field:
 *
 *   Art. 13(9)   each security update "remains available after it has been
 *                issued for a minimum of 10 years or for the remainder of the
 *                support period, whichever is longer"
 *                  -> anchored on THAT UPDATE'S issue date.
 *
 *   Art. 13(13)  technical documentation and the EU declaration of conformity
 *                kept at the disposal of market surveillance authorities "for at
 *                least 10 years after the product with digital elements has been
 *                placed on the market or for the support period, whichever is
 *                longer"
 *                  -> anchored on placing on the market.
 *
 *   Art. 13(18)  Annex II information and instructions to the user, same rule
 *                and same anchor as 13(13) — but kept at the disposal of "users
 *                and market surveillance authorities", not authorities alone,
 *                and where provided online it must stay "accessible,
 *                user-friendly and available online" for that same duration.
 *
 * The plan originally described this as one clock on Art. 13(12). Art. 13(12) is
 * about drawing up the technical documentation, carrying out the conformity
 * assessment, drawing up the DoC and affixing the CE marking — not retention.
 */

export type RetentionBasis = "ten_years" | "support_period" | "unknown";

export interface RetentionResult {
  /** ISO date the duty runs until, or null when it cannot yet be computed. */
  until: string | null;
  /** Which limb of "whichever is longer" decided the date. */
  basis: RetentionBasis;
  citation: string;
  /** What must be kept, in the regulation's own terms. */
  subject: string;
  anchorDescription: string;
  message: string;
}

const TEN_YEARS = 10;

function addYears(iso: string, years: number): string | null {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  d.setUTCFullYear(d.getUTCFullYear() + years);
  return d.toISOString().slice(0, 10);
}

function laterOf(a: string | null, b: string | null): { date: string | null; basis: RetentionBasis } {
  if (a && b) return a >= b ? { date: a, basis: "ten_years" } : { date: b, basis: "support_period" };
  if (a) return { date: a, basis: "ten_years" };
  if (b) return { date: b, basis: "support_period" };
  return { date: null, basis: "unknown" };
}

function compute(opts: {
  anchorIso: string | null | undefined;
  supportPeriodEnd: string | null | undefined;
  citation: string;
  subject: string;
  anchorDescription: string;
}): RetentionResult {
  const { anchorIso, supportPeriodEnd, citation, subject, anchorDescription } = opts;
  if (!anchorIso) {
    return {
      until: null,
      basis: "unknown",
      citation,
      subject,
      anchorDescription,
      message: `Cannot compute the retention date: ${anchorDescription} is not recorded.`,
    };
  }
  const tenYears = addYears(anchorIso, TEN_YEARS);
  if (!tenYears) {
    return {
      until: null,
      basis: "unknown",
      citation,
      subject,
      anchorDescription,
      message: `Cannot compute the retention date: ${anchorDescription} is not a valid date.`,
    };
  }
  const { date, basis } = laterOf(tenYears, supportPeriodEnd ?? null);
  return {
    until: date,
    basis,
    citation,
    subject,
    anchorDescription,
    message:
      basis === "support_period"
        ? `${subject} must be kept until ${date}, which is the end of the support period — longer than 10 years from ${anchorDescription} (${tenYears}).`
        : `${subject} must be kept until ${date}, being 10 years from ${anchorDescription}.`,
  };
}

/** Art. 13(13) — technical documentation and the EU declaration of conformity. */
export function technicalDocumentationRetention(input: {
  placedOnMarket?: string | null;
  supportPeriodEnd?: string | null;
}): RetentionResult {
  return compute({
    anchorIso: input.placedOnMarket,
    supportPeriodEnd: input.supportPeriodEnd,
    citation: "Article 13(13)",
    subject: "The technical documentation and the EU declaration of conformity",
    anchorDescription: "the date the product was placed on the market",
  });
}

/**
 * Art. 13(18) — Annex II information and instructions to the user.
 * Runs to the same date as 13(13) but is a separate duty: it is owed to users as
 * well as to authorities, and covers online availability.
 */
export function userInformationRetention(input: {
  placedOnMarket?: string | null;
  supportPeriodEnd?: string | null;
}): RetentionResult {
  return compute({
    anchorIso: input.placedOnMarket,
    supportPeriodEnd: input.supportPeriodEnd,
    citation: "Article 13(18)",
    subject:
      "The Annex II information and instructions to the user (including online, where provided online)",
    anchorDescription: "the date the product was placed on the market",
  });
}

/**
 * Art. 13(9) — a single security update's availability.
 * Anchored on when THAT update was issued, not on placing on the market.
 */
export function securityUpdateAvailability(input: {
  updateIssuedOn?: string | null;
  supportPeriodEnd?: string | null;
}): RetentionResult {
  return compute({
    anchorIso: input.updateIssuedOn,
    supportPeriodEnd: input.supportPeriodEnd,
    citation: "Article 13(9)",
    subject: "This security update",
    anchorDescription: "the date the update was issued",
  });
}

/**
 * Art. 19(6) — the importer's copy of the EU declaration of conformity, and
 * access to the technical documentation on request. Same clock as the
 * manufacturer's 13(13), but it is the importer's own duty, so it is its own
 * function and cites its own article.
 */
export function importerRecordRetention(input: {
  placedOnMarket?: string | null;
  supportPeriodEnd?: string | null;
}): RetentionResult {
  return compute({
    anchorIso: input.placedOnMarket,
    supportPeriodEnd: input.supportPeriodEnd,
    citation: "Article 19(6)",
    subject:
      "The importer's copy of the EU declaration of conformity, and access to the technical documentation on request",
    anchorDescription: "the date the product was placed on the market",
  });
}

/** Days until a retention duty lapses; negative once it has. */
export function daysUntil(until: string | null, now: Date): number | null {
  if (!until) return null;
  const end = new Date(`${until}T00:00:00Z`);
  if (Number.isNaN(end.getTime())) return null;
  return Math.floor((end.getTime() - now.getTime()) / 86_400_000);
}
