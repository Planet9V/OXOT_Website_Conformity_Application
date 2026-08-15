# The CRA source of truth — the only sanctioned process

**Anything in this repository that cites the CRA or produces material about it —
the conformity application, the wiki, blogs, podcast scripts, FAQs, reports,
slides — derives from one source and is checked by one command.**

## The source

| | |
|---|---|
| Instrument | Regulation (EU) 2024/2847 |
| As published | OJ L, 2024/2847, 20.11.2024 · CELEX 32024R2847 |
| As corrected by | OJ L, 2025/90555, 2.7.2025 (Art. 64(10)) |
| Cached source | `docs/cra_statutory_corpus/source/OJ_L_202402847_EN.html` — committed |
| Built corpus | `docs/cra_statutory_corpus/0{1,2,3,4}_*.json` |
| Shipped to apps | `artifacts/*/src/**/craCorpusData.ts` — **generated, never hand-edited** |

There is **no consolidated version** of this regulation on EUR-Lex. The base URL
serves the text as originally published, so corrigenda must be applied
explicitly. That is why `applyCorrigenda()` exists and why it fails the build if
a correction cannot be applied cleanly.

## The three commands

```bash
# 1. Rebuild the corpus from the cached Official Journal source
node scripts/build_cra_corpus_from_eurlex.mjs      # --refetch to re-download
node scripts/sync_cra_corpus_data.mjs              # copy into the three apps

# 2. THE CHECK — is what we ship the published text?
node scripts/verify_cra_corpus.mjs                 # --offline to skip network

# 3. Does anything we publish cite the CRA wrongly?
node scripts/check_citations.mjs
```

`verify_cra_corpus.mjs` reports **three** states, deliberately:

| State | Meaning |
|---|---|
| `PASS` | verified |
| `FAIL` | verified to be wrong — do not ship |
| `----` | **could not be checked** (e.g. EUR-Lex served a bot challenge) |

Conflating the third with the second is how a network hiccup gets reported as
the law having changed. It happened; hence the distinction.

## What the check actually proves

- **A1** the OJ source is present and committed
- **A2** a fresh EUR-Lex fetch matches the cached copy (ignoring the per-request WAF token)
- **B1** every recorded correction is present, and no superseded wording remains
- **B2** each correction matches the wording published in its corrigendum
- **B3** EUR-Lex lists no corrigendum we have not applied
- **C1** rebuilding reproduces the committed JSON byte-for-byte
- **D1–D4** all 71 article titles, **515 article text segments**, 130 recitals and 8 annexes trace verbatim to the source
- **E1** all three app modules are identical and carry the corrections

Verbatim means: whitespace normalised, footnote reference markers removed,
two-column points rejoined as `(a) text`. Nothing else is altered.

## Competing sources — the traps

These predate the single-source rule. Catalogued so the risk is visible.

| # | Trap | Risk | Status |
|---|---|---|---|
| 1 | `docs/cra_podcast/**` — 179 markdown files, **115 citation findings** | Published material citing wrong articles; written against the fabricated corpus | **Now scanned** by `check_citations.mjs`; backlog behind a ratchet |
| 2 | `docs/cra_sources/cra_faqs_registry.json` + `ingest_eu_cra_faqs.py`, `ingest_and_refine_cra_faqs.py` | A second CRA data store with its own ingest path, independent of the corpus | **Unresolved** — see below |
| 3 | ~20 Python generators (`generate_all_50_solo_scripts.py`, `rebuild_canonical_blog_corpus.py`, `update_cra_primer.py`, `convert_podcasts_to_seo_blogs.py`, …) | Emit CRA prose with hand-typed article numbers; none consult the corpus | **Unresolved** — highest-volume risk |
| 4 | `seedConformity.ts` — requirement catalogue with `refCode` like `Annex I(2)(a)` | A second, hand-maintained statutory index. It is *correct*, and is the one the assessment engine uses | **Accepted, documented** — must be reconciled against the corpus, not replaced blindly |
| 5 | `contractClauseEngine.ts`, `partnerScopeEngine.ts`, `importerArchiveRoutes.ts` and similar | Hardcoded statutory prose in engine output | **Scanned**; 26 findings in api-server |
| 6 | `scripts/generate_full_cra_corpus.mjs` (deleted) and its self-scoring audit | Fabricated the entire corpus and scored itself 100% | **Removed** in `fadd017`. Do not restore |

### Recommended mitigations, in order of leverage

1. **Trap 3** — make the Python generators read `02_articles_full.json` for any
   article number or title instead of typing one. One helper, ~20 call sites.
2. **Trap 1** — burn down the 115 markdown findings, lowering the ratchet as you go.
3. **Trap 2** — either fold the FAQ registry into the corpus pipeline or mark it
   explicitly as third-party commentary, not statute.
4. **Trap 4** — add a check that every `refCode` in `seedConformity.ts` resolves
   to a real Annex/Article point in the corpus.

## Rules

1. **Never hand-edit** `craCorpusData.ts` or the corpus JSON. They are generated;
   CI rebuilds and diffs them.
2. **Never hand-type an article number** in code or published material. Resolve it
   against the corpus. `check_citations.mjs --map` prints the concept→article table.
3. **Cite the corrigendum**, not the original publication, for corrected wording.
   The wiki does this automatically from corpus provenance.
4. **Re-check corrigenda** when re-fetching. `verify_cra_corpus.mjs` B3 does this.
5. A `----` result means **not verified**. It is not a pass.

## The one judgement call that is not machine-derived

`check_citations.mjs` holds a `CONCEPTS` table mapping concept → governing
article (e.g. *substantial modification* → Art. 22). Article **titles** come from
the corpus; the **assignment** is a human claim and should be reviewed. Print it
with:

```bash
node scripts/check_citations.mjs --map
```

Everything else in this pipeline is derived and checkable. This table is not.
