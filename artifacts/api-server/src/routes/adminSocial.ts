import { Router, type IRouter } from "express";
import {
  GetSocialStatusResponse,
  ListSocialPostsResponse,
  SocialPostBody,
  SocialPostResponse,
  RetrySocialPostResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/adminAuth";
import {
  getSocialStatus,
  getSocialStatusLive,
  listRecentSocialPosts,
  postToSocial,
  recordSocialOutcomes,
  retrySocialPost,
  alertSocialFailures,
  buildLinkedinAuthUrl,
  exchangeLinkedinCode,
  getPublicApiOrigin,
  signOAuthState,
  verifyOAuthState,
} from "../lib/social";
import {
  getLinkedinConfig,
  saveLinkedinToken,
  recordIntegrationEvent,
  recordIntegrationHealth,
} from "../lib/integrationSettings";

const router: IRouter = Router();

// Current credential configuration status — the admin UI reads this to know
// which platforms are ready to post to.
router.get("/admin/social/status", requireAdmin, async (req, res): Promise<void> => {
  const validate = req.query.validate === "true" || req.query.validate === "1";
  const status = validate ? await getSocialStatusLive() : await getSocialStatus();
  res.json(GetSocialStatusResponse.parse(status));
});

// Manually compose and send a post to one or both platforms.
router.post("/admin/social/post", requireAdmin, async (req, res): Promise<void> => {
  const parsed = SocialPostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }
  const { text, platforms } = parsed.data;
  try {
    const results = await postToSocial(text, platforms as ("linkedin" | "x")[]);
    await recordSocialOutcomes(results, text, "manual");
    await alertSocialFailures(results, text, "manual");
    res.json(SocialPostResponse.parse({ results }));
  } catch (err) {
    req.log.error({ err }, "Social post failed");
    res.status(500).json({ error: "Posting failed" });
  }
});

// Recent post outcomes so the admin can spot silent auto-share failures.
router.get("/admin/social/posts", requireAdmin, async (_req, res): Promise<void> => {
  const posts = await listRecentSocialPosts();
  res.json(ListSocialPostsResponse.parse(posts));
});

// Retry a previously failed (or any) social post by re-posting its stored text.
router.post(
  "/admin/social/posts/:id/retry",
  requireAdmin,
  async (req, res): Promise<void> => {
    const id = Number(req.params["id"]);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    try {
      const outcome = await retrySocialPost(id);
      if (!outcome) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(RetrySocialPostResponse.parse(outcome));
    } catch (err) {
      req.log.error({ err }, "Social retry failed");
      res.status(500).json({ error: "Retry failed" });
    }
  },
);

// ---------------------------------------------------------------------------
// LinkedIn OAuth (re-authorization). These are browser redirects, not typed
// JSON APIs, so they are intentionally NOT part of the OpenAPI spec.
// ---------------------------------------------------------------------------

const SETTINGS_URL = "/admin/settings";

function settingsRedirect(flag: string): string {
  return `${SETTINGS_URL}?linkedin=${flag}`;
}

// Begin the OAuth flow: redirect the admin to LinkedIn's authorization page.
router.get(
  "/admin/social/linkedin/oauth/start",
  requireAdmin,
  async (_req, res): Promise<void> => {
    const cfg = await getLinkedinConfig();
    if (!cfg.clientId) {
      res.redirect(settingsRedirect("missing_client"));
      return;
    }
    const state = signOAuthState();
    res.redirect(buildLinkedinAuthUrl(cfg.clientId, state));
  },
);

// OAuth callback: exchange the code for an access token and store it.
router.get(
  "/admin/social/linkedin/oauth/callback",
  requireAdmin,
  async (req, res): Promise<void> => {
    const { code, state, error } = req.query as {
      code?: string;
      state?: string;
      error?: string;
    };
    if (error) {
      res.redirect(settingsRedirect("denied"));
      return;
    }
    if (!verifyOAuthState(state)) {
      res.redirect(settingsRedirect("bad_state"));
      return;
    }
    if (!code) {
      res.redirect(settingsRedirect("no_code"));
      return;
    }
    const cfg = await getLinkedinConfig();
    if (!cfg.clientId || !cfg.clientSecret) {
      res.redirect(settingsRedirect("missing_client"));
      return;
    }
    try {
      const token = await exchangeLinkedinCode(code, cfg.clientId, cfg.clientSecret);
      await saveLinkedinToken(token.accessToken, token.expiresAt);
      void recordIntegrationHealth("linkedin", { success: true });
      void recordIntegrationEvent({
        integration: "linkedin",
        kind: "oauth",
        success: true,
        detail: "OAuth re-authorization completed",
      });
      res.redirect(settingsRedirect("connected"));
    } catch (err) {
      req.log.error({ err }, "LinkedIn OAuth token exchange failed");
      void recordIntegrationEvent({
        integration: "linkedin",
        kind: "oauth",
        success: false,
        detail: err instanceof Error ? err.message : "token exchange failed",
      });
      res.redirect(settingsRedirect("error"));
    }
  },
);

// Expose the redirect URI the admin must whitelist (unused by codegen; handy
// for the settings UI / debugging). Not part of OpenAPI.
router.get(
  "/admin/social/linkedin/oauth/redirect-uri",
  requireAdmin,
  (_req, res): void => {
    res.json({ redirectUri: `${getPublicApiOrigin()}/api/admin/social/linkedin/oauth/callback` });
  },
);

export default router;
