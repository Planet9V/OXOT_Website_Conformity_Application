/**
 * Text embeddings via OpenRouter (OpenAI `text-embedding-3-small`, 1536 dims).
 * Requires the user-provided OPENROUTER_API_KEY secret. The Replit AI
 * integration proxies do not support the embeddings API, so we call OpenRouter
 * directly here.
 */
import { getDbOpenRouterApiKey } from "./models";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const EMBEDDING_MODEL = "openai/text-embedding-3-small";
const BATCH_SIZE = 64;
const MAX_RETRIES = 3;

async function getKey(): Promise<string> {
  const dbKey = await getDbOpenRouterApiKey();
  const key = dbKey || process.env["OPENROUTER_API_KEY"];
  if (!key) {
    throw new Error("OPENROUTER_API_KEY must be set in database or environment to generate embeddings.");
  }
  return key;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function embedBatch(inputs: string[], key: string): Promise<number[][]> {
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${OPENROUTER_BASE}/embeddings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: EMBEDDING_MODEL, input: inputs }),
      });
      if (!res.ok) {
        const body = await res.text();
        // Retry transient/rate-limit errors; fail fast on client errors.
        if (res.status === 429 || res.status >= 500) {
          throw new Error(`Embeddings request failed (${res.status}): ${body}`);
        }
        throw Object.assign(new Error(`Embeddings request failed (${res.status}): ${body}`), {
          fatal: true,
        });
      }
      const json = (await res.json()) as { data: { embedding: number[] }[] };
      return json.data.map((d) => d.embedding);
    } catch (err) {
      lastError = err;
      if ((err as { fatal?: boolean })?.fatal) {
        break;
      }
      await sleep(400 * 2 ** attempt);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Embeddings request failed");
}

/** Embed an array of texts, batching to keep requests within limits. */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const key = await getKey();
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const vectors = await embedBatch(batch, key);
    out.push(...vectors);
  }
  return out;
}

/** Embed a single text and return its vector. */
export async function embedText(text: string): Promise<number[]> {
  const [vector] = await embedTexts([text]);
  if (!vector) {
    throw new Error("Embeddings request returned no vector");
  }
  return vector;
}
