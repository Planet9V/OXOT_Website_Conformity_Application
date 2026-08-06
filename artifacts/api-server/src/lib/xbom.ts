/**
 * The xBOM engine: parse a typed inventory document (CycloneDX / SPDX) into
 * normalized components, then analyze it into findings. Two analyses ship:
 *   - crypto-agility heuristics (pure, offline) over CBOM crypto-assets, flagging
 *     broken/deprecated/quantum-vulnerable algorithms; and
 *   - OSV.dev CVE lookup by purl (network, best-effort — see osvLookup below).
 *
 * Everything except osvLookup is pure and deterministic so it is unit-testable
 * without a DB or network. The route handler persists the results. Nothing here
 * is security or legal advice — findings are heuristic prompts for a human.
 */
import type { BomChecklistItem } from "@workspace/db";

export type BomSeverity = "critical" | "high" | "medium" | "low" | "info" | "unknown";

export const SEVERITY_RANK: Record<BomSeverity, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  info: 1,
  unknown: 0,
};

/** One license observation with its provenance (declared/concluded/expression). */
export type ParsedLicense = {
  license: string;
  source: "declared" | "concluded" | "expression";
};

/** A component/asset as normalized from any BOM format (pre-persistence). */
export type ParsedComponent = {
  name: string;
  version: string;
  componentType: string;
  purl: string;
  supplier: string;
  /** Document-local reference (CycloneDX bom-ref / SPDX SPDXID) for the dependency graph. */
  bomRef: string;
  group: string;
  cpe: string;
  scope: string;
  description: string;
  manufacturer: string;
  partNumber: string;
  serialNumber: string;
  firmwareVersion: string;
  licenses: string[];
  licenseDetails: ParsedLicense[];
  hashes: Record<string, string>;
  cryptoProperties: Record<string, unknown> | null;
  raw: Record<string, unknown>;
};

/** One dependency edge, in the document's own reference space. */
export type ParsedDependency = {
  ref: string;
  dependsOnRef: string;
};

export type ParsedBom = {
  format: string;
  components: ParsedComponent[];
  dependencies: ParsedDependency[];
  meta: Record<string, unknown>;
};

/** A finding pre-persistence: `componentIndex` indexes into ParsedBom.components. */
export type BomAnalysisFinding = {
  componentIndex: number | null;
  findingType: "vulnerability" | "crypto_weakness" | "license" | "outdated" | "policy";
  identifier: string;
  severity: BomSeverity;
  title: string;
  description: string;
  source: string;
  detail: Record<string, unknown>;
};

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function cleanLicense(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed.toUpperCase() === "NOASSERTION" || trimmed.toUpperCase() === "NONE") {
    return "";
  }
  return trimmed;
}

/** Parse a BOM document. `format` selects the parser; unknown ⇒ CycloneDX-like. */
export function parseBom(input: { format: string; text: string }): ParsedBom {
  let json: unknown;
  try {
    json = JSON.parse(input.text);
  } catch {
    throw new Error("BOM is not valid JSON. Only JSON CycloneDX/SPDX documents are supported.");
  }
  const format = (input.format || "cyclonedx").toLowerCase();
  if (format === "spdx") return parseSpdx(json);
  return parseCycloneDx(json, format);
}

/**
 * Well-known CycloneDX `properties[]` names that carry hardware identity for
 * device components (HBOM/MBOM/OBOM). CycloneDX models these as free-form
 * properties, so we promote the common spellings into typed columns.
 */
function hardwareProps(c: Record<string, unknown>): {
  partNumber: string;
  serialNumber: string;
  firmwareVersion: string;
} {
  const out = { partNumber: "", serialNumber: "", firmwareVersion: "" };
  for (const p of asArray(c.properties)) {
    const pr = asRecord(p);
    const name = str(pr.name).toLowerCase();
    const value = str(pr.value);
    if (!value) continue;
    if (!out.partNumber && /part[-_ .:]?number$/.test(name)) out.partNumber = value;
    if (!out.serialNumber && /serial[-_ .:]?number$/.test(name)) out.serialNumber = value;
    if (!out.firmwareVersion && /firmware([-_ .:]?version)?$/.test(name)) out.firmwareVersion = value;
  }
  return out;
}

