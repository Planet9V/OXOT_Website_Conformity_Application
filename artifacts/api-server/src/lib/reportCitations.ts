import type { ReportCitation, ReportCitationKind } from "@workspace/db";

/**
 * Per-report citation registry. Numbering is assigned in ADD ORDER and is
 * stable for a given snapshot: deterministic builders always register sources
 * in a fixed sequence (instruments -> standards -> bibliography -> evidence),
 * so the same snapshot yields the same reference list every time.
 *
 * AI prose may only cite from this list; validateMarkers() strips any [n]
 * marker that does not resolve to a registered source.
 */
export class CitationRegistry {
  private list: ReportCitation[] = [];
  private byKey = new Map<string, ReportCitation>();
  private aliases = new Map<string, string>();

  /** Registers (or returns the existing) source; gives back its [n] number. */
  add(kind: ReportCitationKind, key: string, label: string): number {
    const existing = this.byKey.get(key);
    if (existing) return existing.n;
    const citation: ReportCitation = { n: this.list.length + 1, key, label, kind };
    this.list.push(citation);
    this.byKey.set(key, citation);
    return citation.n;
  }

  /**
   * Points `fromKey` at an already-registered source so the same instrument is
   * never listed twice (e.g. the CRA appearing both as a snapshot regulation
   * and as a bibliography constant).
   */
  alias(fromKey: string, toKey: string): void {
    if (this.byKey.has(toKey)) this.aliases.set(fromKey, toKey);
  }

  /** In-text marker for a registered source, e.g. "[3]". "" when unknown. */
  cite(key: string): string {
    const c = this.byKey.get(this.aliases.get(key) ?? key);
    return c ? `[${c.n}]` : "";
  }

  has(key: string): boolean {
    return this.byKey.has(key);
  }

  get citations(): ReportCitation[] {
    return [...this.list];
  }

  /** "SOURCES you may cite" block for the narrative prompt. */
  promptBlock(): string {
    return this.list.map((c) => `[${c.n}] ${c.label}`).join("\n");
  }
}

/**
 * Validates in-text [n] markers in AI-drafted markdown against the registry.
 * Invalid markers are stripped (the surrounding prose is kept). Returns the
 * cleaned text plus which numbers were removed so the section can carry a note.
 */
export function validateMarkers(
  text: string,
  citations: Pick<ReportCitation, "n">[],
): { text: string; stripped: number[] } {
  const valid = new Set(citations.map((c) => c.n));
  const stripped: number[] = [];
  const cleaned = text.replace(/\[(\d{1,3})\](?!\()/g, (match, num: string) => {
    const n = Number(num);
    if (valid.has(n)) return match;
    if (!stripped.includes(n)) stripped.push(n);
    return "";
  });
  // Collapse doubled spaces left behind by stripped markers (not in code spans
  // — reports contain no code blocks by construction).
  return { text: cleaned.replace(/ {2,}/g, " "), stripped };
}

/**
 * Curated bibliography of authoritative sources every report may cite,
 * independent of what the snapshot references. Static by design: citations
 * must be exact and reproducible, never web-fetched at generation time.
 */
export const STATIC_BIBLIOGRAPHY: { key: string; label: string }[] = [
  {
    key: "bib:cra",
    label:
      "Regulation (EU) 2024/2847 of the European Parliament and of the Council of 23 October 2024 on horizontal cybersecurity requirements for products with digital elements (Cyber Resilience Act), OJ L, 2024/2847, 20.11.2024.",
  },
  {
    key: "bib:blue-guide",
    label:
      "European Commission, 'The \"Blue Guide\" on the implementation of the product rules of the EU 2022' (2022/C 247/01), OJ C 247, 29.6.2022.",
  },
  {
    key: "bib:768-2008",
    label:
      "Decision No 768/2008/EC of the European Parliament and of the Council of 9 July 2008 on a common framework for the marketing of products, OJ L 218, 13.8.2008.",
  },
  {
    key: "bib:enisa-standards",
    label:
      "ENISA, 'Cyber Resilience Act Requirements Standards Mapping' (European Union Agency for Cybersecurity, 2024).",
  },
  {
    key: "bib:nlf-765",
    label:
      "Regulation (EC) No 765/2008 of the European Parliament and of the Council of 9 July 2008 setting out the requirements for accreditation and market surveillance, OJ L 218, 13.8.2008.",
  },
];
