/**
 * PSIRT / coordinated-vulnerability-disclosure module (Annex I Part II CRA).
 *
 * Three surfaces:
 * 1. PUBLIC (no auth, abuse-protected): CVD intake POST, published advisories,
 *    published per-product security policies. The intake takes a free-text
 *    product name so the product catalogue is never enumerable from outside.
 * 2. AUTHED workbench: per-product PSIRT profile, the vulnerability-report
 *    triage queue with a validated remediation lifecycle, advisory authoring.
 * 3. Publishing: advisories are draft → published; published advisories are
 *    immutable and undeletable (they are public statements of record).
 *
 * Demo role is read-only (mutations 403), matching the execution layer.
 * Every lifecycle change appends to the report's own event ledger AND the
 * workspace activity feed in the same transaction.
 */
import { Router, type IRouter } from "express";
/**
 * Accept only https:// URLs (or blank) for fields that are rendered as
 * public anchor hrefs on the security page, so a stored javascript:/data:
 * URL can never execute in a visitor's browser.
 */
function isHttpsUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}
import { desc, eq, sql } from "drizzle-orm";
import {
  db,
  conformityPsirtProfilesTable,
  conformityVulnReportsTable,
  conformityVulnReportEventsTable,
  conformityAdvisoriesTable,
  conformityProductsTable,
  conformityActivityTable,
  VULN_REPORT_STATUSES,
  type VulnReportStatus,
  type ConformityVulnReportRow,
  type ConformityAdvisoryRow,
  type ConformityPsirtProfileRow,
} from "@workspace/db";
import {
  SubmitConformityVulnReportBody,
  SubmitConformityVulnReportResponse,
  ListPublicSecurityAdvisoriesResponse,
  GetPublicSecurityPolicyResponse,
  GetConformityPsirtProfileParams,
  GetConformityPsirtProfileResponse,
  UpdateConformityPsirtProfileParams,
  UpdateConformityPsirtProfileBody,
  UpdateConformityPsirtProfileResponse,
  ListConformityVulnReportsResponse,
  UpdateConformityVulnReportParams,
  UpdateConformityVulnReportBody,
  UpdateConformityVulnReportResponse,
  ListConformityVulnReportEventsParams,
  ListConformityVulnReportEventsResponse,
  ListConformityAdvisoriesResponse,
  CreateConformityAdvisoryBody,
  CreateConformityAdvisoryResponse,
  UpdateConformityAdvisoryParams,
  UpdateConformityAdvisoryBody,
  UpdateConformityAdvisoryResponse,
  DeleteConformityAdvisoryParams,
  DeleteConformityAdvisoryResponse,
  PublishConformityAdvisoryParams,
  PublishConformityAdvisoryResponse,
} from "@workspace/api-zod";
import { requireAuth, getSession } from "../lib/adminAuth";
import { rateLimit } from "../middlewares/rateLimit";

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function actorOf(req: Parameters<typeof getSession>[0]): string {
  const session = getSession(req);
  if (!session) return "";
  return `${session.role}:${session.username}`;
}

/** Valid forward transitions of the remediation lifecycle. */
const VULN_TRANSITIONS: Record<VulnReportStatus, VulnReportStatus[]> = {
  received: ["triaged"],
  triaged: ["confirmed", "rejected"],
  confirmed: ["fix_in_progress"],
  fix_in_progress: ["fix_available"],
  fix_available: ["disclosed"],
  rejected: [],
  disclosed: [],
};

/** Transaction result envelope so TS keeps the error/row union discriminated. */
type TxResult<T> = { error: 400 | 404 | 409; message?: string } | { row: T };

function isVulnStatus(s: string): s is VulnReportStatus {
  return (VULN_REPORT_STATUSES as readonly string[]).includes(s);
}

