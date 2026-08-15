/**
 * Version-aware obligations.
 *
 * Almost every clock in the CRA is anchored on something version-specific, and
 * treating a product as one indivisible thing gets each of them wrong:
 *
 *   Art. 3(21)  "placing on the market" is the FIRST making available. That is
 *               a property of the product line. But
 *   Art. 13(13) retention runs from when the product "has been placed on the
 *               market", and for a version shipped three years after the line
 *               launched, that is the version's date — retaining from the
 *               line's first date would end the duty three years early.
 *   Art. 3(30)  a substantial modification is a change "following its placing
 *               on the market". It attaches to the version it produced. A
 *               modification recorded against v2.1 must not change v1.0's
 *               obligations.
 *   Art. 13(8)  support periods can differ between versions.
 *
 * The resolution rule for support period is deliberate: a version inherits the
 * product's period unless it declares its own. Most lines run one period across
 * versions, and duplicating it per version invites the two drifting apart.
 * Retention is NOT inherited — it must use the version's own placing date,
 * because that is what the article says.
 */

import { technicalDocumentationRetention, userInformationRetention, type RetentionResult } from "./retention";

export interface ProductLevel {
  placedOnMarketDate?: string | null;
  supportPeriodStart?: string | null;
  supportPeriodEnd?: string | null;
}

export interface VersionLevel {
  id: number;
  version: string;
  variant?: string | null;
  placedOnMarketDate?: string | null;
  supportPeriodStart?: string | null;
  supportPeriodEnd?: string | null;
  status?: string | null;
}

export interface ResolvedVersion {
  id: number;
  label: string;
  placedOnMarket: string | null;
  /** Where the support period came from — inherited or version-specific. */
  supportPeriodEnd: string | null;
  supportPeriodSource: "version" | "product" | "unset";
  technicalDocumentationRetention: RetentionResult;
  userInformationRetention: RetentionResult;
  gaps: string[];
}

export function resolveVersion(product: ProductLevel, version: VersionLevel): ResolvedVersion {
  const gaps: string[] = [];
  const label = version.variant ? `${version.version} (${version.variant})` : version.version;

  /**
   * Retention anchors on THIS version's placing date. Falling back to the
   * product's first-placing date would understate the duty for later versions,
   * so absence is a gap rather than a silent substitution.
   */
  const placedOnMarket = version.placedOnMarketDate ?? null;
  if (!placedOnMarket) {
    gaps.push(
      `Version ${label} has no placing-on-the-market date. Articles 13(13) and 13(18) run from when THIS version was placed on the market, so the retention clocks cannot start. The product line's first placing date is not a substitute.`,
    );
  }

  let supportPeriodEnd: string | null;
  let supportPeriodSource: ResolvedVersion["supportPeriodSource"];
  if (version.supportPeriodEnd) {
    supportPeriodEnd = version.supportPeriodEnd;
    supportPeriodSource = "version";
  } else if (product.supportPeriodEnd) {
    supportPeriodEnd = product.supportPeriodEnd;
    supportPeriodSource = "product";
  } else {
    supportPeriodEnd = null;
    supportPeriodSource = "unset";
    gaps.push(`Version ${label} has no support period, at version or product level (Article 13(8)).`);
  }

  const args = { placedOnMarket, supportPeriodEnd };
  return {
    id: version.id,
    label,
    placedOnMarket,
    supportPeriodEnd,
    supportPeriodSource,
    technicalDocumentationRetention: technicalDocumentationRetention(args),
    userInformationRetention: userInformationRetention(args),
    gaps,
  };
}

export interface ModificationScopeInput {
  /** The version the change was made to. */
  targetVersionId: number;
  /** Every version currently on the market. */
  versions: VersionLevel[];
  /** Art. 22(2): does the change affect the cybersecurity of the whole product? */
  cybersecurityImpactIsProductWide?: boolean | null;
}

export interface ModificationScopeResult {
  affectedVersionIds: number[];
  unaffectedVersionIds: number[];
  citation: string;
  message: string;
}

/**
 * Which versions a substantial modification actually touches.
 *
 * The default is: only the version modified. Art. 3(30) defines a substantial
 * modification as a change to the product following ITS placing on the market —
 * a change made to v2.1 is not a change to v1.0, which was placed on the market
 * as it was and is unaffected by later work.
 *
 * The exception is Art. 22(2)'s product-wide cybersecurity impact, and even
 * then it reaches the whole of the MODIFIED product, not other versions that
 * were never modified. So this reports scope within the modified version and
 * lists the others explicitly as unaffected, rather than leaving it ambiguous.
 */
export function scopeModificationToVersions(
  input: ModificationScopeInput,
): ModificationScopeResult {
  const affected = [input.targetVersionId];
  const unaffected = input.versions
    .map((v) => v.id)
    .filter((id) => id !== input.targetVersionId);

  const target = input.versions.find((v) => v.id === input.targetVersionId);
  const label = target
    ? target.variant
      ? `${target.version} (${target.variant})`
      : target.version
    : String(input.targetVersionId);

  const wide = input.cybersecurityImpactIsProductWide === true;
  return {
    affectedVersionIds: affected,
    unaffectedVersionIds: unaffected,
    citation: "Article 3(30), Article 22(2)",
    message:
      `The modification attaches to version ${label}` +
      (wide
        ? ", and because it affects the cybersecurity of that product as a whole, the Article 13 and 14 obligations cover the entire version (Article 22(2))."
        : ", covering the part affected by the modification (Article 22(2)).") +
      (unaffected.length
        ? ` ${unaffected.length} other version(s) on the market are unaffected: a change following version ${label}'s placing on the market is not a change to versions placed on the market before it.`
        : ""),
  };
}
