---
title: "Data Center Cybersecurity — IEC 62443 SL-3 / SL-4"
meta_title: "Data Center OT Security & IEC 62443 SL-3/SL-4 | OXOT"
meta_description: "A field guide to data-center OT cybersecurity: the TIA-942 tier framework and the wider TIA family of cabling standards, and the mid-2026 reality that no data-center-native product holds IEC 62443-4-2 SL-3 (and SL-4 exists nowhere). How to specify SL-2 as the floor and close the gap to SL-3 with zone/conduit architecture."
excerpt: "Data centers are where the digital economy actually runs — and where OT security, physical infrastructure and EU regulation collide. A field guide to the TIA-942 tier model, the TIA family of standards, and the hard truth about IEC 62443 SL-3 / SL-4 in the data-center OT stack today."
content_type: page
published: true
---

Data centers are foundational to the digital economy — cloud, AI training, real-time processing — and increasingly they are also **operational-technology estates** in their own right: power, cooling, building management, physical access and fire systems, all networked, all in scope for the [Cyber Resilience Act](/en/cra), [NIS2](/en/nis2) and [IEC 62443](/en/iec-62443).

This page brings together two things a data-center operator has to hold at once: the **physical-infrastructure standard** the industry designs to (TIA-942 and the wider TIA family), and the **cybersecurity reality** of the OT products inside — where, as of mid-2026, the achievable security level is lower than most RFPs assume.

```keyfacts
Physical standard :: ANSI/TIA-942-C (2022) — four data-center tiers
Cabling family :: TIA TR-42 standards for premises, DC and industrial
Security standard :: [IEC 62443](/en/iec-62443)-4-2 — component security levels
SL-3 in the DC stack :: none — zero data-center-native products certified
SL-4 anywhere :: never achieved by any commercial product, any industry
Realistic frontier :: SL-2, and only in some categories
Regulatory pull :: NIS2, CRA and DORA push SL-2 toward table stakes
```

## Part 1 — TIA-942: the data-center tier framework