function toVulnReportDto(r: ConformityVulnReportRow) {
  return {
    id: r.id,
    productName: r.productName,
    productId: r.productId,
    reporterName: r.reporterName,
    reporterEmail: r.reporterEmail,
    title: r.title,
    description: r.description,
    affectedVersions: r.affectedVersions,
    claimedSeverity: r.claimedSeverity,
    assessedSeverity: r.assessedSeverity,
    status: r.status,
    owner: r.owner,
    vulnerabilityId: r.vulnerabilityId,
    resolutionNotes: r.resolutionNotes,
    disclosureDueAt: r.disclosureDueAt ? r.disclosureDueAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

function toAdvisoryDto(a: ConformityAdvisoryRow) {
  return {
    id: a.id,
    advisoryCode: a.advisoryCode,
    productId: a.productId,
    productName: a.productName,
    vulnReportId: a.vulnReportId,
    incidentId: a.incidentId,
    title: a.title,
    summary: a.summary,
    severity: a.severity,
    vulnerabilityId: a.vulnerabilityId,
    affectedVersions: a.affectedVersions,
    fixedVersions: a.fixedVersions,
    workarounds: a.workarounds,
    credits: a.credits,
    status: a.status,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
    createdBy: a.createdBy,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

/**
 * Disclosure-only view for the public advisories endpoint. NEVER include the
 * audit identity (createdBy) or internal linkage ids (vulnReportId,
 * incidentId, productId) — the public surface must not leak workbench
 * internals.
 */
function toPublicAdvisoryDto(a: ConformityAdvisoryRow) {
  return {
    id: a.id,
    advisoryCode: a.advisoryCode,
    productName: a.productName,
    title: a.title,
    summary: a.summary,
    severity: a.severity,
    vulnerabilityId: a.vulnerabilityId,
    affectedVersions: a.affectedVersions,
    fixedVersions: a.fixedVersions,
    workarounds: a.workarounds,
    credits: a.credits,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
  };
}

function toProfileDto(productId: number, p: ConformityPsirtProfileRow | undefined) {
  return {
    productId,
    contactEmail: p?.contactEmail ?? "",
    contactUrl: p?.contactUrl ?? "",
    policyText: p?.policyText ?? "",
    policyUrl: p?.policyUrl ?? "",
    disclosureDays: p?.disclosureDays ?? 90,
    updatedBy: p?.updatedBy ?? "",
    updatedAt: p?.updatedAt ? p.updatedAt.toISOString() : null,
  };
}

// ---------------------------------------------------------------------------
// Public surface (no auth) — registered BEFORE the demo read-only guard, all
// GET except the abuse-protected intake POST.
// ---------------------------------------------------------------------------

const intakeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyPrefix: "cvd-intake",
  message: "Too many vulnerability reports from this address. Please try again later.",
});

router.post(
  "/conformity/public/vulnerability-reports",
  intakeLimiter,
  async (req, res): Promise<void> => {
    const parsed = SubmitConformityVulnReportBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid report", issues: parsed.error.issues });
      return;
    }
    const body = parsed.data;
    // Honeypot: the `website` field is hidden from real users.
    if (typeof body.website === "string" && body.website.trim() !== "") {
      req.log.warn("CVD intake honeypot triggered");
      // Indistinguishable from success so bots learn nothing.
      res.status(201).json({ id: 0, message: "Thank you. Your report has been received." });
      return;
    }
    const [row] = await db.transaction(async (tx) => {
      const rows = await tx
        .insert(conformityVulnReportsTable)
        .values({
          productName: body.productName.trim(),
          title: body.title.trim(),
          description: body.description.trim(),
          affectedVersions: body.affectedVersions?.trim() ?? "",
          claimedSeverity: body.claimedSeverity ?? "",
          reporterName: body.reporterName?.trim() ?? "",
          reporterEmail: body.reporterEmail?.trim() ?? "",
        })
        .returning();
      await tx.insert(conformityVulnReportEventsTable).values({
        reportId: rows[0]!.id,
        fromStatus: "",
        toStatus: "received",
        actor: "public:reporter",
        note: "Report received via the public CVD intake.",
      });
      await tx.insert(conformityActivityTable).values({
        assessmentId: null,
        entityType: "vuln_report",
        entityId: rows[0]!.id,
        action: "created",
        actor: "public:reporter",
        source: "ui",
        summary: `Vulnerability report received: ${body.title.trim()}`,
      });
      return rows;
    });
    res
      .status(201)
      .json(
        SubmitConformityVulnReportResponse.parse({
          id: row!.id,
          message: "Thank you. Your report has been received.",
        }),
      );
  },
);

router.get("/conformity/public/advisories", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(conformityAdvisoriesTable)
    .where(eq(conformityAdvisoriesTable.status, "published"))
    .orderBy(desc(conformityAdvisoriesTable.publishedAt));
  res.json(ListPublicSecurityAdvisoriesResponse.parse(rows.map(toPublicAdvisoryDto)));
});

