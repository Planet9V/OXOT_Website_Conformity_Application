import { useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetMyProfile,
  useMarkMyTourSeen,
  getGetMyProfileQueryKey,
  type MyProfile,
} from "@workspace/api-client-react";
import {
  TOUR_EVENT,
  shouldAutoStart,
  startTour,
  type TourId,
} from "@/lib/tour";

/**
 * Wire a page to its guided tour:
 *  - listens for Help-menu "Take the tour" requests for as long as the page is
 *    mounted (always honoured, any role);
 *  - auto-starts once when `ready` flips true — unless the visitor is the
 *    shared demo role (available, never forced) or an automated browser.
 *
 * "Seen" is persisted where the identity lives: named assessors (member role)
 * carry it on their account, so it follows the person across devices —
 * a colleague's browser never hides the tour from a fresh assessor, and a new
 * device never nags a veteran. Admin/demo are shared, env-configured logins,
 * so for them the per-browser localStorage record remains the source of truth.
 *
 * `ready` should mean "the page's real content is on screen" so the spotlight
 * has its anchor elements; skeleton states must keep it false. Callers must
 * ALSO keep `ready` false until the session (role) is resolved — otherwise the
 * demo-role gate could race the auto-start timer while the role is unknown.
 * For members the auto-start additionally waits for their profile (the
 * account-side seen state) to load.
 */
export function useTour(
  id: TourId,
  {
    ready,
    isDemoRole,
    isMember,
  }: { ready: boolean; isDemoRole: boolean; isMember: boolean },
): void {
  const queryClient = useQueryClient();
  // Members carry tour state on their account; others never fetch it.
  const { data: profile } = useGetMyProfile({
    query: { enabled: isMember, queryKey: getGetMyProfileQueryKey() },
  });
  const { mutate: markSeenOnAccount } = useMarkMyTourSeen({
    mutation: {
      onSuccess: (updated) => {
        queryClient.setQueryData(getGetMyProfileQueryKey(), updated);
      },
    },
  });

  // Persist "seen" on the account the moment a tour opens (member only) — and
  // optimistically in the query cache so the auto-start effect can't re-fire
  // while the write is in flight.
  const onOpen = useCallback(
    (openedId: TourId) => {
      if (!isMember) return;
      queryClient.setQueryData<MyProfile>(getGetMyProfileQueryKey(), (prev) =>
        prev && !prev.toursSeen?.includes(openedId)
          ? { ...prev, toursSeen: [...(prev.toursSeen ?? []), openedId] }
          : prev,
      );
      markSeenOnAccount({ data: { tourId: openedId } });
    },
    [isMember, markSeenOnAccount, queryClient],
  );

  useEffect(() => {
    const onRequest = (event: Event) => {
      if ((event as CustomEvent<TourId>).detail === id) startTour(id, onOpen);
    };
    window.addEventListener(TOUR_EVENT, onRequest);
    return () => window.removeEventListener(TOUR_EVENT, onRequest);
  }, [id, onOpen]);

  // Defensive: tolerate malformed/mocked profile payloads (missing toursSeen).
  const accountSeen = isMember
    ? profile
      ? (profile.toursSeen?.includes(id) ?? false)
      : undefined
    : undefined;
  // Members: hold auto-start until the account state has actually loaded.
  const accountStatePending = isMember && profile === undefined;

  useEffect(() => {
    if (!ready || accountStatePending) return;
    if (!shouldAutoStart(id, isDemoRole, accountSeen)) return;
    // Small delay so layout settles and the first spotlight lands accurately.
    const timer = window.setTimeout(() => startTour(id, onOpen), 800);
    return () => window.clearTimeout(timer);
  }, [id, ready, isDemoRole, accountSeen, accountStatePending, onOpen]);
}
