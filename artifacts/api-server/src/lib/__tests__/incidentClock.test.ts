/**
 * CRA Article 14 track-aware reporting clock math.
 *
 * Legal anchors under test:
 *  - Both tracks: early warning = detection + 24h, notification = detection + 72h.
 *  - Exploited vulnerability: final report = corrective-available + 14 days,
 *    conservative fallback detection + 14 days until that anchor is recorded.
 *  - Severe incident: final report = notification submitted + 30 days ("one
 *    month", 30-day months for determinism), conservative fallback
 *    detection + 72h + 30 days.
 */
import { describe, it, expect } from "vitest";
import {
  incidentClock,
  addCalendarMonth,
  isIncidentKind,
  INCIDENT_KIND_LABELS,
  buildIncidentReportPackage,
  type IncidentForReport,
} from "../conformityEngine";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const detectedAt = new Date("2026-07-01T12:00:00.000Z");
const t = detectedAt.getTime();

describe("incidentClock — shared 24h/72h clocks", () => {
  it("early warning and notification anchor on detection for both tracks", () => {
    for (const kind of ["exploited_vulnerability", "severe_incident"] as const) {
      const clock = incidentClock(detectedAt, kind);
      expect(clock.earlyWarningDueAt.getTime()).toBe(t + 24 * HOUR);
      expect(clock.notificationDueAt.getTime()).toBe(t + 72 * HOUR);
    }
  });

  it("anchors never shift the 24h/72h clocks", () => {
    const clock = incidentClock(detectedAt, "severe_incident", {
      notificationDoneAt: new Date(t + 50 * HOUR),
      correctiveAvailableAt: new Date(t + 2 * DAY),
    });
    expect(clock.earlyWarningDueAt.getTime()).toBe(t + 24 * HOUR);
    expect(clock.notificationDueAt.getTime()).toBe(t + 72 * HOUR);
  });
});

describe("incidentClock — exploited vulnerability final report", () => {
  it("falls back conservatively to detection + 14 days when no fix date is known", () => {
    const clock = incidentClock(detectedAt, "exploited_vulnerability");
    expect(clock.finalReportDueAt.getTime()).toBe(t + 14 * DAY);
  });

  it("anchors on corrective-available + 14 days once recorded", () => {
    const fixAt = new Date(t + 5 * DAY);
    const clock = incidentClock(detectedAt, "exploited_vulnerability", {
      correctiveAvailableAt: fixAt,
    });
    expect(clock.finalReportDueAt.getTime()).toBe(fixAt.getTime() + 14 * DAY);
  });

  it("ignores the severe-track anchor (notificationDoneAt)", () => {
    const clock = incidentClock(detectedAt, "exploited_vulnerability", {
      notificationDoneAt: new Date(t + 50 * HOUR),
    });
    expect(clock.finalReportDueAt.getTime()).toBe(t + 14 * DAY);
  });
});

describe("incidentClock — severe incident final report (exact calendar month)", () => {
  it("falls back conservatively to detection + 72h + one calendar month before the notification is submitted", () => {
    const clock = incidentClock(detectedAt, "severe_incident");
    expect(clock.finalReportDueAt.getTime()).toBe(
      addCalendarMonth(new Date(t + 72 * HOUR)).getTime(),
    );
  });

  it("anchors on notification submission + one calendar month once submitted", () => {
    const doneAt = new Date(t + 60 * HOUR);
    const clock = incidentClock(detectedAt, "severe_incident", {
      notificationDoneAt: doneAt,
    });
    expect(clock.finalReportDueAt.getTime()).toBe(addCalendarMonth(doneAt).getTime());
  });

  it("ignores the vulnerability-track anchor (correctiveAvailableAt)", () => {
    const clock = incidentClock(detectedAt, "severe_incident", {
      correctiveAvailableAt: new Date(t + 2 * DAY),
    });
    expect(clock.finalReportDueAt.getTime()).toBe(
      addCalendarMonth(new Date(t + 72 * HOUR)).getTime(),
    );
  });
});

describe("addCalendarMonth — EU period arithmetic (Regulation 1182/71)", () => {
  it("moves to the same day of the next month, preserving time of day", () => {
    const d = addCalendarMonth(new Date("2026-03-15T09:30:00.000Z"));
    expect(d.toISOString()).toBe("2026-04-15T09:30:00.000Z");
  });

  it("clamps to the last day when the target month is shorter (Jan 31 → Feb 28)", () => {
    const d = addCalendarMonth(new Date("2026-01-31T12:00:00.000Z"));
    expect(d.toISOString()).toBe("2026-02-28T12:00:00.000Z");
  });

  it("handles leap years (Jan 31 → Feb 29 in 2028)", () => {
    const d = addCalendarMonth(new Date("2028-01-31T00:00:00.000Z"));
    expect(d.toISOString()).toBe("2028-02-29T00:00:00.000Z");
  });

  it("rolls over the year (Dec 15 → Jan 15)", () => {
    const d = addCalendarMonth(new Date("2026-12-15T23:59:00.000Z"));
    expect(d.toISOString()).toBe("2027-01-15T23:59:00.000Z");
  });
});

