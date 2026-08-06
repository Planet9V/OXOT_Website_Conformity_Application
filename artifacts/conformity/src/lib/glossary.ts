/**
 * The workbench vocabulary, in one place.
 *
 * Two kinds of terms, deliberately kept distinct:
 *  - "statutory" terms are anchored in the Cyber Resilience Act itself and
 *    carry their citation (Regulation (EU) 2024/2847);
 *  - "workbench" terms are concepts this tool invented to organise the work —
 *    they are labelled as such so nobody mistakes an app concept for a legal one.
 *
 * Definitions reuse the phrasing already established in the panels (e.g. the
 * grade is "answer quality, not workflow progress"; readiness is "not a legal
 * declaration of conformity") so the glossary and the UI never disagree.
 */

export type GlossaryBasis = "statutory" | "workbench";

export interface GlossaryEntry {
  key: string;
  term: string;
  basis: GlossaryBasis;
  /** Statutory anchor, when one exists (CRA = Regulation (EU) 2024/2847). */
  citation?: string;
  definition: string;
}

export const GLOSSARY: GlossaryEntry[] = [
  // ── Statutory concepts (in workflow order) ─────────────────────────────────
  {
    key: "scope",
    term: "Scope & classification",
    basis: "statutory",
    citation: "CRA Art. 2 · Art. 7 & Annex III",
    definition:
      "Whether your product is a 'product with digital elements' the CRA applies to, and if so which class it falls in (default, or 'important' Class I / Class II per Annex III). The class constrains which conformity routes are allowed — the scoping wizard settles both.",
  },
  {
    key: "route",
    term: "Conformity route",
    basis: "statutory",
    citation: "CRA Art. 32",
    definition:
      "The assessment procedure you must follow: Module A (internal control — self-assessment) for default-class products, or routes involving a notified body (e.g. EU-type examination, Module B + C) for higher classes. The wizard recommends the lightest route your class permits.",
  },
  {
    key: "essential-requirements",
    term: "Essential requirements / gaps",
    basis: "statutory",
    citation: "CRA Annex I, Part I & II",
    definition:
      "The security properties (Part I) and vulnerability-handling duties (Part II) every in-scope product must satisfy. The gap assessment turns each one into a requirement evaluation: met, not met (a gap), or not applicable — with an owner, due date and evidence.",
  },
  {
    key: "xbom",
    term: "xBOM (SBOM / CBOM / AIBOM)",
    basis: "workbench",
    citation: "SBOM duty: CRA Annex I, Part II(1)",
    definition:
      "The bill-of-materials vault. The SBOM (software components) is a statutory duty — Annex I Part II(1) requires you to identify and document components and vulnerabilities. The workbench extends the same treatment to cryptography (CBOM) and AI models (AIBOM), and checks ingested components against known CVEs.",
  },
  {
    key: "incident-clocks",
    term: "Incident clocks",
    basis: "statutory",
    citation: "CRA Art. 14",
    definition:
      "The statutory reporting duties for an actively exploited vulnerability or a severe incident: early warning within 24 hours of awareness, a fuller notification within 72 hours, then a final report — within 14 days of a corrective measure being available for exploited vulnerabilities, or one calendar month after the notification for severe incidents. The workbench models these real legal anchors per track: it keeps a conservative clock until the anchor is known (the fix-available date, or the submitted notification), then re-anchors the final-report deadline the moment it is recorded — left of now is overdue.",
  },
  {
    key: "technical-documentation",
    term: "Technical documentation",
    basis: "statutory",
    citation: "CRA Art. 31 & Annex VII",
    definition:
      "The document set you must be able to hand an authority: product description, design and risk information, the conformity evidence. The Documents tab assembles an Annex VII-structured draft from your live assessment data and marks anything missing with [NEEDED] rather than inventing it.",
  },
  {
    key: "doc",
    term: "Declaration of Conformity (DoC)",
    basis: "statutory",
    citation: "CRA Art. 28 & Annex V",
    definition:
      "The manufacturer's formal statement that the product satisfies the essential requirements. The workbench drafts its structure from your data — but a draft here is never the legal declaration; signing one is a decision your organisation makes.",
  },
  // ── Workbench concepts ─────────────────────────────────────────────────────
  {
    key: "journey",
    term: "Compliance journey",
    basis: "workbench",
    definition:
      "Workflow position: how far this assessment has travelled from scoping through classification, route selection, requirements, evidence and gaps to review. Progress only — a journey at 100% with open blockers is still not ready.",
  },
  {
    key: "grade",
    term: "Readiness grade",
    basis: "workbench",
    definition:
      "Answer quality, not workflow progress: an A–F score computed from met vs not-met requirements, open blockers and artifact completeness. Kept deliberately separate from the journey so finished-looking work can't hide failing answers.",
  },
  {
    key: "readiness",
    term: "Ready for internal review",
    basis: "workbench",
    definition:
      "The milestone when the grade meets the bar with no blockers and no open incidents. It signals your own review can start — it is not a legal declaration of conformity.",
  },
  {
    key: "posture",
    term: "Readiness state",
    basis: "workbench",
    definition:
      "Where an assessment sits in the workflow: Blocked (open blockers or overdue statutory deadlines), In progress, Not started, or Ready (grade meets the bar with nothing blocking). Derived from the same live worklist as next actions, so the state and the list can never disagree.",
  },
  {
    key: "deadline-horizon",
    term: "Deadline horizon",
    basis: "workbench",
    definition:
      "A timeline of every live CRA Article 14 reporting clock across the portfolio, plotted around 'now' — anything left of now is overdue. It visualises the statutory incident clocks; the clocks themselves are the legal duty.",
  },
  {
    key: "next-actions",
    term: "Next actions",
    basis: "workbench",
    definition:
      "One prioritised worklist for the whole assessment: blockers and overdue statutory deadlines first, then open gaps and unfinished documents. Every open item appears exactly once, so an empty list genuinely means nothing is waiting.",
  },
  {
    key: "flows",
    term: "Flows",
    basis: "workbench",
    definition:
      "Guided, admin-authored step sequences (e.g. the CRA route: classify → standards check → SBOM triage → gaps → artifacts → review). A started run freezes its own copy of the steps, so editing a flow never rewrites work already in progress.",
  },
  {
    key: "provenance",
    term: "Provenance",
    basis: "workbench",
    definition:
      "The append-only activity ledger: every material change — evaluations, evidence, artifacts, incidents, flow steps — recorded as it happened. This is the audit trail an assessor or authority can walk backwards.",
  },
];

export function getGlossaryEntry(key: string): GlossaryEntry | undefined {
  return GLOSSARY.find((e) => e.key === key);
}
