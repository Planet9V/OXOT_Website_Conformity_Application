/**
 * Articles 21 and 22 — the deemed-manufacturer transition.
 *
 * Acceptance criteria for Phase 2.2: Art. 21 (importer/distributor) and Art. 22
 * (any other person) are distinguished; the dispositive "made available on the
 * market?" question is asked for Art. 22; and Art. 22(2) scoping is honoured.
 *
 * Text pinned against docs/cra_statutory_corpus/02_articles_full.json.
 */
import { describe, it, expect } from "vitest";
import {
  assessDeemedManufacturer,
  type DeemedManufacturerInput,
} from "../deemedManufacturer";

/** A confirmed substantial modification under Art. 3(30). */
const SUBSTANTIAL = {
  modificationMade: true,
  changeFollowsPlacingOnMarket: true,
  affectsAnnexIPartICompliance: true,
  modifiesAssessedIntendedPurpose: false,
} satisfies Partial<DeemedManufacturerInput>;

function assess(over: Partial<DeemedManufacturerInput> & { actorRole: DeemedManufacturerInput["actorRole"] }) {
  return assessDeemedManufacturer(over as DeemedManufacturerInput);
}

describe("Art. 3(30) — the definition is dispositive", () => {
  it("is not substantial when the change predates placing on the market", () => {
    const r = assess({
      actorRole: "other_person",
      modificationMade: true,
      changeFollowsPlacingOnMarket: false,
      makesAvailableOnMarket: true,
    });
    expect(r.isSubstantialModification).toBe(false);
    expect(r.deemedManufacturer).toBe(false);
  });

  it("is satisfied by the Annex I limb alone", () => {
    const r = assess({
      actorRole: "other_person",
      ...SUBSTANTIAL,
      makesAvailableOnMarket: true,
      cybersecurityImpactIsProductWide: false,
    });
    expect(r.isSubstantialModification).toBe(true);
  });

  it("is satisfied by the intended-purpose limb alone", () => {
    const r = assess({
      actorRole: "other_person",
      modificationMade: true,
      changeFollowsPlacingOnMarket: true,
      affectsAnnexIPartICompliance: false,
      modifiesAssessedIntendedPurpose: true,
      makesAvailableOnMarket: true,
      cybersecurityImpactIsProductWide: false,
    });
    expect(r.isSubstantialModification).toBe(true);
    expect(r.deemedManufacturer).toBe(true);
  });

  it("returns null rather than false when a limb is unanswered", () => {
    const r = assess({
      actorRole: "other_person",
      modificationMade: true,
      changeFollowsPlacingOnMarket: true,
      makesAvailableOnMarket: true,
    });
    expect(r.isSubstantialModification).toBeNull();
    expect(r.deemedManufacturer).toBe(false);
    expect(r.unanswered.join(" ")).toMatch(/Part I of Annex I/);
  });
});

describe("Art. 21 — importers and distributors", () => {
  it("fires on rebranding alone, with no modification at all", () => {
    const r = assess({
      actorRole: "distributor",
      placedUnderOwnNameOrTrademark: true,
      modificationMade: false,
    });
    expect(r.deemedManufacturer).toBe(true);
    expect(r.governingArticle).toBe("Article 21");
    expect(r.trigger).toMatch(/own name or trademark/);
    expect(r.obligations).toEqual(["Article 13", "Article 14"]);
  });

  it("fires on a substantial modification without rebranding", () => {
    const r = assess({
      actorRole: "importer",
      placedUnderOwnNameOrTrademark: false,
      ...SUBSTANTIAL,
    });
    expect(r.deemedManufacturer).toBe(true);
    expect(r.governingArticle).toBe("Article 21");
    expect(r.trigger).toMatch(/substantial modification/);
  });

  /** Art. 21 carries no scope limitation — unlike Art. 22(2). */
  it("always attaches the obligations to the entire product", () => {
    const r = assess({
      actorRole: "importer",
      ...SUBSTANTIAL,
      cybersecurityImpactIsProductWide: false,
    });
    expect(r.obligationScope).toBe("entire_product");
  });

  it("does not fire when neither limb is met, and says so without granting anything", () => {
    const r = assess({
      actorRole: "distributor",
      placedUnderOwnNameOrTrademark: false,
      modificationMade: false,
    });
    expect(r.deemedManufacturer).toBe(false);
    expect(r.message).toMatch(/not an exemption/);
  });

  /**
   * Art. 21 does not require "makes available on the market" as a separate
   * condition, so an importer/distributor must not be asked for it as a gate.
   */
  it("does not require the Art. 22 making-available question", () => {
    const r = assess({ actorRole: "importer", ...SUBSTANTIAL });
    expect(r.deemedManufacturer).toBe(true);
    expect(r.unanswered).toEqual([]);
  });
});

