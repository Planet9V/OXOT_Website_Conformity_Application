# Website realignment review — 2026-08-17 (Phase 20)

**Scope.** Critical review of the informational website (oxot-web) against
the application as actually shipped through Phase 19, a competitive read,
and implementable specifications. Audit-first: every claim below was
checked against source, the live site, or the live web. Findings are
ordered by funnel impact, not by page.

**The one-paragraph verdict.** The site is well-written and honest in
tone — rarer than it sounds in this market — but it sells the product we
had in Phase 6, not the one we have. It positions a CRA-only workbench
("six modules") while the application is now a **multi-regulation
conformance system of record** (11 acts listed, 9 modelled with 156
statute-cited obligations, verbatim as-amended statutory texts for the
CRA + six EU acts + the Dutch and German NIS2 transpositions). The
funnel's core asset — the 2-minute check — carries a **factual date
error on every screen** (10 Dec 2027 / 10 Sep 2026 instead of the
statutory 11 Dec 2027 / 11 Sep 2026), while the home page states the
correct dates two clicks away. And the largest under-served buyer in the
market — the operator/asset-owner managing *suppliers'* CRA posture — is
one sentence on the site and one insight string in the check, despite
being a real persona in the product and the segment no competitor
addresses well.

---

## 1. The operator question, answered with evidence

**Did the operator/asset-owner use case make it into the conformity
application?** Yes as a persona; partially as a workflow. Precisely:

