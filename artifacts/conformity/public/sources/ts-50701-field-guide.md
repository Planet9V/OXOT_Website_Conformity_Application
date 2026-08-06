---
title: TS 50701 — Railway Cybersecurity
meta_title: CLC/TS 50701 Railway Cybersecurity Explained | OXOT
meta_description: CLC/TS 50701 explained in depth — the first cybersecurity specification for rail, how it applies IEC 62443 to railway systems, its integration with the EN 50126 RAMS lifecycle, the safety–security interface, zones and conduits, NIS2 and CRA relevance, and the road to IEC 63452.
excerpt: The cybersecurity specification for rail — IEC 62443 adapted to railway applications and welded into the safety lifecycle.
content_type: page
published: true
---

A modern train is a data centre on wheels running through a network that stretches across an entire country. Signalling interlockings, on-board control units, traffic-management systems, passenger information, trackside sensors, remote maintenance links — all of it now digital, much of it connected, and every piece expected to keep working safely for thirty years or more. Rail is one of the hardest places on earth to do cybersecurity: safety-critical, geographically sprawling, assembled from a long chain of suppliers, and governed by a safety culture that predates the internet.

For a long time, rail had no cybersecurity standard of its own. Engineers borrowed generic industrial guidance, stretched it over railway architecture, and hoped the fit was close enough. **CLC/TS 50701 ended that improvisation.** Published in July 2021, it is the first cybersecurity specification written specifically for railway applications, and it has become the reference point for securing signalling, control-command, rolling stock and rail infrastructure across Europe and beyond.

## The short version

