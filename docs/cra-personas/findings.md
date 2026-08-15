# Findings — CRA Persona Programme

Verified facts this plan depends on. Re-verify anything marked **stale-risk**
before relying on it; the repo has a concurrent writer (see lessons L8).

## The six personas as shipped (`persona-cockpit.tsx`)

| Persona | Statutory basis (corrected 2026-08-14) | CTA targets | Real? |
|---|---|---|---|
| MANUFACTURER | Art. 13, 28, 29–30, Annex I | `/products`, `/standards`, `/ce-studio` | **Partly — the only real journey** |
| INTEGRATOR | Art. 22 + Art. 2(6) | `/partner-hub` | No — computes, persists nothing |
| IMPORTER | Art. 19 + 20 | `/archive`, `/partner-hub` | No — in-memory array |
| STEWARD | Art. 24 | `/steward`, `/psirt` | No — no persistence |
| PLANT_CISO | NIS2 Art. 21 | `/partner-hub`, `/reports` | No — and not a CRA role |
| AUDITOR | Arts. 41–51 | `/auditor-portal` | Real but **unreachable** |

## Real CRA economic-operator roles (from the grounded corpus)

| Article | Title | Operative paragraphs |
|---|---|---|
| 13 | Obligations of manufacturers | 25 |
| 14 | Reporting obligations of manufacturers | 10 |
| 18 | Authorised representatives | 3 |
| 19 | Obligations of importers | 8 |
| 20 | Obligations of distributors | 6 |
| 21 | Cases in which obligations of manufacturers apply to importers and distributors | — |
| 22 | Other cases in which obligations of manufacturers apply | 2 |
| 23 | Identification of economic operators | 2 |
| 24 | Obligations of open-source software stewards | 3 |
| 28 | EU declaration of conformity | 5 |
| 31 | Technical documentation | 5 |
| 32 | Conformity assessment procedures | 6 |
| 52–54 | Market surveillance, access to data, national procedure | 16 / — / 9 |

**Art. 21 vs Art. 22 — the distinction the wizard never made:**
- Art. 21 — an **importer or distributor** who places under its own name/trademark
  **or** carries out a substantial modification → subject to Arts. 13 and 14.
- Art. 22 — a person **other than** manufacturer/importer/distributor who
  substantially modifies **and makes available on the market** → deemed manufacturer.

The "makes available on the market" limb is dispositive for a pure integrator and
is not asked anywhere in the current wizard.

## Persistence and auth by route (verified 2026-08-14)

| Route file | DB writes | Auth guards |
|---|---|---|
| `conformityAssessments.ts` | yes | 43 |
| `conformityPsirt.ts` | 17 | 11 |
| `conformityFlows.ts` | 10 | 13 |
| `conformityReports.ts` | 9 | 9 |
| `productPortfolio.ts` | 12 | 14 |
| `conformityAuditor.ts` | 2 (RFI only) | 0 (token-based) |
| `partnerScope.ts` | 0 | **0** |
| `ecosystemRoutes.ts` | 0 | **0** |
| `harmonisedStandardsRoutes.ts` | 0 | **0** |
| `openSourceStewardRoutes.ts` | 0 | **0** |
| `importerArchiveRoutes.ts` | 0 | **0** |
| `craWikiRoutes.ts` | 0 | 0 (public reference — acceptable) |

`/api/partner/*` and `/api/wiki/cra/*` have **no frontend caller** — the wiki
pages import the static corpus module directly.

## Corpus state (post-replacement, commit `fadd017`)

130 recitals · 71 articles · 8 chapters · 8 annexes · 305 paragraphs, all verbatim
from CELEX 32024R2847. Regenerate with:

```
node scripts/build_cra_corpus_from_eurlex.mjs --refetch
node scripts/sync_cra_corpus_data.mjs
```

Annexes are `{annexNumber, title, blocks: string[]}`. Article paragraphs use
`paragraphNumber: 0` for unnumbered lead-in text.

