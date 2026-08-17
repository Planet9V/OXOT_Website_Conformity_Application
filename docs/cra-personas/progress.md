# Progress Log — CRA Persona Programme

## 2026-08-14 — Programme planned, gates built

**Context.** Follows the forensic audit and the corpus replacement (`fadd017`).
The audit found the app asserted statutory acts it never performed; the corpus
replacement grounded the statute. This programme rebuilds the personas on that
foundation.

**Written:**
- `docs/cra-personas/task_plan.md` — Phase 0 + five role phases, each with tasks,
  machine-checkable acceptance criteria, and a seven-check gate (G1–G7).
- `docs/cra-personas/findings.md` — verified state of the six shipped personas,
  the real CRA role articles, per-route persistence/auth table.
- `docs/cra-personas/lessons.md` — ten lessons seeded from this session's audit,
  to be read at the start of every phase and appended to at every G7.
- `scripts/check_honesty.mjs` — gate G4.
- `scripts/check_citations.mjs` — gate G5.

**Gate baseline established (both gates deliberately run against a dirty tree
first, per lesson L5 — a check that cannot fail proves nothing):**

| Gate | Result | Count |
|------|--------|-------|
| G4 honesty | **FAIL (exit 1)** | 12 unearned claims |
| G5 citations | **FAIL (exit 1)** | 24 contradicted citations |

Both are correct failures. Driving them to zero is Phase 0 work.

**The gates found 36 defects that manual review had missed**, including:
- `trust-center-page.tsx:62,98` — SHA-256 of the empty string presented to
  procurement as a "Cryptographic Provenance Hash", in both EN and NL.
- `conformityAssessments.ts:832` — "impact analysis transmitted to EU Member States".
- `persona-cockpit.tsx:81,117` — still citing Art. 18(2) for duty to refrain
  (real: Art. 20) after I had corrected the `statutoryBasis` fields by hand.
- `command-center.tsx:321` — Art. 21 for substantial modification (real: Art. 22).
- `command-center.tsx:183` — the `|| MOCK_PORTFOLIO_DATA` silent fallback.

That miss rate is itself the argument for the gates: hand review of the same
files, twice, in the same session, did not find these.

**Status:** plan written, gates operational and red. No phase started.
Awaiting go/no-go on Phase 0.

**Repo note:** a concurrent process committed 5 times during the preceding
session (podcast workstream), once absorbing unrelated edits via `git add -A`.
Check `git log --oneline -3` at the start of each phase (lesson L8).

## Errors encountered

| Phase | Error | Attempt | Resolution |
|-------|-------|---------|------------|
| plan | `check_honesty.mjs` walk() used `e.key ?? e.name` | 1 | Corrected to `e.name`; verified against real tree |

---

## Phase 1 — Manufacturer — COMPLETE (2026-08-15)

All eight tasks implemented, each as a pure tested rule then wired, verified in
both directions. Fix cap of 3 never reached; worst case 2.

| # | Task | Article | Tests | Fix cycles |
|---|------|---------|-------|-----------|
| 1.1 | Support period, both limbs | 13(8) | 15 | 2 |
| 1.2 | Three retention clocks | 13(9), 13(13), 13(18) | 12 | 1 |
| 1.3 | Economic-operator traceability | 23 | 11 | 2 |
| 1.4 | Market surveillance workflow | 53, 54 | 11 | 0 |
| 1.5 | Reporting obligation from filings | 14 | 8 | 0 |
| 1.6 | Cockpit literals retired | — | — | 0 |
| 1.7 | Presumption as data | 27 | 8 | 0 |
| 1.8 | Route selection derived | 32 | 21 | 0 |

**Defects fixed beyond the task list**

- The standards matrix asserted `FULL_STATUTORY_PRESUMPTION_ARTICLE_34` and the
  UI rendered "Exempts product from full Notified Body re-testing". False for
  every product on the market, and acting on it would breach Art. 32(2).
- `/products/:id/revisions` ran both statutory clocks off `product.createdAt`
  with 5*365 and 10*365 days — wrong anchor, wrong articles, wrong arithmetic.
- The importer archive computed retention from the deposit date.
- `persona-copilot-drawer.tsx` selected legal text by bare numeral: fines to
  Art. 61, steward to 33, importer to 17 — each a real but unrelated article,
  quoted back to the user as authority. Invisible to any citation scanner.
- 30 wrong citations across code and published material, burned down to 0.

