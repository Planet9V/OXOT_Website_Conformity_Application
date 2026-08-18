# Handover — start here

The single entry point for any developer or session picking up the OXOT CRA
conformity application. Everything below was verified against the working
tree on 2026-08-18 at commit `3ea4a7e` (Phase 30 closed, CI green); if a claim here ever contradicts the
working tree, **the working tree wins** and this file is wrong (that has
happened — L36 — so check before trusting).

## What this application is

A commercial system of record for an organisation's **EU Cyber Resilience
Act (Regulation (EU) 2024/2847)** and **NIS2 (Directive (EU) 2022/2555)**
obligations. One single-tenant deployment; the deploying organisation may
hold several economic-operator roles at once (manufacturer AND importer AND
operator — D11). The application enumerates obligations from verbatim
statutory text, records who owns each, holds the evidence and provenance,
and shows what is missing. **It never concludes conformity** — that
assessment belongs to the manufacturer under CRA Art. 32 or a notified
body; the app's outputs are always "these obligations have evidence, these
do not".

## Where the work is

- **`main` only** now (the historical `feat/phase-7-shell-redesign` branch
  is merged and retired). Every batch is a fast-forward push to `main`;
  never squash — commit messages are the decision history and a
  deliverable. GitHub Actions CI is the authority for G2/G3.
- Restore tag `v0.5-personas-multi-act` (immutable, on GitHub).
- The stack runs at **localhost:8088** via `docker compose` (web + api +
  pgvector db + migrate/seed one-shots). Develop against the running stack.
  Container builds are amd64-emulated and slow (~10 min) — run them in the
  background and **wait on the build process/notification, never on
  container status text** (L47).
- `scripts/generate_local_audio.py` may show as modified — that is the
  user's own side-work; never stage it (use explicit `git add`, never
  `git add -A`).

## Read these, in this order

1. **`DESIGN_five_shapes.md`** — read *iteration 2* (the last section)
   first; it supersedes the early 33→8 plan. D1–D13 are binding: system of
   record; five shapes (creation/verification/custody/stewardship/
   assurance); six primitives (P1 obligation … P6 provenance); per-product
   role (D5); act is a dimension, never a section (D10); roles are tags,
   never a switcher (D11); two equal daily users (D12).
2. **`task_plan.md`** — constraints, the IEC 62443 posture (evidence
   framework, **never** an Art. 27 presumption), the gate table, and the
   per-phase task lists with done-markers.
3. **`lessons.md`** — L1–L57 plus a retro per phase. Not optional; each
   lesson cost real time.
4. **`NEXT_SESSION_PROMPT.md`** — the pasteable opening prompt, kept
   pointing at the current first task.

## Phases — all complete through Phase 30

