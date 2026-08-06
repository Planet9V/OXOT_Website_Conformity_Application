/**
 * Pure planner unit tests for CRA deadline alerts: clock boundaries (exactly
 * at the deadline, exactly at the lead-time edge), done/closed skipping, key
 * format, digest windowing/once-per-day keys, and HTML escaping in emails.
 * No DB, no mailer — the scan orchestrator is covered separately.
 */
import { describe, expect, it } from "vitest";
import {
  DEFAULT_LEAD_TIME_HOURS,
  DUE_SOON_MS,
  alertKeyFor,
  buildAlertEmail,
  buildDigestEmail,
  clampLeadTimeHours,
  clampMaxReminders,
  clampReminderIntervalHours,
  digestKeyFor,
  planIncidentAlerts,
  reminderKeyFor,
  summarizeForDigest,
  DEFAULT_MAX_REMINDERS,
  DEFAULT_REMINDER_INTERVAL_HOURS,
  type IncidentForAlerts,
} from "../conformityAlerts";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
// Fixed reference clock: 2026-03-10T12:00:00Z
const NOW = Date.parse("2026-03-10T12:00:00Z");
const LEAD = 6 * HOUR;

/** Incident whose stage dues are offsets (in ms) from NOW; null doneAt = pending. */
function incident(overrides: Partial<IncidentForAlerts> = {}): IncidentForAlerts {
  return {
    id: 42,
    title: "Test incident",
    kind: "exploited_vulnerability",
    severity: "high",
    status: "open",
    assessmentId: 7,
    productName: "Test Product",
    earlyWarningDueAt: new Date(NOW + 100 * DAY),
    earlyWarningDoneAt: null,
    notificationDueAt: new Date(NOW + 101 * DAY),
    notificationDoneAt: null,
    finalReportDueAt: new Date(NOW + 102 * DAY),
    finalReportDoneAt: null,
    ...overrides,
  };
}

describe("clampLeadTimeHours", () => {
  it("defaults when unset and clamps to [1, 168]", () => {
    expect(clampLeadTimeHours(undefined)).toBe(DEFAULT_LEAD_TIME_HOURS);
    expect(clampLeadTimeHours(Number.NaN)).toBe(DEFAULT_LEAD_TIME_HOURS);
    expect(clampLeadTimeHours(0)).toBe(1);
    expect(clampLeadTimeHours(-5)).toBe(1);
    expect(clampLeadTimeHours(9000)).toBe(168);
    expect(clampLeadTimeHours(12.9)).toBe(12);
    expect(clampLeadTimeHours(6)).toBe(6);
  });
});

describe("planIncidentAlerts clock boundaries", () => {
  it("dueAt exactly now → breached (not approaching)", () => {
    const alerts = planIncidentAlerts(
      incident({ earlyWarningDueAt: new Date(NOW) }),
      NOW,
      LEAD,
    );
    expect(alerts).toHaveLength(1);
    expect(alerts[0]!.stage).toBe("early_warning");
    expect(alerts[0]!.phase).toBe("breached");
    expect(alerts[0]!.alertKey).toBe("incident:42:early_warning:breached");
  });

  it("1ms past due → breached; 1ms before due → approaching", () => {
    const past = planIncidentAlerts(
      incident({ earlyWarningDueAt: new Date(NOW - 1) }),
      NOW,
      LEAD,
    );
    expect(past[0]!.phase).toBe("breached");
    const future = planIncidentAlerts(
      incident({ earlyWarningDueAt: new Date(NOW + 1) }),
      NOW,
      LEAD,
    );
    expect(future[0]!.phase).toBe("approaching");
  });

  it("dueAt exactly at the lead-time edge → approaching; 1ms beyond → nothing", () => {
    const atEdge = planIncidentAlerts(
      incident({ earlyWarningDueAt: new Date(NOW + LEAD) }),
      NOW,
      LEAD,
    );
    expect(atEdge).toHaveLength(1);
    expect(atEdge[0]!.phase).toBe("approaching");
    const beyond = planIncidentAlerts(
      incident({ earlyWarningDueAt: new Date(NOW + LEAD + 1) }),
      NOW,
      LEAD,
    );
    expect(beyond).toHaveLength(0);
  });

  it("every pending stage alerts independently with distinct keys", () => {
    const alerts = planIncidentAlerts(
      incident({
        earlyWarningDueAt: new Date(NOW - 2 * HOUR), // breached
        notificationDueAt: new Date(NOW + 3 * HOUR), // approaching
        finalReportDueAt: new Date(NOW + 10 * DAY), // outside lead window
      }),
      NOW,
      LEAD,
    );
    expect(alerts.map((a) => a.alertKey).sort()).toEqual([
      "incident:42:early_warning:breached",
      "incident:42:notification:approaching",
    ]);
  });

  it("completed stages never alert, even when overdue", () => {
    const alerts = planIncidentAlerts(
      incident({
        earlyWarningDueAt: new Date(NOW - 2 * HOUR),
        earlyWarningDoneAt: new Date(NOW - 1 * HOUR),
        notificationDueAt: new Date(NOW - 1 * HOUR), // pending + breached
      }),
      NOW,
      LEAD,
    );
    expect(alerts.map((a) => a.stage)).toEqual(["notification"]);
  });

  it("resolved / closed incidents never alert", () => {
    for (const status of ["resolved", "closed"]) {
      const alerts = planIncidentAlerts(
        incident({ status, earlyWarningDueAt: new Date(NOW - DAY) }),
        NOW,
        LEAD,
      );
      expect(alerts).toHaveLength(0);
    }
  });

  it("clampReminderIntervalHours / clampMaxReminders defaults and bounds", () => {
    expect(clampReminderIntervalHours(undefined)).toBe(DEFAULT_REMINDER_INTERVAL_HOURS);
    expect(clampReminderIntervalHours(0)).toBe(1);
    expect(clampReminderIntervalHours(9000)).toBe(168);
    expect(clampMaxReminders(undefined)).toBe(DEFAULT_MAX_REMINDERS);
    expect(clampMaxReminders(-1)).toBe(0); // 0 = reminders off
    expect(clampMaxReminders(999)).toBe(30);
    expect(clampMaxReminders(3.9)).toBe(3);
  });

  it("alertKeyFor formats the dedupe key", () => {
    expect(alertKeyFor(9, "final_report", "approaching")).toBe(
      "incident:9:final_report:approaching",
    );
  });
});

