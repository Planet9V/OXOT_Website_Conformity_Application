import { Router, type IRouter } from "express";
import { asc, desc, eq, sql } from "drizzle-orm";
import {
  db,
  conformityMembersTable,
  conformityActivityTable,
  TEAM_ROLES,
  type ConformityMemberRow,
  type TeamRole,
} from "@workspace/db";
import { requireAuth, requireAdmin, getSession, reservedUsernames } from "../lib/adminAuth";
import { hashPassword, normalizeUsername, USERNAME_RE } from "../lib/teamMembers";

const router: IRouter = Router();

function actorOf(req: Parameters<typeof getSession>[0]): string {
  const session = getSession(req);
  return session ? `${session.role}:${session.username}` : "demo:oxotdemo";
}

function safeIsoString(val: any): string {
  if (!val) return new Date().toISOString();
  if (typeof val === "string") return val;
  if (val instanceof Date) return val.toISOString();
  try {
    return new Date(val).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function toDto(m: ConformityMemberRow) {
  return {
    id: m.id,
    username: m.username,
    displayName: m.displayName,
    position: m.position || "CRA Compliance Officer",
    email: m.email || `${m.username}@oxot.eu`,
    telephone: m.telephone || "+31 (0)20 555 0199",
    department: m.department || "Cybersecurity & Product Compliance",
    organization: m.organization || "OXOT Engineering B.V.",
    roleResponsibility: m.roleResponsibility || "Lead Assessor & PSIRT Coordinator",
    // One of TEAM_ROLES, or null while unassigned — never defaulted (D12).
    teamRole: m.teamRole ?? null,
    plainPassword: m.plainPassword || "Password123!",
    active: m.active,
    createdAt: safeIsoString(m.createdAt),
    updatedAt: safeIsoString(m.updatedAt),
  };
}

// Non-admin surfaces (PSIRT canvas, dropdowns) only need identity fields —
// never expose plainPassword outside the admin team-management page.
function toPublicDto(m: ConformityMemberRow) {
  const { plainPassword: _plainPassword, ...rest } = toDto(m);
  return rest;
}

/**
 * null clears the role (back to unassigned); undefined means "not in this
 * request". Anything else must be one of the four TEAM_ROLES — free text is
 * exactly what this column exists to replace.
 */
function parseTeamRole(raw: unknown): { ok: true; value: TeamRole | null } | { ok: false } {
  if (raw === null) return { ok: true, value: null };
  if (typeof raw === "string" && (TEAM_ROLES as readonly string[]).includes(raw)) {
    return { ok: true, value: raw as TeamRole };
  }
  return { ok: false };
}

const TEAM_ROLE_ERROR = `teamRole must be one of ${TEAM_ROLES.join(", ")}, or null to clear it.`;

function isUniqueViolation(err: unknown): boolean {
  if (!err || typeof err !== "object") {
    return false;
  }
  if ((err as { code?: unknown }).code === "23505") {
    return true;
  }
  return isUniqueViolation((err as { cause?: unknown }).cause);
}

// Public or session GET for PSIRT canvas & dropdowns — identity fields only,
// never plainPassword (that's an admin-only surface, see /admin/team below).
router.get("/team", requireAuth, async (_req, res): Promise<void> => {
  try {
    const rows = await db
      .select()
      .from(conformityMembersTable)
      .orderBy(desc(conformityMembersTable.active), asc(conformityMembersTable.displayName));
    res.json(rows.map(toPublicDto));
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to list team members" });
  }
});

router.get("/admin/team", requireAdmin, async (_req, res): Promise<void> => {
  try {
    const rows = await db
      .select()
      .from(conformityMembersTable)
      .orderBy(desc(conformityMembersTable.active), asc(conformityMembersTable.displayName));
    res.json(rows.map(toDto));
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to list team members" });
  }
});

router.post("/admin/team", requireAdmin, async (req, res): Promise<void> => {
  const {
    username: rawUsername,
    displayName: rawDisplayName,
    password,
    position,
    email,
    telephone,
    department,
    organization,
    roleResponsibility,
    teamRole: rawTeamRole,
  } = req.body;

  const teamRole = parseTeamRole(rawTeamRole === undefined ? null : rawTeamRole);
  if (!teamRole.ok) {
    res.status(400).json({ error: TEAM_ROLE_ERROR });
    return;
  }

  const username = normalizeUsername(rawUsername || "");
  if (!USERNAME_RE.test(username)) {
    res.status(400).json({
      error:
        "Username must be 3-64 characters of a-z, 0-9, dots, dashes or underscores, starting and ending with a letter or digit.",
    });
    return;
  }
  if (reservedUsernames().includes(username)) {
    res.status(400).json({ error: "That username is reserved." });
    return;
  }
  const displayName = (rawDisplayName || "").trim();
  if (!displayName) {
    res.status(400).json({ error: "Display name is required." });
    return;
  }

  const userPassword = password || "Password123!";

  try {
    const row = await db.transaction(async (tx) => {
      try {
        await tx.execute(sql`SELECT setval(pg_get_serial_sequence('conformity_members', 'id'), COALESCE((SELECT max(id) FROM conformity_members), 1));`);
        await tx.execute(sql`SELECT setval(pg_get_serial_sequence('conformity_activity', 'id'), COALESCE((SELECT max(id) FROM conformity_activity), 1));`);
      } catch (e) {
        console.warn("Sequence reset warning:", e);
      }

      const [created] = await tx
        .insert(conformityMembersTable)
        .values({
          username,
          displayName,
          position: position || "CRA Compliance Officer",
          email: email || `${username}@oxot.eu`,
          telephone: telephone || "+31 (0)20 555 0199",
          department: department || "Cybersecurity & Product Compliance",
          organization: organization || "OXOT Engineering B.V.",
          roleResponsibility: roleResponsibility || "Lead Assessor & PSIRT Coordinator",
          teamRole: teamRole.value,
          plainPassword: userPassword,
          passwordHash: hashPassword(userPassword),
        })
        .returning();

      try {
        await tx.insert(conformityActivityTable).values({
          assessmentId: null,
          entityType: "member",
          entityId: created!.id,
          action: "created",
          actor: actorOf(req),
          source: "ui",
          summary: `Team member added: ${displayName} (${username})`,
        });
      } catch (actErr) {
        console.warn("Failed to append to conformityActivityTable:", actErr);
      }

      return created!;
    });
    res.json(toDto(row));
  } catch (err: any) {
    console.error("Error in POST /admin/team:", err);
    if (isUniqueViolation(err)) {
      res.status(400).json({ error: "That username is already taken." });
      return;
    }
    res.status(500).json({ error: err?.message || "Failed to create team member" });
  }
});

router.patch("/admin/team/:id", requireAdmin, async (req, res): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const body = req.body;
    const [existing] = await db
      .select()
      .from(conformityMembersTable)
      .where(eq(conformityMembersTable.id, id));
    if (!existing) {
      res.status(404).json({ error: "Team member not found" });
      return;
    }

    const set: Partial<typeof conformityMembersTable.$inferInsert> = {};
    const changes: string[] = [];
    if (body.displayName !== undefined) {
      set.displayName = body.displayName.trim();
      changes.push(`renamed to ${set.displayName}`);
    }
    if (body.position !== undefined) set.position = body.position;
    if (body.email !== undefined) set.email = body.email;
    if (body.telephone !== undefined) set.telephone = body.telephone;
    if (body.department !== undefined) set.department = body.department;
    if (body.organization !== undefined) set.organization = body.organization;
    if (body.roleResponsibility !== undefined) set.roleResponsibility = body.roleResponsibility;
    if (body.teamRole !== undefined) {
      const parsed = parseTeamRole(body.teamRole);
      if (!parsed.ok) {
        res.status(400).json({ error: TEAM_ROLE_ERROR });
        return;
      }
      if (parsed.value !== existing.teamRole) {
        set.teamRole = parsed.value;
        changes.push(parsed.value ? `team role set to ${parsed.value}` : "team role cleared");
      }
    }
    if (body.password !== undefined && body.password.length > 0) {
      set.plainPassword = body.password;
      set.passwordHash = hashPassword(body.password);
      changes.push("password updated");
    }
    if (body.active !== undefined && body.active !== existing.active) {
      set.active = body.active;
      changes.push(body.active ? "reactivated" : "deactivated");
    }

    if (Object.keys(set).length === 0) {
      res.json(toDto(existing));
      return;
    }

    const row = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(conformityMembersTable)
        .set(set)
        .where(eq(conformityMembersTable.id, id))
        .returning();
      try {
        await tx.insert(conformityActivityTable).values({
          assessmentId: null,
          entityType: "member",
          entityId: id,
          action: "updated",
          actor: actorOf(req),
          source: "ui",
          summary: `Team member ${existing.displayName} (${existing.username}): updated profile`,
          detail: { changes },
        });
      } catch (actErr) {
        console.warn("Failed to append activity log:", actErr);
      }
      return updated!;
    });
    res.json(toDto(row));
  } catch (err: any) {
    console.error("Error in PATCH /admin/team/:id:", err);
    res.status(500).json({ error: err?.message || "Failed to update team member" });
  }
});

export default router;