**Gate movement**

| Gate | Before | After |
|------|--------|-------|
| Citations | 4 (weak gate; 30 with the corrected gate) | **0** |
| Honesty | 13 | 11 |
| Tests passing | 216 | 287 |
| Corpus verifier | PASS | PASS |

CI baselines ratcheted: citations 4 → 0, honesty 13 → 11.

**Schema added:** `placed_on_market_date`, `expected_use_time_months`,
`support_period_rationale` on `conformity_products`; new
`conformity_msa_engagements`. All applied to the dev database.

**Regression caught by CI:** the e2e walk asserted the Art. 32(2) defect
("applying harmonised standards unlocks Module A"). Corrected — the test was
encoding the bug, not the law.

**Outstanding:** CI has ~70 pre-existing failures unrelated to Phase 1 (demo-role
403 tests, OPENROUTER_API_KEY, object storage). These predate this work and are
the next thing worth fixing, since they mask real regressions — only a
name-by-name diff against an earlier run revealed that exactly one failure was
mine.

**Status:** Phase 1 complete. Phase 2 (deemed manufacturer, Arts. 21-22) ready.

---

## BLOCKED — NIS2 Directive corpus (2026-08-15)

Cannot fetch the authoritative source. EUR-Lex is serving this environment a
**202 bot-challenge with an empty body**, to curl as well as to Node.

Three distinct approaches tried, then halted per the circuit breaker rather than
retried:

1. `curl` direct on CELEX:32022L2555 → 0 bytes, HTTP 202
2. Alternative URL forms (OJ TOC, ELI `data.europa.eu`) → 0 bytes
3. `WebFetch` (different mechanism entirely) → returns a challenge page

The **known-good CRA URL also returns 0 bytes right now**, which proves this is
an environment/network condition and not a NIS2-specific problem. The cached CRA
source is committed, so the CRA corpus and its verifier are unaffected.

### What was deliberately NOT done

No corpus was built from a secondary source. Summary sites, law-firm briefings
and aggregators are exactly what produced the synthetic CRA corpus that started
this programme. A NIS2 guard built on a non-authoritative text would be worse
than no guard, because it would carry the authority of a verifier.

No parser was written either — the CRA parser was written against the real OJ
HTML structure, and writing one for a document nobody has seen is speculation.

### To unblock

Fetch the source into the expected path, from a network EUR-Lex will answer:

    mkdir -p docs/nis2_statutory_corpus/source
    curl -sL -A "Mozilla/5.0" \
      "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32022L2555" \
      -o docs/nis2_statutory_corpus/source/CELEX_32022L2555_EN.html

Or save the page from a browser to that path. Sanity check before trusting it:
the file should be well over 500 KB and contain "Directive (EU) 2022/2555".

Then the pipeline mirrors the CRA exactly: build → verify → per-act citation
gate. Watch for corrigenda, as the CRA had one (OJ L 2025/90555) that changed
the meaning of Art. 64(10).

**Reference:** Directive (EU) 2022/2555, CELEX 32022L2555, OJ L 333,
27.12.2022, p. 80.


## 2026-08-16 — Phase 10 opened; 10.1 in flight

- Phase 10 plan written to task_plan.md (10.1 portable storage → 10.2
  Art. 14(8) register → 10.3 AI Act/Machinery/RED corpora → 10.4 last
  unused tables). Survey findings for 10.1 in findings.md.