router.get("/conformity/public/security-policy", async (_req, res): Promise<void> => {
  // Only products WITH a configured contact are published — an unset profile
  // must never leak the product name.
  const rows = await db
    .select({
      productName: conformityProductsTable.name,
      contactEmail: conformityPsirtProfilesTable.contactEmail,
      contactUrl: conformityPsirtProfilesTable.contactUrl,
      policyText: conformityPsirtProfilesTable.policyText,
      policyUrl: conformityPsirtProfilesTable.policyUrl,
    })
    .from(conformityPsirtProfilesTable)
    .innerJoin(
      conformityProductsTable,
      eq(conformityPsirtProfilesTable.productId, conformityProductsTable.id),
    )
    .orderBy(conformityProductsTable.name);
  const published = rows.filter((r) => r.contactEmail.trim() !== "" || r.contactUrl.trim() !== "");
  res.json(GetPublicSecurityPolicyResponse.parse(published));
});

router.get("/conformity/public/products/:id/trust-center", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  const [product] = await db
    .select()
    .from(conformityProductsTable)
    .where(eq(conformityProductsTable.id, id));

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const [psirt] = await db
    .select()
    .from(conformityPsirtProfilesTable)
    .where(eq(conformityPsirtProfilesTable.productId, id));

  res.json({
    id: product.id,
    name: product.name,
    description: product.description,
    manufacturerName: product.manufacturerName,
    productType: product.productType,
    version: product.version,
    supportPeriodStart: product.supportPeriodStart,
    supportPeriodEnd: product.supportPeriodEnd,
    securityContactEmail: psirt?.contactEmail || "security@oxot.io",
    policyText: psirt?.policyText || "OXOT Coordinated Vulnerability Disclosure Policy compliant with CRA Article 14.",
    ceMarkStatus: "CE_COMPLIANT",
    declarationOfConformityUrl: `/api/conformity/public/products/${id}/doc`,
  });
});

// ---------------------------------------------------------------------------
// Demo read-only guard for everything below (workbench surface).
// ---------------------------------------------------------------------------

router.use((req, res, next): void => {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    next();
    return;
  }
  if (getSession(req)?.role === "demo" && process.env["DEMO_READONLY"] === "true") {
    res.status(403).json({ error: "The demo workspace is read-only." });
    return;
  }
  next();
});

// ---------------------------------------------------------------------------
// PSIRT profile (per product)
// ---------------------------------------------------------------------------

router.get(
  "/conformity/products/:id/psirt-profile",
  requireAuth,
  async (req, res): Promise<void> => {
    const { id } = GetConformityPsirtProfileParams.parse(req.params);
    const [product] = await db
      .select({ id: conformityProductsTable.id })
      .from(conformityProductsTable)
      .where(eq(conformityProductsTable.id, id))
      .limit(1);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const [profile] = await db
      .select()
      .from(conformityPsirtProfilesTable)
      .where(eq(conformityPsirtProfilesTable.productId, id))
      .limit(1);
    res.json(GetConformityPsirtProfileResponse.parse(toProfileDto(id, profile)));
  },
);

