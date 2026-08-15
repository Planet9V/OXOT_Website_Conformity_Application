---
id: "EP_5.02"
canonical_code: "EP_5.02"
title: "Smart Buildings & Real Estate: BACnet, Modbus, Access Control & Elevators"
subtitle: "Millions of building sensors use plaintext protocols. How do building automation integrators upgrade access control, HVAC, and elevators to CRA standards?"
slug: "ep-5.02-smart-buildings-real-estate-bacnet-modbus-access-c"
series_id: 5
episode_number: 2
series: "Critical Sector Deep Dives"
target_persona: "Smart Building Master Systems Integrators (MSI), Property Tech Directors, Facility Managers."
persona_category: "EPC & Integrators"
statutes: ["Article 6", "Annex III"]
statutory_domain: "Class I/II Critical Sectors"
difficulty: "Executive Policy"
key_metric: "Article 6 Exposure"
read_time: "9 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_5.02.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "Article 6", "EPC & Integrators", "Industrial OT Security", "CE Marking"]
takeaways: ["Migrating from BACnet MS/TP to BACnet/SC", "gateway boundary hardening", "physical security & badge reader compliance"]
---

# Smart Buildings & Real Estate: BACnet, Modbus, Access Control & Elevators
*By Jim Mckenney — Digital Product Security Consultant & Industrial OT Architect*

> **Executive Technical Memorandum:**
> - **Statutory Scope:** `Article 6, Annex III`
> - **Primary Persona:** `Smart Building Master Systems Integrators (MSI), Property Tech Directors, Facility Managers.` (`EPC & Integrators`)
> - **Curriculum Track:** `Critical Sector Deep Dives` (Track 5)
> - **Regulatory Complexity:** `Executive Policy` • **Key Exposure:** `Article 6 Exposure`
> - **Companion Audio Briefing:** [EP_5.02 - Audio Broadcast (14:15)](https://oxot.ai/podcast) | [Standard Series RSS](https://oxot.ai/feeds/cra-podcast.xml)

---

## 1. The Commercial Dilemma & Industrial Reality

`[EP_5.02 - Strategic Technical Briefing] Smart Buildings & Real Estate: BACnet, Modbus, Access Control & Elevators | Jim Mckenney`

**The Core Industry Problem:** Millions of building sensors use plaintext protocols. How do building automation integrators upgrade access control, HVAC, and elevators to CRA standards?

> *"*"Your building's HVAC gateway is about to become an illegal product if it can't handle signed firmware and authenticated BACnet/SC."*"*

In industrial engineering and critical infrastructure operations, the arrival of **Regulation (EU) 2024/2847 (Cyber Resilience Act)** shatters historical procurement and maintenance assumptions. Stakeholders must recognize that commercial contracts, variation orders, and legacy supply chain models can no longer disclaim statutory cybersecurity conformity.

Under **Article 6, Annex III**, equipment placed on the European Single Market must satisfy mandatory cybersecurity baselines, maintain cryptographic technical files, and adhere to strict zero-day vulnerability notification timelines.

---

## 2. Key Strategic & Engineering Takeaways

<div className="space-y-3 my-4">

1. **Migrating from BACnet MS/TP to BACnet/SC**
2. **gateway boundary hardening**
3. **physical security & badge reader compliance**

</div>

---

## 3. Reference Architecture & Technical Implementation

The following domain-specific architecture illustrates the compliant engineering workflow, safe-harbor isolation boundary, and regulatory decision gate for `EP_5.02`:

```mermaid
graph LR
    A["Smart Commercial Building"] --> B["BACnet/IP & Modbus MSTP HVAC Controllers"]
    A --> C["Biometric & RFID Smart Access Control"]
    A --> D["Smart Elevator & Escalator Dispatchers"]
    B & C & D --> E["Smart Building Multi-System Integrator (MSI) Gateway"]
    E --> F["Annex III Class I Certification & Isolated Conduits"]
```

---

## 4. Mandatory 4-Step Engineering Action Sprint

To ensure defensible compliance with **Article 6, Annex III**, organizations must execute the following structured remediation sprint:

1. **Conduct Asset & Contract Scope Audit:** Inventory all active hardware variants, firmware repositories, and supplier agreements across the operational footprint.
2. **Embed Statutory Safe-Harbor Clauses:** Insert CRA bilateral compliance warranties and 10-year technical dossier retention terms into upstream supplier and EPC subcontracts.
3. **Automate CycloneDX v1.6 SBOM Vaulting:** Implement automated CI/CD bill of materials generation with cryptographic code signing stored in an immutable 10-year archive.
4. **Operationalize Article 14 24h CSIRT Notification:** Conduct simulated drills for reporting actively exploited zero-days to the ENISA Single Reporting Platform within the mandatory 24-hour statutory window.

---

## 5. Statutory Cross-References & Legal Text

- **EU Cyber Resilience Act:** [Read Article 6, Annex III in the Interactive CRA Legal Wiki](http://localhost:8088/conformity/cra-wiki?tab=articles&num=6)
- **Audio Intelligence Platform:** [Listen to the Full Audio Episode](https://oxot.ai/podcast)
- **Technical Consultation:** [Schedule an Architecture Review with OXOT Advisory](http://localhost:8088/contact)
