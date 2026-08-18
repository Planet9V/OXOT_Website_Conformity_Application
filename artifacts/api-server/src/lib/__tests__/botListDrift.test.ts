import { describe, it, expect } from "vitest";
import { BOT_UA_PATTERNS } from "../botDetection";
// Cross-package import on purpose: this test exists to catch drift between the
// two curated UA lists. The oxot-web SEO middleware decides who gets the
// server-injected meta HTML, and the api-server analytics filter decides whose
// visits are recorded. If the lists diverge, a UA can be "crawler" for SEO but
// "human" for analytics (or vice versa) and analytics quietly miscounts.
// The oxot-web plugin lives outside this package's tsconfig rootDir, so a
// direct TS import would break `tsc --build`; extract the exported array from
// the source instead (same content Vite compiles).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadCrawlerPatterns(): string[] {
  const src = readFileSync(
    resolve(__dirname, "../../../../oxot-web/vite-seo-plugin.ts"),
    "utf8",
  );
  const match = src.match(/export const CRAWLER_UA_PATTERNS: string\[\] = \[([\s\S]*?)\n\];/);
  if (!match) throw new Error("CRAWLER_UA_PATTERNS array not found in oxot-web/vite-seo-plugin.ts");
  const body = match[1]!
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n");
  const entries = [...body.matchAll(/'([^']+)'|"([^"]+)"/g)].map((m) => m[1] ?? m[2]!);
  if (entries.length === 0) throw new Error("CRAWLER_UA_PATTERNS parsed empty — extraction regex is stale");
  return entries;
}
const CRAWLER_UA_PATTERNS = loadCrawlerPatterns();

function loadNginxPatterns(): string[] {
  const src = readFileSync(
    resolve(__dirname, "../../../../../docker/nginx.conf"),
    "utf8",
  );
  const match = src.match(/\$oxot_is_crawler\s*\{[\s\S]*?~\*\(([^)]+)\)/);
  if (!match) throw new Error("$oxot_is_crawler UA map not found in docker/nginx.conf");
  const entries = match[1]!.split("|").map((t) => t.trim()).filter(Boolean);
  if (entries.length === 0) throw new Error("nginx crawler map parsed empty — extraction regex is stale");
  return entries;
}
const NGINX_UA_PATTERNS = loadNginxPatterns();


describe("bot/crawler UA list drift guard", () => {
  it("the SEO crawler list and the analytics bot list are identical in content", () => {
    const seo = [...CRAWLER_UA_PATTERNS].sort();
    const analytics = [...BOT_UA_PATTERNS].sort();
    const nginx = [...NGINX_UA_PATTERNS].sort();

    const onlySeo = seo.filter((p) => !analytics.includes(p));
    const onlyAnalytics = analytics.filter((p) => !seo.includes(p));
    const onlyNginx = nginx.filter((p) => !analytics.includes(p));
    const missingFromNginx = analytics.filter((p) => !nginx.includes(p));
    expect(
      onlyNginx,
      "patterns only in docker/nginx.conf $oxot_is_crawler map — add them to api-server BOT_UA_PATTERNS (or remove here)",
    ).toEqual([]);
    expect(
      missingFromNginx,
      "patterns in BOT_UA_PATTERNS but missing from docker/nginx.conf $oxot_is_crawler map — keep the nginx crawler map in sync",
    ).toEqual([]);

    expect(
      onlySeo,
      "patterns only in oxot-web CRAWLER_UA_PATTERNS — add them to api-server BOT_UA_PATTERNS (or remove here)",
    ).toEqual([]);
    expect(
      onlyAnalytics,
      "patterns only in api-server BOT_UA_PATTERNS — add them to oxot-web CRAWLER_UA_PATTERNS (or remove here)",
    ).toEqual([]);
  });

  it("neither list contains duplicates or empty/ambiguous entries", () => {
    for (const list of [CRAWLER_UA_PATTERNS, BOT_UA_PATTERNS, NGINX_UA_PATTERNS]) {
      expect(new Set(list).size).toBe(list.length);
      for (const p of list) {
        expect(p.trim()).toBe(p);
        expect(p.length).toBeGreaterThan(0);
        expect(p).toBe(p.toLowerCase());
        // Deliberately banned ambiguous in-app-browser substrings (real humans
        // browse inside these apps); the unfurler form "whatsapp/2" is fine.
        expect(["whatsapp", "instagram", "fban", "fbav", "line", "gsa"]).not.toContain(p);
      }
    }
  });
});
