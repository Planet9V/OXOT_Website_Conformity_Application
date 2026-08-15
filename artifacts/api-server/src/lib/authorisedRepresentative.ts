/**
 * The CUSTODY shape — authorised representatives, Article 18.
 *
 * The representative holds a file it did not create, under a mandate that
 * bounds what it may do. Article 18 bounds that mandate from BOTH ends, and
 * getting either wrong produces a different failure:
 *
 *   THE FLOOR — Art. 18(3). "The mandate SHALL ALLOW the authorised
 *   representative to do AT LEAST the following": keep the EU declaration of
 *   conformity and technical documentation at the disposal of market
 *   surveillance authorities; provide information on a reasoned request;
 *   cooperate on action to eliminate risks. A mandate granting less than this
 *   is defective — the representative cannot lawfully be appointed on those
 *   terms.
 *
 *   THE CEILING — Art. 18(2). "The obligations laid down in Article 13(1) to
 *   (11), Article 13(12), FIRST SUBPARAGRAPH, and Article 13(14) shall NOT form
 *   part of the authorised representative's mandate." These are not delegable.
 *   A mandate purporting to hand them over does not achieve it, and a system
 *   that displays them as the representative's duties tells someone they are
 *   responsible for work the Regulation says remains the manufacturer's.
 *
 * The ceiling is more precisely drawn than it first looks. Art. 18(2) excludes
 * Art. 13(12)'s FIRST SUBPARAGRAPH — drawing up the technical documentation.
 * The remainder of 13(12) (carrying out the conformity assessment, drawing up
 * the declaration, affixing the CE marking) is not in the exclusion list. So the
 * representative may not author the technical file, and this module does not
 * assert anything about the rest: whether a particular mandate may delegate
 * them is a question about that mandate, not one this code should answer.
 *
 * Art. 18(1) requires the mandate to be WRITTEN. Art. 18(3) requires a copy to
 * be provided to market surveillance authorities on request — so the document
 * itself is an artefact the representative must be able to produce, not merely
 * a fact recorded about a relationship.
 *
 * Art. 18(3)(a)'s retention runs on the same clock as Art. 13(13) and 19(6):
 * ten years after placing on the market or the support period, whichever is
 * longer. Computed by retention.ts rather than reimplemented.
 */

import { technicalDocumentationRetention, type RetentionResult } from "./retention";

/** The three tasks Art. 18(3) says every mandate must allow. */
export type MandatoryTask =
  | "keep_doc_and_technical_documentation"
  | "provide_information_on_reasoned_request"
  | "cooperate_on_risk_elimination";

export const MANDATORY_TASKS: Record<MandatoryTask, string> = {
  keep_doc_and_technical_documentation:
    "Keep the EU declaration of conformity (Article 28) and the technical documentation (Article 31) at the disposal of the market surveillance authorities",
  provide_information_on_reasoned_request:
    "Further to a reasoned request from a market surveillance authority, provide all the information and documentation necessary to demonstrate conformity",
  cooperate_on_risk_elimination:
    "Cooperate with the market surveillance authorities, at their request, on any action taken to eliminate the risks posed by a product covered by the mandate",
};

/**
 * What Art. 18(2) says may never form part of a mandate. Keyed so a mandate
 * purporting to include one can be named precisely rather than rejected wholesale.
 */
export const NON_DELEGABLE: Record<string, string> = {
  "article_13_1_to_11":
    "Article 13(1) to (11) — the manufacturer's substantive duties: secure design and development, the cybersecurity risk assessment, due diligence over third-party components, vulnerability handling, the support period and security updates",
  "article_13_12_first_subparagraph":
    "Article 13(12), first subparagraph — drawing up the technical documentation referred to in Article 31",
  "article_13_14":
    "Article 13(14) — the procedures keeping series production in conformity",
};

export interface MandateInput {
  /** Art. 18(1): a mandate must be in writing. */
  writtenMandateHeld?: boolean | null;
  appointingManufacturer?: string | null;
  effectiveFrom?: string | null;
  /** Null means open-ended. */
  effectiveTo?: string | null;
  /** Tasks the mandate grants. */
  tasksGranted?: string[];
  /** Retention anchors for Art. 18(3)(a). */
  placedOnMarket?: string | null;
  supportPeriodEnd?: string | null;
}

export type MandateState = "not_recorded" | "not_yet_effective" | "in_force" | "expired";

export interface MandateAssessment {
  state: MandateState;
  /** Defects that make the mandate fall short of Art. 18(3). */
  defects: string[];
  /** Clauses that Art. 18(2) says cannot form part of a mandate. */
  ineffectiveClauses: string[];
  /** What the representative is actually obliged to do, right now. */
  obligations: { task: string; description: string; citation: string }[];
  retention: RetentionResult | null;
  citations: string[];
  message: string;
}

