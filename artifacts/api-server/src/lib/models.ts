import { eq } from "drizzle-orm";
import { db, appSettingsTable, openrouterModelsCacheTable, type AppSettingsRow, type LlmConfig, type OpenrouterModelsCacheRow } from "@workspace/db";
import { REASONING_MODEL, IMAGE_MODEL, EMBEDDING_MODEL, TTS_MODEL } from "./llm";

export interface ModelCatalogEntry {
  id: string;
  name: string;
  provider: string;
  category: string;
  description: string;
  roles: string[];
  contextWindow: number | null;
  pricingPrompt: string;
  pricingCompletion: string;
}

/** Authentic static baseline used ONLY if initial network fetch is warming up */
export const FALLBACK_OPENROUTER_MODELS: ModelCatalogEntry[] = [
  {
    id: "deepseek/deepseek-v4-flash-0731",
    name: "DeepSeek: DeepSeek V4 Flash 0731",
    provider: "OpenRouter Live",
    category: "Reasoning & Code",
    description: "DeepSeek V4 Flash 0731 sparse MoE model with 13B active parameters out of 284B total.",
    roles: ["chat", "brief", "longContext", "reasoning", "search", "translation"],
    contextWindow: 1048576,
    pricingPrompt: "$0.09 / 1M",
    pricingCompletion: "$0.18 / 1M",
  },
  {
    id: "deepseek/deepseek-r1",
    name: "DeepSeek: R1",
    provider: "OpenRouter Live",
    category: "Reasoning & Audit",
    description: "First-generation flagship reasoning model with high-density step-by-step audit chain of thought.",
    roles: ["chat", "brief", "longContext", "reasoning", "search", "translation"],
    contextWindow: 163840,
    pricingPrompt: "$0.55 / 1M",
    pricingCompletion: "$2.19 / 1M",
  },
  {
    id: "qwen/qwen3.8-max",
    name: "Qwen: Qwen3.8 Max",
    provider: "OpenRouter Live",
    category: "Flagship Multimodal",
    description: "Alibaba flagship multimodal reasoning model for visual understanding, document audit, and code.",
    roles: ["chat", "brief", "longContext", "reasoning", "translation", "image"],
    contextWindow: 1000000,
    pricingPrompt: "$2.00 / 1M",
    pricingCompletion: "$6.00 / 1M",
  },
  {
    id: "anthropic/claude-opus-5",
    name: "Claude Opus 5",
    provider: "OpenRouter Live",
    category: "Flagship Reasoning",
    description: "Anthropic flagship model for demanding reasoning, technical audit, and long-horizon agentic work.",
    roles: ["chat", "brief", "longContext", "reasoning", "translation"],
    contextWindow: 1000000,
    pricingPrompt: "$5.00 / 1M",
    pricingCompletion: "$25.00 / 1M",
  },
  {
    id: "google/gemini-3.6-flash",
    name: "Google: Gemini 3.6 Flash",
    provider: "OpenRouter Live",
    category: "Long Context",
    description: "High-efficiency Google model for coding, agentic workflows, and 1M token context file auditing.",
    roles: ["chat", "brief", "longContext", "reasoning", "translation", "search"],
    contextWindow: 1048576,
    pricingPrompt: "$1.50 / 1M",
    pricingCompletion: "$7.50 / 1M",
  },
];

export let MODEL_CATALOG: ModelCatalogEntry[] = [...FALLBACK_OPENROUTER_MODELS];

/**
 * Queries openrouter.ai/api/v1/models live in REAL-TIME every time selected.
 * Upserts all real-time model entries directly into the Postgres database `openrouter_models_cache` table.
 */