| Phase | Delivered |
|---|---|
| 0–5 | Role/obligation model on verbatim corpora; statute-pinned rule engines in `lib/` (retention, support period, reporting clocks, deemed manufacturer, notified body, due diligence, versions, end-of-support, steward Art. 24, authorised-rep mandates Art. 18, importer/distributor verification Arts. 19/20, MSA Chapter V); provenance/attestation store; CI gates |
| 6 | Team role model: `TEAM_ROLES` as data (nullable, never defaulted — L40), plaintext `plainPassword` **removed**, role-scoped obligations (`defaultTeamRole`, a routing default never a statutory assignment) + `teamRole` on `/me` |
| 7 | The nine-destination shell (below); polymorphic product file; cross-act Incidents; Authorities/Signatures/Projects/Organisation real; Library owns all reference content; universal statutory flyout; evidence requests (P2 ask-half); NIS2 entity incidents; **G8 = 0 orphans, now a covenant**; donors partner-hub / standards-matrix / importer-archive / open-source-steward / psirt-toolkit / ce-studio **deleted** with redirects |
| 8 | G2 = **0 test failures** (issue #62 closed — dead contracts, wrong session roles, parallel DB races now sequential, 2 storage skips-with-reason); PSIRT CVD pipeline on Incidents; CE derivations in the statutory file (no `mayAffix` by construction); NIS2 verbatim reader (reproducible bundle); **all Dependabot alerts patched** (range-scoped pnpm overrides; 0 open) |
| 9 | Absorption close-out: product-portfolio absorbed into Products (honest bulk import — `POST /conformity/products/import`; quick-start and the fabricating portfolio endpoints deleted; vault kept, its invented-provenance defaults removed); reports → a Home section, flows → `/settings/flows`; the transitional **More menu DELETED** — nav is exactly the nine destinations; auditor-portal decided PERMANENT + EXTERNAL and completed end-to-end in 9.3b (admin-issued expiring tokens, org-side RFI inbox with respond); **G4 driven 7 → 0 and made a covenant** (the empty-string "provenance hash" on the public trust center among the seven). Same day, after the G7 retro: **W2.4 COMPLETED** — 9.4a Cyberbeveiligingswet (NL, promulgated Staatsblad XML, in force 2026-08-15) and 9.4b BSI-Gesetz (DE, consolidated gii XML, a disclosed departure with the verbatim amendment trail), each with a CI verifier including **D2 full-content parity** (which caught and killed 8 flattener-added characters — L51) |
| 10 | **Portable evidence storage** (backend seam: Replit sidecar vs local volume, chooser no-regression proven by unit test; suite reached ZERO SKIPS; restart-persistence proven live) · **Art. 14(8) product-user register + notification record** (tri-state impacted derivation states its rule ON THE WIRE; the app records the org's act, transmits nothing) · **AI Act / Machinery / RED corpora + readers** (authentic OJ, pinned structures, seven verifiers total, five-act citation gate — formerly-skipped AI-Act content now VALIDATES; NIS2 chapter-IX misassignment found+fixed) · **last dead chain deleted** (4 unwritten tables, unauth /api/ecosystem, fake-timestamp seal engine) · L52 (a piped gate launders its exit code) · CI green end-to-end after fixing an invalid workflow env (`runner.temp` is step-only) |
| 11 | **Obligation content ×3 acts (10.3c)** — zero engine changes (D10 held: requirements × declarations). 11.1 RED seeded from nothing (22 rows: Art 3(3)(d)/(e)/(f) cyber essential requirements, Art 10 chain, importer/distributor, Art 15 traceability) — `orgObligations.test.ts` is the endpoint's FIRST suite. 11.2 AI Act verified+extended (3 corrections incl. Art 73's real 15/2/10-day anchors; +11 rows: provider chapter, deployer Art 26 → operator role now termed 'deployer', registration, transparency; GPAI refusal documented). 11.3 Machinery: **three misnumbered Annex III addresses fixed** (duties live in 1.1.9/1.2.1(d)/1.2.1(f); DoC was cited to the SAFETY-COMPONENTS annex — now Art 21) + 12 rows (L53: verify annex section numbers against the OJ SOURCE — the flattened bundle drops them). 11.4 declared-but-unseeded acts now NAMED (`regulationsWithoutSeededContent` + cockpit amber note "Zero here means un-modelled, not compliant"); deriver refusals documented per candidate in the statusDerivers header. Suite 723/0/0. |
| 12 | **D2 full-content parity for the five OJ corpora** (`scripts/lib/oj_content_parity.mjs` — independent flatten, corrigenda must fire, negative control per corpus). Building it exposed FOUR shipped extraction losses, fixed in the shared parser (L54): nested-table truncation (NIS2 Annexes I/II had lost the whole "Type of entity" column), `oj-ti-grseq` heading loss in every annex (CRA Class I/II, Machinery Part A/B…), OJ footer / Parliament-statement leakage into last annexes, one footnote leak into an amendment quote. All five corpora rebuilt, bundles resynced ×3 apps, readers verified live. |
| 13 | **RED Delegated Regulation (EU) 2022/30** — the Art 3(3)(d)/(e)/(f) designations as an EIGHTH corpus (`docs/red_delegated_2022_30/`, THREE committed sources: base + amending 2023/2444 + repealing 2026/339). Amendments applied as must-fire from/to transformations; **repealed with effect from 2027-12-11 in favour of the CRA** — the reader panel on `/library/red` states both lifecycle dates with verbatim quotes; the three Art 3(3) seed rows name their designated categories. L55: read the EUR-Lex ALL view (amendments/repeals) BEFORE building any corpus. |
| 14 | **Storage file GC** (deleteObjectEntity on the seam, both backends; evidence/assessment/product deletion paths GC their stored files after commit; proven on disk live) · **verify_nis2_reader G6 script** · **RED→CRA 2027-12-11 handover milestone** on the act timeline — whose G6 pixel review caught and fixed a SHIPPED off-by-one: formatDate rendered every statutory calendar date one day early in negative-offset timezones. |
| 15 | **The lifecycle repair + guard (L54/L55/L56).** The ALL-view sweep found FOUR shipped corpora carrying superseded/uncorrected text with every gate green. 15.1/15.2: CRA + NIS2 EN corrigenda applied; EHDS 2025/327 recorded pending (2027-03-26). 15.3/15.4: AI Act + Machinery pivoted to the CONSOLIDATED pipeline (as amended by the Digital Omnibus 2026/1744 and 2024/2748 — new parser dialect, hybrid corpus, disclosed-departure verifier, D2 + negative control); GPSR joined as ninth corpus; seeded AI keyDates corrected to the Omnibus dates. 15.5: `check_lifecycle.mjs` (in CI) — whose first run caught the RED eleven years behind (five amending acts incl. common charger: Art 3(4), 3a, Annex Ia, chapter Va, REPLACED Art 10(8)); RED pivoted; OJ euact pipeline deleted; Art 10(8)/13(2) seed rows updated statute-first. Guard passes across all seven EU acts. |
| 16 | **UX/gap review** (audit-first: 25-surface screenshot walk + API probes; findings F1–F8). The reference layer now tells the truth about itself everywhere: acts list "N modelled · M reference-only", amber Reference-only badges + explanatory banners on zero-content acts, honest empty-states for classes/routes, in-app reader links, Library cards derived from as-amended reality, per-act role vocabulary on the cockpit (roleTermByRole), chapter-grouped reader nav. L57: honesty implemented once is honesty in one place. |
| 17 | **GDPR + Data Act + GPSR content.** Tenth/eleventh corpora on the resurrected OJ+corrigenda pipeline (`build_oj_act_corpus.mjs` — GDPR R(02) = 19 must-fire corrections incl. recital-level; Data Act R(01) = 1); 19 statute-first obligation rows (GDPR ×9 for the operator as "controller or processor"; Data Act ×5 — Chapter II binds the manufacturer as "manufacturer / data holder"; GPSR ×5 incl. the Art 6(1)(g) cyber hook); readers + cards + enforced citation gates; acts list "9 modelled · 2 reference-only". **DORA and CER PARKED by decision.** Suite 725/0/0; 156 requirements / 92 mappings. |
| 18 | **RED→CRA handover as per-product guidance.** Nullable tri-state `redInScope` fact on conformity_products (spec-first → orval; null = unanswered, L40); product-file panel for EVERY role rendering the timeline (applies 2025-08-01 · RED governs until 2027-12-11 · repealed by 2026/339, CRA governs from that date) with every date/quote read from the 2022/30 corpus metadata at render time (L57). No new route (G8 untouched). Suite **726/0/0** (+1: tri-state persistence). L58: a CI mirror is the environment, not just the command — and never pipe a gate. |
| 19 | **The wiki pattern for every act (user-requested).** EuActReader v2 carries the CRA-wiki browsing pattern parameterized (tabbed counts, number/title/text search, Cite buttons, numbered paragraph chips + anchors, ?tab&num&q deep links, per-article corrigenda callouts from corpus provenance); nis2-reader migrated onto it (scripted G6 unchanged) — SIX acts share the pattern. oxot-web cards' hardcoded "CRA Wiki View" (NIS2 → CRA recitals!) replaced by per-act WIKI_VIEWS (L59). Regulation detail gains the "Text currency" panel (amendment trail/corrigenda lazy-read from each act's own bundle). Weekly lifecycle LaunchAgent installed (notifies only on REAL failure; reinstall after repo move). |
| 20 | **Website realignment (audit-first).** Review + specs in docs/marketing/website-realignment-2026-08.md (F1–F10, competitive read). 20a: the 2-minute check's off-by-one statutory dates fixed EN-side (NL had forked correct), runway WALL 2027-12-11, workbench "fullText" now corpus verbatim, hero de-animated (CTA was invisible pre-hydration). 20b/20c: repositioned as the EU conformance system of record — operator band + honesty strip (visible G4 waiver: quotes the claim to refuse it) + 7 personas + 4 pillars on home; new /operators page; platform modules = the shipped shell; operator pricing note; operator branch in the check. **20d (public wikis) OPEN.** |
| 21 | **The operator shape (user: "make it the star").** Supplier register (assets outlive relationships), per-product procurement check (tri-state ×7, anchors corpus-verified: Art 13(12)+30, 13(15)–(20); SBOM labelled contractual), per-supplier posture board (unlinked products NAMED), supplier documents (sha256, storage-GC'd incl. product delete), asks with expiring revocable tokens + the PUBLIC door /supplier-portal (rate-limited, no-enumeration, link/note only — L60: file upload deferred to security review). Demo seeds the Fieldbus story. Suite **751/0/0** (+25); G8 26/0 (+6 capabilities); door round-trip proven live end-to-end. |
| 22 | **The funnel's magnets + the door takes files.** 22.1: door FILE upload (token-scoped two-step over the storage seam's one-time ids; 50 MB cap + allow-list; rate-limited; sha256; traversal rejected) — **formal security review is a tracked MUST-DO** (user-accepted ordering). 22.2: the reading room /wiki — seven acts full-text public, sync scripts dual-target both apps with the CI repro diff watching both copies, lazy per-act chunks, Legislation JSON-LD, contextual CTAs, blogs/podcast cross-links. L61: production nginx had NEVER served the sitemap (dev-middleware only) — now proxied, /operators + eight wiki routes included. Suite 754/0/0. |
| 23 | **The supplier-door upload security review (the 22.1 MUST-DO) — DONE.** docs/security/door-upload-review-2026-08.md registers SR1–SR9. Fixed: stored XSS via url (http(s)-only), content laundering/SVG (strict door rule, re-checked at PUT), trust-proxy IP spoof (true→1), per-ask mint cap + door limiter 20→60/min, internal objectPath guard; NEW auth'd attachment download for supplier docs (untrusted bytes never inline). SR6/SR7 noted, SR9 accepted. Suite 761/0/0; G8 27/0; verified live against the container. **The door path is signed off for GA traffic.** L62: a deferred security review is a phase with a register, not a footnote. |
| 24 | **Deployment reconcile + CRA Transit.** `/deployment` restated as FOUR single-tenant modes (AWS European Sovereign Cloud — C5/ISO 27001/SOC 2, EU residency, GDPR Art 28; delivered hardware appliance; Docker; VM) with the island-mode local AI as the moat ("never phones home"). New `/cra-transit` — a one-time, consultant-led 60-day sprint (8 phases, phase 8 = handover & teardown), the Annex VII technical file + Annex V DoC produced/exported then the platform taken down; Module A honesty boundary; Service JSON-LD. Reusable `diagrams/deployment-diagram.tsx` (hub-and-spoke) + `diagrams/process-flow.tsx` (numbered timeline). AWS Sovereign-Cloud terms researched from source. |
| 25 | **The product tour (the demo movie).** `components/product-tour/product-tour.tsx` + `/tour` — an auto-advancing keynote-arc reel built from REAL live screenshots (`public/media/tour/*`), both a self-playing movie and a LinkedIn-style carousel; progress segments, pause/play, prev/next, arrow+space keys, sr-only live region, honours prefers-reduced-motion; VideoObject JSON-LD. Two bugs fixed live: a `public/tour` asset dir collided with the `/tour` route (nginx 403 → moved to `/media/tour`); object-cover cropped shots to their nav (→ object-contain, framed, captioned). |
| 26 | **Visual depth.** Theme-safe SVG diagrams on `/deployment` + `/cra-transit`; default OG image upgraded from a stale placeholder to a real product screenshot (`lib/page-seo.ts` + `index.html`). Flagged: `index.html` hardcodes a Railway production origin and `railway.json` builds the root Dockerfile — a Railway deploy exists whose freshness depends on GitHub auto-deploy (user deferred Railway). |
| 27 | **Tour bilingual + polish.** ProductTour → `SLIDES.en` / `SLIDES.nl` via `useLocale` (11 slides EN+NL, full parity incl. honesty + CTA slides); a 6th real screenshot (the public Trust Centre) as a "prove it" slide, captioned to respect the honesty boundary; a faint OT technical-diagram texture behind text/CTA slides. |
| 28 | **SKIPPED by user decision** ("immediately jump to 29"). IA consolidation (content-hub merge + redirects) remains an open candidate if wanted. |
| 29 | **The revenue pages — capability↔copy aligned.** `/product` gained the "register underneath" proof band (9 acts · 156 article-cited obligations · 7 roles · 11 verbatim CI-verified corpora; the roles list; the text-currency guarantee). NEW `/manufacturers` — the primary CRA subject (Module A, Annex VII, Annex V DoC, Art 13/14, honest non-conclusion), symmetric with `/operators`, in the nav. `/compare` REWRITTEN from an off-brand slate/cyan overclaiming page to a token-themed, theme-aware, HONEST structural comparison (IT-GRC vs firmware scanners vs OXOT, a 9-row Native/Partial/Out-of-scope matrix, "no fabricated verdicts"). Act landing pages already exist via `/frameworks/:key`. |
| 30 | **Crawler dynamic rendering (the ranking unlock).** Production nginx served every crawler the generic SPA shell; the dev server already proxied crawler UAs to `/api/seo/page-meta`, but that middleware never runs in prod, and the hardcoded funnel routes aren't CMS rows. Fix (browser-free, runs in node:24-slim + on Railway): `api-server/src/lib/funnelMeta.ts` (per-route title/description/OG/JSON-LD for the funnel pages, EN+NL); `GET /api/seo/render?path=` (funnel meta / CMS page meta / noindex-for-shells, now emitting JSON-LD — SoftwareApplication/Service/VideoObject/Organization/WebPage); a `$oxot_is_crawler` UA map + `@crawler_render` in `docker/nginx.conf` (crawlers 418→render, humans → SPA, assets serve as files); `botListDrift.test` extended to guard the THIRD UA list. Verified live: Googlebot gets per-route meta (Dutch on /nl/*), humans get the shell, assets unaffected. L63: reuse the dynamic-rendering path the dev server already proved; don't build a prerender pipeline the deploy can't run. |

