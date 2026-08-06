import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import {
  db,
  regulationsTable,
  conformityThemesTable,
  productClassesTable,
  conformityRoutesTable,
  requirementsTable,
  requirementMappingsTable,
  type RegulationRow,
  type RequirementRow,
  type RequirementMappingRow,
} from "@workspace/db";
import {
  GetConformitySummaryResponse,
  ListRegulationsResponse,
  GetRegulationParams,
  GetRegulationResponse,
  ListThemesResponse,
  ListRequirementsQueryParams,
  ListRequirementsResponse,
  GetRequirementParams,
  GetRequirementResponse,
  GetMappingMatrixResponse,
  ListSourceDocumentsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

/** Natural key for a requirement, used to resolve cross-regulation mappings. */
const reqKey = (regulationKey: string, refCode: string): string =>
  `${regulationKey}::${refCode}`;

/** Count, per requirement natural key, how many mappings touch it (as source or target). */
function buildMappingCounts(
  mappings: RequirementMappingRow[],
): Map<string, number> {
  const counts = new Map<string, number>();
  const bump = (k: string) => counts.set(k, (counts.get(k) ?? 0) + 1);
  for (const m of mappings) {
    bump(reqKey(m.sourceRegulationKey, m.sourceRefCode));
    bump(reqKey(m.targetRegulationKey, m.targetRefCode));
  }
  return counts;
}

function toKeyDates(row: RegulationRow): { regulationKey?: string; date: string; label: string }[] {
  const raw = (row.keyDates ?? []) as { date: string; label: string }[];
  return raw.map((d) => ({ regulationKey: row.key, date: d.date, label: d.label }));
}

router.get("/conformity/summary", async (_req, res): Promise<void> => {
  const [regulations, requirements, themes, mappings] = await Promise.all([
    db.select().from(regulationsTable).orderBy(asc(regulationsTable.sortOrder)),
    db.select().from(requirementsTable),
    db.select().from(conformityThemesTable),
    db.select().from(requirementMappingsTable),
  ]);

  const reqCountByReg = new Map<string, number>();
  for (const r of requirements) {
    reqCountByReg.set(r.regulationKey, (reqCountByReg.get(r.regulationKey) ?? 0) + 1);
  }

  const keyDates = regulations
    .flatMap(toKeyDates)
    .sort((a, b) => a.date.localeCompare(b.date));

  res.json(
    GetConformitySummaryResponse.parse({
      regulationCount: regulations.length,
      requirementCount: requirements.length,
      themeCount: themes.length,
      mappingCount: mappings.length,
      regulations: regulations.map((r) => ({
        key: r.key,
        name: r.name,
        shortName: r.shortName,
        requirementCount: reqCountByReg.get(r.key) ?? 0,
      })),
      keyDates,
    }),
  );
});

function serializeRegulation(r: RegulationRow, requirementCount: number) {
  return {
    id: r.id,
    key: r.key,
    name: r.name,
    shortName: r.shortName,
    fullTitle: r.fullTitle,
    jurisdiction: r.jurisdiction,
    summary: r.summary,
    inForceDate: r.inForceDate,
    sourceUrl: r.sourceUrl,
    requirementCount,
    sortOrder: r.sortOrder,
    keyDates: toKeyDates(r),
  };
}

router.get("/conformity/regulations", async (_req, res): Promise<void> => {
  const [regulations, requirements] = await Promise.all([
    db.select().from(regulationsTable).orderBy(asc(regulationsTable.sortOrder)),
    db.select({ regulationKey: requirementsTable.regulationKey }).from(requirementsTable),
  ]);
  const count = new Map<string, number>();
  for (const r of requirements) {
    count.set(r.regulationKey, (count.get(r.regulationKey) ?? 0) + 1);
  }
  res.json(
    ListRegulationsResponse.parse(
      regulations.map((r) => serializeRegulation(r, count.get(r.key) ?? 0)),
    ),
  );
});

router.get("/conformity/regulations/:key", async (req, res): Promise<void> => {
  const { key } = GetRegulationParams.parse(req.params);
  const [reg] = await db
    .select()
    .from(regulationsTable)
    .where(eq(regulationsTable.key, key));
  if (!reg) {
    res.status(404).json({ error: "Regulation not found" });
    return;
  }
  const [classes, routes, requirements] = await Promise.all([
    db
      .select()
      .from(productClassesTable)
      .where(eq(productClassesTable.regulationKey, key))
      .orderBy(asc(productClassesTable.sortOrder)),
    db
      .select()
      .from(conformityRoutesTable)
      .where(eq(conformityRoutesTable.regulationKey, key))
      .orderBy(asc(conformityRoutesTable.sortOrder)),
    db
      .select({ id: requirementsTable.id })
      .from(requirementsTable)
      .where(eq(requirementsTable.regulationKey, key)),
  ]);

  res.json(
    GetRegulationResponse.parse({
      ...serializeRegulation(reg, requirements.length),
      classes: classes.map((c) => ({
        id: c.id,
        key: c.key,
        name: c.name,
        description: c.description,
        riskLevel: c.riskLevel,
        defaultRouteKey: c.defaultRouteKey,
        sortOrder: c.sortOrder,
      })),
      routes: routes.map((rt) => ({
        id: rt.id,
        key: rt.key,
        name: rt.name,
        description: rt.description,
        thirdPartyRequired: rt.thirdPartyRequired,
        appliesToClasses: (rt.appliesToClasses ?? []) as string[],
        sortOrder: rt.sortOrder,
      })),
    }),
  );
});

router.get("/conformity/themes", async (_req, res): Promise<void> => {
  const [themes, regulations, requirements] = await Promise.all([
    db.select().from(conformityThemesTable).orderBy(asc(conformityThemesTable.sortOrder)),
    db.select().from(regulationsTable).orderBy(asc(regulationsTable.sortOrder)),
    db.select().from(requirementsTable),
  ]);

  const shortNameByReg = new Map(regulations.map((r) => [r.key, r.shortName]));
  // theme -> regulation -> count
  const byTheme = new Map<string, Map<string, number>>();
  for (const req of requirements) {
    if (!req.themeKey) continue;
    let m = byTheme.get(req.themeKey);
    if (!m) {
      m = new Map();
      byTheme.set(req.themeKey, m);
    }
    m.set(req.regulationKey, (m.get(req.regulationKey) ?? 0) + 1);
  }

  res.json(
    ListThemesResponse.parse(
      themes.map((t) => {
        const perReg = byTheme.get(t.key) ?? new Map<string, number>();
        const coverage = regulations
          .filter((r) => (perReg.get(r.key) ?? 0) > 0)
          .map((r) => ({
            regulationKey: r.key,
            regulationShortName: shortNameByReg.get(r.key) ?? r.key,
            requirementCount: perReg.get(r.key) ?? 0,
          }));
        const totalRequirements = coverage.reduce((s, c) => s + c.requirementCount, 0);
        return {
          theme: {
            id: t.id,
            key: t.key,
            name: t.name,
            description: t.description,
            sortOrder: t.sortOrder,
          },
          totalRequirements,
          coverage,
        };
      }),
    ),
  );
});

router.get("/conformity/requirements", async (req, res): Promise<void> => {
  const query = ListRequirementsQueryParams.parse(req.query);
  const [requirements, regulations, themes, mappings] = await Promise.all([
    db.select().from(requirementsTable).orderBy(asc(requirementsTable.sortOrder)),
    db.select().from(regulationsTable),
    db.select().from(conformityThemesTable),
    db.select().from(requirementMappingsTable),
  ]);

  const shortNameByReg = new Map(regulations.map((r) => [r.key, r.shortName]));
  const themeNameByKey = new Map(themes.map((t) => [t.key, t.name]));
  const mappingCounts = buildMappingCounts(mappings);

  const q = query.q?.trim().toLowerCase();
  const filtered = requirements.filter((r) => {
    if (query.regulation && r.regulationKey !== query.regulation) return false;
    if (query.theme && r.themeKey !== query.theme) return false;
    if (query.obligationType && r.obligationType !== query.obligationType) return false;
    if (q) {
      const hay = `${r.refCode} ${r.title} ${r.description}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  res.json(
    ListRequirementsResponse.parse(
      filtered.map((r) => serializeRequirement(r, shortNameByReg, themeNameByKey, mappingCounts)),
    ),
  );
});

function serializeRequirement(
  r: RequirementRow,
  shortNameByReg: Map<string, string>,
  themeNameByKey: Map<string, string>,
  mappingCounts: Map<string, number>,
) {
  return {
    id: r.id,
    regulationKey: r.regulationKey,
    regulationShortName: shortNameByReg.get(r.regulationKey) ?? r.regulationKey,
    themeKey: r.themeKey,
    themeName: r.themeKey ? (themeNameByKey.get(r.themeKey) ?? null) : null,
    refCode: r.refCode,
    title: r.title,
    description: r.description,
    obligationType: r.obligationType,
    appliesTo: (r.appliesTo ?? []) as string[],
    mappingCount: mappingCounts.get(reqKey(r.regulationKey, r.refCode)) ?? 0,
    sortOrder: r.sortOrder,
  };
}

router.get("/conformity/requirements/:id", async (req, res): Promise<void> => {
  const { id } = GetRequirementParams.parse(req.params);
  const [requirement] = await db
    .select()
    .from(requirementsTable)
    .where(eq(requirementsTable.id, id));
  if (!requirement) {
    res.status(404).json({ error: "Requirement not found" });
    return;
  }

  const [requirements, regulations, themes, mappings] = await Promise.all([
    db.select().from(requirementsTable),
    db.select().from(regulationsTable),
    db.select().from(conformityThemesTable),
    db.select().from(requirementMappingsTable),
  ]);

  const shortNameByReg = new Map(regulations.map((r) => [r.key, r.shortName]));
  const themeNameByKey = new Map(themes.map((t) => [t.key, t.name]));
  const mappingCounts = buildMappingCounts(mappings);
  const byNaturalKey = new Map(requirements.map((r) => [reqKey(r.regulationKey, r.refCode), r]));

  const self = reqKey(requirement.regulationKey, requirement.refCode);
  const resolved: {
    requirementId: number;
    regulationKey: string;
    regulationShortName: string;
    refCode: string;
    title: string;
    relationship: string;
    direction: "outbound" | "inbound";
    note: string | null;
  }[] = [];
  for (const m of mappings) {
    const source = reqKey(m.sourceRegulationKey, m.sourceRefCode);
    const target = reqKey(m.targetRegulationKey, m.targetRefCode);
    let otherKey: string | null = null;
    // "outbound": this requirement is the mapping source; "inbound": it is the
    // target. Lets consumers disambiguate asymmetric relations like "supports".
    let direction: "outbound" | "inbound" = "outbound";
    if (source === self) {
      otherKey = target;
      direction = "outbound";
    } else if (target === self) {
      otherKey = source;
      direction = "inbound";
    }
    if (!otherKey) continue;
    const other = byNaturalKey.get(otherKey);
    if (!other) continue;
    resolved.push({
      requirementId: other.id,
      regulationKey: other.regulationKey,
      regulationShortName: shortNameByReg.get(other.regulationKey) ?? other.regulationKey,
      refCode: other.refCode,
      title: other.title,
      relationship: m.relationship,
      direction,
      note: m.note,
    });
  }
  resolved.sort((a, b) => a.regulationKey.localeCompare(b.regulationKey) || a.refCode.localeCompare(b.refCode));

  res.json(
    GetRequirementResponse.parse({
      ...serializeRequirement(requirement, shortNameByReg, themeNameByKey, mappingCounts),
      mappings: resolved,
    }),
  );
});

router.get("/conformity/mappings", async (_req, res): Promise<void> => {
  const [themes, regulations, requirements] = await Promise.all([
    db.select().from(conformityThemesTable).orderBy(asc(conformityThemesTable.sortOrder)),
    db.select().from(regulationsTable).orderBy(asc(regulationsTable.sortOrder)),
    db.select().from(requirementsTable).orderBy(asc(requirementsTable.sortOrder)),
  ]);

  const reqCountByReg = new Map<string, number>();
  for (const r of requirements) {
    reqCountByReg.set(r.regulationKey, (reqCountByReg.get(r.regulationKey) ?? 0) + 1);
  }

  // theme -> regulation -> refCodes
  const cellMap = new Map<string, string[]>();
  const cellKey = (themeKey: string, regKey: string) => `${themeKey}::${regKey}`;
  for (const r of requirements) {
    if (!r.themeKey) continue;
    const k = cellKey(r.themeKey, r.regulationKey);
    const arr = cellMap.get(k) ?? [];
    arr.push(r.refCode);
    cellMap.set(k, arr);
  }

  const cells: {
    themeKey: string;
    regulationKey: string;
    requirementCount: number;
    requirementRefs: string[];
  }[] = [];
  for (const t of themes) {
    for (const r of regulations) {
      const refs = cellMap.get(cellKey(t.key, r.key)) ?? [];
      cells.push({
        themeKey: t.key,
        regulationKey: r.key,
        requirementCount: refs.length,
        requirementRefs: refs,
      });
    }
  }

  res.json(
    GetMappingMatrixResponse.parse({
      themes: themes.map((t) => ({
        id: t.id,
        key: t.key,
        name: t.name,
        description: t.description,
        sortOrder: t.sortOrder,
      })),
      regulations: regulations.map((r) => ({
        key: r.key,
        name: r.name,
        shortName: r.shortName,
        requirementCount: reqCountByReg.get(r.key) ?? 0,
      })),
      cells,
    }),
  );
});

/**
 * The underlying source documents backing the library. These are static files
 * served from the conformity web artifact's public dir at /conformity/sources/.
 */
const SOURCE_DOCUMENTS: {
  title: string;
  filename: string;
  kind: string;
  description: string;
  regulationKey: string | null;
}[] = [
  {
    title: "CRA Obligations — Product & Vendor Matrix",
    filename: "cra-obligations.md",
    kind: "Research",
    description:
      "Deep research mapping CRA product categories to real commercial products, vendors, and origins, with Class I/II/Critical notes.",
    regulationKey: "cra",
  },
  {
    title: "CRA Obligations (Part 2)",
    filename: "cra-obligations-2.md",
    kind: "Research",
    description: "Continuation of the CRA obligations research and product classification analysis.",
    regulationKey: "cra",
  },
  {
    title: "CRA Security Attestation (Section 7)",
    filename: "cra-security-attestation-s7.md",
    kind: "Reference",
    description: "Working notes on CRA security attestation and Section 7 obligations.",
    regulationKey: "cra",
  },
  {
    title: "CRA & SBOM — Product Flows Research",
    filename: "cra-sbom-research.md",
    kind: "Research",
    description:
      "Research on CRA-relevant product flows into and within the EU, SBOM readiness, and the notified-body bottleneck.",
    regulationKey: "cra",
  },
  {
    title: "CRA Hyperscale Power System — P&ID Spec",
    filename: "cra-hyperscale-power-system-pid-spec.md",
    kind: "Example",
    description: "Worked product example: a hyperscale power system P&ID specification used to illustrate CRA scoping.",
    regulationKey: "cra",
  },
  {
    title: "CRA Supplier Cooling Readiness",
    filename: "cra-supplier-cooling-readiness.pdf",
    kind: "Reference",
    description: "Supplier cooling-readiness assessment used as a worked CRA supply-chain and readiness reference.",
    regulationKey: "cra",
  },
  {
    title: "PRD — CRA Conformity Application",
    filename: "prd-cra-conformity-application.md",
    kind: "PRD",
    description:
      "Product requirements document for the CRA conformity application: scope, personas, and the regulation knowledge & mapping engine.",
    regulationKey: "cra",
  },
  {
    title: "AI Act — Multi-Regulation Conformity Research",
    filename: "ai-act-cra-crosswalk.md",
    kind: "Research",
    description:
      "Research on serving the AI Act alongside CRA, Machinery, and IEC 62443: shared evidence model, conformity-path selection, and notified-body orchestration.",
    regulationKey: "ai_act",
  },
  {
    title: "IEC 62443 — Data Center Zones & Tiers",
    filename: "iec-62443-data-center-zones-and-tiers.pdf",
    kind: "Reference",
    description: "IEC 62443 zones, conduits, and tier model applied to data-center environments.",
    regulationKey: "iec_62443",
  },
  {
    title: "IEC 62443 — Compliance Workshop",
    filename: "iec-62443-compliance-workshop.pdf",
    kind: "Reference",
    description: "Workshop material walking through IEC 62443 compliance for industrial automation and control systems.",
    regulationKey: "iec_62443",
  },
  {
    title: "IEC 62443 — Deep Research",
    filename: "iec-62443-deep-research.docx",
    kind: "Research",
    description: "In-depth research on the IEC 62443 series (4-1 secure development lifecycle, 4-2 component requirements).",
    regulationKey: "iec_62443",
  },
  {
    title: "PRD — Digital Twin Report & Funnel",
    filename: "prd-digital-twin-report-and-funnel.txt",
    kind: "PRD",
    description: "Requirements for the digital-twin conformity report and lead funnel concept.",
    regulationKey: null,
  },
  {
    title: "CRA — Field Guide",
    filename: "cra-field-guide.md",
    kind: "Field Guide",
    description:
      "Comprehensive field guide to the Cyber Resilience Act: scope, product classes, obligations, conformity paths, and timelines.",
    regulationKey: "cra",
  },
  {
    title: "IEC 62443 — Field Guide",
    filename: "iec-62443-field-guide.md",
    kind: "Field Guide",
    description:
      "Field guide to the IEC 62443 series: security levels, zones and conduits, and the 4-1/4-2 requirement families.",
    regulationKey: "iec_62443",
  },
  {
    title: "EU AI Act — Field Guide",
    filename: "ai-act-field-guide.md",
    kind: "Field Guide",
    description:
      "Field guide to the EU AI Act: risk tiers, high-risk obligations, conformity assessment, and interplay with product regulations.",
    regulationKey: "ai_act",
  },
  {
    title: "Machinery Regulation — Field Guide",
    filename: "machinery-field-guide.md",
    kind: "Field Guide",
    description:
      "Field guide to the EU Machinery Regulation: essential health & safety requirements, conformity procedures, and digital documentation.",
    regulationKey: "machinery",
  },
  {
    title: "NIS2 — Field Guide",
    filename: "nis2-field-guide.md",
    kind: "Field Guide",
    description:
      "Field guide to the NIS2 Directive: covered entities, risk-management measures, incident reporting, and management accountability.",
    regulationKey: "nis2",
  },
  {
    title: "TS 50701 — Field Guide",
    filename: "ts-50701-field-guide.md",
    kind: "Field Guide",
    description:
      "Field guide to CLC/TS 50701 for railway cybersecurity: applying IEC 62443 concepts to the railway domain.",
    regulationKey: "ts_50701",
  },
  {
    title: "CRA CE Marking Pathways — Conformity Assessment Deep Reference",
    filename: "cra-ce-marking-pathways.md",
    kind: "Reference",
    description:
      "Deep reference on CRA conformity assessment: Module A / B+C / H and EUCC pathways, Notified-Body engagement, the Annex VII technical file, the Annex V Declaration of Conformity, and the NB capacity crisis.",
    regulationKey: "cra",
  },
  {
    title: "CRA ↔ NIS2 Class-Designation Interlock",
    filename: "cra-nis2-class-designation-interlock.pdf",
    kind: "Reference",
    description:
      "How NIS2 essential-entity status drives CRA product classification (IR (EU) 2025/2392): the 'intended for use by' trigger, Class I vs Class II, the reporting interlock via ENISA, and a worked Siemens SIMATIC S7 example.",
    regulationKey: "cra",
  },
  {
    title: "CRA Customer Journeys",
    filename: "cra-customer-journeys.pdf",
    kind: "Reference",
    description:
      "Entry points, exposure and engagement sequences for OT product suppliers (OEMs), system integrators, and asset owners / critical-infrastructure operators approaching CRA conformity.",
    regulationKey: "cra",
  },
  {
    title: "CRA Preparation Service — Module A Walkthrough",
    filename: "cra-preparation-service.key",
    kind: "Reference",
    description:
      "OXOT CRA service deck: a dual-perspective CRA readiness and IEC 62443 baseline assessment for equipment and OEM products — from operational IACS to a shippable product baseline meeting the CRA's 13 criteria and 8 processes.",
    regulationKey: "cra",
  },
  {
    title: "Data Center — TIA-942 Framework",
    filename: "data-center-tia-942.md",
    kind: "Reference",
    description:
      "The TIA-942 data-center infrastructure standard: the four resilience tiers, the 2005→2022 revision history, and the site, power, cooling, cabling, fire and physical-security elements of compliance.",
    regulationKey: "iec_62443",
  },
  {
    title: "TIA Family of Standards",
    filename: "tia-family-of-standards.md",
    kind: "Reference",
    description:
      "The TIA TR-42 hierarchy of telecommunications cabling-infrastructure standards for premises, data centers and industrial buildings — the 568 series, 569, 942-C, 1005-A, 862-C and related bulletins.",
    regulationKey: "iec_62443",
  },
  {
    title: "Datacenter Supplier Status to SL-3 and SL-4",
    filename: "datacenter-supplier-status-sl3-sl4.md",
    kind: "Research",
    description:
      "Certification-landscape research: no data-center-native OT product holds IEC 62443-4-2 SL-3 (and SL-4 exists nowhere), the five global SL-3 components, the SL-2 frontier, and category-by-category gap analysis.",
    regulationKey: "iec_62443",
  },
];

router.get("/conformity/sources", async (_req, res): Promise<void> => {
  res.json(
    ListSourceDocumentsResponse.parse(
      SOURCE_DOCUMENTS.map((d) => ({
        title: d.title,
        filename: d.filename,
        url: `/conformity/sources/${d.filename}`,
        kind: d.kind,
        description: d.description,
        regulationKey: d.regulationKey,
      })),
    ),
  );
});

export default router;
