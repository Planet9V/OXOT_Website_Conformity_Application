/**
 * Article 13(5) — due diligence on third-party components.
 *
 * "For the purpose of complying with paragraph 1, manufacturers shall exercise
 *  due diligence when integrating components sourced from third parties so that
 *  those components do not compromise the cybersecurity of the product with
 *  digital elements, including when integrating components of free and
 *  open-source software that have not been made available on the market in the
 *  course of a commercial activity."
 *
 * That is the whole operative duty. It says "due diligence" and nothing more
 * specific, which is where implementations go wrong in both directions — some
 * demand nothing, others invent a mandatory checklist.
 *
 * Recital 34 supplies the actions, and its wording is precise about their
 * status: the appropriate level of due diligence "DEPENDS ON THE NATURE AND THE
 * LEVEL OF CYBERSECURITY RISK associated with a given component, and should, for
 * that purpose, take into account ONE OR MORE of the following actions":
 *
 *   (a) verifying that the manufacturer of a component has demonstrated
 *       conformity, including by checking if the component already bears the
 *       CE marking;
 *   (b) verifying that a component receives regular security updates, such as by
 *       checking its security updates history;
 *   (c) verifying that a component is free from vulnerabilities registered in
 *       the European vulnerability database established pursuant to Article
 *       12(2) of Directive (EU) 2022/2555, or other publicly accessible
 *       vulnerability databases;
 *   (d) carrying out additional security tests.
 *
 * So this module does NOT require all four. Requiring four actions the
 * Regulation lists as alternatives would be inventing obligations, which is the
 * failure this codebase has been correcting. What it does is: expect MORE of
 * them as component risk rises, name which were evidenced, and never score.
 *
 * Recital 34 also imposes a follow-through that is easy to miss: where due
 * diligence identifies a vulnerability in a component, the manufacturer should
 * inform whoever manufactures or maintains it, remediate, and where applicable
 * provide the applied security fix. That is tracked as its own state.
 *
 * And: "The vulnerability handling obligations ... apply to products with
 * digital elements IN THEIR ENTIRETY, including to all integrated components."
 * A component is not out of scope because someone else wrote it.
 */

export type ComponentRisk = "low" | "medium" | "high";

/** The four actions Recital 34 offers. Alternatives, not a checklist. */
export type DueDiligenceAction =
  | "conformity_verified"
  | "update_history_verified"
  | "vulnerability_database_checked"
  | "additional_security_testing";

export const ACTION_LABELS: Record<DueDiligenceAction, string> = {
  conformity_verified:
    "Verified the component manufacturer has demonstrated conformity, including whether it bears the CE marking",
  update_history_verified:
    "Verified the component receives regular security updates, by checking its update history",
  vulnerability_database_checked:
    "Checked the component against the European vulnerability database (NIS2 Article 12(2)) or other public databases",
  additional_security_testing: "Carried out additional security testing",
};

export interface ComponentDueDiligenceInput {
  componentName: string;
  supplier?: string | null;
  /**
   * Free and open-source components not made available on the market in the
   * course of a commercial activity are expressly INSIDE Art. 13(5). Recorded
   * so nobody assumes the opposite.
   */
  isFreeAndOpenSource?: boolean | null;
  /** Risk of this component, which sets how much diligence is proportionate. */
  risk?: ComponentRisk | null;
  actionsTaken?: DueDiligenceAction[];
  /** Recital 34 follow-through, where diligence found something. */
  vulnerabilityFound?: boolean | null;
  maintainerInformedAt?: string | null;
  remediatedAt?: string | null;
  securityFixProvidedToMaintainer?: boolean | null;
}

export type DueDiligenceStatus = "not_assessed" | "insufficient" | "proportionate" | "follow_up_open";

export interface ComponentDueDiligenceAssessment {
  status: DueDiligenceStatus;
  /** How many of the four actions are evidenced. Never presented as a score. */
  actionsTaken: DueDiligenceAction[];
  /** How many would be proportionate at this risk level, and why. */
  expected: number;
  gaps: string[];
  citations: string[];
  message: string;
}

/**
 * Recital 34 makes the level risk-dependent. This is a defensible reading of
 * "one or more", not a rule in the text: at least one action for any component,
 * more as risk rises. It is stated as an expectation, never as a legal minimum,
 * and the message says so.
 */
