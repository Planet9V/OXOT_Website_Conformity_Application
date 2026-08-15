/**
 * The STEWARDSHIP shape — open-source software stewards, Article 24.
 *
 * Not product-centric. `DESIGN_five_shapes.md` says so and the Regulation bears
 * it out: a steward has no CE marking, no EU declaration of conformity and no
 * conformity assessment. It has a policy, a cooperation duty, and a scoped
 * slice of the reporting duties. The unit of work is the PROJECT.
 *
 * Art. 3(14) — a steward is "a legal person, OTHER THAN A MANUFACTURER, that has
 * the purpose or objective of systematically providing support on a sustained
 * basis for the development of specific products with digital elements,
 * qualifying as free and open-source software and INTENDED FOR COMMERCIAL
 * ACTIVITIES, and that ensures the viability of those products".
 *
 * That last clause matters and the previous implementation had it backwards: it
 * asked the user to tick a "non-commercial open-source steward declaration". A
 * steward supports software intended FOR commercial activities. Software with
 * no commercial dimension largely falls outside the Regulation by a different
 * route, and its supporter is not a steward under Art. 3(14) at all. The
 * checkbox contradicted the definition of the role it claimed to record.
 *
 * Art. 24(1) — put in place and DOCUMENT IN A VERIFIABLE MANNER a cybersecurity
 * policy. Four things the policy must do, taken from the text:
 *   - foster the development of a secure product,
 *   - foster effective handling of vulnerabilities by the developers,
 *   - foster voluntary reporting under Art. 15,
 *   - take into account the steward's specific nature and the legal and
 *     organisational arrangements it is subject to.
 * And in particular it must include documenting, addressing and remediating
 * vulnerabilities, and promote sharing information about discovered
 * vulnerabilities within the open-source community.
 *
 * Art. 24(2) — cooperate with market surveillance authorities on request, and
 * on a REASONED request provide the Art. 24(1) documentation in a language the
 * authority easily understands.
 *
 * Art. 24(3) — Art. 14 reporting applies, CONDITIONALLY. This is the paragraph
 * the plan missed.
 *
 * Art. 64(10)(b) — administrative fines under Art. 64(2) to (9) do not apply to
 * "any infringement of this Regulation by open-source software stewards". Note
 * what that does NOT say: it does not remove the obligations, and it does not
 * touch Chapter V. A market surveillance authority can still require corrective
 * action, withdrawal or recall. No fines is not no duties.
 *
 * (Art. 64(10)'s opening words are "By way of derogation from paragraphs 2 to
 * 9" — corrected from "3 to 9" by the corrigendum at OJ L 2025/90555, which
 * this corpus applies.)
 *
 * Art. 25 — the Commission IS EMPOWERED to adopt delegated acts establishing
 * voluntary security attestation programmes. Empowerment is not enactment. No
 * such programme exists, and nothing may be presented as one.
 */

export type PolicyAspect =
  | "secure_development"
  | "vulnerability_handling_by_developers"
  | "voluntary_reporting_article_15"
  | "steward_nature_and_arrangements"
  | "documenting_addressing_remediating"
  | "community_information_sharing";

export const POLICY_ASPECTS: Record<PolicyAspect, string> = {
  secure_development: "Fosters the development of a secure product with digital elements",
  vulnerability_handling_by_developers:
    "Fosters effective handling of vulnerabilities by the developers of that product",
  voluntary_reporting_article_15:
    "Fosters the voluntary reporting of vulnerabilities as laid down in Article 15",
  steward_nature_and_arrangements:
    "Takes into account the specific nature of the steward and the legal and organisational arrangements it is subject to",
  documenting_addressing_remediating:
    "Includes documenting, addressing and remediating vulnerabilities",
  community_information_sharing:
    "Promotes sharing information about discovered vulnerabilities within the open-source community",
};

export interface StewardPolicyInput {
  /** Art. 24(1): the policy must be documented in a verifiable manner. */
  policyDocumented?: boolean | null;
  /** Where it is published, which is what makes it verifiable by others. */
  policyUrl?: string | null;
  /** Version, so "the policy" means a specific text. */
  policyVersion?: string | null;
  aspectsCovered?: PolicyAspect[];
}

export interface StewardPolicyAssessment {
  documented: boolean;
  aspectsCovered: PolicyAspect[];
  aspectsMissing: PolicyAspect[];
  gaps: string[];
  citations: string[];
  message: string;
}

export function assessStewardPolicy(input: StewardPolicyInput): StewardPolicyAssessment {
  const covered = [...new Set(input.aspectsCovered ?? [])];
  const missing = (Object.keys(POLICY_ASPECTS) as PolicyAspect[]).filter(
    (a) => !covered.includes(a),
  );
  const gaps: string[] = [];

  if (input.policyDocumented !== true) {
    gaps.push(
      "Article 24(1): a cybersecurity policy must be put in place AND documented in a verifiable manner. Having the practice without the document does not satisfy it.",
    );
  }
  if (!input.policyUrl?.trim()) {
    gaps.push(
      "Article 24(1): record where the policy is published. 'Verifiable' means someone else can check it — which requires knowing where it is.",
    );
  }
  if (!input.policyVersion?.trim()) {
    gaps.push(
      "Record the policy version, so that 'the policy' refers to a specific text. Article 24(2) may require you to hand it to an authority, and it must be clear which text was in force.",
    );
  }
  for (const a of missing) {
    gaps.push(`Article 24(1): the policy does not yet cover — ${POLICY_ASPECTS[a]}.`);
  }

  const documented = input.policyDocumented === true && Boolean(input.policyUrl?.trim());
  return {
    documented,
    aspectsCovered: covered,
    aspectsMissing: missing,
    gaps,
    citations: ["Article 24(1)", "Article 15"],
    message: gaps.length
      ? `To complete: ${gaps.join(" ")}`
      : `The cybersecurity policy is documented in a verifiable manner at ${input.policyUrl} (version ${input.policyVersion}) and covers every aspect Article 24(1) requires.`,
  };
}

