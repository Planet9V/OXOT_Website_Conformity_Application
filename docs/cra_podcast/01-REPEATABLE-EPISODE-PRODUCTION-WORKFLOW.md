# Repeatable Episode Production Workflow: The Tri-Format Podcast Platform
## Standard Operating Procedures for Generating Standard, News, and Investigative Audio Assets

> **Framework:** End-to-End Autonomous Audio Pipeline  
> **Platform Version:** 4.0.0  
> **Applicable Regulations:** Regulation (EU) 2024/2847 (CRA), NIS2 Directive, Machinery Regulation (EU) 2023/1230  
> **Host / Voice Target:** Jim Mckenney (`fh7rGvh0nJR3MFMkM9yd`)  
> **Tooling Stack:** Python Pipeline + ElevenLabs API + `/avoid-ai-writing` + Master Registries

---

## 1. Production Pipeline by Podcast Style

```
+----------------------------------------------------------------------------------------------------+
| TRI-FORMAT PRODUCTION PIPELINE                                                                    |
+---------------------+------------------------------------------------------------------------------+
| 1. Standard Series  | Step 1: Ingest blueprint from 02-CRA-MARKET-UNCERTAINTY-INDEX.md             |
| (episodes_solo/)    | Step 2: Draft single-voice monologue using 4-step engineering checklist.     |
|                     | Step 3: Run /avoid-ai-writing de-slop pass.                                  |
|                     | Step 4: Stitch Spanish classical guitar intro & standard outro (EP_0.00).    |
+---------------------+------------------------------------------------------------------------------+
| 2. News Stream      | Step 1: Ingest breaking EU regulatory milestone or CSIRT clock bulletin.     |
| (news_briefings/)   | Step 2: Draft 2-minute high-energy briefing.                                 |
|                     | Step 3: Stitch electronic newsroom audio bed & rapid sign-off.               |
+---------------------+------------------------------------------------------------------------------+
| 3. Truth &          | Step 1: Ingest industry controversy, myth, or regulatory collision.          |
| Consequences        | Step 2: Structure 5-part investigative dissection (Myth -> Financial Reality |
| (truth_and_         |         -> Conflicting Perspectives -> Statutory Facts -> Inconvenient Truth)|
| consequences/)      | Step 3: Apply "Just the facts" fearless de-slop filter.                      |
|                     | Step 4: Stitch heavy industrial sub-bass drone & hard sign-off (TC_0.00).   |
+---------------------+------------------------------------------------------------------------------+
```

---

## 2. Universal Code & Nomenclature Standard

```
+----------------------------------------------------------------------------------------------------+
| CANONICAL NAMING RULES                                                                             |
+------------------------------------+---------------------------------------------------------------+
| Standard Series (episodes_solo/)   | EP_S.EE_<Topic_Name>_SOLO.md (e.g. EP_1.01_..., EP_8.05_...)  |
| News Stream (news_briefings/)      | NEWS_XX_<Topic_Name>.md (e.g. NEWS_01_..., NEWS_05_...)      |
| Truth & Consequences (truth_and_/) | TC_XX_<Topic_Name>.md (e.g. TC_01_..., TC_12_...)            |
+------------------------------------+---------------------------------------------------------------+
```

---

## 3. Automation Scripts Directory

* `scripts/reconcile_tri_format_podcast_architecture.py`: Master automated builder and synchronizer for all 3 formats.
* `docs/cra_podcast/scripts/assemble_full_episode.py`: Audio stitcher concatenating intro music bed, voice monologue, and outro bed.
