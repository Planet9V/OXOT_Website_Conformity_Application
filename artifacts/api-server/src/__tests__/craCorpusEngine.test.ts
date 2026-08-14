import { describe, it, expect } from "vitest";
import {
  loadCraCorpus,
  searchCraCorpus,
  getArticleByNumber,
  getRecitalByNumber,
  getAnnexByNumber,
} from "../lib/craCorpusEngine";

describe("CRA Statutory Corpus Engine & Truth Graph", () => {
  it("loads the complete statutory corpus without errors", () => {
    const corpus = loadCraCorpus();
    expect(corpus.chapters.length).toBeGreaterThanOrEqual(5);
    expect(corpus.articles.length).toBeGreaterThanOrEqual(10);
    expect(corpus.recitals.length).toBeGreaterThanOrEqual(5);
    expect(corpus.annexes.length).toBe(8);
  });

  it("retrieves Article 21 and its bidirectional backlinks to Recital 34 & Wizard", () => {
    const art21 = getArticleByNumber(21);
    expect(art21).toBeDefined();
    expect(art21?.title).toContain("Substantial Modification");
    expect(art21?.backlinks?.recitals).toContain(34);
    expect(art21?.backlinks?.appFeatures).toContain("APP_FEATURE_ARTICLE_21_WIZARD");
  });

  it("retrieves Article 14 and verifies early reporting requirement to CSIRT/ENISA", () => {
    const art14 = getArticleByNumber(14);
    expect(art14).toBeDefined();
    expect(art14?.title).toContain("Reporting Obligations");
    expect(art14?.paragraphs[0].text).toContain("24 hours");
    expect(art14?.backlinks?.recitals).toContain(68);
    expect(art14?.backlinks?.appFeatures).toContain("APP_FEATURE_PSIRT_EARLY_WARNING");
  });

  it("searches corpus for SBOM and returns relevant articles, recitals, and annexes", () => {
    const results = searchCraCorpus("SBOM");
    expect(results.matchCount).toBeGreaterThanOrEqual(2);
    expect(results.recitals.some((r) => r.title.includes("SBOM") || r.tags?.includes("SBOM"))).toBe(true);
    expect(results.annexes.some((a) => a.annexNumber === "I" || a.annexNumber === "VII")).toBe(true);
  });

  it("retrieves Annex I and validates both Part I (Security) and Part II (Vulnerability Handling)", () => {
    const annex1 = getAnnexByNumber("I");
    expect(annex1).toBeDefined();
    expect(annex1?.parts).toHaveLength(2);
    expect(annex1?.parts?.[0].partTitle).toContain("Properties");
    expect(annex1?.parts?.[1].partTitle).toContain("Vulnerability Handling");
  });
});
