/**
 * Chapter V — cooperation with market surveillance authorities.
 *
 * Three provisions drive the workflow:
 *
 *   53      On a REASONED REQUEST, the authority is granted access to the data
 *           required to assess design, development, production and vulnerability
 *           handling — "in a language easily understood by them".
 *
 *   54(1)   Where the authority finds non-compliance it "shall without delay
 *           require the relevant economic operator to take all appropriate
 *           corrective actions ... to withdraw it from the market, or to recall
 *           it within a reasonable period, commensurate with the nature of the
 *           cybersecurity risk, AS THE MARKET SURVEILLANCE AUTHORITY MAY
 *           PRESCRIBE."
 *
 *   54(4)   "The economic operator shall ensure that all appropriate corrective
 *           action is taken in respect of all the products with digital elements
 *           concerned that it has made available on the market THROUGHOUT THE
 *           UNION."
 *
 *   54(5)   Where adequate corrective action is not taken within that period,
 *           the authority takes provisional measures: prohibit, restrict,
 *           withdraw or recall.
 *
 * Two things follow that an obvious implementation gets wrong.
 *
 * First, there is no statutory number here. Unlike Art. 14's 24 and 72 hours,
 * the corrective-action period is whatever the authority prescribes. So this
 * module never computes a deadline — it records the one the authority set, and
 * treats its absence as a gap in the file rather than quietly substituting a
 * default. Inventing "30 days" would be inventing law.
 *
 * Second, 54(4) is Union-wide. An operator that fixes only the market whose
 * authority came knocking has not complied, and that is an easy and expensive
 * mistake to make. Scope is therefore recorded explicitly and a national-only
 * remedy is a finding, not a pass.
 */

export type EngagementKind = "data_access_request" | "corrective_action_requirement";

export type EngagementStatus =
  | "open"
  | "responded"
  | "overdue"
  | "closed"
  | "incomplete_record";

export type CorrectiveActionScope = "national" | "union_wide";

export interface MsaEngagementInput {
  kind: EngagementKind;
  /** When the authority's request or requirement was received. */
  receivedAt?: string | null;
  /**
   * Art. 54(1): the period the AUTHORITY prescribed. Null where none has been
   * recorded — which is a gap, never a reason to assume one.
   */
  prescribedDeadline?: string | null;
  /** When the operator responded / completed the corrective action. */
  completedAt?: string | null;
  /** Art. 54(4). Required for a corrective action requirement. */
  scope?: CorrectiveActionScope | null;
  /** Art. 53: the data must be in a language easily understood by the authority. */
  languageConfirmed?: boolean | null;
}

export interface MsaEngagementAssessment {
  status: EngagementStatus;
  citations: string[];
  gaps: string[];
  /** True once Art. 54(5) provisional measures become available to the authority. */
  escalationExposure: boolean;
  message: string;
}

function isPast(iso: string, now: Date): boolean {
  const d = new Date(iso);
  return !Number.isNaN(d.getTime()) && d.getTime() < now.getTime();
}

export function assessMsaEngagement(
  input: MsaEngagementInput,
  now: Date,
): MsaEngagementAssessment {
  const gaps: string[] = [];
  const citations: string[] = [];
  const isCorrective = input.kind === "corrective_action_requirement";

  citations.push(isCorrective ? "Article 54(1)" : "Article 53");

  if (!input.receivedAt) {
    gaps.push(
      "The date the authority's request was received is not recorded. Every period in Chapter V runs from it.",
    );
  }

  if (isCorrective) {
    citations.push("Article 54(4)", "Article 54(5)");
    if (!input.prescribedDeadline) {
      gaps.push(
        "Article 54(1): the period prescribed by the market surveillance authority is not recorded. The Regulation sets no fixed period — it is whatever the authority prescribed, commensurate with the risk — so it must be captured from the authority's own communication.",
      );
    }
    if (!input.scope) {
      gaps.push(
        "Article 54(4): the scope of the corrective action is not recorded. It must cover all affected products made available throughout the Union.",
      );
    } else if (input.scope === "national") {
      gaps.push(
        "Article 54(4): the corrective action covers only the national market. It must cover all the products concerned made available on the market throughout the Union.",
      );
    }
  } else if (input.languageConfirmed !== true) {
    citations.push("Article 53");
    gaps.push(
      "Article 53: it is not recorded that the data was provided in a language easily understood by the authority.",
    );
  }

  const completed = Boolean(input.completedAt);
  const overdue =
    !completed &&
    Boolean(input.prescribedDeadline) &&
    isPast(input.prescribedDeadline!, now);

  // Art. 54(5) only bites on a corrective-action requirement whose prescribed
  // period has passed without adequate action.
  const escalationExposure = isCorrective && overdue;

  let status: EngagementStatus;
  if (completed && !gaps.length) status = "closed";
  else if (completed) status = "incomplete_record";
  else if (overdue) status = "overdue";
  else if (gaps.length) status = "incomplete_record";
  else status = input.receivedAt ? "open" : "incomplete_record";

  const message = escalationExposure
    ? `The period prescribed by the authority has passed without the corrective action being completed. Under Article 54(5) the authority may now take provisional measures to prohibit or restrict the product on its national market, withdraw it, or recall it. ${gaps.join(" ")}`.trim()
    : gaps.length
      ? `To complete: ${gaps.join(" ")}`
      : completed
        ? "The corrective action or response is recorded as complete, within the period the authority prescribed."
        : "Open, and within the period the authority prescribed.";

  return { status, citations, gaps, escalationExposure, message };
}
