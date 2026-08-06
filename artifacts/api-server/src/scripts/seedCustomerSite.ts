/**
 * Seeds the "limited frontend" for a per-customer conformance deployment:
 *
 *  - PUBLIC tier: a CRA primer, the conformance-process story, the
 *    artifact-to-article coverage page, and the regulations index.
 *  - MEMBERS tier: deeper CRA guidance, templates & examples, and workbench
 *    how-tos, grouped into the Knowledge Hub by regulation key.
 *
 * Regulation tags use the SAME natural keys as the conformity catalogue
 * (regulations.key: "cra", "ai_act", …) so Knowledge Hub tracks appear
 * automatically as future regulation content is tagged and published.
 *
 * All seeded pages are noindex (per-customer deployments must not compete in
 * search). The English header/footer nav is rebuilt to the limited set; the
 * Dutch locale is left untouched (customer deployments are English-first).
 *
 * Idempotent — pages are matched on (slug, locale) and fully replaced.
 * Run with: pnpm --filter @workspace/api-server run seed:customer-site
 */
import { eq, and, inArray } from "drizzle-orm";
import { db, pool, pagesTable, pageSectionsTable, navItemsTable } from "@workspace/db";

const log = (msg: string) => process.stdout.write(`${msg}\n`);

interface SeedPage {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  visibility: "public" | "members";
  regulationKeys: string[];
  markdown: string;
}