function stateOf(input: MandateInput, today: string): MandateState {
  if (input.writtenMandateHeld !== true || !input.effectiveFrom) return "not_recorded";
  if (today < input.effectiveFrom) return "not_yet_effective";
  if (input.effectiveTo && today > input.effectiveTo) return "expired";
  return "in_force";
}

export function assessMandate(input: MandateInput, now: Date): MandateAssessment {
  const today = now.toISOString().slice(0, 10);
  const state = stateOf(input, today);
  const granted = new Set(input.tasksGranted ?? []);
  const citations = ["Article 18(1)", "Article 18(2)", "Article 18(3)"];

  const defects: string[] = [];
  if (input.writtenMandateHeld !== true) {
    defects.push(
      "Article 18(1): a manufacturer appoints an authorised representative BY A WRITTEN MANDATE. No written mandate is recorded, and Article 18(3) requires a copy to be provided to market surveillance authorities on request.",
    );
  }
  if (!input.appointingManufacturer?.trim()) {
    defects.push("Record which manufacturer granted the mandate. A representative represents someone.");
  }
  if (!input.effectiveFrom) {
    defects.push("Record when the mandate takes effect. Obligations that have no start have no end either.");
  }

  // The floor.
  for (const t of Object.keys(MANDATORY_TASKS) as MandatoryTask[]) {
    if (!granted.has(t)) {
      defects.push(
        `Article 18(3): the mandate must allow the representative to do AT LEAST — ${MANDATORY_TASKS[t]}. This mandate does not grant it.`,
      );
    }
  }

  // The ceiling.
  const ineffectiveClauses: string[] = [];
  for (const key of Object.keys(NON_DELEGABLE)) {
    if (granted.has(key)) {
      ineffectiveClauses.push(
        `Article 18(2): ${NON_DELEGABLE[key]} shall NOT form part of an authorised representative's mandate. Purporting to delegate it does not transfer it; it remains the manufacturer's obligation.`,
      );
    }
  }

  /**
   * Obligations are what the mandate grants, MINUS anything Art. 18(2) says
   * cannot be delegated, and only while the mandate is in force. Expiry does
   * not merely flag the mandate — it empties the obligation set, because the
   * representative is no longer appointed.
   */
  const obligations =
    state === "in_force"
      ? [...granted]
          .filter((t) => !(t in NON_DELEGABLE))
          .map((t) => ({
            task: t,
            description: MANDATORY_TASKS[t as MandatoryTask] ?? t,
            citation: t in MANDATORY_TASKS ? "Article 18(3)" : "the mandate",
          }))
      : [];

  /** Art. 18(3)(a) — the same clock as Art. 13(13) and 19(6). */
  const retention =
    state === "in_force" && granted.has("keep_doc_and_technical_documentation")
      ? technicalDocumentationRetention({
          placedOnMarket: input.placedOnMarket,
          supportPeriodEnd: input.supportPeriodEnd,
        })
      : null;

  const message =
    state === "expired"
      ? `The mandate expired on ${input.effectiveTo}. The representative holds no obligations under it. Note that the manufacturer's own duties are unaffected — a lapsed mandate removes the representative, not the obligations.`
      : state === "not_yet_effective"
        ? `The mandate does not take effect until ${input.effectiveFrom}.`
        : state === "not_recorded"
          ? `No effective written mandate is recorded. ${defects.join(" ")}`
          : defects.length || ineffectiveClauses.length
            ? `In force, with defects. ${[...defects, ...ineffectiveClauses].join(" ")}`
            : `In force. The representative holds ${obligations.length} obligation(s) under the mandate from ${input.appointingManufacturer}.`;

  return { state, defects, ineffectiveClauses, obligations, retention, citations, message };
}

/**
 * The acceptance criterion, as a function: is every obligation shown for this
 * representative actually granted by the mandate?
 *
 * Exists as its own check because the failure it guards against is silent. A
 * cockpit that renders the manufacturer's obligation list for a representative
 * tells someone they are responsible for work Art. 18(2) says they cannot even
 * be given.
 */
export function obligationsAreWithinMandate(
  shown: string[],
  granted: string[],
): { within: boolean; outside: string[]; citation: string; message: string } {
  const set = new Set(granted);
  const outside = shown.filter((s) => !set.has(s) || s in NON_DELEGABLE);
  return {
    within: outside.length === 0,
    outside,
    citation: "Article 18(2), Article 18(3)",
    message: outside.length
      ? `${outside.length} obligation(s) shown are not within this mandate: ${outside.join(", ")}. An authorised representative performs the tasks specified in the mandate, and Article 18(2) puts some of them beyond any mandate.`
      : "Every obligation shown is granted by the mandate.",
  };
}