function parseCycloneDx(json: unknown, format: string): ParsedBom {
  const root = asRecord(json);
  const components: ParsedComponent[] = [];
  // CycloneDX components may nest (assemblies): walk recursively so an MBOM's
  // sub-assembly structure lands as rows with parent linkage via dependencies.
  const walk = (entries: unknown[], parentRef: string): void => {
    for (const entry of entries) {
      const c = asRecord(entry);
      const cryptoProperties = c.cryptoProperties ? asRecord(c.cryptoProperties) : null;
      const supplier = str(asRecord(c.supplier).name) || str(c.publisher);
      const licenseDetails: ParsedLicense[] = [];
      for (const lic of asArray(c.licenses)) {
        const l = asRecord(lic);
        const idOrName = cleanLicense(str(asRecord(l.license).id) || str(asRecord(l.license).name));
        const expression = cleanLicense(str(l.expression));
        if (idOrName) licenseDetails.push({ license: idOrName, source: "declared" });
        if (expression) licenseDetails.push({ license: expression, source: "expression" });
      }
      const hashes: Record<string, string> = {};
      for (const h of asArray(c.hashes)) {
        const hr = asRecord(h);
        const alg = str(hr.alg);
        const content = str(hr.content);
        if (alg && content) hashes[alg] = content;
      }
      const hw = hardwareProps(c);
      components.push({
        name: str(c.name),
        version: str(c.version),
        componentType:
          str(c.type) === "cryptographic-asset" ? "crypto-asset" : str(c.type) || "library",
        purl: str(c.purl),
        supplier,
        bomRef: str(c["bom-ref"]),
        group: str(c.group),
        cpe: str(c.cpe),
        scope: str(c.scope),
        description: str(c.description),
        manufacturer: str(asRecord(c.manufacturer).name),
        partNumber: hw.partNumber,
        serialNumber: hw.serialNumber,
        firmwareVersion: hw.firmwareVersion,
        licenses: licenseDetails.map((l) => l.license).filter((v, i, a) => a.indexOf(v) === i),
        licenseDetails,
        hashes,
        cryptoProperties,
        raw: c,
      });
      const nested = asArray(c.components);
      if (nested.length > 0) {
        const ref = str(c["bom-ref"]);
        walk(nested, ref);
        // A nested component IS a containment edge; record it when both ends
        // are referenceable so assembly structure survives normalization.
        if (ref) {
          for (const child of nested) {
            const childRef = str(asRecord(child)["bom-ref"]);
            if (childRef) containment.push({ ref, dependsOnRef: childRef });
          }
        }
      }
      void parentRef;
    }
  };
  const containment: ParsedDependency[] = [];
  walk(asArray(root.components), "");

  const dependencies: ParsedDependency[] = [...containment];
  for (const dep of asArray(root.dependencies)) {
    const d = asRecord(dep);
    const ref = str(d.ref);
    if (!ref) continue;
    for (const target of asArray(d.dependsOn)) {
      const t = str(target);
      if (t) dependencies.push({ ref, dependsOnRef: t });
    }
  }

  const metadata = asRecord(root.metadata);
  const rootComponent = asRecord(metadata.component);
  return {
    format: format === "other" ? "other" : "cyclonedx",
    components,
    dependencies,
    meta: {
      specVersion: str(root.specVersion),
      bomFormat: str(root.bomFormat),
      serialNumber: str(root.serialNumber),
      version: typeof root.version === "number" ? root.version : undefined,
      rootComponentName: str(rootComponent.name),
      rootComponentRef: str(rootComponent["bom-ref"]),
      componentCount: components.length,
      dependencyCount: dependencies.length,
    },
  };
}

/** SPDX primaryPackagePurpose → the componentType vocabulary we store. */
const SPDX_PURPOSE_MAP: Record<string, string> = {
  APPLICATION: "application",
  FRAMEWORK: "framework",
  LIBRARY: "library",
  CONTAINER: "container",
  OPERATING_SYSTEM: "operating-system",
  DEVICE: "device",
  FIRMWARE: "firmware",
  SOURCE: "library",
  ARCHIVE: "library",
  FILE: "file",
  INSTALL: "application",
  OTHER: "library",
};