describe("repeat 'still overdue' reminders", () => {
  const POLICY = { reminderIntervalMs: 24 * HOUR, maxReminders: 3 };

  function breachedAlerts(overdueMs: number, policy = POLICY) {
    return planIncidentAlerts(
      incident({ earlyWarningDueAt: new Date(NOW - overdueMs) }),
      NOW,
      LEAD,
      policy,
    );
  }

  it("no reminder before one full interval has elapsed", () => {
    const alerts = breachedAlerts(24 * HOUR - 1);
    expect(alerts).toHaveLength(1); // breach alert only
    expect(alerts[0]!.reminderNumber).toBeNull();
  });

  it("exactly one interval overdue → reminder 1 alongside the breach key", () => {
    const alerts = breachedAlerts(24 * HOUR);
    expect(alerts.map((a) => a.alertKey)).toEqual([
      "incident:42:early_warning:breached",
      "incident:42:early_warning:breached:reminder:1",
    ]);
    expect(alerts[1]!.reminderNumber).toBe(1);
  });

  it("plans only the LATEST due reminder, not a backlog", () => {
    const alerts = breachedAlerts(2.5 * 24 * HOUR); // 2 full intervals
    const reminders = alerts.filter((a) => a.reminderNumber != null);
    expect(reminders).toHaveLength(1);
    expect(reminders[0]!.alertKey).toBe("incident:42:early_warning:breached:reminder:2");
  });

  it("caps at maxReminders, then goes quiet with the same key", () => {
    const atCap = breachedAlerts(10 * 24 * HOUR); // 10 intervals, cap 3
    const reminders = atCap.filter((a) => a.reminderNumber != null);
    expect(reminders).toHaveLength(1);
    expect(reminders[0]!.alertKey).toBe("incident:42:early_warning:breached:reminder:3");
    // Even further overdue: still the same capped key → dedupe suppresses it.
    const later = breachedAlerts(50 * 24 * HOUR);
    expect(later.filter((a) => a.reminderNumber != null)[0]!.alertKey).toBe(
      "incident:42:early_warning:breached:reminder:3",
    );
  });

  it("maxReminders 0 disables reminders entirely", () => {
    const alerts = breachedAlerts(10 * 24 * HOUR, { reminderIntervalMs: 24 * HOUR, maxReminders: 0 });
    expect(alerts.filter((a) => a.reminderNumber != null)).toHaveLength(0);
  });

  it("approaching stages never get reminders", () => {
    const alerts = planIncidentAlerts(
      incident({ earlyWarningDueAt: new Date(NOW + HOUR) }),
      NOW,
      LEAD,
      POLICY,
    );
    expect(alerts.filter((a) => a.reminderNumber != null)).toHaveLength(0);
  });

  it("reminderKeyFor formats the dedupe key", () => {
    expect(reminderKeyFor(9, "notification", 4)).toBe(
      "incident:9:notification:breached:reminder:4",
    );
  });

  it("reminder email says still overdue with time overdue and link", () => {
    const alerts = breachedAlerts(3 * 24 * HOUR + 2 * HOUR);
    const reminder = alerts.find((a) => a.reminderNumber != null)!;
    const { subject, html } = buildAlertEmail(reminder, NOW, "https://example.com/a/7");
    expect(subject).toContain("CRA deadline still overdue (reminder 3)");
    expect(subject).toContain("24-hour early warning");
    expect(html).toContain("still overdue");
    expect(html).toContain("overdue by 3d");
    expect(html).toContain("https://example.com/a/7");
  });
});

