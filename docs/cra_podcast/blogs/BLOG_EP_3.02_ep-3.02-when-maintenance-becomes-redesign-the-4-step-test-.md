---
id: "EP_3.02"
canonical_code: "EP_3.02"
title: "When Maintenance Becomes Redesign: The 4-Step Test for Brownfield Retrofits"
subtitle: "Upgrading a legacy 2005 packaging line with remote Ethernet diagnostics—routine maintenance or substantial modification?"
slug: "ep-3.02-when-maintenance-becomes-redesign-the-4-step-test-"
series_id: 3
episode_number: 2
series: "Brownfield OT, Spare Parts & Maintenance"
target_persona: "Plant Asset Managers, Maintenance Directors, OT Systems Engineers."
persona_category: "Plant CISOs & Asset Owners"
statutes: ["Article 21", "Recital 24"]
statutory_domain: "Brownfield & Legacy OT"
difficulty: "Legal Triage"
key_metric: "Article 21 Exposure"
read_time: "9 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_3.02.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "Article 21", "Plant CISOs & Asset Owners", "Industrial OT Security", "CE Marking"]
takeaways: ["The 4-gate modification test", "mitigating network segmentation tactics", "documentation templates for maintenance logs"]
---

# When Maintenance Becomes Redesign: The 4-Step Test for Brownfield Retrofits
*By Jim Mckenney — Digital Product Security Consultant & Industrial OT Architect*

> **Executive Technical Memorandum:**
> - **Statutory Scope:** `Article 21, Recital 24`
> - **Primary Persona:** `Plant Asset Managers, Maintenance Directors, OT Systems Engineers.` (`Plant CISOs & Asset Owners`)
> - **Curriculum Track:** `Brownfield OT, Spare Parts & Maintenance` (Track 3)
> - **Regulatory Complexity:** `Legal Triage` • **Key Exposure:** `Article 21 Exposure`
> - **Companion Audio Briefing:** [EP_3.02 - Audio Broadcast (14:15)](https://oxot.ai/podcast) | [Standard Series RSS](https://oxot.ai/feeds/cra-podcast.xml)

---

## 1. The Commercial Dilemma & Industrial Reality

`[EP_3.02 - Strategic Technical Briefing] When Maintenance Becomes Redesign: The 4-Step Test for Brownfield Retrofits | Jim Mckenney`

**The Core Industry Problem:** Upgrading a legacy 2005 packaging line with remote Ethernet diagnostics—routine maintenance or substantial modification?

> *"*"Adding a €500 cellular gateway to a 20-year-old compressor can instantly trigger a full CE re-certification of the machine."*"*

In industrial engineering and critical infrastructure operations, the arrival of **Regulation (EU) 2024/2847 (Cyber Resilience Act)** shatters historical procurement and maintenance assumptions. Stakeholders must recognize that commercial contracts, variation orders, and legacy supply chain models can no longer disclaim statutory cybersecurity conformity.

Under **Article 21, Recital 24**, equipment placed on the European Single Market must satisfy mandatory cybersecurity baselines, maintain cryptographic technical files, and adhere to strict zero-day vulnerability notification timelines.

---

## 2. Key Strategic & Engineering Takeaways

<div className="space-y-3 my-4">

1. **The 4-gate modification test**
2. **mitigating network segmentation tactics**
3. **documentation templates for maintenance logs**

</div>

---

## 3. Reference Architecture & Technical Implementation

The following domain-specific architecture illustrates the compliant engineering workflow, safe-harbor isolation boundary, and regulatory decision gate for `EP_3.02`:

```mermaid
graph TD
    A["Proposed Brownfield Plant Retrofit"] --> B["Step 1: Does It Alter Intended Purpose?"]
    B -->|"Yes"| G["Substantial Modification (Art 21)"]
    B -->|"No"| C["Step 2: Does It Introduce New Attack Vectors?"]
    C -->|"Yes"| G
    C -->|"No"| D["Step 3: Does It Affect Safety Functions?"]
    D -->|"Yes"| G
    D -->|"No"| E["Step 4: Does It Modify Compiled Binaries?"]
    E -->|"No"| F["Permitted Routine Maintenance"]
    E -->|"Yes"| G
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
