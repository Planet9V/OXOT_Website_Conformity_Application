---
id: "EP_5.04"
canonical_code: "EP_5.04"
title: "Water & Wastewater Utilities: SCADA, Remote Telemetry & Dosing Controllers"
subtitle: "Remote pumping stations and chemical treatment facilities rely on cellular telemetry RTUs. How to achieve CRA compliance on low-power, remote devices?"
slug: "ep-5.04-water-wastewater-utilities-scada-remote-telemetry-"
series_id: 5
episode_number: 4
series: "Critical Sector Deep Dives"
target_persona: "Municipal Water Engineers, SCADA Supervisors, Utility Directors."
persona_category: "Plant CISOs & Asset Owners"
statutes: ["Annex I", "Annex III"]
statutory_domain: "Class I/II Critical Sectors"
difficulty: "Executive Policy"
key_metric: "Article Annex I Exposure"
read_time: "9 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_5.04.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "Annex I", "Plant CISOs & Asset Owners", "Industrial OT Security", "CE Marking"]
takeaways: ["Cellular RTU encryption standards", "zero-trust remote access", "automated backup & fail-safe architectures"]
---

# Water & Wastewater Utilities: SCADA, Remote Telemetry & Dosing Controllers
*By Jim Mckenney — Digital Product Security Consultant & Industrial OT Architect*

> **Executive Technical Memorandum:**
> - **Statutory Scope:** `Annex I, Annex III`
> - **Primary Persona:** `Municipal Water Engineers, SCADA Supervisors, Utility Directors.` (`Plant CISOs & Asset Owners`)
> - **Curriculum Track:** `Critical Sector Deep Dives` (Track 5)
> - **Regulatory Complexity:** `Executive Policy` • **Key Exposure:** `Article Annex I Exposure`
> - **Companion Audio Briefing:** [EP_5.04 - Audio Broadcast (14:15)](https://oxot.ai/podcast) | [Standard Series RSS](https://oxot.ai/feeds/cra-podcast.xml)

---

## 1. The Commercial Dilemma & Industrial Reality

`[EP_5.04 - Strategic Technical Briefing] Water & Wastewater Utilities: SCADA, Remote Telemetry & Dosing Controllers | Jim Mckenney`

**The Core Industry Problem:** Remote pumping stations and chemical treatment facilities rely on cellular telemetry RTUs. How to achieve CRA compliance on low-power, remote devices?

> *"*"Remote water pumping stations with cellular RTUs: securing critical public infrastructure against remote chemical dosing tampering."*"*

In industrial engineering and critical infrastructure operations, the arrival of **Regulation (EU) 2024/2847 (Cyber Resilience Act)** shatters historical procurement and maintenance assumptions. Stakeholders must recognize that commercial contracts, variation orders, and legacy supply chain models can no longer disclaim statutory cybersecurity conformity.

Under **Annex I, Annex III**, equipment placed on the European Single Market must satisfy mandatory cybersecurity baselines, maintain cryptographic technical files, and adhere to strict zero-day vulnerability notification timelines.

---

## 2. Key Strategic & Engineering Takeaways

<div className="space-y-3 my-4">

1. **Cellular RTU encryption standards**
2. **zero-trust remote access**
3. **automated backup & fail-safe architectures**

</div>

---

## 3. Reference Architecture & Technical Implementation

The following domain-specific architecture illustrates the compliant engineering workflow, safe-harbor isolation boundary, and regulatory decision gate for `EP_5.04`:

```mermaid
graph TD
    A["Municipal Water Treatment Plant"] --> B["Chemical Dosing & Chlorination PLCs"]
    A --> C["Cellular Remote Telemetry Units (RTU) at Pumping Stations"]
    A --> D["Central SCADA Historian & HMI"]
    B & C & D --> E["Dual Scope: NIS2 Essential Entity + CRA Annex III Class I"]
    E --> F["24h Single-Window Incident Dispatch to National CSIRT"]
```

---

## 4. Mandatory 4-Step Engineering Action Sprint

To ensure defensible compliance with **Annex I, Annex III**, organizations must execute the following structured remediation sprint:

1. **Conduct Asset & Contract Scope Audit:** Inventory all active hardware variants, firmware repositories, and supplier agreements across the operational footprint.
2. **Embed Statutory Safe-Harbor Clauses:** Insert CRA bilateral compliance warranties and 10-year technical dossier retention terms into upstream supplier and EPC subcontracts.
3. **Automate CycloneDX v1.6 SBOM Vaulting:** Implement automated CI/CD bill of materials generation with cryptographic code signing stored in an immutable 10-year archive.
4. **Operationalize Article 14 24h CSIRT Notification:** Conduct simulated drills for reporting actively exploited zero-days to the ENISA Single Reporting Platform within the mandatory 24-hour statutory window.

---

## 5. Statutory Cross-References & Legal Text

- **EU Cyber Resilience Act:** [Read Annex I, Annex III in the Interactive CRA Legal Wiki](http://localhost:8088/conformity/cra-wiki?tab=articles&num=Annex I)
- **Audio Intelligence Platform:** [Listen to the Full Audio Episode](https://oxot.ai/podcast)
- **Technical Consultation:** [Schedule an Architecture Review with OXOT Advisory](http://localhost:8088/contact)
