---
title: Architecture & Segmentation
meta_title: OT Architecture & Network Segmentation | OXOT
meta_description: Secure OT network architecture — zones, conduits and practical segmentation aligned to IEC 62443, designed to reduce blast radius without breaking production.
excerpt: Define secure OT network architectures — zones, conduits and practical segmentation patterns aligned to IEC 62443, designed for operations that cannot stop.
content_type: page
published: true
---

Flat OT networks turn a single foothold into a plant-wide incident. OXOT designs OT network architectures that contain that blast radius — zones and conduits aligned to IEC 62443 — while respecting the reality that you cannot simply re-cable a running plant.

We start from your actual traffic and data flows, define a target architecture you can migrate to in phases, and validate every step against operations so segmentation improves security without interrupting production.

```keyfacts
Standard :: IEC 62443-3-2 (zones and conduits) and 3-3 (system security requirements)
Unit of design :: zones and conduits, not flat VLANs
Approach :: segment without breaking production — phased migration
Includes :: DMZ design, data flows, remote access conduits, firewall baselines
Deliverable :: target reference architecture + a phased migration plan
Validation :: designed and checked against real observed traffic
```

## The flat-network problem

Most OT networks were built for reliability, not containment. Devices talk to whatever they need to, on networks that were never designed with a security perimeter in mind. That worked when OT was isolated. It became a problem the moment remote access, IT/OT integration and connected supply chains arrived.

The consequence is a network where a single compromised vendor laptop, a poorly authenticated remote session, or a lateral-moving piece of malware can reach a safety controller with nothing in between. The attack surface is the entire plant.

```compare
A flat OT network
- One compromise reaches everything — no containment
- No way to enforce what can talk to what, or when
- Remote access and IT connectivity share the same broadcast domain as PLCs
- "Security" means perimeter — once inside, it is open
- Every incident response starts with "we don't know what it touched"
---
A segmented OT architecture
- Zones contain a compromise — blast radius limited to a defined boundary
- Conduits make every cross-zone communication explicit and controllable
- Remote access enters through a controlled DMZ, not directly into the process network
- Defence in depth — multiple layers mean a single failure is not a plant-wide failure
- Incident response starts from a map, not a mystery
```

## What you get

```cards
Zone & conduit model :: :: Your environment expressed as IEC 62443 zones and conduits — assets grouped by risk and function, trust boundaries made explicit, and every cross-boundary communication flow identified.
Target reference architecture :: :: A concrete to-be design: DMZ placement, data diodes where warranted, controlled data flows between zones, and the firewall and filtering logic that enforces the conduit rules.
Segmentation migration plan :: :: A phased path from your current flat topology to the target architecture — staged so operations never stop. Each phase is sized to what your team can absorb in a maintenance window.
Firewall & conduit rule baselines :: :: The rule-sets and change patterns your team needs to maintain the segmented architecture over time. Not a snapshot — a repeatable, auditable baseline they own.
DMZ & remote access design :: :: How external connectivity — vendor access, IT/OT integration, historian replication — enters the OT environment through a controlled conduit rather than directly into the process network.
Architecture documentation :: :: A documented architecture your team can use for onboarding, incident response and regulatory review — not a diagram that lives in one consultant's laptop.
```

## How we deliver it

```timeline
1. Traffic & flow mapping :: Capture the real communication patterns across your OT environment — using passive observation, existing documentation and interviews with the engineers who maintain it. The design must match what is actually running, not what the old diagram says.
2. Zone definition :: Group assets by risk tolerance and function. Safety-critical controllers, process control systems, engineering workstations, historian servers and IT-facing systems each belong in zones defined by their security level target and their operational role.
3. Conduit design :: For every cross-zone communication need, define the conduit: what can flow, in which direction, at what times, and what controls enforce it. Make implicit communication explicit — and make unnecessary communication disappear.
4. Target architecture :: Produce the reference architecture: zone layout, DMZ design, conduit rule-sets, data diode placement, and remote access ingress. Validated against the traffic map to confirm nothing operationally necessary is blocked.
5. Phased migration plan :: Sequence the move from current to target around maintenance windows, operational constraints and available resource. No phase should require a production stoppage that wasn't already planned.
6. Verification :: After each migration phase, verify that segmentation holds against real traffic and confirm that nothing operational broke. Security and operational continuity are both success criteria.
```

## Framework alignment

| Framework | What this service addresses |
|---|---|
| **IEC 62443-3-2** | Zone and conduit design is the core methodology of 62443-3-2 — defining security zones, assigning target security levels, and specifying conduit requirements |
| **IEC 62443-3-3** | System security requirements SR 5.1–5.4 (network and communication security) and the security levels that conduit controls must achieve |
| **NIS2 Art. 21(2)(b)** | Incident handling — effective incident response requires contained zones; a flat network makes both detection and containment harder |
| **NIS2 Art. 21(2)(h)** | Network security — segmentation and conduit control are the practical expression of NIS2's network security requirements for OT environments |
| **NIS2 Art. 21(2)(d)** | Supply-chain security — controlled conduits for vendor and OEM connectivity directly address third-party access risk |
| **Cyber Resilience Act** | For connected OT products, the architecture determines what a compromised product can reach — segmentation limits the consequence of a product-level vulnerability |

## How it connects

Architecture work follows naturally from an **[assessment](/ot-security-assessments)** — the assessment identifies where segmentation is absent or inadequate; architecture design defines what it should be. The **[Cyber Digital Twin](/cyber-digital-twin)** holds the architecture model and keeps it current as the estate changes: every conduit, every zone boundary, every change is reflected in the twin, not in a diagram that ages.

**[Secure Remote Access](/secure-remote-access)** is the natural companion: the secure remote access broker sits at a controlled conduit between an external-access DMZ and the process network. You design the conduit here and enforce the access controls there. Together they close the two most common attack paths into OT — lateral movement from a flat internal network, and uncontrolled external connectivity.

The architecture also provides the structural basis for the **[OT Security Baseline](/ot-security-baseline)**: once zones are defined, you can define which controls apply in which zone, and at what security level — which is how a baseline becomes realistic rather than generic.

```cta
Contain the blast radius
Design an OT architecture that limits how far an incident can spread — without stopping production.
Talk to an OT security expert :: /contact
```
