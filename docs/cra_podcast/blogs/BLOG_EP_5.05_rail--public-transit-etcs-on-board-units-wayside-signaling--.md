---
title: "Rail & Public Transit: ETCS On-Board Units, Wayside Signaling & Train Control"
subtitle: "A Definitive Engineering and Statutory Guide under Regulation (EU) 2024/2847"
slug: "rail--public-transit-etcs-on-board-units-wayside-signaling--"
date: "2026-08-14"
author: "Jim Mckenney"
author_title: "Digital Product Security Consultant (Industrial OT & CRA)"
series: "Critical Sector Deep Dives"
canonical_code: "EP_5.05"
statutes: ["Annex IV", "EN 50126", "EN 50128"]
target_persona: "Rolling Stock OEMs & Railway Engineers"
read_time: "8 min read"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_5.05.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
keywords: ["Cyber Resilience Act", "CRA Compliance", "IEC 62443", "Annex IV", "OT Cybersecurity", "CE Marking"]
---

# Rail & Public Transit: ETCS On-Board Units, Wayside Signaling & Train Control
*By Jim Mckenney — Digital Product Security Consultant*

> **Executive Briefing Summary:**
> - **Primary Regulation:** Annex IV, EN 50126, EN 50128 (Cyber Resilience Act)
> - **Target Audience:** `Rolling Stock OEMs & Railway Engineers`
> - **Associated Podcast Episode:** [EP_5.05 - Solo Briefing](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/docs/cra_podcast/episodes_solo) | [Listen on Spotify](https://open.spotify.com)
> - **CRA Statutory Wiki Reference:** [Explore Annex IV, EN 50126, EN 50128 on the Live CRA Wiki](http://localhost:8088/conformity/cra-wiki)

---

## 1. The Commercial Dilemma & Industrial Reality

In European industrial manufacturing, critical infrastructure, and software-defined automation, traditional engineering teams have historically treated cybersecurity as an operational IT concern. Under **Regulation (EU) 2024/2847 (The Cyber Resilience Act)**, that assumption is now a catastrophic legal liability.

When we examine the operational, commercial, and engineering reality of `Rolling Stock OEMs & Railway Engineers`, the central challenge under **Annex IV, EN 50126, EN 50128** is clear: how to translate rigorous statutory requirements into defensible engineering architectures, machine-readable Software Bills of Materials (SBOMs), and robust supply-chain agreements.

---

## 2. Statutory Deep Dive: What Annex IV, EN 50126, EN 50128 Actually Requires

Under European Union product harmonisation legislation, statutory duties attach directly to economic operators the moment a product with digital elements is placed on the EU single market.

```
+----------------------------------------------------------------------------------------------------+
| KEY STATUTORY REQUIREMENTS UNDER ANNEX IV, EN 50126, EN 50128                                            |
+---------------------+------------------------------------------------------------------------------+
| Essential Baseline  | Secure-by-default configuration, protection against unauthorized data access,|
| (Annex I Part I)    | attack surface minimization, and vulnerability resilience.                  |
+---------------------+------------------------------------------------------------------------------+
| Vulnerability SLA   | Mandatory 24-hour Early Warning and 72-hour Full Notification to ENISA and   |
| (Article 14)        | national CSIRTs for actively exploited zero-day vulnerabilities.            |
+---------------------+------------------------------------------------------------------------------+
| Documentation Duty  | 10-year retention of Annex VII Technical Files and CycloneDX/SPDX SBOMs.   |
| (Article 13)        |                                                                              |
+---------------------+------------------------------------------------------------------------------+
```

---

## 3. Recommended Technical Architecture

To satisfy Annex IV, EN 50126, EN 50128 without disrupting factory floor operations or inflating bill-of-materials costs, industrial engineering teams should adopt the following reference architecture:

```mermaid
graph TD
    A["Raw OT Firmware / Application Code"] --> B["Automated CI/CD Build Pipeline"]
    B --> C["CycloneDX SBOM & Cryptographic Hash Generation"]
    C --> D["Cryptographic Code Signing (Hardware Root-of-Trust)"]
    D --> E["Annex VII Technical Dossier Archive (10-Year Retention)"]
    E --> F["CE Nameplate Affixing & Market Deployment"]
    
    subgraph IncidentLoop["Vulnerability Handling Loop (Article 14)"]
        G["Vulnerability Discovered"] --> H["PSIRT Triage (< 24h)"]
        H --> I["ENISA Single Reporting Platform"]
        H --> J["Signed Remediation Patch Delivery"]
    end
    F -.-> G
```

---

## 4. 4-Step Action Checklist for Engineering Teams

Execute the following four-stage engineering sprint to ensure full audit readiness:

1. **Step 1: Portfolio & Scope Audit** — Identify every active controller, firmware variant, and remote data processing connection governed by Annex IV, EN 50126, EN 50128.
2. **Step 2: Supply Chain Risk Allocation** — Embed formal CRA compliance warranty clauses and SBOM delivery obligations into tier-2 component supplier contracts.
3. **Step 3: Technical Dossier & SBOM Verification** — Ensure all firmware builds output validated CycloneDX or SPDX SBOMs stored in an immutable 10-year archive.
4. **Step 4: PSIRT & CSIRT Dispatch Drills** — Conduct a dry-run incident response exercise simulating a 24-hour vulnerability notification to ENISA.

---

## 5. Listen to the Full Audio Episode

Stream the complete 14-minute single-voice briefing below or subscribe via your preferred podcast player:

* 🎧 **Direct Stream:** [Download Episode EP_5.05 Audio (MP3)](https://oxot.ai/audio/cra_podcast/EP_5.05.mp3)
* 📡 **RSS Feed:** `https://oxot.ai/feeds/cra-podcast.xml`
* 📖 **Verify Statutory Text:** [Open CRA Statutory Wiki](http://localhost:8088/conformity/cra-wiki)