function parseSpdx(json: unknown): ParsedBom {
  const root = asRecord(json);
  const packages = asArray(root.packages);
  const components = packages.map((entry) => {
    const p = asRecord(entry);
    let purl = "";
    let cpe = "";
    for (const ref of asArray(p.externalRefs)) {
      const r = asRecord(ref);
      const type = str(r.referenceType);
      if (type === "purl" && !purl) purl = str(r.referenceLocator);
      if ((type === "cpe23Type" || type === "cpe22Type") && !cpe) cpe = str(r.referenceLocator);
    }
    const licenseDetails: ParsedLicense[] = [];
    const concluded = cleanLicense(str(p.licenseConcluded));
    const declared = cleanLicense(str(p.licenseDeclared));
    if (concluded) licenseDetails.push({ license: concluded, source: "concluded" });
    if (declared && declared !== concluded) licenseDetails.push({ license: declared, source: "declared" });
    const hashes: Record<string, string> = {};
    for (const cs of asArray(p.checksums)) {
      const c = asRecord(cs);
      const alg = str(c.algorithm);
      const value = str(c.checksumValue);
      if (alg && value) hashes[alg] = value;
    }
    const supplier = str(p.supplier).replace(/^(Organization|Person):\s*/i, "");
    const purpose = str(p.primaryPackagePurpose).toUpperCase();
    return {
      name: str(p.name),
      version: str(p.versionInfo),
      componentType: SPDX_PURPOSE_MAP[purpose] ?? "library",
      purl,
      supplier: cleanLicense(supplier) ? supplier : "",
      bomRef: str(p.SPDXID),
      group: "",
      cpe,
      scope: "",
      description: str(p.description) || str(p.summary),
      manufacturer: "",
      partNumber: "",
      serialNumber: "",
      firmwareVersion: "",
      licenses: licenseDetails.map((l) => l.license),
      licenseDetails,
      hashes,
      cryptoProperties: null,
      raw: p,
    } satisfies ParsedComponent;
  });

  // SPDX relationships → dependency edges. DEPENDS_ON keeps direction;
  // DEPENDENCY_OF is the inverse; CONTAINS models assembly/containment.
  const dependencies: ParsedDependency[] = [];
  for (const rel of asArray(root.relationships)) {
    const r = asRecord(rel);
    const type = str(r.relationshipType).toUpperCase();
    const a = str(r.spdxElementId);
    const b = str(r.relatedSpdxElement);
    if (!a || !b) continue;
    if (type === "DEPENDS_ON" || type === "CONTAINS" || type === "STATIC_LINK" || type === "DYNAMIC_LINK") {
      dependencies.push({ ref: a, dependsOnRef: b });
    } else if (type === "DEPENDENCY_OF" || type === "CONTAINED_BY") {
      dependencies.push({ ref: b, dependsOnRef: a });
    }
  }

  return {
    format: "spdx",
    components,
    dependencies,
    meta: {
      spdxVersion: str(root.spdxVersion),
      name: str(root.name),
      componentCount: components.length,
      dependencyCount: dependencies.length,
    },
  };
}

// ---------------------------------------------------------------------------
// CycloneDX export — rebuilt from the NORMALIZED rows, not the raw file, so
// what you export is exactly what the database knows (round-trip honesty).
// ---------------------------------------------------------------------------

export type ExportableComponent = {
  name: string;
  version: string;
  componentType: string;
  purl: string;
  supplier: string;
  bomRef: string;
  group: string;
  cpe: string;
  scope: string;
  description: string;
  manufacturer: string;
  partNumber: string;
  serialNumber: string;
  firmwareVersion: string;
  licenses: string[];
  hashes: Record<string, string>;
  cryptoProperties: Record<string, unknown> | null;
};