describe("digest", () => {
  it("digestKeyFor is stable within a UTC day and changes across days", () => {
    expect(digestKeyFor(NOW)).toBe("digest:2026-03-10");
    expect(digestKeyFor(NOW + 11 * HOUR)).toBe("digest:2026-03-10"); // 23:00Z same day
    expect(digestKeyFor(NOW + 13 * HOUR)).toBe("digest:2026-03-11");
  });

  it("keeps the soonest pending stage per incident, within the 14-day window, sorted", () => {
    const overdue = incident({
      id: 1,
      earlyWarningDueAt: new Date(NOW - 3 * HOUR),
      notificationDueAt: new Date(NOW + 2 * DAY),
    });
    const dueSoon = incident({
      id: 2,
      // early warning done → soonest pending is notification
      earlyWarningDueAt: new Date(NOW - 5 * DAY),
      earlyWarningDoneAt: new Date(NOW - 5 * DAY),
      notificationDueAt: new Date(NOW + 3 * DAY),
    });
    const farFuture = incident({ id: 3 }); // all dues ~100 days out
    const closed = incident({ id: 4, status: "closed", earlyWarningDueAt: new Date(NOW - DAY) });
    const allDone = incident({
      id: 5,
      earlyWarningDoneAt: new Date(NOW),
      notificationDoneAt: new Date(NOW),
      finalReportDoneAt: new Date(NOW),
    });

    const items = summarizeForDigest([farFuture, dueSoon, overdue, closed, allDone], NOW);
    expect(items.map((i) => i.incident.id)).toEqual([1, 2]);
    expect(items[0]!.overdue).toBe(true);
    expect(items[0]!.stage).toBe("early_warning");
    expect(items[1]!.overdue).toBe(false);
    expect(items[1]!.stage).toBe("notification");
  });

  it("boundary: exactly 14 days out is included, 1ms beyond is not", () => {
    const atEdge = incident({ id: 1, earlyWarningDueAt: new Date(NOW + DUE_SOON_MS) });
    const beyond = incident({ id: 2, earlyWarningDueAt: new Date(NOW + DUE_SOON_MS + 1) });
    const items = summarizeForDigest([atEdge, beyond], NOW);
    expect(items.map((i) => i.incident.id)).toEqual([1]);
  });
});

describe("email content", () => {
  it("breached alert subject + HTML-escaped fields", () => {
    const alert = planIncidentAlerts(
      incident({
        title: `<script>alert("x")</script>`,
        productName: `Widget & "Co" <v2>`,
        earlyWarningDueAt: new Date(NOW - 2 * HOUR),
      }),
      NOW,
      LEAD,
    )[0]!;
    const { subject, html } = buildAlertEmail(alert, NOW, "https://example.com/a/7");
    expect(subject).toContain("CRA deadline breached");
    expect(subject).toContain("24-hour early warning");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("Widget &amp; &quot;Co&quot; &lt;v2&gt;");
    expect(html).toContain("https://example.com/a/7");
    expect(html).toContain("overdue by 2h");
  });

  it("approaching alert subject", () => {
    const alert = planIncidentAlerts(
      incident({ notificationDueAt: new Date(NOW + 3 * HOUR) }),
      NOW,
      LEAD,
    )[0]!;
    const { subject } = buildAlertEmail(alert, NOW, "https://example.com");
    expect(subject).toContain("CRA deadline approaching");
    expect(subject).toContain("72-hour notification");
  });

  it("digest email counts + escaping", () => {
    const items = summarizeForDigest(
      [
        incident({ id: 1, title: "A & B", earlyWarningDueAt: new Date(NOW - HOUR) }),
        incident({ id: 2, earlyWarningDueAt: new Date(NOW + 2 * DAY) }),
      ],
      NOW,
    );
    const { subject, html } = buildDigestEmail(items, NOW, "https://example.com/conformity");
    expect(subject).toBe("CRA deadline digest: 1 overdue, 1 due soon");
    expect(html).toContain("A &amp; B");
    expect(html).toContain("https://example.com/conformity");
  });
});
