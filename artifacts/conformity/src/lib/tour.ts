/**
 * First-run guided tours, built on driver.js.
 *
 * Rules of engagement:
 *  - A tour auto-starts at most ONCE per browser (persisted in localStorage the
 *    moment it opens — closing it in any way counts as "seen").
 *  - Auto-start is suppressed for automated browsers (navigator.webdriver) so
 *    the Playwright suites never fight a spotlight overlay, and for the shared
 *    demo role, where the tour is available from the Help menu but never forced.
 *  - Manual starts (Help menu → "Take the tour") always work, for everyone.
 *
 * Step copy is grounded in the CRA machinery the workbench actually models —
 * Art. 32 routes, Annex I requirements, Art. 14 clocks, Annex VII documents —
 * not generic onboarding fluff.
 */

import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

export type TourId = "workbench" | "portfolio";

type DriverInstance = ReturnType<typeof driver>;

const STORAGE_PREFIX = "oxot-conformity-tour:";

export function tourStorageKey(id: TourId): string {
  return `${STORAGE_PREFIX}${id}`;
}

export function tourSeen(id: TourId): boolean {
  try {
    return localStorage.getItem(tourStorageKey(id)) === "done";
  } catch {
    // Storage unavailable → never auto-start (we could not persist a dismissal).
    return true;
  }
}

export function markTourSeen(id: TourId): void {
  try {
    localStorage.setItem(tourStorageKey(id), "done");
  } catch {
    // Best effort only.
  }
}

/** Playwright / headless automation — never auto-start a tour under it. */
export function isAutomatedBrowser(): boolean {
  return typeof navigator !== "undefined" && navigator.webdriver === true;
}

/** Cross-component "start a tour" request (Help menu → the page that owns it). */
export const TOUR_EVENT = "oxot-conformity:start-tour";

export function requestTour(id: TourId): void {
  window.dispatchEvent(new CustomEvent<TourId>(TOUR_EVENT, { detail: id }));
}

const TOUR_STEPS: Record<TourId, DriveStep[]> = {
  workbench: [
    {
      element: '[data-tour="journey-card"]',
      popover: {
        title: "Journey, grade, next best action",
        description:
          "The stepper tracks workflow position — scoping through review. The ring grades answer quality (A–F). They are deliberately separate: a finished-looking journey with open blockers never reads as done. The nudge underneath always names the single next best action.",
      },
    },
    {
      element: '[data-tour="workbench-tabs"]',
      popover: {
        title: "One tab per CRA duty",
        description:
          "Wizard — scope, class (Annex III) and conformity route (Art. 32). Gap assessment — the Annex I requirement worklist with evidence. Documents — Annex VII technical documentation, the draft Declaration of Conformity and the Annex II user information & instructions. Incidents — the Art. 14 reporting clocks: 24 h early warning, 72 h notification, then the final report. BOM vault — SBOM ingest with live vulnerability checks.",
      },
    },
    {
      element: '[data-tour="next-actions"]',
      popover: {
        title: "Work top-down",
        description:
          "Blockers and overdue statutory deadlines first, then open gaps and unfinished documents. Every open item appears exactly once — an empty list genuinely means nothing is waiting.",
      },
    },
    {
      element: '[data-testid="assistant-open"]',
      popover: {
        title: "Ask the copilot",
        description:
          "It reads this assessment's live state — gaps, evidence, incident clocks, grade — and answers in context. Try \"what should I fix first?\". Replay this tour or open the glossary any time from the Help menu in the header.",
      },
    },
  ],
  portfolio: [
    {
      element: '[data-tour="posture"]',
      popover: {
        title: "Portfolio posture",
        description:
          "Where each assessment sits in the workflow. Blockers lead and ready trails — the band is ordered by urgency, never alphabetically.",
      },
    },
    {
      element: '[data-tour="deadline-horizon"]',
      popover: {
        title: "Statutory clocks, not reminders",
        description:
          "Every open incident's CRA Art. 14 reporting clocks — 24 h early warning, 72 h notification, then the final report — started the moment the incident was recorded. Left of now is overdue.",
      },
    },
    {
      element: '[data-tour="triage-board"]',
      popover: {
        title: "Most urgent first, always",
        description:
          "The board ranks the whole portfolio by what needs attention. The top row is your next stop — open it to see exactly why it ranks there. Replay this tour or open the glossary from the Help menu.",
      },
    },
  ],
};

let active: DriverInstance | null = null;

/**
 * Start a tour immediately. Marks it seen on open — dismissing it in any form
 * (Done, ✕, overlay click, navigation) counts, so it never nags twice.
 * `onOpen` lets the caller persist "seen" elsewhere too (e.g. the signed-in
 * member's account, so the state follows the person across devices).
 */
export function startTour(id: TourId, onOpen?: (id: TourId) => void): void {
  if (active?.isActive()) return;
  markTourSeen(id);
  onOpen?.(id);

  const reduceMotion =
    typeof window !== "undefined" &&
    (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);

  const instance = driver({
    steps: TOUR_STEPS[id],
    showProgress: true,
    progressText: "{{current}} / {{total}}",
    animate: !reduceMotion,
    smoothScroll: !reduceMotion,
    overlayOpacity: 0.6,
    stagePadding: 6,
    stageRadius: 10,
    popoverClass: "oxot-tour",
    nextBtnText: "Next",
    prevBtnText: "Back",
    doneBtnText: "Done",
    onDestroyed: () => {
      active = null;
    },
  });

  active = instance;
  instance.drive();
}

/**
 * Whether a tour should open on its own for this visitor.
 *
 * `accountSeen` is the server-side per-account state for named assessors:
 *  - `undefined` → no account-backed state (admin/demo/anonymous) → the
 *    per-browser localStorage record decides;
 *  - a boolean → the account is authoritative: the same person is never
 *    nagged again on a new device, and a colleague's browser (with its stale
 *    localStorage) never hides the tour from a fresh assessor.
 */
export function shouldAutoStart(
  id: TourId,
  isDemoRole: boolean,
  accountSeen?: boolean,
): boolean {
  if (isDemoRole || isAutomatedBrowser()) return false;
  if (accountSeen !== undefined) return !accountSeen;
  return !tourSeen(id);
}