router.put(
  "/conformity/products/:id/psirt-profile",
  requireAuth,
  async (req, res): Promise<void> => {
    const { id } = UpdateConformityPsirtProfileParams.parse(req.params);
    const parsed = UpdateConformityPsirtProfileBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid profile", issues: parsed.error.issues });
      return;
    }
    const [product] = await db
      .select({ id: conformityProductsTable.id })
      .from(conformityProductsTable)
      .where(eq(conformityProductsTable.id, id))
      .limit(1);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const body = parsed.data;
    // The public /security page renders contactUrl and policyUrl as anchor
    // hrefs — only https:// (or blank) is allowed so stored javascript:/data:
    // URLs can never execute in a visitor's browser.
    for (const [field, value] of [
      ["contactUrl", body.contactUrl],
      ["policyUrl", body.policyUrl],
    ] as [string, string][]) {
      if (value.trim() !== "" && !isHttpsUrl(value)) {
        res.status(400).json({ error: `${field} must be an https:// URL` });
        return;
      }
    }
    const actor = actorOf(req);
    const [saved] = await db.transaction(async (tx) => {
      const rows = await tx
        .insert(conformityPsirtProfilesTable)
        .values({ productId: id, ...body, updatedBy: actor })
        .onConflictDoUpdate({
          target: conformityPsirtProfilesTable.productId,
          set: { ...body, updatedBy: actor, updatedAt: new Date() },
        })
        .returning();
      await tx.insert(conformityActivityTable).values({
        assessmentId: null,
        entityType: "psirt_profile",
        entityId: id,
        action: "updated",
        actor,
        source: "ui",
        summary: "PSIRT/CVD profile updated",
      });
      return rows;
    });
    res.json(UpdateConformityPsirtProfileResponse.parse(toProfileDto(id, saved)));
  },
);

// ---------------------------------------------------------------------------
// Vulnerability-report triage queue
// ---------------------------------------------------------------------------

router.get("/conformity/vuln-reports", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(conformityVulnReportsTable)
    .orderBy(desc(conformityVulnReportsTable.createdAt));
  res.json(ListConformityVulnReportsResponse.parse(rows.map(toVulnReportDto)));
});

router.patch(
  "/conformity/vuln-reports/:reportId",
  requireAuth,
  async (req, res): Promise<void> => {
    const { reportId } = UpdateConformityVulnReportParams.parse(req.params);
    const parsed = UpdateConformityVulnReportBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid update", issues: parsed.error.issues });
      return;
    }
    const body = parsed.data;
    const actor = actorOf(req);

    const result = await db.transaction(async (tx): Promise<TxResult<ConformityVulnReportRow>> => {
      const [current] = await tx
        .select()
        .from(conformityVulnReportsTable)
        .where(eq(conformityVulnReportsTable.id, reportId))
        .for("update");
      if (!current) return { error: 404 as const };

      const set: Partial<typeof conformityVulnReportsTable.$inferInsert> = {};
      if (body.productId !== undefined) {
        if (body.productId !== null) {
          const [product] = await tx
            .select({ id: conformityProductsTable.id })
            .from(conformityProductsTable)
            .where(eq(conformityProductsTable.id, body.productId))
            .limit(1);
          if (!product) return { error: 400 as const, message: "Unknown product" };
        }
        set.productId = body.productId;
      }
      if (body.assessedSeverity !== undefined) set.assessedSeverity = body.assessedSeverity;
      if (body.owner !== undefined) set.owner = body.owner;
      if (body.vulnerabilityId !== undefined) set.vulnerabilityId = body.vulnerabilityId;
      if (body.resolutionNotes !== undefined) set.resolutionNotes = body.resolutionNotes;

      let transitioned = false;
      if (body.status !== undefined) {
        const from = current.status;
        if (!isVulnStatus(from) || !VULN_TRANSITIONS[from].includes(body.status)) {
          return {
            error: 400 as const,
            message: `Invalid transition ${from} → ${body.status}. Allowed next: ${
              isVulnStatus(from) ? VULN_TRANSITIONS[from].join(", ") || "none (terminal)" : "unknown"
            }.`,
          };
        }
        set.status = body.status;
        transitioned = true;
        // Entering triage derives the coordinated-disclosure target from the
        // mapped product's PSIRT profile (default 90 days).
        if (body.status === "triaged" && !current.disclosureDueAt) {
          const productId = set.productId !== undefined ? set.productId : current.productId;
          let days = 90;
          if (productId != null) {
            const [profile] = await tx
              .select({ disclosureDays: conformityPsirtProfilesTable.disclosureDays })
              .from(conformityPsirtProfilesTable)
              .where(eq(conformityPsirtProfilesTable.productId, productId))
              .limit(1);
            if (profile) days = profile.disclosureDays;
          }
          set.disclosureDueAt = new Date(current.createdAt.getTime() + days * 24 * 60 * 60 * 1000);
        }
      }

      if (Object.keys(set).length === 0) {
        // Semantic no-op: skip the UPDATE entirely (ledger-atomicity rule).
        return { row: current };
      }
      const [updated] = await tx
        .update(conformityVulnReportsTable)
        .set(set)
        .where(eq(conformityVulnReportsTable.id, reportId))
        .returning();
      if (transitioned) {
        await tx.insert(conformityVulnReportEventsTable).values({
          reportId,
          fromStatus: current.status,
          toStatus: body.status!,
          actor,
          note: body.note ?? "",
        });
        await tx.insert(conformityActivityTable).values({
          assessmentId: null,
          entityType: "vuln_report",
          entityId: reportId,
          action: body.status!,
          actor,
          source: "ui",
          summary: `Vulnerability report ${current.status} → ${body.status}: ${current.title}`,
        });
      }
      return { row: updated! };
    });

    if ("error" in result) {
      res
        .status(result.error)
        .json({ error: result.error === 404 ? "Report not found" : result.message });
      return;
    }
    res.json(UpdateConformityVulnReportResponse.parse(toVulnReportDto(result.row)));
  },
);