/** Serialize normalized rows as a CycloneDX 1.6 JSON document. */
export function exportCycloneDx(input: {
  bomName: string;
  components: ExportableComponent[];
  dependencies: ParsedDependency[];
}): Record<string, unknown> {
  const components = input.components.map((c) => {
    const out: Record<string, unknown> = {
      type: c.componentType === "crypto-asset" ? "cryptographic-asset" : c.componentType || "library",
      name: c.name,
    };
    if (c.bomRef) out["bom-ref"] = c.bomRef;
    if (c.version) out.version = c.version;
    if (c.group) out.group = c.group;
    if (c.purl) out.purl = c.purl;
    if (c.cpe) out.cpe = c.cpe;
    if (c.scope) out.scope = c.scope;
    if (c.description) out.description = c.description;
    if (c.supplier) out.supplier = { name: c.supplier };
    if (c.manufacturer) out.manufacturer = { name: c.manufacturer };
    if (c.licenses.length > 0) {
      out.licenses = c.licenses.map((license) => ({ license: { name: license } }));
    }
    const hashEntries = Object.entries(c.hashes);
    if (hashEntries.length > 0) {
      out.hashes = hashEntries.map(([alg, content]) => ({ alg, content }));
    }
    if (c.cryptoProperties) out.cryptoProperties = c.cryptoProperties;
    const properties: { name: string; value: string }[] = [];
    if (c.partNumber) properties.push({ name: "oxot:partNumber", value: c.partNumber });
    if (c.serialNumber) properties.push({ name: "oxot:serialNumber", value: c.serialNumber });
    if (c.firmwareVersion) properties.push({ name: "oxot:firmwareVersion", value: c.firmwareVersion });
    if (properties.length > 0) out.properties = properties;
    return out;
  });

  // Group edges by ref, dropping edges whose endpoints have no bom-ref.
  const byRef = new Map<string, string[]>();
  for (const edge of input.dependencies) {
    if (!edge.ref || !edge.dependsOnRef) continue;
    const list = byRef.get(edge.ref) ?? [];
    if (!list.includes(edge.dependsOnRef)) list.push(edge.dependsOnRef);
    byRef.set(edge.ref, list);
  }
  const dependencies = [...byRef.entries()].map(([ref, dependsOn]) => ({ ref, dependsOn }));

  return {
    bomFormat: "CycloneDX",
    specVersion: "1.6",
    version: 1,
    metadata: {
      timestamp: new Date().toISOString(),
      component: { type: "application", name: input.bomName },
    },
    components,
    ...(dependencies.length > 0 ? { dependencies } : {}),
  };
}

// ---------------------------------------------------------------------------
// Component identity (upstream-notification natural key)
// ---------------------------------------------------------------------------

/**
 * Canonical, re-analysis-stable identity for a component: the purl when one
 * exists, else `name@version` (or bare `name` when no version is known).
 * Upstream-notification records (CRA Art 13(6)) are keyed by this + the
 * vulnerability id, never by a finding row — findings are wiped and regenerated
 * on every analysis, but this key survives re-ingesting a newer BOM.
 */
export function componentIdentityKey(c: {
  purl?: string | null;
  name?: string | null;
  version?: string | null;
}): string {
  const purl = (c.purl ?? "").trim();
  if (purl) return purl;
  const name = (c.name ?? "").trim();
  const version = (c.version ?? "").trim();
  return version ? `${name}@${version}` : name;
}

// ---------------------------------------------------------------------------
// Crypto-agility heuristics (pure, offline)
// ---------------------------------------------------------------------------

function keySizeFrom(name: string, crypto: Record<string, unknown> | null): number | null {
  const algProps = crypto ? asRecord(crypto.algorithmProperties) : {};
  const paramSet = str(algProps.parameterSetIdentifier);
  const fromParam = paramSet.match(/\d{3,6}/)?.[0];
  const fromName = name.match(/\b(\d{3,6})\b/)?.[0];
  const raw = fromParam ?? fromName;
  return raw ? Number.parseInt(raw, 10) : null;
}

/**
 * Flag weak, deprecated, or quantum-vulnerable crypto over a component set.
 * Runs on components carrying cryptoProperties or typed as a crypto-asset.
 */
