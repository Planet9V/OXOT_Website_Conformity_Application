import { Router, type IRouter } from "express";
import {
  AdminLoginBody,
  AdminLoginResponse,
  AdminLogoutResponse,
  GetAdminSessionResponse,
} from "@workspace/api-zod";
import {
  authenticate,
  setSessionCookie,
  clearSessionCookie,
  resolveActiveSession,
} from "../lib/adminAuth";
import { verifyMemberCredentials } from "../lib/teamMembers";
import { eq } from "drizzle-orm";
import { db, conformityMembersTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;
  // Env-configured accounts first (admin + public demo). The demo account has
  // env-overridable defaults, so a demo login works even before admin
  // credentials are configured.
  const role = authenticate(username, password);
  if (role) {
    setSessionCookie(res, username, role);
    res.json(
      AdminLoginResponse.parse({
        authenticated: true,
        username,
        role,
        displayName: null,
        needsOnboarding: false,
      }),
    );
    return;
  }

  // Then named team members (case-insensitive username, scrypt-hashed
  // password, active accounts only).
  const member = await verifyMemberCredentials(username, password);
  if (!member) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }
  setSessionCookie(res, member.username, "member", {
    memberId: member.id,
    displayName: member.displayName,
  });
  res.json(
    AdminLoginResponse.parse({
      authenticated: true,
      username: member.username,
      role: "member",
      displayName: member.displayName,
      needsOnboarding: member.onboardedAt === null,
    }),
  );
});

router.post("/admin/logout", async (_req, res): Promise<void> => {
  clearSessionCookie(res);
  res.json(AdminLogoutResponse.parse({ success: true }));
});

router.get("/admin/session", async (req, res): Promise<void> => {
  // resolveActiveSession (not getSession): a deactivated member's still-valid
  // cookie must report as signed-out immediately.
  const session = await resolveActiveSession(req);
  // Member sessions surface first-login onboarding state so the client can
  // route new assessors through setup. One indexed select, members only.
  let needsOnboarding = false;
  if (session?.role === "member") {
    const [row] = await db
      .select({ onboardedAt: conformityMembersTable.onboardedAt })
      .from(conformityMembersTable)
      .where(eq(conformityMembersTable.id, session.memberId!));
    needsOnboarding = row ? row.onboardedAt === null : false;
  }
  res.json(
    GetAdminSessionResponse.parse({
      authenticated: Boolean(session),
      username: session?.username ?? null,
      role: session?.role ?? null,
      displayName: session?.displayName ?? null,
      needsOnboarding,
    }),
  );
});

export default router;