describe("isIncidentKind", () => {
  it("accepts exactly the two statutory tracks", () => {
    expect(isIncidentKind("exploited_vulnerability")).toBe(true);
    expect(isIncidentKind("severe_incident")).toBe(true);
    expect(isIncidentKind("incident")).toBe(false);
    expect(isIncidentKind("")).toBe(false);
  });
});

function reportInput(overrides: Partial<IncidentForReport> = {}): IncidentForReport {
  return {
    id: 1,
    assessmentId: 2,
    title: "Exploited CVE-2026-1",
    description: "Heap overflow exploited in the wild.",
    kind: "exploited_vulnerability",
    severity: "high",
    detectedAt,
    earlyWarningDueAt: new Date(t + 24 * HOUR),
    earlyWarningDoneAt: null,
    notificationDueAt: new Date(t + 72 * HOUR),
    notificationDoneAt: null,
    finalReportDueAt: new Date(t + 14 * DAY),
    finalReportDoneAt: null,
    correctiveAvailableAt: null,
    memberStates: "",
    suspectedMalicious: false,
    exploitNature: "",
    correctiveMeasures: "",
    userMitigations: "",
    threatActorInfo: "",
    sensitive: false,
    ...overrides,
  };
}

describe("buildIncidentReportPackage", () => {
  it("assembles the three stage sections in statutory order", () => {
    const pkg = buildIncidentReportPackage(reportInput(), "Smart Hub");
    expect(pkg.sections.map((s) => s.stage)).toEqual([
      "early_warning",
      "notification",
      "final_report",
    ]);
    expect(pkg.kindLabel).toBe(INCIDENT_KIND_LABELS.exploited_vulnerability);
  });

  it("flags uncaptured Art 14 content as missing instead of inventing text", () => {
    const pkg = buildIncidentReportPackage(reportInput(), "Smart Hub");
    const notification = pkg.sections[1]!;
    const byLabel = Object.fromEntries(notification.fields.map((f) => [f.label, f]));
    expect(byLabel["EU member states affected"]!.missing).toBe(true);
    expect(byLabel["Corrective or mitigating measures taken"]!.missing).toBe(true);
    // Captured content is never flagged.
    expect(byLabel["General information about the incident"]!.missing).toBe(false);
  });

  it("vulnerability final report demands the corrective-available date", () => {
    const pkg = buildIncidentReportPackage(reportInput(), "Smart Hub");
    const final = pkg.sections[2]!;
    const fix = final.fields.find((f) =>
      f.label.startsWith("Corrective or mitigating measure available"),
    );
    expect(fix?.missing).toBe(true);
    expect(final.label).toContain("14 days after corrective measure available");
  });

  it("severe incidents carry the malicious-cause field and the 1-month label", () => {
    const pkg = buildIncidentReportPackage(
      reportInput({ kind: "severe_incident", suspectedMalicious: true }),
      "Smart Hub",
    );
    const early = pkg.sections[0]!;
    const malicious = early.fields.find((f) =>
      f.label.startsWith("Suspected to be caused"),
    );
    expect(malicious?.value).toBe("Yes");
    expect(pkg.sections[2]!.label).toContain("1 month after notification");
    expect(pkg.deadlineNote).toContain("one calendar month");
  });

  it("carries the statutory basis per stage and field (ENISA-ready)", () => {
    const vuln = buildIncidentReportPackage(reportInput(), "Smart Hub");
    expect(vuln.sections.map((s) => s.articleRef)).toEqual([
      "Art 14(2)(a) CRA",
      "Art 14(2)(b) CRA",
      "Art 14(2)(c) CRA",
    ]);
    const severe = buildIncidentReportPackage(reportInput({ kind: "severe_incident" }), "Hub");
    expect(severe.sections.map((s) => s.articleRef)).toEqual([
      "Art 14(3)(a) CRA",
      "Art 14(3)(b) CRA",
      "Art 14(3)(c) CRA",
    ]);
    // Every statutory (required) field cites its provision; context-only fields may not.
    for (const pkg of [vuln, severe]) {
      for (const section of pkg.sections) {
        for (const field of section.fields) {
          if (field.missing || field.value) {
            expect(field.citation === "" || field.citation.startsWith("Art 14")).toBe(true);
          }
          if (field.label !== "Information considered highly sensitive") {
            expect(field.citation).not.toBe("");
          }
        }
      }
    }
  });
});