export function runCryptoHeuristics(components: ParsedComponent[]): BomAnalysisFinding[] {
  const findings: BomAnalysisFinding[] = [];
  components.forEach((component, index) => {
    const isCrypto = component.cryptoProperties !== null || component.componentType === "crypto-asset";
    if (!isCrypto) return;
    const algo = component.name.toUpperCase();
    const push = (
      severity: BomSeverity,
      identifier: string,
      title: string,
      description: string,
    ) =>
      findings.push({
        componentIndex: index,
        findingType: "crypto_weakness",
        identifier,
        severity,
        title,
        description,
        source: "crypto-agility",
        detail: { algorithm: component.name },
      });

    if (/\bMD5\b/.test(algo)) {
      push("high", "CRYPTO-MD5", "Broken hash function (MD5)", "MD5 is collision-broken; migrate to SHA-256 or SHA-3.");
    }
    if (/\bSHA-?1\b/.test(algo)) {
      push("medium", "CRYPTO-SHA1", "Deprecated hash function (SHA-1)", "SHA-1 is deprecated (SHAttered); migrate to SHA-256 or SHA-3.");
    }
    if (/\bRC4\b/.test(algo)) {
      push("high", "CRYPTO-RC4", "Weak stream cipher (RC4)", "RC4 is insecure; migrate to AES-GCM or ChaCha20-Poly1305.");
    }
    if (/\b(3DES|TDEA|TRIPLE-?DES)\b/.test(algo)) {
      push("medium", "CRYPTO-3DES", "Deprecated cipher (3DES)", "3DES is deprecated (Sweet32); migrate to AES.");
    } else if (/\bDES\b/.test(algo)) {
      push("high", "CRYPTO-DES", "Broken cipher (DES)", "Single-DES is brute-forceable; migrate to AES.");
    }

    const keySize = keySizeFrom(component.name, component.cryptoProperties);
    if (/\bRSA\b/.test(algo) && keySize !== null && keySize < 2048) {
      push("high", "CRYPTO-RSA-WEAK", `Undersized RSA key (${keySize}-bit)`, "RSA keys below 2048 bits are below the 112-bit security floor; use ≥3072-bit RSA or ECC.");
    }

    const quantumVulnerable = /\b(RSA|ECDSA|ECDH|ECC|DSA|DH|DIFFIE-HELLMAN|ELGAMAL)\b/.test(algo);
    const nistLevelRaw = component.cryptoProperties
      ? asRecord(asRecord(component.cryptoProperties).algorithmProperties).nistQuantumSecurityLevel
      : undefined;
    const nistLevelZero = typeof nistLevelRaw === "number" && nistLevelRaw === 0;
    if (quantumVulnerable || nistLevelZero) {
      push("info", "CRYPTO-QUANTUM", "Quantum-vulnerable algorithm", "Public-key algorithm broken by Shor's algorithm; plan migration to a NIST PQC scheme (ML-KEM/ML-DSA).");
    }
  });
  return findings;
}

// ---------------------------------------------------------------------------
// OSV.dev vulnerability lookup (network, best-effort)
// ---------------------------------------------------------------------------

/**
 * Query OSV.dev's batch API for known vulnerabilities on each component's purl.
 * Best-effort: any network/parse failure resolves to `[]` so the caller can
 * still persist offline findings. Reads `globalThis.fetch` so tests can stub it
 * and never touch the real network.
 */
export async function osvLookup(components: ParsedComponent[]): Promise<BomAnalysisFinding[]> {
  try {
    // Map each query back to the component index it came from.
    const indexed = components
      .map((c, index) => ({ c, index }))
      .filter((entry) => entry.c.purl);
    if (indexed.length === 0) return [];

    const fetchFn = globalThis.fetch;
    if (typeof fetchFn !== "function") return [];

    const res = await fetchFn("https://api.osv.dev/v1/querybatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        queries: indexed.map((entry) => ({ package: { purl: entry.c.purl } })),
      }),
    });
    if (!res.ok) return [];

    const json = (await res.json()) as {
      results?: { vulns?: { id?: string; modified?: string }[] }[];
    };
    const results = Array.isArray(json.results) ? json.results : [];

    const findings: BomAnalysisFinding[] = [];
    results.forEach((result, i) => {
      const entry = indexed[i];
      if (!entry) return;
      for (const vuln of result?.vulns ?? []) {
        const id = str(vuln?.id);
        if (!id) continue;
        findings.push({
          componentIndex: entry.index,
          findingType: "vulnerability",
          identifier: id,
          severity: "unknown",
          title: id,
          description: "",
          source: "osv",
          detail: { modified: vuln?.modified ?? null },
        });
      }
    });
    return findings;
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Per-type checklist catalog
// ---------------------------------------------------------------------------

export type BomType =
  | "sbom"
  | "cbom"
  | "hbom"
  | "mbom"
  | "obom"
  | "ebom"
  | "opsbom"
  | "saasbom"
  | "processbom";

type CatalogEntry = {
  label: string;
  description: string;
  checklist: { key: string; label: string }[];
};

