import { ADMIN_COOKIE, createSessionToken } from "../../../lib/adminAuth";

/**
 * Signed session cookies for integration tests — the house pattern from
 * conformityAuth.test.ts, shared (task 8.1 / issue #62).
 *
 * Tests mint the cookie directly instead of calling /admin/login so they
 * neither depend on the login rate limiter nor consume its budget. The
 * cookie is REAL — same signer, same secret — so every guard downstream of
 * the signature check still runs exactly as in production.
 */
export function adminCookie(): string {
  const username = process.env.ADMIN_USERNAME || "ci-admin";
  return `${ADMIN_COOKIE}=${createSessionToken(username)}`;
}

export function demoCookie(): string {
  return `${ADMIN_COOKIE}=${createSessionToken("oxotdemo", "demo")}`;
}