router.get(
  "/conformity/vuln-reports/:reportId/events",
  requireAuth,
  async (req, res): Promise<void> => {
    const { reportId } = ListConformityVulnReportEventsParams.parse(req.params);
    const rows = await db
      .select()
      .from(conformityVulnReportEventsTable)
      .where(eq(conformityVulnReportEventsTable.reportId, reportId))
      .orderBy(desc(conformityVulnReportEventsTable.createdAt));
    res.json(
      ListConformityVulnReportEventsResponse.parse(
        rows.map((e) => ({
          id: e.id,
          reportId: e.reportId,
          fromStatus: e.fromStatus,
          toStatus: e.toStatus,
          actor: e.actor,
          note: e.note,
          createdAt: e.createdAt.toISOString(),
        })),
      ),
    );
  },
);

// ---------------------------------------------------------------------------
// Advisories
// ---------------------------------------------------------------------------

/** Next OXOT-SA-<year>-<seq> code; race-safe via advisory lock on the year. */
async function nextAdvisoryCode(tx: Parameters<Parameters<typeof db.transaction>[0]>[0]): Promise<string> {
  const year = new Date().getUTCFullYear();
  await tx.execute(sql`SELECT pg_advisory_xact_lock(824700, ${year})`);
  const rows = await tx
    .select({ code: conformityAdvisoriesTable.advisoryCode })
    .from(conformityAdvisoriesTable)
    .where(sql`${conformityAdvisoriesTable.advisoryCode} LIKE ${`OXOT-SA-${year}-%`}`);
  const max = rows.reduce((m, r) => {
    const n = Number.parseInt(r.code.split("-").pop() ?? "0", 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `OXOT-SA-${year}-${String(max + 1).padStart(3, "0")}`;
}

router.get("/conformity/advisories", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(conformityAdvisoriesTable)
    .orderBy(desc(conformityAdvisoriesTable.createdAt));
  res.json(ListConformityAdvisoriesResponse.parse(rows.map(toAdvisoryDto)));
});

router.post("/conformity/advisories", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateConformityAdvisoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid advisory", issues: parsed.error.issues });
    return;
  }
  const body = parsed.data;
  const actor = actorOf(req);
  const created = await db.transaction(async (tx) => {
    let productName = "";
    if (body.productId != null) {
      const [product] = await tx
        .select({ name: conformityProductsTable.name })
        .from(conformityProductsTable)
        .where(eq(conformityProductsTable.id, body.productId))
        .limit(1);
      if (!product) return { error: "Unknown product" };
      productName = product.name;
    }
    const advisoryCode = await nextAdvisoryCode(tx);
    const rows = await tx
      .insert(conformityAdvisoriesTable)
      .values({
        advisoryCode,
        productId: body.productId ?? null,
        productName,
        vulnReportId: body.vulnReportId ?? null,
        incidentId: body.incidentId ?? null,
        title: body.title.trim(),
        summary: body.summary ?? "",
        severity: body.severity,
        vulnerabilityId: body.vulnerabilityId ?? "",
        affectedVersions: body.affectedVersions ?? "",
        fixedVersions: body.fixedVersions ?? "",
        workarounds: body.workarounds ?? "",
        credits: body.credits ?? "",
        createdBy: actor,
      })
      .returning();
    await tx.insert(conformityActivityTable).values({
      assessmentId: null,
      entityType: "advisory",
      entityId: rows[0]!.id,
      action: "created",
      actor,
      source: "ui",
      summary: `Advisory drafted: ${advisoryCode} — ${body.title.trim()}`,
    });
    return { row: rows[0]! };
  });
  if ("error" in created) {
    res.status(400).json({ error: created.error });
    return;
  }
  res.status(201).json(CreateConformityAdvisoryResponse.parse(toAdvisoryDto(created.row)));
});

