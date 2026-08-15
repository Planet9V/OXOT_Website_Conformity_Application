---
id: "EP_3.04"
canonical_code: "EP_3.04"
title: "Legacy Brownfield Integration: Connecting Pre-2027 PLCs to Modern Cloud SCADA"
subtitle: "Streaming telemetry from legacy Siemens S7-300 or Allen-Bradley SLC 500 controllers into AWS IoT or Azure Cloud without breaking compliance."
slug: "ep-3.04-legacy-brownfield-integration-connecting-pre-2027-"
series_id: 3
episode_number: 4
series: "Brownfield OT, Spare Parts & Maintenance"
target_persona: "Cloud OT Engineers, Digital Transformation Directors, Industry 4.0 Leads."
persona_category: "Plant CISOs & Asset Owners"
statutes: ["Article 2", "Article 18", "Annex I"]
statutory_domain: "Brownfield & Legacy OT"
difficulty: "Legal Triage"
key_metric: "Article 2 Exposure"
read_time: "9 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_3.04.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "Article 2", "Plant CISOs & Asset Owners", "Industrial OT Security", "CE Marking"]
takeaways: ["Edge broker isolation patterns", "unidirectional data diodes", "read-only telemetry architecture"]
---

# Legacy Brownfield Integration: Connecting Pre-2027 PLCs to Modern Cloud SCADA
*By Jim Mckenney — Digital Product Security Consultant & Industrial OT Architect*

> **Executive Technical Memorandum:**
> - **Statutory Scope:** `Article 2, Article 18, Annex I`
> - **Primary Persona:** `Cloud OT Engineers, Digital Transformation Directors, Industry 4.0 Leads.` (`Plant CISOs & Asset Owners`)
> - **Curriculum Track:** `Brownfield OT, Spare Parts & Maintenance` (Track 3)
> - **Regulatory Complexity:** `Legal Triage` • **Key Exposure:** `Article 2 Exposure`
> - **Companion Audio Briefing:** [EP_3.04 - Audio Broadcast (14:15)](https://oxot.ai/podcast) | [Standard Series RSS](https://oxot.ai/feeds/cra-podcast.xml)

---

## 1. The Commercial Dilemma & Industrial Reality

`[EP_3.04 - Strategic Technical Briefing] Legacy Brownfield Integration: Connecting Pre-2027 PLCs to Modern Cloud SCADA | Jim Mckenney`

**The Core Industry Problem:** Streaming telemetry from legacy Siemens S7-300 or Allen-Bradley SLC 500 controllers into AWS IoT or Azure Cloud without breaking compliance.

> *"*"Industry 4.0 data streaming meets the CRA: how to pull telemetry from legacy PLCs without making the whole plant in-scope."*"*

In industrial engineering and critical infrastructure operations, the arrival of **Regulation (EU) 2024/2847 (Cyber Resilience Act)** shatters historical procurement and maintenance assumptions. Stakeholders must recognize that commercial contracts, variation orders, and legacy supply chain models can no longer disclaim statutory cybersecurity conformity.

Under **Article 2, Article 18, Annex I**, equipment placed on the European Single Market must satisfy mandatory cybersecurity baselines, maintain cryptographic technical files, and adhere to strict zero-day vulnerability notification timelines.

---

## 2. Key Strategic & Engineering Takeaways

<div className="space-y-3 my-4">

1. **Edge broker isolation patterns**
2. **unidirectional data diodes**
3. **read-only telemetry architecture**

</div>

---

## 3. Reference Architecture & Technical Implementation

The following domain-specific architecture illustrates the compliant engineering workflow, safe-harbor isolation boundary, and regulatory decision gate for `EP_3.04`:

```mermaid
graph LR
    A["Legacy Pre-2027 Modbus/DNP3 Controller"] --> B["Physical Serial / Isolated Ethernet Conduit"]
    B --> C["CRA-Certified Hardened Edge Gateway"]
    C --> D["TLS 1.3 Cryptographic Encapsulation & Auth"]
    D --> E["Enterprise Cloud SCADA & Analytics"]
    
    subgraph SecurityBoundary["Preserved Boundary"]
        C -.->|"Quarantines"| A
    end
```

---

## 4. Mandatory 4-Step Engineering Action Sprint

To ensure defensible compliance with **Article 2, Article 18, Annex I**, organizations must execute the following structured remediation sprint:

1. **Conduct Asset & Contract Scope Audit:** Inventory all active hardware variants, firmware repositories, and supplier agreements across the operational footprint.
2. **Embed Statutory Safe-Harbor Clauses:** Insert CRA bilateral compliance warranties and 10-year technical dossier retention terms into upstream supplier and EPC subcontracts.
3. **Automate CycloneDX v1.6 SBOM Vaulting:** Implement automated CI/CD bill of materials generation with cryptographic code signing stored in an immutable 10-year archive.
4. **Operationalize Article 14 24h CSIRT Notification:** Conduct simulated drills for reporting actively exploited zero-days to the ENISA Single Reporting Platform within the mandatory 24-hour statutory window.

---

## 5. Statutory Cross-References & Legal Text

- **EU Cyber Resilience Act:** [Read Article 2, Article 18, Annex I in the Interactive CRA Legal Wiki](http://localhost:8088/conformity/cra-wiki?tab=articles&num=2)
- **Audio Intelligence Platform:** [Listen to the Full Audio Episode](https://oxot.ai/podcast)
- **Technical Consultation:** [Schedule an Architecture Review with OXOT Advisory](http://localhost:8088/contact)
