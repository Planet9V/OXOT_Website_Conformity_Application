# Site map

Every route across the three frontends, plus how nginx maps top-level paths. Route tables are read from each app's `App.tsx`; keep this page in sync when you add a route.

## Contents
- [nginx top-level routing](#nginx-top-level-routing)
- [oxot-web — public site & CRA funnel](#oxot-web--public-site--cra-funnel)
- [conformity — the workbench](#conformity--the-workbench)
- [conformity-briefing — slides](#conformity-briefing--slides)

---

## nginx top-level routing

Both `docker/nginx.conf` (compose, listens on **:80**) and `docker/nginx.railway.conf.template` (Railway single container, listens on the injected `PORT`) route identically:

| Path prefix | Target |
|---|---|
| `/api/` | Express API — `api:8080` (compose) / `127.0.0.1:<API_PORT>` (Railway). `proxy_buffering off`, `proxy_read_timeout 300s` for SSE streaming. |
| `/conformity` | 301 → `/conformity/` |
| `/conformity-briefing` | 301 → `/conformity-briefing/` |
| `/conformity/sources/` | Static alias to the source-library files (md/txt served as text, pdf inline); real files only, else SPA fallback. |
| `/conformity/` | Conformity workbench SPA (`try_files $uri → /conformity/index.html`) |
| `/conformity-briefing/` | Briefing SPA (`→ /conformity-briefing/index.html`) |
| `/` | oxot-web SPA (`try_files $uri $uri/ /index.html`) |

`absolute_redirect off` in both. Ports: nginx `:80` (compose) or Railway `PORT`; API `:8080` (compose) or a private port on `127.0.0.1` in the Railway container.

---

## oxot-web — public site & CRA funnel

React + Vite + **wouter**. Public content routes are mounted **twice**: once at the root (English) and once nested under **`/nl`** (Dutch). Admin routes are locale-agnostic at `/admin/*`. Public routes render inside `PublicLayout`; admin routes do not.

### CRA sales funnel (static — no CMS dependency)

| Path | Page | Purpose |
|---|---|---|
| `/` | `home` | CRA-first homepage / hero. |
| `/product` | `product` | The platform: six modules + eight-step journey. |
| `/pricing` | `pricing` | Essential / Professional / Enterprise + add-ons (Request-a-quote). |
| `/deployment` | `deployment` | Single-tenant, on-prem local-AI, secure DC. |
| `/resources` | `resources` | Spec + sales sheet PDFs and reference links. |
| `/cra-check` | `cra-check` | The 2-minute CRA readiness check (wizard + gated PDF). |
| `/demo` | `demo` | The booking form — the single conversion point. |

### Conformity-platform public reference (two interchangeable prefixes)

Rendered under both `/conformity/*` and `/conformity-platform/*`:

| Path (either prefix) | Page |
|---|---|
| `/conformity` · `/conformity-platform` | `conformity-dashboard` |
| `…/regulations` · `…/regulations/:key` | `conformity-regulations` · `conformity-regulation-detail` |
| `…/requirements` · `…/requirements/:id` | `conformity-requirements` · `conformity-requirement-detail` |
| `…/themes` | `conformity-themes` |
| `…/matrix` · `…/mappings` | `conformity-mappings` |
| `…/sources` | `conformity-sources` |
| `/conformity-platform/sources/view/:filename` | `conformity-source-viewer` (inline document viewer) |

### Admin CMS (`/admin/*`, no PublicLayout)

`/admin/login`, `/admin` (dashboard), `/admin/pages`, `/admin/pages/:id` (editor), `/admin/menus`, `/admin/carousel`, `/admin/leads`, `/admin/ai`, `/admin/seo`, `/admin/analytics`, `/admin/newsletter`, `/admin/settings`, `/admin/integrations`.

### Other public pages

| Path | Page |
|---|---|
| `/frameworks` · `/frameworks/matrix` · `/frameworks/:key` | frameworks index / matrix / detail |
| `/knowledge` | knowledge hub |
| `/news` | regulatory-news corpus |
| `/compare` | competitor comparison |
| `/trust` · `/trust/:productId` | trust center |
| `/newsletter/confirm` · `/newsletter/unsubscribe` | newsletter double opt-in / unsubscribe |
| `/:slug` | catch-all **CMS-driven** page (registered last before 404) |
| *(fallback)* | `not-found` (404) |

> Every funnel / reference / other public route is also reachable under `/nl/...` via the nested Dutch router (`<Route path="/nl" nest>` in `App.tsx`). Pages render locale-specific copy via `useLocale()` and a per-page, module-level `copy = { en, nl }` object — home, product, pricing, deployment, resources, cra-check, demo, knowledge-hub, frameworks (index/matrix/detail), regulatory-news, compare, trust-center, slug-page, and not-found are all localized this way, along with the shared header/footer/newsletter/social-feed components. Terminology is governed by `docs/plans/dutch-i18n/glossary.md` (machine-assisted nl-NL, formal *u* register — flagged for native review before go-live). The EN | NL switcher lives in the header (`LocaleToggle` in `artifacts/oxot-web/src/components/layout/header.tsx`).
>
> The 3 gated Knowledge Hub member pages get their Dutch content from a separate path — `pnpm --filter @workspace/api-server run seed:customer-site` — not the main `content:export`/`seed:site` snapshot cycle (see [Support & Updates](10-support-and-updates.md)).

---

## conformity — the workbench

React + wouter, served under `/conformity/`. Split into **public front doors** (no auth) and **gated shell routes** (wrapped in `AuthGate` + `AppShell` — reaching any of these challenges for sign-in). Theme storage key `oxot-conformity-theme`.

### Public front doors (no auth)

| Path | Page | Purpose |
|---|---|---|
| `/welcome` | `welcome` | Public welcome / marketing entry. |
| `/demo` | `demo` | Public demo of the workbench. |
| `/security` | `security` | Public CVD / vulnerability-disclosure surface (CRA Annex I Part II). |
| `/auditor-portal` | `auditor-portal` | Notified-Body auditor portal (Module B/H) — token-authenticated. |
| `/onboarding` | `onboarding` | Post-signup onboarding (gated, outside the app shell). |

### Gated workbench (AuthGate + AppShell)

| Path | Page |
|---|---|
| `/` | dashboard |
| `/overview` | program overview |
| `/regulations` · `/regulations/:key` | regulations library / detail |
| `/themes` | themes |
| `/requirements` · `/requirements/:id` | requirements library / detail |
| `/mappings` | requirement↔regulation mappings |
| `/sources` · `/sources/view/:filename` | source library / inline viewer |
| `/products` · `/products/:id` | product list / detail |
| `/assessments/:id` | assessment workspace |
| `/flows` | flows / workflow view |
| `/reports` · `/reports/:id` | reports list / report workspace |
| `/psirt` · `/psirt/*` | PSIRT / vulnerability handling |
| `/product-portfolio` · `/product-portfolio/*` | portfolio management |
| `/team` | team management |
| `/profile` | user profile |
| *(fallback)* | in-workbench 404 |

---

## conformity-briefing — slides

React + wouter under `/conformity-briefing/`, routed imperatively (no static route table). Slides come from a `slides` array; each has a numeric `position`.

| Path | View | Purpose |
|---|---|---|
| `/` | `SlideViewer` | Deployed 16:9 presentation view (embeds the first slide, forwards keyboard nav). |
| `/allslides` | `AllSlides` | Every slide stacked at 1920×1080 (preview/export tooling). |
| `/slideN` (e.g. `/slide1`) | `SlideEditor` | Single slide by `position === N` (regex `^/slide(\d+)$`). |
| *any other path* | redirect → first slide | Unknown paths bounce to `/slide<first>`. |

Valid `/slideN` paths correspond one-to-one to `slides` entries — there are no hardcoded per-slide routes.
