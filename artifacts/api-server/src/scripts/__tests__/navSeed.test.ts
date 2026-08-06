/**
 * Regression guard: the seed NAV data must never place a /conformity/ link
 * in the header placement for any locale.
 *
 * The Conformity Platform items live inside the Services dropdown panel in
 * header.tsx (client-side PANELS config). Adding a /conformity/ header nav
 * item would create a duplicate, orphaned link that bypasses the panel.
 *
 * This test also verifies that the Conformity Platform IS present in the
 * footer of every locale (ensuring it stays reachable even if the Services
 * panel is collapsed or invisible).
 */

import { describe, it, expect } from "vitest";
import { NAV } from "../navSeed";

const LOCALES = ["en", "nl"] as const;

describe("seed NAV — Conformity Platform placement", () => {
  for (const locale of LOCALES) {
    const items = NAV[locale];

    it(`${locale}: no /conformity/ item has placement "header"`, () => {
      const headerConformity = items.filter(
        (item) =>
          item.placement === "header" && item.href.includes("/conformity/"),
      );
      expect(
        headerConformity,
        `Found /conformity/ header nav items in ${locale} seed — these must stay in the Services panel only`,
      ).toHaveLength(0);
    });

    it(`${locale}: Conformity Platform is present in the footer`, () => {
      const footerConformity = items.filter(
        (item) =>
          item.placement === "footer" && item.href.includes("/conformity/"),
      );
      expect(
        footerConformity.length,
        `${locale} seed must include at least one /conformity/ footer link`,
      ).toBeGreaterThan(0);
    });

    it(`${locale}: every footer /conformity/ item is marked external`, () => {
      const footerConformity = items.filter(
        (item) =>
          item.placement === "footer" && item.href.includes("/conformity/"),
      );
      for (const item of footerConformity) {
        expect(
          item.external,
          `${locale} footer item "${item.label}" (${item.href}) must be marked external`,
        ).toBe(true);
      }
    });
  }
});