export const BOM_CATALOG: Record<BomType, CatalogEntry> = {
  sbom: {
    label: "SBOM — Software Bill of Materials",
    description: "Every software component, its version, license and known vulnerabilities.",
    checklist: [
      { key: "components_complete", label: "All first- and third-party components listed" },
      { key: "versions_pinned", label: "Every component has a resolved version" },
      { key: "licenses_reviewed", label: "Licenses reviewed for compatibility" },
      { key: "vulns_triaged", label: "Known vulnerabilities triaged" },
      { key: "supplier_known", label: "Supplier/origin recorded for each component" },
    ],
  },
  cbom: {
    label: "CBOM — Cryptography Bill of Materials",
    description: "Cryptographic algorithms, keys and certificates in use, for crypto-agility.",
    checklist: [
      { key: "algorithms_inventoried", label: "All algorithms and key sizes inventoried" },
      { key: "deprecated_flagged", label: "Deprecated/broken algorithms flagged" },
      { key: "pqc_plan", label: "Post-quantum migration plan noted" },
      { key: "cert_expiry", label: "Certificate expiry tracked" },
    ],
  },
  hbom: {
    label: "HBOM — Hardware Bill of Materials",
    description: "Physical/hardware components and their provenance.",
    checklist: [
      { key: "parts_listed", label: "All hardware parts listed with part numbers" },
      { key: "provenance", label: "Provenance/country-of-origin recorded" },
      { key: "eol_tracked", label: "End-of-life / obsolescence tracked" },
    ],
  },
  mbom: {
    label: "MBOM — Manufacturing Bill of Materials",
    description: "Assemblies, sub-assemblies and parts as manufactured, with revisions and quantities.",
    checklist: [
      { key: "assemblies_structured", label: "Assembly/sub-assembly structure captured (nested components or dependencies)" },
      { key: "revisions_tracked", label: "Part revisions/versions tracked" },
      { key: "suppliers_recorded", label: "Supplier recorded for each manufactured part" },
      { key: "traceability", label: "Serial/lot traceability recorded where applicable" },
    ],
  },
  obom: {
    label: "OBOM — Operations Bill of Materials (deployed)",
    description: "The as-deployed inventory: devices, firmware versions, hosts and their configuration.",
    checklist: [
      { key: "assets_listed", label: "All deployed assets/devices listed" },
      { key: "firmware_versions", label: "Firmware/software versions recorded per asset" },
      { key: "environments_mapped", label: "Environment/location mapped for each asset" },
      { key: "owners_assigned", label: "Operational owners assigned" },
    ],
  },
  ebom: {
    label: "EBOM — Engineering Bill of Materials (DEXPI)",
    description: "Plant/P&ID engineering data (DEXPI/Proteus XML): equipment, piping, instrumentation and their attributes, stored as queryable tables.",
    checklist: [
      { key: "equipment_tagged", label: "All equipment items carry engineering tags" },
      { key: "instrumentation_captured", label: "Instrumentation functions captured" },
      { key: "connectivity_captured", label: "Piping/instrumentation connectivity captured" },
      { key: "attributes_reviewed", label: "Design attributes (pressure, temperature, material) reviewed" },
      { key: "security_relevant_flagged", label: "Security-relevant items (controllers, remote I/O) flagged" },
    ],
  },
  opsbom: {
    label: "OpsBOM — Operations Bill of Materials",
    description: "Runtime/operational dependencies: infra, services, configuration.",
    checklist: [
      { key: "services_listed", label: "All runtime services and infra listed" },
      { key: "config_captured", label: "Security-relevant configuration captured" },
      { key: "owners_assigned", label: "Operational owners assigned" },
    ],
  },
  saasbom: {
    label: "SaaSBOM — SaaS Bill of Materials",
    description: "Third-party SaaS/API dependencies and the data they process.",
    checklist: [
      { key: "vendors_listed", label: "All SaaS vendors listed" },
      { key: "data_flows", label: "Data shared with each vendor documented" },
      { key: "dpa_in_place", label: "DPA / contractual controls in place" },
    ],
  },
  processbom: {
    label: "ProcessBOM — Process Bill of Materials",
    description: "The processes and controls that produce and maintain the product.",
    checklist: [
      { key: "processes_listed", label: "Key development/security processes listed" },
      { key: "controls_mapped", label: "Controls mapped to requirements" },
      { key: "review_cadence", label: "Review cadence defined" },
    ],
  },
};

export function isBomType(value: string): value is BomType {
  return Object.prototype.hasOwnProperty.call(BOM_CATALOG, value);
}

/** Seed a fresh, all-unchecked checklist for a BOM type (falls back to SBOM). */
export function defaultChecklist(bomType: string): BomChecklistItem[] {
  const entry = isBomType(bomType) ? BOM_CATALOG[bomType] : BOM_CATALOG.sbom;
  return entry.checklist.map((item) => ({ key: item.key, label: item.label, done: false }));
}
