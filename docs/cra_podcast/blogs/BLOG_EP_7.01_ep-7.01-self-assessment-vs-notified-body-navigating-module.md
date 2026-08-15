---
id: "EP_7.01"
canonical_code: "EP_7.01"
title: "Self-Assessment vs. Notified Body: Navigating Modules A, B+C, and H"
subtitle: "Which products can use internal self-assessment (Module A), and which strictly require a third-party Notified Body audit (Module B+C or H)?"
slug: "ep-7.01-self-assessment-vs-notified-body-navigating-module"
series_id: 7
episode_number: 1
series: "Conformity Assessment, Audits & CE Marking"
target_persona: "Compliance Directors, Quality Assurance Managers, Hardware CEOs."
persona_category: "Hardware & Embedded OEMs"
statutes: ["Article 24", "Annex VI"]
statutory_domain: "Conformity Assessment Modules"
difficulty: "Legal Triage"
key_metric: "Article 24 Exposure"
read_time: "9 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_7.01.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "Article 24", "Hardware & Embedded OEMs", "Industrial OT Security", "CE Marking"]
takeaways: ["Conformity assessment decision tree", "cost & timeline comparisons across Modules A, B, and H", "Notified Body selection criteria"]
---

# Self-Assessment vs. Notified Body: Navigating Modules A, B+C, and H
*By Jim Mckenney — Digital Product Security Consultant & Industrial OT Architect*

> **Executive Technical Memorandum:**
> - **Statutory Scope:** `Article 24, Annex VI`
> - **Primary Persona:** `Compliance Directors, Quality Assurance Managers, Hardware CEOs.` (`Hardware & Embedded OEMs`)
> - **Curriculum Track:** `Conformity Assessment, Audits & CE Marking` (Track 7)
> - **Regulatory Complexity:** `Legal Triage` • **Key Exposure:** `Article 24 Exposure`
> - **Companion Audio Briefing:** [EP_7.01 - Audio Broadcast (14:15)](https://oxot.ai/podcast) | [Standard Series RSS](https://oxot.ai/feeds/cra-podcast.xml)

---

## 1. The Commercial Dilemma & Industrial Reality

`[EP_7.01 - Strategic Technical Briefing] Self-Assessment vs. Notified Body: Navigating Modules A, B+C, and H | Jim Mckenney`

**The Core Industry Problem:** Which products can use internal self-assessment (Module A), and which strictly require a third-party Notified Body audit (Module B+C or H)?

> *"*"Choosing the wrong conformity module will either cost you €200,000 in unnecessary audit fees or result in an illegal CE mark."*"*

In industrial engineering and critical infrastructure operations, the arrival of **Regulation (EU) 2024/2847 (Cyber Resilience Act)** shatters historical procurement and maintenance assumptions. Stakeholders must recognize that commercial contracts, variation orders, and legacy supply chain models can no longer disclaim statutory cybersecurity conformity.

Under **Article 24, Annex VI**, equipment placed on the European Single Market must satisfy mandatory cybersecurity baselines, maintain cryptographic technical files, and adhere to strict zero-day vulnerability notification timelines.

---

## 2. Key Strategic & Engineering Takeaways

<div className="space-y-3 my-4">

1. **Conformity assessment decision tree**
2. **cost & timeline comparisons across Modules A, B, and H**
3. **Notified Body selection criteria**

</div>

---

## 3. Reference Architecture & Technical Implementation

The following domain-specific architecture illustrates the compliant engineering workflow, safe-harbor isolation boundary, and regulatory decision gate for `EP_7.01`:

```mermaid
graph TD
    A["Product Risk Classification (Annex III & IV)"] --> B{"Is Product Listed in Annex III/IV?"}
    B -->|"No: Standard Product"| C["Internal Production Control (Module A)"]
    B -->|"Annex III Class I"| D{"Are Harmonized Standards Applied?"}
    D -->|"Yes (CEN/CENELEC M/606)"| C
    D -->|"No"| E["Third-Party EU-Type Exam (Module B+C)"]
    B -->|"Annex III/IV Class II"| F["Mandatory Third-Party QA (Module H)"]
```

---

## 4. Mandatory 4-Step Engineering Action Sprint

To ensure defensible compliance with **Article 24, Annex VI**, organizations must execute the following structured remediation sprint:

1. **Conduct Asset & Contract Scope Audit:** Inventory all active hardware variants, firmware repositories, and supplier agreements across the operational footprint.
2. **Embed Statutory Safe-Harbor Clauses:** Insert CRA bilateral compliance warranties and 10-year technical dossier retention terms into upstream supplier and EPC subcontracts.
3. **Automate CycloneDX v1.6 SBOM Vaulting:** Implement automated CI/CD bill of materials generation with cryptographic code signing stored in an immutable 10-year archive.
4. **Operationalize Article 14 24h CSIRT Notification:** Conduct simulated drills for reporting actively exploited zero-days to the ENISA Single Reporting Platform within the mandatory 24-hour statutory window.

---

## 5. Statutory Cross-References & Legal Text

- **EU Cyber Resilience Act:** [Read Article 24, Annex VI in the Interactive CRA Legal Wiki](http://localhost:8088/conformity/cra-wiki?tab=articles&num=24)
- **Audio Intelligence Platform:** [Listen to the Full Audio Episode](https://oxot.ai/podcast)
- **Technical Consultation:** [Schedule an Architecture Review with OXOT Advisory](http://localhost:8088/contact)
