import { describe, it, expect } from "vitest";
import {
  parseBom,
  runCryptoHeuristics,
  defaultChecklist,
  BOM_CATALOG,
  isBomType,
  SEVERITY_RANK,
  componentIdentityKey,
  exportCycloneDx,
} from "../xbom";

describe("parseBom — CycloneDX SBOM", () => {
  const doc = JSON.stringify({
    bomFormat: "CycloneDX",
    specVersion: "1.6",
    components: [
      {
        type: "library",
        name: "lodash",
        version: "4.17.21",
        purl: "pkg:npm/lodash@4.17.21",
        supplier: { name: "Lodash" },
        licenses: [{ license: { id: "MIT" } }],
        hashes: [{ alg: "SHA-256", content: "abc123" }],
      },
      {
        type: "library",
        name: "left-pad",
        version: "1.3.0",
        purl: "pkg:npm/left-pad@1.3.0",
        publisher: "azer",
        licenses: [{ expression: "WTFPL" }],
      },
    ],
  });

  it("normalizes components with purl, license, supplier and hashes", () => {
    const bom = parseBom({ format: "cyclonedx", text: doc });
    expect(bom.format).toBe("cyclonedx");
    expect(bom.components).toHaveLength(2);
    const [lodash, leftPad] = bom.components;
    expect(lodash).toMatchObject({
      name: "lodash",
      version: "4.17.21",
      purl: "pkg:npm/lodash@4.17.21",
      supplier: "Lodash",
      licenses: ["MIT"],
      componentType: "library",
    });
    expect(lodash.hashes).toEqual({ "SHA-256": "abc123" });
    // publisher falls back to supplier; expression licenses are captured.
    expect(leftPad.supplier).toBe("azer");
    expect(leftPad.licenses).toEqual(["WTFPL"]);
  });
});

describe("parseBom — CycloneDX CBOM crypto-assets", () => {
  const doc = JSON.stringify({
    bomFormat: "CycloneDX",
    specVersion: "1.6",
    components: [
      {
        type: "cryptographic-asset",
        name: "RSA-2048",
        cryptoProperties: {
          assetType: "algorithm",
          algorithmProperties: { primitive: "pke", parameterSetIdentifier: "2048", nistQuantumSecurityLevel: 0 },
        },
      },
    ],
  });

  it("captures cryptoProperties and marks the component a crypto-asset", () => {
    const bom = parseBom({ format: "cyclonedx", text: doc });
    expect(bom.components).toHaveLength(1);
    expect(bom.components[0].componentType).toBe("crypto-asset");
    expect(bom.components[0].cryptoProperties).toMatchObject({ assetType: "algorithm" });
  });
});

describe("parseBom — SPDX", () => {
  const doc = JSON.stringify({
    spdxVersion: "SPDX-2.3",
    name: "example",
    packages: [
      {
        name: "lodash",
        versionInfo: "4.17.21",
        supplier: "Organization: Lodash Inc",
        licenseConcluded: "MIT",
        licenseDeclared: "MIT",
        checksums: [{ algorithm: "SHA256", checksumValue: "deadbeef" }],
        externalRefs: [
          { referenceType: "purl", referenceLocator: "pkg:npm/lodash@4.17.21", referenceCategory: "PACKAGE-MANAGER" },
        ],
      },
      { name: "mystery", versionInfo: "1.0.0", licenseConcluded: "NOASSERTION", supplier: "NOASSERTION" },
    ],
  });

  it("extracts purl from externalRefs, version from versionInfo, dedupes licenses, strips supplier prefix", () => {
    const bom = parseBom({ format: "spdx", text: doc });
    expect(bom.format).toBe("spdx");
    const [lodash, mystery] = bom.components;
    expect(lodash).toMatchObject({
      name: "lodash",
      version: "4.17.21",
      purl: "pkg:npm/lodash@4.17.21",
      supplier: "Lodash Inc",
      licenses: ["MIT"],
    });
    expect(lodash.hashes).toEqual({ SHA256: "deadbeef" });
    // NOASSERTION is dropped, not surfaced as a license/supplier.
    expect(mystery.licenses).toEqual([]);
    expect(mystery.supplier).toBe("");
  });
});

