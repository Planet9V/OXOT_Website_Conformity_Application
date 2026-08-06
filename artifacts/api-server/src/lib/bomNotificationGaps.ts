import { and, eq } from "drizzle-orm";
import {
  db,
  conformityBomsTable,
  conformityBomFindingsTable,
  conformityBomComponentsTable,
  conformityBomNotificationsTable,
} from "@workspace/db";
import { componentIdentityKey } from "./xbom";

/**
 * CRA Art 13(6) upstream-notification gaps: vulnerability findings across all
 * of an assessment's BOMs that have no resolved upstream notification yet.
 *
 * Derived on demand, never stored, so the BOM tab, the assessment overview and
 * the readiness views can never disagree — everyone calls this one function.
 * "Resolved" means notified/acknowledged/not_required; untracked and pending
 * notifications both still count as gaps (a drafted-but-unsent notification
 * has not discharged the duty).
 */
const RESOLVED_NOTIFICATION_STATUSES = new Set(["notified", "acknowledged", "not_required"]);

export interface BomNotificationGap {
  findingId: number;
  trackedStatus: string;
  bomId: number;
  bomName: string;
  componentKey: string;
  componentName: string;
  componentVersion: string;
  purl: string;
  vulnerabilityId: string;
  severity: string;
}

export async function listBomNotificationGaps(assessmentId: number): Promise<BomNotificationGap[]> {
  const [rows, notifications] = await Promise.all([
    db
      .select({
        findingId: conformityBomFindingsTable.id,
        bomId: conformityBomsTable.id,
        bomName: conformityBomsTable.name,
        identifier: conformityBomFindingsTable.identifier,
        severity: conformityBomFindingsTable.severity,
        componentName: conformityBomComponentsTable.name,
        componentVersion: conformityBomComponentsTable.version,
        purl: conformityBomComponentsTable.purl,
      })
      .from(conformityBomFindingsTable)
      .innerJoin(
        conformityBomsTable,
        eq(conformityBomFindingsTable.bomId, conformityBomsTable.id),
      )
      .innerJoin(
        conformityBomComponentsTable,
        eq(conformityBomFindingsTable.componentId, conformityBomComponentsTable.id),
      )
      .where(
        and(
          eq(conformityBomsTable.assessmentId, assessmentId),
          eq(conformityBomFindingsTable.findingType, "vulnerability"),
        ),
      )
      .orderBy(conformityBomsTable.id, conformityBomFindingsTable.id),
    db
      .select({
        componentKey: conformityBomNotificationsTable.componentKey,
        vulnerabilityId: conformityBomNotificationsTable.vulnerabilityId,
        status: conformityBomNotificationsTable.status,
      })
      .from(conformityBomNotificationsTable)
      .where(eq(conformityBomNotificationsTable.assessmentId, assessmentId)),
  ]);

  const statusByKey = new Map(
    notifications.map((n) => [`${n.componentKey}::${n.vulnerabilityId}`, n.status]),
  );

  return rows
    .filter((r) => r.identifier.trim() !== "")
    .map((r) => {
      const componentKey = componentIdentityKey({
        purl: r.purl,
        name: r.componentName,
        version: r.componentVersion,
      });
      return {
        findingId: r.findingId,
        trackedStatus: statusByKey.get(`${componentKey}::${r.identifier}`) ?? "",
        bomId: r.bomId,
        bomName: r.bomName,
        componentKey,
        componentName: r.componentName,
        componentVersion: r.componentVersion,
        purl: r.purl,
        vulnerabilityId: r.identifier,
        severity: r.severity,
      };
    })
    .filter((g) => !RESOLVED_NOTIFICATION_STATUSES.has(g.trackedStatus));
}
