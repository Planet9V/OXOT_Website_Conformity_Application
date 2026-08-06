import OpenAI from "openai";
import { getDbOpenRouterApiKey } from "./models";

/**
 * OpenRouter-first LLM Client.
 * Dynamically resolves the API key from Postgres DB first, then falls back to OPENROUTER_API_KEY environment variable.
 */
export async function getOpenAIClient(): Promise<OpenAI> {
  const dbKey = await getDbOpenRouterApiKey();
  const envKey = process.env["OPENROUTER_API_KEY"];
  const openaiKey = process.env["OPENAI_API_KEY"];
  const aiIntegrationsKey = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];

  const resolvedApiKey =
    (dbKey && !dbKey.includes("dummy") ? dbKey : null) ||
    (envKey && !envKey.includes("dummy") ? envKey : null) ||
    (openaiKey && !openaiKey.includes("dummy") ? openaiKey : null) ||
    (aiIntegrationsKey && !aiIntegrationsKey.includes("dummy") ? aiIntegrationsKey : null) ||
    "dummy-key-for-local-dev";

  const resolvedBaseUrl =
    resolvedApiKey.startsWith("sk-or-") || process.env["OPENROUTER_BASE_URL"]
      ? (process.env["OPENROUTER_BASE_URL"] || "https://openrouter.ai/api/v1")
      : (process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"] || "https://api.openai.com/v1");

  return new OpenAI({
    apiKey: resolvedApiKey,
    baseURL: resolvedBaseUrl,
    defaultHeaders: {
      "HTTP-Referer": "https://oxot.ai",
      "X-Title": "OXOT Conformity Application",
    },
  });
}

// Backward compatibility export for static instantiations
const fallbackKey = process.env["OPENROUTER_API_KEY"] || process.env["OPENAI_API_KEY"] || "dummy-key-for-local-dev";
export const openai = new OpenAI({
  apiKey: fallbackKey,
  baseURL: fallbackKey.startsWith("sk-or-") ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://oxot.ai",
    "X-Title": "OXOT Conformity Application",
  },
});

/** Standard System Models */
export const REASONING_MODEL = process.env["OPENROUTER_REASONING_MODEL"] || "~deepseek/deepseek-v4-flash-latest";
export const IMAGE_MODEL = process.env["OPENROUTER_IMAGE_MODEL"] || "qwen/qwen-image-3-pro";
export const EMBEDDING_MODEL = process.env["OPENROUTER_EMBEDDING_MODEL"] || "qwen/qwen3-embedding-8b";
export const TTS_MODEL = process.env["OPENROUTER_TTS_MODEL"] || "qwen/qwen-audio-3.0-tts-flash";

/** Fallback model for chat assistant */
export const CHAT_MODEL = REASONING_MODEL;
