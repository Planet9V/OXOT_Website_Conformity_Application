/**
 * End of support — what stops, and what emphatically does not.
 *
 * The failure mode this prevents is a product going quiet. Support ends, the
 * product drops off the dashboard, and everyone assumes the obligations went
 * with it. Three of them did not, and two of them can run for a decade longer.
 *
 * WHAT ENDS when the support period expires:
 *   Annex I Part II vulnerability handling. Art. 3(20) defines the support
 *   period as "the period during which a manufacturer is required to ensure
 *   that vulnerabilities ... are handled effectively and in accordance with the
 *   essential cybersecurity requirements set out in Part II of Annex I". When
 *   the period ends, that duty ends with it.
 *
 * WHAT CONTINUES, and this is the part that surprises people:
 *
 *   Art. 13(9)  every security update ALREADY ISSUED during the support period
 *               must remain available "for a minimum of 10 years or for the
 *               remainder of the support period, whichever is longer" — counted
 *               from when THAT UPDATE was issued. An update issued in the final
 *               month of support stays available for ten more years.
 *
 *   Art. 13(13) technical documentation and the EU declaration of conformity,
 *               ten years after placing on the market or the support period,
 *               whichever is longer.
 *
 *   Art. 13(18) the Annex II information and instructions, same clock, and
 *               where provided online it must stay accessible and available
 *               online for that period.
 *
 * So "end of support" is a change in WHICH obligations apply, never the end of
 * obligations. This module reports both halves, because reporting only the
 * first is how a manufacturer deletes a technical file that Art. 13(13) still
 * requires for eight more years.
 */

import { technicalDocumentationRetention, userInformationRetention, securityUpdateAvailability, type RetentionResult } from "./retention";

export type SupportState = "not_set" | "before_support" | "in_support" | "past_support";

export interface EndOfSupportInput {
  supportPeriodStart?: string | null;
  supportPeriodEnd?: string | null;
  placedOnMarket?: string | null;
  /**
   * Annex II item 6 requires the end date of the support period to be given to
   * the user. Recorded separately from the date itself: knowing it internally
   * is not the same as having told anyone.
   */
  endDateCommunicatedToUsers?: boolean | null;
  /** Issue dates of security updates released during the support period. */
  securityUpdatesIssuedOn?: string[];
}

export interface ObligationLifecycleEntry {
  citation: string;
  subject: string;
  /** "ended" | "continues" */
  state: "ended" | "continues";
  until: string | null;
  detail: string;
}

export interface EndOfSupportAssessment {
  state: SupportState;
  /** Everything still owed after support ends, and everything that stopped. */
  obligations: ObligationLifecycleEntry[];
  gaps: string[];
  citations: string[];
  message: string;
}

function todayIso(now: Date): string {
  return now.toISOString().slice(0, 10);
}

export function assessEndOfSupport(
  input: EndOfSupportInput,
  now: Date,
): EndOfSupportAssessment {
  const today = todayIso(now);
  const citations = ["Article 3(20)", "Article 13(9)", "Article 13(13)", "Article 13(18)"];
  const gaps: string[] = [];

  let state: SupportState = "not_set";
  if (input.supportPeriodEnd) {
    if (input.supportPeriodStart && today < input.supportPeriodStart) state = "before_support";
    else state = today > input.supportPeriodEnd ? "past_support" : "in_support";
  } else {
    gaps.push("Article 13(8): the end of the support period is not recorded, so its expiry cannot be tracked.");
  }

  // Annex II item 6 — the user has to be told when support ends.
  if (input.supportPeriodEnd && input.endDateCommunicatedToUsers !== true) {
    gaps.push(
      "Annex II: the end date of the support period must be given to the user. Recording it here is not the same as having communicated it.",
    );
  }

  const obligations: ObligationLifecycleEntry[] = [];

  // What ends.
  obligations.push({
    citation: "Annex I, Part II (via Article 3(20))",
    subject: "Vulnerability handling",
    state: state === "past_support" ? "ended" : "continues",
    until: input.supportPeriodEnd ?? null,
    detail:
      state === "past_support"
        ? "The support period has expired, so the Annex I Part II vulnerability-handling duties no longer apply to this product."
        : "Vulnerability handling applies for the whole support period.",
  });

  const retentionArgs = {
    placedOnMarket: input.placedOnMarket,
    supportPeriodEnd: input.supportPeriodEnd,
  };

  // What continues — the part people miss.
  const techDoc: RetentionResult = technicalDocumentationRetention(retentionArgs);
  obligations.push({
    citation: techDoc.citation,
    subject: "Technical documentation and the EU declaration of conformity",
    state: "continues",
    until: techDoc.until,
    detail: techDoc.message,
  });

  const userInfo: RetentionResult = userInformationRetention(retentionArgs);
  obligations.push({
    citation: userInfo.citation,
    subject: "Annex II information and instructions",
    state: "continues",
    until: userInfo.until,
    detail: userInfo.message,
  });

  /**
   * Art. 13(9), per update. An update issued in the final month of support must
   * remain available for ten years from ITS issue date, which can outlast every
   * other clock on the product.
   */
  for (const issued of input.securityUpdatesIssuedOn ?? []) {
    const avail = securityUpdateAvailability({
      updateIssuedOn: issued,
      supportPeriodEnd: input.supportPeriodEnd,
    });
    obligations.push({
      citation: avail.citation,
      subject: `Security update issued ${issued}`,
      state: "continues",
      until: avail.until,
      detail: avail.message,
    });
  }

  const continuing = obligations.filter((o) => o.state === "continues");
  const latest = continuing
    .map((o) => o.until)
    .filter((d): d is string => Boolean(d))
    .sort()
    .pop();

  const message =
    state === "past_support"
      ? `Support ended on ${input.supportPeriodEnd}. Vulnerability handling has ended, but ${continuing.length} obligation(s) continue${latest ? `, the last until ${latest}` : ""}. This product must not be treated as closed.`
      : state === "in_support"
        ? `In support until ${input.supportPeriodEnd}. ${continuing.length} obligation(s) will continue after that date${latest ? `, the last until ${latest}` : ""}.`
        : state === "before_support"
          ? `The support period has not started yet (begins ${input.supportPeriodStart}).`
          : "No support period is recorded, so neither its expiry nor what survives it can be tracked.";

  return { state, obligations, gaps, citations, message };
}