**Shipped and real today:**
- `operator` is a canonical role with the honest statutory frame the
  market gets wrong: *the CRA binds the operator's suppliers, not the
  operator* — its own duties are NIS2 ("essential or important entity",
  12 modelled obligations), AI Act deployer (Art 26), GDPR ("controller
  or processor"), IEC 62443 asset owner. The persona cockpit renders
  this per act, in each act's own vocabulary.
- The product registry works as an **equipment register**: any device
  bought can be filed with manufacturer name/address, version, support
  period, placed-on-market date, per-product role = operator; bulk
  import exists for a whole estate.
- The evidence vault, BOM vault (multi-BOM tree), incidents (NIS2
  entity incidents), and the RED→CRA handover panel (renders for every
  role) all work on operator-filed products.
- The verification rule engine (CRA Arts 19/20 checks: CE marking, DoC
  present, manufacturer duties visibly done) exists and runs — today it
  is surfaced only for importer/distributor roles.
- The deemed-manufacturer engine (Arts 21/22) answers "did our
  modification make us the manufacturer" — the operator's retrofit
  question — today surfaced for importer/distributor/system-integrator.

**Not yet built (the honest gap):**
- No supplier/vendor **entity** — manufacturers are text fields on
  products, so there is no "all products from supplier X" pivot.
- Evidence requests are internal-team-only (role-scoped inbox); there
  is no supplier-facing ask ("send us your DoC / SBOM / support-period
  statement") and no supplier submission door (the auditor-portal
  pattern exists and could be reused for exactly this).
- No portfolio-level supplier analysis ("which of my 200 devices have a
  DoC on file · support period expiring within 24 months · Class II
  with no assessment evidence").
- The operator's product file renders the generic (manufacturer-shaped)
  content rather than an operator shape built around the verification
  gate + supplier evidence custody.

**Assessment.** The market opportunity is real and the moat is natural:
every NIS2 essential/important entity procuring connected equipment
must, from 11 Sep 2026 onward, care about each supplier's CRA posture —
and the competitive field (Section 3) serves manufacturers (firmware
scanners, SBOM platforms) or generic TPRM questionnaires, not a
device-file-centric supplier evidence register. We already own the
hardest ingredient (the statutory rule engines and the honesty
doctrine). Recommendation: **sell what is true now** (register the
estate, file supplier evidence per device, your own NIS2/AI-Act/GDPR
duties in one cockpit) **and build the operator shape as a product
phase** (supplier entity + supplier-facing evidence requests + portfolio
analysis + operator product-file shape, reusing the verification engine
and the auditor-portal door). Website prominence should track what
ships: claims first, only after the surface exists.

---

## 2. Findings (site vs. application truth)

**F1 — FUNNEL-CRITICAL, FACTUAL. The 2-minute check's dates are wrong
by one day, everywhere.** `cra_selfcheck_en.json` (and nl) says "10 Dec
2027" / "10 December 2027" / "10 September 2026" in ~12 places
(deadline counter label, runway chart, reporting-clock callout, result
bodies). The statute (CRA Art 71, in our own corpus) says **11 December
2027** and **11 September 2026** — and the home page states the correct
dates. A prospect who notices concludes the tool is careless — fatal
for a product whose pitch is statutory precision. The CIR citation
(2025/2392) checks out; the dates do not. *Fix: correct every instance
in both locales; add the two dates to a single constants block so they
cannot fork again.*

**F2 — POSITIONING. The site sells the Phase-6 product.** "The CRA
Conformance Application", "Six modules, one record", all three pillars
CRA-only. Reality shipped: 11 regulations (9 modelled: CRA, NIS2,
AI Act, Machinery, RED, GDPR, Data Act, GPSR, IEC 62443; DORA/CER
reference-only), 156 obligations each citing its article, per-act role
vocabulary, cross-act incidents, verbatim as-amended readers for seven
EU texts plus the NL/DE NIS2 transpositions with CI-verified character
parity, per-product RED→CRA handover, auditor portal, public trust
center, product-user register (Art 14(8)), notified-body engagements.
The headline "One record, every regulation" already promises the true
story; the content never cashes it. *Fix: reposition as "the EU
conformance system of record for products with digital elements — CRA
first", with the CRA journey as the flagship use case, not the box.*

**F3 — The operator/asset-owner segment is invisible.** One persona
card ("Test your suppliers now, while you can still switch") and one
insight string. No page, no journey, no CTA of its own. See Section 1.
*Fix: a dedicated "For operators & asset owners" page + an operator
branch in the self-check that ends at an operator-shaped CTA (supplier
posture review, not CE-route intake).*

**F4 — Shipped differentiators that are unsold.** Nothing on the site
mentions: the verbatim statutory wikis (CRA + six acts + NL/DE — a
category-unique asset), text-currency discipline (corrigenda applied
and disclosed, consolidated versions dated, a CI lifecycle guard
watching EUR-Lex), the honesty doctrine (the app *never* concludes
conformity — Art 32 stays with the manufacturer; a compliance tool that
refuses to lie is a differentiator in a market of green checkmarks),
the auditor portal (expiring tokens for a notified body), the public
trust center per product, the OSS-steward role (Art 24 — no competitor
addresses stewards), single-tenant/on-prem with local AI. *Fix: a
"Why OXOT is different" section built on exactly these, with the wikis
doubled as public SEO lead magnets (see Section 4).*

**F5 — Time-sensitive market claims are hardcoded with no review
date.** "Zero notified bodies designated today", "harmonised standards
expected ~Q2 2027", "ENISA, June 2026: only 35% of SMEs...". These were
plausibly right when written; each will silently rot, and one wrong
"zero" destroys the credibility the precision earns. *Fix: a dated-
claims register (JSON with `asOf` per claim + a monthly review habit);
render "as of <month>" beside volatile numbers.*

**F6 — The hero hides its own CTA.** Measured live: seconds after
load, the H1 sits at opacity 0.45 and the hero body + CTA block at
opacity 0 (framer-motion entrance animation slow/stalled; it does
settle eventually). First-visit screenshot shows a black hole where
"Book a demo / Take the 2-minute check" should be. *Fix: cut entrance
animation durations/delays hard (or remove them on the hero); never
animate the primary CTA's opacity.*

**F7 — "Six modules" undercounts even the CRA product.** The shipped
shell has nine destinations (Home, Incidents, Authorities, Signatures,
Products, Projects, Organisation, Library, Settings) plus the auditor
portal and trust center. The 8-step journey copy remains accurate for
the manufacturer flow. *Fix: describe the real shell; keep the 8-step
journey as the manufacturer's spine.*

**F8 — Pricing is manufacturer-metered only.** "Products with digital
elements under management" reads naturally for a manufacturer's
catalogue; the operator counting 500 purchased devices needs its own
framing (estate size / supplier count). *Fix: an operator column or
note once the operator page exists.*

**F9 — Personas undersold.** Site lists 5; the app models 7 canonical
roles, and two of the missing ones are differentiators (authorised
representative with Art 18 mandate custody; open-source steward with
the Art 64(10)(b) fine exemption stated honestly). *Fix: extend the
persona grid; each card links to a role-true description of what the
product file renders for that role.*

**F10 — Boutique signals in the funnel copy.** "Vincent will personally
review", "From about €20K", "proposal with NDA & MSA within 2 working
days". These are credible for a boutique and may be intentional —
flagged only so the choice is deliberate at the next copy pass.

---

## 3. Competitive read (live web, Aug 2026)

Three clusters, none occupying our ground:

1. **Firmware/SBOM product-security platforms** — ONEKEY (Compliance
   Wizard; CRA/RED/IEC 62443 questionnaires; firmware binary analysis;
   "procurement to end-of-life" language but manufacturer-centric),
   Cybellum (Product Security Platform 3.0, compliance manager),
   Finite State, Black Duck. Strength: automated technical evidence
   (SBOM, CVEs). Weakness: statute-shallow — checklists ABOUT the law,
   not the law; multi-act obligation logic thin; cloud multi-tenant.
2. **AppSec/SCA vendors adding CRA marketing** — Mend, ArmorCode
   (CRA readiness scorecard), Cycode. SBOM-first, developer-tool DNA;
   no conformity file, no role model, no statutory text.
3. **CRA-boutique SaaS/content** — cyberresilienceact.eu (free tools +
   full text = SEO magnet), Regulus, craevidence.com, GetReady,
   Regara. Prove demand and the content-marketing pattern; thin
   products.

**White space we already occupy in-product:** (a) statute-verbatim,
as-amended, CI-guarded texts as the working spine; (b) an honesty
doctrine — never concluding conformity — that survives auditor
scrutiny; (c) role-polymorphic files beyond the manufacturer
(importer/distributor verification gates, authorised rep, steward);
(d) multi-act obligations in each act's own vocabulary; (e) single-
tenant/on-prem. **White space nobody occupies:** the operator/
asset-owner supplier-evidence register (Section 1). The message
architecture should claim (a)–(e) now and (f) when it ships.

---

## 4. Specifications

### 4.1 Self-check corrections (smallest, do first)
- Fix every `10 Dec 2027`/`10 December 2027`/`10 September 2026` →
  11th, both locales; single date-constants source.
- Re-verify "zero notified bodies" and "~Q2 2027 standards" now; wrap
  all volatile claims in the dated-claims register with `asOf`.
- Operator branch: when `position=operator`, the result screen should
  lead with supplier exposure (not CE routes) and the CTA becomes
  "Review your supplier estate with us" prefilled into the demo form.
- Keep: the honest disclaimer, the classification insights, the
  S7-1500 example (good), the Art 32(2) Class-I nuance (good).

### 4.2 Home page
- Kicker: "THE EU CONFORMANCE SYSTEM OF RECORD". H1 keeps the
  operational register, e.g. "Run product conformity as an operation —
  starting with the CRA." Hero body: one sentence CRA flagship + one
  sentence multi-act truth ("…and the same record carries NIS2, RED,
  the AI Act, GDPR and the Data Act — each in the act's own words").
- Pillars → four: (1) the guided CRA journey (keep), (2) statutory
  clocks/PSIRT (keep), (3) **"The statute, verbatim"** — the wikis,
  as-amended currency, lifecycle guard, (4) **"Every hat in the value
  chain"** — role-polymorphic files incl. the operator.
- Persona grid → 7 cards matching CANONICAL_ROLES; operator card links
  to the new operator page.
- Kill or hard-shorten entrance animations on hero copy + CTAs (F6).
- Add a "What this application will never tell you" honesty strip:
  "It will never tell you you're compliant. Article 32 reserves that
  act for you (or a notified body). It shows you the state of your
  evidence against the statute's own words." This converts *because*
  it's unusual.

### 4.3 Platform/product page
- Rename modules to the shipped shell (nine destinations + auditor
  portal + trust center); keep the 8-step manufacturer journey.
- Add the Library section with real numbers (from corpus metadata, not
  hardcoded): "CRA 71 articles · NIS2 46 · AI Act 119 as amended
  2026-07-27 · …" — regenerate at build from the bundles so counts can
  never go stale (L57 applied to marketing).

### 4.4 New page: For operators & asset owners
- Problem: "From 11 September 2026 your suppliers carry reporting
  duties; from 11 December 2027 every product entering your estate
  must be CRA-conformant. Your risk is their homework."
- What works today (Section 1 truths only). What's coming (supplier
  analysis) marked plainly as roadmap — no vapor claims.
- CTA: supplier-estate review intake.

### 4.5 Public statutory wikis as lead magnets (SEO)
- The pattern is proven (cyberresilienceact.eu ranks on free full-text
  tools). We have a *better* asset: as-amended, corrigenda-applied,
  CI-verified texts with readable wikis for seven EU acts + NL/DE.
- Option A (fast): open the conformity Library routes read-only,
  unauthenticated, behind the marketing nav ("Read the law").
- Option B (SEO-max): render each article as a static, crawlable page
  with per-article URLs and JSON-LD (`Legislation` schema). Bigger
  build; do after A proves engagement.
- Each wiki page carries one contextual CTA into the check/demo.

### 4.6 Ops
- Dated-claims register + monthly review habit (piggyback the weekly
  lifecycle LaunchAgent's log review).
- Native-Dutch review of nl strings is still flagged "machine-assisted"
  in code comments — schedule it before any paid traffic.

## 5. Suggested implementation order

1. **20a (hours):** F1 date fixes + F6 animation fix + F5 claim
   re-verification. The funnel stops contradicting the statute.
2. **20b (a day):** Home + platform repositioning copy (4.2/4.3),
   personas to 7, honesty strip.
3. **20c (a day):** Operator page + operator branch in the check +
   pricing note (4.4, F8).
4. **20d (1–2 days):** Public wikis option A + contextual CTAs (4.5).
5. **21 (product phase, separate decision):** the operator shape —
   supplier entity, supplier-facing evidence requests (auditor-portal
   pattern), portfolio supplier analysis, operator product-file shape.
   Then, and only then, the site sells supplier analysis.
