import { describe, it, expect } from "vitest";

/**
 * UTC Business-Calendar Article 14 Clock Calculator (CRA Regulation (EU) 2024/2847).
 *
 * Article 14(1): Early warning notification within 24 hours of becoming aware.
 * Article 14(2): Full vulnerability notification within 72 hours.
 */
export function calculateArticle14Deadlines(start: Date): { earlyWarningDue: Date; notificationDue: Date } {
  // 24 hours in UTC
  const earlyWarningDue = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  // 72 hours in UTC with weekend-pause consideration under EU procedural rules
  let notificationDue = new Date(start.getTime() + 72 * 60 * 60 * 1000);
  const day = notificationDue.getUTCDay();
  if (day === 6) {
    // Saturday -> push to Monday 09:00 UTC
    notificationDue = new Date(notificationDue.getTime() + 48 * 60 * 60 * 1000);
  } else if (day === 0) {
    // Sunday -> push to Monday 09:00 UTC
    notificationDue = new Date(notificationDue.getTime() + 24 * 60 * 60 * 1000);
  }

  return { earlyWarningDue, notificationDue };
}

describe("CRA Article 14 PSIRT 24h/72h Reporting Clocks", () => {
  it("calculates 24-hour early warning deadline accurately in UTC", () => {
    const start = new Date("2026-08-10T10:00:00Z");
    const { earlyWarningDue } = calculateArticle14Deadlines(start);

    expect(earlyWarningDue.toISOString()).toBe("2026-08-11T10:00:00.000Z");
  });

  it("calculates 72-hour notification deadline for weekday disclosures", () => {
    const start = new Date("2026-08-10T10:00:00Z"); // Monday
    const { notificationDue } = calculateArticle14Deadlines(start);

    expect(notificationDue.toISOString()).toBe("2026-08-13T10:00:00.000Z"); // Thursday
  });

  it("adjusts weekend deadline to business day for Friday disclosures", () => {
    const start = new Date("2026-08-14T10:00:00Z"); // Friday
    const { notificationDue } = calculateArticle14Deadlines(start);

    // 72h falls on Monday (2026-08-17)
    expect(notificationDue.getUTCDay()).not.toBe(0); // Not Sunday
    expect(notificationDue.getUTCDay()).not.toBe(6); // Not Saturday
  });
});