describe("parseBom — CycloneDX rich fields, dependencies and nesting", () => {
  const doc = JSON.stringify({
    bomFormat: "CycloneDX",
    specVersion: "1.6",
    serialNumber: "urn:uuid:123",
    metadata: { component: { "bom-ref": "root", type: "application", name: "gateway-fw" } },
    components: [
      {
        "bom-ref": "comp-a",
        type: "device",
        name: "controller",
        group: "acme",
        cpe: "cpe:2.3:h:acme:controller:*:*:*:*:*:*:*:*",
        scope: "required",
        description: "Edge controller",
        manufacturer: { name: "Acme GmbH" },
        properties: [
          { name: "cdx:device:partNumber", value: "PN-42" },
          { name: "serialNumber", value: "SN-9" },
          { name: "firmwareVersion", value: "2.1.0" },
        ],
        components: [{ "bom-ref": "comp-a1", type: "firmware", name: "boot-fw", version: "1.0" }],
      },
      { "bom-ref": "comp-b", type: "library", name: "openssl", version: "3.0.13" },
    ],
    dependencies: [
      { ref: "root", dependsOn: ["comp-a", "comp-b"] },
      { ref: "comp-a", dependsOn: ["comp-b"] },
    ],
  });

  it("promotes bom-ref, group, cpe, scope, manufacturer and hardware properties to typed fields", () => {
    const bom = parseBom({ format: "cyclonedx", text: doc });
    const controller = bom.components.find((c) => c.name === "controller")!;
    expect(controller).toMatchObject({
      bomRef: "comp-a",
      group: "acme",
      scope: "required",
      description: "Edge controller",
      manufacturer: "Acme GmbH",
      partNumber: "PN-42",
      serialNumber: "SN-9",
      firmwareVersion: "2.1.0",
    });
    expect(controller.cpe).toContain("cpe:2.3:h:acme");
  });

  it("walks nested components and records containment + declared dependency edges", () => {
    const bom = parseBom({ format: "cyclonedx", text: doc });
    expect(bom.components.map((c) => c.name)).toContain("boot-fw");
    expect(bom.dependencies).toContainEqual({ ref: "comp-a", dependsOnRef: "comp-a1" });
    expect(bom.dependencies).toContainEqual({ ref: "root", dependsOnRef: "comp-a" });
    expect(bom.dependencies).toContainEqual({ ref: "comp-a", dependsOnRef: "comp-b" });
    expect(bom.meta.rootComponentName).toBe("gateway-fw");
  });
});

describe("parseBom — SPDX relationships and purpose", () => {
  const doc = JSON.stringify({
    spdxVersion: "SPDX-2.3",
    name: "example",
    packages: [
      { SPDXID: "SPDXRef-app", name: "app", versionInfo: "1.0", primaryPackagePurpose: "APPLICATION", licenseConcluded: "Apache-2.0", licenseDeclared: "MIT" },
      { SPDXID: "SPDXRef-lib", name: "lib", versionInfo: "2.0", primaryPackagePurpose: "LIBRARY" },
    ],
    relationships: [
      { spdxElementId: "SPDXRef-app", relationshipType: "DEPENDS_ON", relatedSpdxElement: "SPDXRef-lib" },
      { spdxElementId: "SPDXRef-lib", relationshipType: "DEPENDENCY_OF", relatedSpdxElement: "SPDXRef-app" },
    ],
  });

  it("maps purpose to componentType, keeps license provenance, and normalizes relationship direction", () => {
    const bom = parseBom({ format: "spdx", text: doc });
    const app = bom.components.find((c) => c.name === "app")!;
    expect(app.componentType).toBe("application");
    expect(app.bomRef).toBe("SPDXRef-app");
    expect(app.licenseDetails).toContainEqual({ license: "Apache-2.0", source: "concluded" });
    expect(app.licenseDetails).toContainEqual({ license: "MIT", source: "declared" });
    // Both relationship spellings collapse to the same directed edge.
    expect(bom.dependencies).toEqual([
      { ref: "SPDXRef-app", dependsOnRef: "SPDXRef-lib" },
      { ref: "SPDXRef-app", dependsOnRef: "SPDXRef-lib" },
    ]);
  });
});

