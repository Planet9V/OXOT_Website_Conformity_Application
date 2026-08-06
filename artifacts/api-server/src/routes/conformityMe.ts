import { Router, type IRouter, type Response } from "express";
import { eq } from "drizzle-orm";
import {
  db,
  conformityMembersTable,
  conformityActivityTable,
  type ConformityMemberRow,
} from "@workspace/db";
import {
  GetMyProfileResponse,
  UpdateMyProfileBody,
  ChangeMyPasswordBody,
  ChangeMyPasswordResponse,
  CompleteMyOnboardingResponse,
  MarkMyTourSeenBody,
  MarkMyTourSeenResponse,
} from "@workspace/api-zod";
import { requireAuth, getSession, type Session } from "../lib/adminAuth";
import { hashPassword, verifyPassword } from "../lib/teamMembers";

/**
 * Self-service account surface for whoever is signed in ("/conformity/me").
 *
 * Named assessors (member role) manage their own identity here: how their
 * name reads in the audit trail, their password, and their first-login
 * onboarding state. The admin and demo identities are env-configured, so for
 * them this surface is read-only — GET works (the profile page renders for
 * every role), mutations 403 with an explanation.
 *
 * Follows the workbench's one-transaction rule: every mutation commits its
 * state change and its activity-ledger row in the same transaction, and
 * semantic no-ops skip the UPDATE entirely (no ledger noise).
 */
const router: IRouter = Router();

function synthProfile(session: Session) {
  return {
    username: session.username,
    displayName: session.displayName ?? null,
    role: session.role,
    memberSince: null,
    needsOnboarding: false,
    toursSeen: [],
  };
}

function memberProfile(row: ConformityMemberRow) {
  return {
    username: row.username,
    displayName: row.displayName,
    role: "member" as const,
    memberSince: row.createdAt.toISOString(),
    needsOnboarding: row.onboardedAt === null,
    toursSeen: row.toursSeen,
  };
}

async function loadMemberRow(memberId: number): Promise<ConformityMemberRow | null> {
  const [row] = await db
    .select()
    .from(conformityMembersTable)
    .where(eq(conformityMembersTable.id, memberId));
  return row ?? null;
}

/**
 * Mutations here are member-only. The demo role keeps its canonical
 * read-only message (the string the rest of the workbench uses); admins get
 * an explanation instead of a confusing generic error.
 */
function rejectNonMember(session: Session, res: Response): void {
  if (session.role === "demo" && process.env["DEMO_READONLY"] === "true") {
    res.status(403).json({ error: "The demo workspace is read-only." });
    return;
  }
  res.status(403).json({
    error:
      "Only named assessor accounts manage their profile here. The admin identity is configured via environment settings.",
  });
}

router.get("/conformity/me", requireAuth, async (req, res): Promise<void> => {
  const session = getSession(req)!;
  if (session.role !== "member") {
    res.json(GetMyProfileResponse.parse(synthProfile(session)));
    return;
  }
  const row = await loadMemberRow(session.memberId!);
  if (!row) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json(GetMyProfileResponse.parse(memberProfile(row)));
});

router.patch("/conformity/me", requireAuth, async (req, res): Promise<void> => {
  const session = getSession(req)!;
  if (session.role !== "member") {
    rejectNonMember(session, res);
    return;
  }
  const parsed = UpdateMyProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request body." });
    return;
  }
  const displayName = parsed.data.displayName.trim();
  if (!displayName) {
    res.status(400).json({ error: "Display name is required." });
    return;
  }
  const existing = await loadMemberRow(session.memberId!);
  if (!existing) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  // Semantic no-op: same name → no UPDATE, no ledger row.
  if (displayName === existing.displayName) {
    res.json(GetMyProfileResponse.parse(memberProfile(existing)));
    return;
  }
  const row = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(conformityMembersTable)
      .set({ displayName })
      .where(eq(conformityMembersTable.id, existing.id))
      .returning();
    await tx.insert(conformityActivityTable).values({
      assessmentId: null,
      entityType: "member",
      entityId: existing.id,
      action: "updated",
      actor: `member:${session.username}`,
      source: "ui",
      summary: `Team member ${existing.displayName} (${existing.username}): renamed to ${displayName} (self-service)`,
      detail: { changes: [`renamed to ${displayName} (self-service)`] },
    });
    return updated!;
  });
  res.json(GetMyProfileResponse.parse(memberProfile(row)));
});