export async function syncLiveOpenRouterToDb(): Promise<ModelCatalogEntry[]> {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "HTTP-Referer": "https://oxot.ai",
        "X-Title": "OXOT Conformity Application",
      },
    });

    if (res.ok) {
      const body = (await res.json()) as any;
      const items = body.data || [];

      if (Array.isArray(items) && items.length > 0) {
        const now = new Date();
        const upsertEntries = items.slice(0, 50).map((m: any) => {
          const promptCost = Number(m.pricing?.prompt || 0) * 1000000;
          const compCost = Number(m.pricing?.completion || 0) * 1000000;
          const promptStr = promptCost === 0 ? "Free" : `$${promptCost.toFixed(2)} / 1M`;
          const compStr = compCost === 0 ? "Free" : `$${compCost.toFixed(2)} / 1M`;

          let category = "General LLM";
          const idLower = String(m.id).toLowerCase();
          const mod = String(m.architecture?.modality || "").toLowerCase();

          if (idLower.includes("embedding")) category = "Embeddings & RAG";
          else if (idLower.includes("image") || mod.includes("image")) category = "Vision & Image Gen";
          else if (idLower.includes("tts") || idLower.includes("audio") || mod.includes("audio")) category = "Speech & Audio TTS";
          else if (idLower.includes("r1") || idLower.includes("reasoning") || idLower.includes("opus") || idLower.includes("sol")) category = "Reasoning & Audit";
          else if (idLower.includes("sonar") || idLower.includes("search")) category = "Web Search";

          return {
            id: m.id,
            name: m.name || m.id,
            provider: "OpenRouter Live",
            category,
            description: m.description ? String(m.description).slice(0, 180) + "…" : "Live OpenRouter model.",
            contextLength: m.context_length || 128000,
            pricingPrompt: promptStr,
            pricingCompletion: compStr,
            roles: ["chat", "brief", "longContext", "reasoning", "search", "translation", "embeddings", "image", "tts"],
            rawPricing: m.pricing || {},
            rawArchitecture: m.architecture || {},
            updatedAt: now,
          };
        });

        // Persist fresh OpenRouter models directly into Postgres DB
        for (const entry of upsertEntries) {
          await db
            .insert(openrouterModelsCacheTable)
            .values(entry)
            .onConflictDoUpdate({
              target: openrouterModelsCacheTable.id,
              set: {
                name: entry.name,
                category: entry.category,
                description: entry.description,
                contextLength: entry.contextLength,
                pricingPrompt: entry.pricingPrompt,
                pricingCompletion: entry.pricingCompletion,
                rawPricing: entry.rawPricing,
                rawArchitecture: entry.rawArchitecture,
                updatedAt: now,
              },
            });
        }
      }
    }
  } catch (err) {
    console.error("OpenRouter live sync error:", err);
  }

  // Fetch all live persisted models from Postgres database
  const dbRows = await db.select().from(openrouterModelsCacheTable);
  if (dbRows && dbRows.length > 0) {
    MODEL_CATALOG = dbRows.map((r) => ({
      id: r.id,
      name: r.name,
      provider: r.provider,
      category: r.category,
      description: r.description || "",
      roles: (r.roles as string[]) || ["chat", "brief", "longContext", "reasoning", "search", "translation"],
      contextWindow: r.contextLength,
      pricingPrompt: r.pricingPrompt,
      pricingCompletion: r.pricingCompletion,
    }));
    return MODEL_CATALOG;
  }

  return FALLBACK_OPENROUTER_MODELS;
}

export async function fetchLiveOpenRouterModels(): Promise<ModelCatalogEntry[]> {
  return syncLiveOpenRouterToDb();
}

export interface Provider {
  id: string;
  name: string;
  description: string;
  envVar: string;
}

export const PROVIDERS: Provider[] = [
  {
    id: "openrouter",
    name: "OpenRouter AI API (Live Real-Time Fetch & Postgres DB Cache)",
    description: "Queries openrouter.ai/api/v1/models live in real-time and persists model metadata into Postgres DB.",
    envVar: "OPENROUTER_API_KEY",
  },
  {
    id: "openai",
    name: "OpenAI Direct API",
    description: "Direct access to OpenAI model endpoints.",
    envVar: "OPENAI_API_KEY",
  },
];