## The application map (key files)

**Nine destinations** (`artifacts/conformity/src/App.tsx` route table;
`components/layout.tsx` nav — Work / Registers / Reference / Admin):

| Destination | Page / key components | Backed by |
|---|---|---|
| Home `/` | `pages/dashboard` → `command-center.tsx` → `components/home/your-work.tsx` (role-scoped work + evidence-request inbox), `persona-cockpit.tsx` | `/conformity/org/obligations` (+ `defaultTeamRole`), `/conformity/me`, `/conformity/evidence-requests` |
| Incidents `/incidents` | `pages/incidents.tsx` (CRA product clocks + NIS2 entity incidents + `components/incidents/psirt-panel.tsx`) | `conformityAssessments.ts` incidents, `entityIncidents.ts` + `lib/nis2Reporting.ts`, `conformityPsirt.ts` |
| Authorities `/authorities` | `pages/authorities.tsx` | `msaEngagements.ts` + `lib/marketSurveillance.ts` (deadlines CAPTURED from the authority, never computed) |
| Signatures `/signatures` | `pages/signatures.tsx` (read-only ledger) | `attestations.ts` + `lib/attestationStore.ts`; Annex V signing stays in the workbench with its refusal rules |
| Products `/products(/:id)` | `pages/product-detail.tsx` + `components/product-file/*` (verify-panel, notified-body-panel, deemed-manufacturer-panel, auditor-access-panel — issue/revoke portal tokens + RFI inbox, product-users-panel — the Art. 14(8) register) + StatutoryFile (versions, CE, retention, due diligence) | `conformityAssessments.ts`, `statutoryFile.ts`, `operatorChecks.ts`, `notifiedBody.ts`, `deemedManufacturer.ts`, `lib/ceMarking.ts` — the file renders **per the product's `orgRole`** (nullable; null prompts, never guesses) |
| Projects `/projects` | `pages/projects.tsx` (Art. 24 engine — the ONLY steward implementation) | `stewardPolicy.ts` + `lib/openSourceSteward.ts` (versioned supersede-never-overwrite policies) |
| Organisation `/organisation` | `pages/org-profile.tsx` + `components/organisation/mandates-panel.tsx` | `orgProfile.ts` declarations, `mandates.ts` (stored-as-written, defects reported never trimmed) |
| Library `/library` | `pages/library.tsx` → `cra-wiki` (CRA), `nis2-reader.tsx`, `cbw-reader.tsx` (NL, Dutch), `bsig-reader.tsx` (DE, German + amendment trail), `ai-act-reader` / `machinery-reader` / `red-reader` (shared `eu-act-reader.tsx`; RED carries the directive/transposition caveat), acts/requirements/themes/mappings/sources under `/library/*` | corpora bundles; `components/statutory-flyout.tsx` = law at point of use (verbatim only, CRA-only — no lookalikes for other acts) |
| Settings `/settings` | `pages/team.tsx` (team + `teamRole` select) | `adminTeam.ts` |

