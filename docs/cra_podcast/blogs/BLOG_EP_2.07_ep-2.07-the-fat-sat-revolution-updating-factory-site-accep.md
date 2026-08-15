---
id: "EP_2.07"
canonical_code: "EP_2.07"
title: "The FAT/SAT Revolution: Updating Factory & Site Acceptance Testing for CRA"
subtitle: "Traditional FAT/SAT tests functional safety and process loops, ignoring digital security. How must FAT/SAT procedures evolve for 2027?"
slug: "ep-2.07-the-fat-sat-revolution-updating-factory-site-accep"
series_id: 2
episode_number: 7
series: "The System Integrator & EPC Shield"
target_persona: "Quality Assurance Engineers, Commissioning Managers, Plant Inspectors."
persona_category: "Plant CISOs & Asset Owners"
statutes: ["Annex I Part I", "Article 24"]
statutory_domain: "System Integration & Art 21"
difficulty: "Advanced Engineering"
key_metric: "Article Annex I Part I Exposure"
read_time: "9 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_2.07.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "Annex I Part I", "Plant CISOs & Asset Owners", "Industrial OT Security", "CE Marking"]
takeaways: ["CRA FAT/SAT verification checklist", "automated vulnerability scanning gates", "digital handover dossiers"]
---

# The FAT/SAT Revolution: Updating Factory & Site Acceptance Testing for CRA
*By Jim Mckenney — Digital Product Security Consultant & Industrial OT Architect*

> **Executive Technical Memorandum:**
> - **Statutory Scope:** `Annex I Part I, Article 24`
> - **Primary Persona:** `Quality Assurance Engineers, Commissioning Managers, Plant Inspectors.` (`Plant CISOs & Asset Owners`)
> - **Curriculum Track:** `The System Integrator & EPC Shield` (Track 2)
> - **Regulatory Complexity:** `Advanced Engineering` • **Key Exposure:** `Article Annex I Part I Exposure`
> - **Companion Audio Briefing:** [EP_2.07 - Audio Broadcast (14:15)](https://oxot.ai/podcast) | [Standard Series RSS](https://oxot.ai/feeds/cra-podcast.xml)

---

## 1. The Commercial Dilemma & Industrial Reality

`[EP_2.07 - Strategic Technical Briefing] The FAT/SAT Revolution: Updating Factory & Site Acceptance Testing for CRA | Jim Mckenney`

**The Core Industry Problem:** Traditional FAT/SAT tests functional safety and process loops, ignoring digital security. How must FAT/SAT procedures evolve for 2027?

> *"*"A process loop test that passes 100% of functional tests can still fail FAT if default passwords or open debug ports remain."*"*

In industrial engineering and critical infrastructure operations, the arrival of **Regulation (EU) 2024/2847 (Cyber Resilience Act)** shatters historical procurement and maintenance assumptions. Stakeholders must recognize that commercial contracts, variation orders, and legacy supply chain models can no longer disclaim statutory cybersecurity conformity.

Under **Annex I Part I, Article 24**, equipment placed on the European Single Market must satisfy mandatory cybersecurity baselines, maintain cryptographic technical files, and adhere to strict zero-day vulnerability notification timelines.

---

## 2. Key Strategic & Engineering Takeaways

<div className="space-y-3 my-4">

1. **CRA FAT/SAT verification checklist**
2. **automated vulnerability scanning gates**
3. **digital handover dossiers**

</div>

---

## 3. Reference Architecture & Technical Implementation

The following domain-specific architecture illustrates the compliant engineering workflow, safe-harbor isolation boundary, and regulatory decision gate for `EP_2.07`:

```mermaid
graph LR
    A["Factory Acceptance Testing (FAT)"] --> B["Automated Annex I Vulnerability & Fuzzing Suite"]
    B --> C["CycloneDX v1.6 SBOM Verification & Hash Match"]
    C --> D["Site Acceptance Testing (SAT)"]
    D --> E["Cryptographic Signing Key Handover to Plant CISO"]
    E --> F["Final Plant Commissioning Sign-off"]
```

---

## 4. Mandatory 4-Step Engineering Action Sprint

To ensure defensible compliance with **Annex I Part I, Article 24**, organizations must execute the following structured remediation sprint:

1. **Conduct Asset & Contract Scope Audit:** Inventory all active hardware variants, firmware repositories, and supplier agreements across the operational footprint.
2. **Embed Statutory Safe-Harbor Clauses:** Insert CRA bilateral compliance warranties and 10-year technical dossier retention terms into upstream supplier and EPC subcontracts.
3. **Automate CycloneDX v1.6 SBOM Vaulting:** Implement automated CI/CD bill of materials generation with cryptographic code signing stored in an immutable 10-year archive.
4. **Operationalize Article 14 24h CSIRT Notification:** Conduct simulated drills for reporting actively exploited zero-days to the ENISA Single Reporting Platform within the mandatory 24-hour statutory window.

---

## 5. Statutory Cross-References & Legal Text

- **EU Cyber Resilience Act:** [Read Annex I Part I, Article 24 in the Interactive CRA Legal Wiki](http://localhost:8088/conformity/cra-wiki?tab=articles&num=Annex I Part I)
- **Audio Intelligence Platform:** [Listen to the Full Audio Episode](https://oxot.ai/podcast)
- **Technical Consultation:** [Schedule an Architecture Review with OXOT Advisory](http://localhost:8088/contact)
