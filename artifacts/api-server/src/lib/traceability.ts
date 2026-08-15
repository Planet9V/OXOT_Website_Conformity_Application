/**
 * Article 23 — identification of economic operators.
 *
 * 23(1) Economic operators shall, on request, provide the market surveillance
 *       authorities with:
 *         (a) the name and address of any economic operator who has SUPPLIED
 *             THEM with a product with digital elements;
 *         (b) WHERE AVAILABLE, the name and address of any economic operator to
 *             whom THEY HAVE SUPPLIED a product with digital elements.
 *
 * 23(2) Economic operators shall be able to present that information for 10
 *       years after they have been supplied with the product and for 10 years
 *       after they have supplied the product.
 *
 * Three things make this its own rule rather than a reuse of Art. 13(13):
 *
 *   1. Two clocks, both anchored on SUPPLY EVENTS — not on placing on the
 *      market. Receiving and shipping are different dates, so the duty runs to
 *      the later of the two.
 *   2. No support-period limb. Art. 13(13) is "10 years or the support period,
 *      whichever is longer"; Art. 23(2) is a flat 10 years. Borrowing the
 *      support period here would overstate the duty.
 *   3. Limb (a) is unconditional; limb (b) is qualified by "where available".
 *      A manufacturer selling through retail genuinely does not know who the
 *      end purchaser is, and the regulation does not pretend otherwise. So a
 *      missing downstream party is only a gap when nobody has said whether it
 *      is available — see downstreamAvailable below.
 *
 * This duty binds every economic operator, not only manufacturers.
 */

export type TraceabilityStatus = "complete" | "incomplete" | "no_dates";

export interface TraceabilityParty {
  name?: string | null;
  address?: string | null;
}

export interface TraceabilityRecordInput {
  /** 23(1)(a) — who supplied us. Unconditional. */
  suppliedBy?: TraceabilityParty | null;
  /** ISO date we were supplied with the product. Anchors the first clock. */
  receivedOn?: string | null;
  /** 23(1)(b) — who we supplied. Only required "where available". */
  suppliedTo?: TraceabilityParty | null;
  /** ISO date we supplied the product on. Anchors the second clock. */
  suppliedOn?: string | null;
  /**
   * Whether a downstream economic operator is identifiable at all.
   *   true  — there is one; its name and address are required.
   *   false — there is none to record (e.g. sold to consumers). Lawful, and the
   *           operator has said so.
   *   null  — nobody has answered yet. That is a gap in the record, not a
   *           finding that limb (b) does not apply. The distinction matters: an
   *           unanswered question must not read as a lawful "not available".
   */
  downstreamAvailable?: boolean | null;
}

export interface TraceabilityAssessment {
  status: TraceabilityStatus;
  /** The later of the two ten-year clocks, or null if neither date is known. */
  mustPresentUntil: string | null;
  /** Which clock set the date. */
  basis: "received" | "supplied" | "unknown";
  /** What is missing, in the regulation's own terms. Empty when complete. */
  gaps: string[];
  citation: string;
  message: string;
}

const TEN_YEARS = 10;

function addTenYears(iso: string): string | null {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  d.setUTCFullYear(d.getUTCFullYear() + TEN_YEARS);
  return d.toISOString().slice(0, 10);
}

function partyIsComplete(p?: TraceabilityParty | null): boolean {
  return Boolean(p?.name?.trim() && p?.address?.trim());
}

export function assessTraceabilityRecord(
  input: TraceabilityRecordInput,
): TraceabilityAssessment {
  const gaps: string[] = [];

  // 23(1)(a) — unconditional.
  if (!partyIsComplete(input.suppliedBy)) {
    gaps.push(
      "Article 23(1)(a): the name and address of the economic operator who supplied this product.",
    );
  }

  // 23(1)(b) — "where available".
  if (input.downstreamAvailable === null || input.downstreamAvailable === undefined) {
    gaps.push(
      "Article 23(1)(b): record whether a downstream economic operator is identifiable. Leaving this unanswered is not the same as there being none.",
    );
  } else if (input.downstreamAvailable && !partyIsComplete(input.suppliedTo)) {
    gaps.push(
      "Article 23(1)(b): the name and address of the economic operator this product was supplied to.",
    );
  }

  // 23(2) — the two clocks. Both are a flat ten years; neither takes the
  // support period.
  const fromReceived = input.receivedOn ? addTenYears(input.receivedOn) : null;
  const fromSupplied = input.suppliedOn ? addTenYears(input.suppliedOn) : null;

  let mustPresentUntil: string | null = null;
  let basis: TraceabilityAssessment["basis"] = "unknown";
  if (fromReceived && fromSupplied) {
    const later = fromReceived >= fromSupplied ? fromReceived : fromSupplied;
    mustPresentUntil = later;
    basis = later === fromReceived ? "received" : "supplied";
  } else if (fromReceived) {
    mustPresentUntil = fromReceived;
    basis = "received";
  } else if (fromSupplied) {
    mustPresentUntil = fromSupplied;
    basis = "supplied";
  }

  if (!mustPresentUntil) {
    gaps.push(
      "Article 23(2): the date this product was supplied to you, or the date you supplied it. Without one the ten-year clock cannot start.",
    );
  }

  const status: TraceabilityStatus = !mustPresentUntil
    ? "no_dates"
    : gaps.length
      ? "incomplete"
      : "complete";

  const message =
    status === "complete"
      ? `This record must be presentable to market surveillance authorities on request until ${mustPresentUntil}, ten years after the ${basis === "received" ? "product was supplied to you" : "you supplied the product"} — whichever of the two is later.`
      : `To complete: ${gaps.join(" ")}`;

  return { status, mustPresentUntil, basis, gaps, citation: "Article 23", message };
}