describe("Art. 22 — any other person", () => {
  /** The question the previous wizard never asked. */
  it("does NOT fire on a substantial modification alone", () => {
    const r = assess({
      actorRole: "other_person",
      ...SUBSTANTIAL,
      makesAvailableOnMarket: false,
    });
    expect(r.isSubstantialModification).toBe(true);
    expect(r.deemedManufacturer).toBe(false);
    expect(r.message).toMatch(/not made available on the market/);
  });

  it("refuses to determine while making-available is unanswered", () => {
    const r = assess({ actorRole: "other_person", ...SUBSTANTIAL });
    expect(r.deemedManufacturer).toBe(false);
    expect(r.unanswered.join(" ")).toMatch(/available on the market/);
  });

  it("fires when both conditions are met", () => {
    const r = assess({
      actorRole: "other_person",
      ...SUBSTANTIAL,
      makesAvailableOnMarket: true,
      cybersecurityImpactIsProductWide: false,
    });
    expect(r.deemedManufacturer).toBe(true);
    expect(r.governingArticle).toBe("Article 22");
  });

  describe("Art. 22(2) scope", () => {
    it("limits obligations to the affected part by default", () => {
      const r = assess({
        actorRole: "other_person",
        ...SUBSTANTIAL,
        makesAvailableOnMarket: true,
        cybersecurityImpactIsProductWide: false,
      });
      expect(r.obligationScope).toBe("affected_part");
      expect(r.message).toMatch(/PART of the product/);
    });

    it("extends to the entire product when cybersecurity is affected throughout", () => {
      const r = assess({
        actorRole: "other_person",
        ...SUBSTANTIAL,
        makesAvailableOnMarket: true,
        cybersecurityImpactIsProductWide: true,
      });
      expect(r.obligationScope).toBe("entire_product");
      expect(r.message).toMatch(/ENTIRE product/);
    });

    it("reports the transition but leaves scope open when unanswered", () => {
      const r = assess({
        actorRole: "other_person",
        ...SUBSTANTIAL,
        makesAvailableOnMarket: true,
      });
      expect(r.deemedManufacturer).toBe(true);
      expect(r.obligationScope).toBeNull();
      expect(r.unanswered.join(" ")).toMatch(/Article 22\(2\)/);
    });
  });
});

describe("the actor already being the manufacturer", () => {
  it("is not a transition either article can effect", () => {
    const r = assess({ actorRole: "manufacturer", ...SUBSTANTIAL });
    expect(r.deemedManufacturer).toBe(false);
    expect(r.message).toMatch(/already the manufacturer/);
  });
});

describe("nothing is ever granted", () => {
  it("never claims an exemption in any negative determination", () => {
    const negatives = [
      assess({ actorRole: "distributor", placedUnderOwnNameOrTrademark: false, modificationMade: false }),
      assess({ actorRole: "other_person", modificationMade: false, makesAvailableOnMarket: true }),
      assess({ actorRole: "other_person", ...SUBSTANTIAL, makesAvailableOnMarket: false }),
    ];
    /**
     * Matches the act of CONFERRING something, not the word "exemption" itself
     * — the negative determinations deliberately say "it is not an exemption",
     * and that sentence is the point of them.
     */
    const GRANTS =
      /\bis exempt\b|\bare exempt\b|exemption (?:is )?granted|safe harbou?r|certificate (?:is )?(?:granted|issued)|you are cleared/i;
    for (const r of negatives) {
      expect(r.deemedManufacturer).toBe(false);
      expect(r.message, r.message).not.toMatch(GRANTS);
    }
  });
});