## Standards landscape — changes what "conformity" can mean today (researched 2026-08-14)

**No harmonised standard for the CRA has been cited in the Official Journal yet.**
Therefore **the Article 27 presumption of conformity is not currently available
for any product category.**

Corroborated directly from our own primary corpus, so this does not rest on
secondary sources:
- **Art. 27(1)** grants the presumption only for standards "the references of
  which **have been published in the Official Journal of the European Union**".
- **Art. 32(2)** imposes a stricter route on important Class I products where
  the manufacturer "has not applied or has applied only in part harmonised
  standards, common specifications or European cybersecurity certification
  schemes".

Consequence: **an important Class I manufacturer cannot self-assess today**,
because the condition that unlocks self-assessment (applying a harmonised
standard) cannot currently be met. Any route-selection logic we build must
derive this from whether a cited standard exists, not hardcode today's answer —
the position changes the moment the first citation lands.

The four compliance routes under Art. 27, in the order they become available:
1. Harmonised standards cited in the OJEU — **none yet**.
2. Commission common specifications by implementing act — Art. 27(2), none yet
   for the CRA.
3. European cybersecurity certification schemes via delegated act — EUCC
   delegated act indicated for Q4 2026.
4. **Direct demonstration against Annex I**, documented per Annex VII — this is
   the *only* route fully available today, and it is what the existing
   assessment workbench already does. That validates Phase 1 as the priority.

### Source discipline
- **Primary (authoritative):** the OJ text itself (CELEX 32024R2847) — held
  locally and verbatim; the Commission's CRA pages at
  `digital-strategy.ec.europa.eu` (`/cra-standardisation`, `/cra-summary`,
  `/factpages/cyber-resilience-act-implementation`).
- **Secondary (indicative only — do NOT ground an obligation on these):**
  standards trackers (craevidence.com, solidwaretools/cracheck), vendor and law
  firm guides. Used here only for the factual question "has anything been cited
  yet", which the Commission's own standardisation page corroborates by listing
  none.
- Standardisation request is **M/606** to CEN/CENELEC/ETSI; drafts exist
  (CEN EN 40000 series horizontal; ETSI EN 304 6xx product-specific) at enquiry
  or approval stage. Draft ≠ cited. Only OJEU citation triggers Art. 27.
- Commission published a first practical guidance package on **27 July 2026**;
  draft guidance was consulted March–April 2026. Guidance is interpretive, not
  binding, and confers no presumption.

**Watch item:** re-check OJEU citation status at the start of every phase. When
the first standard is cited, Art. 27 and Art. 32(2) behaviour changes for real
users, and the app must follow.

## Known-good foundations to build on, not replace

- Annex I catalogue seeded verbatim with correct sub-lettering (`seedConformity.ts`).
- Evidence hashing over **file bytes** (`conformityAssessments.ts:1593`).
- Art. 14 clock with end-of-month clamping per Reg. 1182/71 (`lib/conformityEngine.ts`).
- Member auth: scrypt, timing-safe compare, `DUMMY_HASH` enumeration guard,
  per-request revocation (`lib/teamMembers.ts`).
- `conformityEngine.ts` marks its own gaps with "To complete: <next step>" —
  copy this convention rather than inventing content.

## Environment

- Local build needs two native bindings that pnpm did not install:
  `lightningcss-darwin-arm64` and `@tailwindcss/oxide-darwin-arm64`, both
  copied into their `node_modules/.pnpm/...` package dirs. **stale-risk:** a
  reinstall will drop them again.
- Test suite: 27 of 51 files cannot collect because `lib/db` throws on import
  without `DATABASE_URL`. 181 tests pass. Fixing collection is Phase 0 adjacent —
  see task 0.8, CI needs it.
- Docker: `docker compose build web api && docker compose up -d web api`, site on
  `localhost:8088`, conformity SPA under `/conformity/`.