router.post("/conformity/me/password", requireAuth, async (req, res): Promise<void> => {
  const session = getSession(req)!;
  if (session.role !== "member") {
    rejectNonMember(session, res);
    return;
  }
  const parsed = ChangeMyPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request body." });
    return;
  }
  const body = parsed.data;
  const existing = await loadMemberRow(session.memberId!);
  if (!existing) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (!verifyPassword(body.currentPassword, existing.passwordHash)) {
    res.status(400).json({ error: "Current password is incorrect." });
    return;
  }
  // Semantic no-op: re-setting the same password → success without an UPDATE
  // or a misleading "password changed" ledger row.
  if (verifyPassword(body.newPassword, existing.passwordHash)) {
    res.json(ChangeMyPasswordResponse.parse({ success: true }));
    return;
  }
  await db.transaction(async (tx) => {
    await tx
      .update(conformityMembersTable)
      .set({ passwordHash: hashPassword(body.newPassword) })
      .where(eq(conformityMembersTable.id, existing.id));
    await tx.insert(conformityActivityTable).values({
      assessmentId: null,
      entityType: "member",
      entityId: existing.id,
      action: "updated",
      actor: `member:${session.username}`,
      source: "ui",
      summary: `Team member ${existing.displayName} (${existing.username}): password changed (self-service)`,
      detail: { changes: ["password changed (self-service)"] },
    });
  });
  res.json(ChangeMyPasswordResponse.parse({ success: true }));
});

router.post("/conformity/me/onboarding", requireAuth, async (req, res): Promise<void> => {
  const session = getSession(req)!;
  if (session.role !== "member") {
    rejectNonMember(session, res);
    return;
  }
  const existing = await loadMemberRow(session.memberId!);
  if (!existing) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  // Idempotent: already onboarded → current profile, no ledger row.
  if (existing.onboardedAt !== null) {
    res.json(CompleteMyOnboardingResponse.parse(memberProfile(existing)));
    return;
  }
  const row = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(conformityMembersTable)
      .set({ onboardedAt: new Date() })
      .where(eq(conformityMembersTable.id, existing.id))
      .returning();
    await tx.insert(conformityActivityTable).values({
      assessmentId: null,
      entityType: "member",
      entityId: existing.id,
      action: "updated",
      actor: `member:${session.username}`,
      source: "ui",
      summary: `Team member ${existing.displayName} (${existing.username}): completed first-login onboarding`,
      detail: { changes: ["completed first-login onboarding"] },
    });
    return updated!;
  });
  res.json(CompleteMyOnboardingResponse.parse(memberProfile(row)));
});

router.post("/conformity/me/tours", requireAuth, async (req, res): Promise<void> => {
  const session = getSession(req)!;
  if (session.role !== "member") {
    rejectNonMember(session, res);
    return;
  }
  const parsed = MarkMyTourSeenBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request body." });
    return;
  }
  const { tourId } = parsed.data;
  const existing = await loadMemberRow(session.memberId!);
  if (!existing) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  // Idempotent: already seen → current profile, no UPDATE. This is a UI
  // preference, not compliance-relevant work, so it deliberately writes no
  // activity-ledger row (the ledger stays an audit trail of assessment work).
  if (existing.toursSeen.includes(tourId)) {
    res.json(MarkMyTourSeenResponse.parse(memberProfile(existing)));
    return;
  }
  const [row] = await db
    .update(conformityMembersTable)
    .set({ toursSeen: [...existing.toursSeen, tourId] })
    .where(eq(conformityMembersTable.id, existing.id))
    .returning();
  res.json(MarkMyTourSeenResponse.parse(memberProfile(row!)));
});

export default router;
