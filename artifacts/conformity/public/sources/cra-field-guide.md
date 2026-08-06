---
title: "The Cyber Resilience Act (CRA)"
meta_title: Cyber Resilience Act (CRA) for OT & Products with Digital Elements | OXOT
meta_description: The EU Cyber Resilience Act (Regulation (EU) 2024/2847) explained for OT — scope, product classes, Annex I security & vulnerability-handling requirements, SBOM, 24-hour reporting, ~5-year support periods, the 2024→2027 timeline, penalties, and OXOT's IEC 62443 alignment methodology.
excerpt: Security-by-design becomes a legal condition of market access. A field guide to CRA scope, product classes, Annex I, SBOM, 24-hour reporting, support periods, penalties, and OXOT's own CRA↔IEC 62443 alignment methodology for OT manufacturers and buyers.
content_type: page
published: true
---

The Cyber Resilience Act is the European Union's answer to a simple, uncomfortable fact: for decades, digital products have shipped with security treated as optional, and the cost has landed on the people who use them. The CRA changes the deal. For the first time, **security becomes a legal condition of placing a product with digital elements on the EU market** — from consumer gadgets to the industrial controllers, gateways and software that run operational environments.

If [NIS2](/en/nis2) is a law for the *operators* who run systems, the CRA is the law for the *makers* of the products those systems are built from. Industrial organisations tend to meet it from both sides at once: as a buyer who can finally demand security as a right, and — if you build, integrate or substantially modify products — as a manufacturer who now carries obligations backed by turnover-linked fines.

```keyfacts
Instrument :: Regulation (EU) 2024/2847 — directly applicable
Entered into force :: 10 December 2024
Reporting obligations :: from 11 September 2026
Main obligations :: from 11 December 2027
Support period :: as a rule ≥ 5 years
Early-warning clock :: 24 hours to ENISA + CSIRT
Conformity :: Annex I + CE marking
Max penalty :: €15M or 2.5% of global turnover
Aligns with :: [IEC 62443](/en/iec-62443)
```

## The short version

