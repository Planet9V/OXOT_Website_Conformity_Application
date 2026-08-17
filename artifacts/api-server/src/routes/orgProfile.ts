import { Router, type IRouter, type Request, type Response } from "express";
import { inArray } from "drizzle-orm";
import {
  db,
  orgRolesTable,
  orgRegulationsTable,
  regulationsTable,
  requirementsTable,
  conformityEvaluationsTable,
  conformityIncidentsTable,
  conformityIncidentSubmissionsTable,
  CANONICAL_ROLES,
  CANONICAL_ROLE_KEYS,
  termForRole,
} from "@workspace/db";
import { requireAuth } from "../lib/adminAuth";
import { assessReportingObligation } from "../lib/reportingObligation";
import { deriveStatus } from "../lib/statusDerivers";
import { defaultTeamRoleFor } from "../lib/teamRouting";

/**
 * The organisation's own profile: what it does, and which acts it is subject to.
 *
 * Single-tenant — one deployment, one organisation — so these are declarations
 * about that organisation rather than tenant records. Two separate questions,
 * because four of the five regulations modelled here regulate a "manufacturer":
 * role alone would show an OT hardware maker the AI Act duties it does not carry.
 *
 *   obligations in scope = (declared regulations) x (declared roles)
 *
 * Declaring anything here brings obligations into view. It never asserts
 * conformity with them — that assessment belongs to the manufacturer under
 * Art. 32, or to a notified body.
 */
const router: IRouter = Router();

/**
 * Evaluation state is recorded per assessment (`conformity_evaluations` is keyed
 * by assessmentId), but this surface is org-level. We therefore aggregate across
 * every assessment: an obligation counts as evidenced if any assessment has
 * moved it off `not_started`. Worst status wins so nothing is flattered — a
 * requirement that is `not_met` anywhere reads as `not_met` here.
 */
const STATUS_SEVERITY: Record<string, number> = {
  not_met: 5,
  partial: 4,
  in_progress: 3,
  not_started: 2,
  met: 1,
  not_applicable: 0,
};

function worstStatus(statuses: string[]): string {
  if (!statuses.length) return "not_started";
  return statuses.reduce((worst, s) =>
    (STATUS_SEVERITY[s] ?? 2) > (STATUS_SEVERITY[worst] ?? 2) ? s : worst,
  );
}

async function declaredRoleKeys(): Promise<string[]> {
  const rows = await db.select().from(orgRolesTable);
  return rows.filter((r) => r.isDeclared).map((r) => r.roleKey);
}

async function declaredRegulationKeys(): Promise<string[]> {
  const rows = await db.select().from(orgRegulationsTable);
  return rows.filter((r) => r.isDeclared).map((r) => r.regulationKey);
}

/** GET /conformity/org/profile — the two declarations, plus what is on offer. */
router.get("/conformity/org/profile", requireAuth, async (_req: Request, res: Response) => {
  const [roleRows, regRows, allRegulations] = await Promise.all([
    db.select().from(orgRolesTable),
    db.select().from(orgRegulationsTable),
    db.select().from(regulationsTable),
  ]);

  const roleState = new Map(roleRows.map((r) => [r.roleKey, r]));
  const regState = new Map(regRows.map((r) => [r.regulationKey, r]));

  res.json({
    roles: CANONICAL_ROLES.map((role) => {
      const row = roleState.get(role.key);
      return {
        key: role.key,
        label: role.label,
        summary: role.summary,
        // null where the role carries no CRA obligations of its own — an
        // operator is a downstream user (NIS2), and a system integrator only
        // acquires manufacturer duties via the Art. 22 transition.
        craArticle: role.craArticle,
        isDeclared: row?.isDeclared ?? false,
        effectiveFrom: row?.effectiveFrom ?? null,
        effectiveTo: row?.effectiveTo ?? null,
        note: row?.note ?? "",
      };
    }),
    regulations: allRegulations
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((reg) => ({
        key: reg.key,
        name: reg.name,
        shortName: reg.shortName,
        isDeclared: regState.get(reg.key)?.isDeclared ?? false,
        note: regState.get(reg.key)?.note ?? "",
      })),
  });
});

/** PUT /conformity/org/roles/:roleKey — declare or withdraw a role. */
router.put("/conformity/org/roles/:roleKey", requireAuth, async (req: Request, res: Response) => {
  const roleKey = String(req.params.roleKey);
  if (!(CANONICAL_ROLE_KEYS as readonly string[]).includes(roleKey)) {
    res.status(400).json({ error: `Unknown role "${roleKey}"`, allowed: CANONICAL_ROLE_KEYS });
    return;
  }
  const isDeclared = Boolean(req.body?.isDeclared);
  const values = {
    roleKey,
    isDeclared,
    effectiveFrom: req.body?.effectiveFrom ?? null,
    effectiveTo: req.body?.effectiveTo ?? null,
    note: String(req.body?.note ?? ""),
  };
  const [row] = await db
    .insert(orgRolesTable)
    .values(values)
    .onConflictDoUpdate({ target: orgRolesTable.roleKey, set: values })
    .returning();
  res.json(row);
});

