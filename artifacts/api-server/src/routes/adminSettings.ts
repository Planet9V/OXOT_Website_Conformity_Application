import { Router, type IRouter } from "express";
import {
  GetLlmSettingsResponse,
  SaveLlmSettingsBody,
  SaveLlmSettingsResponse,
  GetIntegrationSettingsResponse,
  SaveEmailSettingsBody,
  SaveLinkedinSettingsBody,
  SaveXSettingsBody,
  SendTestEmailBody,
  TestXConnectionResponse,
  TestLinkedinConnectionResponse,
  SaveConformityAlertsSettingsBody,
  RunConformityAlertsCheckResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/adminAuth";
import { getLlmConfig, saveLlmConfig, getProviderStatuses, MODEL_CATALOG, fetchLiveOpenRouterModels } from "../lib/models";
import {
  getIntegrationSettingsMasked,
  saveEmailConfig,
  saveLinkedinConfig,
  saveXConfig,
  saveConformityAlertsConfig,
  getXConfig,
  getLinkedinConfig,
  recordIntegrationHealth,
  recordIntegrationEvent,
} from "../lib/integrationSettings";
import { verifyXConnection, verifyLinkedinConnection } from "../lib/social";
import { runConformityAlertScan } from "../lib/conformityAlertScan";
import { sendEmail } from "../lib/mailer";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.get("/admin/settings/llm", requireAdmin, async (_req, res) => {
  try {
    const config = await getLlmConfig();
    const catalog = await fetchLiveOpenRouterModels();
    res.json({
      config,
      providers: getProviderStatuses(),
      catalog,
    });
  } catch (err: any) {
    logger.error({ err }, "Failed to get LLM settings");
    res.status(500).json({ error: "Failed to get LLM settings" });
  }
});

router.put("/admin/settings/llm", requireAdmin, async (req, res) => {
  try {
    const {
      openrouterApiKey,
      chatModel,
      embeddingModel,
      longContextModel,
      briefModel,
      searchModel,
      translationModel,
    } = req.body || {};

    const config = await saveLlmConfig({
      openrouterApiKey: typeof openrouterApiKey === "string" ? openrouterApiKey : undefined,
      chatModel: typeof chatModel === "string" ? chatModel : undefined,
      embeddingModel: typeof embeddingModel === "string" ? embeddingModel : undefined,
      longContextModel: typeof longContextModel === "string" ? longContextModel : undefined,
      briefModel: typeof briefModel === "string" ? briefModel : undefined,
      searchModel: typeof searchModel === "string" ? searchModel : undefined,
      translationModel: typeof translationModel === "string" ? translationModel : undefined,
    });

    res.json({
      config,
      providers: getProviderStatuses(),
      catalog: MODEL_CATALOG,
    });
  } catch (err: any) {
    logger.error({ err }, "Failed to save LLM settings");
    res.status(500).json({ error: err.message || "Failed to save settings" });
  }
});

router.get("/admin/integration-settings", requireAdmin, async (_req, res) => {
  const settings = await getIntegrationSettingsMasked();
  res.json(GetIntegrationSettingsResponse.parse(settings));
});

router.put("/admin/settings/email", requireAdmin, async (req, res) => {
  const parsed = SaveEmailSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }
  const { smtpPort, fromEmail } = parsed.data;
  if (smtpPort !== undefined && (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535)) {
    res.status(400).json({ error: "SMTP port must be a whole number between 1 and 65535." });
    return;
  }
  if (fromEmail && !EMAIL_RE.test(fromEmail)) {
    res.status(400).json({ error: "From email must be a valid email address." });
    return;
  }
  const settings = await saveEmailConfig(parsed.data);
  void recordIntegrationEvent({ integration: "email", kind: "config_saved", success: true });
  res.json(GetIntegrationSettingsResponse.parse(settings));
});

router.post("/admin/settings/email/test", requireAdmin, async (req, res) => {
  const parsed = SendTestEmailBody.safeParse(req.body);
  if (!parsed.success || !EMAIL_RE.test(parsed.data.to)) {
    res.status(400).json({ error: "A valid recipient email address is required." });
    return;
  }
  const result = await sendEmail({
    to: parsed.data.to,
    subject: "OXOT test email",
    html: "<p>This is a test email from your OXOT admin console. If you received it, your email settings are working.</p>",
  });
  if (!result.delivered) {
    logger.warn({ error: result.error }, "Test email not delivered");
  }
  // sendEmail already records a 'send' health/event; also record a distinct
  // 'test_email' event so the activity feed reflects the admin's explicit test.
  void recordIntegrationHealth("email", { success: result.delivered, error: result.error ?? null });
  void recordIntegrationEvent({
    integration: "email",
    kind: "test_email",
    success: result.delivered,
    detail: result.delivered ? "test email sent" : (result.error ?? "not delivered"),
  });
  res.json({ delivered: result.delivered, error: result.error ?? null });
});