- The CRA is **Regulation (EU) 2024/2847**, a directly applicable Regulation — not a Directive — so it takes effect identically across all 27 Member States with no national transposition step. ([EUR-Lex, official text](https://eur-lex.europa.eu/eli/reg/2024/2847/oj/eng))
- It **entered into force on 10 December 2024** and applies to **products with digital elements** (PDEs) — hardware and software whose intended or foreseeable use includes a direct or indirect data connection to a device or network.
- **Manufacturers** carry the core duties: security by design and by default, vulnerability handling, an SBOM, and a defined **support period** of as a rule at least five years.
- **Vulnerability and incident reporting** obligations apply from **11 September 2026**; the **main obligations** apply from **11 December 2027**. ([European Commission](https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act))
- Products must meet the **essential requirements in Annex I** and carry the **CE marking**. Classification against **Commission Implementing Regulation (EU) 2025/2392** — published 1 December 2025 — fixes which conformity route applies.
- **Actively exploited vulnerabilities** and **severe incidents** trigger an **early warning within 24 hours** to ENISA and the national CSIRT, via a single reporting platform.
- Penalties reach **€15 million or 2.5% of worldwide annual turnover**, whichever is higher.

> [!IMPORTANT]
> The reporting clock starts before the main obligations, and it does not wait for a product to be new. Detection and disclosure machinery has to be running by **11 September 2026** — more than a year before you need a CE mark on the product itself — and it applies to **every in-scope product already on the market**, including one sold in 2019. If a vendor becomes aware that an old SCADA deployment has an actively exploited vulnerability after that date, the 24-hour clock still starts.

## Why the CRA exists

Two structural problems drove the law. First, a **low level of cybersecurity** in many digital products — weak default configurations, unpatched vulnerabilities, no clear route to report a flaw. Second, an **insufficient understanding and access to information** among users, who could not tell a secure product from an insecure one at the point of purchase, and often could not obtain security updates even when they wanted them. ([CRA summary, European Commission](https://digital-strategy.ec.europa.eu/en/policies/cra-summary))

The fix pushes responsibility upstream, to the party best placed to act: the manufacturer. It reuses the proven machinery of EU product law — essential requirements, conformity assessment, CE marking, market surveillance — and points it at cybersecurity. "Secure by design" and "secure by default" stop being slogans and become the price of market access.

## The CRA timeline

The Regulation phases in over three years. The dates below are the ones to plan against; the gap between them is where the engineering work has to happen.

```svg
<svg viewBox="0 0 700 240" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif">
  <line x1="40" y1="120" x2="660" y2="120" stroke="#94a3b8" stroke-width="2"/>
  <!-- milestone 1 -->
  <circle cx="90" cy="120" r="8" fill="#3b82f6"/>
  <line x1="90" y1="120" x2="90" y2="70" stroke="#94a3b8" stroke-width="1"/>
  <text x="90" y="58" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">10 Dec 2024</text>
  <text x="90" y="150" fill="#e5e7eb" font-size="12" text-anchor="middle">Enters into</text>
  <text x="90" y="166" fill="#e5e7eb" font-size="12" text-anchor="middle">force</text>
  <!-- milestone 2 -->
  <circle cx="300" cy="120" r="8" fill="#f97316"/>
  <line x1="300" y1="120" x2="300" y2="70" stroke="#94a3b8" stroke-width="1"/>
  <text x="300" y="58" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">11 Sep 2026</text>
  <text x="300" y="150" fill="#e5e7eb" font-size="12" text-anchor="middle">Reporting</text>
  <text x="300" y="166" fill="#e5e7eb" font-size="12" text-anchor="middle">obligations apply</text>
  <text x="300" y="182" fill="#e5e7eb" font-size="12" text-anchor="middle">(Art. 14)</text>
  <!-- milestone 3 -->
  <circle cx="510" cy="120" r="8" fill="#94a3b8"/>
  <line x1="510" y1="120" x2="510" y2="70" stroke="#94a3b8" stroke-width="1"/>
  <text x="510" y="58" fill="#e5e7eb" font-size="12" font-weight="bold" text-anchor="middle">~Q2 2027</text>
  <text x="510" y="150" fill="#e5e7eb" font-size="12" text-anchor="middle">Harmonised</text>
  <text x="510" y="166" fill="#e5e7eb" font-size="12" text-anchor="middle">standards cited</text>
  <!-- milestone 4 -->
  <circle cx="640" cy="120" r="9" fill="#f97316" stroke="#e5e7eb" stroke-width="2"/>
  <line x1="640" y1="120" x2="640" y2="70" stroke="#94a3b8" stroke-width="1"/>
  <text x="640" y="58" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">11 Dec 2027</text>
  <text x="640" y="150" fill="#e5e7eb" font-size="12" text-anchor="middle">Main</text>
  <text x="640" y="166" fill="#e5e7eb" font-size="12" text-anchor="middle">obligations</text>
  <text x="640" y="182" fill="#e5e7eb" font-size="12" text-anchor="middle">apply</text>
  <text x="350" y="215" fill="#94a3b8" font-size="11" text-anchor="middle">Three-year phase-in — the runway is already short for third-party assessment</text>
</svg>
```

| Date | What applies |
|---|---|
| **10 December 2024** | The CRA enters into force. The clock starts; obligations phase in from here. |
| **11 June 2026** | Chapter IV applies — conformity assessment bodies (CABs) begin notification and accreditation as **notified bodies**. Important Class I/II and Critical manufacturers should begin notified-body engagement from this point. |
| **11 September 2026** | **Vulnerability and incident reporting obligations (Article 14)** apply to **all** in-scope products, including those placed on the market years earlier. The ENISA single reporting platform is due to be operational. ([EC — reporting](https://digital-strategy.ec.europa.eu/en/policies/cra-reporting)) |
| **30 August 2026** | Standards deadline: Type A horizontal security standard and Type B vulnerability-handling standard due from CENELEC/ETSI. |
| **30 October 2026** | Standards deadline: Type C vertical/product-specific standards, covering Annex III/IV categories, due. |
| **~Q2 2027** | Expected formal OJEU citation of the first harmonised standards — including **EN IEC 62443-4-1:2018/A11:2026** and **EN IEC 62443-4-2:2019/A11:2026** — activating the presumption of conformity. |
| **11 December 2027** | The **main obligations** — essential requirements, conformity assessment, CE marking — apply in full. |

Building secure-development and vulnerability-handling processes, producing SBOMs, and arranging third-party assessment for important and critical products are multi-year programmes, not last-quarter projects. As of mid-2026, **no CRA harmonised standard has been formally cited in the EU Official Journal** — which means no manufacturer can yet invoke the presumption of conformity, and Important Class I products have, for now, no self-assessment route open to them at all.

## What counts as a "product with digital elements"

The scope is deliberately broad. Under **Article 3(1)**, a **product with digital elements** is:

> *"a software or hardware product and its remote data processing solutions, including software or hardware components being placed on the market separately."*

A product is in scope if it connects, directly or indirectly, to a device or network during normal use; contains digital elements (software or programmable hardware); and is not already covered by an EU sectoral regulation providing equivalent cybersecurity requirements. Remote data processing operated by or on behalf of the manufacturer independently triggers scope on its own.

In an industrial setting that captures a great deal:

- **PLCs, RTUs and industrial controllers** — the logic that runs the process.
- **Protocol gateways and network devices** — the translators and routers between OT and IT.
- **HMIs and engineering workstations software** — the human-facing and configuration layers.
- **Industrial IoT sensors and edge devices** — the growing population of connected endpoints.
- **Firmware and application software** running on all of the above, including standalone software sold on its own.

Some categories are carved out because they are already regulated elsewhere — national security and defence products, type-approved vehicles, and products for which a sector-specific EU regulation already sets an equal-or-higher cybersecurity bar. If your product sits at a boundary (say, machinery with a digital control system), you may be reading the CRA alongside the [Machinery Regulation](/en/machine-act).

## Who carries the obligations

The CRA follows the value chain, and the weight is not evenly spread.

| Role | Core duty under the CRA |
|---|---|
| **Manufacturer** | Substantive obligations: secure design, Annex I compliance, SBOM, vulnerability handling, support period, reporting, conformity assessment, CE marking. |
| **Importer** | Verify the manufacturer's conformity assessment, technical documentation and CE marking; add own contact details; keep 10-year traceability records; act on non-conformity. |
| **Distributor** | Act with due care; verify CE marking and DoC accompany the product; must not make available products they know or should know are non-compliant; keep 10-year traceability records. |

> [!WARNING]
> **You can become a "manufacturer" without ever calling yourself one.** Under **Article 21**, importers and distributors assume full manufacturer obligations if they place a product on the market under their own name or trademark, or make a **substantial modification** to a product already on the market. An OEM that contracts manufacturing to a non-EU entity and sells under its own brand in the EU bears all Article 13 obligations regardless of the contract terms — contractual pass-through of liability to the ODM does not work in front of a market surveillance authority. System integrators and operators who rebrand, re-flash firmware, or significantly alter a device need to know exactly where that line sits — per product, before 2027.

That "substantial modification" trigger is the one that surprises OT teams. A modification is "substantial" if it either affects compliance with Annex I, or changes the product's intended purpose (**Article 3(30)**). Routine maintenance, like-for-like repairs and security patches are **not** substantial modifications by default (**Recital 42**) — but a full SCADA platform upgrade, or adding IIoT connectivity to a previously non-networked device, typically is. A machine builder who integrates a third-party controller and ships the line under their own name, or an integrator who performs a post-2027 refit that crosses this line, inherits the full manufacturer stack — including the 5-year minimum support period, counted from the date of the modification.

## Product classes and conformity assessment

Not all products are treated alike. The CRA sorts PDEs by criticality, and the class determines how rigorously conformity must be demonstrated. Classification is fixed by **Commission Implementing Regulation (EU) 2025/2392** (published 1 December 2025), which gives technical descriptions for the Annex III (Important) and Annex IV (Critical) categories. Classification is not a paperwork exercise — it is the decision that sets your timeline, your budget, and whether a notified body sits between you and the CE mark. ([EC — conformity assessment](https://digital-strategy.ec.europa.eu/en/policies/cra-conformity-assessment))

| Class | Examples (Annex III / IV) | Conformity route |
|---|---|---|
| **Default** | The large majority of products, listed in neither annex — consumer IoT, smart speakers, mobile apps, video games, most non-safety industrial devices. | **Self-assessment** (Module A, internal control) against the essential requirements — always permitted. |
| **Important — Class I** | Operating systems (desktop/server/mobile), browsers, password managers, VPN software, SIEM, network routers/switches, physical and virtual network interfaces, non-safety-critical IACS products. | Self-assessment (Module A) **only if** a harmonised standard is fully applied; otherwise **Module B+C or H** via a notified body. |
| **Important — Class II** | Firewalls, IDS/IPS, hypervisors, HSMs, tamper-resistant microprocessors, safety-critical IACS, industrial robots. | **Always Module B+C or Module H** via a notified body — self-assessment is legally unavailable, full stop. |
| **Critical** | Smart cards, HSMs, smart meter gateways in critical infrastructure, certain chip-level security products (Annex IV). | Mandatory **European cybersecurity certification**; where no scheme exists yet, Important Class II rules apply. |

> **OXOT's read on this table:** many ICS components — including safety-critical IACS products — land in Important Class II, which forecloses self-assessment entirely. That single classification decision is the one most OT manufacturers underestimate: it is the difference between an internal engineering sign-off and a multi-month notified-body queue.

### Class I in practice — what "self-assess or not" actually depends on

Class I is the one class where the manufacturer has a real choice, and that choice is dictated entirely by engineering discipline, not intent.

- **Pathway A — Self-assessment (Module A, internal control).** Permitted **if and only if** the manufacturer fully applies EU-harmonised standards or common specifications (the forthcoming harmonised EN IEC 62443 profiles, once cited). Until that citation lands, this pathway is closed for OT Class I products.
- **Pathway B — Mandatory third-party assessment (Module B+C or Module H).** If a manufacturer does not fully apply a harmonised standard, they forfeit the right to self-assess and face the same third-party route as a Class II product: an independent notified body conducting an EU-type examination (Module B+C) or a full quality assurance audit of the manufacturer's development lifecycle (Module H).

Whichever pathway applies, Class I manufacturers must produce the same evidence base to prove the product is "secure-by-design" and free of known exploitable vulnerabilities at release:

| Evidence area | What it demonstrates |
|---|---|
| Threat modelling & design-stage risk assessment | Security risk was assessed before code was written; trust boundaries and intended use cases are mapped. |
| Automated code analysis (SAST/DAST) | Source code and running application are both tested for flaws as part of the development pipeline. |
| Software composition analysis (SCA) & SBOM generation | Third-party and open-source components are continuously scanned; a machine-readable SBOM is generated and maintained for the whole support period. |
| Penetration testing & vulnerability handling | Active testing to eliminate weaknesses before launch, plus a mechanism for secure, integrity-protected update delivery when new flaws surface. |
| Deep hardware/firmware verification (physical Class I devices) | For routers, network interfaces and similar hardware, standard IT scanning is not enough — access controls, state-of-the-art cryptography for data at rest/in transit, secure boot integrity, and attack-surface reduction (disabling unused physical ports) must all be validated. |

### Class II in practice — the notified body evaluates two things

Class II products are treated as a materially higher cybersecurity risk, and self-assessment is **legally prohibited** — there is no version of this class where an internal sign-off is sufficient. To affix a CE mark, the manufacturer must go through a mandatory third-party audit by a notified body, or use an applicable European cybersecurity certification scheme at a "substantial" or "high" assurance level.

The notified body assesses the product against two categories:

**1. The assessment procedure ("how")**

- **Module B + C (EU-type examination):** the notified body conducts a rigorous examination of the product's technical design, development and vulnerability-handling processes, and tests a physical or digital sample directly. Module C then requires the manufacturer to ensure every subsequent production unit conforms to that approved sample.
- **Module H (full quality assurance):** instead of sampling one unit, the notified body audits the manufacturer's entire secure development lifecycle and quality management system. If the audit confirms the process inherently and consistently produces CRA-compliant output, production can proceed.

**2. The essential cybersecurity requirements ("what")**

- No known exploitable vulnerabilities at release, backed by a documented risk assessment.
- Security-by-design and by-default: minimal attack surface, strict access controls, secure out-of-the-box configuration.
- State-of-the-art cryptography for data at rest and in transit — no obsolete or home-grown algorithms.
- Hardware-level protections for devices like tamper-resistant microprocessors: hardware roots of trust, secure boot integrity, physical tamper resilience.
- Secure, largely automatic updates with a clear opt-out for professional users.
- A machine-readable SBOM (SPDX or CycloneDX) tracking all dependencies to enable rapid patching.
- A committed support period — as a rule, not shorter than 5 years.

All of this is compiled into a technical documentation file — risk assessments, architectural designs, SBOM, test reports — retained for at least 10 years or the support period, whichever is longer.

## Annex I, Part I — the product's security properties

Annex I is where the CRA becomes concrete, and it has two parts. **Part I** governs how the product itself must behave. The overarching standard, in **point (1)**, is that products must be designed, developed and produced to ensure *"an appropriate level of cybersecurity based on the risks."* Point (2) then lists 13 specific properties implementing that standard. ([CRA annexes](https://www.cyberresilienceact.eu/annexes.html))

| Security property | What it demands in practice |
|---|---|
| **No known exploitable vulnerabilities** | Ship without known, exploitable flaws — vulnerability management before release, not after. |
| **Secure by default** | Delivered with a secure configuration out of the box; no universal default passwords; a way to reset to factory-default secure state. |
| **Security update capability** | Automatic security updates on by default, with a clear opt-out, user notification, and the ability to postpone. |
| **Access control & authentication** | Protect against unauthorised access with appropriate authentication, identity management and role-based access control; report possible unauthorised access attempts. |
| **Confidentiality** | Data at rest and in transit protected with state-of-the-art encryption — stored data, transmitted data, command-and-control traffic, credentials and keys alike. |
| **Integrity** | Protect stored/transmitted data, commands and configuration against corruption; report integrity violations. |
| **Data minimisation** | Process only data that is adequate, relevant and limited to what the product needs. |
| **Availability & resilience** | Protect essential functions; resist and recover from denial-of-service; maintain degraded-mode operation where feasible. |
| **Minimised attack surface** | Disable unnecessary services, ports and protocols by default; reduce the software footprint. |
| **Limit incident impact** | Fallback operation, graceful degradation, network segmentation, isolation of compromised components. |
| **Security logging & monitoring** | Record and monitor security-relevant events; make logs available to users; allow (but default-enable) an opt-out. |
| **Secure data deletion** | A user capability to securely and permanently delete data and configuration, especially at decommissioning. |
| **Reduce attack exposure** | The catch-all engineering obligation — secure coding, supply-chain component security, build integrity, architectural choices that shrink the exploitable surface. |

> [!NOTE]
> **Not every requirement applies to every product, but silence is not an option.** Under **Article 13(3)–(4)**, the risk assessment must state which of these 13 requirements are applicable and how they are implemented — and where one genuinely is not applicable (a product that never transmits data has no data-in-transit confidentiality obligation to build), the manufacturer must include a **clear, written justification** in the technical documentation. An undocumented "not applicable" is a compliance failure, not a shortcut.

## Annex I, Part II — vulnerability handling and the SBOM

**Part II** governs the process a manufacturer must run across the support period. This is the operational discipline behind the product's security properties, and it applies to every manufacturer regardless of product class.

| Vulnerability-handling duty | What it means |
|---|---|
| **Identify & document components** | Know what is inside the product, including a **software bill of materials (SBOM)** covering at least top-level dependencies, in a commonly used machine-readable format. |
| **Remediate without delay** | Address and fix vulnerabilities promptly, including via **free security updates** for the support period; separate security fixes from feature releases where feasible. |
| **Regular testing** | An ongoing, scheduled programme — periodic penetration testing, automated CVE scanning against the live SBOM, and regression testing — not a single pre-release check. |
| **Public disclosure of fixes** | Once a fix is available, publish its severity, impact and remediation — comparable to CVE/CNA advisory practice. |
| **Coordinated disclosure** | Operate and publish a CVD policy, with a designated single point of contact that is easily identifiable to users. |
| **Upstream reporting** | On identifying a vulnerability in a third-party or open-source component, report it to that component's maintainer — and share any patch developed, where appropriate. |
| **Secure distribution** | Distribute updates with integrity protection and authentication, so the update channel itself cannot become a supply-chain attack vector. |
| **Information sharing** | Provide vulnerability count, severity and handling-policy information to competent authorities on request. |

> [!NOTE]
> **Why the SBOM matters more than it looks.** Industrial products are assembled from layers of third-party and open-source components. The SBOM obligation forces manufacturers to actually know what is inside their products and to track the vulnerabilities those components carry. A stale SBOM is a compliance risk in its own right — it cannot support the 24-hour Article 14 reporting clock if you don't know a vulnerable component is even in the product. For operators, a vendor SBOM is a direct input to your own risk picture — and a reasonable thing to demand in procurement well before 2027.

## Full obligations reference — the manufacturer's lifecycle

Read end to end, the CRA describes a lifecycle, not a one-time gate, and it is useful to see the whole thing laid out against the articles that create it.

| Lifecycle stage | Legal basis | What must exist |
|---|---|---|
| **Classify** | Articles 6–8, Annex III/IV, Impl. Reg. 2025/2392 | Product mapped to Default / Important I / Important II / Critical — fixes the conformity route. |
| **Design & build** | Article 13(1)–(3) | Security considered through *"planning, design, development, production, delivery and maintenance"*; risk assessment documents which Annex I requirements apply and how. |
| **Vulnerability handling** | Article 13(2)–(3), Annex I Part II | SBOM pipeline, CVD policy, single point of contact, regular testing — operational before 11 September 2026. |
| **Technical documentation** | Article 31, Annex VII | Product description, risk assessment, Annex I compliance evidence, SBOM, standards applied, test reports, conformity assessment results, DoC, support-period rationale. Retained 10 years or the support period, whichever is longer. |
| **Conformity assessment** | Article 32 | Module A (self), Module B+C (notified body type-examination + production control), Module H (full QA), or European cybersecurity certification for Critical products. |
| **Declaration & marking** | Articles 28, 30, Annex V | EU Declaration of Conformity referencing Regulation (EU) 2024/2847; CE mark affixed only once the DoC exists. |
| **User information** | Article 13(18), Annex II | Manufacturer contact, CVD URL, intended purpose, known risks, DoC reference, support-period end-date, secure-use instructions — in a language users understand. |
| **Support period** | Article 13(8) | As a rule, **at least 5 years** of free security updates; shorter only where genuinely justified by expected product life. |
| **Reporting** | Article 14 | 24h early warning → 72h detailed notification → 14-day/1-month final report to ENISA + CSIRT, for actively exploited vulnerabilities and severe incidents — live from **11 September 2026**, for all in-scope products regardless of placement date. |
| **Retention** | Article 13(13) | Technical file and DoC retained 10 years from market placement, or the support period, whichever is longer. |

```svg
<svg viewBox="0 0 700 300" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif">
  <!-- top row blocks -->
  <rect x="20" y="40" width="150" height="60" rx="8" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <text x="95" y="66" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">Secure design</text>
  <text x="95" y="84" fill="#94a3b8" font-size="11" text-anchor="middle">Annex I Part I</text>

  <rect x="200" y="40" width="150" height="60" rx="8" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <text x="275" y="66" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">SBOM &amp;</text>
  <text x="275" y="84" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">components</text>

  <rect x="380" y="40" width="150" height="60" rx="8" fill="none" stroke="#f97316" stroke-width="2"/>
  <text x="455" y="66" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">Conformity</text>
  <text x="455" y="84" fill="#94a3b8" font-size="11" text-anchor="middle">assessment + CE</text>

  <rect x="540" y="40" width="140" height="60" rx="8" fill="#f97316" fill-opacity="0.12" stroke="#f97316" stroke-width="2"/>
  <text x="610" y="76" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">On the market</text>

  <!-- arrows top row -->
  <line x1="170" y1="70" x2="200" y2="70" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr)"/>
  <line x1="350" y1="70" x2="380" y2="70" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr)"/>
  <line x1="530" y1="70" x2="540" y2="70" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr)"/>

  <!-- down into lifecycle band -->
  <line x1="610" y1="100" x2="610" y2="160" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr)"/>

  <!-- lifecycle band -->
  <rect x="60" y="170" width="440" height="70" rx="8" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <text x="280" y="198" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">Vulnerability handling &amp; security updates</text>
  <text x="280" y="220" fill="#94a3b8" font-size="11" text-anchor="middle">Support period — as a rule ≥ 5 years (Annex I Part II)</text>

  <rect x="530" y="170" width="150" height="70" rx="8" fill="#f97316" fill-opacity="0.12" stroke="#f97316" stroke-width="2"/>
  <text x="605" y="198" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">Reporting</text>
  <text x="605" y="218" fill="#94a3b8" font-size="11" text-anchor="middle">24h / 72h / final</text>

  <line x1="530" y1="205" x2="500" y2="205" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr)"/>

  <!-- feedback loop -->
  <path d="M 60 205 Q 20 205 20 140 Q 20 70 20 70" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 4" marker-end="url(#arr)"/>
  <text x="30" y="270" fill="#94a3b8" font-size="11" text-anchor="start">Findings feed back into design and updates</text>

  <defs>
    <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8"/>
    </marker>
  </defs>
</svg>
```

## The conformity assessment route by product class

The class you land in determines who signs off on the product and how long that takes to arrange. This is the decision that drives the schedule more than the engineering itself does.

```svg
<svg viewBox="0 0 700 320" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif">
  <rect x="20" y="20" width="200" height="50" rx="8" fill="none" stroke="#94a3b8" stroke-width="2"/>
  <text x="120" y="50" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">Classify the product</text>

  <line x1="120" y1="70" x2="120" y2="100" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr2)"/>

  <!-- Default -->
  <rect x="20" y="100" width="150" height="60" rx="8" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <text x="95" y="124" fill="#e5e7eb" font-size="12" font-weight="bold" text-anchor="middle">Default</text>
  <text x="95" y="142" fill="#94a3b8" font-size="10" text-anchor="middle">Module A</text>
  <text x="95" y="155" fill="#94a3b8" font-size="10" text-anchor="middle">self-assessment</text>

  <!-- Class I -->
  <rect x="190" y="100" width="150" height="60" rx="8" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <text x="265" y="120" fill="#e5e7eb" font-size="12" font-weight="bold" text-anchor="middle">Important Class I</text>
  <text x="265" y="138" fill="#94a3b8" font-size="10" text-anchor="middle">Module A if standard</text>
  <text x="265" y="151" fill="#94a3b8" font-size="10" text-anchor="middle">fully applied — else B+C/H</text>

  <!-- Class II -->
  <rect x="360" y="100" width="150" height="60" rx="8" fill="none" stroke="#f97316" stroke-width="2"/>
  <text x="435" y="120" fill="#e5e7eb" font-size="12" font-weight="bold" text-anchor="middle">Important Class II</text>
  <text x="435" y="138" fill="#94a3b8" font-size="10" text-anchor="middle">Always Module B+C</text>
  <text x="435" y="151" fill="#94a3b8" font-size="10" text-anchor="middle">or Module H</text>

  <!-- Critical -->
  <rect x="530" y="100" width="150" height="60" rx="8" fill="#f97316" fill-opacity="0.12" stroke="#f97316" stroke-width="2"/>
  <text x="605" y="120" fill="#e5e7eb" font-size="12" font-weight="bold" text-anchor="middle">Critical</text>
  <text x="605" y="138" fill="#94a3b8" font-size="10" text-anchor="middle">European cyber</text>
  <text x="605" y="151" fill="#94a3b8" font-size="10" text-anchor="middle">certification scheme</text>

  <line x1="120" y1="70" x2="95" y2="100" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arr2)"/>
  <line x1="120" y1="70" x2="265" y2="100" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arr2)"/>
  <line x1="120" y1="70" x2="435" y2="100" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arr2)"/>
  <line x1="120" y1="70" x2="605" y2="100" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arr2)"/>

  <line x1="95" y1="160" x2="95" y2="200" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr2)"/>
  <line x1="265" y1="160" x2="265" y2="200" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr2)"/>
  <line x1="435" y1="160" x2="435" y2="200" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr2)"/>
  <line x1="605" y1="160" x2="605" y2="200" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr2)"/>

  <rect x="20" y="200" width="660" height="55" rx="8" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3 3"/>
  <text x="350" y="222" fill="#e5e7eb" font-size="12" font-weight="bold" text-anchor="middle">Technical file (Annex VII) + EU Declaration of Conformity (Article 28)</text>
  <text x="350" y="240" fill="#94a3b8" font-size="10" text-anchor="middle">Same documentation backbone regardless of route — only who signs it off differs</text>

  <line x1="350" y1="255" x2="350" y2="275" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr2)"/>
  <rect x="250" y="275" width="200" height="35" rx="8" fill="#f97316" fill-opacity="0.15" stroke="#f97316" stroke-width="2"/>
  <text x="350" y="297" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">CE marking affixed</text>

  <defs>
    <marker id="arr2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8"/>
    </marker>
  </defs>
</svg>
```

## The support period — a new shape for vendor relationships

One of the CRA's most practically significant demands is the **support period**: manufacturers must provide security updates for a period appropriate to the product, and **as a rule at least five years** (shorter only where the product is expected to be in use for less time). Technical documentation and the EU declaration of conformity must be kept for at least ten years, or the support period if longer.

For industrial equipment that routinely runs for a decade or more, this reframes the commercial relationship — and creates a real procurement risk for greenfield facilities. A PLC installed in 2028 at a facility expected to operate until 2048 has a 20-year operational horizon; the CRA's floor is only 5 years. Unless a vendor contractually commits to a longer support period, the facility will be running CRA-unsupported components for most of its operating life. Security support stops being a goodwill gesture that lapses when a product line is discontinued, and becomes a legal expectation over a defined lifetime. For buyers, the support period is a negotiating anchor: you can hold a vendor to a stated window, and you can ask what happens at end of support before you sign.

## Reporting — the 24-hour clock

The CRA introduces a sharp, staged reporting regime under **Article 14**. **Actively exploited vulnerabilities** and **severe incidents** affecting product security must be notified through a single reporting platform to the manufacturer's national **CSIRT** and, simultaneously, **ENISA**. ([EC — reporting](https://digital-strategy.ec.europa.eu/en/policies/cra-reporting))

| Stage | Deadline | Content |
|---|---|---|
| **Early warning** | Within **24 hours** of becoming aware | First alert that an actively exploited vulnerability or severe incident exists, and which Member States the product has reached — so CSIRTs can cascade the alert to each other. |
| **Detailed notification** | Within **72 hours** | Product information, nature of the exploit and vulnerability, corrective/mitigating measures taken and available to users, sensitivity classification of the report. |
| **Final report** | **14 days** (vulnerability, after a fix is available) / **1 month** (severe incident) | Description, severity, impact, information on the malicious actor if known, and details of the security update delivered. ([CRA reporting deadlines](https://www.cyberresilienceact.eu/reporting.html)) |

> [!WARNING]
> **The 24-hour duty is retroactive in effect, even though the product is not.** Article 14 reporting applies from 11 September 2026 to *all* in-scope products, regardless of when they were placed on the market. A vendor does not get to argue "this SCADA system predates the CRA" — if they become aware of active exploitation after that date, the clock starts the same way it would for a 2028 product. Build the detection-and-disclosure pipeline first; it has to exist well before the product-conformity work is finished.

Two further operational consequences. First, user notification under **Article 14(8)** runs in parallel with the regulatory report, not after it — affected users must be told, ideally in a structured, machine-readable format, at the same time ENISA and the CSIRT are notified. Second, the reporting is single-submission: one report through the platform reaches the CSIRT and ENISA, which then propagates to other affected CSIRTs. Microenterprises and small enterprises get some relief from penalties for missing the 24-hour vulnerability deadline, but the obligation itself still applies.

> [!TIP]
> Treat CRA reporting and your [NIS2](/en/nis2) incident reporting as one detection-and-response capability, not two. The underlying muscle — spotting a severe event, deciding it is reportable, and getting a first notification out within a day — is the same. Build it once.

## Penalties — CRA and NIS2 compared

Non-compliance with the **essential requirements or the core manufacturer obligations** can attract fines of up to **€15 million or 2.5% of total worldwide annual turnover**, whichever is higher. Enforcement is by national market surveillance authorities, and fines apply **per product** — a manufacturer with several non-conformant product lines can face multiple, cumulative penalties.

| Tier | Violation | CRA ceiling (higher of) |
|---|---|---|
| **Tier 1** | Annex I essential requirements; Article 13 manufacturer obligations; Article 14 reporting obligations | **€15,000,000** or **2.5%** of worldwide annual turnover |
| **Tier 2** | Economic operator duties (Articles 18–23); Declaration of Conformity (Article 28); CE marking / technical documentation (Articles 30–31); conformity assessment (Article 32) | **€10,000,000** or **2%** of worldwide annual turnover |
| **Tier 3** | Supplying incorrect, incomplete or misleading information to a notified body or market surveillance authority | **€5,000,000** or **1%** of worldwide annual turnover |

**How this compares to NIS2:** the two regimes are structurally different, not just numerically. NIS2 caps essential-entity fines at **€10 million**, but its sharper edge is **personal liability** — it holds management bodies directly accountable for cybersecurity risk-management failures, independent of the corporate fine. The CRA has no equivalent personal-liability clause; its leverage is purely the turnover-linked fine, applied per non-conformant product. Together they close the loop from both directions: NIS2 makes an executive personally answerable for how their organisation manages risk; the CRA makes the products that organisation buys or builds carry an enforceable cybersecurity floor.

As with NIS2 and the [AI Act](/en/ai-act), the turnover linkage is deliberate: product security is now a board-level commercial risk, not a line item that lives and dies in engineering. ([Pillsbury — CRA requirements](https://www.pillsburylaw.com/en/news-and-insights/eu-cyber-resilience-act-requirements-products-software.html))

```cta
Not sure if you're a manufacturer, integrator, or importer under the CRA?
Getting your role and product class wrong is the most expensive mistake in CRA readiness — and the support-period and reporting clocks are already running. We map it before they run out.
Scope my CRA obligations :: /en/contact
```

## Product or system? The scoping question that changes everything

Before a single Annex I control is chosen, one deceptively simple question decides the entire compliance path: **what, exactly, is your "product"?** The CRA answers it in **Article 3(1)** — a product with digital elements is *"a software or hardware product and its remote data processing solutions, including software or hardware components being placed on the market separately."* ([EUR-Lex, official text](https://eur-lex.europa.eu/eli/reg/2024/2847/oj/eng))

The consequence is easy to miss and expensive to get wrong. The CRA applies to **each individual product unit placed on the EU market** — not to a system, an installation, or a configured solution. This is the fundamental architectural break with [IEC 62443](/en/iec-62443), which reasons at the level of a *System Under Consideration* built from zones and conduits. Two manufacturers shipping the same hardware can therefore face completely different obligations depending on how they place it on the market:

- If a packaged automation solution with four internal zones is placed on the market as **one integrated product**, the CRA treats it as a single product with a single Declaration of Conformity under **Article 28**.
- If each zone-device is placed on the market **separately**, each becomes an **independently assessed product** — its own risk assessment, its own technical file, potentially its own conformity route.

> [!IMPORTANT]
> This product-versus-system scoping is the single most common point of confusion for OT and ICS manufacturers, most of whom think natively in *systems*, not *products*. Getting it wrong cascades: it determines the conformity assessment pathway, whether a Notified Body is mandatory, and the entire scope of the technical file. It is the first thing to settle — before design, before controls, before any 62443 mapping.

## How the CRA calibrates risk — the "where applicable" mechanism

The CRA never uses Security Levels. Its calibration mechanism is the **cybersecurity risk assessment** mandated by **Article 13(2) and (3)** — and understanding it is the difference between rigorous, defensible compliance and either over-engineering or non-compliance.

**Article 13(2)** requires manufacturers to *"undertake an assessment of the cybersecurity risks associated with a product with digital elements and take the outcome of that assessment into account during the planning, design, development, production, delivery and maintenance phases."* **Article 13(3)** then ties that assessment directly to the controls: it must *"indicate whether and, if so in what manner, the security requirements set out in Part I, point (2), of Annex I are applicable."* ([EUR-Lex](https://eur-lex.europa.eu/eli/reg/2024/2847/oj/eng))

The proportionality gateway sits in two phrases. **Annex I, Part I, point (1)** sets the overarching standard — products must ensure *"an appropriate level of cybersecurity based on the risks."* The word **"appropriate"** is the legal hook for proportionality. **Annex I, Part I, point (2)** then lists the specific technical properties (access control, confidentiality, integrity, availability, minimal attack surface, and more) that apply *"on the basis of the risk assessment referred to in Article 13(2) and **where applicable**."*

That phrase — **"where applicable"**, reinforced by **Recital 55** — is the whole game. Where a specific essential requirement is not relevant to a product's intended purpose or risk profile, the manufacturer need not implement it, **provided** a clear written justification is recorded in the technical documentation under **Article 13(4)**. The official multi-stakeholder guidance (ORCWG) is explicit that manufacturers *"determine on the basis of the cybersecurity risk assessment which of those requirements are relevant"* and must document any non-application.

```keyfacts
Scope unit :: The individual product (Art. 3(1)) — not the system
Risk mechanism :: Cybersecurity risk assessment (Art. 13(2)–(3))
Proportionality hook :: "appropriate" + "where applicable" (Annex I, Part I)
Non-application :: Allowed with written justification (Art. 13(4), Recital 55)
Equivalent to :: IEC 62443 SL-T differentiation — expressed as outcomes
```

The commercial stakes are real. A manufacturer who can write a rigorous, defensible Article 13(2)–(3) assessment and map it precisely to Annex I avoids over-implementing controls that its risk profile does not warrant. A manufacturer who cannot faces the opposite: either the penalties of Article 64, or the dead-weight cost of engineering every product to a maximal specification it never needed.

## Mapping IEC 62443 Security Levels to CRA conformity

Most in-scope OT manufacturers already hold [IEC 62443](/en/iec-62443) certifications — and discover that **none of those certificates automatically satisfy the CRA.** The two frameworks are architected around different units of conformity, so the mapping has to be built deliberately. This is where OXOT's analysis goes beyond the general compliance literature.

| Dimension | IEC 62443 | Cyber Resilience Act |
|---|---|---|
| Unit of conformity | System Under Consideration; zones & conduits | The individual product placed on the market |
| Risk calibration | Security Levels SL-1 → SL-4 per zone | Risk assessment (Art. 13(2)–(3)), "where applicable" |
| Compliance evidence | SL-C certificate per component; SL-A per zone | Technical file (Annex VII) + Declaration of Conformity |
| Third-party assessment | Optional (62443-4-2 SL-C certification) | Mandatory for Important Class I (absent a harmonised standard) and Class II |
| Target/Capability/Achieved | SL-T / SL-C / SL-A are distinct | Collapsed into one documented, risk-justified outcome |

The bridge is conceptual as much as technical: **SL-T** (the target a zone requires) becomes the *input* to the Article 13(2) risk assessment; **SL-C** (a component's certified capability) becomes *evidence* toward Annex I, Part II component requirements; and **SL-A** (what a zone actually achieves) has no direct CRA analogue, because the CRA stops at the product boundary and does not certify the operator's installed system. A 62443-4-2 SL-C certificate is powerful supporting evidence in a CRA technical file — but it is not a substitute for the Annex I traceability the CRA demands.

## The harmonised-standards gap — and the Notified Body queue

The CRA's conformity routes lean heavily on **harmonised standards**: cite one in the Official Journal of the EU, and a manufacturer of an Important Class I product can self-assess against it with a presumption of conformity. The problem in 2026–2027 is timing. As of mid-2026, **no harmonised standard for the CRA has yet been cited in the Official Journal**, and the expected candidate — **EN IEC 62443-4-2 with an A11 CRA-alignment annex** — is not anticipated until roughly **Q2 2027**, only months before the main obligations bite on **11 December 2027**.

> [!WARNING]
> Until a harmonised standard is cited, **every Important Class I product without one — and every Class II product regardless — must go through a Notified Body** for conformity assessment. Notified Body capacity for the CRA is finite and being built now. Manufacturers who wait for the standard risk arriving at a queue that has already formed, with the deadline fixed and immovable.

This is the practical reason CRA readiness cannot be deferred to 2027: the reporting machinery is already due in **September 2026**, and the conformity route for higher-class products runs through third-party bodies whose capacity is scarce well before the deadline.

## The scale of the deadline — 100,000 manufacturers, one date

The CRA is not a niche obligation. The European Commission's own impact assessment identifies on the order of **100,000–110,000 economic operators** placing products with digital elements on the EU market — the overwhelming majority of whom must reach conformity by the **same 11 December 2027 date**. Layered on top is the reporting duty from **11 September 2026** covering **every in-scope product already on the market**, including long-lived industrial equipment sold years ago.

For OT specifically, that convergence is unusually sharp: industrial products are long-lived, assembled from deep supply chains, and frequently sit inside safety-related functions where the [Machinery Regulation](/en/machine-act) and, for AI-driven components, the [AI Act](/en/ai-act) apply simultaneously. The manufacturers who treat the CRA as one more standalone checklist will meet it late and expensively. The ones who fold it into a single, risk-based product-security programme — anchored in the 62443 work most already have — meet it once.

## OXOT's CRA ↔ IEC 62443 alignment methodology

This is where OXOT's own analysis goes further than the general compliance literature. IEC 62443's zone-differentiated Security Level (SL) framework does **not** map one-to-one onto the CRA — the two regimes are architected around different units. But the CRA's own risk-based proportionality mechanism produces a functionally equivalent outcome, and OXOT has built a repeatable methodology for translating between them.

### Why the two frameworks don't line up by default

| | IEC 62443 | CRA |
|---|---|---|
| **Unit of assessment** | System Under Consideration (SuC) — zones and conduits | The individual product placed on the EU market (Article 3(1)) |
| **Risk calibration** | Security Levels, SL-1 to SL-4, assigned per zone | Article 13(2)–(3) risk assessment, applied "where applicable" per Annex I requirement |
| **Compliance evidence** | SL-C certificate per component; SL-A per zone post-deployment | Technical file under Annex VII + EU Declaration of Conformity |
| **Third-party assessment** | Optional (IEC 62443-4-2 SL-C certification) | Mandatory for Important Class I without a harmonised standard, and always for Class II |
| **Harmonised standard status** | N/A | EN IEC 62443-4-1/A11:2026 and -4-2/A11:2026 not yet cited in the OJEU (expected ~Q2 2027) |

If your "product" under the CRA is a complete integrated system with four zones, the CRA treats it as **one product** with **one Declaration of Conformity**. If each zone-device is separately placed on the market, each is independently assessed. Deciding which of those two you actually are is, in OXOT's experience, the single most common point of confusion for OT manufacturers — most of whom think in systems, not products — and it is the first question our methodology answers.

### The proportionality bridge: SL-T as the CRA's risk-assessment input

The CRA does not use Security Levels. Its calibration mechanism is the Article 13(2)–(3) risk assessment, gated by the word **"appropriate"** in Annex I, Part I, point (1) — *"an appropriate level of cybersecurity based on the risks"* — and operationalised through the **"where applicable"** language in point (2).

OXOT's core finding: **an IEC 62443-3-2 zone/conduit risk assessment, which produces zone-specific SL-T values, is a fully legitimate methodology for satisfying the CRA's Article 13(2)–(3) risk assessment requirement.** A component at SL-C = 2 in a genuinely low-risk zone (SL-T = 2) is not an under-implementation — it is the correct, defensible CRA baseline for that zone, provided the risk assessment documents why. The higher-SL Requirement Enhancements that a Zone 1 or Zone 4 component would need are legitimately marked "not applicable" for the Zone 3 component — but only with a written, risk-based justification under **Article 13(4)**. Undocumented non-applicability is not a shortcut; it is a compliance failure waiting to be found in an audit.

> [!IMPORTANT]
> **The caveat that breaks most self-assessments:** IEC 62443 permits a zone's achieved security (SL-A) to meet its target (SL-T) through **compensating controls** — a firewall, an IDPS, a network policy — even where an individual component's capability (SL-C) is lower. The CRA's product-level assessment evaluates the **integrated** security posture, not isolated component specs. If a component sits at SL-C = 2 in a zone with SL-T = 3, the technical file must explicitly document *how* the compensating controls raise that zone's SL-A to 3 — a compensating-control claim with no documentation is a CRA non-conformity, not a technicality.

### FR-to-Annex-I mapping — the traceability matrix a notified body expects

The seven IEC 62443-4-2 Foundational Requirements (FRs) — each built from stacked, cumulative Component Requirements (CRs) and Requirement Enhancements (REs) across SL-1 to SL-4 — map directly to specific CRA Annex I, Part I, point (2) sub-requirements. This mapping is the traceability matrix a notified body will expect to see in a Class I or II technical file, and it is the backbone of OXOT's Phase 1 assessment deliverable.

| CRA Annex I (2) requirement | Primary IEC 62443 FR | What SL-2 typically provides | What SL-3 adds |
|---|---|---|---|
| **(b)** Protection from unauthorised access | FR1 Identification & Authentication Control, FR2 Use Control | Unique accounts, RBAC, PKI for inter-component auth | MFA for all humans, per-user ACLs, hardware authenticators |
| **(c)** Confidentiality of data | FR4 Data Confidentiality | AES-128+ in transit, secure deletion | At-rest encryption with hardware key management |
| **(d)** Integrity of data and programs | FR3 System Integrity | TLS, code-signing for updates, defined error states | Hardware root of trust, secure boot, measured launch |
| **(e)** Minimisation / restricted data flow | FR5 Restricted Data Flow | Logical segmentation, zone-boundary filtering | Physical segmentation, deep packet inspection for OT protocols (Modbus, OPC UA, DNP3) |
| **(f)** Availability of essential functions | FR7 Resource Availability | Basic DoS protection, resource limits | Application-layer DoS resistance, graceful degradation |
| **(h)** Limiting attack surfaces | FR5 (RDF), FR3 (SI) | Zone boundary filtering | Least functionality, deny-by-default |
| **(j)** Security event logging and monitoring | FR6 Timely Response to Events | Accessible audit logs, real-time detection | SIEM export (Syslog/CEF/LEEF), anomaly detection, tamper-evident logs |

The SL-2 → SL-3 escalation on FR1 — adding multi-factor authentication and hardware authenticators — is, in OXOT's experience delivering these assessments, the single most common gap finding for OT components moving from a low-risk to a high-risk zone classification.

### The synergistic method, in five steps

OXOT's methodology treats IEC 62443 not as a substitute for CRA conformity, but as the engineering content that fills the CRA's deliberately outcome-based requirements:

1. **Scope the "product."** Determine what constitutes a single product under Article 3(1) — a full system with one Declaration of Conformity, or separately placed zone-devices each requiring independent assessment.
2. **Run the zone/conduit risk assessment (IEC 62443-3-2).** Produce SL-T values per zone, with documented threat-actor characterisation per IEC 62443-1-1. This *is* the CRA Article 13(2) risk assessment — not a parallel exercise.
3. **Map FR/CR/RE depth to Annex I, per zone.** For each Annex I point (2) sub-requirement, record which FR/CR/RE combination implements it, at what SL depth, in each zone.
4. **Document non-applicability and compensating controls.** Every Requirement Enhancement not implemented gets an Article 13(4) justification; every SL-C < SL-T gap gets a compensating-control demonstration that the zone still reaches SL-A ≥ SL-T.
5. **Assemble the Annex VII technical file.** Risk assessment, Annex I compliance matrix (with FR/CR/RE traceability), SBOM, standards referenced (citing IEC 62443-4-1/4-2 as "other relevant technical specification" under Annex VII §5 until formal harmonisation), and the conformity assessment pathway — Module A, B+C, or H as classification dictates.

**Until EN IEC 62443-4-1/A11:2026 and -4-2/A11:2026 are formally cited in the OJEU**, IEC 62443 certificates support the technical argument in the file but do not, on their own, confer a presumption of conformity. Manufacturers who have already built to 62443 have done most of the underlying engineering work — the gap OXOT closes is the documented, article-referenced translation from SL-C certificates to an Annex I compliance matrix a notified body or market surveillance authority will actually accept.

## The CRA synergy flow

```svg
<svg viewBox="0 0 700 380" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif">
  <rect x="30" y="20" width="290" height="60" rx="8" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <text x="175" y="46" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">IEC 62443-3-2</text>
  <text x="175" y="64" fill="#94a3b8" font-size="11" text-anchor="middle">Zone/conduit risk assessment → SL-T per zone</text>

  <rect x="380" y="20" width="290" height="60" rx="8" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <text x="525" y="46" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">CRA Article 13(2)–(3)</text>
  <text x="525" y="64" fill="#94a3b8" font-size="11" text-anchor="middle">Cybersecurity risk assessment — "where applicable"</text>

  <line x1="320" y1="50" x2="380" y2="50" stroke="#f97316" stroke-width="2.5" marker-end="url(#arr3)"/>
  <text x="350" y="40" fill="#f97316" font-size="10" text-anchor="middle">satisfies</text>

  <line x1="175" y1="80" x2="175" y2="110" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr3)"/>
  <line x1="525" y1="80" x2="525" y2="110" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr3)"/>

  <rect x="30" y="110" width="290" height="60" rx="8" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <text x="175" y="136" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">FR / CR / RE per zone</text>
  <text x="175" y="154" fill="#94a3b8" font-size="11" text-anchor="middle">SL-C achieved by each component</text>

  <rect x="380" y="110" width="290" height="60" rx="8" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <text x="525" y="136" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">Annex I, Part I point (2)</text>
  <text x="525" y="154" fill="#94a3b8" font-size="11" text-anchor="middle">13 essential requirements, mapped per zone</text>

  <line x1="320" y1="140" x2="380" y2="140" stroke="#f97316" stroke-width="2.5" marker-end="url(#arr3)"/>
  <text x="350" y="130" fill="#f97316" font-size="10" text-anchor="middle">maps to</text>

  <line x1="175" y1="170" x2="175" y2="200" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr3)"/>
  <line x1="525" y1="170" x2="525" y2="200" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr3)"/>

  <rect x="30" y="200" width="290" height="60" rx="8" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="3 3"/>
  <text x="175" y="226" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">Gaps: SL-C &lt; SL-T</text>
  <text x="175" y="244" fill="#94a3b8" font-size="11" text-anchor="middle">Compensating controls documented</text>

  <rect x="380" y="200" width="290" height="60" rx="8" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="3 3"/>
  <text x="525" y="226" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">Non-applicable REs</text>
  <text x="525" y="244" fill="#94a3b8" font-size="11" text-anchor="middle">Article 13(4) written justification</text>

  <line x1="320" y1="230" x2="380" y2="230" stroke="#f97316" stroke-width="2.5" marker-end="url(#arr3)"/>

  <line x1="175" y1="260" x2="350" y2="300" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr3)"/>
  <line x1="525" y1="260" x2="350" y2="300" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr3)"/>

  <rect x="200" y="300" width="300" height="60" rx="8" fill="#f97316" fill-opacity="0.15" stroke="#f97316" stroke-width="2"/>
  <text x="350" y="326" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">Annex VII technical file</text>
  <text x="350" y="344" fill="#94a3b8" font-size="11" text-anchor="middle">Traceability matrix a notified body will expect</text>

  <defs>
    <marker id="arr3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8"/>
    </marker>
  </defs>
</svg>
```

## The CRA and OT — two sides of the same coin

The CRA and NIS2 are complementary halves of one strategy. **[NIS2](/en/nis2)** obliges operators to manage the risk of the systems they run; the CRA obliges manufacturers to make those systems securable in the first place. An operator's NIS2 supply-chain duty (Article 21) becomes far easier to discharge when the products in the chain are CRA-compliant — arriving with SBOMs, security updates and a support commitment instead of a shrug.

For operators bringing greenfield facilities online in 2028 and beyond, procurement specifications should now name the CRA explicitly: CE marking reference, DoC reference number, support-period end-date, SBOM delivery format (SPDX or CycloneDX), and the vendor's CVD policy URL. For post-2027 refits and retrofits of existing plant, the operative question is whether the change constitutes a **substantial modification** — like-for-like replacement and security patching generally do not trigger full CRA compliance; adding new digital capability, or a platform-level SCADA upgrade, generally does.

**[IEC 62443](/en/iec-62443)** remains the natural engineering bridge for OT vendors, and **[TS 50701](/en/ts-50701)** extends the same discipline into rail. Where the CRA is legally binding but standard-agnostic, 62443 supplies the concrete engineering content — a pairing that also travels well across the broader [frameworks](/en/frameworks) landscape.

## OXOT's CRA Readiness offering

```carousel
CRA Readiness Assessment (Annex A)
A structured gap assessment against the CRA's essential requirements, scoped per product. We classify each product against Annex III/IV and Commission Implementing Regulation 2025/2392, determine the conformity route it actually needs, and produce a prioritised gap list against Annex I Part I and Part II — not a pass/fail, but a concrete list of what has to change before a Declaration of Conformity is defensible.
---
CRA Preparation Service
Where the assessment finds gaps, this is the delivery arm: building the vulnerability-handling machine (SBOM pipeline, CVD policy, single point of contact, testing cadence), compiling the Annex VII technical file, and preparing the product for whichever conformity route applies — self-assessment evidence for Default and harmonised-standard Class I, or a notified-body-ready dossier for Class I without a standard, Class II, and Critical products.
---
Statutes 2-Pager companion
A concise, product-specific reference mapping your product category directly to its governing CRA statutes — classification tier, applicable Annex I requirements, conformity route, and the specific articles a market surveillance authority will cite. Built to sit next to the technical file as a quick-reference companion for engineering and legal teams alike.
---
CRA ↔ IEC 62443 harmonisation method
Our core differentiator: the FR/CR/RE-to-Annex-I traceability matrix, applied zone by zone. For manufacturers already built to IEC 62443, this is the fastest route to a CRA-defensible technical file — translating existing SL-C certificates and zone risk assessments into the documented, Article 13(4)-compliant justifications a notified body or market surveillance authority will actually accept.
```

## The manufacturer's readiness journey

Getting to CRA conformity is a sequence, not a switch. The five stages below track how most OT product teams will move from "aware of the deadline" to "CE mark defensible."

```carousel
Stage 1 — Scope and classify
Inventory every product with digital elements you place on the EU market. For each, decide the class: default, important Class I/II, or critical. The class fixes your conformity route and therefore your timeline. This is also where you find the products where you have quietly become the "manufacturer" through rebranding or substantial modification.
---
Stage 2 — Gap-assess against Annex I
Measure each product against Annex I Part I (security properties) and Part II (vulnerability handling). Teams already aligned to IEC 62443-4-1/4-2 will find much of this maps across — but the mapping has to be documented per requirement, not assumed. The output is a prioritised gap list, not a pass/fail — most products need work in a handful of specific areas rather than a rebuild.
---
Stage 3 — Build the vulnerability-handling machine
Stand up the SBOM pipeline, coordinated disclosure policy, reporting contact, testing cadence, and secure update mechanism. This is the part that has to be live by 11 September 2026 for reporting, so it leads the schedule — ahead of the product-conformity work itself.
---
Stage 4 — Conformity assessment and CE
Run the applicable procedure: self-assessment for default and (with harmonised standards) Class I, or a notified body for Class II and critical. Assemble technical documentation, issue the EU declaration of conformity, and affix the CE marking. Notified-body capacity is finite, and lead times of 4–10 months are common — book early.
---
Stage 5 — Operate across the support period
Sustain updates, monitoring and disclosure for the support period — as a rule at least five years. Keep technical documentation for ten years. Feed field findings back into design. Conformity is a state you maintain, not a certificate you file and forget.
```

## What it means for your role

**If you manufacture, integrate or rebrand industrial products**, the CRA is a direct compliance obligation with a hard 2027 deadline and a 2026 reporting waypoint. Classify the portfolio, build secure-development and vulnerability-handling processes, produce SBOMs, commit to a support period, and — for important and critical products — line up conformity assessment while notified-body slots exist.

**If you are an operator or buyer**, the CRA is leverage. From 2027 the products you buy must meet the essential requirements; before then, you can already write CRA-aligned expectations — an SBOM, free security updates, a stated support window, a disclosure contact — into procurement and tender criteria. The Act hands buyers a vocabulary they never had, and it should shape how you plan greenfield builds and post-2027 refits alike.

**If you sit on the board of a manufacturer**, the CRA adds another turnover-linked penalty regime and turns product security into a governance matter with a defined runway. The question to ask management is not "are we compliant?" but "which products are on which conformity route, and what is the critical path to 2027?"

## How OXOT helps

OXOT works both sides of the CRA. For **operators**, we fold CRA-aligned requirements into procurement and into the supply-chain dimension of your NIS2 and OT security programmes, and our **[Cyber Digital Twin](/en/cyber-digital-twin)** gives you a structured place to hold vendor SBOMs and component risk so a new CVE in a shared library is a lookup, not a fire drill. For **manufacturers and integrators**, we translate Annex I into an engineering programme aligned to [IEC 62443](/en/iec-62443)-4-1/4-2 — using our own FR/CR/RE-to-Annex-I traceability method to turn the regulation into a concrete, evidenced path to conformity rather than a compliance scramble.

*OXOT's CRA Readiness Assessment, Preparation Service, and Statutes 2-Pager are available as standalone engagements or as a combined programme — reach out to scope your product portfolio.*

## Frequently asked questions

**Does the CRA apply to software as well as hardware?**
Yes. Standalone software is a product with digital elements. Firmware and application software are both in scope, subject to the sectoral carve-outs (certain medical, automotive and aviation products regulated elsewhere).

**We integrate third-party controllers into our machines. Are we a manufacturer under the CRA?**
Possibly. If you place the integrated product on the market under your own name, or substantially modify components, you can take on manufacturer obligations. Map your role per product before 2027 — and watch the "substantial modification" line closely; routine maintenance and like-for-like repairs generally do not trigger it, but adding new digital capability or a platform-level upgrade generally does.

**Is an SBOM really mandatory?**
Annex I Part II requires manufacturers to identify and document components, including producing a software bill of materials, as part of vulnerability handling. Treat it as a core deliverable, not an optional extra — and treat it as a living document, since a stale SBOM cannot support the 24-hour reporting clock.

**When exactly do we have to start reporting?**
The Article 14 reporting obligations apply from **11 September 2026** — earlier than the main obligations, and to products already on the market, not just new ones. An actively exploited vulnerability or severe incident triggers a 24-hour early warning, a 72-hour notification, and a final report (14 days for a vulnerability once fixed, one month for a severe incident).

**How long must we support a product?**
As a rule at least five years, or the product's expected time in use if shorter. Retain technical documentation and the declaration of conformity for at least ten years, or the support period if longer. For long-life industrial equipment, negotiate a longer commitment explicitly — the CRA sets a floor, not a ceiling.

**Does our existing IEC 62443 SL-C certificate satisfy the CRA?**
Not automatically, and not yet formally. Until EN IEC 62443-4-1/A11:2026 and -4-2/A11:2026 are cited in the EU Official Journal (expected ~Q2 2027), 62443 certification supports your technical argument as "other relevant technical specification" but does not confer a presumption of conformity. It does, however, supply most of the engineering evidence a notified body will want — provided it is mapped to specific Annex I requirements rather than cited in general terms.

**How does the CRA relate to the AI Act, NIS2 and the Machinery Regulation?**
The **[AI Act](/en/ai-act)** governs AI systems, the CRA governs products with digital elements, **[NIS2](/en/nis2)** governs operators, and the **[Machinery Regulation](/en/machine-act)** governs machinery safety including digital control. A connected industrial machine with an AI safety component could engage all four — which is exactly why a single, coherent OT security programme beats four disconnected compliance efforts.

## OXOT CRA Readiness resources

Practical materials from OXOT's CRA Readiness programme:

- **[CRA Readiness — Annex A sales sheet (PDF)](/media/OXOT-CRA-Readiness-Annex-A.pdf)** — the assessment scope, deliverables and how the readiness engagement maps to CRA obligations.

Watch the CRA Readiness overview:

```html
<video controls preload="metadata" poster="" style="width:100%;border:1px solid rgba(148,163,184,0.35);border-radius:12px;background:#0b1220">
  <source src="/media/OXOT-CRA-Readiness.mp4" type="video/mp4" />
  Your browser does not support the video tag. <a href="/media/OXOT-CRA-Readiness.mp4">Download the video</a>.
</video>
```

## Sources

- Regulation (EU) 2024/2847 (Cyber Resilience Act), official text — [EUR-Lex](https://eur-lex.europa.eu/eli/reg/2024/2847/oj/eng)
- Cyber Resilience Act policy overview — [European Commission](https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act)
- CRA summary of the legislative text — [European Commission](https://digital-strategy.ec.europa.eu/en/policies/cra-summary)
- CRA conformity assessment — [European Commission](https://digital-strategy.ec.europa.eu/en/policies/cra-conformity-assessment)
- CRA reporting obligations — [European Commission](https://digital-strategy.ec.europa.eu/en/policies/cra-reporting)
- CRA scope, classes and deadlines — [cyberresilienceact.eu](https://www.cyberresilienceact.eu/explained.html)
- CRA annexes I–VIII, essential requirements and product lists — [cyberresilienceact.eu](https://www.cyberresilienceact.eu/annexes.html)
- CRA reporting deadlines (Article 14) — [cyberresilienceact.eu](https://www.cyberresilienceact.eu/reporting.html)
- CRA requirements for connected products and software — [Pillsbury Law](https://www.pillsburylaw.com/en/news-and-insights/eu-cyber-resilience-act-requirements-products-software.html)
- CENELEC TC65X WG3, "EN IEC 62443 to CRA" webinar — [cencenelec.eu](https://www.cencenelec.eu/news-events/events/2025/2025-09-09-en-iec-62443-to-cra/)
- ENISA, "CRA Practical Insights" — [enisa.europa.eu](https://www.enisa.europa.eu/sites/default/files/2025-12/session%203-1%20-%20reusch%20law%20-%20cra%20practical%20insights.pdf)
- ORCWG, CRA Official FAQ — [cra.orcwg.org](https://cra.orcwg.org/faq/official/faq_4-1-3/)
- CRA Penalties and Sanctions — [eu-cyber-laws.com](https://eu-cyber-laws.com/cra/penalties/)
- OXOT internal analysis: CRA Obligations Reference, CRA Class I/II Products, CRA and NIS2 Penalties, CRA × IEC 62443 Alignment Reference (OXOT B.V. internal strategic reference material, 2026)

*This page is general information about EU law, not legal advice. Confirm how the CRA applies to your products and role against the Regulation and, where needed, qualified counsel. The CRA↔IEC 62443 alignment analysis reflects OXOT's own methodology and interpretation as of mid-2026; formal harmonised-standard citation may refine specific mappings.*
