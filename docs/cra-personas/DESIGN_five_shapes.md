# Design — Five Shapes, Six Primitives

**Status:** validated through brainstorming, not yet implemented
**Date:** 2026-08-15
**Supersedes:** nothing. Extends `task_plan.md` Phases 3–5 and adds two workstreams.

---

## Understanding summary

- **What.** Make the manufacturer journey genuinely complete and commercially
  viable, as the **authoritative system of record** for CRA conformance — the app
  holds the technical file, DoC and evidence chain that a notified body or market
  surveillance authority receives. Then use that as the model for every other
  organisation type.
- **Why.** Manufacturers cannot self-assess most important Class I products today
  (Art. 32(2), no harmonised standard cited), have no way to run a notified-body
  engagement, and no way to prove Art. 13(5) due diligence over what is inside
  their products.
- **Who.** Four roles inside the organisation, each needing a different surface:
  compliance owner, engineering evidence provider, PSIRT, legal/executive
  signatory.
- **Scaling intent.** Processes, artifact collection, provenance, reporting and
  dashboards become shared components, so every organisation type reuses one
  interaction model on a different statutory path.
- **Honesty requirement.** Wherever the journey is not covered, the app says so
  plainly rather than implying coverage.

## Assumptions

1. Single tenant — one deployment, one organisation.
2. Scale: tens to low hundreds of products, thousands of components.
3. Retention is an operational commitment, not a schema field. Art. 13(13)'s ten
   years implies backups, restore testing and format longevity.
4. Signing = cryptographic attestation bound to identity, timestamp and exact
   bytes. **Not** an eIDAS qualified signature. Confirmed acceptable.
5. The notified body is not a user of this deployment. NB engagement is managed
   from the manufacturer's side; NB delegated access remains a separate track.
6. IEC 62443 harmonisation may land in ~2–3 months. The design must flip via the
   dated citation register in `lib/presumption.ts`, not a rewrite.

---

## Decision log

| # | Decision | Alternatives considered | Why |
|---|---|---|---|
| D1 | **System of record**, not preparation workbench | Workbench + export; staged hybrid | Highest commercial value; provenance retrofitted is provenance done twice |
| D2 | Model **all four internal roles** with distinct surfaces | Single "assessor" role | Annex V requires the DoC be signed on behalf of the manufacturer — attestation identity is a legal question, not a UI nicety |
| D3 | Cover notified body, supplier due diligence, versions/variants, EOL | Defer any of them | Art. 32(2) means most target customers must use a notified body today; without it the app does not describe their reality |
| D4 | **IEC 62443 as a declared pathway**, never a presumption | Treat as harmonised; ignore entirely | No CRA harmonised standard is cited. A pathway prepares and converges; a presumption would be false |
| D5 | **Per-product role**, org declares capability | Org-level only; both with override | Siemens manufactures some products and imports others. Art. 21 changes the role for one product, not the company |
| D6 | **Operator = assurance shape, not a CRA conformance profile** | Build an operator CRA journey | An operator has **no CRA obligations**. Building them would fabricate duties |
| D7 | Product-file-centric UI on six shared primitives | Obligation-centric; keep persona pages | Nobody thinks "I am working on Article 13(13)"; they think "I am getting the S7-1500 shipped" |
| D8 | NIS2: **Directive corpus + guard now**, national transpositions later | Full NIS2 first; overlap map only | Unblocks the assurance shape and guards existing NIS2 material without stalling the persona phases |
| D9 | **Registry-driven multi-act engine**; reuse P1 for NIS2 rather than a second engine | Per-act engines; if/else branching in the obligations endpoint | Ten acts are already seeded. Adding an act must mean registering content, never editing the engine |

---

## The five shapes

The mistake to avoid is treating every organisation type as a variation of the
manufacturer. They are not. There are **five shapes**, and only two of them are
product-file shaped.