**The transitional "More" menu is GONE** (9.3): every surface it held was
re-homed or, for `/auditor-portal`, decided permanent-and-external (the
token-authenticated notified-body door, routed OUTSIDE the login shell;
tokens are issued and RFIs answered in the product file's
`auditor-access-panel.tsx`). Do not reintroduce a junk-drawer menu.

**Corpora** (the source of truth) — ELEVEN, all from committed authentic
sources, script-built, reproducible in CI, D2 full-content parity with
negative controls, and since Phase 15 lifecycle-guarded (L55/L56 —
`check_lifecycle.mjs` requires every text-affecting EUR-Lex relation to
be accounted for in corpus metadata):

- `docs/cra_statutory_corpus/` — OJ original + TWO applied EN corrigenda
  (Art 64(10), Art 67) + EHDS 2025/327 recorded as PENDING (2027-03-26).
- `docs/nis2_statutory_corpus/` — OJ original + applied EN corrigendum
  (Art 19(1)).
- `docs/{ai_act,machinery,red,gpsr}_statutory_corpus/` — CONSOLIDATED
  pipeline (`build_consolidated_act_corpus.mjs`, `eu_consolidated_parser`):
  acts amended in force, built AS AMENDED from the EUR-Lex consolidated
  text at a pinned date (hybrid: recitals from the original OJ), amendment
  trail + corrigenda disposition in metadata, disclosed in the readers.
  AI Act 119 arts (Digital Omnibus 2026/1744); Machinery 59 (2024/2748 +
  Omnibus); RED 58 (FIVE amending acts incl. common charger — Art 3(4),
  3a, Annex Ia, chapter Va); GPSR 55 (2024/2748) — no reader yet, stated.