- **CLC/TS 50701** is a CENELEC Technical Specification for **cybersecurity in railway applications**. Its first edition was published in **July 2021** — the world's first comprehensive cybersecurity specification built for rail. A **second edition (CLC/TS 50701:2023)** followed in August 2023. ([CLC/TS 50701:2023 guide, iTeh](https://standards.iteh.ai/catalog/standards/clc/db257ea9-8ba0-4f4c-a791-df34a6030541/clc-ts-50701-2023))
- It is **not standalone**. It **applies the [IEC 62443](/en/iec-62443) series** to the railway context, adapting its security models, concepts and risk-assessment process — leaning especially on **IEC 62443-3-2** and **62443-3-3**. ([ENISA / CENELEC](https://www.enisa.europa.eu/sites/default/files/all_files/05-standards-02-cenelec-christian-schlehuber.pdf))
- It integrates with the railway **RAMS lifecycle** defined in **EN 50126-1**, so cybersecurity is engineered alongside reliability, availability, maintainability and safety — not bolted on afterwards.
- It was authored by **CENELEC TC 9X/WG 26**, a working group of dozens of European rail and security experts, and now feeds directly into the coming **international standard IEC 63452**. ([Alstom](https://www.alstom.com/press-releases-news/2024/3/towards-first-railway-cybersecurity-international-standard-why-standards-are-important-secure-railways))

> [!NOTE]
> A note on naming. You will see this document written as **CLC/TS 50701**, **TS 50701**, or with a year suffix (**:2021**, **:2023**). "CLC" marks it as a CENELEC deliverable; "TS" marks it as a Technical Specification rather than a full European Norm. The 2021 first edition and the 2023 second edition are the same document maturing, not two competing standards.

```keyfacts
Type :: CENELEC Technical Specification (CLC/TS) — not a full EN
First edition :: July 2021 — world's first rail-specific cybersecurity spec
Current edition :: CLC/TS 50701:2023
Built on :: IEC 62443 (esp. 3-2, 3-3, 4-2, 4-1)
Safety lifecycle :: integrates with EN 50126-1 (RAMS)
Scope domains :: Communications · Signalling & Processing · Rolling Stock · Fixed Installations
Safety–security bridge :: CSM-RA + IEC 62443-3-3
Authored by :: CENELEC TC 9X/WG 26
Becoming :: IEC 63452 — the first international rail cybersecurity standard
Regulatory pull :: NIS2 (essential entities) + CRA (products with digital elements)
```

## Why rail needed its own specification

Rail lives at the intersection of two worlds that rarely speak the same language.

On one side sits a mature, deeply codified **safety** discipline. The CENELEC EN 5012x family — EN 50126 for the RAMS lifecycle, EN 50128/EN 50716 for software, EN 50129 for safety-related electronic systems — has governed how the industry proves its systems are safe for decades. It is rigorous, evidence-driven, and built around a single guiding question: will this system fail dangerously?

On the other side sits **cybersecurity**, a faster-moving field shaped first by IT and then by generic industrial control systems. Its guiding question is different: can an adversary make this system do something it should not?

Neither world fit rail on its own. The safety standards were written for random failures and human error, not deliberate, intelligent attackers who probe, adapt and wait. Generic security standards, meanwhile, knew nothing of the RAMS lifecycle, the peculiar architecture of interlockings and balises, or the fact that a firewall rule tightened for security reasons could, if it dropped the wrong packet, degrade a safety function.

TS 50701 was written to close that gap. It takes the proven machinery of [IEC 62443](/en/iec-62443) — zones and conduits, security levels, a structured risk-assessment process — and re-expresses it in terms a railway engineer already recognises, wired directly into the safety lifecycle they already follow. Its stated aim is blunt and worth quoting in spirit: to ensure that the RAMS characteristics of railway systems cannot be reduced, lost or compromised by an intentional attack. ([Shieldworkz](https://shieldworkz.com/blogs/a-deep-dive-into-cenelec-ts-50701-for-railway-cybersecurity))

> [!IMPORTANT]
> The premise underneath the whole specification: in rail, **if a system is not secure, its safety cannot be guaranteed.** Security is not adjacent to safety here. It is a precondition for it.

## Built on IEC 62443

TS 50701 does not reinvent cybersecurity engineering — it inherits it. The specification is explicit that its security models, concepts and risk-assessment process are based on or derived from the [IEC 62443](/en/iec-62443) series. Two parts do most of the heavy lifting.

- **IEC 62443-3-2 — Security risk assessment for system design.** This is the source of the zones-and-conduits methodology and the workflow that produces a target security level for each zone. TS 50701 adopts this risk process almost wholesale, then adapts it to railway realities.
- **IEC 62443-3-3 — System security requirements and security levels.** This supplies the catalogue of technical requirements grouped under the seven **foundational requirements** (identification and authentication, use control, system integrity, data confidentiality, restricted data flow, timely response to events, resource availability), and the SL-1 through SL-4 scale that says how strong protection must be.

Component-level work reaches further into the series — **IEC 62443-4-2** for the technical security requirements of individual products, and **IEC 62443-4-1** for the secure development lifecycle a supplier follows. TS 50701 also draws in a threat library to feed the assessment; later editions cite **MITRE ATT&CK for ICS** as an example. ([iTeh](https://standards.iteh.ai/catalog/standards/clc/db257ea9-8ba0-4f4c-a791-df34a6030541/clc-ts-50701-2023))

The table below maps the relationship part by part.

| IEC 62443 part | What it provides | How TS 50701 uses it |
| --- | --- | --- |
| 62443-1-1 | Concepts, terminology, models | Baseline vocabulary — zones, conduits, security levels — carried into rail |
| 62443-2-1 | Security management system for the asset owner | Informs how operators and infrastructure managers run their programme |
| 62443-3-2 | Risk assessment for system design | Core of the TS 50701 risk process; adapted to railway assets and the RAMS lifecycle |
| 62443-3-3 | System security requirements & security levels | Requirement catalogue and SL 1–4 scale, referenced alongside safety methods |
| 62443-4-1 | Secure product development lifecycle | Expectation placed on suppliers building rail components |
| 62443-4-2 | Component technical security requirements | Referenced directly for component-level specification and testing |

> [!TIP]
> If your organisation already understands [IEC 62443](/en/iec-62443), you are most of the way to understanding TS 50701. The engineering logic is identical; what changes is the vocabulary of the assets and the lifecycle you plug it into. Work done for one is transferable to the other.

### The seven foundational requirements, in railway terms

The requirement catalogue TS 50701 inherits from IEC 62443-3-3 is organised under **seven foundational requirements (FRs)**. They sound abstract until you translate each into a railway asset — at which point they become an inspection checklist for a signalling estate.

| FR | IEC 62443 name | What it means on the railway |
| --- | --- | --- |
| **FR 1** | Identification & authentication control | Every maintainer, engineer and remote tool that touches an interlocking or on-board unit is uniquely identified and authenticated — no shared "maintenance" logins on safety-critical kit |
| **FR 2** | Use control | An authenticated user can do only what their role permits; a diagnostic session cannot become a route-setting command |
| **FR 3** | System integrity | Signalling logic, ETCS data and firmware cannot be altered undetected — integrity checks and signed updates guard the safety function |
| **FR 4** | Data confidentiality | Timetables, keys and configuration in transit over trackside or radio links are protected from disclosure where disclosure would enable an attack |
| **FR 5** | Restricted data flow | Zones and conduits enforce that a passenger network cannot reach a signalling zone; the conduit is the only path, and it is controlled |
| **FR 6** | Timely response to events | The estate can detect and log a security event on a lineside controller and respond before it becomes a safety event |
| **FR 7** | Resource availability | Denial-of-service against a traffic-management system or a train-control network cannot be allowed to degrade availability — the RAMS "A" is a security target too |

The higher the target security level of a zone, the more of each FR's requirement enhancements apply — which is exactly how a signalling interlocking (SL-3/SL-4) ends up with far stricter controls than a passenger-information display (SL-1/SL-2), even though both are assessed against the same seven headings.

```svg
<svg viewBox="0 0 700 430" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif">
  <rect width="700" height="430" fill="none"/>
  <text x="350" y="30" fill="#e5e7eb" font-size="19" font-weight="700" text-anchor="middle">TS 50701 — what it stands on, what it plugs into</text>

  <!-- Foundation: IEC 62443 -->
  <rect x="70" y="330" width="560" height="70" rx="8" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <text x="350" y="360" fill="#e5e7eb" font-size="15" font-weight="700" text-anchor="middle">IEC 62443 series — foundation</text>
  <text x="350" y="382" fill="#94a3b8" font-size="12" text-anchor="middle">zones &amp; conduits · security levels SL 1–4 · risk process (3-2, 3-3, 4-2)</text>

  <!-- TS 50701 middle layer -->
  <rect x="130" y="200" width="440" height="90" rx="8" fill="none" stroke="#f97316" stroke-width="2.5"/>
  <text x="350" y="235" fill="#e5e7eb" font-size="17" font-weight="700" text-anchor="middle">CLC/TS 50701</text>
  <text x="350" y="258" fill="#94a3b8" font-size="12" text-anchor="middle">IEC 62443 adapted to rail · manages the safety–security interface</text>
  <text x="350" y="276" fill="#94a3b8" font-size="12" text-anchor="middle">railway asset types · railway threat &amp; consequence model</text>

  <!-- Top left: RAMS lifecycle -->
  <rect x="70" y="70" width="250" height="90" rx="8" fill="none" stroke="#94a3b8" stroke-width="2"/>
  <text x="195" y="100" fill="#e5e7eb" font-size="14" font-weight="700" text-anchor="middle">EN 50126 RAMS lifecycle</text>
  <text x="195" y="122" fill="#94a3b8" font-size="12" text-anchor="middle">security woven into the</text>
  <text x="195" y="138" fill="#94a3b8" font-size="12" text-anchor="middle">phases rail already uses</text>

  <!-- Top right: regulation -->
  <rect x="380" y="70" width="250" height="90" rx="8" fill="none" stroke="#94a3b8" stroke-width="2"/>
  <text x="505" y="100" fill="#e5e7eb" font-size="14" font-weight="700" text-anchor="middle">Regulation &amp; safety method</text>
  <text x="505" y="122" fill="#94a3b8" font-size="12" text-anchor="middle">NIS2 · CRA · CSM-RA</text>
  <text x="505" y="138" fill="#94a3b8" font-size="12" text-anchor="middle">obligations rail must meet</text>

  <!-- connectors -->
  <line x1="350" y1="330" x2="350" y2="290" stroke="#3b82f6" stroke-width="2" marker-end="url(#ar)"/>
  <line x1="250" y1="200" x2="220" y2="160" stroke="#94a3b8" stroke-width="2" marker-end="url(#ar)"/>
  <line x1="450" y1="200" x2="480" y2="160" stroke="#94a3b8" stroke-width="2" marker-end="url(#ar)"/>

  <defs>
    <marker id="ar" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 Z" fill="#94a3b8"/>
    </marker>
  </defs>
</svg>
```

## Integration with the RAMS lifecycle

What makes TS 50701 unmistakably a *railway* document, rather than IEC 62443 with a new cover, is how it locks into **EN 50126-1** — the standard that defines the RAMS lifecycle: Reliability, Availability, Maintainability and Safety. Rather than run a separate, parallel cybersecurity process off to one side, TS 50701 embeds security into the same phases the railway already uses to specify, design, verify, accept and operate a system. ([Cylus](https://www.cylus.com/post/navigating-ts-50701-unpacking-the-impact-of-the-cybersecurity-standard-for-rail))

The point is not administrative tidiness. It is that a security decision made in isolation from the safety lifecycle is a security decision made blind. By threading through EN 50126, the specification forces security and safety engineers to reach the same design gates at the same time, looking at the same system.

| EN 50126 lifecycle phase | What happens for safety | What TS 50701 adds for security |
| --- | --- | --- |
| Concept | Define system purpose and context | Establish cybersecurity context, high-level assets and threat landscape |
| Risk analysis & evaluation | Hazard identification, safety risk assessment | Cybersecurity risk assessment; define zones, conduits, target security levels |
| Specification of requirements | Derive RAMS requirements | Derive cybersecurity requirements from target SLs and the threat model |
| Design & implementation | Build to safety requirements | Apply security controls; check they do not undermine safety functions |
| Manufacture / integration | Assemble and integrate | Verify component security requirements (IEC 62443-4-2 references) |
| Validation & acceptance | Demonstrate RAMS is met | Demonstrate security requirements are met; document residual risk |
| Operation & maintenance | Keep the system safe in service | Vulnerability management, patching, monitoring, incident response |
| Decommissioning | Retire safely | Secure disposal, key and data destruction, revocation |

> [!NOTE]
> Because TS 50701 can be applied to systems developed **inside or outside** the EN 50126-1 process, it is usable for legacy estates and greenfield builds alike. Older assets rarely followed the modern RAMS lifecycle to the letter, but the risk logic still applies.

## The safety–security interface

This is the part of TS 50701 that has no equivalent in generic OT security standards, and the reason a railway needs a railway specification.

In most industries, safety and security can be reasoned about in relative isolation. In rail they are entangled. A control introduced to improve security can degrade a safety function — add latency to a safety-critical message path, block a diagnostic channel a safety system depends on, or lock out an operator during an emergency. Conversely, a safety measure can open or close a security exposure — a "fail-safe" default that drops to a known state might be exactly the state an attacker wants to force.

TS 50701 gives this interface a formal home. It requires that cybersecurity work take into account relevant safety-related aspects, and it draws on established safety machinery — notably the **Common Safety Method for Risk Assessment (CSM-RA)**, the EU regulation that governs how significant changes to the railway system are risk-assessed — alongside security sources such as IEC 62443-3-3. ([Shieldworkz](https://shieldworkz.com/blogs/a-deep-dive-into-ts-50701-based-risk-and-security-assessment)) The specification's later editions go further, recommending **joint design reviews** so that safety and security engineers assess changes together rather than in sequence.

The contrast between the two disciplines is worth laying out plainly, because managing the interface means respecting where they differ.

| Concern | Safety (EN 5012x world) | Security (IEC 62443 world) |
| --- | --- | --- |
| Primary threat | Random failure, systematic fault, human error | Deliberate, adaptive adversary |
| Guiding question | Will it fail dangerously? | Can it be made to misbehave? |
| Timescale | Fixed once certified; stable for years | Threat landscape shifts continuously |
| Evidence | Safety case, hazard log, formal proof | Risk assessment, controls, monitoring, testing |
| Change | Tightly controlled, re-certified | Expected and frequent (patches, updates) |
| Failure mode | Move to a known safe state | Deny the adversary an objective |

> [!WARNING]
> The classic rail trap is treating a security patch like a routine IT update. In a safety-critical system, a change that alters timing or behaviour can invalidate the safety case. TS 50701's insistence on a managed safety–security interface exists precisely so that a well-intentioned security action does not quietly become a safety hazard.

```compare
The security instinct
- **Patch fast** — a known vulnerability is an open door; close it now
- Change is **expected and frequent**; the estate should be easy to update
- Success = the adversary is denied an objective
- The threat landscape **shifts weekly**; controls must keep pace
---
The rail-safety reality
- A patch can **alter timing or behaviour** and invalidate a certified safety case
- Change is **tightly controlled** and may require re-validation or re-certification
- Success = the system still **fails to a known safe state**
- The safety argument is **stable for years** by design
```

Neither instinct is wrong; the discipline TS 50701 imposes is to reconcile them deliberately, at a defined interface, rather than let one quietly override the other. A patch reaches a safety-critical zone only after a joint review has confirmed it does not disturb the safety case — and the fact that it *was* reviewed is itself part of the evidence.

```svg
<svg viewBox="0 0 700 380" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif">
  <rect width="700" height="380" fill="none"/>
  <text x="350" y="30" fill="#e5e7eb" font-size="18" font-weight="700" text-anchor="middle">Railway risk assessment — the TS 50701 flow</text>

  <!-- boxes -->
  <g>
    <rect x="30" y="70" width="150" height="60" rx="7" fill="none" stroke="#3b82f6" stroke-width="2"/>
    <text x="105" y="95" fill="#e5e7eb" font-size="12.5" font-weight="700" text-anchor="middle">Define system</text>
    <text x="105" y="113" fill="#94a3b8" font-size="11" text-anchor="middle">under consideration</text>
  </g>
  <g>
    <rect x="210" y="70" width="150" height="60" rx="7" fill="none" stroke="#3b82f6" stroke-width="2"/>
    <text x="285" y="95" fill="#e5e7eb" font-size="12.5" font-weight="700" text-anchor="middle">Partition into</text>
    <text x="285" y="113" fill="#94a3b8" font-size="11" text-anchor="middle">zones &amp; conduits</text>
  </g>
  <g>
    <rect x="390" y="70" width="150" height="60" rx="7" fill="none" stroke="#3b82f6" stroke-width="2"/>
    <text x="465" y="95" fill="#e5e7eb" font-size="12.5" font-weight="700" text-anchor="middle">Assess threats</text>
    <text x="465" y="113" fill="#94a3b8" font-size="11" text-anchor="middle">&amp; consequences</text>
  </g>
  <g>
    <rect x="390" y="180" width="150" height="60" rx="7" fill="none" stroke="#f97316" stroke-width="2"/>
    <text x="465" y="205" fill="#e5e7eb" font-size="12.5" font-weight="700" text-anchor="middle">Set target</text>
    <text x="465" y="223" fill="#94a3b8" font-size="11" text-anchor="middle">security levels</text>
  </g>
  <g>
    <rect x="210" y="180" width="150" height="60" rx="7" fill="none" stroke="#f97316" stroke-width="2"/>
    <text x="285" y="205" fill="#e5e7eb" font-size="12.5" font-weight="700" text-anchor="middle">Specify security</text>
    <text x="285" y="223" fill="#94a3b8" font-size="11" text-anchor="middle">requirements</text>
  </g>
  <g>
    <rect x="30" y="180" width="150" height="60" rx="7" fill="none" stroke="#f97316" stroke-width="2"/>
    <text x="105" y="205" fill="#e5e7eb" font-size="12.5" font-weight="700" text-anchor="middle">Verify &amp; document</text>
    <text x="105" y="223" fill="#94a3b8" font-size="11" text-anchor="middle">residual risk</text>
  </g>

  <!-- safety-security interface band -->
  <rect x="30" y="290" width="510" height="60" rx="7" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="6 4"/>
  <text x="285" y="315" fill="#e5e7eb" font-size="13" font-weight="700" text-anchor="middle">Safety–security interface (CSM-RA + IEC 62443-3-3)</text>
  <text x="285" y="335" fill="#94a3b8" font-size="11" text-anchor="middle">checked at every step: does a security control affect safety, or a safety measure affect security?</text>

  <!-- arrows across top -->
  <line x1="180" y1="100" x2="208" y2="100" stroke="#94a3b8" stroke-width="2" marker-end="url(#a2)"/>
  <line x1="360" y1="100" x2="388" y2="100" stroke="#94a3b8" stroke-width="2" marker-end="url(#a2)"/>
  <line x1="465" y1="130" x2="465" y2="178" stroke="#94a3b8" stroke-width="2" marker-end="url(#a2)"/>
  <line x1="390" y1="210" x2="362" y2="210" stroke="#94a3b8" stroke-width="2" marker-end="url(#a2)"/>
  <line x1="210" y1="210" x2="182" y2="210" stroke="#94a3b8" stroke-width="2" marker-end="url(#a2)"/>
  <!-- dashed link to interface band -->
  <line x1="285" y1="240" x2="285" y2="288" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 4"/>

  <defs>
    <marker id="a2" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 Z" fill="#94a3b8"/>
    </marker>
  </defs>
</svg>
```

## Zones, conduits and target security levels — the railway cut

At its core, TS 50701 runs the same risk-assessment logic as IEC 62443-3-2: identify the system under consideration, partition it into **zones** (groups of assets with a shared security need) connected by **conduits** (the controlled pathways between them), assess the threats and their consequences, determine a **target security level** for each zone, and specify the measures needed to reach it. ENISA has published dedicated guidance on applying zoning and conduits to railways, a sign of how central this step is to the sector. ([ENISA — Zoning and Conduits for Railways](https://www.enisa.europa.eu/publications/zoning-and-conduits-for-railways))

The railway adaptation shows up in *which* assets fall into *which* zones, and in how consequences are weighted by safety criticality. A signalling interlocking sits in a different world from a passenger Wi-Fi access point, and TS 50701's zoning reflects that. The illustrative pattern below is typical of how criticality drives target SLs.

| Zone (illustrative) | Example assets | Safety criticality | Typical target SL |
| --- | --- | --- | --- |
| Signalling & interlocking | Interlockings, object controllers, ETCS on-board/trackside | Safety-critical | SL-3 / SL-4 |
| Control-command & traffic management | TMS, dispatching, ATS | High operational | SL-2 / SL-3 |
| Rolling stock control | Train control units, on-board networks (TCN) | Safety-related | SL-2 / SL-3 |
| Operational support | SCADA for power, HVAC, tunnel systems | Operational | SL-2 |
| Passenger & non-vital | CCTV, passenger information, on-board Wi-Fi | Low / non-vital | SL-1 / SL-2 |

The output is what any good OT security assessment should produce: a structured, defensible model of where risk concentrates, what protection each zone needs, and where the current design falls short — expressed in the language of both the security standard and the railway lifecycle.

### A worked example: the trackside-to-on-board conduit

Consider one concrete pathway: the **radio conduit** carrying movement authorities between a trackside **ETCS/RBC** (radio block centre) and a train's on-board unit. It is the artery of modern signalling, and it crosses an open medium.

- **Zone and conduit.** The RBC and the on-board unit sit in **safety-critical** zones (target SL-3/SL-4); the radio link is the **conduit** between them. Everything about the conduit — who may speak on it, how messages are authenticated, what happens if it is jammed — is in scope.
- **Threats and consequences.** Message forgery, replay, and jamming are the classic ones. The *consequence* weighting is what makes this a railway problem: a forged or replayed movement authority is not a data-integrity nuisance, it is a potential collision. The consequence axis is scored in safety terms, not IT terms.
- **Which FRs bite.** FR 3 (integrity) and FR 1 (authentication) protect the authenticity of the movement authority; FR 7 (availability) addresses jamming and denial-of-service; FR 5 (restricted data flow) ensures nothing else can inject onto the conduit.
- **The safety–security interface.** A security control that adds latency to the authority message could itself create a hazard — a train braking because a valid authority arrived late is a safety event caused by a security measure. This is precisely the interface TS 50701 forces you to review jointly, not in sequence.

One conduit, and the zoning model, the seven FRs, the target-SL logic and the safety–security interface all come into play at once. That is the specification working as intended: the same asset, examined through the security lens and the safety lens together.

### Legacy estates and compensating controls

Rail runs assets for thirty, forty, sometimes fifty years. Much of the installed base predates any notion of authenticated commands or signed firmware, and cannot simply be patched to an SL-3 posture. TS 50701 does not pretend otherwise. Because its risk logic can be applied to systems built **outside** the modern EN 50126-1 process, it accommodates brownfield reality: where a legacy interlocking cannot meet a control directly, the assessment reaches for **compensating controls** — tighter zoning around the old asset, a hardened and monitored conduit, strict access control on the maintenance path, and enhanced detection so that an attempt on the weak component is at least seen. The target security level still names the goal; the compensating controls are the defensible, documented route toward it when the asset itself cannot change. This is the same pragmatic move OXOT applies across ageing OT estates, and it is why an accurate model of *what actually exists* matters more than an idealised design.

```cta
Signalling, rolling stock, fixed installations — can you show a defensible security level per zone?
NIS2 assessors expect the TS 50701 method now. We apply zones, conduits and target security levels to your rail estate, aligned to the safety case.
Assess my rail estate :: /en/contact
```

## Scope — what TS 50701 covers

TS 50701 addresses cybersecurity across the railway system broadly. Its formal scope spans four domains: **Communications; Signalling and Processing; Rolling Stock; and Fixed Installations.** ([iTeh](https://standards.iteh.ai/catalog/standards/clc/db257ea9-8ba0-4f4c-a791-df34a6030541/clc-ts-50701-2023)) In practice that reaches from the interlocking in a lineside cabinet to the control unit under a train, from the traffic-management system in an operations centre to the power-SCADA feeding the catenary.

It also speaks to the whole delivery ecosystem — mirroring the asset-owner / integrator / supplier structure of [IEC 62443](/en/iec-62443).

| Role | Who they are | What TS 50701 asks of them |
| --- | --- | --- |
| Railway operator / infrastructure manager | Owns and runs the estate and its operational risk | Set security policy, define the risk appetite, run the security management system, meet regulatory duties |
| System integrator | Assembles, commissions and validates rail systems | Perform the risk assessment, design zones and conduits, verify security requirements at system level |
| Product / component supplier | Builds the equipment (interlockings, on-board units, sensors) | Meet component security requirements, follow a secure development lifecycle, document capabilities |
| Safety-case owner | Accountable for the safety argument | Manage the safety–security interface so security work strengthens rather than complicates the safety case |

## The regulatory context — NIS2, CRA and the road to IEC 63452

TS 50701 does not exist in a vacuum, and its regulatory weight is growing.

Railway undertakings and infrastructure managers are, in most Member States, exactly the transport operators captured by **[NIS2](/en/nis2)** as *essential entities* — which means binding cybersecurity risk-management and incident-reporting obligations, backed by real enforcement. TS 50701 gives rail a sector-appropriate method for meeting those duties instead of improvising against a generic checklist. On the product side, the equipment going into rail systems increasingly falls under the **[CRA](/en/cra)** as products with digital elements, carrying secure-by-design and vulnerability-handling requirements across their lifecycle. TS 50701 is increasingly treated as the baseline that connects rail engineering practice to both regimes. ([Cervello](https://cervello.security/blog/regulations/what-is-rail-cybersecurity-compliance/))

The specification is also a stepping stone. TS 50701 was developed by CENELEC TC 9X/WG 26 and is now feeding into **IEC 63452**, the first *international* railway cybersecurity standard, expected to consolidate and globalise the approach TS 50701 pioneered in Europe. ([Alstom](https://www.alstom.com/press-releases-news/2024/3/towards-first-railway-cybersecurity-international-standard-why-standards-are-important-secure-railways)) Investing in TS 50701 today is not a dead end — it is the on-ramp to the standard the whole sector is converging on.

```timeline
July 2021 :: **CLC/TS 50701 first edition** — the world's first cybersecurity specification written specifically for railway applications.
August 2023 :: **CLC/TS 50701:2023 second edition** — the specification matures: refined risk process, MITRE ATT&CK for ICS referenced as a threat library, clearer safety–security interface guidance.
2024 onward :: **IEC 63452 in development** — CENELEC's rail cybersecurity work feeds the first international standard, globalising the TS 50701 approach.
Now :: **NIS2 + CRA in force** — rail operators (essential entities) and rail-equipment suppliers already carry binding duties that TS 50701 is the sector-appropriate way to meet.
```

> [!TIP]
> Do not wait for IEC 63452 before acting. The engineering it will standardise — zones and conduits, target security levels, the safety–security interface — is already defined in TS 50701 and already what NIS2 assessors expect to see. Work done to TS 50701 carries forward almost unchanged.

## What it means for your role

**If you are a railway operator or infrastructure manager,** TS 50701 gives you a sector-specific way to define and demonstrate cybersecurity across your estate, aligned to the RAMS lifecycle you already run and to your [NIS2](/en/nis2) obligations. It turns "are we secure?" from a matter of opinion into a matter of documented target security levels and verified controls.

**If you are a rail system integrator or supplier,** it gives you a shared reference for what "secure" means in rail — target security levels, component requirements grounded in [IEC 62443](/en/iec-62443), and a risk process your customers and their assessors already recognise. It shortens the argument at acceptance.

**If you own the safety case,** TS 50701 gives you a structured way to handle the safety–security interface so that cybersecurity reinforces your safety argument instead of quietly eroding it — with joint reviews and CSM-RA alignment rather than two teams talking past each other.

## How to start

1. **Map the system under consideration.** Inventory the assets, networks and conduits in scope — signalling, rolling stock, control-command, fixed installations. You cannot zone what you cannot see.
2. **Zone by criticality and consequence.** Group assets by security need, weighted by safety impact, and define the conduits between them.
3. **Run the risk assessment.** Assess threats and consequences, then set a target security level per zone using the IEC 62443-derived process.
4. **Check the safety–security interface.** For every proposed control, ask whether it touches a safety function — and run a joint review where it does.
5. **Specify, verify, document.** Derive requirements from the target SLs, verify them (including component-level checks against IEC 62443-4-2), and record residual risk against your NIS2 and safety obligations.

A [Cyber Digital Twin](/en/cyber-digital-twin) makes steps 1 through 5 durable: it holds the assets, zones, conduits, safety–security interfaces and security-level gaps as a living model rather than a one-off report that ages the moment it is signed.

## How OXOT helps

OXOT's method is built on [IEC 62443](/en/iec-62443) — the exact foundation TS 50701 extends — so our approach maps directly onto rail. Our **OT security assessments** apply the same zones-and-conduits and target-security-level logic that TS 50701 shares with IEC 62443, framed in railway terms and mindful of the safety lifecycle. Our **[Cyber Digital Twin](/en/cyber-digital-twin)** holds the resulting model — assets, zones, conduits, safety–security interfaces and security-level gaps — as a living structure that serves both the security programme and the safety case at once.

For rail operators facing [NIS2](/en/nis2) duties and suppliers facing the [CRA](/en/cra), that means a single, coherent way to understand risk, prioritise investment, and stay ready for the coming IEC 63452 baseline — across a complex, safety-critical estate. See our wider view of the standards landscape on the [Frameworks](/en/frameworks) page.

## Frequently asked questions

**Is TS 50701 a standard or a specification?**
It is a CENELEC **Technical Specification** (CLC/TS), a rung below a full harmonised European Norm. Its concepts are now feeding into the international standard **IEC 63452**, which is expected to become the global rail cybersecurity reference.

**Do we still need IEC 62443 if we use TS 50701?**
Yes, and in a good way. TS 50701 is built on IEC 62443 and points back to it — especially Parts 3-2 and 3-3 for the risk process and 4-2 for components. Understanding IEC 62443 makes TS 50701 far easier to apply, and the two bodies of work reinforce each other.

**How does it relate to the EN 5012x safety standards?**
TS 50701 integrates with the **EN 50126-1** RAMS lifecycle and manages the safety–security interface, drawing on safety methods such as CSM-RA. It sits alongside the railway safety standards, not in place of them.

**What exactly does TS 50701 cover?**
Four domains: Communications; Signalling and Processing; Rolling Stock; and Fixed Installations. It can be applied to systems built inside or outside the EN 50126-1 process, so it works for both legacy and new assets.

**Does NIS2 apply to us as a railway?**
Very likely. Rail transport is an essential-entity sector under NIS2 in most Member States. TS 50701 is the sector-appropriate method for meeting those obligations — confirm the specifics in your national transposition law.

**What about IEC 63452 — should we wait for it?**
No. IEC 63452 builds on the same engineering TS 50701 already defines. Work done to TS 50701 will carry forward, so the pragmatic move is to start now.

**Can we apply TS 50701 to a decades-old signalling estate?**
Yes. Its risk logic applies to systems built inside or outside the modern EN 50126-1 process. Where a legacy asset cannot meet a control directly, the assessment uses **compensating controls** — tighter zoning, hardened and monitored conduits, strict maintenance-access control, enhanced detection — with the target security level still naming the goal. Brownfield is the norm in rail, and the specification is built for it.

**How do the seven foundational requirements apply to rail?**
They are the IEC 62443-3-3 headings — identification/authentication, use control, system integrity, data confidentiality, restricted data flow, timely response, resource availability — read against railway assets. Integrity and authentication protect signalling logic and movement authorities; restricted data flow is the zone/conduit boundary between passenger and signalling networks; resource availability makes the RAMS "A" a security target.

**Who has to do what — operator, integrator, supplier?**
Mirroring IEC 62443: the operator/infrastructure manager sets policy and runs the security management system; the integrator performs the risk assessment and designs zones and conduits; the component supplier meets component security requirements and follows a secure development lifecycle. The safety-case owner manages the interface so security strengthens the safety argument.

## Sources

- CLC/TS 50701:2023 — railway applications cybersecurity — [iTeh Standards](https://standards.iteh.ai/catalog/standards/clc/db257ea9-8ba0-4f4c-a791-df34a6030541/clc-ts-50701-2023)
- Hands-on CLC/TS 50701 (railway cybersecurity), Christian Schlehuber — [ENISA / CENELEC](https://www.enisa.europa.eu/sites/default/files/all_files/05-standards-02-cenelec-christian-schlehuber.pdf)
- Zoning and Conduits for Railways — [ENISA](https://www.enisa.europa.eu/publications/zoning-and-conduits-for-railways)
- A deep dive into CENELEC TS 50701 — [Shieldworkz](https://shieldworkz.com/blogs/a-deep-dive-into-cenelec-ts-50701-for-railway-cybersecurity)
- A deep dive into TS 50701-based risk and security assessment — [Shieldworkz](https://shieldworkz.com/blogs/a-deep-dive-into-ts-50701-based-risk-and-security-assessment)
- Navigating TS 50701 — [Cylus](https://www.cylus.com/post/navigating-ts-50701-unpacking-the-impact-of-the-cybersecurity-standard-for-rail)
- What is rail cybersecurity compliance? — [Cervello](https://cervello.security/blog/regulations/what-is-rail-cybersecurity-compliance/)
- Towards the first railway cybersecurity international standard (IEC 63452) — [Alstom](https://www.alstom.com/press-releases-news/2024/3/towards-first-railway-cybersecurity-international-standard-why-standards-are-important-secure-railways)

*This page is general educational information. Refer to the official CENELEC CLC/TS 50701 (and the forthcoming EN / IEC 63452) documents for authoritative requirements.*