| Shape | Who | What they do | Surface |
|---|---|---|---|
| **Creation** | Manufacturer, deemed manufacturer (Arts. 21/22) | *Create* conformity | Long pipeline, authored artifacts, a signature at the end |
| **Verification** | Importer (Art. 19), Distributor (Art. 20) | *Check someone else's* conformity | Short gate, duty to refrain, retention. **No authoring** |
| **Custody** | Authorised representative (Art. 18) | Hold a file they did not create | Mandate scope, custody, MSA handling. Obligations strictly bounded by the mandate |
| **Stewardship** | Open-source steward (Art. 24) | Sustain a project | **Not product-centric — project-centric.** No CE, no DoC, no conformity assessment |
| **Assurance** | Operator / user of equipment | *Demand and hold* evidence from suppliers | **No CRA obligations.** NIS2 duties + supplier evidence. Evidence primitive pointed outward |

Common spine across all five: **declare → determine → collect evidence → meet
clocks → hold documents with provenance → answer authorities → retain.**

Two shapes break the product-file mould and must not be forced into it:
**stewardship** is organised around a project, **assurance** around a supplier.

---

## The six primitives

Every shape is a configuration of these. Two already exist in code.

| # | Primitive | Shape | Already built |
|---|---|---|---|
| P1 | **Obligation** — statutory duty: citation, status, evidence, owner, due date | all | `orgProfile.ts` obligations endpoint |
| P2 | **Evidence request/response** — ask, receive, hash, attest | all | partial: `conformity_evidence` has hash, no request model |
| P3 | **Artifact** — generated document: sections, completeness, version, provenance, signature | creation, custody | `conformityEngine` builds 7 types; no version/signature |
| P4 | **Determination** — facts in → determination + citation + timestamp + assessor | all | ✅ `deemedManufacturer.ts`, `marketSurveillance.ts` |
| P5 | **Statutory clock** — anchor, basis article, state | all | ✅ `supportPeriod.ts`, `retention.ts`, `reportingObligation.ts` |
| P6 | **Provenance record** — who, when, what bytes, unchanged since | all | ❌ not built |

**P4 and P5 are proven.** Phases 1 and 2 built five instances between them, and
they all came out the same shape without being designed to. That is the evidence
the primitive is real rather than aspirational.

**P6 is the gap that D1 creates.** A system of record without provenance is a
filing cabinet with no lock.

---

## Page consolidation: 33 → 8

The largest single cut is reference. Nine pages — `cra-wiki`, `regulations`,
`regulation-detail`, `requirements`, `requirement-detail`, `themes`, `mappings`,
`sources`, `source-viewer` — exist so a user can go and read the law.

**You should never leave your work to go read Article 13(8).** The law belongs
inside the task, at the moment of the question. The `statutoryFlyout` pattern
already exists in `partner-hub`; make it universal and eight of those nine stop
earning their place.

| Target surface | Replaces | Note |
|---|---|---|
| **Portfolio** | `dashboard`, `overview`, `product-portfolio`, `products` | One "where am I" |
| **Product file** | `product-detail`, `assessment`, `flows`, `ce-nameplate-studio`, `standards-matrix`, `partner-hub`, `importer-archive` | Journey as stages; **renders per the product's role** |
| **My work** | *(new)* | Role-scoped inbox: evidence requests, incidents, signatures pending |
| **Incidents** | `psirt` | Art. 14 clocks |
| **Authorities** | *(new, from `msaEngagements`)* | Chapter V engagements |
| **Reports** | `reports`, `report-workspace` | |
| **Library** | the nine reference pages | One destination, two modes: read linearly, or flyout at point of use |
| **Settings** | `org-profile`, `team`, `profile`, `security` | |

Relocated, not merged: `welcome`/`onboarding`/`demo` → first-run inside
Portfolio. `podcast-studio` → not part of the conformity app. `auditor-portal` →
separate notified-body track. `open-source-steward` → becomes the stewardship
shape, project-centric, not a page.

### What I will NOT collapse, and why

This is the subtlety guard. Each of these looks collapsible and is not.

- **Incidents stays separate from the product file.** A 24-hour statutory clock
  buried inside a product page is a safety regression. Incidents are
  time-critical, cross-product, and owned by a different role.
