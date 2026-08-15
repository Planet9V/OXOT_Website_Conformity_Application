import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { isMemberActive } from "./teamMembers";

export const ADMIN_COOKIE = "oxot_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

/**
 * Session roles.
 * - `admin` — full control, including the site-admin/config surfaces
 *   (integration settings, SEO, publishing, leads, CMS, etc.).
 * - `demo`  — can drive the conformity workbench sandbox (products,
 *   assessments, evidence, BOMs, flows, assistant) but NOT the admin/config
 *   surfaces. Used for the public launch demo.
 * - `member` — a named assessor (a `conformity_members` row). Signs in with a
 *   personal username/password, drives the workbench under their own identity
 *   (mutations allowed, real audit trail), but NOT the admin/config surfaces.
 */
export type Role = "admin" | "demo" | "member";

export interface Session {
  username: string;
  role: Role;
  /** Member sessions only: the conformity_members row id (revocation check). */
  memberId?: number;
  /** Member sessions only: the person's display name. */
  displayName?: string;
}

/** Identity payload carried by member session tokens. */
export interface MemberIdentity {
  memberId: number;
  displayName: string;
}

function getSessionSecret(): string {
  const secret = process.env["SESSION_SECRET"];
  if (!secret || secret === "change-me" || (process.env["NODE_ENV"] === "production" && secret.length < 32)) {
    throw new Error("SESSION_SECRET is required, must not be placeholder 'change-me', and must be at least 32 characters in production.");
  }
  return secret;
}

/**
 * Returns the configured admin credentials. Fails closed: unlike the demo account,
 * the admin account must never silently fall back to a well-known default.
 */
export function getAdminCredentials(): { username: string; password: string } {
  const username = process.env["ADMIN_USERNAME"];
  const password = process.env["ADMIN_PASSWORD"];
  if (!username || !password || password === "change-me" || (process.env["NODE_ENV"] === "production" && password.length < 12)) {
    throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD are required, must not be placeholder 'change-me', and password must be at least 12 characters in production.");
  }
  return { username, password };
}

/**
 * Demo credentials for the public launch sandbox. These are INTENTIONALLY
 * public — they are printed on the demo login screen so anyone can explore the
 * workbench — so they live as env-overridable defaults rather than protected
 * secrets. Set DEMO_USERNAME / DEMO_PASSWORD to rotate them without a deploy.
 */
const DEMO_DEFAULT_USERNAME = "oxotdemo";
const DEMO_DEFAULT_PASSWORD = "oxot2026$";
export function getDemoCredentials(): { username: string; password: string } {
  return {
    username: process.env["DEMO_USERNAME"] || DEMO_DEFAULT_USERNAME,
    password: process.env["DEMO_PASSWORD"] || DEMO_DEFAULT_PASSWORD,
  };
}

/**
 * Constant-time string comparison. Both inputs are hashed to a fixed 32-byte
 * digest first, so the comparison length never leaks and no early length
 * short-circuit occurs regardless of input shape.
 */
function timingSafeEqual(a: string, b: string): boolean {
  const digestA = crypto.createHash("sha256").update(a, "utf8").digest();
  const digestB = crypto.createHash("sha256").update(b, "utf8").digest();
  return crypto.timingSafeEqual(digestA, digestB);
}

/** Verify a username/password pair against the configured admin credentials. */
export function verifyCredentials(username: string, password: string): boolean {
  const creds = getAdminCredentials();
  if (!creds) {
    return false;
  }
  // Evaluate both comparisons unconditionally to avoid short-circuit timing leaks.
  const usernameOk = timingSafeEqual(username, creds.username);
  const passwordOk = timingSafeEqual(password, creds.password);
  return usernameOk && passwordOk;
}

/** Verify a username/password pair against the demo credentials. */
export function verifyDemoCredentials(username: string, password: string): boolean {
  const creds = getDemoCredentials();
  const usernameOk = timingSafeEqual(username, creds.username);
  const passwordOk = timingSafeEqual(password, creds.password);
  return usernameOk && passwordOk;
}

/**
 * Authenticate a username/password pair and resolve its role. Both credential
 * sets are always evaluated to avoid short-circuit timing leaks; admin wins if
 * both somehow match. Returns null when neither matches.
 */
