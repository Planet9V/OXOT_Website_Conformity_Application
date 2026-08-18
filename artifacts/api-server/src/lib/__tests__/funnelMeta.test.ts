import { describe, it, expect } from "vitest";
import {
  FUNNEL_META,
  funnelMetaFor,
  pathToLocaleSlug,
  isNonPagePath,
} from "../funnelMeta";

describe("funnel meta path normalisation (Phase 30 crawler render)", () => {
  it("maps English funnel paths to their slug", () => {
    expect(pathToLocaleSlug("/product")).toEqual({ locale: "en", slug: "product" });
    expect(pathToLocaleSlug("/manufacturers")).toEqual({ locale: "en", slug: "manufacturers" });
    expect(pathToLocaleSlug("/wiki/cra")).toEqual({ locale: "en", slug: "wiki/cra" });
  });

  it("treats a leading /nl as the Dutch locale", () => {
    expect(pathToLocaleSlug("/nl/manufacturers")).toEqual({ locale: "nl", slug: "manufacturers" });
    expect(pathToLocaleSlug("/nl")).toEqual({ locale: "nl", slug: "home" });
  });

  it("maps the root to the home slug and strips trailing slash + query", () => {
    expect(pathToLocaleSlug("/")).toEqual({ locale: "en", slug: "home" });
    expect(pathToLocaleSlug("/product/")).toEqual({ locale: "en", slug: "product" });
    expect(pathToLocaleSlug("/product?utm=x")).toEqual({ locale: "en", slug: "product" });
  });
});

describe("non-page path classification", () => {
  it("flags app shells and assets, not content pages", () => {
    expect(isNonPagePath("/assets/index-abc.js")).toBe(true);
    expect(isNonPagePath("/admin")).toBe(true);
    expect(isNonPagePath("/api/health")).toBe(true);
    expect(isNonPagePath("/favicon.svg")).toBe(true);
    expect(isNonPagePath("/media/tour/01.jpg")).toBe(true);
    expect(isNonPagePath("/product")).toBe(false);
    expect(isNonPagePath("/")).toBe(false);
    expect(isNonPagePath("/nl/manufacturers")).toBe(false);
  });
});

describe("funnel meta lookup", () => {
  it("returns per-page meta for a known funnel slug", () => {
    const m = funnelMetaFor("en", "manufacturers");
    expect(m).not.toBeNull();
    expect(m!.title.toLowerCase()).toContain("manufacturer");
    expect(m!.description.length).toBeGreaterThan(50);
  });

  it("returns null for an unknown slug (falls through to the DB lookup)", () => {
    expect(funnelMetaFor("en", "definitely-not-a-funnel-route")).toBeNull();
  });

  it("has full English/Dutch parity across every funnel route", () => {
    const en = Object.keys(FUNNEL_META.en).sort();
    const nl = Object.keys(FUNNEL_META.nl).sort();
    expect(nl).toEqual(en);
  });

  it("every funnel entry has a non-empty title and description in both locales", () => {
    for (const locale of ["en", "nl"] as const) {
      for (const [slug, m] of Object.entries(FUNNEL_META[locale])) {
        expect(m.title.trim(), `${locale}/${slug} title`).not.toBe("");
        expect(m.description.trim(), `${locale}/${slug} description`).not.toBe("");
      }
    }
  });
});