- **Authorities stays separate.** An MSA request arrives unpredictably, is
  org-level, and must not be lost inside one product's tabs.
- **The signature surface stays its own thing.** The signatory logs in rarely and
  must see exactly what they are attesting to and what is still open — not a
  workbench.
- **Library keeps its destination mode.** Some users read the law to learn; some
  need it at point of use. Both are real. One page, two modes — not one mode.
- **Stewardship and assurance do not become product files.** Forcing them into
  the product mould would misrepresent both.

---

## IEC 62443 as a declared pathway

OT customers work a 62443 route now, as preparation. The design must let them do
that **without ever implying a presumption**.

- The **citation register** (`lib/presumption.ts`) already records IEC 62443-4-1
  and 4-2 with `craOjReference: null` and a dated verification. It is the single
  switch.
- A product may declare a **62443 pathway**: target SL, applicable FRs/CRs,
  and a mapping from 62443 clauses to Annex I requirements.
- Everywhere that mapping is shown, the app states: conformity with 62443 is
  **evidence towards Annex VII**, not a presumption under Art. 27, because no
  reference has been published in the OJEU.
- **Convergence:** if the Commission cites 62443, one register record gains an OJ
  reference and the language, the Art. 32 route availability and the presumption
  status all change automatically. No rewrite. This was built in Phase 1 and is
  tested (`resolveRoutes.test.ts` asserts the closure follows from an empty
  register).

---

## Value chain and supplier evidence

The BOM skeleton exists: `parentComponentId`, `tierLevel`, `supplier`,
`manufacturer`, `partNumber`, `firmwareVersion`, `hashes`, plus a dependency
graph. **What is missing is the evidence layer**, which is Art. 13(5) due
diligence made operational.

Per component, the manufacturer must be able to show: CE marking status, whether
a DoC is held, the component's support period, its update history, its EUVD
status, and **what they did when a component maker disappeared**.

Bidirectional, because the same organisation is on both sides:

- **Upstream (we integrate OEM components).** Collect evidence. Art. 13(5),
  Recital 34.
- **Downstream (we ARE the OEM).** Publish evidence: our DoC, SBOM, support
  period, CVD contact, advisories — and answer integrators' requests.
- **Rebrand (white-label).** Art. 21 makes us the manufacturer while the OEM
  holds the design evidence. Contractual access becomes an evidence dependency.

One primitive (P2), three directions.

---

## The managed-service / reseller case (Axians)

Not a role — **five positions**, which is the strongest validation of D5.

| Activity | Position | Basis |
|---|---|---|
| Buy, stock, supply equipment | Distributor | Art. 20 |
| Same, non-EU name, first to EU market | Importer | Art. 19, Art. 3(16) |
| Supply **identical** replacement parts, same specifications | **Out of scope** | **Art. 2(6)** |
| Maintenance / repair, purpose and risk unchanged | Not a modification | Recitals 38, 42 |
| Firmware or config change beyond the assessed envelope | Deemed manufacturer | Recital 39 → Art. 22 |
| Own name on the product | Deemed manufacturer | Art. 21 |

**Art. 2(6) is the commercial find.** A scope exclusion, not an exemption: for a
managed-services business shipping replacement stock at volume, a large share of
transactions are simply outside the CRA.

Historical note: the retired wizard's first question — "identical OEM replacement
part" — was legally meaningful after all. It was bolted to a fabricated Recital
34 safe harbour instead of to Art. 2(6), where it actually lives.

**The product for this segment is a triage engine:** across thousands of
transactions, which are out of scope, which are plain distribution, and which
**silently made them the manufacturer**. That last one is the commercial hook —
they carry Art. 13 and 14 liability today without knowing it.

---

## NIS2 programme

Structural difference that changes what the guard can claim: **the CRA is a
Regulation — directly applicable, one text. NIS2 is a Directive — it binds
Member States, and what binds an entity is the national transposition.**

Sequence (D8):

