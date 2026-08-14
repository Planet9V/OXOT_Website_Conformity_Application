# CRA Podcast Generation — Task Plan

> **Working Memory on Disk:** Track overall project phases, active goals, decisions, and error logs for the EU Cyber Resilience Act (CRA) Podcast series.

## Goal Statement
To write, validate, produce, and publish an authoritative 16-episode B2B podcast series ("The Cyber Resilience Act Briefing") covering Regulation (EU) 2024/2847 across 4 target audience personas (OEMs, Software Vendors, Integrators/Operators, Distributors).

## Project Phases

- [x] **Phase 1: Multi-Agent Strategy & Brand Architecture** `status: complete`
  - Persona JTBD analysis (OEM, SaaS, Integrator, Distributor)
  - 4-Season episode breakdown and Spotify/Apple RSS taxonomy
  - Dual-Format Architecture: Two-Voice Host Series + Jim Mckenney Solo Consultant Series

- [ ] **Phase 2: Season 1 Script Generation (Episodes 1.01 – 1.04)** `status: in_progress`
  - [x] Ep 1.01 (Two-Voice): *Is Your Product In Scope? Decoding Article 2 & Remote Data Processing*
  - [x] Ep 1.01 (Jim Mckenney Solo): *Article 2 Scope & Industrial OT Alignment* (`docs/cra_podcast/episodes_solo/EP_1.01_Is_Your_Product_In_Scope_SOLO.md`)
  - [ ] Ep 1.02 (Two-Voice & Solo): *Uncritical vs. Class I vs. Class II: Navigating Annex III Taxonomies*
  - Ep 1.03: *Open Source Software & The CRA: Commercial Steward Obligations*
  - Ep 1.04: *Substantial Modifications: When Does a Patch Trigger Re-certification?*

- [ ] **Phase 3: Season 2 Script Generation (Episodes 2.01 – 2.04)** `status: pending`
  - Ep 2.01: *Secure by Default: Annex I Essential Security Properties*
  - Ep 2.02: *The 24h/72h Reporting Clock: Article 14 Incident & Vulnerability Notification*
  - Ep 2.03: *SBOMs in Practice: Machine-Readable Dependency Tracking (CycloneDX/SPDX)*
  - Ep 2.04: *Support Periods & EOL: Defining Mandatory Patching Lifecycles*

- [ ] **Phase 4: Season 3 Script Generation (Episodes 3.01 – 3.04)** `status: pending`
  - Ep 3.01: *Self-Assessment vs. Third-Party Audits: Modules A, B+C, and H*
  - Ep 3.02: *The €15M Penalty Risk: Article 61 Fines & Executive Liability*
  - Ep 3.03: *CE Marking Mechanics: Technical Documentation & Declarations of Conformity*
  - Ep 3.04: *Notified Bodies & Testing Labs: Avoiding the 2026 Audit Bottleneck*

- [ ] **Phase 5: Season 4 Script Generation (Episodes 4.01 – 4.04)** `status: pending`
  - Ep 4.01: *Harmonised European Standards: Presumption of Conformity (CEN/CENELEC)*
  - Ep 4.02: *CRA meets NIS2 & EU AI Act: Navigating Overlapping Regulations*
  - Ep 4.03: *Market Surveillance & Recalls: Enforcement & Withdrawal Mechanics*
  - Ep 4.04: *Global Impact: How Non-EU Manufacturers Must Adapt*

- [ ] **Phase 6: Audio Synthesis & RSS Distribution Web Page** `status: pending`
  - Dual-voice TTS script formatting (Host Legal 'onyx' + Host Engineering 'nova')
  - Integration with website podcast hub (`/podcast/cra-briefing`)

---

## Decisions Log
| ID | Phase | Decision | Rationale |
|---|---|---|---|
| D-01 | Phase 1 | Show Title: "The Cyber Resilience Act Briefing" | High B2B search intent, clear statutory focus, executive & engineering appeal |
| D-02 | Phase 1 | Dual-Host Format (Legal + Engineering) | Prevents dry legal recitation while keeping legal defensibility high |
| D-03 | Phase 1 | 3-Segment Episode Formula (Fact Sheet -> Persona Impact -> Checklist) | Optimizes listener retention on Spotify/Apple Podcast platforms |

---

## Errors Log
| Error ID | Phase | Attempt | Error Description | Resolution |
|---|---|---|---|---|
| E-01 | Phase 1 | 1 | Artifact write path outside brain directory | Created tracked project directory `docs/cra_podcast/` in main repository |