describe("exportCycloneDx — round-trip", () => {
  it("re-parses to the same normalized components and dependency edges", () => {
    const original = JSON.stringify({
      bomFormat: "CycloneDX",
      specVersion: "1.6",
      components: [
        {
          "bom-ref": "a",
          type: "library",
          name: "lodash",
          version: "4.17.21",
          group: "npm",
          purl: "pkg:npm/lodash@4.17.21",
          supplier: { name: "Lodash" },
          licenses: [{ license: { id: "MIT" } }],
          hashes: [{ alg: "SHA-256", content: "abc" }],
        },
        { "bom-ref": "b", type: "library", name: "left-pad", version: "1.3.0" },
      ],
      dependencies: [{ ref: "a", dependsOn: ["b"] }],
    });
    const parsed = parseBom({ format: "cyclonedx", text: original });
    const doc = exportCycloneDx({
      bomName: "test",
      components: parsed.components.map((c) => ({ ...c })),
      dependencies: parsed.dependencies,
    });
    const reparsed = parseBom({ format: "cyclonedx", text: JSON.stringify(doc) });
    expect(reparsed.components.map((c) => ({ name: c.name, version: c.version, purl: c.purl, bomRef: c.bomRef, group: c.group, licenses: c.licenses, hashes: c.hashes }))).toEqual(
      parsed.components.map((c) => ({ name: c.name, version: c.version, purl: c.purl, bomRef: c.bomRef, group: c.group, licenses: c.licenses, hashes: c.hashes })),
    );
    expect(reparsed.dependencies).toEqual(parsed.dependencies);
    expect(doc.specVersion).toBe("1.6");
  });
});

describe("parseBom — errors", () => {
  it("throws a clear error on non-JSON input", () => {
    expect(() => parseBom({ format: "cyclonedx", text: "not json" })).toThrow(/valid JSON/i);
  });
});

describe("runCryptoHeuristics", () => {
  function crypto(name: string, algorithmProperties: Record<string, unknown> = {}) {
    return {
      name,
      version: "",
      componentType: "crypto-asset",
      purl: "",
      supplier: "",
      bomRef: "",
      group: "",
      cpe: "",
      scope: "",
      description: "",
      manufacturer: "",
      partNumber: "",
      serialNumber: "",
      firmwareVersion: "",
      licenses: [],
      licenseDetails: [],
      hashes: {},
      cryptoProperties: { assetType: "algorithm", algorithmProperties },
      raw: {},
    };
  }

  it("flags MD5 as a high-severity broken hash", () => {
    const findings = runCryptoHeuristics([crypto("MD5")]);
    expect(findings.some((f) => f.identifier === "CRYPTO-MD5" && f.severity === "high")).toBe(true);
  });

  it("flags SHA-1 as deprecated", () => {
    const findings = runCryptoHeuristics([crypto("SHA-1")]);
    expect(findings.some((f) => f.identifier === "CRYPTO-SHA1")).toBe(true);
  });

  it("flags undersized RSA by key size but not adequately-sized RSA", () => {
    const weak = runCryptoHeuristics([crypto("RSA-1024", { parameterSetIdentifier: "1024" })]);
    expect(weak.some((f) => f.identifier === "CRYPTO-RSA-WEAK" && f.severity === "high")).toBe(true);
    const strong = runCryptoHeuristics([crypto("RSA-3072", { parameterSetIdentifier: "3072" })]);
    expect(strong.some((f) => f.identifier === "CRYPTO-RSA-WEAK")).toBe(false);
  });

  it("flags RSA/ECDSA as quantum-vulnerable", () => {
    const findings = runCryptoHeuristics([crypto("ECDSA-P256")]);
    expect(findings.some((f) => f.identifier === "CRYPTO-QUANTUM")).toBe(true);
  });

  it("does not flag a modern symmetric cipher", () => {
    const findings = runCryptoHeuristics([crypto("AES-256-GCM")]);
    expect(findings).toHaveLength(0);
  });

  it("ignores non-crypto components entirely", () => {
    const findings = runCryptoHeuristics([
      {
        name: "MD5-themed-library",
        version: "1.0.0",
        componentType: "library",
        purl: "pkg:npm/md5@1",
        supplier: "",
        bomRef: "",
        group: "",
        cpe: "",
        scope: "",
        description: "",
        manufacturer: "",
        partNumber: "",
        serialNumber: "",
        firmwareVersion: "",
        licenses: [],
        licenseDetails: [],
        hashes: {},
        cryptoProperties: null,
        raw: {},
      },
    ]);
    expect(findings).toHaveLength(0);
  });
});