1. **Now:** NIS2 Directive corpus + guard, built to the same standard as the CRA
   — verbatim source, committed, reproducible, verifier, citation gate. Unblocks
   the assurance shape and makes existing NIS2 material in blogs and podcasts
   verifiable.
2. **Then:** manufacturer deepening, phases 3–5.
3. **Later:** national transpositions, NL first, then DE.

Until transpositions land, the app shows the **Directive baseline** and says
plainly that national law governs, naming the Member State as an unanswered
input. It must never state a national obligation it cannot source.

---

## The multi-act engine

Ten acts are already seeded — CRA, AI Act, Machinery, IEC 62443, NIS2, RED,
GDPR, CER, DORA, GPSR — and `CANONICAL_ROLES.termFor` already translates the
canonical role into each act's own word (CRA "manufacturer", AI Act "provider",
IEC 62443 "product supplier"). The multi-act foundation exists.

CRA hardcoding across the engine is three lines, and the one that matters was
introduced in Phase 1.5:

```ts
// orgProfile.ts:218
const isArt14 = r.regulationKey === "cra" && r.refCode === "Art 14";
```

That special-case derives Art. 14 status from real filings instead of a typed
field, which is right — but NIS2 Art. 23 has its own 24h/72h/one-month reporting
and the AI Act has serious-incident reporting under Art. 73. Three acts, three
branches, and the obligations endpoint becomes an if/else chain that grows with
every act added.

### Registries, not branches

An obligation declares where its status comes from: evaluations (a human records
it) or a **registered deriver** (computed from data).

```
DERIVERS = {
  "cra::Art 14":    deriveFromIncidentFilings,
  "nis2::Art 23":   deriveFromNis2Notifications,
  "ai_act::Art 73": deriveFromSeriousIncidents,
}
```

Four registries, keyed by `regulationKey`. Adding an act means **registering**
content — never editing the engine.

| Registry | CRA today | Expands to |
|---|---|---|
| **Determinations** (P4) | scope, classification, Art. 32 route, Art. 21/22 | AI Act risk tier; Machinery Annex I category |
| **Clocks** (P5) | 13(8), 13(9)/(13)/(18), Art. 14 | NIS2 Art. 23; AI Act Art. 73 |
| **Status derivers** | Art. 14 from filings | any obligation computable from data |
| **Artifacts** (P3) | 7 CRA types | AI Act technical documentation; Machinery DoC |

The six primitives stay generic. Only the content is per-act.

### The guard generalises too

`check_citations.mjs` is CRA-shaped: `MAX = 71` articles, one `CONCEPTS` table,
one corpus. Multi-act means per-act corpora and per-act concept tables —
`verify_corpus.mjs --act cra|nis2|ai_act` — so a NIS2 citation is checked against
NIS2 and an AI Act citation against the AI Act.

Today a NIS2 article number in a blog post is simply **unchecked**. That is how
"Article 34" survived in CRA material until the gate was widened, and the same
blind spot currently covers every non-CRA act.

---

## Explicit non-support register

A first-class, visible surface. Where the journey is not covered, the app says
so. Initial entries:

- National NIS2 obligations (until transpositions land)
- Notified body's own workflow (they are a different customer)
- eIDAS qualified signatures
- Whether an **assembled system** is itself a new product placed on the market
  — ⚠️ unsettled by the corpus
- **Tailor-made contractual deviation.** Recital 64 permits deviation from
  essential requirements for tailor-made products by explicit contract, but
  **no operative article was found giving it effect.** A recital alone is not a
  basis. ⚠️ unsettled — do not build a "tailor-made exemption"
- Whether importing for **own use** makes an operator an importer ⚠️ unsettled

The last three are Legal circuit-breaker items: queued for human review, not
decided by the implementation.

---

## Open questions

1. Which Member States after NL and DE?
2. Does the notified-body track need the NB to log in, or is export sufficient?
3. Does the assurance shape need its own NIS2 obligation engine, or does it
   reuse P1 with a NIS2 regulation key? (Leaning: reuse — `org_regulations`
   already supports multiple acts.)
