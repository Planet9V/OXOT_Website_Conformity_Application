---
title: IEC 62443 for Industrial Security
meta_title: IEC 62443 Explained — Zones, Security Levels, Component Security & the Security Programme | OXOT
meta_description: A practical, in-depth guide to the ISA/IEC 62443 series — the four document groups, zones and conduits, security levels SL 1–4 (SL-T/C/A), the seven foundational requirements, maturity and the Security Protection Rating, the asset-owner/integrator/supplier roles, plus deep sections on component security (62443-4-1 secure development & 62443-4-2 component requirements) and the IACS security programme (62443-2-1 & 2-4) — and how it underpins NIS2 and the CRA.
excerpt: The international standard for securing industrial automation and control systems — concepts, structure, component security, the security programme, and how to use it in practice.
content_type: page
published: true
---

If the European regulations tell you *what* cybersecurity outcomes to achieve, **IEC 62443 tells you how to actually build and operate secure industrial systems.** It is the international series of standards for the security of Industrial Automation and Control Systems (IACS), developed jointly by the IEC and ISA, and it has become the common language of OT security — the reference that operators, integrators and product vendors can all point to.

For an industrial organisation trying to make sense of NIS2, the CRA and their own risk, IEC 62443 is the engineering backbone. It is not a law and it is not mandatory in itself, but it is the most widely recognised, defensible method for demonstrating that your security measures are appropriate, proportionate and complete. Two ideas make it durable rather than merely fashionable: it treats security as a *shared responsibility* across the whole supply chain, and it insists that a control is only as good as the process that sustains it.

## The short version

- IEC 62443 is a **series of standards** for the cybersecurity of industrial automation and control systems, structured across **four groups**: General, Policies & Procedures, System, and Component.
- Its central design concept is **zones and conduits** — grouping assets by shared security requirements and controlling the communication paths between them.
- It defines **Security Levels (SL 1–4)**, from protection against casual or accidental misuse (SL 1) up to protection against sophisticated, well-resourced attackers such as nation-states (SL 4), and it separates the *target*, *capability* and *achieved* level (SL-T / SL-C / SL-A).
- It rests on **seven foundational requirements** that every control-system security measure maps back to.
- It assigns clear responsibilities to three roles: the **asset owner** (the operator), the **system integrator**, and the **product supplier**.
- It goes deep on two things this page treats at length — **component security** (`62443-4-1` secure development, `62443-4-2` component requirements) and the **security programme** (`62443-2-1` for asset owners, `62443-2-4` for service providers).
- It aligns tightly with **[NIS2](/en/nis2)** and the **[CRA](/en/cra)**, giving you an engineering method to satisfy both.

> [!NOTE]
> Throughout this page we use the joint designation **ISA/IEC 62443**. ISA (the International Society of Automation) develops the standards through its ISA99 committee; the IEC publishes them internationally. They are the same documents.

## Who IEC 62443 is for

The genius of the series is that it addresses the whole ecosystem, and it is explicit about who is responsible for what. Security in an industrial plant is never one party's job — it is a chain, and IEC 62443 names every link.

| Role | Who it is | What they own | Primary parts of 62443 |
| --- | --- | --- | --- |
| **Asset owner** | The operator — utility, plant, or infrastructure owner | The risk, the operational requirements, and the running security programme | `2-1`, `3-2`, `3-3` |
| **System integrator** | Designs, assembles and commissions the automation solution | Turning components into a secured, working system to a target security level | `2-4`, `3-2`, `3-3` |
| **Product supplier** | Develops the individual products — controllers, gateways, software, devices | Secure development and demonstrable component capability | `4-1`, `4-2` |
| **Maintenance / service provider** | Configures, patches and supports the solution over its life | Sustaining security during operations and maintenance | `2-4` |

Security only works when each part plays its role, and the series is deliberately structured so that everyone knows their obligations and can hold the others to account. An asset owner can require an integrator to build to a target security level; an integrator can require components that meet a component security level; a product supplier can demonstrate secure development. The paperwork of one party becomes the assurance of the next.

## The structure: four groups of documents

The series is organised into four groups, each addressing a different layer. The two-digit numbering (`x-y`) reads as *group–part*.

| Group | Theme | Key parts | What it covers |
| --- | --- | --- | --- |
| **1 — General** | Concepts & terminology | `1-1` | Concepts, terminology and the models the rest of the series builds on |
| **2 — Policies & Procedures** | The programme | `2-1`, `2-4` | Establishing/operating a security programme (asset owner) and requirements for service providers |
| **3 — System** | System engineering | `3-2`, `3-3` | Risk assessment, zones & conduits, and system-level security requirements and levels |
| **4 — Component** | Product | `4-1`, `4-2` | Secure product development lifecycle and technical requirements for individual components |

A few parts carry most of the practical weight:

