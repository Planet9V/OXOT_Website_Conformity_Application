---
id: "EP_6.02"
canonical_code: "EP_6.02"
title: "Building an Annex I Compliant PSIRT: Roles, Playbooks & Tooling for Hardware OEMs"
subtitle: "Traditional IT security teams handle corporate networks, not product vulnerabilities. How does an industrial OEM build an internal PSIRT from scratch?"
slug: "ep-6.02-building-an-annex-i-compliant-psirt-roles-playbook"
series_id: 6
episode_number: 2
series: "Vulnerability Operations, PSIRT & 24h Clocks"
target_persona: "Product Security Leads, Hardware Engineering VPs, DevSecOps."
persona_category: "Hardware & Embedded OEMs"
statutes: ["Annex I Part II", "Article 13(6)"]
statutory_domain: "Incident Reporting & PSIRT"
difficulty: "Advanced Engineering"
key_metric: "Article Annex I Part II Exposure"
read_time: "9 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_6.02.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "Annex I Part II", "Hardware & Embedded OEMs", "Industrial OT Security", "CE Marking"]
takeaways: ["PSIRT charter template", "vulnerability severity scoring (CVSS v4 / SSVC for OT)", "tooling stack (Vulnerability Management, SBOM indexing, Customer advisory portals)"]
---

# Building an Annex I Compliant PSIRT: Roles, Playbooks & Tooling for Hardware OEMs
*By Jim Mckenney — Digital Product Security Consultant & Industrial OT Architect*

> **Executive Technical Memorandum:**
> - **Statutory Scope:** `Annex I Part II, Article 13(6)`
> - **Primary Persona:** `Product Security Leads, Hardware Engineering VPs, DevSecOps.` (`Hardware & Embedded OEMs`)
> - **Curriculum Track:** `Vulnerability Operations, PSIRT & 24h Clocks` (Track 6)
> - **Regulatory Complexity:** `Advanced Engineering` • **Key Exposure:** `Article Annex I Part II Exposure`
> - **Companion Audio Briefing:** [EP_6.02 - Audio Broadcast (14:15)](https://oxot.ai/podcast) | [Standard Series RSS](https://oxot.ai/feeds/cra-podcast.xml)

---

## 1. The Commercial Dilemma & Industrial Reality

`[EP_6.02 - Strategic Technical Briefing] Building an Annex I Compliant PSIRT: Roles, Playbooks & Tooling for Hardware OEMs | Jim Mckenney`

**The Core Industry Problem:** Traditional IT security teams handle corporate networks, not product vulnerabilities. How does an industrial OEM build an internal PSIRT from scratch?

> *"*"Your corporate SOC protects your email. Your PSIRT protects your company from €15M product liability fines."*"*

In industrial engineering and critical infrastructure operations, the arrival of **Regulation (EU) 2024/2847 (Cyber Resilience Act)** shatters historical procurement and maintenance assumptions. Stakeholders must recognize that commercial contracts, variation orders, and legacy supply chain models can no longer disclaim statutory cybersecurity conformity.

Under **Annex I Part II, Article 13(6)**, equipment placed on the European Single Market must satisfy mandatory cybersecurity baselines, maintain cryptographic technical files, and adhere to strict zero-day vulnerability notification timelines.

---

## 2. Key Strategic & Engineering Takeaways

<div className="space-y-3 my-4">

1. **PSIRT charter template**
2. **vulnerability severity scoring (CVSS v4 / SSVC for OT)**
3. **tooling stack (Vulnerability Management, SBOM indexing, Customer advisory portals)**

</div>

---

## 3. Reference Architecture & Technical Implementation

The following domain-specific architecture illustrates the compliant engineering workflow, safe-harbor isolation boundary, and regulatory decision gate for `EP_6.02`:

```mermaid
graph LR
    A["CVD Bug Bounty & Researcher Intake"] --> B["Annex I Part II Dedicated PSIRT"]
    B --> C["CVSS v4.0 & SSVC Industrial Triage"]
    B --> D["Automated Patch Build & Regression Test"]
    C & D --> E["ENISA Article 14 Notification Dispatcher"]
    E --> F["Machine-Readable CSAF/VEX Advisory Publisher"]
```

---

## 4. Mandatory 4-Step Engineering Action Sprint

To ensure defensible compliance with **Annex I Part II, Article 13(6)**, organizations must execute the following structured remediation sprint:

1. **Conduct Asset & Contract Scope Audit:** Inventory all active hardware variants, firmware repositories, and supplier agreements across the operational footprint.
2. **Embed Statutory Safe-Harbor Clauses:** Insert CRA bilateral compliance warranties and 10-year technical dossier retention terms into upstream supplier and EPC subcontracts.
3. **Automate CycloneDX v1.6 SBOM Vaulting:** Implement automated CI/CD bill of materials generation with cryptographic code signing stored in an immutable 10-year archive.
4. **Operationalize Article 14 24h CSIRT Notification:** Conduct simulated drills for reporting actively exploited zero-days to the ENISA Single Reporting Platform within the mandatory 24-hour statutory window.

---

## 5. Statutory Cross-References & Legal Text

- **EU Cyber Resilience Act:** [Read Annex I Part II, Article 13(6) in the Interactive CRA Legal Wiki](http://localhost:8088/conformity/cra-wiki?tab=articles&num=Annex I Part II)
- **Audio Intelligence Platform:** [Listen to the Full Audio Episode](https://oxot.ai/podcast)
- **Technical Consultation:** [Schedule an Architecture Review with OXOT Advisory](http://localhost:8088/contact)
