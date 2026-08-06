import type { Request } from "express";
import { resolveActiveSession } from "./adminAuth";

/** Tiered page access levels, lowest to highest. */
export type PageVisibility = "public" | "members" | "admin";

export const PUBLIC_ONLY: PageVisibility[] = ["public"];
export const MEMBER_TIERS: PageVisibility[] = ["public", "members"];
export const ALL_TIERS: PageVisibility[] = ["public", "members", "admin"];

/**
 * Resolve which page-visibility tiers the current request may see.
 * Anonymous → public only. Any authenticated non-admin session (conformity
 * member or the read-only demo role) → public + members. Site admins → all.
 *
 * Must be applied SERVER-SIDE on every surface that lists or fetches pages:
 * page list/detail, navigation, sitemap, crawler page-meta, and RAG retrieval.
 */
export async function allowedVisibilities(req: Request): Promise<PageVisibility[]> {
  const session = await resolveActiveSession(req);
  if (!session) return PUBLIC_ONLY;
  if (session.role === "admin") return ALL_TIERS;
  return MEMBER_TIERS;
}
