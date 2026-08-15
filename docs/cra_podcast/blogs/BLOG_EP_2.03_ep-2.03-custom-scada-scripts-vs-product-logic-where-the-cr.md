---
id: "EP_2.03"
canonical_code: "EP_2.03"
title: "Custom SCADA Scripts vs. Product Logic: Where the CRA Regulatory Line Is Drawn"
subtitle: "Does writing custom ladder logic or Ignition/WinCC dashboards constitute creating a "software product" under CRA?"
slug: "ep-2.03-custom-scada-scripts-vs-product-logic-where-the-cr"
series_id: 2
episode_number: 3
series: "The System Integrator & EPC Shield"
target_persona: "HMI/SCADA Developers, PLC Programmers, Automation Architects."
persona_category: "EPC & Integrators"
statutes: ["Article 2(1)", "Recital 6"]
statutory_domain: "System Integration & Art 21"
difficulty: "Advanced Engineering"
key_metric: "Article 2(1) Exposure"
read_time: "9 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_2.03.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "Article 2(1)", "EPC & Integrators", "Industrial OT Security", "CE Marking"]
takeaways: ["Differentiating bespoke software from commercial software products", "configuration vs. programming boundaries", "documentation shields"]
---

# Custom SCADA Scripts vs. Product Logic: Where the CRA Regulatory Line Is Drawn
*By Jim Mckenney — Digital Product Security Consultant & Industrial OT Architect*

> **Executive Technical Memorandum:**
> - **Statutory Scope:** `Article 2(1), Recital 6`
> - **Primary Persona:** `HMI/SCADA Developers, PLC Programmers, Automation Architects.` (`EPC & Integrators`)
> - **Curriculum Track:** `The System Integrator & EPC Shield` (Track 2)
> - **Regulatory Complexity:** `Advanced Engineering` • **Key Exposure:** `Article 2(1) Exposure`
> - **Companion Audio Briefing:** [EP_2.03 - Audio Broadcast (14:15)](https://oxot.ai/podcast) | [Standard Series RSS](https://oxot.ai/feeds/cra-podcast.xml)

---

## 1. The Commercial Dilemma & Industrial Reality

`[EP_2.03 - Strategic Technical Briefing] Custom SCADA Scripts vs. Product Logic: Where the CRA Regulatory Line Is Drawn | Jim Mckenney`

**The Core Industry Problem:** Does writing custom ladder logic or Ignition/WinCC dashboards constitute creating a "software product" under CRA?

> *"*"When does a bespoke plant script cross the statutory threshold into a commercial software product?"*"*

In industrial engineering and critical infrastructure operations, the arrival of **Regulation (EU) 2024/2847 (Cyber Resilience Act)** shatters historical procurement and maintenance assumptions. Stakeholders must recognize that commercial contracts, variation orders, and legacy supply chain models can no longer disclaim statutory cybersecurity conformity.

Under **Article 2(1), Recital 6**, equipment placed on the European Single Market must satisfy mandatory cybersecurity baselines, maintain cryptographic technical files, and adhere to strict zero-day vulnerability notification timelines.

---

## 2. Key Strategic & Engineering Takeaways

<div className="space-y-3 my-4">

1. **Differentiating bespoke software from commercial software products**
2. **configuration vs. programming boundaries**
3. **documentation shields**

</div>

---

## 3. Reference Architecture & Technical Implementation

The following domain-specific architecture illustrates the compliant engineering workflow, safe-harbor isolation boundary, and regulatory decision gate for `EP_2.03`:

```mermaid
graph TD
    A["Industrial Automation Logic Deployment"] --> B{"Architecture Boundary Classification"}
    B -->|"Custom User SCADA Scripts"| C["Article 2(1) Operational Configuration Boundary"]
    B -->|"Compiled Microservices / Gateway Firmware"| D["Standalone Product with Digital Elements"]
    C --> E["Asset Owner Operational Security (NIS2)"]
    D --> F["Full CRA Scope: CE Marking & SBOM Required"]
```

---

## 4. Mandatory 4-Step Engineering Action Sprint

To ensure defensible compliance with **Article 2(1), Recital 6**, organizations must execute the following structured remediation sprint:

1. **Conduct Asset & Contract Scope Audit:** Inventory all active hardware variants, firmware repositories, and supplier agreements across the operational footprint.
2. **Embed Statutory Safe-Harbor Clauses:** Insert CRA bilateral compliance warranties and 10-year technical dossier retention terms into upstream supplier and EPC subcontracts.
3. **Automate CycloneDX v1.6 SBOM Vaulting:** Implement automated CI/CD bill of materials generation with cryptographic code signing stored in an immutable 10-year archive.
4. **Operationalize Article 14 24h CSIRT Notification:** Conduct simulated drills for reporting actively exploited zero-days to the ENISA Single Reporting Platform within the mandatory 24-hour statutory window.

---

## 5. Statutory Cross-References & Legal Text

- **EU Cyber Resilience Act:** [Read Article 2(1), Recital 6 in the Interactive CRA Legal Wiki](http://localhost:8088/conformity/cra-wiki?tab=articles&num=2(1))
- **Audio Intelligence Platform:** [Listen to the Full Audio Episode](https://oxot.ai/podcast)
- **Technical Consultation:** [Schedule an Architecture Review with OXOT Advisory](http://localhost:8088/contact)
