---
name: cra-podcast-engine
description: "Master standard operating procedure for creating, validating, and managing all 3 styles of the Cyber Resilience Act (CRA) podcast platform."
risk: safe
source: local
date_added: "2026-08-14"
---

# CRA Podcast Production & Audio Governance Engine

## Purpose
This skill establishes the permanent, non-negotiable architectural standard and automated pipeline for producing, formatting, verifying, and tracking all audio and script assets for **The Cyber Resilience Act Briefing & Audio Ecosystem**.

---

## 1. The 3 Distinct Podcast Styles & Editorial Rules

Every podcast asset created in this repository MUST strictly belong to one of these three formats:

```
+----------------------------------------------------------------------------------------------------+
|                                    TRI-FORMAT EDITORIAL STANDARDS                                  |
+---------------------+------------------------------------------------------------------------------+
| 1. Standard Series  | • Location: docs/cra_podcast/episodes_solo/                                  |
| (EP_S.EE)           | • Style: Direct, Informative, Technical & Actionable (Zero FUD / No Hype).   |
|                     | • Target Duration: 12–15 Minutes.                                            |
|                     | • Structure: Hook -> Statutory Analysis -> OT Impact -> 4-Step Checklist.   |
|                     | • Audio Bed: Acoustic Spanish classical guitar chords.                       |
|                     | • Sign-Off: "Until next time: build secure by design, protect your supply     |
|                     |   chain, and ship with confidence. I'm Jim Mckenney—thank you for listening."|
|                     | • Outro: 0% inline marketing in monologue; uses dedicated EP_0.00 outro.     |
+---------------------+------------------------------------------------------------------------------+
| 2. News Stream      | • Location: docs/cra_podcast/news_briefings/                                 |
| (NEWS_XX)           | • Style: High-Energy, Fast-Paced Breaking Headlines & Timelines.             |
|                     | • Target Duration: 2–3 Minutes.                                              |
|                     | • Structure: Headline -> Deadline Clock -> Practical Warning.                |
|                     | • Audio Bed: High-tempo electronic newsroom broadcast bed.                  |
|                     | • Sign-Off: "I'm Jim Mckenney—stay resilient, stay compliant, and I'll see   |
|                     |   you at the next briefing."                                                 |
+---------------------+------------------------------------------------------------------------------+
| 3. CRA: Truth &     | • Location: docs/cra_podcast/truth_and_consequences/                         |
| Consequences (TC_XX)| • Style: Hard-Hitting Investigative Monologue ("Just the facts, ma'am").     |
|                     | • Target Duration: 12–15 Minutes.                                            |
|                     | • Structure: 1. Industry Myth -> 2. Shocking Financial Truth ->              |
|                     |   3. Conflicting Perspectives -> 4. Statutory Facts -> 5. Inconvenient Truth.|
|                     | • Audio Bed: Heavy sub-bass pulse, metallic industrial percussion drone.     |
|                     | • Sign-Off: "That's the truth. You don't have to like it, but you will have   |
|                     |   to deal with the consequences. I'm Jim Mckenney."                          |
+---------------------+------------------------------------------------------------------------------+
```

---

## 2. Universal File Nomenclature & Structural Invariants

1. **Naming Conventions:**
   - Standard Series: `EP_S.EE_<Topic_Name>_SOLO.md` (e.g. `EP_1.01_The_2Year_Lag_..._SOLO.md`)
   - News Stream: `NEWS_XX_<Topic_Name>.md` (e.g. `NEWS_01_ENISA_Single_Reporting_Platform.md`)
   - Truth & Consequences: `TC_XX_<Topic_Name>.md` (e.g. `TC_01_The_Edge_Cloud_Grey_Zone.md`)

2. **Mandatory Markdown Sections in Every Episode Script:**
   - `# [CODE] Title`
   - `> Header Metadata Block` (Presenter, Series, Code, Target Persona, Statutes, Audio Duration)
   - `## SECTION 1: PODCAST PACKAGING` (1.1 SEO Title, 1.2 Spotify Timestamped Chapters)
   - `## SECTION 2: SINGLE-VOICE TRANSCRIPT` (Spoken Monologue inside ` ```dialogue ` code block)
   - `## SECTION 3: AUDIO GENERATION SPECIFICATION` (Voice ID, Audio bed parameters)

3. **Poka-Yoke Quality Checks:**
   - **0% Inline Marketing:** Never put promotional URLs or platform advertisements inside the spoken narrative.
   - **De-Slop Verification:** Apply `/avoid-ai-writing` — ban words like "delve", "tapestry", "beacon", "game-changer", "landscape", "revolutionize".
   - **Explicit Statutory Citation:** Always cite exact Regulation (EU) 2024/2847 Articles, Recitals, and Annexes.

---

## 3. Automated Pipeline CLI Commands

All podcast operations are automated via `scripts/cra_podcast_pipeline.py`:

```bash
# 1. View current ecosystem statistics and production counts
python3 scripts/cra_podcast_pipeline.py --action stats

# 2. Run automated quality audit & linter across all scripts
python3 scripts/cra_podcast_pipeline.py --action audit

# 3. Synchronize registry (episodes_registry.json) and all 3 catalogues
python3 scripts/cra_podcast_pipeline.py --action sync

# 4. Generate new episodes adhering to format
python3 scripts/cra_podcast_pipeline.py --action generate --style [standard|news|truth]
```

---

## 4. When to Invoke This Skill
- Whenever generating new CRA podcast episodes, news bulletins, or investigative scripts.
- Whenever reviewing, auditing, or refactoring existing CRA audio scripts.
- Whenever updating podcast catalogues or audio branding configurations.
