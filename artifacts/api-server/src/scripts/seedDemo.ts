/**
 * Seed a realistic, populated DEMO conformity workspace so the public demo
 * (the `oxotdemo` login) lands on a rich, story-telling assessment instead of an
 * empty shell.
 *
 * Idempotent: the demo is identified by product name. Each run upserts the
 * product + assessment and RESETS the transactional state (answers, evaluations,
 * evidence, artifacts, grades, incidents) to a known baseline, so the sandbox is
 * always fresh and reproducible.
 *
 * Depends on the reference layer (regulations / requirements / classes / routes),
 * so it must run AFTER `seed:conformity`. Everything runs in one transaction.
 *
 * The demo data is built with the SAME pure engine helpers the app uses
 * (buildAllArtifacts / computeGrade / incidentClock), so the seeded grade,
 * artifacts and incident clock are internally consistent with the app's own
 * recompute — opening the workbench and clicking "recompute" changes nothing.
 */
import { createHash, randomBytes } from "node:crypto";
import { hashPassword } from "../lib/teamMembers";
import { and, asc, eq, sql } from "drizzle-orm";
import {
  db,
  conformityProductsTable,
  conformityAssessmentsTable,
  conformityAnswersTable,
  conformityEvaluationsTable,
  conformityEvidenceTable,
  conformityArtifactsTable,
  conformityGradesTable,
  conformityIncidentsTable,
  conformityThemesTable,
  conformityRoutesTable,
  productClassesTable,
  requirementsTable,
  conformityFlowsTable,
  conformityFlowRunsTable,
  conformityBomsTable,
  conformityBomComponentsTable,
  conformityBomFindingsTable,
  conformityBomNotificationsTable,
  conformityActivityTable,
  conformityEmbeddingsTable,
  conformityReportsTable,
  conformityMembersTable,
  conformityProductRevisionsTable,
  conformityPsirtProfilesTable,
  type ConformityProductRow,
  type ReportOptions,
  type ConformityAssessmentRow,
  type FlowRunStepState,
} from "@workspace/db";
import {
  buildAllArtifacts,
  computeGrade,
  incidentClock,
  ARTIFACT_LABELS,
  type ArtifactType,
  type EvalLite,
  type EvalDetail,
  type BuildArtifactsInput,
} from "../lib/conformityEngine";
import { parseBom, runCryptoHeuristics, osvLookup, defaultChecklist } from "../lib/xbom";
import {
  buildAssessmentSnapshot,
  buildCitationRegistry,
  defaultReportTitle,
  planSections,
} from "../lib/reportEngine";
import { renderMarkdown } from "../lib/reportExport";
import { embedText } from "../lib/embeddings";
import { CRA_FLOW_KEY, CRA_FLOW_VALUES } from "./craFlowTemplate";
import type { AnswerMap } from "../lib/craFlow";

const DEMO_PRODUCT_NAME = "NovaGuard Smart Home Hub";
const REG = "cra";
const CLASS_KEY = "important_class_i";
const ROUTE_KEY = "module_a";

// Wizard answers that put the product in scope and classify it as an important
// Class I product (smart-home security), self-assessed under Module A because
// harmonised standards are fully applied.
const ANSWERS: AnswerMap = {
  is_pde: { bool: true },
  made_available_eu: { bool: true },
  excluded_sectoral: { bool: false },
  is_saas_only: { bool: false },
  is_oss_noncommercial: { bool: false },
  product_categories: { options: ["smart_home_security"] },
  applies_harmonised_standards: { bool: true },
};

// A repeating status pattern that yields a realistic "in progress, with blockers"
// worklist: 50% met, 20% in progress, 10% partial, 10% not started, 10% not met.
const STATUS_CYCLE = [
  "met",
  "met",
  "met",
  "met",
  "in_progress",
  "partial",
  "in_progress",
  "not_started",
  "met",
  "not_met",
] as const;

// Named demo assessors — seeded as REAL conformity_members rows (see below) so
// assignment pickers, the "mine" filter and actor display resolve them. Owners
// are stored as member USERNAMES, never display names.
const DEMO_MEMBERS = [
  {
    username: "jim",
    teamRole: "signatory" as const,
    displayName: "Jim",
    position: "CRA Executive Director & Compliance Lead",
    email: "jim@oxot.nl",
    telephone: "+31 (0)20 555 0101",
    department: "Executive Management & Product Compliance",
    organization: "OXOT B.V.",
    roleResponsibility: "Lead Assessor, CRA Strategy & Statutory Sign-off",
    plainPassword: "Password123!",
  },
  {
    username: "jill",
    teamRole: "psirt" as const,
    displayName: "Jill",
    position: "Head of Vulnerability Management & PSIRT",
    email: "jill@oxot.nl",
    telephone: "+31 (0)20 555 0102",
    department: "Cybersecurity & PSIRT Triage",
    organization: "OXOT B.V.",
    roleResponsibility: "PSIRT Commander, ISO 29147 / 30111 Lead & 24h Incident SLA Manager",
    plainPassword: "Password123!",
  },
  {
    username: "jack",
    teamRole: "engineering_lead" as const,
    displayName: "Jack",
    position: "Principal OT/ICS Cybersecurity Architect",
    email: "jack@oxot.nl",
    telephone: "+31 (0)20 555 0103",
    department: "OT Architecture & Security Engineering",
    organization: "OXOT B.V.",
    roleResponsibility: "IEC 62443-4-2 Technical Verification & Secure Boot Architect",
    plainPassword: "Password123!",
  },
  {
    username: "nancy",
    teamRole: "compliance_coordinator" as const,
    displayName: "Nancy",
    position: "Senior Regulatory Auditor & Technical File Manager",
    email: "nancy@oxot.nl",
    telephone: "+31 (0)20 555 0104",
    department: "Regulatory Quality & Audit Vault",
    organization: "OXOT B.V.",
    roleResponsibility: "Notified Body Audit Dossier Sealing & Statutory Article 10 Evidence Verification",
    plainPassword: "Password123!",
  },
  {
    username: "priya.shah",
    teamRole: "psirt" as const,
    displayName: "Priya Shah",
    position: "Chief Security Officer & PSIRT Lead",
    email: "priya.shah@oxot.nl",
    telephone: "+31 (0)20 555 0191",
    department: "Cybersecurity & Incident Response",
    organization: "OXOT B.V.",
    roleResponsibility: "CRA Article 14 Lead Assessor & Emergency PSIRT Incident Commander",
    plainPassword: "Password123!",
  },
  {
    username: "marco.bianchi",
    teamRole: "engineering_lead" as const,
    displayName: "Marco Bianchi",
    position: "Senior Firmware Architect",
    email: "marco.bianchi@oxot.nl",
    telephone: "+31 (0)20 555 0192",
    department: "Embedded Systems & Hardware",
    organization: "OXOT B.V.",
    roleResponsibility: "Secure Boot, Microcontroller Cryptography & Hardware Security Modules",
    plainPassword: "Password123!",
  },
  {
    username: "lena.novak",
    teamRole: "compliance_coordinator" as const,
    displayName: "Lena Novak",
    position: "Regulatory Compliance Lead",
    email: "lena.novak@oxot.nl",
    telephone: "+31 (0)20 555 0193",
    department: "Legal & Regulatory Affairs",
    organization: "OXOT B.V.",
    roleResponsibility: "EU Declaration of Conformity & Notified Body Audit Liaison",
    plainPassword: "Password123!",
  },
] as const;
const OWNERS = DEMO_MEMBERS.map((m) => m.username);

