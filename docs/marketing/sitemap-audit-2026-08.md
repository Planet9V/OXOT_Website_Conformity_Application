# Public website — sitemap audit, proposed IA, and page/copy plan (2026-08-17)

## How to read this
- **Part A** — the current sitemap, every public route, one-line description +
  a state flag.
- **Part B** — the four structural problems.
- **Part C** — the proposed sitemap (to-be IA), with options.
- **Part D** — page-by-page copy/change plan.
- **Part E** — sequencing (why content/IA before prerender).

"Public web page" = the oxot-web marketing site. The `/conformity/*` app and
`/admin/*` are out of scope except where a public route exposes app data.

---

## Part A — Current sitemap (as-is)

State key: **STRONG** (keep) · **THIN** (weak/placeholder) · **OVERLAP**
(duplicates another page's job) · **INVISIBLE** (exists but crawlers can't
see it — the site-wide SPA issue) · **UTILITY**.

### Top funnel / product
| Route | What it is | State |
|---|---|---|
| `/` | Home — repositioned "system of record"; operator + Transit + honesty bands, 4 pillars, 7 personas | STRONG · INVISIBLE |
| `/product` | The platform — modules + the 8-step journey | STRONG-ish (undersells the 9-act engine, auditor portal, trust center) · INVISIBLE |
| `/operators` | For operators & asset owners — supplier CRA management | STRONG · INVISIBLE |
| `/cra-transit` | CRA Transit — the 60-day assisted service | STRONG · INVISIBLE |
| `/pricing` | Pricing — three tiers, quote-based | STRONG · INVISIBLE |
| `/deployment` | Deployment — the 4 modes (just reconciled) | STRONG · INVISIBLE |
| `/demo` | Book a demo — lead form | UTILITY |
| `/cra-check` | The 2-minute readiness check — interactive | STRONG · INVISIBLE |