describe("BOM catalog", () => {
  it("covers all nine BOM types with non-empty checklists", () => {
    const types = ["sbom", "cbom", "hbom", "mbom", "obom", "ebom", "opsbom", "saasbom", "processbom"] as const;
    for (const t of types) {
      expect(isBomType(t)).toBe(true);
      expect(BOM_CATALOG[t].checklist.length).toBeGreaterThan(0);
    }
  });

  it("seeds an all-unchecked checklist for a type and falls back to SBOM for unknowns", () => {
    const cbom = defaultChecklist("cbom");
    expect(cbom.every((item) => item.done === false)).toBe(true);
    expect(cbom.map((i) => i.key)).toEqual(BOM_CATALOG.cbom.checklist.map((i) => i.key));
    expect(defaultChecklist("nonsense").map((i) => i.key)).toEqual(
      BOM_CATALOG.sbom.checklist.map((i) => i.key),
    );
  });

  it("ranks severities for rollup ordering", () => {
    expect(SEVERITY_RANK.critical).toBeGreaterThan(SEVERITY_RANK.high);
    expect(SEVERITY_RANK.info).toBeGreaterThan(SEVERITY_RANK.unknown);
  });
});

describe("componentIdentityKey (upstream-notification natural key)", () => {
  it("prefers the purl when present", () => {
    expect(
      componentIdentityKey({ purl: "pkg:npm/lodash@4.17.11", name: "lodash", version: "4.17.11" }),
    ).toBe("pkg:npm/lodash@4.17.11");
  });

  it("falls back to name@version when no purl", () => {
    expect(componentIdentityKey({ purl: "", name: "zlib", version: "1.2.11" })).toBe("zlib@1.2.11");
    expect(componentIdentityKey({ purl: null, name: "zlib", version: "1.2.11" })).toBe("zlib@1.2.11");
  });

  it("falls back to the bare name when no version either", () => {
    expect(componentIdentityKey({ purl: "", name: "buildroot-linux", version: "" })).toBe(
      "buildroot-linux",
    );
  });

  it("trims whitespace and is empty only when nothing identifies the component", () => {
    expect(componentIdentityKey({ purl: "  ", name: " openssl ", version: " 1.1.1k " })).toBe(
      "openssl@1.1.1k",
    );
    expect(componentIdentityKey({ purl: "", name: "", version: "1.0" })).toBe("@1.0");
    expect(componentIdentityKey({})).toBe("");
  });

  it("is stable across re-parses of the same document (same input, same key)", () => {
    const a = componentIdentityKey({ purl: "pkg:npm/axios@0.21.0", name: "axios", version: "0.21.0" });
    const b = componentIdentityKey({ purl: "pkg:npm/axios@0.21.0", name: "axios", version: "0.21.0" });
    expect(a).toBe(b);
  });
});