export interface StewardCooperationInput {
  /** A reasoned request has been received from a market surveillance authority. */
  reasonedRequestReceivedAt?: string | null;
  documentationProvidedAt?: string | null;
  /** Art. 24(2): in a language which can be easily understood by that authority. */
  languageUnderstoodByAuthority?: boolean | null;
}

export interface StewardCooperationAssessment {
  outstanding: boolean;
  gaps: string[];
  citations: string[];
  message: string;
}

/** Art. 24(2). */
export function assessStewardCooperation(
  input: StewardCooperationInput,
): StewardCooperationAssessment {
  const citations = ["Article 24(2)"];
  if (!input.reasonedRequestReceivedAt) {
    return {
      outstanding: false,
      gaps: [],
      citations,
      message:
        "No reasoned request from a market surveillance authority is recorded. The duty to cooperate arises on request; the duty to hold the Article 24(1) documentation does not wait for one.",
    };
  }

  const gaps: string[] = [];
  if (!input.documentationProvidedAt) {
    gaps.push(
      "Article 24(2): provide the authority with the Article 24(1) documentation, in paper or electronic form.",
    );
  }
  if (input.languageUnderstoodByAuthority !== true) {
    gaps.push(
      "Article 24(2): the documentation must be in a language which can be easily understood by that authority.",
    );
  }

  return {
    outstanding: gaps.length > 0,
    gaps,
    citations,
    message: gaps.length
      ? `A reasoned request is outstanding. To complete: ${gaps.join(" ")}`
      : `The Article 24(1) documentation was provided on ${input.documentationProvidedAt}, in a language the authority can easily understand.`,
  };
}

export interface StewardReportingInput {
  /** Art. 24(3) limb 1: are you involved in developing the product? */
  involvedInDevelopment?: boolean | null;
  /**
   * Art. 24(3) limb 2: does the severe incident affect network and information
   * systems YOU provide for the development of the product?
   */
  incidentAffectsStewardProvidedSystems?: boolean | null;
}

export interface StewardReportingAssessment {
  /** Art. 14(1) — actively exploited vulnerabilities. */
  article14_1Applies: boolean | null;
  /** Art. 14(3) and (8) — severe incidents. */
  article14_3and8Apply: boolean | null;
  citations: string[];
  message: string;
}

/**
 * Art. 24(3) — the paragraph the plan missed.
 *
 * Both limbs are conditional and they are conditional on DIFFERENT things, so
 * they are answered separately. A steward can be squarely inside one and
 * outside the other.
 */
export function assessStewardReporting(
  input: StewardReportingInput,
): StewardReportingAssessment {
  const citations = ["Article 24(3)", "Article 14"];
  const one = input.involvedInDevelopment ?? null;
  const two = input.incidentAffectsStewardProvidedSystems ?? null;

  const parts: string[] = [];
  parts.push(
    one === null
      ? "Whether you are involved in the development of the product has not been recorded, so it is not known whether Article 14(1) applies to you."
      : one
        ? "Article 14(1) APPLIES: you are involved in the development, so an actively exploited vulnerability must be notified."
        : "Article 14(1) does not apply: Article 24(3) extends it only to the extent you are involved in the development.",
  );
  parts.push(
    two === null
      ? "Whether a severe incident affects network and information systems you provide for development has not been recorded, so it is not known whether Article 14(3) and (8) apply."
      : two
        ? "Article 14(3) and (8) APPLY: the incident affects network and information systems you provide for the development of the product."
        : "Article 14(3) and (8) do not apply: Article 24(3) extends them only to the extent a severe incident affects systems you provide for development.",
  );

  return {
    article14_1Applies: one,
    article14_3and8Apply: two,
    citations,
    message: parts.join(" "),
  };
}

/**
 * Art. 64(10)(b) and Art. 25 — the two things everyone gets wrong about
 * stewards, in opposite directions.
 *
 * Deliberately a plain statement of what the Regulation says, generated from
 * one place so no surface can drift into claiming this application granted
 * anything. Note the phrasing: "Article 64(10)(b) EXEMPTS" — the article is the
 * subject. The honesty gate's claims-exemption-granted rule matches "is/are
 * exempt from", so describing a real statutory exemption needs no waiver.
 */
export function stewardLegalPosition(): {
  fines: { citation: string; statement: string };
  attestation: { citation: string; available: boolean; statement: string };
  obligations: { citation: string; statement: string };
} {
  return {
    fines: {
      citation: "Article 64(10)(b)",
      statement:
        "Article 64(10)(b) exempts open-source software stewards from the administrative fines in Article 64(2) to (9), for any infringement of this Regulation. This removes the fines and nothing else: the Article 24 obligations still bind you, and Chapter V market surveillance measures — corrective action, withdrawal, recall — still apply.",
    },
    attestation: {
      citation: "Article 25",
      available: false,
      statement:
        "Article 25 empowers the Commission to adopt delegated acts establishing VOLUNTARY security attestation programmes for free and open-source software. Empowerment is not enactment: no such programme exists, so no Article 25 attestation can be issued or held today.",
    },
    obligations: {
      citation: "Article 24",
      statement:
        "A steward has no CE marking, no EU declaration of conformity and no conformity assessment. The obligations are a documented cybersecurity policy (Article 24(1)), cooperation with market surveillance authorities on request (Article 24(2)), and the reporting duties in Article 14 to the extent Article 24(3) applies them.",
    },
  };
}
