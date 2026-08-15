---
id: "EP_3.01"
canonical_code: "EP_3.01"
title: "The Spare Parts Illusion: Demystifying Article 2(6) & Recital 29 Exemption"
subtitle: "Plant teams assume all replacement parts are exempt. In reality, the exemption ONLY covers parts manufactured to 100% identical specifications. What happens during chip obsolescence?"
slug: "ep-3.01-the-spare-parts-illusion-demystifying-article-2-6-"
series_id: 3
episode_number: 1
series: "Brownfield OT, Spare Parts & Maintenance"
target_persona: "Maintenance Managers, Reliability Engineers, Plant Operations."
persona_category: "Plant CISOs & Asset Owners"
statutes: ["Article 2(6)", "Recital 29"]
statutory_domain: "Brownfield & Legacy OT"
difficulty: "Legal Triage"
key_metric: "Article 2(6) Exposure"
read_time: "9 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_3.01.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "Article 2(6)", "Plant CISOs & Asset Owners", "Industrial OT Security", "CE Marking"]
takeaways: ["Spares classification matrix", "obsolescence management strategy", "documenting identical-spec status for auditors"]
---

# The Spare Parts Illusion: Demystifying Article 2(6) & Recital 29 Exemption
*By Jim Mckenney — Digital Product Security Consultant & Industrial OT Architect*

> **Executive Technical Memorandum:**
> - **Statutory Scope:** `Article 2(6), Recital 29`
> - **Primary Persona:** `Maintenance Managers, Reliability Engineers, Plant Operations.` (`Plant CISOs & Asset Owners`)
> - **Curriculum Track:** `Brownfield OT, Spare Parts & Maintenance` (Track 3)
> - **Regulatory Complexity:** `Legal Triage` • **Key Exposure:** `Article 2(6) Exposure`
> - **Companion Audio Briefing:** [EP_3.01 - Audio Broadcast (14:15)](https://oxot.ai/podcast) | [Standard Series RSS](https://oxot.ai/feeds/cra-podcast.xml)

---

## 1. The Commercial Dilemma & Industrial Reality

`[EP_3.01 - Strategic Technical Briefing] The Spare Parts Illusion: Demystifying Article 2(6) & Recital 29 Exemption | Jim Mckenney`

**The Core Industry Problem:** Plant teams assume all replacement parts are exempt. In reality, the exemption ONLY covers parts manufactured to 100% identical specifications. What happens during chip obsolescence?

> *"*"If the OEM changed one capacitor or one firmware microcode branch, that replacement board is no longer an 'identical spare' under Article 2(6)."*"*

In industrial engineering and critical infrastructure operations, the arrival of **Regulation (EU) 2024/2847 (Cyber Resilience Act)** shatters historical procurement and maintenance assumptions. Stakeholders must recognize that commercial contracts, variation orders, and legacy supply chain models can no longer disclaim statutory cybersecurity conformity.

Under **Article 2(6), Recital 29**, equipment placed on the European Single Market must satisfy mandatory cybersecurity baselines, maintain cryptographic technical files, and adhere to strict zero-day vulnerability notification timelines.

---

## 2. Key Strategic & Engineering Takeaways

<div className="space-y-3 my-4">

1. **Spares classification matrix**
2. **obsolescence management strategy**
3. **documenting identical-spec status for auditors**

</div>

---

## 3. Reference Architecture & Technical Implementation

The following domain-specific architecture illustrates the compliant engineering workflow, safe-harbor isolation boundary, and regulatory decision gate for `EP_3.01`:

```mermaid
graph TD
    A["Maintenance Technician Replaces Failed PLC Module"] --> B{"Is Replacement an Exact Identical Spare?"}
    B -->|"Yes: Identical Part Number & Firmware"| C["Article 2(6) Spare Part Exemption Granted"]
    B -->|"No: Upgraded Controller / New Feature Set"| D["Substantial Modification Evaluation Required"]
    C --> E["No New CE Marking Required"]
    D --> F["Trigger Article 21 Compliance Workflow"]
```

---

## 4. Mandatory 4-Step Engineering Action Sprint

To ensure defensible compliance with **Article 2(6), Recital 29**, organizations must execute the following structured remediation sprint:

1. **Conduct Asset & Contract Scope Audit:** Inventory all active hardware variants, firmware repositories, and supplier agreements across the operational footprint.
2. **Embed Statutory Safe-Harbor Clauses:** Insert CRA bilateral compliance warranties and 10-year technical dossier retention terms into upstream supplier and EPC subcontracts.
3. **Automate CycloneDX v1.6 SBOM Vaulting:** Implement automated CI/CD bill of materials generation with cryptographic code signing stored in an immutable 10-year archive.
4. **Operationalize Article 14 24h CSIRT Notification:** Conduct simulated drills for reporting actively exploited zero-days to the ENISA Single Reporting Platform within the mandatory 24-hour statutory window.

---

## 5. Statutory Cross-References & Legal Text

- **EU Cyber Resilience Act:** [Read Article 2(6), Recital 29 in the Interactive CRA Legal Wiki](http://localhost:8088/conformity/cra-wiki?tab=articles&num=2(6))
- **Audio Intelligence Platform:** [Listen to the Full Audio Episode](https://oxot.ai/podcast)
- **Technical Consultation:** [Schedule an Architecture Review with OXOT Advisory](http://localhost:8088/contact)