function noteFor(status: string): string {
  switch (status) {
    case "met":
      return "Implemented and verified against the applied harmonised standard; evidence attached.";
    case "in_progress":
      return "Control implementation underway this sprint.";
    case "partial":
      return "Partially implemented; residual gap under review with the security team.";
    case "not_started":
      return "Not yet started — scheduled after the current hardening milestone.";
    case "not_met":
      return "Gap identified — remediation required before the product can be placed on the market.";
    default:
      return "";
  }
}

function isoDatePlusDays(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

// A realistic CycloneDX SBOM for the demo hub: a mix of common software
// components (some pinned to versions with well-known CVEs, so OSV lookup — when
// the network is reachable — surfaces real findings) and a handful of typed
// crypto-assets that the offline crypto-agility heuristics always flag. This is
// ingested through the SAME parser + analysis the app uses, so the seeded BOM is
// indistinguishable from one uploaded in the UI.
const DEMO_SBOM = {
  bomFormat: "CycloneDX",
  specVersion: "1.5",
  version: 1,
  metadata: {
    component: { type: "device", name: "NovaGuard Smart Home Hub", version: "2.4.0" },
  },
  components: [
    {
      type: "library",
      name: "openssl",
      version: "1.1.1k",
      purl: "pkg:generic/openssl@1.1.1k",
      publisher: "OpenSSL Project",
      licenses: [{ license: { id: "Apache-2.0" } }],
    },
    {
      type: "library",
      name: "lodash",
      version: "4.17.11",
      purl: "pkg:npm/lodash@4.17.11",
      publisher: "OpenJS Foundation",
      licenses: [{ license: { id: "MIT" } }],
    },
    {
      type: "library",
      name: "axios",
      version: "0.21.0",
      purl: "pkg:npm/axios@0.21.0",
      licenses: [{ license: { id: "MIT" } }],
    },
    {
      type: "library",
      name: "log4j-core",
      version: "2.14.1",
      purl: "pkg:maven/org.apache.logging.log4j/log4j-core@2.14.1",
      publisher: "Apache Software Foundation",
      licenses: [{ license: { id: "Apache-2.0" } }],
    },
    {
      type: "library",
      name: "zlib",
      version: "1.2.11",
      purl: "pkg:generic/zlib@1.2.11",
      licenses: [{ license: { id: "Zlib" } }],
    },
    {
      type: "framework",
      name: "express",
      version: "4.18.2",
      purl: "pkg:npm/express@4.18.2",
      licenses: [{ license: { id: "MIT" } }],
    },
    {
      type: "operating-system",
      name: "buildroot-linux",
      version: "2023.02",
      supplier: { name: "NovaGuard Technologies B.V." },
    },
    // ── Crypto-assets (CBOM-style) — always flagged offline ─────────────────
    {
      type: "cryptographic-asset",
      name: "RSA-1024",
      version: "1.0",
      cryptoProperties: {
        assetType: "algorithm",
        algorithmProperties: { primitive: "pke", parameterSetIdentifier: "1024" },
      },
    },
    {
      type: "cryptographic-asset",
      name: "SHA-1",
      version: "1.0",
      cryptoProperties: { assetType: "algorithm", algorithmProperties: { primitive: "hash" } },
    },
    {
      type: "cryptographic-asset",
      name: "MD5",
      version: "1.0",
      cryptoProperties: { assetType: "algorithm", algorithmProperties: { primitive: "hash" } },
    },
    {
      type: "cryptographic-asset",
      name: "ECDSA-P256",
      version: "1.0",
      cryptoProperties: {
        assetType: "algorithm",
        algorithmProperties: { primitive: "signature", parameterSetIdentifier: "256" },
      },
    },
  ],
};

export async function seedDemoMembers(targetDb: any = db): Promise<void> {
  for (const m of DEMO_MEMBERS) {
    await targetDb
      .insert(conformityMembersTable)
      .values({
        username: m.username,
        displayName: m.displayName,
        position: m.position,
        email: m.email,
        telephone: m.telephone,
        department: m.department,
        organization: m.organization,
        roleResponsibility: m.roleResponsibility,
        teamRole: m.teamRole,
        passwordHash: hashPassword(m.plainPassword),
        active: true,
      })
      .onConflictDoUpdate({
        target: conformityMembersTable.username,
        set: {
          displayName: m.displayName,
          position: m.position,
          email: m.email,
          telephone: m.telephone,
          department: m.department,
          organization: m.organization,
          roleResponsibility: m.roleResponsibility,
          teamRole: m.teamRole,
          passwordHash: hashPassword(m.plainPassword),
          active: true,
        },
      });
  }
}

export async function seedDemo(): Promise<void> {
  // Parse the demo SBOM and compute its findings up-front, OUTSIDE the DB
  // transaction: crypto-agility heuristics are offline/deterministic, while OSV
  // is a best-effort network call that must never roll back the seed. This is
  // the same pipeline the ingest + analyze routes use.
  const sbomText = JSON.stringify(DEMO_SBOM, null, 2);
  const sbomHash = createHash("sha256").update(sbomText).digest("hex");
  const parsedSbom = parseBom({ format: "cyclonedx", text: sbomText });
  const cryptoFindings = runCryptoHeuristics(parsedSbom.components);
  const osvFindings = await osvLookup(parsedSbom.components);
  const bomFindings = [...cryptoFindings, ...osvFindings];

  // Captured inside the transaction so workspace embeddings can be generated
  // (best-effort, network) AFTER it commits — mirroring the routes.
  let demoAssessmentId = 0;
  const embedJobs: { sourceType: string; sourceId: number; title: string; content: string }[] = [];

  await db.transaction(async (tx) => {
    // --- Reference layer (must already be seeded) ---
    const reqs = await tx
      .select()
      .from(requirementsTable)
      .where(eq(requirementsTable.regulationKey, REG))
      .orderBy(asc(requirementsTable.sortOrder));
    if (reqs.length === 0) {
      throw new Error(`No "${REG}" requirements found — run "seed:conformity" before "seed:demo".`);
    }

    // --- Named demo team members (assignable assessors) ---
    await seedDemoMembers(tx);
    // A transaction shares one connection, so queries must run sequentially.
    const themes = await tx.select().from(conformityThemesTable);
    const routes = await tx
      .select()
      .from(conformityRoutesTable)
      .where(eq(conformityRoutesTable.regulationKey, REG));
    const classes = await tx
      .select()
      .from(productClassesTable)
      .where(eq(productClassesTable.regulationKey, REG));

    // --- Upsert the demo product (by name) ---
    const nowIso = new Date().toISOString().slice(0, 10);
    const supportEnd = (() => {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 5);
      return d.toISOString().slice(0, 10);
    })();
    const productValues = {
      name: DEMO_PRODUCT_NAME,
      description:
        "A connected smart-home hub coordinating locks, cameras and sensors, with a companion mobile app and cloud sync.",
      manufacturerName: "NovaGuard Technologies B.V.",
      manufacturerAddress: "Keizersgracht 123, 1015 CJ Amsterdam, Netherlands",
      authorizedRep: "NovaGuard Technologies B.V. (established in the EU)",
      productType: "hardware_with_software",
      version: "2.4.0",
      intendedUse:
        "Residential security automation for consumers; controls smart locks, security cameras and alarm sensors.",
      supportPeriodStart: nowIso,
      supportPeriodEnd: supportEnd,
    };
    const [existingProduct] = await tx
      .select()
      .from(conformityProductsTable)
      .where(eq(conformityProductsTable.name, DEMO_PRODUCT_NAME));
    let product: ConformityProductRow;
    if (existingProduct) {
      [product] = await tx
        .update(conformityProductsTable)
        .set(productValues)
        .where(eq(conformityProductsTable.id, existingProduct.id))
        .returning();
    } else {
      [product] = await tx.insert(conformityProductsTable).values(productValues).returning();
    }

    // --- Upsert the assessment (by product + regulation) ---
    const assessmentValues = {
      productId: product.id,
      regulationKey: REG,
      status: "in_progress",
      currentStage: "gap_assessment",
      scopeResult: "in_scope",
      classKey: CLASS_KEY,
      routeKey: ROUTE_KEY,
      completedAt: null,
    };
    const [existingAssessment] = await tx
      .select()
      .from(conformityAssessmentsTable)
      .where(
        and(
          eq(conformityAssessmentsTable.productId, product.id),
          eq(conformityAssessmentsTable.regulationKey, REG),
        ),
      );
    let assessment: ConformityAssessmentRow;
    if (existingAssessment) {
      [assessment] = await tx
        .update(conformityAssessmentsTable)
        .set(assessmentValues)
        .where(eq(conformityAssessmentsTable.id, existingAssessment.id))
        .returning();
    } else {
      [assessment] = await tx.insert(conformityAssessmentsTable).values(assessmentValues).returning();
    }
    const aid = assessment.id;

    // --- Reset transactional state for a clean, reproducible demo ---
    // Sequential: a transaction shares a single connection.
    await tx.delete(conformityAnswersTable).where(eq(conformityAnswersTable.assessmentId, aid));
    await tx.delete(conformityEvaluationsTable).where(eq(conformityEvaluationsTable.assessmentId, aid));
    await tx.delete(conformityEvidenceTable).where(eq(conformityEvidenceTable.assessmentId, aid));
    await tx.delete(conformityArtifactsTable).where(eq(conformityArtifactsTable.assessmentId, aid));
    await tx.delete(conformityGradesTable).where(eq(conformityGradesTable.assessmentId, aid));
    await tx.delete(conformityIncidentsTable).where(eq(conformityIncidentsTable.assessmentId, aid));
    await tx.delete(conformityReportsTable).where(eq(conformityReportsTable.assessmentId, aid));
    // Phase 2 transactional state (BOMs cascade to their components/findings).
    await tx.delete(conformityBomsTable).where(eq(conformityBomsTable.assessmentId, aid));
    await tx
      .delete(conformityBomNotificationsTable)
      .where(eq(conformityBomNotificationsTable.assessmentId, aid));
    await tx.delete(conformityFlowRunsTable).where(eq(conformityFlowRunsTable.assessmentId, aid));
    await tx.delete(conformityActivityTable).where(eq(conformityActivityTable.assessmentId, aid));
    await tx.delete(conformityEmbeddingsTable).where(eq(conformityEmbeddingsTable.assessmentId, aid));

    // --- Answers ---
    await tx.insert(conformityAnswersTable).values(
      Object.entries(ANSWERS).map(([questionKey, value]) => ({
        assessmentId: aid,
        questionKey,
        value,
      })),
    );

    // --- Evaluations (gap worklist) ---
    const evalRows = reqs.map((r, i) => {
      const status = STATUS_CYCLE[i % STATUS_CYCLE.length]!;
      const isOpen = status !== "met";
      const riskRating =
        status === "not_met" ? (i % 20 === 0 ? "critical" : "high") : status === "partial" ? "medium" : null;
      return {
        assessmentId: aid,
        regulationKey: REG,
        requirementRefCode: r.refCode,
        status,
        implementationNote: noteFor(status),
        riskRating,
        // Every 4th open item stays unassigned so the "unassigned blocker"
        // flag has something real to point at in the demo.
        owner: isOpen && i % 4 !== 3 ? OWNERS[i % OWNERS.length]! : "",
        dueDate: isOpen ? isoDatePlusDays(7 + (i % 21)) : null,
      };
    });
    await tx.insert(conformityEvaluationsTable).values(evalRows);

    const reqByRef = new Map(reqs.map((r) => [r.refCode, r]));
    const evalDetails: EvalDetail[] = evalRows.map((e) => {
      const r = reqByRef.get(e.requirementRefCode)!;
      return {
        requirementRefCode: e.requirementRefCode,
        title: r.title,
        status: e.status,
        themeKey: r.themeKey ?? null,
        obligationType: r.obligationType,
        implementationNote: e.implementationNote,
        riskRating: e.riskRating,
      };
    });

    // --- Evidence ---
    const riskRef = reqs.find((r) => /risk|vulnerab/i.test(r.title))?.refCode ?? reqs[0]!.refCode;
    const cvdRef = reqs.find((r) => /disclos|report|vulnerab/i.test(r.title))?.refCode ?? null;
    const evidenceRows = await tx
      .insert(conformityEvidenceTable)
      .values([
        {
          assessmentId: aid,
          requirementRefCode: riskRef,
          title: "Threat model & cybersecurity risk analysis",
          evidenceType: "test_report",
          fileName: "novaguard-threat-model-v2.pdf",
          note: "STRIDE-based analysis covering the hub, companion app and cloud sync.",
        },
        {
          assessmentId: aid,
          title: "CycloneDX SBOM export (v2.4.0)",
          evidenceType: "sbom",
          fileName: "novaguard-2.4.0.cdx.json",
          note: "Generated from the release pipeline; 214 components inventoried.",
        },
        {
          assessmentId: aid,
          requirementRefCode: cvdRef ?? undefined,
          title: "Coordinated Vulnerability Disclosure policy",
          evidenceType: "policy",
          url: "https://novaguard.example/security",
          note: "Public security.txt with a 90-day coordinated-disclosure window.",
        },
      ])
      .returning();

    // --- Artifacts (compiled from the captured state, via the engine) ---
    const classObj = classes.find((c) => c.key === CLASS_KEY);
    const routeObj = routes.find((r) => r.key === ROUTE_KEY);
    const input: BuildArtifactsInput = {
      product,
      assessment,
      className: classObj?.name ?? "Important product, Class I",
      routeName: routeObj?.name ?? null,
      thirdPartyRequired: routeObj?.thirdPartyRequired ?? false,
      answers: ANSWERS,
      evaluations: evalDetails,
      evidence: evidenceRows,
      psirt: null,
    };
    const built = buildAllArtifacts(input);
    const artifactRows = await tx
      .insert(conformityArtifactsTable)
      .values(
        built.map((b) => ({
          assessmentId: aid,
          artifactType: b.artifactType,
          content: { sections: b.sections },
          status: b.sections.length > 0 && b.sections.every((s) => s.complete) ? "final" : "draft",
        })),
      )
      .returning();

    // --- Readiness grade snapshot ---
    const evalLite: EvalLite[] = evalDetails.map((e) => ({
      requirementRefCode: e.requirementRefCode,
      status: e.status,
      themeKey: e.themeKey,
      obligationType: e.obligationType,
    }));
    const grade = computeGrade(
      evalLite,
      themes,
      built.map((b) => ({ artifactType: b.artifactType, sections: b.sections })),
    );
    await tx.insert(conformityGradesTable).values({
      assessmentId: aid,
      overallScore: grade.overallScore,
      overallGrade: grade.overallGrade,
      blockerCount: grade.blockerCount,
      perTheme: grade.perTheme,
      perArtifact: grade.perArtifact,
    });

    // --- PSIRT Profile (Annex I Part II CRA Coordinated Vulnerability Disclosure) ---
    await tx.insert(conformityPsirtProfilesTable).values({
      productId: product.id,
      contactEmail: "psirt@robotech-systems.example",
      contactUrl: "https://robotech-systems.example/security",
      policyText: "RoboTech Systems Coordinated Vulnerability Disclosure Policy (90-day SLA under CRA Annex I(2)).",
      policyUrl: "https://robotech-systems.example/cvd-policy",
      disclosureDays: 90,
      updatedBy: "priya.shah",
    }).onConflictDoUpdate({
      target: conformityPsirtProfilesTable.productId,
      set: {
        contactEmail: "psirt@robotech-systems.example",
        contactUrl: "https://robotech-systems.example/security",
        policyText: "RoboTech Systems Coordinated Vulnerability Disclosure Policy (90-day SLA under CRA Annex I(2)).",
        policyUrl: "https://robotech-systems.example/cvd-policy",
        updatedBy: "priya.shah",
      },
    });

    // --- Product Version Revisions (Time-Series Trending across Releases) ---
    await tx.delete(conformityProductRevisionsTable).where(eq(conformityProductRevisionsTable.productId, product.id));
    const now = new Date();
    const retExpiry = new Date();
    retExpiry.setFullYear(now.getFullYear() + 10);
    const suppEnd = new Date();
    suppEnd.setFullYear(now.getFullYear() + 5);

    await tx.insert(conformityProductRevisionsTable).values([
      {
        productId: product.id,
        versionString: "v1.0.0",
        revisionNotes: "Initial product launch — baseline Annex I audit.",
        lifecycleState: "deprecated",
        supportPeriodStartDate: new Date("2024-01-15T00:00:00Z"),
        supportPeriodEndDate: suppEnd,
        technicalFileRetentionExpiry: retExpiry,
        isCurrentRelease: false,
        releasedBy: "priya.shah",
      },
      {
        productId: product.id,
        versionString: "v1.2.0",
        revisionNotes: "Security hardening patch; TLS 1.3 enforcement.",
        lifecycleState: "deprecated",
        supportPeriodStartDate: new Date("2024-08-10T00:00:00Z"),
        supportPeriodEndDate: suppEnd,
        technicalFileRetentionExpiry: retExpiry,
        isCurrentRelease: false,
        releasedBy: "marco.bianchi",
      },
      {
        productId: product.id,
        versionString: "v1.5.0",
        revisionNotes: "CycloneDX 1.5 xBOM integration & Post-Quantum crypto assessment.",
        lifecycleState: "deprecated",
        supportPeriodStartDate: new Date("2025-04-20T00:00:00Z"),
        supportPeriodEndDate: suppEnd,
        technicalFileRetentionExpiry: retExpiry,
        isCurrentRelease: false,
        releasedBy: "lena.novak",
      },
      {
        productId: product.id,
        versionString: "v1.8.5",
        revisionNotes: "Current CRA Article 10 & Annex IV fully compliant release.",
        lifecycleState: "active",
        supportPeriodStartDate: new Date("2026-02-01T00:00:00Z"),
        supportPeriodEndDate: suppEnd,
        technicalFileRetentionExpiry: retExpiry,
        isCurrentRelease: true,
        releasedBy: "priya.shah",
      },
    ]);

    // --- Two live post-market incidents, one per Article 14 track ---
    // Track 1: actively exploited vulnerability CVE-2026-3891 (complete sequence of events).
    const detectedAt = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const clock = incidentClock(detectedAt, "exploited_vulnerability", {});
    const correctiveDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

    await tx.insert(conformityIncidentsTable).values({
      assessmentId: aid,
      title: "CVE-2026-3891: Buffer Overflow in Image Decoder Module",
      description:
        "Heap overflow in libpng/image-decoder module exploited in wild. CSIRT 24h early warning done; 72h notification done; Hotfix v1.8.6 released; final ENISA report submitted.",
      kind: "exploited_vulnerability",
      severity: "critical",
      owner: "priya.shah",
      detectedAt,
      earlyWarningDueAt: clock.earlyWarningDueAt,
      earlyWarningDoneAt: new Date(detectedAt.getTime() + 14 * 60 * 60 * 1000),
      notificationDueAt: clock.notificationDueAt,
      notificationDoneAt: new Date(detectedAt.getTime() + 48 * 60 * 60 * 1000),
      correctiveAvailableAt: correctiveDate,
      finalReportDueAt: new Date(correctiveDate.getTime() + 14 * 24 * 60 * 60 * 1000),
      finalReportDoneAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      memberStates: "NL, DE, FR, BE, AT",
      suspectedMalicious: true,
      exploitNature: "Remote code execution via malformed image payload during optical camera ingestion.",
      sourceVulnerabilityId: "CVE-2026-3891",
      sourceComponent: "robot-vision-core@1.8.5",
      status: "closed",
    });

    // Track 2: severe incident — notification already submitted, so the final
    // report anchors one calendar month after that submission.
    const severeDetectedAt = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const severeNotificationDoneAt = new Date(severeDetectedAt.getTime() + 60 * 60 * 60 * 1000);
    const severeClock = incidentClock(severeDetectedAt, "severe_incident", {
      notificationDoneAt: severeNotificationDoneAt,
    });
    await tx.insert(conformityIncidentsTable).values({
      assessmentId: aid,
      title: "Cloud sync outage exposing stale lock-state to break-in attempts",
      description:
        "A misconfigured cloud-sync rollout left hubs reporting stale door-lock state for 9 hours; several customers' 'locked' indicators were wrong during attempted break-ins.",
      kind: "severe_incident",
      severity: "critical",
      detectedAt: severeDetectedAt,
      earlyWarningDueAt: severeClock.earlyWarningDueAt,
      earlyWarningDoneAt: new Date(severeDetectedAt.getTime() + 10 * 60 * 60 * 1000),
      notificationDueAt: severeClock.notificationDueAt,
      notificationDoneAt: severeNotificationDoneAt,
      finalReportDueAt: severeClock.finalReportDueAt,
      memberStates: "NL, FR",
      suspectedMalicious: false,
      exploitNature:
        "Availability/integrity incident: stale device state served from a mis-rolled cloud cache; no vulnerability exploited, but security function integrity was compromised.",
      correctiveMeasures: "Rollout reverted; cache invalidation fixed; affected customers notified in-app.",
      userMitigations: "None required — resolved server-side; verify lock state manually after outages.",
      sensitive: true,
      status: "investigating",
    });

    // --- Phase 2: default CRA process flow (reusable template, upsert by key) ---
    const flowValues = CRA_FLOW_VALUES;
    const [existingFlow] = await tx
      .select()
      .from(conformityFlowsTable)
      .where(eq(conformityFlowsTable.key, CRA_FLOW_KEY));
    const [flow] = existingFlow
      ? await tx
          .update(conformityFlowsTable)
          .set(flowValues)
          .where(eq(conformityFlowsTable.id, existingFlow.id))
          .returning()
      : await tx.insert(conformityFlowsTable).values(flowValues).returning();

    // --- Phase 2: demo SBOM, ingested + analyzed via the app's own pipeline ---
    const [bom] = await tx
      .insert(conformityBomsTable)
      .values({
        assessmentId: aid,
        bomType: "sbom",
        format: parsedSbom.format,
        name: "NovaGuard firmware SBOM (v2.4.0)",
        fileName: "novaguard-2.4.0.cdx.json",
        fileHash: sbomHash,
        componentCount: parsedSbom.components.length,
        findingCount: bomFindings.length,
        status: "analyzed",
        checklist: defaultChecklist("sbom"),
        meta: parsedSbom.meta,
        provenance: {
          uploadedBy: "demo:oxotdemo",
          parser: parsedSbom.format,
          parsedAt: new Date().toISOString(),
          fileHash: sbomHash,
          source: "seed",
        },
      })
      .returning();

    const componentRows =
      parsedSbom.components.length > 0
        ? await tx
            .insert(conformityBomComponentsTable)
            .values(
              parsedSbom.components.map((c) => ({
                bomId: bom!.id,
                name: c.name,
                version: c.version,
                componentType: c.componentType,
                purl: c.purl,
                supplier: c.supplier,
                licenses: c.licenses,
                hashes: c.hashes,
                cryptoProperties: c.cryptoProperties,
                raw: c.raw,
              })),
            )
            .returning()
        : [];

    // Map findings (by component index) to the persisted component ids and roll
    // up per-component counts — exactly as the analyze route does.
    const perComponent = new Map<number, number>();
    for (const f of bomFindings) {
      if (f.componentIndex === null) continue;
      const compId = componentRows[f.componentIndex]?.id;
      if (compId === undefined) continue;
      perComponent.set(compId, (perComponent.get(compId) ?? 0) + 1);
    }
    if (bomFindings.length > 0) {
      await tx.insert(conformityBomFindingsTable).values(
        bomFindings.map((f) => ({
          bomId: bom!.id,
          componentId:
            f.componentIndex !== null ? componentRows[f.componentIndex]?.id ?? null : null,
          findingType: f.findingType,
          identifier: f.identifier,
          severity: f.severity,
          title: f.title,
          description: f.description,
          source: f.source,
          detail: f.detail,
        })),
      );
    }
    for (const c of componentRows) {
      const count = perComponent.get(c.id) ?? 0;
      if (count > 0) {
        await tx
          .update(conformityBomComponentsTable)
          .set({ findingCount: count })
          .where(eq(conformityBomComponentsTable.id, c.id));
      }
    }

    // --- Phase 2: a live flow run part-way through the flow ---
    const nowMs = Date.now();
    const hoursAgo = (h: number): Date => new Date(nowMs - h * 60 * 60 * 1000);
    const stepStates: Record<string, FlowRunStepState> = {
      scope: {
        status: "done",
        note: "Confirmed in scope; classified as an important Class I product.",
        completedAt: hoursAgo(120).toISOString(),
      },
      harmonised: {
        status: "done",
        answer: "yes",
        note: "Applicable harmonised standards are fully applied, so Module A self-assessment is available.",
        completedAt: hoursAgo(96).toISOString(),
      },
      bom: {
        status: "in_progress",
        note: "SBOM ingested and analyzed; triaging the OSV vulnerabilities and crypto-agility flags.",
      },
      gaps: { status: "pending" },
      docs: { status: "pending" },
      review: { status: "pending" },
    };
    const [flowRun] = await tx
      .insert(conformityFlowRunsTable)
      .values({
        flowId: flow!.id,
        assessmentId: aid,
        // Freeze the flow name + step definitions into the run (matches the
        // route's run-creation behaviour) so later flow edits never rewrite it.
        flowName: flow!.name,
        steps: flow!.steps,
        status: "active",
        assignee: "Lena Novak (Compliance)",
        stepStates,
      })
      .returning();

    // --- Phase 2: one tracked upstream notification (CRA Art 13(6)) ---
    // Keyed by the stable component identity + vulnerability id (never a
    // finding row), so it survives re-uploading/re-analyzing a newer SBOM.
    // lodash@4.17.11 carries the well-known prototype-pollution CVE.
    const [upstreamNotification] = await tx
      .insert(conformityBomNotificationsTable)
      .values({
        assessmentId: aid,
        componentKey: "pkg:npm/lodash@4.17.11",
        componentName: "lodash",
        componentVersion: "4.17.11",
        purl: "pkg:npm/lodash@4.17.11",
        vulnerabilityId: "CVE-2019-10744",
        status: "notified",
        maintainerContact: "security@openjsf.org",
        method: "email",
        notifiedAt: new Date(Date.now() - 46 * 60 * 60 * 1000),
        notes:
          "Reported upstream per CRA Art 13(6) with a coordinated-disclosure courtesy note; upgrade to 4.17.21 planned for firmware 2.4.1.",
        recordedBy: `member:${OWNERS[0]!}`,
      })
      .returning();

    // --- Phase 2: provenance ledger (chain-of-custody feed), spread over time ---
    await tx.insert(conformityActivityTable).values([
      {
        assessmentId: aid,
        entityType: "assessment",
        entityId: aid,
        action: "created",
        actor: "demo:oxotdemo",
        source: "ui",
        summary: `Started CRA assessment for "${product.name}"`,
        createdAt: hoursAgo(126),
      },
      ...evidenceRows.map((e, i) => ({
        assessmentId: aid,
        entityType: "evidence",
        entityId: e.id,
        action: "created",
        // Attribute evidence to the named assessors so the provenance feed
        // demos real people (resolved to display names), not just the demo user.
        actor: [`member:${OWNERS[0]!}`, `member:${OWNERS[1]!}`, "demo:oxotdemo"][i % 3]!,
        source: "ui",
        hash: e.fileHash ?? "",
        summary: `Added evidence "${e.title}"`,
        createdAt: hoursAgo(100 - i * 3),
      })),
      {
        assessmentId: aid,
        entityType: "bom",
        entityId: bom!.id,
        action: "created",
        actor: "demo:oxotdemo",
        source: "seed",
        hash: sbomHash,
        summary: `Ingested SBOM "${bom!.name}" (${parsedSbom.components.length} components)`,
        createdAt: hoursAgo(72),
      },
      {
        assessmentId: aid,
        entityType: "bom",
        entityId: bom!.id,
        action: "analyzed",
        actor: "system",
        source: "system",
        summary: `Analyzed BOM "${bom!.name}" (${bomFindings.length} findings)`,
        createdAt: hoursAgo(71),
      },
      {
        assessmentId: aid,
        entityType: "bom_notification",
        entityId: upstreamNotification!.id,
        action: "created",
        actor: `member:${OWNERS[0]!}`,
        source: "ui",
        summary:
          "Started tracking upstream notification for lodash@4.17.11 (CVE-2019-10744) — status notified",
        createdAt: hoursAgo(46),
      },
      {
        assessmentId: aid,
        entityType: "artifact",
        action: "generated",
        actor: "demo:oxotdemo",
        source: "ui",
        summary: `Generated ${built.length} conformity document${built.length === 1 ? "" : "s"}`,
        createdAt: hoursAgo(48),
      },
      {
        assessmentId: aid,
        entityType: "grade",
        action: "created",
        actor: "system",
        source: "system",
        summary: `Computed readiness grade ${grade.overallGrade} (${grade.overallScore}/100)`,
        createdAt: hoursAgo(47),
      },
      {
        assessmentId: aid,
        entityType: "flow_run",
        entityId: flowRun!.id,
        action: "created",
        actor: "demo:oxotdemo",
        source: "ui",
        summary: `Started flow "${flow!.name}"`,
        createdAt: hoursAgo(24),
      },
      {
        assessmentId: aid,
        entityType: "incident",
        action: "created",
        actor: "demo:oxotdemo",
        source: "ui",
        summary: "Logged incident: actively exploited buffer overflow in pairing",
        createdAt: hoursAgo(18),
      },
    ]);

    // --- Queue best-effort workspace embeddings, generated after commit ---
    demoAssessmentId = aid;
    embedJobs.push({
      sourceType: "bom",
      sourceId: bom!.id,
      title: bom!.name,
      content: [bom!.name, ...parsedSbom.components.slice(0, 20).map((c) => c.name).filter(Boolean)].join(
        "\n",
      ),
    });
    for (const e of evidenceRows) {
      const digest = [e.title, e.evidenceType, e.fileName, e.url, e.note].filter(Boolean).join("\n");
      if (digest.trim()) {
        embedJobs.push({ sourceType: "evidence", sourceId: e.id, title: e.title, content: digest });
      }
    }
    for (const row of artifactRows) {
      const sections = row.content?.sections ?? [];
      const label = ARTIFACT_LABELS[row.artifactType as ArtifactType] ?? row.artifactType;
      const digest = [label, ...sections.map((s) => `${s.label}\n${s.body}`)]
        .filter(Boolean)
        .join("\n\n");
      if (digest.trim()) {
        embedJobs.push({ sourceType: "artifact", sourceId: row.id, title: label, content: digest });
      }
    }

    console.log(
      `[seed:demo] flow "${flow!.name}" (${CRA_FLOW_VALUES.steps.length} steps), SBOM ` +
        `"${bom!.name}" (${parsedSbom.components.length} components, ${bomFindings.length} findings), ` +
        `flow run #${flowRun!.id}.`,
    );

    console.log(
      `[seed:demo] assessment #${aid} "${product.name}": grade ${grade.overallGrade} ` +
        `(${grade.overallScore}/100), ${grade.blockerCount} blocker(s), ${reqs.length} requirements, ` +
        `${evidenceRows.length} evidence, ${built.length} artifacts.`,
    );
  });

  // --- Example finalised executive report ------------------------------------
  // Built with the same engine the API uses, from the just-committed demo data
  // (snapshot reads run on the pool, hence after the transaction). The four
  // narrative sections are curated exemplar prose interpolated with live
  // snapshot numbers — the seed never spends LLM tokens, yet the demo opens on
  // a complete, finalised briefing.
  const reportSnapshot = await buildAssessmentSnapshot(demoAssessmentId);
  if (reportSnapshot) {
    const reportOptions: ReportOptions = {
      includeAnnexes: true,
      includeEvidenceRegister: true,
      includeIncidentDetail: true,
    };
    const registry = buildCitationRegistry(reportSnapshot, reportOptions);
    const reportTitle = defaultReportTitle(reportSnapshot, "briefing");
    const { sections } = planSections(reportSnapshot, "briefing", "board", reportOptions, registry, reportTitle);
    const cite = (key: string): string => {
      const hit = registry.citations.find((c) => c.key === key);
      return hit ? ` [${hit.n}]` : "";
    };
    const snap = reportSnapshot;
    const weakestTheme = [...snap.themes].sort((a, b) => a.score - b.score)[0];
    const severeGaps = snap.gaps.filter((g) => g.riskRating === "critical" || g.riskRating === "high").length;
    const nextDeadline = snap.deadlines
      .filter((d) => !d.done)
      .sort((a, b) => a.dueAt.localeCompare(b.dueAt))[0];
    const openIncidents = snap.incidents.filter((i) => i.status === "open").length;
    const fmtDate = (iso: string): string => new Date(iso).toISOString().slice(0, 10);
    const canned: Record<string, string> = {
      executive_summary: [
        `**${snap.product.name} stands at grade ${snap.grade.overallGrade} (${snap.grade.overallScore}/100) against the Cyber Resilience Act and is not yet ready for the EU declaration of conformity.**${cite("reg:cra")} Of ${snap.readiness.total} applicable requirements, ${snap.readiness.met} are met, ${snap.readiness.partial} are partially met and ${snap.readiness.open} remain open; ${snap.grade.blockerCount} finding(s) currently block attestation.`,
        `The assessment proceeds under the ${snap.assessment.routeName ?? "internal control"} route as ${snap.assessment.className ?? "a default-class product"}, which keeps conformity demonstrable by internal control provided the essential requirements are evidenced.${cite("bib:blue-guide")} Control coverage is weakest in ${weakestTheme ? weakestTheme.name.toLowerCase() : "vulnerability handling"} (${weakestTheme?.score ?? 0}/100), where the open items concentrate.`,
        `The corrective priority is unambiguous: retire the ${severeGaps} critical- and high-rated gap(s) first${nextDeadline ? `, ahead of the ${nextDeadline.label.toLowerCase()} falling due on ${fmtDate(nextDeadline.dueAt)}` : ""}. On current evidence the trajectory to a defensible attestation position is a focused quarter of remediation, not a redesign.`,
      ].join("\n\n"),
      key_findings: [
        `- **Attestation is blocked by ${snap.grade.blockerCount} unresolved finding(s).** The grading model caps the overall grade while any blocker stays open; the ${snap.grade.overallScore}/100 score overstates comfort if these are read as ordinary backlog.`,
        `- **${weakestTheme ? weakestTheme.name : "Vulnerability handling"} is the weakest control theme at ${weakestTheme?.score ?? 0}/100.** ${weakestTheme ? `${weakestTheme.open} of its ${weakestTheme.total} requirements are open` : "Multiple requirements are open"} and they carry the highest risk ratings in the register.`,
        `- **${severeGaps} gap(s) are rated critical or high.** These map directly to Annex I essential requirements and would be the first items examined under market surveillance.${cite("reg:cra")}`,
        snap.boms.length
          ? `- **Supply-chain visibility is in place (${snap.boms[0]!.componentCount} components on record) but ${snap.upstreamNotificationGaps} upstream notification(s) under Article 13(6) remain outstanding.** Actively exploited component vulnerabilities must be reported to the maintainer without undue delay.${cite("reg:cra")}`
          : `- **No software bill of materials has been ingested yet.** Component-level vulnerability exposure is currently invisible to the workbench.`,
        `- **${openIncidents ? `${openIncidents} reportable incident(s) are open with Article 14 clocks running.` : "No reportable incidents are currently open."}** ${openIncidents ? "Early-warning and notification deadlines are tracked to the hour in the incident register." : "The Article 14 posture is therefore untested; the response playbook should be rehearsed before it is needed."}`,
      ].join("\n"),
      risk_outlook: [
        `Over the next quarter the exposure concentrates in three places. First, statutory reporting: ${openIncidents ? `${openIncidents} open incident(s) carry live Article 14 clocks, and the 24-hour early-warning window leaves no slack for escalation by committee` : "no incident clocks are live today, but the 24-hour early-warning window leaves no room for an unrehearsed response"}.${cite("reg:cra")}`,
        `Second, the remediation backlog: ${snap.gaps.length} requirement(s) are open or partially met, ${severeGaps} of them rated critical or high. Left unremediated they compound — documentation, vulnerability handling and update obligations interlock, and market-surveillance authorities examine them as a system, not as a list.${cite("bib:blue-guide")}`,
        `Third, deadlines: ${nextDeadline ? `the nearest tracked deadline is the ${nextDeadline.label.toLowerCase()} on ${fmtDate(nextDeadline.dueAt)}` : "no statutory deadline is imminent"}, and the support-period commitments published to users assume the update-pipeline gaps are closed. The realistic cost of inaction is not a fine in isolation — it is suspended market access while corrective orders are worked through.`,
      ].join("\n\n"),
      decisions_requested: [
        `1. **Approve a dedicated remediation sprint for the ${snap.grade.blockerCount} attestation blocker(s).** Exit criterion: zero blockers in the readiness panel. Every week of delay extends the exposure window under Annex I.`,
        `2. **Fund the ${weakestTheme ? weakestTheme.name.toLowerCase() : "vulnerability handling"} uplift.** The theme scores ${weakestTheme?.score ?? 0}/100 and holds the register's highest-rated risks; it is the single largest lever on the overall grade.${cite("reg:cra")}`,
        `3. **Mandate closure of the ${snap.upstreamNotificationGaps} outstanding Article 13(6) upstream notification(s).** These are transmittable today from the BOM vault at no engineering cost.${cite("reg:cra")}`,
        `4. **Set the attestation date.** Fix a target for issuing the EU declaration of conformity and review against it monthly — drift against a fixed date is the earliest honest signal that this programme needs escalation.${cite("bib:768-2008")}`,
      ].join("\n"),
    };
    const readySections = sections.map((sec) =>
      sec.kind === "ai"
        ? {
            ...sec,
            status: "ready" as const,
            contentMd: canned[sec.key] ?? "_To be drafted._",
            html: renderMarkdown(canned[sec.key] ?? "_To be drafted._"),
          }
        : sec,
    );
    const reportActor = `member:${OWNERS[0]!}`;
    await db.transaction(async (tx) => {
      const insertedReports = await tx
        .insert(conformityReportsTable)
        .values({
          scope: "assessment",
          assessmentId: demoAssessmentId,
          reportType: "briefing",
          audience: "board",
          status: "final",
          title: reportTitle,
          options: reportOptions,
          dataSnapshot: reportSnapshot as unknown as Record<string, unknown>,
          citations: registry.citations,
          sections: readySections,
          createdBy: reportActor,
        })
        .returning();
      await tx.insert(conformityActivityTable).values([
        {
          assessmentId: demoAssessmentId,
          entityType: "report",
          entityId: insertedReports[0]!.id,
          action: "created",
          actor: reportActor,
          source: "seed",
          summary: `Report "${reportTitle}" (Executive Briefing, board) generation started`,
        },
        {
          assessmentId: demoAssessmentId,
          entityType: "report",
          entityId: insertedReports[0]!.id,
          action: "completed",
          actor: reportActor,
          source: "seed",
          summary: `Report "${reportTitle}" finalised`,
        },
      ]);
    });
    console.log(`[seed:demo] example executive report "${reportTitle}" (briefing, board, final).`);
  }

  // --- Reset sequences so auto-increment IDs never collision with seeded rows ---
  try {
    await db.execute(sql`SELECT setval(pg_get_serial_sequence('conformity_members', 'id'), COALESCE((SELECT max(id) FROM conformity_members), 1));`);
    await db.execute(sql`SELECT setval(pg_get_serial_sequence('conformity_activity', 'id'), COALESCE((SELECT max(id) FROM conformity_activity), 1));`);
    await db.execute(sql`SELECT setval(pg_get_serial_sequence('conformity_products', 'id'), COALESCE((SELECT max(id) FROM conformity_products), 1));`);
    await db.execute(sql`SELECT setval(pg_get_serial_sequence('conformity_assessments', 'id'), COALESCE((SELECT max(id) FROM conformity_assessments), 1));`);
    console.log("[seed:demo] PostgreSQL sequences synchronized successfully.");
  } catch (seqErr) {
    console.warn("[seed:demo] Sequence reset warning:", seqErr);
  }

  // --- Best-effort workspace embeddings (network) ---
  // Generated AFTER the transaction commits so an unreachable embeddings
  // provider (no key / offline CI) never rolls back or fails the seed. If the
  // first call fails we stop trying, to avoid a slow cascade of timeouts.
  let embedded = 0;
  for (const job of embedJobs) {
    try {
      const embedding = await embedText(job.content);
      await db.insert(conformityEmbeddingsTable).values({
        assessmentId: demoAssessmentId,
        sourceType: job.sourceType,
        sourceId: job.sourceId,
        title: job.title,
        content: job.content,
        embedding,
      });
      embedded++;
    } catch (err) {
      console.warn(
        `[seed:demo] embeddings unavailable (${embedded}/${embedJobs.length} done); ` +
          `assistant workspace-awareness will be limited:`,
        err instanceof Error ? err.message : err,
      );
      break;
    }
  }
  console.log(`[seed:demo] embedded ${embedded}/${embedJobs.length} workspace source(s).`);
}
