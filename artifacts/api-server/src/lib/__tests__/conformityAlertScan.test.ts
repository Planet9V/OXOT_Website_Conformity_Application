/**
 * DB-backed tests for the CRA deadline alert scan orchestrator: claim-then-send
 * dedupe (re-runs never double-send), failed sends releasing their claim for
 * retry, digest once-per-day, and disabled/closed short-circuits.
 *
 * The mailer is mocked (no real SMTP); the DB is real. All fixture deadlines
 * sit ~100 days in the real future so the dev server's own in-process timer
 * never sees them as actionable while this test runs — only our explicit
 * `now` (passed to runConformityAlertScan) makes them due. The shared dev DB
 * may contain other open incidents (demo seed), so assertions filter by this
 * test's unique incident title, and every alert-state row created during the
 * run window is deleted afterwards.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../mailer", () => ({
  sendEmail: vi.fn(async () => ({ delivered: true })),
  isMailConfigured: vi.fn(async () => true),
}));

import { eq, gte } from "drizzle-orm";
import {
  db,
  appSettingsTable,
  conformityProductsTable,
  conformityAssessmentsTable,
  conformityIncidentsTable,
  conformityAlertStateTable,
  type ConformityAlertsConfig,
} from "@workspace/db";
import { getAppSettings } from "../models";
import { sendEmail, isMailConfigured } from "../mailer";
import { runConformityAlertScan } from "../conformityAlertScan";

const sendEmailMock = vi.mocked(sendEmail);
const isMailConfiguredMock = vi.mocked(isMailConfigured);

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// Fixture clock: ~100 days in the real future (see module doc).
const FIXED_NOW = Date.now() + 100 * DAY;
const TITLE = `Alert Scan Test Incident ${Date.now()}`;
const RECIPIENT = "cra-alerts@test.example";

const testStartedAt = new Date(Date.now() - 1000);
let productId: number;
let incidentId: number;
let originalConfig: ConformityAlertsConfig | null | undefined;

async function setConfig(cfg: ConformityAlertsConfig): Promise<void> {
  const row = await getAppSettings();
  await db
    .update(appSettingsTable)
    .set({ conformityAlertsConfig: cfg })
    .where(eq(appSettingsTable.id, row.id));
}

/** sendEmail calls (since last mockClear) about THIS test's incident. */
function myAlertSends() {
  return sendEmailMock.mock.calls.filter(([params]) => params.subject.includes(TITLE));
}

beforeAll(async () => {
  const settings = await getAppSettings();
  originalConfig = settings.conformityAlertsConfig;

  const [product] = await db
    .insert(conformityProductsTable)
    .values({ name: `Alert Scan Product ${Date.now()}`, productType: "software" })
    .returning();
  productId = product!.id;
  const [assessment] = await db
    .insert(conformityAssessmentsTable)
    .values({ productId, regulationKey: "cra" })
    .returning();

  // detectedAt = FIXED_NOW - 30h → early warning (detect+24h) breached 6h ago
  // at FIXED_NOW; notification (detect+72h) due 42h after FIXED_NOW; final
  // report (detect+14d) far out.
  const detectedAt = new Date(FIXED_NOW - 30 * HOUR);
  const [inc] = await db
    .insert(conformityIncidentsTable)
    .values({
      assessmentId: assessment!.id,
      title: TITLE,
      severity: "high",
      detectedAt,
      earlyWarningDueAt: new Date(detectedAt.getTime() + 24 * HOUR),
      notificationDueAt: new Date(detectedAt.getTime() + 72 * HOUR),
      finalReportDueAt: new Date(detectedAt.getTime() + 14 * DAY),
      status: "open",
    })
    .returning();
  incidentId = inc!.id;
});

afterAll(async () => {
  // Remove every claim row created while this file ran (our incident's rows,
  // the digest row, and any demo-seed incident claims our scans made), so dev
  // behaviour and future runs stay unpolluted.
  await db
    .delete(conformityAlertStateTable)
    .where(gte(conformityAlertStateTable.createdAt, testStartedAt));
  await db.delete(conformityProductsTable).where(eq(conformityProductsTable.id, productId));
  const row = await getAppSettings();
  await db
    .update(appSettingsTable)
    .set({ conformityAlertsConfig: originalConfig ?? {} })
    .where(eq(appSettingsTable.id, row.id));
});

beforeEach(() => {
  sendEmailMock.mockClear();
  sendEmailMock.mockResolvedValue({ delivered: true });
  isMailConfiguredMock.mockResolvedValue(true);
});