router.patch(
  "/conformity/advisories/:advisoryId",
  requireAuth,
  async (req, res): Promise<void> => {
    const { advisoryId } = UpdateConformityAdvisoryParams.parse(req.params);
    const parsed = UpdateConformityAdvisoryBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid update", issues: parsed.error.issues });
      return;
    }
    const body = parsed.data;
    const actor = actorOf(req);
    const result = await db.transaction(async (tx): Promise<TxResult<ConformityAdvisoryRow>> => {
      const [current] = await tx
        .select()
        .from(conformityAdvisoriesTable)
        .where(eq(conformityAdvisoriesTable.id, advisoryId))
        .for("update");
      if (!current) return { error: 404 as const };
      if (current.status === "published") {
        return { error: 409 as const, message: "Published advisories are immutable." };
      }
      const set: Partial<typeof conformityAdvisoriesTable.$inferInsert> = {};
      if (body.productId !== undefined) {
        if (body.productId !== null) {
          const [product] = await tx
            .select({ name: conformityProductsTable.name })
            .from(conformityProductsTable)
            .where(eq(conformityProductsTable.id, body.productId))
            .limit(1);
          if (!product) return { error: 400 as const, message: "Unknown product" };
          set.productName = product.name;
        } else {
          set.productName = "";
        }
        set.productId = body.productId;
      }
      if (body.vulnReportId !== undefined) set.vulnReportId = body.vulnReportId;
      if (body.incidentId !== undefined) set.incidentId = body.incidentId;
      if (body.title !== undefined) set.title = body.title.trim();
      if (body.summary !== undefined) set.summary = body.summary;
      if (body.severity !== undefined) set.severity = body.severity;
      if (body.vulnerabilityId !== undefined) set.vulnerabilityId = body.vulnerabilityId;
      if (body.affectedVersions !== undefined) set.affectedVersions = body.affectedVersions;
      if (body.fixedVersions !== undefined) set.fixedVersions = body.fixedVersions;
      if (body.workarounds !== undefined) set.workarounds = body.workarounds;
      if (body.credits !== undefined) set.credits = body.credits;
      if (Object.keys(set).length === 0) return { row: current };
      const [updated] = await tx
        .update(conformityAdvisoriesTable)
        .set(set)
        .where(eq(conformityAdvisoriesTable.id, advisoryId))
        .returning();
      await tx.insert(conformityActivityTable).values({
        assessmentId: null,
        entityType: "advisory",
        entityId: advisoryId,
        action: "updated",
        actor,
        source: "ui",
        summary: `Advisory updated: ${current.advisoryCode}`,
      });
      return { row: updated! };
    });
    if ("error" in result) {
      res
        .status(result.error)
        .json({ error: result.error === 404 ? "Advisory not found" : result.message });
      return;
    }
    res.json(UpdateConformityAdvisoryResponse.parse(toAdvisoryDto(result.row)));
  },
);

