# Blog rewrite tracker

Rewriting all 67 CRA companion blogs from source per `BLOG_WRITING_BRIEF.md`
(two agents per post — drafter + copy-editor — then a critical grade per series,
then de-formula polish). A post is checked only when written, edited, graded,
and its image slots are in `BLOG_IMAGE_MANIFEST.md`.

**Progress: 39 / 67 done.**

## Resume state (cold-restart spec) — 2026-08-18
- **Committed & pushed (graded A-band):** Series 1 `f4776e6`, Series 2 `71335c8`, Series 3 `165185e`, Series 4 (A−), Series 5 (A−/B+), Series 6 (A−) — all fixes applied.
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
- **Remaining:** Series 7 (6), 8 (5), News (5), Truth-&-Consequences (12) = 28. Series 7 source = blueprint line 460 (Conformity Assessment/Audits/CE); Series 8 = line 506 (Executive Liability/Future). News source = `docs/cra_podcast/news_briefings/`; TC source = `docs/cra_podcast/truth_and_consequences/`.


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

## Series 7 — Conformity Assessment, Audits & CE Marking
- [ ] EP_7.01 — Self-assessment vs notified body (Modules A/B+C/H)
- [ ] EP_7.02 — The notified-body bottleneck
- [ ] EP_7.03 — Drafting the EU Declaration of Conformity
- [ ] EP_7.04 — The 10-year technical documentation archive
- [ ] EP_7.05 — Article 27 presumption of conformity
- [ ] EP_7.06 — CE nameplate studio (physical/digital/packaging)

## Series 8 — Executive Liability, Penalties & Future Evolution
- [ ] EP_8.01 — The €15,000,000 calculation (Art 64)
- [ ] EP_8.02 — Personal executive liability & boardroom governance
- [ ] EP_8.03 — Market surveillance raids & recalls
- [ ] EP_8.04 — CRA meets NIS2 & EU AI Act
- [ ] EP_8.05 — The 2028 horizon

## News briefings
- [ ] NEWS_01 — ENISA Single Reporting Platform / 24h clock
- [ ] NEWS_02 — First notified-body designations
- [ ] NEWS_03 — Commission guidance on substantial modification
- [ ] NEWS_04 — Market-surveillance port interception protocols
- [ ] NEWS_05 — Standardization mandate M/606 timeline

## Truth & Consequences (edge-case deep dives)
- [ ] TC_01 — The edge-to-cloud grey zone
- [ ] TC_02 — The defunct-OEM dilemma
- [ ] TC_03 — Autonomous AI / neural weights on the plant floor
- [ ] TC_04 — The €15M calculation (Art 64 math)
- [ ] TC_05 — The open-source stewardship illusion
- [ ] TC_06 — Maritime OT navigational radar
- [ ] TC_07 — Smart metering & grid substations (NIS2)
- [ ] TC_08 — Battery energy storage systems (BESS)
- [ ] TC_09 — The distributor's trap (unmarked spares)
- [ ] TC_10 — Legacy protocol converters (Modbus→MQTT)
- [ ] TC_11 — The port surveillance playbook
- [ ] TC_12 — The insurance underwriting reckoning