- `docs/red_delegated_2022_30/` — Delegated Regulation 2022/30 as amended
  by 2023/2444, repealed 2027-12-11 by 2026/339 (CRA handover).
- `docs/{gdpr,data_act}_statutory_corpus/` — OJ+corrigenda pipeline
  (`build_oj_act_corpus.mjs`): authentic originals + EN corrigenda applied
  as must-fire substitutions (GDPR R(02) ×19; Data Act R(01) ×1).
- `docs/cbw_statutory_corpus/` + `docs/bsig_statutory_corpus/` — the NL/DE
  transpositions (Staatsblad XML / gii XML).

Each has its own verifier — `verify_{cra,nis2,cbw,bsig,red_delegated}_corpus.mjs`
plus `verify_consolidated_corpus.mjs <ai_act|machinery|red|gpsr>` and
`verify_oj_act_corpus.mjs <gdpr|data_act>` (ELEVEN in all), plus
`check_lifecycle.mjs`, ALL in CI. The OJ-format euact
builder/verifier were DELETED in 15.5 (their acts all pivoted; a stale
rebuild must never resurrect superseded text). Corpus bundles are excluded
from every content gate — they ARE the law (L52). Verify any article
number against the corpus **title** before putting it in a label (L41),
and any annex SECTION number against the committed source (L53).

