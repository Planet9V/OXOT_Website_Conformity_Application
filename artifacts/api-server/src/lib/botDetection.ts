// Reusable bot/crawler detection for analytics integrity.
//
// Visitor analytics (page views + affiliate clicks) should reflect real humans.
// Search-engine crawlers and link-unfurl bots send a User-Agent that matches
// well-known, self-identifying tokens; we skip recording events from those so
// the numbers stay meaningful. Legitimate browser UAs (Chrome/Firefox/Safari/
// Edge, mobile browsers, AND in-app browsers like WhatsApp/Instagram/Facebook/
// Line) must NOT match and are counted as normal.
//
// IMPORTANT: This list is CURATED and STRICT. It must stay IDENTICAL in content
// to the CRAWLER_UA list in artifacts/oxot-web/vite-seo-plugin.ts — keep the two
// in sync. We deliberately avoid ambiguous in-app-browser substrings (bare
// "whatsapp", "instagram", "fban", "fbav", "line", "gsa", etc.) because those
// appear in genuine human UAs. For WhatsApp we only match the link-unfurler
// form ("whatsapp/2"), never the bare substring.

export const BOT_UA_PATTERNS: string[] = [
  // Known link-unfurl / search crawler UA tokens
  "googlebot",
  "bingbot",
  "duckduckbot",
  "yandexbot",
  "baiduspider",
  "applebot",
  "facebookexternalhit",
  "facebot",
  "twitterbot",
  "linkedinbot",
  "slackbot",
  "slack-imgproxy",
  "telegrambot",
  "discordbot",
  "pinterest",
  "redditbot",
  "embedly",
  // WhatsApp link preview only — match the unfurler form, NOT the generic
  // "whatsapp" substring that appears in the human in-app browser UA.
  "whatsapp/2",
  // Safe generic engine tokens
  "bot",
  "crawler",
  "spider",
  // Headless / http-client tokens
  "headlesschrome",
  "puppeteer",
  "playwright",
  "selenium",
  "curl",
  "wget",
  "python-requests",
  "axios",
  "go-http-client",
  "java/",
];

// Patterns are matched as literal substrings; escape regex metacharacters so
// entries like "java/" or "got (" cannot break the combined expression.
const REGEX_META = /[.*+?^${}()|[\]\\]/g;
function escapeRegExp(literal: string): string {
  return literal.replace(REGEX_META, (ch) => "\\" + ch);
}

const BOT_UA_REGEX = new RegExp(BOT_UA_PATTERNS.map(escapeRegExp).join("|"), "i");

/**
 * Returns true when the given User-Agent string looks like a bot, crawler,
 * spider, headless browser, monitoring probe, or non-browser HTTP client.
 *
 * An empty/missing User-Agent is treated as a bot: real browsers always send
 * one, so an absent UA is an obvious non-human signal.
 */
export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent) return true;
  const ua = userAgent.trim();
  if (ua.length === 0) return true;
  return BOT_UA_REGEX.test(ua);
}