- 10.1 build: storage seam (`lib/storageBackend.ts` chooser +
  `lib/objectStorageLocal.ts`), 5 consumers swapped, local PUT route
  (raw-body carve-out in app.ts so application/json SBOM uploads are not
  destroyed by the JSON parser), Dockerfile pre-creates /data/objects
  node-owned (H1's EACCES class), compose volume + env, ci.yml env, two
  suites un-skip on local backend, chooser no-regression unit test.
- In flight: CI-mirror G2 with OBJECT_STORAGE_BACKEND=local (floor moves
  to 714/0/0) + api image rebuild. Then G6 incl. restart-persistence
  proof and existing-surface regression checks.
- 10.1 DONE: G2 CI-mirror with local backend = **717/0/0 — the first
  ZERO-SKIP suite in the programme** (both storage suites now run; 3 new
  seam tests). G6 8/8 live on the docker stack: relative one-time URL,
  PUT, stored-bytes sha256 fingerprint, byte-identical download, bytes on
  the volume, evidence SURVIVES api restart, workbench count renders,
  Products+Home regression clean. Known behavior carried over from the
  GCS backend: deleting evidence rows does not GC stored files.
- 10.2 DONE: product-user register + notification record (Art. 14(8),
  NIS2 23(2) read verbatim first). Tri-state derivation with the rule in
  the response; app records the org's act, transmits nothing. G2 722/0/0
  (one inter-suite flake caught and fixed: my suite initially LEAKED an
  advisory that survives product deletion by design — L46 cleanup added).
  G8 20/0. G6 7/7 with screenshots (product_users_102/). Labels got
  htmlFor/id pairs after getByLabel exposed missing association (a11y).
- 10.3a–b DONE: three corpora (AI Act/MR/RED) + verifiers + readers + CI
  reproducibility; citation gate now five-act (previous AI-Act skips are
  enforcement and PASS). Found+fixed shipped NIS2 defect (roman table →
  ch. IX arts 40–46 were in ch. I). G2 exit-0 (suite unchanged 722);
  G6 8/8 (three_acts_103/). 10.3c (obligation seeding + derivers ×3)
  deliberately left open — statute-reading work, its own phase.
- 10.4 DONE: the dead chain DELETED whole — 4 tables (cra_composite_
  components/_systems, cra_csaf_advisories, cra_procurement_evaluations),
  their never-persisting engines (procurement/composite/csaf, incl. the
  hardcoded-timestamp "seal"), the UNAUTHENTICATED /api/ecosystem routes
  (zero UI consumers anywhere), their zod schemas and unit tests. Fresh
  push proves 0 tables; G2 717/0/0 (5 dead-engine tests fewer); live
  stack migrated.

## 2026-08-16 (late evening) — Phase 11 opened, batch 11.1 (RED seed)
- Survey: engine already act-generic (requirements × declarations; derivers
  by key). ai_act/machinery seeds exist but pre-corpus; **red had ZERO rows**.
  Incident records are CRA/NIS2-shaped only → no new deriver without new data.
- 11.1 built: 21 RED requirement rows (Art 3(3)(d)/(e)/(f) cyber essential
  requirements + Art 10 manufacturer chain + Art 12/13 importer/distributor
  duties + Art 15 traceability for all four economic operators per Art 2(16)),
  7 honest cross-act mappings. Statute read verbatim from
  docs/red_statutory_corpus before every row. Non-cyber Art 3(1)/(2)
  deliberately not seeded (machinery precedent) — stated in the seed comment.
- New suite orgObligations.test.ts: engine equation + RED rows + role
  vocabulary + undeclared-act isolation; restores prior declarations (L46).
- Gates: G1 ok; G2 **720/0/0** (717 floor + 3 new); G3 ok; G4/G5/G8 = 0;
  seven verifiers green. Seed validation: 114 requirements, 79 mappings.
- G6 pending: seed image rebuilt + re-run (L39), then
  verify_red_obligations_111_playwright.mjs with screenshot review.

## 2026-08-16 (night) — 11.1 shipped (875085e), 11.2 shipped
- 11.1: RED 22 rows + 7 mappings; orgObligations.test.ts born; G6 cockpit
  `red · 17`. Commit 875085e pushed.
- 11.2: AI Act 12 rows verified (3 corrected: Art 12 title, Art 15(5)
  attack list, Art 73 real deadlines), 11 added (provider chapter,
  importer/distributor, deployer Art 26, registration, transparency);
  operator termFor +ai_act "deployer"; GPAI refusal documented. G2
  721/0/0; G6 both lenses green, screenshots reviewed.

## 2026-08-16 (night) — 11.3 shipped
- Machinery: 3 misnumbered Annex III rows CORRECTED (duties actually in
  1.1.9 / 1.2.1(d) / 1.2.1(f); numbering verified against the OJ source
  because the flattened annex blocks drop section headings); DoC moved off
  "Annex II" (the safety-components list!) to Art 21; "technical file" →
  technical documentation. +12 rows (Art 10 chain, AR, importers,
  distributors, Art 19 traceability). G2 722/0/0; G6 machinery · 15.

## 2026-08-16 (night) — 11.4 shipped; Phase 11 complete pending G7
- No new deriver (none has data); refusals documented per candidate in the
  statusDerivers header. Obligations response names declared-but-unseeded
  acts; cockpit renders "Zero here means un-modelled, not compliant"
  (GDPR live example, screenshot reviewed). G2 723/0/0.