export async function getAppSettings(): Promise<AppSettingsRow | null> {
  const [row] = await db.select().from(appSettingsTable).limit(1);
  return row ?? null;
}

export async function getDbOpenRouterApiKey(): Promise<string | null> {
  const row = await getAppSettings();
  const dbKey = (row?.llmConfig as LlmConfig)?.openrouterApiKey;
  if (dbKey && dbKey.trim().length > 0) {
    return dbKey.trim();
  }
  return process.env["OPENROUTER_API_KEY"] || null;
}

export async function getLlmConfig(masked = true): Promise<LlmConfig> {
  const row = await getAppSettings();
  const rawConfig: LlmConfig = (row?.llmConfig as LlmConfig) || {};
  const activeKey = rawConfig.openrouterApiKey || process.env["OPENROUTER_API_KEY"] || "";

  const keyDisplay = masked && activeKey
    ? activeKey.length > 10
      ? `${activeKey.slice(0, 10)}••••••••••••`
      : "••••••••••••"
    : activeKey;

  return {
    openrouterApiKey: keyDisplay,
    chatModel: rawConfig.chatModel || REASONING_MODEL,
    briefModel: rawConfig.briefModel || REASONING_MODEL,
    longContextModel: rawConfig.longContextModel || REASONING_MODEL,
    embeddingModel: rawConfig.embeddingModel || EMBEDDING_MODEL,
    searchModel: rawConfig.searchModel || REASONING_MODEL,
    translationModel: rawConfig.translationModel || REASONING_MODEL,
  };
}

export async function saveLlmConfig(config: Partial<LlmConfig>): Promise<LlmConfig> {
  const existing = await getAppSettings();
  const existingLlm: LlmConfig = (existing?.llmConfig as LlmConfig) || {};
  const now = new Date();

  let openrouterApiKey = existingLlm.openrouterApiKey;
  if (config.openrouterApiKey !== undefined && !config.openrouterApiKey.includes("••••")) {
    openrouterApiKey = config.openrouterApiKey.trim();
  }

  const updatedLlm: LlmConfig = {
    openrouterApiKey,
    chatModel: config.chatModel ?? existingLlm.chatModel ?? REASONING_MODEL,
    briefModel: config.briefModel ?? existingLlm.briefModel ?? REASONING_MODEL,
    longContextModel: config.longContextModel ?? existingLlm.longContextModel ?? REASONING_MODEL,
    embeddingModel: config.embeddingModel ?? existingLlm.embeddingModel ?? EMBEDDING_MODEL,
    searchModel: config.searchModel ?? existingLlm.searchModel ?? REASONING_MODEL,
    translationModel: config.translationModel ?? existingLlm.translationModel ?? REASONING_MODEL,
  };

  if (existing) {
    await db
      .update(appSettingsTable)
      .set({
        llmConfig: updatedLlm,
        updatedAt: now,
      })
      .where(eq(appSettingsTable.id, existing.id));
  } else {
    await db.insert(appSettingsTable).values({
      llmConfig: updatedLlm,
      updatedAt: now,
    });
  }

  return getLlmConfig(true);
}

export function resolveGenerationModel(configOrModel?: string | LlmConfig, role?: keyof LlmConfig): string {
  if (typeof configOrModel === "string" && configOrModel && !configOrModel.includes("••••")) {
    return configOrModel;
  }
  if (configOrModel && typeof configOrModel === "object" && role) {
    const selected = configOrModel[role];
    if (typeof selected === "string" && selected && !selected.includes("••••")) {
      return selected;
    }
  }
  return REASONING_MODEL;
}

export function getProviderStatuses(): { id: string; name: string; configured: boolean }[] {
  return PROVIDERS.map((p) => ({
    id: p.id,
    name: p.name,
    configured: Boolean(process.env[p.envVar]),
  }));
}