**Spec-first pipeline**: `lib/api-spec/openapi.yaml` → `orval`
(`cd lib/api-spec && ./node_modules/.bin/orval --config ./orval.config.ts`)
→ `lib/api-zod` + `lib/api-client-react` (generated — NEVER hand-edited;
a hand-edit survives only until the next codegen run, L37). New endpoints
consumed via the generated client go in the spec first.

**Schema**: `lib/db/src/schema/*` via drizzle `push-force` — no migration
history. One-shot `migrate`/`seed` images bake the schema at build time:
**rebuild them before any parity run** or they resurrect dropped columns
(L39).

## The public marketing app (`artifacts/oxot-web`) — the second app

Almost all Phase 20–30 work lives here. It is a **separate SPA** from the
conformity workbench: Vite + React + **wouter** routing + **framer-motion**
+ Tailwind v4 **design tokens**. nginx serves it from
`/usr/share/nginx/html/oxot` at the site root; the workbench lives under
`/conformity*` and the API under `/api`.

**Routing** (`src/App.tsx`): public funnel routes are wrapped in
`PublicRoute`; a nested `/nl` wouter Router mounts the Dutch variants. Key
public pages (`src/pages/*`): `home`, `product` (the platform), NEW
`manufacturers` + `operators` (the two ICP persona pages — symmetric),
`cra-transit`, `deployment`, `pricing`, `resources`, `competitors-page`
(`/compare`), `tour`, `demo`, `trust-center-page`, `cra-check`, the
`frameworks-*` act layer (`/frameworks/:key`), and the public **reading
room** `wiki-*` (`/wiki`, `/wiki/:act` — full verbatim statutory text via
the shared `EuActReader`, the same component the workbench Library uses).
`/admin/*` is the CMS shell. CMS/blog/knowledge pages are DB-backed
(`slug-page`, `blog-*`, `knowledge-hub`).

**Locale**: `useLocale()` from `@/providers/locale-provider`. **Every page
carries en + nl copy blocks**; NL uses the professional "u" register and is
machine-assisted — flagged for native review before paid traffic. `/nl`
prefix = Dutch, self-canonical.

**Design**: build with the token system — `bg-background`/`bg-card`,
`border-border`, `text-foreground`/`text-muted-foreground`, `text-primary`
— never hardcoded colours (the Phase-29 `/compare` rewrite existed because
the old page hardcoded slate/cyan and broke the theme). Use `PageHeader`,
`revealVariants` from `@/lib/motion`, and keep it theme-aware (light/dark).

**SEO / ranking (Phase 30)**: a page sets its own tags client-side via
`useSeo(pageSeo('/route', { title, description }))`. For CRAWLERS (no JS),
production nginx proxies crawler UAs to `GET /api/seo/render`, which reads
per-route meta from `api-server/src/lib/funnelMeta.ts`. **Adding a public
funnel page is a four-touch checklist**:
1. `pages/x.tsx` — en+nl copy, `PageHeader`, `useSeo(pageSeo('/x', …))`.
2. `App.tsx` — a `<Route path="/x">` wrapped in `PublicRoute`.
3. `components/layout/header.tsx` — `FUNNEL_NAV` entry + the `nav[]` label
   in BOTH locales (positional, by index).
