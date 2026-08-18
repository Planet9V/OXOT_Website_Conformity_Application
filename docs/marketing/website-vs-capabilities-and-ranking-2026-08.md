# Does the public website capture the application — and can it rank?

**2026-08-17. Verdict up front: you are right on both counts, and the second
one is worse than the first.**

1. **Coverage gap** — the site markets roughly a third of what the
   application does. (Conceded; catalogued below.)
2. **Ranking gap (the decisive one)** — even the content that *is* on the
   site is **invisible to search engines**. The marketing site is a
   client-rendered SPA with no server-side rendering and no per-page meta
   in production. A crawler on any URL gets the same 2.6 KB generic shell
   with one title and zero body text. **As built, the site cannot rank —
   including the "reading room," whose entire premise was to rank.**

Both are evidenced below. Fixes are MFS-scored (Impact+Fit+Speed −
Effort−Cost).

---

## Part 1 — What the application actually does (census, cited)

**Regulations modelled: 9 of 11** (`seedConformity.ts`), each obligation
citing its article — **156 requirements, 92 cross-act mappings**:
cra (33), iec_62443 (27), ai_act (23), red (22), nis2 (12), gdpr (9),
machinery (20 — corrected Annex III addresses), gpsr (5), data_act (5).
DORA + CER are reference-only (parked).

**Verbatim statutory corpora: 11**, CI-verified character-exact, corrigenda
applied and disclosed, amendments tracked by a lifecycle guard —
CRA, NIS2, AI Act, Machinery, RED (+ its 2022/30 delegated act), GDPR,
Data Act, GPSR, plus the Dutch (Cbw) and German (BSIG) NIS2 transpositions.
**9 in-app readers; 7 acts exposed as public wikis.**

**Statutory rule engines: ~18** pure libs, each answering one legal
question — importer/distributor verification (Arts 19/20), deemed
manufacturer (21/22), notified-body routing (32/Annex VIII), support
period (13(8)), the three retention clocks (13), Art 14 reporting status,
supplier due diligence (13(5)), version-aware obligations, end-of-support
survival, OSS steward (24), authorised-rep mandate custody (18), market
surveillance (Ch V), traceability (23), CE derivation (29/30), Art 27
presumption, conformity route (32(2)), NIS2 staged reporting (23(4)),
BOM upstream-notification gaps (13(6)).