export function authenticate(username: string, password: string): Role | null {
  const isAdmin = verifyCredentials(username, password);
  const isDemo = verifyDemoCredentials(username, password);
  if (isAdmin) return "admin";
  if (isDemo) return "demo";
  return null;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

/**
 * Create a stateless signed session token for the given username + role.
 * Member tokens additionally carry the member row id (used for the per-request
 * active check) and the person's display name.
 */
export function createSessionToken(
  username: string,
  role: Role = "admin",
  member?: MemberIdentity,
): string {
  const body = {
    username,
    role,
    exp: Date.now() + SESSION_TTL_MS,
    ...(role === "member" && member
      ? { memberId: member.memberId, displayName: member.displayName }
      : {}),
  };
  const payload = Buffer.from(JSON.stringify(body)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/**
 * Verify a session token; returns the session (username + role) or null when
 * invalid/expired. Tokens minted before roles existed have no `role` field and
 * decode as `admin`, so pre-existing sessions keep working.
 */
export function verifySessionToken(token: string | undefined): Session | null {
  if (!token) {
    return null;
  }
  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return null;
  }
  if (!timingSafeEqual(signature, sign(payload))) {
    return null;
  }
  try {
    const body = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      username: string;
      role?: Role;
      exp: number;
      memberId?: number;
      displayName?: string;
    };
    if (typeof body.exp !== "number" || body.exp < Date.now()) {
      return null;
    }
    if (body.role === "member") {
      // Member tokens MUST carry the member row id; anything else is invalid
      // (a forged/truncated token must not fall back to another role).
      if (typeof body.memberId !== "number") {
        return null;
      }
      return {
        username: body.username,
        role: "member",
        memberId: body.memberId,
        displayName:
          typeof body.displayName === "string" && body.displayName
            ? body.displayName
            : body.username,
      };
    }
    const role: Role = body.role === "demo" ? "demo" : "admin";
    return { username: body.username, role };
  } catch {
    return null;
  }
}

/** Read the authenticated session (username + role) from the request cookie. */
export function getSession(req: Request): Session | null {
  const token = (req.cookies as Record<string, string> | undefined)?.[ADMIN_COOKIE];
  return verifySessionToken(token);
}

/** Read the authenticated username from the request cookie, or null. */
export function getSessionUser(req: Request): string | null {
  return getSession(req)?.username ?? null;
}

export function setSessionCookie(
  res: Response,
  username: string,
  role: Role = "admin",
  member?: MemberIdentity,
): void {
  res.cookie(ADMIN_COOKIE, createSessionToken(username, role, member), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env["COOKIE_SECURE"] === "true",
    maxAge: SESSION_TTL_MS,
    path: "/",
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(ADMIN_COOKIE, { path: "/" });
}

/**
 * Express middleware that rejects requests without a valid session of ANY role
 * (admin, demo, or member). Guards the conformity workbench so the demo user
 * and named assessors can drive it.
 *
 * Member sessions are stateless signed cookies, so deactivation is enforced
 * HERE: the account's `active` flag is re-checked on every request, and a
 * deactivated member is signed out immediately — not at token expiry.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (session.role !== "member") {
    next();
    return;
  }
  isMemberActive(session.memberId!).then((active) => {
    if (active) {
      next();
      return;
    }
    clearSessionCookie(res);
    res.status(401).json({ error: "Unauthorized" });
  }, next);
}

/**
 * Resolve the session AND verify member accounts are still active. Use this
 * (not getSession) anywhere that *reports* authentication state — a
 * deactivated member must read as signed-out everywhere, immediately.
 */
export async function resolveActiveSession(req: Request): Promise<Session | null> {
  const session = getSession(req);
  if (!session) {
    return null;
  }
  if (session.role !== "member") {
    return session;
  }
  return (await isMemberActive(session.memberId!)) ? session : null;
}

/** Usernames member accounts may never take (compared lowercase). */
export function reservedUsernames(): string[] {
  const names = [getAdminCredentials()?.username, getDemoCredentials().username];
  return names.filter((n): n is string => Boolean(n)).map((n) => n.toLowerCase());
}

/**
 * Express middleware that rejects requests without a valid ADMIN session.
 * Demo sessions are rejected — this gates the site-admin/config surfaces.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const session = getSession(req);
  if (session?.role === "admin") {
    next();
    return;
  }
  /**
   * 401 and 403 are different answers to different questions, and this used to
   * give 401 to both: "who are you?" and "you may not do that".
   *
   * A signed-in demo user pressing an admin-only control is authenticated —
   * their session is valid — they simply lack the role. Answering 401 tells the
   * client the session is bad, which is how a read-only user ends up bounced to
   * a login screen instead of being told they cannot do this. Every test in the
   * suite asserting 403 for a demo mutation was asserting the correct behaviour
   * against an implementation that did not provide it.
   */
  if (session) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  res.status(401).json({ error: "Unauthorized" });
}