4. crawler meta: add the route to `api-server/src/routes/seo.ts`
   `STATIC_FUNNEL_ROUTES` (sitemap) AND `funnelMeta.ts` (title/description/
   JSON-LD, EN+NL). Then typecheck, `vite build`, rebuild the `web`
   container, and `curl -A Googlebot` the route to confirm per-page meta.

**Verify a marketing change live**: rebuild the `web` container (and `api`
if you touched `seo.ts`), then browser-screenshot the page AND
`curl -A "Googlebot" http://localhost:8088/<route>` for the crawler meta;
`curl -A "Mozilla…"` must still return the SPA shell.

## The gates — every one at its floor

```
# per package (tsc is hoisted to the ROOT node_modules/.bin)
cd <pkg> && <root>/node_modules/.bin/tsc --noEmit          # G1
cd artifacts/conformity && ./node_modules/.bin/vite build   # G3
node scripts/check_honesty.mjs   --baseline 0               # G4 — COVENANT (0 since 9.5)
node scripts/check_citations.mjs --baseline 0               # G5 — EIGHT acts (cra/nis2/ai_act/machinery/red/gdpr/data_act/gpsr)
node scripts/check_ui_reach.mjs  --baseline 0               # G8 — COVENANT (27 reached)
node scripts/verify_cra_corpus.mjs && node scripts/verify_nis2_corpus.mjs \
  && node scripts/verify_cbw_corpus.mjs && node scripts/verify_bsig_corpus.mjs \
  && node scripts/verify_red_delegated_corpus.mjs \
  && node scripts/verify_consolidated_corpus.mjs ai_act \
  && node scripts/verify_consolidated_corpus.mjs machinery \
  && node scripts/verify_consolidated_corpus.mjs red \
  && node scripts/verify_consolidated_corpus.mjs gpsr \
  && node scripts/check_lifecycle.mjs
```

Run gates BARE — never through a pipe: `cmd | tail -1 && next` proceeds on
tail's exit code, not the gate's, and shipped a red G4 once (L52). Silence
with `>/dev/null`, which preserves the status.

**G2 (tests) = ZERO failures AND ZERO SKIPS**, run in the CI-mirror
environment (the workbench + api suites; ~770 tests through Phase 30). The
local mirror needs the FULL env — `PRIVATE_OBJECT_DIR`/storage sidecar and
`ADMIN_USERNAME` too, or storage-backed tests error instead of skipping
(L58). **GitHub Actions CI is the authority** (`.github/workflows/ci.yml`
provisions the DB with push-force + seed then runs zero-skip); last green:
Phase 30, commit `3ea4a7e`. Add `OBJECT_STORAGE_BACKEND=local` + an
`OBJECT_STORAGE_DIR` tmpdir to the env below to run it by hand:

```
docker run -d --name oxot-test-db -p 127.0.0.1:5544:5432 \
  -e POSTGRES_USER=oxot -e POSTGRES_PASSWORD=oxot -e POSTGRES_DB=oxot pgvector/pgvector:pg16
docker exec oxot-test-db psql -U oxot -d oxot -c 'CREATE EXTENSION IF NOT EXISTS vector;'
cd lib/db && DATABASE_URL=postgres://oxot:oxot@127.0.0.1:5544/oxot \
  ./node_modules/.bin/drizzle-kit push --force --config ./drizzle.config.ts
cd artifacts/api-server && DATABASE_URL=... NODE_ENV=test npm run seed:conformity
DATABASE_URL=... SESSION_SECRET=<32+ chars> ADMIN_USERNAME=ci-admin \
  ADMIN_PASSWORD=... NODE_ENV=test DEMO_READONLY=true ./node_modules/.bin/vitest run
docker rm -f oxot-test-db
```

Test files run **sequentially** (`vitest.config.ts`) because they share one
database. Suites own their fixtures (create + delete; never scavenge
leftovers — L46). Tests mint signed cookies via
`routes/__tests__/helpers/testAuth.ts` — never the login route (rate
limiter: 10/15min, reset by api-container restart, never weakened).

**G6 (live)** per batch: rebuild containers, drive the surface with
Playwright (`scripts/verify_*_playwright.mjs`, 29 repeatable scripts —
pattern: login, act through the real UI, read persisted state back via the
API, screenshot, clean up probes), and **review the screenshot** — pixels
catch what assertions miss (nav collisions were found only that way).

**G7** closes every phase: update `lessons.md`, then re-tune the next
phase's tasks before starting it.

## The method (how every task runs)

1. **Read the statute before implementing** — from the corpus, verbatim,
   including the anchor sentences (clock anchors differ per act: CRA final
   report ← corrective measure; NIS2 final report ← notification
   SUBMISSION — L42).
2. **Verify before claiming** — run the command, show the output; defect
   reports are claims too and get verified at write time against the
   current tree (L36).