- **`62443-1-1`** — terminology, concepts and models. The vocabulary everything else uses.
- **`62443-2-1`** — security programme requirements for **IACS asset owners** (the operator's Cybersecurity Management System). ([ISA](https://www.isa.org/products/ansi-isa-62443-2-1-2024-security-industrial-automa))
- **`62443-2-4`** — security programme requirements for **IACS service providers** — integrators and maintenance contractors. ([IEC](https://webstore.iec.ch/en/publication/67631))
- **`62443-3-2`** — **security risk assessment for system design**: how you define zones, conduits and target security levels.
- **`62443-3-3`** — **system security requirements and security levels**: the detailed technical requirements a system must meet. ([Cisco](https://www.cisco.com/c/en/us/products/collateral/security/isaiec-62443-3-3-wp.html))
- **`62443-4-1`** — **secure product development lifecycle**: what a supplier must *do* to develop secure products. ([Dragos](https://www.dragos.com/blog/isa-iec-62443-concepts))
- **`62443-4-2`** — **technical security requirements for components**: what a product must *be able to do*.

The parts interlock. The 62443-4-2 component requirements are derived directly from the 62443-3-3 system requirements, so a system assembled from compliant components has a genuine head start on system-level compliance — a design property we return to in the component-security section below.

## Zones and conduits — the core idea

The defining concept of IEC 62443 is **segmentation by security requirement.** A **zone** is a grouping of assets — systems and components — that share common security requirements based on their function, logical relationship and physical location. A **conduit** is a logical or physical grouping of the communication channels that connect zones and that share common security requirements.

The power of the model is that it forces you to reason about *where risk crosses boundaries*. Instead of trying to secure every device identically, you divide the environment into zones and then control and monitor the conduits between them. Security effort concentrates where it matters most — at the boundaries — and the highest-consequence functions can be placed in the most protected zones. This is the practical answer to the OT segmentation problem, and it is the method behind good IT/OT separation. ([Zone & conduit design guide](https://www.cagripolat.com/iec62443/en/iec-62443-zone-conduit-design-ot-practical-guide))

A reference architecture makes it concrete. Reading from the plant floor upward, the most safety-critical functions sit deepest, and every crossing between zones passes through a controlled conduit.

```svg
<svg viewBox="0 0 700 420" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif">
  <rect width="700" height="420" fill="none"/>
  <text x="350" y="26" fill="#e5e7eb" font-size="17" font-weight="bold" text-anchor="middle">Zones &amp; Conduits — reference architecture</text>

  <!-- Enterprise / IT -->
  <rect x="120" y="44" width="460" height="46" rx="6" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="350" y="72" fill="#e5e7eb" font-size="13" text-anchor="middle">Enterprise / IT zone  (ERP, business network)</text>

  <!-- conduit -->
  <line x1="350" y1="90" x2="350" y2="110" stroke="#f97316" stroke-width="3"/>
  <text x="470" y="105" fill="#f97316" font-size="11" text-anchor="start">conduit (firewall)</text>

  <!-- DMZ -->
  <rect x="120" y="110" width="460" height="46" rx="6" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <text x="350" y="138" fill="#e5e7eb" font-size="13" text-anchor="middle">OT/IT DMZ  (jump host, patch &amp; AV proxy, historian replica)</text>

  <line x1="350" y1="156" x2="350" y2="176" stroke="#f97316" stroke-width="3"/>
  <text x="470" y="171" fill="#f97316" font-size="11" text-anchor="start">conduit (broker only)</text>

  <!-- Supervisory -->
  <rect x="120" y="176" width="460" height="46" rx="6" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="350" y="204" fill="#e5e7eb" font-size="13" text-anchor="middle">Supervisory zone  (SCADA servers, engineering workstations)</text>

  <line x1="350" y1="222" x2="350" y2="242" stroke="#f97316" stroke-width="3"/>

  <!-- Control -->
  <rect x="120" y="242" width="460" height="46" rx="6" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="350" y="270" fill="#e5e7eb" font-size="13" text-anchor="middle">Control zone  (PLCs, RTUs, HMIs)</text>

  <line x1="350" y1="288" x2="350" y2="308" stroke="#f97316" stroke-width="3"/>
  <text x="470" y="303" fill="#f97316" font-size="11" text-anchor="start">conduit (one-way / strict)</text>

  <!-- Safety -->
  <rect x="120" y="308" width="460" height="52" rx="6" fill="none" stroke="#3b82f6" stroke-width="2.5"/>
  <text x="350" y="332" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">Safety zone  (SIS — highest SL-T)</text>
  <text x="350" y="350" fill="#94a3b8" font-size="11" text-anchor="middle">deepest / most protected</text>

  <!-- side arrow -->
  <text x="60" y="200" fill="#94a3b8" font-size="11" text-anchor="middle" transform="rotate(-90 60 200)">rising consequence · rising target SL</text>
</svg>
```

> [!TIP]
> Draw zones by *consequence of compromise*, not by network topology or vendor boundaries. Two devices on the same VLAN can belong to different zones if the impact of compromising them differs. The zone diagram is a risk artefact first and a network diagram second.

## Security Levels

IEC 62443 does not pretend that every system needs nation-state-grade defences. It defines four **Security Levels** that express *how strong* the protection of a zone or conduit needs to be, calibrated to the threat you are defending against.

| Level | Defends against | Attacker profile |
| --- | --- | --- |
| **SL 1** | Casual or coincidental violation | No specific intent — accidents, mistakes, curious insiders |
| **SL 2** | Intentional violation using **simple means** | Low resources, generic skills, low motivation |
| **SL 3** | Intentional violation using **sophisticated means** | Moderate resources, IACS-specific skills, moderate motivation |
| **SL 4** | Intentional violation using sophisticated means with **extended resources** | High resources, IACS-specific skills, high motivation — the nation-state tier |

Security levels come in three flavours that keep the conversation honest — and confusing them is one of the most common mistakes in practice.

| Variant | Name | Question it answers | Who sets it |
| --- | --- | --- | --- |
| **SL-T** | Target | What level does this zone *need*, given the risk? | Asset owner (via `3-2` risk assessment) |
| **SL-C** | Capability | What level *can* this component or system deliver when correctly configured? | Product supplier / integrator |
| **SL-A** | Achieved | What level is *actually* in place once deployed and operated? | Measured in the field |

The gap between **SL-T** and **SL-A** is your remediation backlog, expressed in a way an engineer and an auditor can both understand. A component with **SL-C 3** installed in a zone whose **SL-T** is 3 but configured carelessly may only achieve **SL-A 1** — capability is a ceiling, not a guarantee.

## The seven foundational requirements

Every requirement in the series maps back to one of **seven foundational requirements (FRs)** — a compact mental model for what "secure" means in a control system. Each FR is then decomposed into system requirements (in `3-3`) and component requirements (in `4-2`), each of which is enhanced as the security level rises.

| FR | Name | What it means | Everyday example |
| --- | --- | --- | --- |
| **FR 1** | Identification & Authentication Control (IAC) | Know who and what is acting | Unique accounts, no shared logins, MFA for remote access |
| **FR 2** | Use Control (UC) | Enforce the privileges each identity may exercise | Role-based access; least privilege on engineering functions |
| **FR 3** | System Integrity (SI) | Protect systems and data against unauthorised change | Signed firmware, malware protection, secure boot |
| **FR 4** | Data Confidentiality (DC) | Protect information from unauthorised disclosure | Encryption of sensitive configuration and process data |
| **FR 5** | Restricted Data Flow (RDF) | Segment and control information flow | Zones and conduits; deny-by-default at boundaries |
| **FR 6** | Timely Response to Events (TRE) | Detect, log and respond to security events | Central logging, monitoring, alerting on anomalies |
| **FR 7** | Resource Availability (RA) | Protect against denial of service; keep essential functions running | DoS protection, redundancy, resource limits |

The ordering is instructive: availability sits at the end not because it is least important, but because in OT it is often the *outcome* the other requirements exist to protect. FR 5 is worth a second look — it is the zones-and-conduits principle expressed as a requirement, which is why segmentation is not optional decoration but a foundational control.

## How Security Levels stack — the cumulative CR/RE model

The seven foundational requirements are not abstract goals; each one decomposes into concrete, testable **Component Requirements (CRs)** in `62443-4-2` and **System Requirements (SRs)** in `62443-3-3`. What turns those requirements into a *level* is the way they stack. Each CR/SR has a base specification at SL 1, and rising through the levels adds **Requirement Enhancements (REs)** on top — so the model is strictly **cumulative: SL 3 ⊇ SL 2 ⊇ SL 1.** Achieving SL 3 does not mean meeting a different set of controls; it means meeting the SL 2 set *plus* the additional enhancements that defeat a more capable attacker.

That structure has a consequence people routinely get wrong. **`62443-4-2` only defines SL-C — the capability of a component.** It explicitly places SL-T (the target a zone needs) and SL-A (what a zone actually achieves in the field) outside its scope; those live in `62443-3-2` (risk-derived target) and `62443-3-3` plus operational assessment (achieved). A zone's risk is only genuinely managed when **SL-A ≥ SL-T** — and SL-A can legitimately exceed a component's SL-C when compensating controls (firewalls, IDPS, restrictive conduits) carry the difference.

| FR | Governs | What SL-2 typically requires | What SL-3 adds (the REs) |
| --- | --- | --- | --- |
| FR 1 (IAC) | Who/what is acting | Unique accounts, RBAC, PKI | MFA, per-user access control, hardware authenticators |
| FR 3 (SI) | Integrity of code & data | TLS, code-signing, error handling | Hardware root of trust, secure boot |
| FR 4 (DC) | Confidentiality | AES-128+ in transit, secure deletion | Encryption at rest, hardware key management |
| FR 5 (RDF) | Segmentation | Logical segmentation, firewall ACLs | Physical segmentation, deep-packet inspection of OT protocols |
| FR 6 (TRE) | Detection & response | Accessible audit logs, real-time detection | SIEM export, anomaly detection, tamper-evident logs |
| FR 7 (RA) | Availability | Basic DoS protection, resource limits | Application-layer DoS resistance, graceful degradation |

## A worked example — a four-zone OT product

Security Levels earn their keep when a real system has *different* risk in different places. Take a representative OT product decomposed into four zones after a `62443-3-2` risk assessment:

| Zone | Target (SL-T) | Threat profile it must resist |
| --- | --- | --- |
| Zone 1 — control core | ≥ 3 | Sophisticated, IACS-specific attackers |
| Zone 2 — supervisory | ≥ 3 | Sophisticated, IACS-specific attackers |
| Zone 3 — auxiliary/HMI | ≥ 2 | Low-skill, generic tooling |
| Zone 4 — safety/critical | ≥ 4 | State-level, extended resources |

The point is not that everything must reach SL 4. It is that the risk assessment *justifies* pouring SL-4-grade effort into Zone 4 while accepting SL-2 for Zone 3 — because Zone 3's threat profile does not warrant defences against a nation-state. This is proportionality made concrete: you engineer to the risk each zone actually carries, and you can defend every decision with the `3-2` assessment that produced the SL-T values. It is also exactly the reasoning the [Cyber Resilience Act](/en/cra) demands under its "where applicable" test.

## Mapping IEC 62443 to the CRA — control by control

This is where the standard stops being "good practice" and becomes a compliance instrument. Most in-scope OT manufacturers already hold `62443` certifications, and the CENELEC work on **EN IEC 62443-4-2/A11:2026** maps its component requirements directly onto the [CRA](/en/cra)'s Annex I, Part I essential requirements. The correspondence is close enough to use as an engineering bridge today:

| CRA Annex I requirement | Primary 62443 FR | What SL-2 provides | What SL-3 adds |
| --- | --- | --- | --- |
| Protection from unauthorised access | FR 1 (IAC), FR 2 (UC) | Unique accounts, RBAC, PKI | MFA, per-user ACLs, hardware authenticators |
| Confidentiality of data | FR 4 (DC) | AES-128+ in transit, secure deletion | At-rest encryption, hardware key management |
| Integrity of data and programs | FR 3 (SI) | TLS, code-signing | Hardware root of trust, secure boot |
| Minimisation of data / attack surface | FR 5 (RDF), FR 3 (SI) | Zone boundary filtering, least functionality | Physical segmentation, deny-by-default |
| Availability of essential functions | FR 7 (RA) | Basic DoS protection | App-layer DoS resistance, graceful degradation |
| Security event logging | FR 6 (TRE) | Accessible audit logs, real-time detection | SIEM export, anomaly detection, tamper-evident logs |

The practical upshot: a component certified to **SL-C 2** satisfies FR 1–7 at SL-2 depth, and — where the risk assessment shows that depth is appropriate for the zone — that becomes a defensible CRA baseline, with the SL-3 enhancements documented as "not applicable" under CRA Article 13(4). A `62443-4-2` certificate is powerful evidence in a CRA technical file, even though it is not, on its own, a CRA conformity certificate.

## Compensating controls and the SL-A vs SL-C trap

The most consequential mistake in translating `62443` to a product-level obligation is assuming component capability equals delivered security. It does not — and under the CRA the gap becomes a legal exposure.

| Situation | Consequence for a CRA technical file |
| --- | --- |
| Component SL-C 2, zone SL-T 2 | ✅ SL-2 specifications are the correct baseline |
| Component SL-C 2, zone SL-T 3, compensating controls raise SL-A to 3 | ⚠️ Must document *how* the compensating controls achieve SL-A 3 |
| Component SL-C 2, zone SL-T 3, no compensating controls documented | ❌ Product-level assessment fails — non-conformity |

The lesson generalises well beyond compliance: a zone is only as secure as its *achieved* level, and achieved level is a property of the whole architecture — components, configuration, conduits and monitoring together — not of any single certificate. This is why OXOT assesses the integrated posture, not just the component data sheets.

```cta
Is your installed security level (SL-A) actually meeting your target (SL-T)?
The SL-A vs SL-C gap is exactly where audits fail and incidents start. We turn it into a prioritized, evidence-backed remediation backlog you can defend.
Assess my SL gap :: /en/contact
```

## Maturity levels and the Security Protection Rating

Having a control is not the same as operating it well. Alongside security levels, the series uses **maturity levels** for *processes*, drawn from familiar capability-maturity thinking. ([Overcyte](https://www.overcyte.com/frameworks/isa-iec-62443))

| Maturity level | Name | Meaning |
| --- | --- | --- |
| **ML 1** | Initial | The process is performed, but ad hoc and reliant on individuals |
| **ML 2** | Managed | The process is documented and repeatable |
| **ML 3** | Defined (Practiced) | The process is established and consistently applied across the organisation |
| **ML 4** | Improving | The process is measured and continuously improved |

The **Security Protection Rating (SPR)** combines the security level achieved with the maturity of the processes that sustain it. A high security level held together by heroics and undocumented tribal knowledge is fragile; maturity is what makes protection durable. This is the same reason `62443-4-1` grades a supplier's *development processes* by maturity, and why `62443-2-1:2024` introduced a maturity model for the asset owner's programme — the series consistently asks not only "is the control present?" but "will it still be present, correctly, next year?"

---

## Component security — the deep dive

Component security is where IEC 62443 does something no regulation does: it defines, in engineering terms, both **how a secure product is built** (`62443-4-1`) and **what a secure product must be able to do** (`62443-4-2`). For asset owners this is the leverage point in procurement; for suppliers it is increasingly the price of market access under the CRA. We treat it in depth because it is where the standard turns "buy secure equipment" into a checkable specification.

### 62443-4-1 — the secure product development lifecycle

`62443-4-1` sets out the **secure development lifecycle (SDL)** a product supplier must follow. It does not describe a single audit at the end; it describes the *processes* that run from concept to end-of-life, and it grades those processes by maturity. The standard organises them into **eight practices** with 47 top-level requirements (and hundreds of sub-requirements). ([jtsec practices summary](https://jtsec.es/files/IEC%2062443-4-1%20Practices%20&%20Requirementes.pdf))

| # | Practice | Code | What it requires |
| --- | --- | --- | --- |
| 1 | **Security Management** | SM | Governance, roles, accountability and resources for secure development across the organisation |
| 2 | **Specification of Security Requirements** | SR | Security requirements derived from a documented threat model and traced through development |
| 3 | **Secure by Design** | SD | Defence-in-depth, least privilege and secure design principles built into the architecture |
| 4 | **Secure Implementation** | SI | Secure coding standards and review to prevent vulnerabilities being introduced |
| 5 | **Security Verification & Validation Testing** | SVV | Security testing — functional, vulnerability, penetration and robustness testing — before release |
| 6 | **Management of Security-Related Issues** | DM | Receiving, triaging, tracking and resolving reported defects and vulnerabilities |
| 7 | **Security Update Management** | SUM | Qualifying, documenting and delivering security patches in a timely way, including third-party components |
| 8 | **Security Guidelines** | SG | Documentation that tells the integrator and operator how to deploy, harden and decommission the product securely |

Read as a lifecycle, these practices answer the questions an asset owner should be asking a vendor:

- **Threat modelling (SR).** Are security requirements derived from an actual threat model — and is that model kept current as the design evolves, rather than done once and filed? ([cytal](https://cytal.co.uk/blog/iec-62443-4-1-explained-secure-development-lifecycle-requirements/))
- **Secure design and implementation (SD, SI).** Is defence-in-depth designed in, and are secure coding standards enforced and reviewed?
- **Verification and validation (SVV).** Is the product security-tested — including robustness and penetration testing — before it ships, with evidence?
- **Defect and vulnerability management (DM).** Is there a real process to receive vulnerability reports, triage them, and coordinate disclosure — not just a mailbox nobody reads?
- **Patch management (SUM).** Are security updates qualified, documented and delivered promptly, including for embedded third-party libraries?
- **Product end-of-life (SG).** Does the guidance say when support ends and how to decommission securely — so an operator is not left running an abandoned product on a critical process?

> [!IMPORTANT]
> `62443-4-1` is about **process maturity**, not a single test. A supplier's SDL can be independently assessed — for example under the ISASecure **SDLA (Secure Development Lifecycle Assurance)** programme — and rated ML 1–4. Ask vendors for the assessment, not just the marketing claim. ([ISASecure CSA](https://isasecure.org/certification/iec-62443-csa-certification))

### 62443-4-2 — technical requirements by component type

Where `4-1` is about the *maker*, `62443-4-2` is about the *product*. It specifies **Component Requirements (CRs)** that a device or application must be able to satisfy, organised under the same seven foundational requirements and scaled across SL 1–4. Requirements are split by component type, because a PLC and a SCADA server cannot reasonably meet identical technical controls. ([Keyfactor](https://www.keyfactor.com/blog/iec-62443-4-2-technical-security-requirements-for-iacs-components/))

| Code | Component type | Definition | Typical examples |
| --- | --- | --- | --- |
| **EDR** | Embedded Device Requirement | Special-purpose device running embedded software, usually with a limited OS | PLCs, RTUs, IEDs, IIoT sensors |
| **HDR** | Host Device Requirement | General-purpose device running a full OS | Engineering workstations, HMIs, servers |
| **NDR** | Network Device Requirement | Device that transports, routes or controls network traffic | Firewalls, switches, routers, gateways |
| **SAR** | Software Application Requirement | Software running on a host, providing IACS functions | SCADA, MES, historian, engineering software |

Every component type is measured against the seven FRs, and each requirement gains **requirement enhancements (REs)** as the security level rises — so, for example, authentication that is acceptable at SL 1 must become stronger and harder to bypass to satisfy SL 3. ([INCIBE](https://www.incibe.es/en/incibe-cert/blog/iec-62443-4-2-need-secure-components))

The critical design property is **derivation**: the component requirements in `4-2` are drawn directly from the system requirements in `3-3`. That is what lets the roles collaborate cleanly — the asset owner sets a target SL for a zone, the integrator builds the zone to `3-3`, and the components inside it carry `4-2` capability that rolls up to support the system claim.

```svg
<svg viewBox="0 0 700 340" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif">
  <rect width="700" height="340" fill="none"/>
  <text x="350" y="28" fill="#e5e7eb" font-size="16" font-weight="bold" text-anchor="middle">How component requirements derive — and roles collaborate</text>

  <!-- FR box -->
  <rect x="270" y="48" width="160" height="44" rx="6" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <text x="350" y="70" fill="#e5e7eb" font-size="12" text-anchor="middle">7 Foundational</text>
  <text x="350" y="85" fill="#e5e7eb" font-size="12" text-anchor="middle">Requirements</text>

  <line x1="350" y1="92" x2="350" y2="118" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#a)"/>

  <!-- 3-3 -->
  <rect x="230" y="118" width="240" height="46" rx="6" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="350" y="140" fill="#e5e7eb" font-size="12" text-anchor="middle">62443-3-3 · System Requirements (SR)</text>
  <text x="350" y="156" fill="#94a3b8" font-size="11" text-anchor="middle">set per zone at target SL — built by the integrator</text>

  <line x1="350" y1="164" x2="350" y2="190" stroke="#f97316" stroke-width="2" marker-end="url(#b)"/>
  <text x="480" y="182" fill="#f97316" font-size="11" text-anchor="start">derives</text>

  <!-- 4-2 -->
  <rect x="230" y="190" width="240" height="46" rx="6" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="350" y="212" fill="#e5e7eb" font-size="12" text-anchor="middle">62443-4-2 · Component Requirements (CR)</text>
  <text x="350" y="228" fill="#94a3b8" font-size="11" text-anchor="middle">EDR · HDR · NDR · SAR — met by the supplier</text>

  <line x1="350" y1="236" x2="350" y2="262" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#a)"/>

  <!-- 4-1 -->
  <rect x="230" y="262" width="240" height="46" rx="6" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <text x="350" y="284" fill="#e5e7eb" font-size="12" text-anchor="middle">62443-4-1 · Secure Development Lifecycle</text>
  <text x="350" y="300" fill="#94a3b8" font-size="11" text-anchor="middle">the process that makes CR capability credible</text>

  <!-- role labels -->
  <text x="120" y="141" fill="#3b82f6" font-size="11" text-anchor="middle">Integrator</text>
  <text x="120" y="213" fill="#f97316" font-size="11" text-anchor="middle">Supplier</text>
  <text x="120" y="285" fill="#f97316" font-size="11" text-anchor="middle">Supplier</text>
  <text x="600" y="71" fill="#3b82f6" font-size="11" text-anchor="middle">Asset owner</text>
  <text x="600" y="85" fill="#94a3b8" font-size="10" text-anchor="middle">sets SL-T</text>

  <defs>
    <marker id="a" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#94a3b8"/></marker>
    <marker id="b" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#f97316"/></marker>
  </defs>
</svg>
```

### What asset owners should demand of suppliers

Component security only pays off if it is written into procurement. Practical asks:

- A stated **SL-C** per foundational requirement for each product, and the configuration needed to achieve it.
- Evidence of a `62443-4-1` **SDL assessment** (ideally third-party, with a maturity level) — not a self-declared claim.
- A **Software Bill of Materials (SBOM)** and a documented **vulnerability handling and disclosure** process (DM).
- A **security update** commitment (SUM): cadence, qualification, and how third-party library fixes reach you.
- **Hardening and end-of-life guidance** (SG), including the support period and secure decommissioning.

> [!NOTE]
> ISASecure certifies both sides of component security: **CSA (Component Security Assurance)** for products against `4-2`, and **SDLA** for development processes against `4-1`. Some sector bodies argue **SL 2** should be the practical minimum for new components rather than SL 1. ([ISASecure — the case for SL 2](https://www.isasecure.org/hubfs/The-Case-for-ISA-IEC-62443-Security-Level-2-as-a-Minimum-FINAL.pdf))

### Why component security underpins the CRA

The EU **[Cyber Resilience Act](/en/cra)** requires manufacturers of products with digital elements to build in security by design and by default, and to handle vulnerabilities across a defined support period (Annex I, Parts I and II). ENISA and industry both note that a product built to `4-2` and developed to `4-1` already meets much of what Annex I demands. ([exida on 62443 & the CRA](https://www.exida.com/blog/how-iec-62443-can-help-achieve-compliance-with-the-eu-cyber-resilience-act-cra))

| CRA Annex I theme | Where 62443 answers it |
| --- | --- |
| Security by design & by default (Part I) | `4-1` SD/SI · `4-2` CRs at target SL |
| Secure configuration & least privilege | `4-2` FR 1 (IAC) & FR 2 (UC) |
| Protection of data integrity & confidentiality | `4-2` FR 3 (SI) & FR 4 (DC) |
| Attack surface reduction & DoS resilience | `4-2` FR 5 (RDF) & FR 7 (RA) |
| Vulnerability handling & coordinated disclosure (Part II) | `4-1` DM (issue management) |
| Security updates across the support period | `4-1` SUM (update management) |
| Provision of an SBOM | `4-1` SM / SUM component inventory |

The alignment is close but not automatic: the CRA is law with its own conformity assessment, and 62443 is the engineering evidence that makes conformity defensible rather than a paper exercise.

---

## The security programme — the deep dive

Technology alone does not make an operator secure; a *programme* does. Group 2 of the series covers the organisational engine that keeps everything else running — governance, risk management, policy, competence and operations — split between the asset owner (`62443-2-1`) and the service providers who work on their behalf (`62443-2-4`). This is the layer NIS2 cares about most, which is why we treat it at length.

### 62443-2-1 — the asset owner's security programme

`62443-2-1` specifies the requirements for an asset owner to **establish and operate an IACS security programme** — historically framed as a Cybersecurity Management System (CSMS), the OT counterpart to an ISMS. The **2024 edition** restructured the requirements into **Security Programme Elements (SPEs)**, removed duplication with ISO/IEC 27001-style information-security management, and added a **maturity model** for evaluating each requirement. ([Industrial Cyber on 2-1:2024](https://industrialcyber.co/isa-iec-62443/iec-publishes-iec-62443-2-12024-setting-security-standards-for-industrial-automation-and-control-systems/))

The programme runs as a continuous cycle rather than a one-off project:

```svg
<svg viewBox="0 0 700 360" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif">
  <rect width="700" height="360" fill="none"/>
  <text x="350" y="28" fill="#e5e7eb" font-size="16" font-weight="bold" text-anchor="middle">The IACS security-programme lifecycle (62443-2-1)</text>

  <!-- centre -->
  <circle cx="350" cy="190" r="52" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <text x="350" y="186" fill="#e5e7eb" font-size="12" text-anchor="middle">Govern &amp;</text>
  <text x="350" y="202" fill="#e5e7eb" font-size="12" text-anchor="middle">improve</text>

  <!-- nodes -->
  <g fill="none" stroke="#94a3b8" stroke-width="1.5">
    <rect x="270" y="60" width="160" height="42" rx="6"/>
    <rect x="500" y="150" width="170" height="42" rx="6"/>
    <rect x="430" y="290" width="180" height="42" rx="6"/>
    <rect x="90" y="290" width="180" height="42" rx="6"/>
    <rect x="30" y="150" width="170" height="42" rx="6"/>
  </g>
  <text x="350" y="86" fill="#e5e7eb" font-size="12" text-anchor="middle">1 · Risk assessment</text>
  <text x="585" y="176" fill="#e5e7eb" font-size="12" text-anchor="middle">2 · Policy &amp; org</text>
  <text x="520" y="316" fill="#e5e7eb" font-size="12" text-anchor="middle">3 · Controls &amp; competence</text>
  <text x="180" y="316" fill="#e5e7eb" font-size="12" text-anchor="middle">4 · Operate &amp; respond</text>
  <text x="115" y="176" fill="#e5e7eb" font-size="12" text-anchor="middle">5 · Monitor &amp; audit</text>

  <!-- arrows around -->
  <g stroke="#f97316" stroke-width="2" fill="none" marker-end="url(#c)">
    <path d="M430 84 Q520 100 560 150"/>
    <path d="M585 192 Q560 250 520 290"/>
    <path d="M430 315 Q350 340 270 315"/>
    <path d="M180 290 Q120 250 115 192"/>
    <path d="M120 150 Q180 100 270 84"/>
  </g>
  <defs>
    <marker id="c" markerWidth="9" markerHeight="9" refX="4.5" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="#f97316"/></marker>
  </defs>
</svg>
```

What a mature asset-owner programme contains:

- **Governance and accountability.** Named ownership, a policy framework, and management commitment. The asset owner remains *accountable* even where suppliers do the work. ([ISA product page](https://www.isa.org/products/ansi-isa-62443-2-1-2024-security-industrial-automa))
- **Risk management.** A recurring, documented IACS risk assessment (feeding the `3-2` zone/conduit and SL-T work) that keeps the programme calibrated to real consequence.
- **Policies and procedures.** Access control, change management, network security, and secure configuration — written down, not carried in people's heads.
- **Competence and awareness.** Roles, training and cyber-hygiene for the people who operate the plant.
- **Operations.** Monitoring, incident response, backup and recovery, and patch/vulnerability handling as running processes.
- **Maturity and continuous improvement.** Each element assessed against the maturity model and improved over time — the durability point again.

> [!IMPORTANT]
> `62443-2-1:2024` deliberately allows **implementation flexibility** for legacy plant, recognising that many operational systems run hardware and software that can no longer be patched. The programme's job is to manage that reality with compensating controls, not to pretend it away. ([Industrial Cyber](https://industrialcyber.co/isa-iec-62443/iec-publishes-iec-62443-2-12024-setting-security-standards-for-industrial-automation-and-control-systems/))

### 62443-2-4 — requirements for service providers

An operator rarely builds and maintains its own IACS alone. `62443-2-4` specifies the **security programme requirements for IACS service providers** — the integrators and maintenance contractors who deliver and support the automation solution. It defines the security *capabilities* (increasingly framed as documented *processes*) a service provider must offer across integration and maintenance activities. ([IEC](https://webstore.iec.ch/en/publication/67631))

In practice, `2-4` is what an asset owner points to when writing security into a contract: it covers secure engineering practices, hardening during Factory and Site Acceptance Testing (FAT/SAT), account and remote-access handling, patch and backup processes, and how the provider sustains its security guidelines through the maintenance phase. It is the bridge between the operator's programme (`2-1`) and the components it buys (`4-1`/`4-2`) — the assurance that the people touching your system work to a defined standard.

### How the programme satisfies NIS2 Article 21

NIS2 requires "appropriate and proportionate" technical and organisational risk-management measures, and **Article 21(2)** enumerates ten of them. The security programme in Group 2 (with support from Group 3) maps onto these almost item-for-item — which is why building the programme to 62443 lets you evidence NIS2 without inventing a parallel structure. ([NIS2 Article 21 — the 10 measures](https://www.glocertinternational.com/resources/guides/nis2-article-21-risk-management-measures-explained/))

| NIS2 Article 21(2) measure | Where 62443 delivers it |
| --- | --- |
| (a) Risk analysis & information security policies | `2-1` risk management & policy · `3-2` risk assessment |
| (b) Incident handling | `2-1` operations · FR 6 (TRE) |
| (c) Business continuity, backup & crisis management | `2-1` operations (backup/recovery) |
| (d) Supply chain security | `2-4` service providers · `4-1`/`4-2` for products |
| (e) Security in acquisition, development & maintenance (incl. vuln handling) | `4-1` (DM, SUM) · `2-4` maintenance |
| (f) Assessing effectiveness of measures | `2-1` maturity model, monitoring & audit |
| (g) Cyber hygiene & training | `2-1` competence & awareness |
| (h) Cryptography & encryption | FR 3 (SI) & FR 4 (DC) in `3-3`/`4-2` |
| (i) HR security, access control & asset management | FR 1 (IAC) & FR 2 (UC) · `2-1` asset management |
| (j) MFA, secured communications | FR 1 REs at higher SLs |

## IEC 62443 and the other regulations

The European regulations set outcomes; IEC 62443 provides the recognised method to reach and evidence them. Beyond NIS2 and the CRA covered above:

- **The [AI Act](/en/ai-act)** requires accuracy, robustness and cybersecurity for high-risk AI systems (Article 15). Where such systems live inside an IACS, the 62443 zone model and system requirements are the vehicle for protecting them.
- **The [Machinery Regulation](/en/machine-act)** brings cybersecurity relevant to safety into the CE-marking of machinery; 62443's component and system requirements give machine builders a route to demonstrate it.
- **[TS 50701](/en/ts-50701)** applies the 62443 concepts and risk-assessment method to the railway sector, adapting them to rail's safety lifecycle.

Aligning your regulatory response to IEC 62443 means you build once and satisfy many — and you speak a language regulators, auditors, integrators and vendors already recognise. Our **[Frameworks](/en/frameworks)** overview shows how these pieces fit together.

## What it means for your role

**If you are an asset owner / operator**, IEC 62443 turns "make it secure" into a specification. Set a target security level per zone (`3-2`), run a real security programme (`2-1`), and hold integrators (`2-4`) and suppliers (`4-1`/`4-2`) to those numbers in contracts.

**If you are an engineer or integrator**, the series is your design method: risk-assess (`3-2`), define zones and conduits, set target security levels, and build systems (`3-3`) from components (`4-2`) that meet them — while meeting `2-4` in how you deliver.

**If you are a product supplier**, `4-1` and `4-2` are your route to market: a demonstrable secure development lifecycle and components with a stated, ideally certified, security capability — which is fast becoming the entry ticket under the CRA.

## How OXOT uses IEC 62443

IEC 62443 is the backbone of how OXOT works. Our **OT Security Assessments** are structured around its risk-assessment method (`62443-3-2`), producing zone and conduit models and target security levels grounded in your real operational risk. Our **[Cyber Digital Twin](/en/cyber-digital-twin)** holds that structure as a living model — zones, conduits, assets and the gap between target and achieved security levels — so you can prioritise investment and show your reasoning. Our **OT Security Programmes** build the `2-1` engine; our **Architecture & Segmentation** work delivers the design in practice; and our **Capability Transfer** ensures your team can operate and sustain it. IEC 62443 is not a document we cite; it is the method we build with.

## Frequently asked questions

**Is IEC 62443 mandatory?**
Not in itself — it is a voluntary international standard. But it is the recognised method for demonstrating compliance with mandatory regimes like NIS2 and the CRA, and many contracts and sector regulators now expect it.

**Do we need SL 4 everywhere?**
No — that would be disproportionate and expensive. You set a *target* security level per zone based on the consequence of compromise. Most zones need SL 1–2; only the highest-consequence functions warrant SL 3 or 4.

**What is the difference between a security level and a maturity level?**
A **security level (SL 1–4)** grades the strength of protection of a system or component. A **maturity level (ML 1–4)** grades how well the *process* behind it is established and improved. A strong control run by an immature process is fragile — the Security Protection Rating combines both.

**Is 62443-4-2 certification the same as being CRA-compliant?**
No, but it is most of the work. A product built to `4-2` and developed under `4-1` meets much of CRA Annex I, yet the CRA has its own legal conformity assessment. Treat 62443 as the engineering evidence, not the legal sign-off. See our **[CRA](/en/cra)** page.

**How does IEC 62443 relate to TS 50701?**
**[TS 50701](/en/ts-50701)** is IEC 62443 specialised for rail — same concepts and risk method, adapted to the railway safety lifecycle.

**Where do we start?**
With a risk-based assessment: inventory your assets, define zones and conduits, set target security levels, and measure the gap. That assessment is the foundation everything else builds on — and it is exactly what OXOT delivers first.

## Sources

- ANSI/ISA-62443-2-1-2024, Security Program Requirements for IACS Asset Owners — [ISA](https://www.isa.org/products/ansi-isa-62443-2-1-2024-security-industrial-automa)
- IEC 62443-2-1:2024 publication note — [Industrial Cyber](https://industrialcyber.co/isa-iec-62443/iec-publishes-iec-62443-2-12024-setting-security-standards-for-industrial-automation-and-control-systems/)
- IEC 62443-2-4:2023, Security Program Requirements for IACS Service Providers — [IEC](https://webstore.iec.ch/en/publication/67631)
- ISA/IEC 62443-3-3 overview — [Cisco](https://www.cisco.com/c/en/us/products/collateral/security/isaiec-62443-3-3-wp.html)
- IEC 62443-4-1 practices & requirements — [jtsec](https://jtsec.es/files/IEC%2062443-4-1%20Practices%20&%20Requirementes.pdf)
- IEC 62443-4-1 explained — [CyTAL](https://cytal.co.uk/blog/iec-62443-4-1-explained-secure-development-lifecycle-requirements/)
- IEC 62443-4-2 technical security requirements for components — [Keyfactor](https://www.keyfactor.com/blog/iec-62443-4-2-technical-security-requirements-for-iacs-components/)
- IEC 62443-4-2, the need to secure components — [INCIBE-CERT](https://www.incibe.es/en/incibe-cert/blog/iec-62443-4-2-need-secure-components)
- ISASecure CSA / SDLA certification — [ISASecure](https://isasecure.org/certification/iec-62443-csa-certification)
- The case for SL 2 as a minimum — [ISASecure](https://www.isasecure.org/hubfs/The-Case-for-ISA-IEC-62443-Security-Level-2-as-a-Minimum-FINAL.pdf)
- IEC 62443 concepts for OT security teams — [Dragos](https://www.dragos.com/blog/isa-iec-62443-concepts)
- ISA/IEC 62443 series overview — [ISA](https://www.isa.org/standards-and-publications/isa-standards/isa-iec-62443-series-of-standards)
- Maturity levels & framework overview — [Overcyte](https://www.overcyte.com/frameworks/isa-iec-62443)
- How IEC 62443 helps with the CRA — [exida](https://www.exida.com/blog/how-iec-62443-can-help-achieve-compliance-with-the-eu-cyber-resilience-act-cra)
- NIS2 Article 21 — the 10 risk-management measures — [Gloce International](https://www.glocertinternational.com/resources/guides/nis2-article-21-risk-management-measures-explained/)
- IEC 62443 zone & conduit design — [Çağrı Polat](https://www.cagripolat.com/iec62443/en/iec-62443-zone-conduit-design-ot-practical-guide)
- IEC 62443 overview — [Fortinet](https://www.fortinet.com/resources/cyberglossary/iec-62443)
- IEC 62443 — IEC SyC Smart Energy — [IEC](https://syc-se.iec.ch/deliveries/cybersecurity-guidelines/security-standards-and-best-practices/iec-62443/)

*This page is general educational information about the IEC 62443 series. Refer to the official IEC/ISA standards for authoritative requirements.*
