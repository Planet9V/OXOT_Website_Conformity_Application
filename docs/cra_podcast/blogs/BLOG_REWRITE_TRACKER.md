# Blog rewrite tracker

Rewriting all 67 CRA companion blogs from source per `BLOG_WRITING_BRIEF.md`
(two agents per post — drafter + copy-editor — then a critical grade per series,
then de-formula polish). A post is checked only when written, edited, graded,
and its image slots are in `BLOG_IMAGE_MANIFEST.md`.

**Progress: 55 / 67 done.**

## Resume state (cold-restart spec) — 2026-08-18
- **Committed & pushed (graded A-band):** Series 1 `f4776e6`, Series 2 `71335c8`, Series 3 `165185e`, Series 4 (A−), Series 5 (A−/B+), Series 6 (A−), Series 7 (A−), Series 8 (A−) — all fixes applied. **All 45 episode posts (Series 1–8) done — corpus reads professional/non-templated/accurate per final grade.**
- **NOTE (Series 7/8 duplicate-file trap):** originals were auto-generated garbage under DIFFERENT slugs than the rewrites. After drafting, `ls BLOG_EP_<n>.*_*.md` for >1 file/episode and `git rm` the garbage (no IMAGE-SLOT, "Executive Technical Memorandum", "Jim Mckenney", wrong article #s). Series 7's 6 garbage files deleted; Series 8's 5 deleted.
- **All rewritten blogs are on disk AND committed.** Nothing lives only in memory. A fresh session resumes from this file.
- **Pipeline per series (see `BLOG_WRITING_BRIEF.md` for full rules incl. anti-formula v1–v3):**
  1. Read the series blueprint in `docs/cra_podcast/02-CRA-MARKET-UNCERTAINTY-INDEX-AND-50-EPISODE-BLUEPRINTS.md` (episodes/narrations in `docs/cra_podcast/episodes_solo/`).
  2. Dispatch one **drafter per episode (Opus)** — assign each a DISTINCT spine + closer-shape; WARN that blueprint article numbers are unreliable (verify vs `docs/cra_statutory_corpus/`, `nis2_statutory_corpus/`); drafters RETURN image rows, do NOT edit the manifest (parallel-write race).
  3. Dispatch one **copy-editor per episode (Opus)**.
  4. Orchestrator: append image rows to `BLOG_IMAGE_MANIFEST.md`; fix byline (`Mckenney`→`McKenney`); rotate closers so no two consecutive share a link; sweep for defects (no `localhost:8088`, no `oxot.ai` in body, no `div className`, no broken `/contact`).
  5. One **Opus critical grader per series**; apply flagged fixes (esp. the actor→Art-21-vs-22 check).
  6. Tick tracker boxes, `git add` the series files + manifest + brief + tracker, commit `content(blog): Series N …`.
- **Model:** Opus for all roles (Sonnet A/B ran ~18% more tokens).
- **Concurrency throttle (2026-08-18):** cap agent dispatches at ~3–4 per wave (not 6–8) — the API returns 529/mid-response errors under higher parallelism. Batch drafters/editors in groups of 3–4, wait for each batch, then the next. Re-dispatch any failed agent (failures don't corrupt files).
- **Remaining:** Truth-&-Consequences (12, source `docs/cra_podcast/truth_and_consequences/`, IN PROGRESS). Garbage BLOG_TC_* files to `git rm`; slugs MIS-DERIVED — follow the catalogue topics (listed below). Many TC posts lean on NON-CRA regimes (ATEX, Machinery Reg, Product Liability Dir, IEC 61508, BSI TR) — quarantine those as non-CRA. Reporting-copy lint (News grader note): the platform is SIMULTANEOUS to CSIRT + ENISA under Art 14(1), never "file → routed onward."


## Series 1 — Procurement & Contracting Crisis ✅ COMPLETE (committed f4776e6)
- [x] EP_1.01 — The 2-Year Lag
- [x] EP_1.02 — Bulletproof CRA RFP
- [x] EP_1.03 — Variation Orders & Cost Shifts
- [x] EP_1.04 — Importer's Due Diligence Checklist
- [x] EP_1.05 — Distributor Gatekeeping
- [x] EP_1.06 — Public Tender Playbook

## Series 2 — System Integrator & EPC Shield ✅ COMPLETE
- [x] EP_2.01 — The Accidental Manufacturer (Art 21 liability)
- [x] EP_2.02 — 'Duty to Refrain': freezing customer deployments
- [x] EP_2.03 — Custom SCADA scripts vs product logic
- [x] EP_2.04 — The Axians multi-plant CRA pipeline
- [x] EP_2.05 — Composite systems & brownfield CE marking
- [x] EP_2.06 — The Integrator Safe-Harbor Agreement
- [x] EP_2.07 — The FAT/SAT revolution

## Series 3 — Brownfield OT, Spare Parts & Maintenance ✅ COMPLETE
- [x] EP_3.01 — The Spare Parts Illusion (Art 2(6) / Recital 29)
- [x] EP_3.02 — When maintenance becomes redesign
- [x] EP_3.03 — Bridging the 5-year OEM gap under NIS2
- [x] EP_3.04 — Legacy brownfield integration
- [x] EP_3.05 — The obsolescence stockpile strategy
- [x] EP_3.06 — Firmware patching in ATEX environments

## Series 4 — Tier-2 Upstream Component Supplier Survival ✅ COMPLETE
- [x] EP_4.01 — The Tier-2 dilemma
- [x] EP_4.02 — SBOMs that satisfy Tier-1 OEMs
- [x] EP_4.03 — Vulnerability data-sharing agreements
- [x] EP_4.04 — Open-source firmware & commercial stewards
- [x] EP_4.05 — White-label hardware & ODM contracts
- [x] EP_4.06 — The Component Supplier's Minimum Viable Security Kit

## Series 5 — Critical Sector Deep Dives ✅ COMPLETE
- [x] EP_5.01 — Data centers & hyperscalers
- [x] EP_5.02 — Smart buildings & real estate
- [x] EP_5.03 — Power grids & renewable substation automation
- [x] EP_5.04 — Water & wastewater utilities
- [x] EP_5.05 — Rail & public transit
- [x] EP_5.06 — Maritime & port automation
- [x] EP_5.07 — Pharmaceutical & process manufacturing
- [x] EP_5.08 — Automotive & heavy equipment (UN R155 overlap)

## Series 6 — Vulnerability Operations, PSIRT & 24h Clocks ✅ COMPLETE (grade A−, fixes applied)
- [x] EP_6.01 — The 24-hour early warning / ENISA platform
- [x] EP_6.02 — Building an Annex I compliant PSIRT
- [x] EP_6.03 — Coordinated vulnerability disclosure
- [x] EP_6.04 — The 72-hour full notification
- [x] EP_6.05 — Customer security advisories
- [x] EP_6.06 — The 14-day final closeout

## Series 7 — Conformity Assessment, Audits & CE Marking ✅ COMPLETE (grade A−, fixes applied; 6 garbage originals deleted)
- [x] EP_7.01 — Self-assessment vs notified body (Modules A/B+C/H) — Art 32
- [x] EP_7.02 — The notified-body bottleneck — Arts 35/43
- [x] EP_7.03 — Drafting the EU Declaration of Conformity — Art 28/Annex V
- [x] EP_7.04 — The 10-year technical documentation archive — Art 31/Annex VII/13(13)
- [x] EP_7.05 — Presumption of conformity — Art 27 (blueprint's "Art 34" was wrong)
- [x] EP_7.06 — CE nameplate studio — Art 29/30 (blueprint's "Art 25/26/27" was wrong)

## Series 8 — Executive Liability, Penalties & Future Evolution ✅ COMPLETE (grade A−, fixes applied; 5 garbage originals deleted)
- [x] EP_8.01 — Article 64 administrative fines (blueprint's "Art 61/62" was wrong)
- [x] EP_8.02 — Executive liability & board governance (CRA Art 64 corporate + NIS2 Art 20 personal)
- [x] EP_8.03 — Market-surveillance withdrawal orders — Arts 52–56 (blueprint's "43–54" was wrong)
- [x] EP_8.04 — CRA + NIS2 + AI Act tri-directive (CRA Art 12 AI-bridge)
- [x] EP_8.05 — Brussels Effect / 2028 horizon (forecast essay)

## News briefings ✅ COMPLETE (grade A−, fixes applied; 5 garbage originals deleted; real topics from news_briefings/ catalogue, NOT the mis-derived garbage slugs)
- [x] NEWS_01 — ENISA single reporting platform & Sept 2026 countdown (Art 16/14(2)(a)/13(17))
- [x] NEWS_02 — The PSIRT mandate: the function, not the acronym (Annex I Part II/13(17))
- [x] NEWS_03 — Downstream supplier flow-down: what components must deliver (Art 13/13(6)/Annex I Part II)
- [x] NEWS_04 — CRA meets NIS2: dual incident-reporting clocks (Art 14 vs NIS2 Art 23/Art 16)
- [x] NEWS_05 — Harmonised standards M/596 status: presumption not yet live (Art 27)

## Truth & Consequences (12 investigative edge-case posts) — real topics per truth_and_consequences/ catalogue (garbage blog slugs were MIS-DERIVED; catalogue anchors ALSO partly wrong — verify each)
- [ ] TC_01 — Edge-to-cloud grey zone / microservices & CE (Art 3(1) remote data processing, Art 3(30) substantial mod)
- [ ] TC_02 — Defunct-OEM dilemma / bankrupt vendor (Art 13(8) support period, NIS2 Art 21; catalogue "Art 61" WRONG)
- [ ] TC_03 — Autonomous AI / neural weights (CRA Art 12 bridge, AI Act 2024/1689 Art 15, Annex I)
- [ ] TC_04 — Open-source steward's balance sheet (Art 24, Art 3(14), Recitals 18-19)
- [ ] TC_05 — Cross-border supply chain / MSA intercepts backdoors (Arts 52-56, Art 54; catalogue "Art 43" WRONG)
- [ ] TC_06 — Decommissioning & EOL handover (Art 13(8)/(9), Annex VII)
- [ ] TC_07 — Subsea & space / where the 'product' ends (Art 2, Art 3(1), Art 7(1) integration carve-out)
- [ ] TC_08 — BESS & Class II notified bodies (Annex III Class II, Art 32(3); catalogue "Art 24" WRONG; IEC 61508 non-CRA)
- [ ] TC_09 — Quantum-safe crypto for 30-yr MCUs (Annex I Part I, Art 13(8); myth-buster: CRA doesn't name PQC; BSI TR non-CRA)
- [ ] TC_10 — Hydrogen electrolyzers / secure boot vs ATEX (Annex I, ATEX 2014/34/EU + Machinery 2023/1230 non-CRA)
- [ ] TC_11 — Autonomous agriculture / field robots vs Machinery Reg (Annex I, Machinery 2023/1230; catalogue "Art 24" WRONG)
- [ ] TC_12 — Insurance underwriting reckoning (Art 64 penalties, Product Liability Dir 2024/2853; catalogue "Art 61" WRONG)