### "The regulations," presented THREE ways (the core overlap)
| Route | What it is | State |
|---|---|---|
| `/wiki`, `/wiki/<act>`, `/wiki/cra` | Reading room — 7 acts, full verbatim text | STRONG · INVISIBLE (the SEO magnet that can't be crawled) |
| `/frameworks`, `/frameworks/matrix`, `/frameworks/:key` | Frameworks — by ROLE/SECTOR (operator, product, machinery, ai, rail) → which acts apply | THIN-ish · OVERLAP · wrong keyword axis |
| `/conformity-platform/regulations` (+ requirements, themes, mappings, sources) | Public read-only browse of the live reference data | OVERLAP (a third "regulations" surface) |

### Content / SEO buckets (FOUR of them)
| Route | What it is | State |
|---|---|---|
| `/blog`, `/blogs`, `/blog/:slug` | Blog hub + posts (50 CRA guides) | STRONG content · INVISIBLE |
| `/podcast` | Podcast hub | THIN |
| `/resources` | Resources hub | OVERLAP (with blog/knowledge) |
| `/knowledge` | Knowledge hub | OVERLAP |
| `/news` | Regulatory news feed | THIN · OVERLAP |
| `/faq`, `/faqs` | CRA FAQ | STRONG for SEO · INVISIBLE |

### Trust / partner / conversion
| Route | What it is | State |
|---|---|---|
| `/trust`, `/trust/:productId` | Public trust center (per-product) | STRONG differentiator · under-linked |
| `/compare` | Competitor comparison | THIN (needs the real wedges) |
| `/partner-scope`, `/axians` | Partner scoping tool + a partner-branded variant | NICHE |
| `/security` (in app) | Public CVD / security.txt page | STRONG signal · under-linked |

### Utility
| Route | What it is |
|---|---|
| `/:slug` | CMS-driven pages (SlugPage) |
| `/newsletter/confirm`, `/newsletter/unsubscribe` | Newsletter lifecycle |
| `/nl` | Dutch home (locale) |

---

## Part B — The four structural problems

1. **The SPA invisibility (decisive, site-wide).** Every route serves crawlers
   a generic shell — no per-page content or meta in production. Proven by
   fetching `/wiki/gdpr` as Googlebot: 2.6 KB, wrong title, zero article text.
   Nothing here can rank until this is fixed. (See the ranking review doc.)

2. **"The regulations" told three ways.** `/wiki` (read the law), `/frameworks`
   (why it applies to you), and `/conformity-platform/regulations` (browse the
   data) overlap in the visitor's mind. A buyer doesn't know which to click.

3. **Content sprawl.** `/resources`, `/knowledge`, `/news`, `/blog`, `/podcast`
   are five doors to "stuff to read." Search engines and humans both prefer one
   clear hub.

4. **Undersell + wrong keyword axis.** `/product` hides the 9-act obligation
   engine, the auditor portal, and the trust center. And `/frameworks` is keyed
   on ROLE/SECTOR ("rail", "machinery") when buyers search by ACT ("CRA
   compliance software", "NIS2 tool", "Annex VII technical file").

---

## Part C — Proposed sitemap (to-be)

Design principle: **one job per page, one clear path per intent.** Three
intents: *evaluate the product* → *understand my obligation* → *read the law*.

```
PRIMARY NAV (6):  Platform ▾   Solutions ▾   Read the law   Pricing   Resources ▾   [Book a demo]

/                         Home
Platform ▾
  /product                The platform — full capability surface (rewritten; see D1)
  /deployment             Deployment — the 4 modes (done)
  /cra-transit            CRA Transit — the 60-day assisted service (done)
  /trust                  Trust center — what a finished record looks like (promote)
Solutions ▾  (by AUDIENCE and by ACT — the SEO landing layer)
  /operators              For operators & asset owners (done)
  /solutions/manufacturers   For manufacturers (NEW — the Annex VII / CE story)
  /frameworks/cra         CRA compliance software (RE-KEY frameworks to acts)
  /frameworks/nis2        NIS2 compliance
  /frameworks/ai-act      EU AI Act compliance
  /frameworks/<act>       … machinery, red, gdpr, data-act (one per modelled act)
Read the law
  /wiki                   Reading room hub
  /wiki/<act>             7 act wikis (verbatim)
Pricing
  /pricing                Pricing (done)
Resources ▾  (ONE content hub)
  /resources              Merged hub: guides + podcast + news + FAQ (absorb /knowledge, /news)
  /blog/<slug>            Guides (keep individual posts)
  /faq                    CRA FAQ (keep as its own SEO page, linked from Resources)
Conversion / utility (not in nav)
  /demo  /cra-check  /security  /compare  /partner-scope  /:slug  /nl
```

**Options where there's a real choice:**

- **O1 — Frameworks axis.** *(Recommended)* Re-key `/frameworks/:key` from
  role/sector to ACT (`/frameworks/cra`, `/nis2`, …) so each targets the exact
  search term, and fold the current role view (operator/machinery/rail) into
  the copy of the relevant act page. *Alternative:* keep both axes (act pages +
  a sector matrix) — more pages, more maintenance, only if you have SEO budget.
- **O2 — The third "regulations" surface.** *(Recommended)* Demote
  `/conformity-platform/regulations` to an in-product/demo surface (reached
  from "See it in the platform"), so the public IA has exactly two law-facing
  destinations: `/wiki` (read it) and `/frameworks/<act>` (comply with it).
  *Alternative:* keep it public but rename it "Live data explorer" and link it
  only from `/product`.
- **O3 — Content hub.** *(Recommended)* Collapse `/knowledge` + `/news` into
  `/resources` (redirect the old URLs). *Alternative:* keep `/news` if the live
  regulatory feed is a genuine draw — but link it from Resources, not the nav.
- **O4 — "Solutions" vs "Frameworks" naming.** *(Recommended)* Use **Solutions**
  as the nav label (audience + act pages live under it); keep `/frameworks/<act>`
  as the URL slug (good for SEO — "cra framework/compliance"). *Alternative:*
  rename the slug to `/solutions/<act>` for a cleaner story at the cost of
  losing the "framework" keyword.

---

## Part D — Page-by-page copy/change plan

**D1 — `/product` (rewrite: surface the real surface).** Today: modules + the
8-step journey. Add sections, each one MFS-scored high because the capability
already ships:
- *"Every act, one record"* — the 9 modelled regulations with 156
  article-cited obligations; each rendered in that act's own vocabulary. This
  is the single biggest untold story.
- *"Prove it to an auditor"* — the auditor portal (expiring notified-body
  tokens + RFI inbox) and the public trust center.
- *"The law stays current"* — the text-currency guarantee: corrigenda applied,
  consolidated versions dated, a CI lifecycle guard watching EUR-Lex.
- *"Every hat in the value chain"* — all 7 roles (add authorised rep, steward,
  integrator to the three already implied).
- Keep the 8-step journey; add a line that CRA Transit runs it for you.

**D2 — `/frameworks/<act>` (the SEO landing layer).** One page per modelled act,
built on the terms buyers actually search (from the market research): SBOM, the
13/21 essential requirements, the Annex VII technical file, 24h/72h reporting,
conformity routes. Structure per page: what the act requires (plain) → how the
platform handles it (cited) → link to that act's free wiki → the 2-minute check
→ demo CTA. These are the pages that win non-brand organic once prerendered.

**D3 — `/solutions/manufacturers` (NEW).** The mirror of `/operators`, for the
primary ICP: the full Annex VII journey, the CE-marking route, the reporting
duties. Today the manufacturer story is scattered across `/product` and the
check; it deserves one page.

**D4 — `/compare` (make it real).** Today thin. Build it on the honest wedges
from the competitive read: verbatim as-amended law, *never concludes
conformity*, single-tenant/on-prem/local-AI, operator supplier-management,
7 roles. "OXOT vs firmware-scanner / vs SBOM-tool / vs generic GRC."

**D5 — `/resources` (merge + become the hub).** Absorb `/knowledge` and
`/news`; present three rails — Guides (the 50 blog posts), Podcast, Live
regulatory news — with the FAQ and the reading room cross-linked. Redirect
`/knowledge` and `/news` here.

**D6 — `/trust` + `/security` (promote).** Both are strong trust signals that
are barely linked. Add them to the footer's "Trust" column and reference the
trust center from `/product` and `/frameworks/<act>`.

**D7 — Home (`/`) tune.** Add one line under the pillars linking the new
`/solutions/manufacturers` and the act pages, and make the hero's first
sentence carry a primary keyword ("EU Cyber Resilience Act" appears in the
`<h1>`, not only the kicker) — matters once prerendered.

**D8 — Global.** Per-page `<title>`/meta/canonical + `Legislation`/`Service`/
`Organization` JSON-LD (some exists; make it universal). Breadcrumors on
Solutions/Read-the-law. An HTML sitemap page linked in the footer.

---

## Part E — Sequencing (the answer to "1 first or 2 first?")

**Do the content + IA (Part C/D) first; add prerender last.** Reasons:
1. Prerender bakes each route's HTML at build time. Finalize the routes and
   copy first, or you re-bake.
2. Content delivers conversion value to humans/paid traffic *immediately*,
   with or without prerender.
3. Prerender delivers the organic-SEO value, but only over whatever content
   exists when it runs — so it's the closing step.

**Recommended phase order:**
- **Phase 25 — IA consolidation** (O2/O3 redirects; merge content hub; promote
  trust/security). Low effort, removes confusion. *(mostly copy + routing)*
- **Phase 26 — the Solutions/act landing layer** (D2) + `/product` rewrite (D1)
  + `/solutions/manufacturers` (D3) + `/compare` (D4). The revenue pages.
- **Phase 27 — prerender the finalized route set** (static-generate the marketing
  + wiki pages; real per-page HTML, meta, JSON-LD). The unlock that makes 25–26
  rankable. *(architecture/wiring — the one you flagged)*

So: **2 (25 + 26) → 1 (27).** Prerender is the last mile over a finished site.

---

## Sources
- Route inventory: `artifacts/oxot-web/src/App.tsx`, page files under
  `artifacts/oxot-web/src/pages/`.
- Capability census + ranking test: `docs/marketing/
  website-vs-capabilities-and-ranking-2026-08.md` (with the Googlebot proof).
- Market keywords: Mend / Cycode / Certivo / Cloudsmith CRA guides;
  SPA-SEO 2026 guides (cited in the ranking review).