const PAGES: SeedPage[] = [
  {
    slug: "cra-primer",
    title: "The EU Cyber Resilience Act — A Primer",
    seoTitle: "CRA Primer | What the Cyber Resilience Act Requires",
    seoDescription:
      "A plain-language introduction to the EU Cyber Resilience Act: who it applies to, what it demands, and the deadlines that matter.",
    excerpt:
      "The Cyber Resilience Act makes cybersecurity a legal condition for selling products with digital elements in the EU. Here is what that means in practice.",
    visibility: "public",
    regulationKeys: ["cra"],
    markdown: `## What the CRA is

The **Cyber Resilience Act (Regulation (EU) 2024/2847)** is the first EU law that makes cybersecurity a *market-access condition* for products with digital elements — hardware and software alike. If your product connects, computes, or communicates, the CRA almost certainly applies to it.

## Who it applies to

- **Manufacturers** placing products with digital elements on the EU market — wherever they are based.
- **Importers and distributors**, who must verify the manufacturer's compliance.
- **Open-source stewards** have a lighter, dedicated regime.

## The core obligations

1. **Essential cybersecurity requirements (Annex I, Part I)** — secure-by-design development, no known exploitable vulnerabilities at release, secure default configuration, protection of data, attack-surface minimisation.
2. **Vulnerability handling (Annex I, Part II)** — a coordinated vulnerability disclosure policy, a software bill of materials (SBOM), timely security updates for the support period.
3. **Reporting (Article 14)** — actively exploited vulnerabilities and severe incidents must be reported to ENISA/your CSIRT: **early warning within 24 hours**, a notification within 72 hours, and a final report on a fixed clock.
4. **Technical documentation and conformity assessment (Annexes V–VIII)** — evidence that the requirements are met, an EU Declaration of Conformity, and CE marking.

## The deadlines that matter

- **Reporting obligations (Article 14)** apply from **September 2026**.
- **Full application** — all essential requirements and conformity assessment — from **December 2027**.

## How this deployment helps

This platform operationalises those obligations: a guided assessment against every CRA requirement, SBOM and vulnerability tracking, Article 14 incident clocks, and generated conformity documentation. Read [our conformance process](/conformance-process) to see how the pieces fit, or [the artifacts we produce](/artifacts-coverage) to see what evidence comes out.`,
  },
  {
    slug: "conformance-process",
    title: "Our Conformance Process",
    seoTitle: "The Conformance Process | From Assessment to Evidence",
    seoDescription:
      "How this platform turns regulatory text into a working process: assess, evidence, track components, handle incidents, and report.",
    excerpt:
      "Regulation text does not tell you what to do on Monday morning. Our process does: assess, evidence, track, respond, report.",
    visibility: "public",
    regulationKeys: [],
    markdown: `## From legal text to Monday morning

A regulation tells you *what* must be true. It does not tell you *how* to get there. This platform implements a repeatable process that works for the CRA today and extends to each regulation we add:

### 1. Assess

Every requirement in the catalogue becomes a question with a graded answer. You always know two things separately: **how far you are** (journey) and **how good your evidence is** (grade).

### 2. Evidence

Answers link to evidence — documents, configurations, test results — so every claim in your conformity documentation traces back to something real.

### 3. Track components

Your product's bill of materials (SBOM) is ingested and continuously checked: known vulnerabilities, upstream notification gaps, and the component-level facts your technical documentation must contain.

### 4. Respond

When a vulnerability becomes an incident, the platform runs the regulatory clocks for you — early warning, notification, final report — with alerts before every deadline.

### 5. Report

Frozen-snapshot reports assemble the evidence into executive summaries, assessment reports, and the technical documentation package — with full citation traceability.

## Why one process for many regulations

The CRA, AI Act, NIS2 and the rest overlap heavily: risk management, documentation, incident reporting, supply-chain control. By mapping every regulation into one requirement catalogue with cross-regulation links, work you do once counts everywhere it applies. See [the regulations we address](/regulations-we-address).`,
  },
  {
    slug: "artifacts-coverage",
    title: "Artifacts & Coverage",
    seoTitle: "Conformance Artifacts | What We Produce and What It Satisfies",
    seoDescription:
      "Every artifact this platform produces, mapped to the CRA article or annex it satisfies — the page to show your auditor.",
    excerpt:
      "Conformance is proven with artifacts. This page maps each artifact the platform produces to the CRA obligation it satisfies.",
    visibility: "public",
    regulationKeys: ["cra"],
    markdown: `## Evidence, mapped to obligation

Auditors and notified bodies do not ask whether you *feel* compliant — they ask for artifacts. This platform produces each of the following, mapped to the CRA obligation it supports:

| Artifact | CRA obligation |
| --- | --- |
| **Technical documentation package** | Annex VII — the complete technical file for conformity assessment |
| **EU Declaration of Conformity** | Annex V / Article 28 — the manufacturer's legal declaration |
| **Risk assessment record** | Article 13(2)–(3) & Annex I Part I — documented cybersecurity risk assessment |
| **Software Bill of Materials (SBOM)** | Annex I Part II(1) — machine-readable component inventory |
| **Vulnerability handling records** | Annex I Part II — disclosure policy, remediation, and update history |
| **Article 14 incident reports** | Article 14 — early warning (24 h), notification (72 h), final report |
| **Support-period declaration** | Article 13(8) — the committed security-update horizon |
| **Assessment & conformity reports** | Working evidence of the ongoing conformity process |

Every artifact is generated from the live assessment workspace, so the technical file and the day-to-day work can never drift apart.

As additional regulation tracks activate on this deployment, their artifact mappings appear here alongside the CRA's.`,
  },
  {
    slug: "regulations-we-address",
    title: "Regulations We Address",
    seoTitle: "Regulation Tracks | CRA Today, More as Workflows Ship",
    seoDescription:
      "The regulation tracks this conformance platform addresses: CRA active today; AI Act, NIS2, Machinery, IEC 62443 and more as workflows ship.",
    excerpt:
      "One platform, one body of evidence, many regulations. CRA is active today; further tracks activate as their workflows ship.",
    visibility: "public",
    regulationKeys: [],
    markdown: `## One platform, expanding coverage

This deployment is built around a single unified requirement catalogue. Each regulation is a **track** on that catalogue — and because requirements are cross-mapped, evidence produced for one track counts toward every other track it satisfies.

### Active now

- **EU Cyber Resilience Act (CRA)** — full workflow: assessment, SBOM & vulnerability tracking, Article 14 incident handling, technical documentation. Start with the [CRA primer](/cra-primer).

### In the catalogue, workflows in development

- **EU AI Act** — risk-classified obligations for AI systems
- **NIS2 Directive** — organisational and network security for essential entities
- **Machinery Regulation** — safety of machinery with digital elements
- **IEC 62443** — industrial automation and control-system security
- **Radio Equipment Directive (RED)** — connected-device security baseline
- **GDPR** and **CER** — data protection and critical-entity resilience overlaps

### How a new track activates

1. The regulation's requirements are loaded into the catalogue and cross-mapped.
2. Its workflow (assessment steps, evidence types, deadlines) is enabled.
3. Its education and reference material appears in the Knowledge Hub.

No re-platforming, no second tool — the same process and the same body of information, applied to the next obligation.`,
  },
  // --- Members tier: the Knowledge Hub shelves -----------------------------
  {
    slug: "cra-article-guide",
    title: "CRA Article-by-Article Guide",
    seoTitle: "CRA Article Guide | Members",
    seoDescription: "Article-by-article guidance for meeting the Cyber Resilience Act.",
    excerpt:
      "What each CRA article and annex actually asks of you, in the order you will meet them in an assessment.",
    visibility: "members",
    regulationKeys: ["cra"],
    markdown: `## Reading the CRA the way an assessor does

### Article 13 — Obligations of manufacturers

The heart of the regulation. Key paragraphs:

- **13(1)–(3):** ship only products designed, developed and produced in line with Annex I Part I, backed by a documented risk assessment that is kept current.
- **13(5):** the risk assessment goes *into the technical documentation* — it is not an internal side-document.
- **13(6):** exercise due diligence when integrating third-party components — this is where your SBOM and upstream notification duties bite.
- **13(8):** determine and declare the support period (normally at least five years).

### Article 14 — Reporting

Two separate tracks, each with its own clock:

1. **Actively exploited vulnerability** → early warning 24 h → notification 72 h → final report **14 days after a fix is available**.
2. **Severe incident** → early warning 24 h → notification 72 h → final report **one month after the notification**.

The platform runs both clocks automatically when you open an incident.

### Annex I Part I — Essential requirements

Secure-by-default configuration, protection of confidentiality and integrity, attack-surface minimisation, resilience against denial of service, logging, and secure update capability. Each maps to one or more assessment questions in your workspace.

### Annex I Part II — Vulnerability handling

SBOM, coordinated disclosure policy, regular testing, security-update distribution without delay and free of charge.

### Annexes V–VIII — Showing conformity

The EU Declaration of Conformity (V), the conformity-assessment procedures (VIII), and the technical-documentation contents (VII) — all generated by this platform from your live workspace.

For the underlying legal text of any requirement, open the requirement in the [workbench catalogue](/knowledge/requirements).`,
  },
  {
    slug: "cra-templates",
    title: "Templates & Artifact Examples",
    seoTitle: "CRA Templates & Examples | Members",
    seoDescription: "Worked examples and templates for every CRA artifact this platform produces.",
    excerpt:
      "Every artifact the platform generates, with a worked example from the demo assessment so you know what good looks like.",
    visibility: "members",
    regulationKeys: ["cra"],
    markdown: `## What good looks like

This deployment ships with a fully-worked demo assessment. Use its outputs as reference examples for your own:

### Technical documentation package

Open the demo assessment's report workspace and export the technical documentation report. Note how every section cites evidence items — your own package should reach the same citation density.

### EU Declaration of Conformity

The DoC template is generated from the assessment once the conformity route is chosen. The demo shows a completed self-assessment (Module A) declaration.

### SBOM

The demo product includes an ingested CycloneDX SBOM. Export it from the BOM tab to see the expected format, component identities (purl), and vulnerability annotations.

### Article 14 incident reports

The demo includes a resolved incident with its full report chain — early warning, notification, and final report — showing the level of detail each stage needs.

### Risk assessment record

Each answered requirement in the demo carries a graded answer with linked evidence; together they form the documented risk assessment Article 13(5) requires in the technical file.

> **Tip:** ask the assistant "show me an example of X" — it is indexed over this material and the live workspace.`,
  },
  {
    slug: "workbench-how-to",
    title: "Workbench How-To Guides",
    seoTitle: "Workbench How-Tos | Members",
    seoDescription: "Step-by-step guides for the day-to-day conformance workflows in the workbench.",
    excerpt:
      "Step-by-step guides for the workflows you will run most: assessments, SBOM uploads, incidents, and reports.",
    visibility: "members",
    regulationKeys: [],
    markdown: `## The four workflows you will run most

### Running an assessment

1. Create a product, then start an assessment for it.
2. Work through requirements theme by theme; each answer takes a grade **and** evidence links.
3. The overview shows journey (how far) separately from grade (how good) — "done" requires both.

### Uploading and monitoring a BOM

1. In the assessment's BOM tab, upload a CycloneDX or SPDX file.
2. The pipeline ingests components and matches known vulnerabilities.
3. Watch the **Article 13(6) notification gaps** panel — upstream vulnerabilities you may need to notify about.

### Handling an incident

1. Open an incident from a vulnerability finding (or directly).
2. The Article 14 clocks start automatically — early warning, notification, final report deadlines appear with alert emails ahead of each.
3. Track status through investigating → mitigated → resolved; the final-report deadline follows the correct regulatory track for the incident type.

### Generating reports

1. In the report workspace, choose a format (executive summary, assessment report, technical documentation).
2. Reports freeze a snapshot — later workspace changes never silently alter an issued report.
3. Every AI-drafted section carries citation markers back to the frozen evidence; edit freely, citations are re-validated on save.

For anything else, ask the assistant — it knows both this material and your live workspace.`,
  },
];