router.delete(
  "/conformity/advisories/:advisoryId",
  requireAuth,
  async (req, res): Promise<void> => {
    const { advisoryId } = DeleteConformityAdvisoryParams.parse(req.params);
    const actor = actorOf(req);
    const result = await db.transaction(
      async (tx): Promise<{ error: 400 | 404 | 409; message?: string } | { ok: true }> => {
      const [current] = await tx
        .select()
        .from(conformityAdvisoriesTable)
        .where(eq(conformityAdvisoriesTable.id, advisoryId))
        .for("update");
      if (!current) return { error: 404 as const };
      if (current.status === "published") {
        return { error: 409 as const, message: "Published advisories cannot be deleted." };
      }
      await tx.delete(conformityAdvisoriesTable).where(eq(conformityAdvisoriesTable.id, advisoryId));
      await tx.insert(conformityActivityTable).values({
        assessmentId: null,
        entityType: "advisory",
        entityId: advisoryId,
        action: "deleted",
        actor,
        source: "ui",
        summary: `Draft advisory deleted: ${current.advisoryCode}`,
      });
      return { ok: true as const };
    });
    if ("error" in result) {
      res
        .status(result.error)
        .json({ error: result.error === 404 ? "Advisory not found" : result.message });
      return;
    }
    res.json(DeleteConformityAdvisoryResponse.parse({ ok: true }));
  },
);

router.post(
  "/conformity/advisories/:advisoryId/publish",
  requireAuth,
  async (req, res): Promise<void> => {
    const { advisoryId } = PublishConformityAdvisoryParams.parse(req.params);
    const actor = actorOf(req);
    const result = await db.transaction(async (tx): Promise<TxResult<ConformityAdvisoryRow>> => {
      const [current] = await tx
        .select()
        .from(conformityAdvisoriesTable)
        .where(eq(conformityAdvisoriesTable.id, advisoryId))
        .for("update");
      if (!current) return { error: 404 as const };
      if (current.status === "published") return { row: current }; // idempotent
      // Completeness gate: a public advisory must actually inform users
      // (Annex I Part II (4) CRA).
      const missing: string[] = [];
      if (!current.title.trim()) missing.push("title");
      if (!current.summary.trim()) missing.push("summary");
      if (!current.productName.trim()) missing.push("product");
      if (!current.affectedVersions.trim()) missing.push("affected versions");
      if (!current.fixedVersions.trim() && !current.workarounds.trim())
        missing.push("fixed versions or workarounds");
      if (missing.length > 0) {
        return {
          error: 400 as const,
          message: `Cannot publish — missing: ${missing.join(", ")}.`,
        };
      }
      const [updated] = await tx
        .update(conformityAdvisoriesTable)
        .set({ status: "published", publishedAt: new Date() })
        .where(eq(conformityAdvisoriesTable.id, advisoryId))
        .returning();
      await tx.insert(conformityActivityTable).values({
        assessmentId: null,
        entityType: "advisory",
        entityId: advisoryId,
        action: "published",
        actor,
        source: "ui",
        summary: `Advisory published: ${current.advisoryCode} — ${current.title}`,
      });
      return { row: updated! };
    });
    if ("error" in result) {
      res
        .status(result.error)
        .json({ error: result.error === 404 ? "Advisory not found" : result.message });
      return;
    }
    res.json(PublishConformityAdvisoryResponse.parse(toAdvisoryDto(result.row)));
  },
);

export default router;
