import { isAutomatedBrowser } from "./tour";

/**
 * First-login onboarding gating.
 *
 * The rules mirror the tour's auto-start discipline:
 *  - Only NAMED members are onboarded (admin/demo are env-configured accounts).
 *  - `needsOnboarding` must be explicitly true — session fixtures and older
 *    cached payloads simply lack the field, and must never trigger a redirect.
 *  - Never under automation (navigator.webdriver), so the Playwright suites
 *    stay deterministic unless a spec opts in by overriding the getter.
 *  - Skipping is per browser session (sessionStorage): the flow returns on the
 *    next sign-in, but never loops within the one the user just dismissed.
 */
export const ONBOARDING_SKIP_KEY = "oxot-conformity-onboarding-skip";

export function onboardingSkippedThisSession(): boolean {
  try {
    return sessionStorage.getItem(ONBOARDING_SKIP_KEY) === "1";
  } catch {
    // Storage unavailable → treat as skipped (we could not persist a dismissal,
    // so auto-redirecting would loop forever).
    return true;
  }
}

export function markOnboardingSkipped(): void {
  try {
    sessionStorage.setItem(ONBOARDING_SKIP_KEY, "1");
  } catch {
    // Best effort only.
  }
}

type SessionLike = {
  authenticated?: boolean;
  role?: string | null;
  needsOnboarding?: boolean;
};

export function shouldAutoStartOnboarding(session: SessionLike | undefined): boolean {
  return (
    Boolean(session?.authenticated) &&
    session?.role === "member" &&
    session?.needsOnboarding === true &&
    !isAutomatedBrowser() &&
    !onboardingSkippedThisSession()
  );
}
