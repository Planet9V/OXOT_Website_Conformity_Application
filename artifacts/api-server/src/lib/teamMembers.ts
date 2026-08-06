import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db, conformityMembersTable, type ConformityMemberRow } from "@workspace/db";

/**
 * Named assessor accounts ("member" role) — password hashing and lookups.
 *
 * Members are admin-provisioned people who sign in with their own username and
 * password. Passwords are stored as scrypt hashes (`saltB64url.hashB64url`),
 * never plaintext. Member sessions are stateless cookies, so deactivation is
 * enforced by re-checking `active` on every authenticated request (see
 * `requireAuth` / `resolveActiveSession` in adminAuth.ts).
 */

const SCRYPT_KEYLEN = 64;

/** Usernames are stored and matched lowercase so sign-in is case-insensitive. */
export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

/** 3-64 chars of a-z 0-9 . _ -, starting and ending alphanumeric. No colon —
 * the activity ledger's actor field is "role:username". */
export const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{1,62}[a-z0-9]$/;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  return `${salt.toString("base64url")}.${hash.toString("base64url")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltB64, hashB64] = stored.split(".");
  if (!saltB64 || !hashB64) return false;
  try {
    const salt = Buffer.from(saltB64, "base64url");
    const expected = Buffer.from(hashB64, "base64url");
    if (expected.length === 0) return false;
    const actual = crypto.scryptSync(password, salt, expected.length);
    return crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

// A real hash of a random unguessable password. Verified against when the
// username doesn't resolve to an active member, so misses cost the same
// scrypt work as hits (no username-existence timing oracle).
const DUMMY_HASH = hashPassword(crypto.randomBytes(32).toString("base64url"));

/** Case-insensitive username + password check. Only active members may sign in. */
export async function verifyMemberCredentials(
  usernameRaw: string,
  password: string,
): Promise<ConformityMemberRow | null> {
  const username = normalizeUsername(usernameRaw);
  const [row] = await db
    .select()
    .from(conformityMembersTable)
    .where(eq(conformityMembersTable.username, username));
  if (!row || !row.active) {
    verifyPassword(password, DUMMY_HASH);
    return null;
  }
  return verifyPassword(password, row.passwordHash) ? row : null;
}

/** Fast per-request revocation check for member sessions (indexed PK select). */
export async function isMemberActive(memberId: number): Promise<boolean> {
  const [row] = await db
    .select({ active: conformityMembersTable.active })
    .from(conformityMembersTable)
    .where(eq(conformityMembersTable.id, memberId));
  return row?.active === true;
}
