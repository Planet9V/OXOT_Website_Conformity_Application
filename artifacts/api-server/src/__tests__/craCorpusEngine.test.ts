import { describe, it, expect } from "vitest";
import {
  loadCraCorpus,
  searchCraCorpus,
  getArticleByNumber,
  getRecitalByNumber,
  getAnnexByNumber,
} from "../lib/craCorpusEngine";

/**
 * These assertions are pinned to the published text of Regulation (EU) 2024/2847
 * (OJ L, 2024/2847, 20.11.2024). They exist to catch a regression back to the
 * generated corpus that previously shipped here, which invented article numbers
 * and gave every article the same two synthetic paragraphs.
 */
describe("CRA statutory corpus", () => {
  it("carries the full published structure: 130 recitals, 71 articles, 8 chapters, 8 annexes", () => {
    const corpus = loadCraCorpus();
    expect(corpus.recitals).toHaveLength(130);
    expect(corpus.articles).toHaveLength(71);
    expect(corpus.chapters).toHaveLength(8);
    expect(corpus.annexes).toHaveLength(8);
  });

  it("numbers articles as the regulation does", () => {
    // Every one of these was wrong in the previous generated corpus.
    expect(getArticleByNumber(13)?.title).toBe("Obligations of manufacturers");
    expect(getArticleByNumber(14)?.title).toBe("Reporting obligations of manufacturers");
    expect(getArticleByNumber(19)?.title).toBe("Obligations of importers");
    expect(getArticleByNumber(20)?.title).toBe("Obligations of distributors");
    expect(getArticleByNumber(24)?.title).toBe("Obligations of open-source software stewards");
    expect(getArticleByNumber(28)?.title).toBe("EU declaration of conformity");
    expect(getArticleByNumber(31)?.title).toBe("Technical documentation");
    expect(getArticleByNumber(64)?.title).toBe("Penalties");
  });

  it("names the annexes as published", () => {
    expect(getAnnexByNumber("I")?.title).toBe("ESSENTIAL CYBERSECURITY REQUIREMENTS");
    expect(getAnnexByNumber("VI")?.title).toBe("SIMPLIFIED EU DECLARATION OF CONFORMITY");
    expect(getAnnexByNumber("VIII")?.title).toBe("CONFORMITY ASSESSMENT PROCEDURES");
  });

  it("keeps real paragraph structure rather than a fixed two-paragraph stub", () => {
    const counts = new Set(loadCraCorpus().articles.map((a) => a.paragraphs.length));
    // The generated corpus produced exactly one distinct count: 2.
    expect(counts.size).toBeGreaterThan(3);
    expect(getArticleByNumber(13)!.paragraphs.length).toBeGreaterThan(10);
  });

  it("carries operative text, not templated filler", () => {
    const art13 = getArticleByNumber(13)!;
    const para8 = art13.paragraphs.find((p) => p.paragraphNumber === 8)!;
    // Art. 13(8): the five-year support period floor.
    expect(para8.text).toMatch(/support period shall be at least five years/i);

    const art14 = getArticleByNumber(14)!;
    expect(art14.paragraphs.find((p) => p.paragraphNumber === 1)!.text).toMatch(
      /actively exploited vulnerability/i
    );

    // No article may carry the boilerplate the previous generator emitted.
    for (const a of loadCraCorpus().articles) {
      for (const p of a.paragraphs) {
        expect(p.text).not.toMatch(/shall strictly adhere to the requirements set out in this Article/);
      }
    }
  });

  it("carries real recital text for every recital", () => {
    for (const r of loadCraCorpus().recitals) {
      expect(r.text).not.toMatch(/establishes the legislative intent of the European Parliament/);
      expect(r.text.length).toBeGreaterThan(80);
    }
  });

  it("searches the operative text", () => {
    const results = searchCraCorpus("support period");
    expect(results.articles.some((a) => a.articleNumber === 13)).toBe(true);
    expect(results.matchCount).toBeGreaterThan(1);
  });

  it("derives cross-references from the text", () => {
    // Recital 1 opens the preamble; recitals cite articles explicitly where they do.
    expect(getRecitalByNumber(1)).toBeDefined();
    const withRefs = loadCraCorpus().recitals.filter((r) => r.relatedArticles.length > 0);
    expect(withRefs.length).toBeGreaterThan(10);
  });
});