describe("runConformityAlertScan", () => {
  it("does nothing when disabled", async () => {
    await setConfig({ enabled: false, recipient: RECIPIENT });
    const result = await runConformityAlertScan(FIXED_NOW);
    expect(result.enabled).toBe(false);
    expect(result.incidentsChecked).toBe(0);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("does not claim dedupe keys while email is unconfigured", async () => {
    await setConfig({ enabled: true, recipient: RECIPIENT, leadTimeHours: 6 });
    isMailConfiguredMock.mockResolvedValue(false);
    const result = await runConformityAlertScan(FIXED_NOW);
    expect(result.enabled).toBe(true);
    expect(result.emailConfigured).toBe(false);
    expect(sendEmailMock).not.toHaveBeenCalled();
    const rows = await db
      .select()
      .from(conformityAlertStateTable)
      .where(eq(conformityAlertStateTable.alertKey, `incident:${incidentId}:early_warning:breached`));
    expect(rows).toHaveLength(0);
  });

  it("sends the breached early-warning alert once and records the claim", async () => {
    await setConfig({ enabled: true, recipient: RECIPIENT, leadTimeHours: 6, maxReminders: 0 });
    const result = await runConformityAlertScan(FIXED_NOW);
    expect(result.enabled).toBe(true);
    expect(result.emailConfigured).toBe(true);
    expect(result.incidentsChecked).toBeGreaterThanOrEqual(1);

    const mine = myAlertSends();
    expect(mine).toHaveLength(1);
    expect(mine[0]![0].to).toBe(RECIPIENT);
    expect(mine[0]![0].subject).toContain("CRA deadline breached");
    expect(mine[0]![0].subject).toContain("24-hour early warning");

    const rows = await db
      .select()
      .from(conformityAlertStateTable)
      .where(eq(conformityAlertStateTable.alertKey, `incident:${incidentId}:early_warning:breached`));
    expect(rows).toHaveLength(1);
    expect(rows[0]!.delivered).toBe(true);
    expect(rows[0]!.incidentId).toBe(incidentId);
  });

  it("re-running at the same time sends nothing for the same incident (dedupe)", async () => {
    const result = await runConformityAlertScan(FIXED_NOW + 5 * 60 * 1000);
    expect(myAlertSends()).toHaveLength(0);
    expect(result.enabled).toBe(true);
  });

  it("a failed send releases the claim so the next run retries", async () => {
    await setConfig({ enabled: true, recipient: RECIPIENT, leadTimeHours: 6, maxReminders: 0 });
    // +36.5h: notification (due at +42h) is 5.5h out → inside the 6h lead window.
    const now = FIXED_NOW + 36.5 * HOUR;
    const key = `incident:${incidentId}:notification:approaching`;

    sendEmailMock.mockResolvedValue({ delivered: false, error: "smtp down" });
    const failed = await runConformityAlertScan(now);
    expect(failed.alertsFailed).toBeGreaterThanOrEqual(1);
    expect(myAlertSends()).toHaveLength(1); // attempted…
    let rows = await db
      .select()
      .from(conformityAlertStateTable)
      .where(eq(conformityAlertStateTable.alertKey, key));
    expect(rows).toHaveLength(0); // …but claim was released

    sendEmailMock.mockClear();
    sendEmailMock.mockResolvedValue({ delivered: true });
    await runConformityAlertScan(now);
    const mine = myAlertSends();
    expect(mine).toHaveLength(1);
    expect(mine[0]![0].subject).toContain("CRA deadline approaching");
    rows = await db
      .select()
      .from(conformityAlertStateTable)
      .where(eq(conformityAlertStateTable.alertKey, key));
    expect(rows).toHaveLength(1);
    expect(rows[0]!.delivered).toBe(true);
  });

  it("digest sends at most once per UTC day", async () => {
    await setConfig({
      enabled: true,
      recipient: RECIPIENT,
      leadTimeHours: 6,
      digestEnabled: true,
      maxReminders: 0,
    });
    // +40h: notification due in 2h → our incident is a "due soon" digest item.
    const now = FIXED_NOW + 40 * HOUR;

    const first = await runConformityAlertScan(now);
    expect(first.digestSent).toBe(true);
    const digestCalls = sendEmailMock.mock.calls.filter(([p]) =>
      p.subject.startsWith("CRA deadline digest"),
    );
    expect(digestCalls).toHaveLength(1);
    expect(digestCalls[0]![0].html).toContain(TITLE);

    sendEmailMock.mockClear();
    const second = await runConformityAlertScan(now + 60 * 1000);
    expect(second.digestSent).toBe(false);
    expect(
      sendEmailMock.mock.calls.filter(([p]) => p.subject.startsWith("CRA deadline digest")),
    ).toHaveLength(0);
  });

  it("reclaims stale undelivered claims (crashed run) but respects fresh ones", async () => {
    await setConfig({ enabled: true, recipient: RECIPIENT, leadTimeHours: 6, maxReminders: 0 });
    // +301h: final report (due +306h) is 5h out → approaching fires.
    // notification:breached would also fire — but a FRESH undelivered claim
    // (another run "mid-send") must suppress it.
    const now = FIXED_NOW + 301 * HOUR;
    const staleKey = `incident:${incidentId}:final_report:approaching`;
    const freshKey = `incident:${incidentId}:notification:breached`;

    await db.insert(conformityAlertStateTable).values({
      alertKey: staleKey,
      incidentId,
      delivered: false,
      createdAt: new Date(Date.now() - 20 * 60 * 1000), // stale: 20 min old
    });
    await db.insert(conformityAlertStateTable).values({
      alertKey: freshKey,
      incidentId,
      delivered: false, // fresh: created just now
    });

    await runConformityAlertScan(now);

    const mine = myAlertSends();
    expect(mine).toHaveLength(1); // only the reclaimed final-report alert
    expect(mine[0]![0].subject).toContain("final report (14 days after corrective measure available)");

    const staleRows = await db
      .select()
      .from(conformityAlertStateTable)
      .where(eq(conformityAlertStateTable.alertKey, staleKey));
    expect(staleRows).toHaveLength(1);
    expect(staleRows[0]!.delivered).toBe(true); // reclaimed + sent

    const freshRows = await db
      .select()
      .from(conformityAlertStateTable)
      .where(eq(conformityAlertStateTable.alertKey, freshKey));
    expect(freshRows).toHaveLength(1);
    expect(freshRows[0]!.delivered).toBe(false); // untouched

    // Clean up the synthetic fresh claim so later tests see pristine state.
    await db
      .delete(conformityAlertStateTable)
      .where(eq(conformityAlertStateTable.alertKey, freshKey));
  });

  it("repeat 'still overdue' reminders: latest-only, deduped, capped", async () => {
    // 1h interval, cap 2. At +30h the early warning (breached at FIXED_NOW-6h,
    // breach key already claimed above) is 36h overdue → reminder n = min(36, 2)
    // = 2: exactly ONE catch-up email, no backlog of reminder:1.
    await setConfig({
      enabled: true,
      recipient: RECIPIENT,
      leadTimeHours: 6,
      reminderIntervalHours: 1,
      maxReminders: 2,
    });
    const now = FIXED_NOW + 30 * HOUR;
    const capKey = `incident:${incidentId}:early_warning:breached:reminder:2`;

    await runConformityAlertScan(now);
    const mine = myAlertSends();
    expect(mine).toHaveLength(1);
    expect(mine[0]![0].subject).toContain("still overdue");
    expect(mine[0]![0].subject).toContain("reminder 2");
    expect(mine[0]![0].subject).toContain("24-hour early warning");

    const rows = await db
      .select()
      .from(conformityAlertStateTable)
      .where(eq(conformityAlertStateTable.alertKey, capKey));
    expect(rows).toHaveLength(1);
    expect(rows[0]!.delivered).toBe(true);
    expect(rows[0]!.incidentId).toBe(incidentId);
    const skipped = await db
      .select()
      .from(conformityAlertStateTable)
      .where(
        eq(conformityAlertStateTable.alertKey, `incident:${incidentId}:early_warning:breached:reminder:1`),
      );
    expect(skipped).toHaveLength(0); // latest-only, no backlog

    // Re-run a bit later: still at the cap key → dedupe, nothing sent.
    sendEmailMock.mockClear();
    await runConformityAlertScan(now + 90 * 60 * 1000);
    expect(myAlertSends()).toHaveLength(0);
  });

  it("resolved incidents stop alerting entirely", async () => {
    await setConfig({ enabled: true, recipient: RECIPIENT, leadTimeHours: 6 });
    await db
      .update(conformityIncidentsTable)
      .set({ status: "resolved" })
      .where(eq(conformityIncidentsTable.id, incidentId));

    // +200h: every stage would be long breached if the incident were open.
    await runConformityAlertScan(FIXED_NOW + 200 * HOUR);
    expect(myAlertSends()).toHaveLength(0);
    const rows = await db
      .select()
      .from(conformityAlertStateTable)
      .where(eq(conformityAlertStateTable.alertKey, `incident:${incidentId}:notification:breached`));
    expect(rows).toHaveLength(0);
  });
});