router.put("/admin/settings/linkedin", requireAdmin, async (req, res) => {
  const parsed = SaveLinkedinSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }
  const settings = await saveLinkedinConfig(parsed.data);
  void recordIntegrationEvent({ integration: "linkedin", kind: "config_saved", success: true });
  res.json(GetIntegrationSettingsResponse.parse(settings));
});

// Non-destructive LinkedIn connection test: GET /v2/userinfo with the token.
router.post("/admin/settings/linkedin/test", requireAdmin, async (_req, res) => {
  const cfg = await getLinkedinConfig();
  const result = await verifyLinkedinConnection(cfg);
  void recordIntegrationHealth("linkedin", { success: result.ok, error: result.error ?? null });
  void recordIntegrationEvent({
    integration: "linkedin",
    kind: "verify",
    success: result.ok,
    detail: result.ok ? "connection ok" : (result.error ?? "verify failed"),
  });
  res.json(
    TestLinkedinConnectionResponse.parse({
      ok: result.ok,
      error: result.error ?? null,
      checkedAt: result.checkedAt,
    }),
  );
});

router.put("/admin/settings/x", requireAdmin, async (req, res) => {
  const parsed = SaveXSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }
  const settings = await saveXConfig(parsed.data);
  void recordIntegrationEvent({ integration: "x", kind: "config_saved", success: true });
  res.json(GetIntegrationSettingsResponse.parse(settings));
});

// Non-destructive X connection test: signed GET /2/users/me (never posts).
router.post("/admin/settings/x/test", requireAdmin, async (_req, res) => {
  const cfg = await getXConfig();
  const result = await verifyXConnection(cfg);
  void recordIntegrationHealth("x", { success: result.ok, error: result.error ?? null });
  void recordIntegrationEvent({
    integration: "x",
    kind: "verify",
    success: result.ok,
    detail: result.ok ? "connection ok" : (result.error ?? "verify failed"),
  });
  res.json(
    TestXConnectionResponse.parse({
      ok: result.ok,
      error: result.error ?? null,
      checkedAt: result.checkedAt,
    }),
  );
});

router.put("/admin/settings/conformity-alerts", requireAdmin, async (req, res) => {
  const parsed = SaveConformityAlertsSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }
  const { recipient } = parsed.data;
  // Blank recipient is valid — alerts then fall back to the email
  // integration's alertEmail / fromEmail (shown as effectiveRecipient).
  if (recipient && !EMAIL_RE.test(recipient)) {
    res.status(400).json({ error: "Recipient must be a valid email address (or blank to use the email integration's alert address)." });
    return;
  }
  const settings = await saveConformityAlertsConfig(parsed.data);
  void recordIntegrationEvent({
    integration: "email",
    kind: "config_saved",
    success: true,
    detail: "conformity alerts",
  });
  res.json(GetIntegrationSettingsResponse.parse(settings));
});

// Manual trigger: run the CRA deadline alert scan right now. Dedupe lives in
// conformity_alert_state, so hammering this button never double-sends.
router.post("/admin/settings/conformity-alerts/run", requireAdmin, async (_req, res) => {
  const result = await runConformityAlertScan();
  res.json(RunConformityAlertsCheckResponse.parse(result));
});

// Live test ping endpoint for verifying assigned OpenRouter models
router.post("/admin/settings/llm/test-model", requireAdmin, async (req, res) => {
  try {
    const { modelId } = req.body || {};
    const targetModel = typeof modelId === "string" && modelId ? modelId : "~deepseek/deepseek-v4-flash-latest";
    const apiKey = await getDbOpenRouterApiKey();

    if (!apiKey) {
      res.status(400).json({ success: false, error: "No OpenRouter API Key configured" });
      return;
    }

    const liveRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://oxot.ai",
        "X-Title": "OXOT Conformity Application",
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [
          {
            role: "user",
            content: "Respond in 1 sentence confirming you are online and working for EU CRA conformity audit.",
          },
        ],
        max_tokens: 80,
      }),
    });

    const status = liveRes.status;
    const body: any = await liveRes.json();

    if (liveRes.ok && body.choices && body.choices.length > 0) {
      const responseText = body.choices[0].message?.content?.trim() || "Model online.";
      res.json({
        success: true,
        status,
        model: targetModel,
        responseText,
        usage: body.usage || null,
      });
    } else {
      res.status(400).json({
        success: false,
        status,
        model: targetModel,
        error: body.error?.message || "OpenRouter model test failed",
        raw: body,
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || "Failed to test model",
    });
  }
});

export default router;
