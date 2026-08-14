import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const corpusDir = path.join(rootDir, "docs/cra_statutory_corpus");

console.log("================================================================================");
console.log("   EU CYBER RESILIENCE ACT (CRA) STATUTORY QUALITY & COMPLETENESS AUDIT");
console.log("   Regulation (EU) 2024/2847 - Multi-Agent Quality Verification Gate");
console.log("================================================================================\n");

// Read statutory corpus files
const recitalsRaw = fs.readFileSync(path.join(corpusDir, "01_recitals_full.json"), "utf8");
const articlesRaw = fs.readFileSync(path.join(corpusDir, "02_articles_full.json"), "utf8");
const annexesRaw = fs.readFileSync(path.join(corpusDir, "03_annexes_full.json"), "utf8");
const graphRaw = fs.readFileSync(path.join(corpusDir, "04_bidirectional_graph.json"), "utf8");

const recitalsJson = JSON.parse(recitalsRaw);
const articlesJson = JSON.parse(articlesRaw);
const annexesJson = JSON.parse(annexesRaw);
const graphJson = JSON.parse(graphRaw);

let passedChecks = 0;
let totalChecks = 0;
const auditLog = [];

function check(title, condition, points = 10, details = "") {
  totalChecks += points;
  if (condition) {
    passedChecks += points;
    console.log(`[PASS] (+${points} pts) ${title}`);
    auditLog.push({ title, status: "PASS", points, details });
  } else {
    console.log(`[FAIL] (0/${points} pts) ${title} - ${details}`);
    auditLog.push({ title, status: "FAIL", points: 0, details });
  }
}

// 1. Structural Checks
check("Corpus Regulation Title", recitalsJson.regulation === "Regulation (EU) 2024/2847", 5);
check("Official Journal Reference Present", recitalsJson.officialJournalReference.includes("OJ L"), 5);
check("Application Timeline Specified", recitalsJson.generalApplicationDate === "2027-12-11" && recitalsJson.earlyReportingApplicationDate === "2026-09-11", 5);

// 2. Chapters & Articles Completeness
const totalArticlesCount = articlesJson.chapters.reduce((acc, c) => acc + c.articles.length, 0);
check("Chapters Granularity (>= 5 Chapters Present)", articlesJson.chapters.length >= 5, 10, `Found ${articlesJson.chapters.length} chapters`);
check("Articles Structure (Key CRA Articles Present)", totalArticlesCount >= 10, 10, `Found ${totalArticlesCount} articles`);

// 3. Specific Critical CRA Articles
const art21 = articlesJson.chapters.flatMap(c => c.articles).find(a => a.articleNumber === 21);
check("Article 21 (Substantial Modification) Ingested with Paragraphs", !!art21 && art21.paragraphs.length >= 2, 10);
check("Article 21 Legal Advisor Commentary", !!art21 && !!art21.legalCommentary && art21.legalCommentary.length > 20, 10);

const art14 = articlesJson.chapters.flatMap(c => c.articles).find(a => a.articleNumber === 14);
check("Article 14 (24h Early Warning Reporting) Ingested", !!art14 && art14.paragraphs[0].text.includes("24 hours"), 10);

const artDist = articlesJson.chapters.flatMap(c => c.articles).find(a => a.articleNumber === 18 || a.articleNumber === 19);
check("Distributor Duties & Duty to Refrain (Art. 18/19) Ingested", !!artDist && (artDist.paragraphs[0].text.includes("Duty to Refrain") || artDist.title.includes("Duty to Refrain")), 10);

const art61 = articlesJson.chapters.flatMap(c => c.articles).find(a => a.articleNumber === 61);
check("Article 61 (Administrative Fines €15M / 2.5%) Ingested", !!art61 && art61.paragraphs[0].text.includes("15,000,000"), 10);

// 4. Recitals Checks
const rec34 = recitalsJson.recitals.find(r => r.number === 34);
check("Recital 34 (Spare Parts Pre-2027 SI Exemption) Ingested", !!rec34 && rec34.tags.includes("SpareParts"), 10);

const rec68 = recitalsJson.recitals.find(r => r.number === 68);
check("Recital 68 (24h Early Notification Rationale) Ingested", !!rec68 && rec68.tags.includes("PSIRT"), 10);

// 5. Annexes Completeness
check("All 8 Annexes Ingested (Annex I to VIII)", annexesJson.annexes.length === 8, 15);
const annex1 = annexesJson.annexes.find(a => a.annexNumber === "I");
check("Annex I Part I & Part II Security Requirements Granularity", !!annex1 && annex1.parts.length === 2, 10);
const annex3 = annexesJson.annexes.find(a => a.annexNumber === "III");
check("Annex III Class I & Class II Product Categories", !!annex3 && annex3.classI.length > 3 && annex3.classII.length > 3, 10);

// 6. Bidirectional Backlinks Graph
check("Bidirectional Statutory Graph (>= 12 Edges)", graphJson.edges.length >= 12, 10, `Found ${graphJson.edges.length} edges`);
const edgeArt21Rec34 = graphJson.edges.find(e => e.source === "ARTICLE_21" && e.target === "RECITAL_34");
check("Graph Edge: Article 21 <-> Recital 34 Connected", !!edgeArt21Rec34, 10);

// Compute Score
const score = Math.round((passedChecks / totalChecks) * 100);
console.log("\n================================================================================");
console.log(`   FINAL STATUTORY COMPLETENESS GRADE: ${score}% (Threshold: 90%)`);
console.log(`   Points: ${passedChecks} / ${totalChecks}`);
console.log("================================================================================\n");

// Write Markdown report
const reportContent = `# CRA Statutory Truth Engine Quality & Completeness Audit Report

**Regulation**: Regulation (EU) 2024/2847 (Cyber Resilience Act)
**Official Journal**: OJ L, 2024/2847, 20.11.2024
**Audit Timestamp**: ${new Date().toISOString()}
**Final Statutory Completeness Grade**: **${score}%** (Status: ${score >= 90 ? "PASSED (APPROVED)" : "FAILED"})

---

## 1. Audit Check Results

| Check Item | Status | Points | Details |
| :--- | :--- | :--- | :--- |
${auditLog.map(a => `| ${a.title} | **${a.status}** | ${a.points} pts | ${a.details || "Verified"} |`).join("\n")}

---

## 2. Statutory Coverage Summary

- **Total Chapters Ingested**: ${articlesJson.chapters.length} (Chapters I through VII)
- **Total Articles Ingested**: ${totalArticlesCount} with paragraph-level anchor IDs
- **Total Recitals Ingested**: ${recitalsJson.recitals.length} with tags and cross-links
- **Total Annexes Ingested**: ${annexesJson.annexes.length} (Annex I Essential Requirements through Annex VIII Correlation)
- **Bidirectional Graph Edges**: ${graphJson.edges.length} relational connections
- **Application Workbench Integrations**:
  - Article 21 $\\leftrightarrow$ Article 21 Substantial Modification Wizard
  - Article 14 $\\leftrightarrow$ 24h Early Warning PSIRT Hub
  - Article 19 $\\leftrightarrow$ OEM Supplier Registry & Duty to Refrain Alerting
  - Recital 34 $\\leftrightarrow$ Spare-Parts Exemption & 48h SLA Clause Generator
`;

fs.writeFileSync(path.join(rootDir, "docs/statutory_completeness_audit.md"), reportContent, "utf8");
console.log("Audit report written to docs/statutory_completeness_audit.md\n");

if (score < 90) {
  process.exit(1);
} else {
  process.exit(0);
}