**27 UI-reachable API capabilities** (the G8 gate's authoritative list),
including the auditor portal (expiring notified-body tokens + RFI inbox),
the public per-product trust center, the supplier door, the public
security/CVD page, evidence requests, entity incidents, product-user
Art 14(8) register, bulk import.

**7 canonical roles**, each act rendered in its own vocabulary
(manufacturer→"provider" in the AI Act, operator→"controller or processor"
in GDPR, etc.).

**Single-tenant by design** (schema-level), on-prem-capable.

### What the website surfaces of that
Home (CRA journey + 4 pillars + operator band + honesty strip), an
operators page, pricing, deployment, the 2-minute check, and the reading
room. **It does NOT market:** the 9-act obligation engine with 156 cited
duties, the auditor portal, the trust center, notified-body routing, IEC
62443, the deemed-manufacturer/verification engines, the lifecycle/
text-currency discipline, 5 of 7 roles, or the NL/DE transposition
corpora. These are precisely the terms a serious buyer evaluates on.

### One honesty gap to fix first
Deployment copy says "on your own premises with a **local AI model**," but
the shipped `docker-compose.yml` routes inference to **OpenRouter/OpenAI**
by default; no local-model service is defined. Local AI is a real *option*,
not the default — the copy should say so. (One-line fix; credibility.)

---

## Part 2 — The ranking verdict (tested against the live container)

Market reality (what CRA buyers actually search — Mend, Cycode, Cloudsmith,
Certivo, sbomify all rank here): **SBOM automation, the "21/13 essential
requirements," the Annex VII technical file, 24h/72h vulnerability
reporting, conformity assessment evidence, CE marking.** Certivo/Cycode/
Mend win with **server-rendered framework landing pages**
(`/frameworks/eu-cyber-resilience-act`) carrying real text.

Now the test. `curl` as Googlebot against the shipped stack:

- **`/wiki/gdpr` → 2,644 bytes.** Title is the generic
  "OXOT Conformance Platform…", not the GDPR-specific title I set. Meta
  description is the site default. The GDPR article text ("data protection
  officer", "2016/679") appears **0 times**.
- **`/` (home)** — the repositioned copy ("Run product conformity as an
  operation") appears **0 times** in the initial HTML.
- No SSR, SSG, prerender, or react-snap in the web build. The per-page
  `useSeo` meta only runs client-side; crawlers don't reliably execute it.
- The dev-only `vite-seo-plugin` injects per-page meta *in the vite dev
  server* — but it (a) covers only a curated CMS list that excludes the
  `/wiki/*` and funnel routes, and (b) does not run in the production nginx
  container at all. Phase 22 wired the *sitemap/robots* proxy; it did **not**
  wire per-page meta or content for crawlers.

**Consequence:** every marketing URL serves search engines an identical
generic shell. Google cannot see the home repositioning, the operators
page, or a single word of the seven statutory wikis. The sitemap lists
eight wiki URLs that all resolve, for a crawler, to the same empty CRA
shell. **The reading-room SEO strategy is, today, non-functional.** This
is the real reason the public site won't rank — not the copy.

---

## Part 3 — Prioritised fixes (MFS-scored)

**F1 — Make the site server-visible (prerender the known routes). MFS +9.**
*(Impact 5, Fit 5, Speed 3, Effort 2, Cost 1.)* The wikis are built from
committed, static corpus bundles and the marketing pages from static copy —
so this is **static generation of known routes at build time** (vite-ssg or
a prerender pass over the route list), not a Next.js migration. Emit real
HTML (article text + correct per-page title/description/canonical + the
existing `Legislation` JSON-LD) for `/`, `/operators`, `/product`,
`/pricing`, `/wiki` and each `/wiki/<act>`. Without this, everything else
here scores zero organic. **Do first.**

**F2 — Framework landing pages for the buyer's exact queries. MFS +8.**
*(Impact 5, Fit 5, Speed 2, Effort 3, Cost 1.)* One page per modelled act
(`/frameworks/cra`, `/nis2`, `/ai-act`, …) built on the terms competitors
rank for: SBOM, the 13/21 essential requirements, the Annex VII technical
file, 24h/72h reporting, conformity routes — each linking to that act's
free wiki and the 2-minute check. This is where the intent traffic is, and
the app genuinely backs every claim.

**F3 — Surface the hidden capabilities (conversion, not just SEO). MFS +9.**
*(Impact 4, Fit 5, Speed 3, Effort 2, Cost 1.)* Add to the platform page /
new sections: the 9-act obligation engine ("156 duties, each citing its
article"), the auditor portal, the trust center, notified-body routing,
the text-currency/lifecycle guarantee, all 7 roles. Cheap, fast, and it's
what a serious evaluator needs to see before booking a demo.

**F4 — Fix the local-AI copy-vs-shipped gap. MFS +11.** *(Impact 3, Fit 5,
Speed 5, Effort 1, Cost 1.)* One-line honesty edit; a compliance vendor
cannot afford a provable overclaim on its own deployment page. **Do now.**

**F5 — Comparison / alternative pages. MFS +8.** *(Impact 4, Fit 4, Speed
3, Effort 2, Cost 1.)* "OXOT vs ONEKEY / Certivo / Cybellum": buyers search
vendor + "alternative," and our honest differentiators (verbatim
as-amended law, never concludes conformity, single-tenant/on-prem,
operator supplier-management) are real wedges. Needs F1 to be crawlable.

**Sequence:** F4 (now) → F1 (the unlock) → F2 + F3 (in parallel behind F1)
→ F5. Nothing ranks until F1 ships; F3 lifts conversion of the traffic you
already pay for regardless.

---

## Sources
- CRA buyer/keyword landscape: Mend, Cycode, Cloudsmith, Certivo, sbomify
  (2026 CRA compliance guides / framework pages).
- SPA-SEO: multiple 2026 JavaScript-SEO guides — CSR SPAs need SSR/SSG or
  prerender; critical content must be in the initial HTML, not the render
  queue.
- App census: `seedConformity.ts`, `check_ui_reach.mjs`, `orgRoles.ts`,
  `artifacts/api-server/src/lib/*`, `docker-compose.yml` (cited inline).
- Live crawler test: `curl -A Googlebot` against the running :8088 stack.
