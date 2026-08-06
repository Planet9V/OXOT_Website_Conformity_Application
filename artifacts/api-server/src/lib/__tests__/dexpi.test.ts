import { describe, it, expect } from "vitest";
import { parseDexpi } from "../dexpi";

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<PlantModel>
  <PlantInformation SchemaVersion="4.1.0" OriginatingSystem="TestCAD" Date="2026-01-15"/>
  <Equipment ID="EQ-1" TagName="P-1501" ComponentClass="CentrifugalPump" ComponentName="Main feed pump" Specification="API 610">
    <GenericAttributes Set="DexpiAttributes">
      <GenericAttribute Name="DesignPressure" Value="16" Format="double" Units="bar"/>
      <GenericAttribute Name="MaterialOfConstruction" Value="1.4404" Format="string"/>
    </GenericAttributes>
    <Nozzle ID="NZ-1" TagName="N1" ComponentClass="Nozzle"/>
  </Equipment>
  <Equipment ID="EQ-2" TagName="T-100" ComponentClass="Tank"/>
  <PipingNetworkSystem ID="PNS-1" TagName="L-001">
    <PipingNetworkSegment ID="SEG-1">
      <PipingComponent ID="V-1" TagName="HV-1501" ComponentClass="GateValve"/>
      <Connection FromID="NZ-1" ToID="EQ-2"/>
    </PipingNetworkSegment>
  </PipingNetworkSystem>
  <ProcessInstrumentationFunction ID="PIF-1" TagName="FIC-1501" ComponentClass="FlowControl"/>
</PlantModel>`;

describe("parseDexpi", () => {
  it("rejects non-XML and non-Proteus documents", () => {
    expect(() => parseDexpi("{}")).toThrow(/PlantModel|XML/);
    expect(() => parseDexpi("<Other/>")).toThrow(/PlantModel/);
  });

  it("extracts plant items with tags, classes and hierarchy", () => {
    const parsed = parseDexpi(SAMPLE);
    const byRef = new Map(parsed.items.map((i) => [i.itemRef, i]));
    expect(byRef.get("EQ-1")).toMatchObject({
      tagName: "P-1501",
      itemClass: "Equipment",
      componentClass: "CentrifugalPump",
      specification: "API 610",
      parentRef: "",
    });
    // Nozzle nested under the pump keeps parent linkage.
    expect(byRef.get("NZ-1")).toMatchObject({ itemClass: "Nozzle", parentRef: "EQ-1" });
    // Piping component nested under segment under system.
    expect(byRef.get("V-1")).toMatchObject({
      componentClass: "GateValve",
      parentRef: "SEG-1",
    });
    expect(byRef.get("PIF-1")).toMatchObject({ tagName: "FIC-1501" });
  });

  it("normalizes GenericAttributes to typed rows bound to their item", () => {
    const parsed = parseDexpi(SAMPLE);
    const pumpIndex = parsed.items.findIndex((i) => i.itemRef === "EQ-1");
    const attrs = parsed.attributes.filter((a) => a.itemIndex === pumpIndex);
    expect(attrs).toContainEqual({
      itemIndex: pumpIndex,
      name: "DesignPressure",
      value: "16",
      format: "double",
      units: "bar",
      attributeSet: "DexpiAttributes",
    });
    expect(attrs.some((a) => a.name === "MaterialOfConstruction" && a.value === "1.4404")).toBe(true);
  });

  it("captures piping connectivity as edges", () => {
    const parsed = parseDexpi(SAMPLE);
    expect(parsed.connections).toContainEqual({
      fromRef: "NZ-1",
      toRef: "EQ-2",
      connectionType: "piping",
    });
  });

  it("reports document meta", () => {
    const parsed = parseDexpi(SAMPLE);
    expect(parsed.meta.schemaVersion).toBe("4.1.0");
    expect(parsed.meta.originatingSystem).toBe("TestCAD");
    expect(parsed.meta.itemCount).toBe(parsed.items.length);
  });
});