function expectedActions(risk: ComponentRisk | null | undefined): number {
  if (risk === "high") return 3;
  if (risk === "medium") return 2;
  return 1;
}

export function assessComponentDueDiligence(
  input: ComponentDueDiligenceInput,
): ComponentDueDiligenceAssessment {
  const citations = ["Article 13(5)"];
  const actions = [...new Set(input.actionsTaken ?? [])];
  const gaps: string[] = [];

  if (input.risk == null) {
    gaps.push(
      "The cybersecurity risk of this component has not been assessed. Recital 34 makes the appropriate level of due diligence depend on it, so it cannot be judged proportionate until the risk is known.",
    );
  }
  const expected = expectedActions(input.risk);

  if (!actions.length) {
    gaps.push(
      `No due-diligence action is recorded for "${input.componentName}". Article 13(5) requires due diligence over components sourced from third parties.`,
    );
  } else if (input.risk != null && actions.length < expected) {
    gaps.push(
      `${actions.length} of the actions in Recital 34 are evidenced. At ${input.risk} risk, expect around ${expected}. Recital 34 offers these as alternatives ("one or more"), so this is an expectation about proportionality, not a legal minimum.`,
    );
  }

  // Recital 34 follow-through.
  let followUpOpen = false;
  if (input.vulnerabilityFound === true) {
    if (!input.maintainerInformedAt) {
      gaps.push(
        "A vulnerability was found in this component. Recital 34: inform the person or entity manufacturing or maintaining it.",
      );
      followUpOpen = true;
    }
    if (!input.remediatedAt) {
      gaps.push("The vulnerability found in this component is not recorded as remediated.");
      followUpOpen = true;
    }
    if (input.securityFixProvidedToMaintainer !== true) {
      gaps.push(
        "Where applicable, Recital 34 expects the applied security fix to be provided to the component's maintainer. This is not recorded.",
      );
      followUpOpen = true;
    }
  }

  const status: DueDiligenceStatus = followUpOpen
    ? "follow_up_open"
    : !actions.length || input.risk == null
      ? actions.length
        ? "insufficient"
        : "not_assessed"
      : actions.length >= expected
        ? "proportionate"
        : "insufficient";

  const foss =
    input.isFreeAndOpenSource === true
      ? " This is a free and open-source component; Article 13(5) covers it expressly, including where it was never made available on the market in the course of a commercial activity."
      : "";

  const message = gaps.length
    ? `To complete: ${gaps.join(" ")}${foss}`
    : `Due diligence recorded for "${input.componentName}": ${actions
        .map((a) => ACTION_LABELS[a])
        .join("; ")}.${foss}`;

  return { status, actionsTaken: actions, expected, gaps, citations, message };
}

export interface ProductDueDiligenceSummary {
  componentsTotal: number;
  notAssessed: number;
  insufficient: number;
  proportionate: number;
  followUpOpen: number;
  citations: string[];
  message: string;
}

/**
 * Roll-up across a product's components.
 *
 * Deliberately reports counts and never a percentage. "87% due diligence" is
 * the kind of number that reads as reassurance while 13% of the components in a
 * shipped product have never been looked at.
 */
export function summariseProductDueDiligence(
  assessments: ComponentDueDiligenceAssessment[],
): ProductDueDiligenceSummary {
  const count = (s: DueDiligenceStatus) => assessments.filter((a) => a.status === s).length;
  const notAssessed = count("not_assessed");
  const insufficient = count("insufficient");
  const followUpOpen = count("follow_up_open");
  const proportionate = count("proportionate");

  const parts: string[] = [];
  if (followUpOpen)
    parts.push(`${followUpOpen} component(s) have an open follow-up on a vulnerability found during due diligence.`);
  if (notAssessed) parts.push(`${notAssessed} component(s) have no due diligence recorded at all.`);
  if (insufficient)
    parts.push(`${insufficient} component(s) have less diligence recorded than their risk suggests.`);
  if (!parts.length) {
    parts.push(
      assessments.length
        ? "Every component has due diligence recorded proportionate to its assessed risk."
        : "No components are recorded for this product, so Article 13(5) cannot be evidenced.",
    );
  }

  return {
    componentsTotal: assessments.length,
    notAssessed,
    insufficient,
    proportionate,
    followUpOpen,
    citations: ["Article 13(5)"],
    message: parts.join(" "),
  };
}
