/**
 * DEXPI engineering BOM parser — Proteus XML (the serialization DEXPI 1.x/2.x
 * uses for P&ID exchange). Produces a fully NORMALIZED plant model:
 *
 *   items        — one row per plant item (Equipment, Nozzle, piping systems/
 *                  segments/components, instrumentation functions), with the
 *                  document-local ID, engineering TagName, Proteus element
 *                  class and DEXPI ComponentClass.
 *   attributes   — one row per GenericAttribute (name/value/format/units) —
 *                  DEXPI's own EAV surface, kept as rows so design data is
 *                  plain SQL, never JSON spelunking.
 *   connections  — piping topology from <Connection FromID/ToID> plus
 *                  instrumentation associations.
 *
 * Pure and deterministic (no DB, no network) so it is unit-testable. The route
 * handler persists the result.
 */
import { XMLParser } from "fast-xml-parser";

export type DexpiItem = {
  itemRef: string;
  tagName: string;
  itemClass: string;
  componentClass: string;
  componentName: string;
  specification: string;
  parentRef: string;
  raw: Record<string, unknown>;
};

export type DexpiAttribute = {
  itemIndex: number; // index into items
  name: string;
  value: string;
  format: string;
  units: string;
  attributeSet: string;
};

export type DexpiConnection = {
  fromRef: string;
  toRef: string;
  connectionType: string;
};

export type ParsedDexpi = {
  items: DexpiItem[];
  attributes: DexpiAttribute[];
  connections: DexpiConnection[];
  meta: Record<string, unknown>;
};

/** Proteus element names that materialize as plant items. */
const ITEM_ELEMENTS = [
  "Equipment",
  "Nozzle",
  "PipingNetworkSystem",
  "PipingNetworkSegment",
  "PipingComponent",
  "Pipe",
  "ProcessInstrumentationFunction",
  "ProcessSignalGeneratingFunction",
  "InstrumentationLoopFunction",
  "ActuatingFunction",
  "Component",
] as const;

const ITEM_ELEMENT_SET = new Set<string>(ITEM_ELEMENTS);

function rec(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function arr(value: unknown): unknown[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function att(node: Record<string, unknown>, name: string): string {
  const v = node[`@_${name}`];
  return typeof v === "string" ? v : typeof v === "number" ? String(v) : "";
}

export function parseDexpi(xmlText: string): ParsedDexpi {
  let doc: Record<string, unknown>;
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      // Keep every element; we walk selectively.
      isArray: (name) => ITEM_ELEMENT_SET.has(name) || name === "GenericAttribute" || name === "GenericAttributes" || name === "Connection" || name === "Association",
      parseTagValue: false,
      parseAttributeValue: false,
    });
    doc = rec(parser.parse(xmlText));
  } catch {
    throw new Error("Not valid XML. DEXPI engineering BOMs must be Proteus XML documents.");
  }

  const plantModel = rec(doc.PlantModel);
  if (Object.keys(plantModel).length === 0) {
    throw new Error("Not a DEXPI/Proteus document: missing <PlantModel> root element.");
  }

  const items: DexpiItem[] = [];
  const attributes: DexpiAttribute[] = [];
  const connections: DexpiConnection[] = [];

  const collectAttributes = (node: Record<string, unknown>, itemIndex: number): void => {
    for (const setNode of arr(node.GenericAttributes)) {
      const s = rec(setNode);
      const setName = att(s, "Set");
      for (const attrNode of arr(s.GenericAttribute)) {
        const a = rec(attrNode);
        const name = att(a, "Name");
        if (!name) continue;
        attributes.push({
          itemIndex,
          name,
          value: att(a, "Value"),
          format: att(a, "Format"),
          units: att(a, "Units"),
          attributeSet: setName,
        });
      }
    }
  };

  const collectConnections = (node: Record<string, unknown>, type: string): void => {
    // Proteus: <Connection FromID=".." ToID=".."/> inside segments; also
    // FromNode/ToNode variants exist in older exports.
    for (const connNode of arr(node.Connection)) {
      const c = rec(connNode);
      const fromRef = att(c, "FromID") || att(c, "FromNode");
      const toRef = att(c, "ToID") || att(c, "ToNode");
      if (fromRef && toRef) connections.push({ fromRef, toRef, connectionType: type });
    }
    for (const assocNode of arr(node.Association)) {
      const a = rec(assocNode);
      const toRef = att(a, "ItemID");
      const fromRef = att(rec(node), "ID");
      if (fromRef && toRef) connections.push({ fromRef, toRef, connectionType: "association" });
    }
  };

  const walk = (node: Record<string, unknown>, parentRef: string): void => {
    for (const [key, value] of Object.entries(node)) {
      if (!ITEM_ELEMENT_SET.has(key)) continue;
      for (const childNode of arr(value)) {
        const child = rec(childNode);
        const itemRef = att(child, "ID");
        const item: DexpiItem = {
          itemRef,
          tagName: att(child, "TagName") || att(rec(child.Label), "String"),
          itemClass: key,
          componentClass: att(child, "ComponentClass"),
          componentName: att(child, "ComponentName"),
          specification: att(child, "Specification"),
          parentRef,
          // Store only scalar attributes of the node — children become their own rows.
          raw: Object.fromEntries(
            Object.entries(child).filter(([k]) => k.startsWith("@_")),
          ) as Record<string, unknown>,
        };
        const itemIndex = items.length;
        items.push(item);
        collectAttributes(child, itemIndex);
        collectConnections(
          child,
          key.startsWith("Piping") ? "piping" : key.includes("Instrumentation") || key.includes("Function") ? "instrumentation" : "other",
        );
        // Recurse: equipment→nozzles, systems→segments→components.
        walk(child, itemRef || parentRef);
      }
    }
  };

  walk(plantModel, "");

  const plantInfo = rec(arr(plantModel.PlantInformation)[0]);
  return {
    items,
    attributes,
    connections,
    meta: {
      schemaVersion: att(plantInfo, "SchemaVersion"),
      originatingSystem: att(plantInfo, "OriginatingSystem"),
      date: att(plantInfo, "Date"),
      projectName: att(rec(arr(plantModel.Extent)[0]), "Name") || "",
      itemCount: items.length,
      attributeCount: attributes.length,
      connectionCount: connections.length,
    },
  };
}
