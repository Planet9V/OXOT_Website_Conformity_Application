/**
 * Article 13(8) — determining the support period.
 *
 * The operative text, third subparagraph:
 *
 *   "Without prejudice to the second subparagraph, the support period shall be
 *    at least five years. Where the product with digital elements is expected
 *    to be in use for less than five years, the support period shall correspond
 *    to the expected use time."
 *
 * So five years is the default, NOT an absolute floor. A shorter period is
 * lawful precisely when the product is expected to be in use for less than five
 * years, and the period then has to correspond to that expected use time.
 *
 * This distinction matters: a rule that simply rejects anything under five years
 * would flag a compliant manufacturer as non-compliant, which is the failure
 * mode this application exists to avoid.
 *
 * The second subparagraph also requires the manufacturer to take stated matters
 * into account, and Art. 13(8) fifth subparagraph requires "the information that
 * was taken into account to determine the support period" to be carried into the
 * Annex VII technical documentation — so the rationale is evidence, not a note.
 */

export const DEFAULT_SUPPORT_PERIOD_MONTHS = 60;

export type SupportPeriodStatus =
  | "not_set"
  | "meets_default"
  | "short_justified"
  | "short_unjustified"
  | "shorter_than_expected_use"
  | "invalid_dates";

export interface SupportPeriodInput {
  /** ISO date (YYYY-MM-DD) the support period starts, usually placing on the market. */
  supportPeriodStart?: string | null;
  /** ISO date (YYYY-MM-DD) the support period ends. */
  supportPeriodEnd?: string | null;
  /** How long the product is expected to be in use, in months. Art. 13(8). */
  expectedUseTimeMonths?: number | null;
  /** What the manufacturer took into account. Carried into Annex VII. */
  supportPeriodRationale?: string | null;
}

export interface SupportPeriodAssessment {
  status: SupportPeriodStatus;
  /** Length of the declared support period in whole months, or null. */
  months: number | null;
  expectedUseTimeMonths: number | null;
  /** True when the declared period satisfies Art. 13(8) as assessed here. */
  satisfiesArticle13_8: boolean;
  /** True when a rationale is required and present. */
  hasRationale: boolean;
  citation: string;
  /** Plain statement of what is true. Never asserts overall conformity. */
  message: string;
}

/** Whole months between two ISO dates, or null if either is missing/invalid. */
export function monthsBetween(startIso?: string | null, endIso?: string | null): number | null {
  if (!startIso || !endIso) return null;
  const start = new Date(`${startIso}T00:00:00Z`);
  const end = new Date(`${endIso}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  if (end < start) return -1;
  let months =
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    (end.getUTCMonth() - start.getUTCMonth());
  // Only count a final month once the day-of-month has been reached.
  if (end.getUTCDate() < start.getUTCDate()) months -= 1;
  return months;
}

export function assessSupportPeriod(input: SupportPeriodInput): SupportPeriodAssessment {
  const citation = "Article 13(8)";
  const expected =
    typeof input.expectedUseTimeMonths === "number" && input.expectedUseTimeMonths > 0
      ? input.expectedUseTimeMonths
      : null;
  const hasRationale = Boolean(input.supportPeriodRationale && input.supportPeriodRationale.trim());

  const months = monthsBetween(input.supportPeriodStart, input.supportPeriodEnd);

  if (months === null) {
    return {
      status: "not_set",
      months: null,
      expectedUseTimeMonths: expected,
      satisfiesArticle13_8: false,
      hasRationale,
      citation,
      message:
        "No support period is recorded. Article 13(8) requires the manufacturer to determine one and to record what was taken into account.",
    };
  }

  if (months < 0) {
    return {
      status: "invalid_dates",
      months: null,
      expectedUseTimeMonths: expected,
      satisfiesArticle13_8: false,
      hasRationale,
      citation,
      message: "The support period ends before it starts.",
    };
  }

  if (months >= DEFAULT_SUPPORT_PERIOD_MONTHS) {
    return {
      status: "meets_default",
      months,
      expectedUseTimeMonths: expected,
      satisfiesArticle13_8: true,
      hasRationale,
      citation,
      message: `The support period is ${months} months, meeting the five-year default in Article 13(8).`,
    };
  }

  // Under five years. Lawful only where expected use time is also under five
  // years, and the period corresponds to it.
  if (expected === null) {
    return {
      status: "short_unjustified",
      months,
      expectedUseTimeMonths: null,
      satisfiesArticle13_8: false,
      hasRationale,
      citation,
      message:
        `The support period is ${months} months, under the five-year default. ` +
        "Article 13(8) allows a shorter period only where the product is expected to be in use for less than five years. " +
        "Record the expected use time and the basis for it.",
    };
  }

  if (expected >= DEFAULT_SUPPORT_PERIOD_MONTHS) {
    return {
      status: "shorter_than_expected_use",
      months,
      expectedUseTimeMonths: expected,
      satisfiesArticle13_8: false,
      hasRationale,
      citation,
      message:
        `The support period is ${months} months but the product is expected to be in use for ${expected} months. ` +
        "Article 13(8) requires at least five years where expected use is five years or more.",
    };
  }

  if (months < expected) {
    return {
      status: "shorter_than_expected_use",
      months,
      expectedUseTimeMonths: expected,
      satisfiesArticle13_8: false,
      hasRationale,
      citation,
      message:
        `The support period is ${months} months but the product is expected to be in use for ${expected} months. ` +
        "Article 13(8) requires the support period to correspond to the expected use time.",
    };
  }

  return {
    status: "short_justified",
    months,
    expectedUseTimeMonths: expected,
    satisfiesArticle13_8: true,
    hasRationale,
    citation,
    message:
      `The support period is ${months} months, corresponding to an expected use time of ${expected} months. ` +
      "Article 13(8) permits a period under five years on that basis." +
      (hasRationale
        ? ""
        : " Record what was taken into account — Article 13(8) requires it in the Annex VII technical documentation."),
  };
}
