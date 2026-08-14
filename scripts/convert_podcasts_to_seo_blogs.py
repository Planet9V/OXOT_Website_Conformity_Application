#!/usr/bin/env python3
"""
convert_podcasts_to_seo_blogs.py
Converts structured podcast episodes into high-ranking, technical SEO blog posts
with interactive Mermaid diagrams, tables, and CRA Statutory Wiki deep links.
Output directory: docs/cra_podcast/blogs/
"""

import os
import json
import re

BASE_DIR = "/Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application"
DOCS_CRA = os.path.join(BASE_DIR, "docs", "cra_podcast")
BLOGS_DIR = os.path.join(DOCS_CRA, "blogs")
REGISTRY_FILE = os.path.join(DOCS_CRA, "episodes_registry.json")

os.makedirs(BLOGS_DIR, exist_ok=True)

with open(REGISTRY_FILE, "r") as f:
    registry_data = json.load(f)

print(f"Loaded registry. Generating technical SEO blogs in {BLOGS_DIR}...")

def generate_blog_for_standard_ep(ep):
    code = ep["canonical_code"]
    title = ep["title"]
    statutes = ep.get("statutory_articles", ["Regulation (EU) 2024/2847"])
    statutes_str = ", ".join(statutes)
    target = ep.get("target_persona", "Industrial OT & Product Security Leads")
    series_name = ep.get("series_name", "Industrial Product Security")
    
    slug = re.sub(r'[^a-zA-Z0-9-]', '', title.lower().replace(' ', '-').replace(':', ''))[:60]
    filename = f"BLOG_{code}_{slug}.md"
    filepath = os.path.join(BLOGS_DIR, filename)
    
    blog_content = f"""---
title: "{title}"
subtitle: "A Definitive Engineering and Statutory Guide under Regulation (EU) 2024/2847"
slug: "{slug}"
date: "2026-08-14"
author: "Jim Mckenney"
author_title: "Digital Product Security Consultant (Industrial OT & CRA)"
series: "{series_name}"
canonical_code: "{code}"
statutes: {json.dumps(statutes)}
target_persona: "{target}"
read_time: "8 min read"
audio_url: "https://oxot.ai/audio/cra_podcast/{code}.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
keywords: ["Cyber Resilience Act", "CRA Compliance", "IEC 62443", "{statutes[0]}", "OT Cybersecurity", "CE Marking"]
---

# {title}
*By Jim Mckenney — Digital Product Security Consultant*

> **Executive Briefing Summary:**
> - **Primary Regulation:** {statutes_str} (Cyber Resilience Act)
> - **Target Audience:** `{target}`
> - **Associated Podcast Episode:** [{code} - Solo Briefing](file://{DOCS_CRA}/episodes_solo) | [Listen on Spotify](https://open.spotify.com)
> - **CRA Statutory Wiki Reference:** [Explore {statutes_str} on the Live CRA Wiki](http://localhost:8088/conformity/cra-wiki)

---

## 1. The Commercial Dilemma & Industrial Reality

In European industrial manufacturing, critical infrastructure, and software-defined automation, traditional engineering teams have historically treated cybersecurity as an operational IT concern. Under **Regulation (EU) 2024/2847 (The Cyber Resilience Act)**, that assumption is now a catastrophic legal liability.

When we examine the operational, commercial, and engineering reality of `{target}`, the central challenge under **{statutes_str}** is clear: how to translate rigorous statutory requirements into defensible engineering architectures, machine-readable Software Bills of Materials (SBOMs), and robust supply-chain agreements.

---

## 2. Statutory Deep Dive: What {statutes_str} Actually Requires

Under European Union product harmonisation legislation, statutory duties attach directly to economic operators the moment a product with digital elements is placed on the EU single market.

```
+----------------------------------------------------------------------------------------------------+
| KEY STATUTORY REQUIREMENTS UNDER {statutes_str.upper()}                                            |
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

To satisfy {statutes_str} without disrupting factory floor operations or inflating bill-of-materials costs, industrial engineering teams should adopt the following reference architecture:

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

1. **Step 1: Portfolio & Scope Audit** — Identify every active controller, firmware variant, and remote data processing connection governed by {statutes_str}.
2. **Step 2: Supply Chain Risk Allocation** — Embed formal CRA compliance warranty clauses and SBOM delivery obligations into tier-2 component supplier contracts.
3. **Step 3: Technical Dossier & SBOM Verification** — Ensure all firmware builds output validated CycloneDX or SPDX SBOMs stored in an immutable 10-year archive.
4. **Step 4: PSIRT & CSIRT Dispatch Drills** — Conduct a dry-run incident response exercise simulating a 24-hour vulnerability notification to ENISA.

---

## 5. Listen to the Full Audio Episode

Stream the complete 14-minute single-voice briefing below or subscribe via your preferred podcast player:

* 🎧 **Direct Stream:** [Download Episode {code} Audio (MP3)](https://oxot.ai/audio/cra_podcast/{code}.mp3)
* 📡 **RSS Feed:** `https://oxot.ai/feeds/cra-podcast.xml`
* 📖 **Verify Statutory Text:** [Open CRA Statutory Wiki](http://localhost:8088/conformity/cra-wiki)
"""
    with open(filepath, "w") as f:
        f.write(blog_content)
    return filename

def generate_all_blogs():
    count = 0
    # Generate for all 50 standard episodes
    for ep in registry_data.get("episodes", []):
        fn = generate_blog_for_standard_ep(ep)
        count += 1
    
    print(f"🎉 Successfully generated {count} technical SEO blog posts in {BLOGS_DIR}.")

if __name__ == "__main__":
    generate_all_blogs()
