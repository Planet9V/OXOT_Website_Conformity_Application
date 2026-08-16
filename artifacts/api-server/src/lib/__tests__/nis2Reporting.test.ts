import { describe, expect, it } from "vitest";
import { assessEntityIncident } from "../nis2Reporting";

/**
 * NIS2 Art. 23(4) clocks. The load-bearing assertions are the anchors:
 * 24h and 72h run from AWARENESS; the one-month final report runs from the
 * SUBMISSION of the incident notification — and does not run at all before
 * that submission exists.
 */
const AWARE = "2026-08-01T12:00:00.000Z";

describe("assessEntityIncident", () => {
  it("sets the 24h and 72h deadlines from awareness", () => {
    const { stages } = assessEntityIncident({ awareAt: AWARE }, new Date(AWARE));
    expect(stages[0]!.dueAt).toBe("2026-08-02T12:00:00.000Z");
    expect(stages[1]!.dueAt).toBe("2026-08-04T12:00:00.000Z");
  });

  it("the final report has NO deadline before the notification is submitted", () => {
    const { stages } = assessEntityIncident({ awareAt: AWARE }, new Date(AWARE));
    expect(stages[2]!.dueAt).toBeNull();
    expect(stages[2]!.state).toBe("not_yet_running");
    expect(stages[2]!.message).toContain("SUBMISSION of the incident notification");
  });

  it("anchors the final report one month after the notification submission, not awareness", () => {
    const { stages } = assessEntityIncident(
      { awareAt: AWARE, notificationAt: "2026-08-03T09:00:00.000Z" },
      new Date("2026-08-05T00:00:00.000Z"),
    );
    expect(stages[2]!.dueAt).toBe("2026-09-03T09:00:00.000Z");
    expect(stages[2]!.state).toBe("pending");
  });

  it("clamps month-end arithmetic instead of overflowing", () => {
    const { stages } = assessEntityIncident(
      { awareAt: "2026-01-30T00:00:00.000Z", notificationAt: "2026-01-31T10:00:00.000Z" },
      new Date("2026-02-01T00:00:00.000Z"),
    );
    // 31 Jan + 1 month clamps to 28 Feb 2026 (not 2/3 March).
    expect(stages[2]!.dueAt).toBe("2026-02-28T10:00:00.000Z");
  });

  it("marks an unmet stage overdue once its deadline passes", () => {
    const { stages, overdueCount } = assessEntityIncident(
      { awareAt: AWARE },
      new Date("2026-08-03T00:00:00.000Z"),
    );
    expect(stages[0]!.state).toBe("overdue");
    expect(stages[1]!.state).toBe("pending");
    expect(overdueCount).toBe(1);
  });

  it("a late submission is met but says it was after the deadline", () => {
    const { stages } = assessEntityIncident(
      { awareAt: AWARE, earlyWarningAt: "2026-08-03T00:00:00.000Z" },
      new Date("2026-08-04T00:00:00.000Z"),
    );
    expect(stages[0]!.state).toBe("met");
    expect(stages[0]!.message).toContain("after the deadline");
  });
});