/** PUT /conformity/org/regulations/:regulationKey — declare or withdraw an act. */
router.put(
  "/conformity/org/regulations/:regulationKey",
  requireAuth,
  async (req: Request, res: Response) => {
    const regulationKey = String(req.params.regulationKey);
    const known = await db.select().from(regulationsTable);
    if (!known.some((r) => r.key === regulationKey)) {
      res.status(400).json({
        error: `Unknown regulation "${regulationKey}"`,
        allowed: known.map((r) => r.key),
      });
      return;
    }
    const values = {
      regulationKey,
      isDeclared: Boolean(req.body?.isDeclared),
      note: String(req.body?.note ?? ""),
    };
    const [row] = await db
      .insert(orgRegulationsTable)
      .values(values)
      .onConflictDoUpdate({ target: orgRegulationsTable.regulationKey, set: values })
      .returning();
    res.json(row);
  },
);

/**
 * GET /conformity/org/obligations — everything this organisation actually owes,
 * derived from its two declarations. Returns an empty set when nothing is
 * declared; it never falls back to sample data.
 */
router.get("/conformity/org/obligations", requireAuth, async (_req: Request, res: Response) => {
  const [roles, regs] = await Promise.all([declaredRoleKeys(), declaredRegulationKeys()]);

  if (!roles.length || !regs.length) {
    res.json({
      declaredRoles: roles,
      declaredRegulations: regs,
      total: 0,
      obligations: [],
      // Tell the caller which declaration is missing rather than rendering zero
      // as though it were a clean bill of health.
      incomplete: !roles.length && !regs.length
        ? "no_roles_or_regulations_declared"
        : !roles.length
          ? "no_roles_declared"
          : "no_regulations_declared",
    });
    return;
  }

  const [reqRows, evalRows, incidentRows, submissionRows] = await Promise.all([
    db.select().from(requirementsTable).where(inArray(requirementsTable.regulationKey, regs)),
    db.select().from(conformityEvaluationsTable),
    db.select().from(conformityIncidentsTable),
    db.select().from(conformityIncidentSubmissionsTable),
  ]);

  /**
   * Article 14 is the one obligation whose status can be derived from the record
   * rather than typed by a person: either the reports were filed by their
   * deadlines or they were not. Deriving it stops an evaluation row reading
   * "met" while a 24-hour early warning sits unfiled and overdue.
   */
  const reporting = assessReportingObligation(incidentRows, submissionRows, new Date());

  // Group evaluation state by the natural key the reference layer uses.
  const byRef = new Map<string, typeof evalRows>();
  for (const e of evalRows) {
    const k = `${e.regulationKey}::${e.requirementRefCode}`;
    const list = byRef.get(k);
    if (list) list.push(e);
    else byRef.set(k, [e]);
  }

  const applicable = reqRows.filter((r) => {
    const appliesTo = Array.isArray(r.appliesTo) ? (r.appliesTo as string[]) : [];
    return appliesTo.some((a) => roles.includes(a));
  });

  /**
   * A declared act with NO seeded requirement rows would otherwise vanish from
   * this response — zero obligations reading like a clean bill of health for
   * an act nobody has modelled yet (that was RED's state until 11.1). Name
   * those acts so the caller can say so (11.4).
   */
  const seededRegs = new Set(reqRows.map((r) => r.regulationKey));
  const regulationsWithoutSeededContent = regs.filter((r) => !seededRegs.has(r)).sort();

  const obligations = applicable
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((r) => {
      const evals = byRef.get(`${r.regulationKey}::${r.refCode}`) ?? [];
      const appliesTo = Array.isArray(r.appliesTo) ? (r.appliesTo as string[]) : [];
      /**
       * A few obligations can be DERIVED from what the system holds rather than
       * from a status somebody typed. Which ones is a question about each act,
       * so it lives in the registry — adding an act means registering a deriver,
       * not editing this function.
       */
      const derived = deriveStatus(r.regulationKey, r.refCode, { reporting });
      return {
        regulationKey: r.regulationKey,
        refCode: r.refCode,
        title: r.title,
        description: r.description,
        obligationType: r.obligationType,
        themeKey: r.themeKey,
        appliesTo,
        // The regulator's own word for the role, so the UI can speak its language.
        roleTerms: appliesTo.map((a) => termForRole(a, r.regulationKey)),
        // Keyed by canonical role, so a role-scoped surface can say what THIS
        // role is called in THIS act without guessing from the flat list.
        roleTermByRole: Object.fromEntries(appliesTo.map((a) => [a, termForRole(a, r.regulationKey)])),
        // Derived where a deriver is registered; otherwise the worst recorded
        // evaluation, so nothing is flattered.
        status: derived ? derived.status : worstStatus(evals.map((e) => e.status)),
        derivedFrom: derived ? derived.derivedFrom : null,
        evaluationCount: evals.length,
        owners: [...new Set(evals.map((e) => e.owner).filter(Boolean))],
        // Internal routing DEFAULT (6.3): which team role's inbox this lands
        // in. Workflow scoping, not a statutory assignment — the act binds
        // the organisation, not a member of its staff.
        defaultTeamRole: defaultTeamRoleFor(r.themeKey),
        nextDueDate:
          evals
            .map((e) => e.dueDate)
            .filter((d): d is string => Boolean(d))
            .sort()[0] ?? null,
      };
    });

  res.json({
    declaredRoles: roles,
    declaredRegulations: regs,
    regulationsWithoutSeededContent,
    total: obligations.length,
    obligations,
  });
});

export default router;