// Limited English navigation for the customer deployment.
const HEADER_NAV = [
  { label: "CRA Primer", href: "/cra-primer" },
  { label: "Our Process", href: "/conformance-process" },
  { label: "Artifacts", href: "/artifacts-coverage" },
  { label: "Regulations", href: "/regulations-we-address" },
];
const FOOTER_NAV = [
  ...HEADER_NAV,
  { label: "Conformity Workbench", href: "/conformity/", external: true },
];

async function seed() {
  for (const page of PAGES) {
    await db.transaction(async (tx) => {
      await tx
        .delete(pagesTable)
        .where(and(eq(pagesTable.slug, page.slug), eq(pagesTable.locale, "en")));

      const [row] = await tx
        .insert(pagesTable)
        .values({
          slug: page.slug,
          serviceKey: page.slug,
          locale: "en",
          title: page.title,
          seoTitle: page.seoTitle,
          seoDescription: page.seoDescription,
          noindex: true,
          visibility: page.visibility,
          regulationKeys: page.regulationKeys,
          status: "published",
        })
        .returning({ id: pagesTable.id });

      await tx.insert(pageSectionsTable).values({
        pageId: row.id,
        type: "article",
        sortOrder: 0,
        data: { title: page.title, excerpt: page.excerpt, markdown: page.markdown },
      });
    });
    log(`Seeded ${page.visibility} page: ${page.slug}`);
  }

  // Mark ALL pages noindex: a per-customer deployment must not be indexed.
  await db.update(pagesTable).set({ noindex: true });
  log("Set noindex on all pages (per-customer deployment).");

  // Rebuild the limited English nav. Dutch locale is left untouched.
  await db.transaction(async (tx) => {
    await tx.delete(navItemsTable).where(eq(navItemsTable.locale, "en"));
    await tx.insert(navItemsTable).values([
      ...HEADER_NAV.map((item, i) => ({
        locale: "en",
        label: item.label,
        href: item.href,
        placement: "header",
        sortOrder: i,
        external: false,
      })),
      ...FOOTER_NAV.map((item, i) => ({
        locale: "en",
        label: item.label,
        href: item.href,
        placement: "footer",
        sortOrder: i,
        external: "external" in item ? Boolean(item.external) : false,
      })),
    ]);
  });
  log("Rebuilt limited English navigation.");

  // Sanity check: everything we just wrote is retrievable.
  const seeded = await db
    .select({ slug: pagesTable.slug, visibility: pagesTable.visibility })
    .from(pagesTable)
    .where(inArray(pagesTable.slug, PAGES.map((p) => p.slug)));
  log(`Verified ${seeded.length}/${PAGES.length} seeded pages present.`);
}

import { reindexContent } from "../lib/rag";

seed()
  .then(async () => {
    log("Rebuilding content index embeddings...");
    const chunksCount = await reindexContent();
    log(`Customer-site seed and content reindex complete! Total indexed passages: ${chunksCount}`);
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    process.stderr.write(`Customer-site seed failed: ${String(err)}\n`);
    await pool.end();
    process.exit(1);
  });