3. **Rules as pure functions first**: statute logic in
   `artifacts/api-server/src/lib/` with unit tests → routes → UI.
4. **One task, one commit, message records WHY.** Gate commands are chained
   with `&&` so red stops the commit (L45). Scripted bulk edits assert
   their replacements landed (a bare `.replace` no-ops silently — L48).
5. **Tri-state discipline**: a FACT may be null (never defaulted); a ROUTE
   must terminate somewhere safe and its name admits it is a default
   (L40). Unanswered never renders as compliant.
6. **Honesty in the surface itself**: where a capability does not exist,
   the page says so and says when it will; refusal rules (publish
   completeness, sign completeness, duty-to-refrain holds) refuse — they
   never warn-and-allow.
7. **Donor doctrine**: a page is deleted only after its last real engine
   consumer is re-homed (grep its `/api` calls first — L43), then routes
   redirect so bookmarks survive.
8. **Batch cadence**: survey → scope one shippable batch → build → all
   gates → G6 live with screenshots → plan done-marker → commit → push
   branch AND main (fast-forward).

**Halt and ask, never guess, when**: a new `honesty-ok:`/`citation-ok:`
waiver would be needed; the corpus does not settle a legal question (this
is why W2.4 waited until the sourced national texts were located rather
than reconstructing them — and why the DE source-strategy fork was decided
on evidence with the user, not guessed); the same approach failed twice;
or `git log`/`git status` shows an unexpected change (the audio script is
the known benign one).

## Next steps (Phases 24–30 closed 2026-08-18, all floors held; G8 27/0)

**No task is in flight. DORA and CER are PARKED by user decision** (amber
reference-only framing; revisit only when a customer declaration needs
them). Open candidates:

1. **Phase 30b (optional):** full-body SSG via `renderToString` for the
   funnel routes — JS-less body indexing + Core Web Vitals, on top of the
   Phase-30 per-route meta. Left as a follow-on by scope choice.
2. **Railway:** activate the crawler block (the `$oxot_is_crawler` map +
   `@crawler_render`) in `docker/nginx.railway.conf.template` — annotated
   but NOT activated (untestable here) — and verify the production deploy
   is current. `index.html` hardcodes the Railway origin; `railway.json`
   builds the root Dockerfile.
3. **Phase 28 (deferred):** IA consolidation — merge the content hubs
   (/resources + /knowledge + /news), promote /trust + /security, add
   redirects. User skipped it to reach 29; still open.
4. Podcast narration date audit before regeneration (user-flagged).
5. Native-Dutch review of nl marketing strings before paid traffic.
6. Hardening backlog from the door review (not blocking GA): antivirus
   scan of uploaded bytes; a background orphan-upload sweeper; wiring
   the dormant ACL layer (SR7); admin media path validation (SR6).
7. **User-only, between sessions:** move the repo out of `~/Downloads`,
   then re-run `scripts/ops/install_lifecycle_launchagent.sh`.

(Phases 24–30 delivered: the deployment reconcile + CRA Transit; the
bilingual product tour; visual SVG diagrams + real-screenshot OG; the
revenue pages — /product proof band, /manufacturers, honest /compare; and
the crawler dynamic-rendering ranking unlock. The 22.1 door-upload
security review is DONE — Phase 23; the door is signed off for GA.)

No new phase is opened until the user chooses among these or names new
scope.

## Traps that actually happened (do not rediscover)

1. **Never flip `DEMO_READONLY` in ci.yml** to fix a test — that restores
   unauthenticated writes. Tests authenticate; guards stay.
2. **Never raise a gate baseline.** At zero, a baseline is a covenant, not
   a history (L44).
3. **A wrong-but-existing citation passes the gate** — three shipped
   labels cited real articles that were the wrong ones (L41). Check the
   article's title in the corpus first.
4. **Filter the findings, never the failure** — `tail`/`grep` on gate
   output has hidden both crashes and verdict lines repeatedly (L4).
5. **The stale-container wait** — "Up About a minute" may be the PREVIOUS
   build. Wait on the build PID or the task notification (L47).
6. **Corpus bundles are excluded from the citation scan** (they ARE the
   law and cite other instruments); never "fix" TFEU citations inside them.
7. Generated client files are regenerated wholesale — hand-edits are
   deleted by the next `orval` run (L37); spec first, always.
8. **A gate piped through `tail` launders its exit code** (L52) — a zsh
   pipeline returns the LAST command's status, and one red G4 shipped that
   way. Run gates bare; `>/dev/null` preserves the status.
9. **`${{ runner.temp }}` is invalid in a workflow's job-level `env`** —
   it silently killed every CI run at file-parse time, which looks like
   red gates but is a dead workflow. Literal paths in job env.