TIA-942 is the globally recognised standard for data-center infrastructure from the [Telecommunications Industry Association](https://www.tiafotc.org/tia-standards-update/). It sets requirements for cabling, power, cooling and physical security, and defines **four tiers of resilience** that guide organisations to a target uptime and performance level.

```timeline
2005 :: TIA-942 initial release — first guidelines for DC design, power, cooling and security.
2010 :: TIA-942-A — stronger network-infrastructure recommendations, higher-efficiency power and cooling, revised tiered reliability.
2017 :: TIA-942-B — sustainability and energy efficiency, advanced security and disaster recovery, cloud and virtualisation scalability.
2022 :: TIA-942-C — updated for 5G and edge computing, refined operational guidelines for flexibility and resilience.
```

### What TIA-942 covers

```cards
Site & building :: :: Site selection and building infrastructure sized for the target tier's resilience.
Electrical & mechanical :: :: Power paths, redundancy, cooling and mechanical systems.
Structured cabling :: :: Telecommunications cabling architecture aligned to the TIA-568 family.
Fire & environment :: :: Fire protection and environmental controls for continuous operation.
Physical security :: :: Access control and physical protection of critical spaces.
Labeling & administration :: :: Consistent labeling and administration (TIA-606) for maintainable, auditable infrastructure.
```

## Part 2 — The TIA family of standards

TIA-942 does not stand alone. The TIA TR-42 Engineering Committee maintains a hierarchy of voluntary cabling-infrastructure standards for user-owned premises — commercial buildings, residential, healthcare, education, **data centers**, and industrial buildings — plus component standards for cables and connectors and Technical Systems Bulletins for field guidance.

```cards
TIA-568 series :: :: Generic and commercial-building cabling, balanced twisted-pair and optical-fiber components.
TIA-569 :: :: Pathways and spaces supporting the cabling.
TIA-942-C :: :: Telecommunications infrastructure standard for data centers.
TIA-1005-A :: :: Telecommunications infrastructure for industrial premises.
TIA-862-C :: :: Building-automation systems cabling.
TIA-606-D :: :: Administration of telecommunications infrastructure.
TIA-607-E :: :: Generic bonding and grounding for premises.
TIA-5017 :: :: Telecommunications physical network security.
```

> [!NOTE]
> TIA standards govern the **physical and cabling layer** — how a data center is built, powered and connected. Cybersecurity of the OT that rides on that infrastructure is governed separately by IEC 62443, and that is where the current gap lies.

## Part 3 — The IEC 62443 SL-3 / SL-4 reality in the data center

Here is the uncomfortable finding from OXOT's certification-landscape research: **no data-center-native product — in any OT category (UPS, ATS, CRAC/CRAH, generator management, rack PDU, BMS, liquid cooling, physical access, fire detection) — holds a certified IEC 62443-4-2 Security Level 3 rating** as of mid-2026. **SL-4 has never been achieved** by any commercial product, under any recognised scheme, in any industry.

Exactly **five products worldwide** hold IEC 62443-4-2 SL-3 component certifications, all issued between December 2023 and June 2024 — and **all five are outside the data-center stack**:

| Vendor | Product | Component type | DC relevance |
| --- | --- | --- | --- |
| GE Power Conversion | HPCi Controller v8.1.0 | Marine/industrial drive power controller | Same hardware class as UPS/generator controllers — proves SL-3 is achievable |
| Bitron Electronics | µUP Smart Street Box RTU | Smart-grid RTU | None (smart grid / street lighting) |
| Saia-Burgess / Honeywell | PCD QronoX (ControlEdge PCD) | PLC / building-automation controller | The only facility-adjacent SL-3 — a BMS zone-controller blueprint |
| Cylus | CylusOne Rail Cybersecurity Platform | Rail OT security | None (rail) |
| Cervello | Rail Cybersecurity Platform v24.03.0 | Rail OT security | None (rail) |

### Where the data-center stack actually sits — SL-2 at best

```compare
Best-in-class today (SL-2)
- UPS management cards — Schneider NMC3, Vertiv RDU120, Eaton NETWORK-M3
- OT switches — Cisco IE3x00, Moxa EDR-G9010 / TN-4900, Belden HiOS
- Secure routers — Moxa EDR-G9010, TN-4900
- BMS controllers — Honeywell Advanced Plant Controller, Siemens Desigo CC
- DCIM — Schneider EcoStruxure IT (via NMC3)
---
Critical gaps (no product cert at any SL)
- Automatic transfer switches (ATS)
- Generator / genset management controllers
- CRAC / CRAH cooling-unit controllers
- Liquid cooling (CDU, rear-door, rack manifold) — entirely uncertified
- Physical access control (PACS)
- Fire/smoke and leak detection (SIL ≠ cyber)
```

## Part 4 — What to do about it

The gap between what regulations pull for and what the market can certify is the practical problem. OXOT's guidance to data-center operators and OT security teams:

```cards
Don't specify SL-3 in RFPs today :: :: For power or cooling equipment there is no SL-3 product to buy — an SL-3 requirement makes the whole RFP unbiddable.
Specify SL-2 as the mandatory minimum :: :: For network-connected OT components SL-2 is achievable and verifiable across competing vendors.
Reach SL-3 at the system level :: :: Apply architectural compensating controls at the [zone and conduit](/en/iec-62443) layer where products fall short.
Watch the QronoX blueprint :: :: Saia-Burgess PCD QronoX is the operational reference for SL-3 facility control as a BMS zone controller.
Expect SL-2 to become table stakes :: :: NIS2 and CRA pressure is pushing SL-2 to a procurement baseline through 2026–2027.
Anchor evidence on 62443 :: :: One 62443-aligned technical file serves procurement, NIS2 and CRA at once.
```

```cta
Building or securing a data-center OT estate?
We map your power, cooling, BMS and network OT to achievable IEC 62443 security levels — and design the zone/conduit architecture that reaches SL-3 protection where no SL-3 product exists yet.
Scope a data-center assessment :: /en/contact
```

This focus draws on OXOT's data-center research — the [TIA-942 framework](/conformity/sources/data-center-tia-942.md), the [TIA family of standards](/conformity/sources/tia-family-of-standards.md), and the full [SL-3 / SL-4 supplier-status landscape](/conformity/sources/datacenter-supplier-status-sl3-sl4.md) — all available in the [Conformity Source Library](/conformity/sources). It connects directly to [IEC 62443](/en/iec-62443), the [Cyber Resilience Act](/en/cra) and the [Sentyron](/en/sentyron) conformity service.
