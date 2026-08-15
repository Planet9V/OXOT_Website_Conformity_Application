---
id: "EP_2.01"
canonical_code: "EP_2.01"
title: "The Accidental Manufacturer: How System Integrators Trigger Article 21 Liability"
subtitle: "An integrator connects 5 certified PLCs, writes custom Python SCADA scripts, and configures an edge gateway. Did they just become the "Manufacturer" of a composite PDE?"
slug: "ep-2.01-the-accidental-manufacturer-how-system-integrators"
series_id: 2
episode_number: 1
series: "The System Integrator & EPC Shield"
target_persona: "Industrial System Integrators (Axians, VINCI, Spie, Actemium), Automation Engineers."
persona_category: "EPC & Integrators"
statutes: ["Article 21", "Recital 24"]
statutory_domain: "System Integration & Art 21"
difficulty: "Advanced Engineering"
key_metric: "Article 21 Exposure"
read_time: "9 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_2.01.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "Article 21", "EPC & Integrators", "Industrial OT Security", "CE Marking"]
takeaways: ["The 4-part Substantial Modification test", "safe-harbor integration architectures", "customer acceptance sign-offs"]
---

# The Accidental Manufacturer: How System Integrators Trigger Article 21 Liability
*By Jim Mckenney — Digital Product Security Consultant & Industrial OT Architect*

> **Executive Technical Memorandum:**
> - **Statutory Scope:** `Article 21, Recital 24`
> - **Primary Persona:** `Industrial System Integrators (Axians, VINCI, Spie, Actemium), Automation Engineers.` (`EPC & Integrators`)
> - **Curriculum Track:** `The System Integrator & EPC Shield` (Track 2)
> - **Regulatory Complexity:** `Advanced Engineering` • **Key Exposure:** `Article 21 Exposure`
> - **Companion Audio Briefing:** [EP_2.01 - Audio Broadcast (14:15)](https://oxot.ai/podcast) | [Standard Series RSS](https://oxot.ai/feeds/cra-podcast.xml)

---

## 1. The Commercial Dilemma & Industrial Reality

`[EP_2.01 - Strategic Technical Briefing] The Accidental Manufacturer: How System Integrators Trigger Article 21 Liability | Jim Mckenney`

**The Core Industry Problem:** An integrator connects 5 certified PLCs, writes custom Python SCADA scripts, and configures an edge gateway. Did they just become the "Manufacturer" of a composite PDE?

> *"*"You thought you were billing engineering hours as an integrator. The EU Commission sees you as a hardware manufacturer with 5-year CE liabilities."*"*

In industrial engineering and critical infrastructure operations, the arrival of **Regulation (EU) 2024/2847 (Cyber Resilience Act)** shatters historical procurement and maintenance assumptions. Stakeholders must recognize that commercial contracts, variation orders, and legacy supply chain models can no longer disclaim statutory cybersecurity conformity.

Under **Article 21, Recital 24**, equipment placed on the European Single Market must satisfy mandatory cybersecurity baselines, maintain cryptographic technical files, and adhere to strict zero-day vulnerability notification timelines.

---

## 2. Key Strategic & Engineering Takeaways

<div className="space-y-3 my-4">

1. **The 4-part Substantial Modification test**
2. **safe-harbor integration architectures**
3. **customer acceptance sign-offs**

</div>

---

## 3. Reference Architecture & Technical Implementation

The following domain-specific architecture illustrates the compliant engineering workflow, safe-harbor isolation boundary, and regulatory decision gate for `EP_2.01`:

```mermaid
graph TD
    A["System Integrator Field Deployment"] --> B["Custom Scripting & PLC Logic Modification"]
    B --> C{"Does Change Alter Safety / Threat Profile?"}
    C -->|"Yes: Substantial Modification (Art 21)"| D["SI Legally Becomes 'Manufacturer'"]
    C -->|"No: Minor Configuration"| E["Retain Original OEM CE Mark"]
    D --> F["Mandatory Annex VII Technical Dossier Creation"]
    D --> G["Issue New EU Declaration of Conformity under SI Name"]
```

---

## 4. Mandatory 4-Step Engineering Action Sprint

To ensure defensible compliance with **Article 21, Recital 24**, organizations must execute the following structured remediation sprint:

1. **Conduct Asset & Contract Scope Audit:** Inventory all active hardware variants, firmware repositories, and supplier agreements across the operational footprint.
2. **Embed Statutory Safe-Harbor Clauses:** Insert CRA bilateral compliance warranties and 10-year technical dossier retention terms into upstream supplier and EPC subcontracts.
3. **Automate CycloneDX v1.6 SBOM Vaulting:** Implement automated CI/CD bill of materials generation with cryptographic code signing stored in an immutable 10-year archive.
4. **Operationalize Article 14 24h CSIRT Notification:** Conduct simulated drills for reporting actively exploited zero-days to the ENISA Single Reporting Platform within the mandatory 24-hour statutory window.

---

## 5. Statutory Cross-References & Legal Text

- **EU Cyber Resilience Act:** [Read Article 21, Recital 24 in the Interactive CRA Legal Wiki](http://localhost:8088/conformity/cra-wiki?tab=articles&num=21)
- **Audio Intelligence Platform:** [Listen to the Full Audio Episode](https://oxot.ai/podcast)
- **Technical Consultation:** [Schedule an Architecture Review with OXOT Advisory](http://localhost:8088/contact)
