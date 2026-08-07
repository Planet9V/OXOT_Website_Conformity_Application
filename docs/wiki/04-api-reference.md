# API reference

Every HTTP endpoint on the Express API. All routes are mounted under the global **`/api`** prefix (`app.use("/api", router)`); the `productPortfolio` router is additionally mounted at `/api/portfolio`. Source of truth: `artifacts/api-server/src/routes/`.

## Contents
- [Auth model](#auth-model)
- [Error envelope](#error-envelope)
- [Public — health, SEO, site, pages](#public--health-seo-site-pages)
- [Public — conformity reference](#public--conformity-reference)
- [Public — funnel, leads, chat, newsletter, misc](#public--funnel-leads-chat-newsletter-misc)
- [Workbench — assessments](#workbench--assessments)
- [Workbench — BOMs](#workbench--boms)
- [Workbench — flows, assistant, me, reports](#workbench--flows-assistant-me-reports)
- [Workbench — PSIRT & intelligence](#workbench--psirt--intelligence)
- [Auditor & cron (token-based)](#auditor--cron-token-based)
- [Admin](#admin)
- [Product portfolio](#product-portfolio)
- [Security notes](#security-notes)

---

## Auth model

Signed-cookie sessions (`artifacts/api-server/src/lib/adminAuth.ts`): stateless, signed, HTTP-only cookies (`sameSite: lax`, `secure` when `COOKIE_SECURE=true`). Roles: `admin`, `demo`, `member`.

- **`requireAuth`** — any valid session (admin/demo/member); re-checks a member's `active` flag each request. Gates the workbench.
- **`requireAdmin`** — admin role only. Gates the CMS/config surfaces.
- **Demo read-only guard** — several conformity routers allow GET/HEAD/OPTIONS but return **403** on writes when the session is `demo` and `DEMO_READONLY=true`. A mutation guard, not an auth gate.
- **Rate limiters** — `middlewares/rateLimit.ts` (Express middleware; newsletter, self-check, PSIRT intake) and `lib/rateLimit.ts` (in-memory class; chat/assistant).
- **Token auth** — the auditor portal uses a Notified-Body workspace access token; the alerts cron uses `Authorization: Bearer $CONFORMITY_ALERTS_CRON_SECRET`.

## Error envelope

The final middleware in `app.ts` returns a stable JSON shape `{ "error": string }`:
- **ZodError** → **400** `Invalid input — <path>: <message>; …`
- **Malformed JSON** → **400** `Invalid input — request body is not valid JSON`
- Anything else → **500** `Internal server error`

Every response carries an `X-Request-Id` header (traceable to a log line). CORS: `origin: true, credentials: true`.

---

## Public — health, SEO, site, pages

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/healthz` | Public | Liveness probe. |
| GET | `/api/seo/sitemap.xml` | Public | Sitemap of published, indexable pages. |
| GET | `/api/seo/robots.txt` | Public | robots.txt (disallows `/admin`, `/api`). |
| GET | `/api/seo/page-meta` | Public | Crawler `<head>` meta (`locale`, `slug`). |
| GET | `/api/site/:locale/settings` | Public | Site settings for a locale. |
| GET | `/api/site/:locale/navigation` | Public | Nav items (visibility-filtered). |
| GET | `/api/site/:locale/pages` | Public | List published pages. |
| GET | `/api/site/:locale/pages/:slug` | Public | Full page + sections + SEO. |
| GET | `/api/site/carousel` | Public | Homepage carousel. |

## Public — conformity reference

Read-only reference lookups (`conformity.ts`):

| Method | Path | Description |
|---|---|---|
| GET | `/api/conformity/summary` | Aggregate KB counts. |
| GET | `/api/conformity/regulations` · `/regulations/:key` | List / single regulation. |
| GET | `/api/conformity/themes` | List themes. |
| GET | `/api/conformity/requirements` · `/requirements/:id` | List / single requirement. |
| GET | `/api/conformity/mappings` | Requirement/theme/regulation mappings. |
| GET | `/api/conformity/sources` | Source documents/citations. |

## Public — funnel, leads, chat, newsletter, misc

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/lead` | Public + IP/email rate-limit + honeypot | Lead capture for the 2-minute check (writes one `leads` row). |
| POST | `/api/selfcheck/report` | Public + rate-limit + honeypot | Generate & stream the CRA-readiness PDF (writes nothing). |
| GET | `/api/regulatory-news` | Public | AI/cached CRA news feed (`limit`, `refresh`). |
| POST | `/api/newsletter/subscribe` | Public + rate-limit + honeypot | Subscribe (double opt-in). |
| POST | `/api/newsletter/confirm` · `/unsubscribe` | Public | Confirm / unsubscribe via token. |
| GET | `/api/newsletter/track/open/:sendId` | Public | Open-tracking pixel. |
| POST | `/api/chat/:locale/conversations` | Public + rate-limit | Start a chat. |
| GET | `/api/chat/conversations/:id` | Public | Fetch a conversation. |
| POST | `/api/chat/conversations/:id/messages` | Public + rate-limit | Post message / get reply. |
| POST | `/api/chat/conversations/:id/lead` | Public | Capture a lead from chat. |
| POST | `/api/analytics/collect` | Public | Client analytics event. |
| GET | `/api/go/:id` | Public | Tracked outbound redirect. |
| GET | `/api/storage/public-objects/*filePath` | Public | Serve a public object. |
| GET | `/api/storage/objects/*path` | Public (CMS-registered only) | Serve a protected object. |

## Workbench — assessments

`conformityAssessments.ts` (demo write-guard installed). All `requireAuth` unless noted **Public**.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/conformity/flow/:regulationKey` | requireAuth | Assessment flow definition. |
| GET | `/api/conformity/portfolio` | requireAuth | Portfolio overview. |
| GET | `/api/conformity/cra-analytics` | **Public** | CRA analytics data. |
| GET · POST | `/api/conformity/products` | requireAuth | List / create products. |
| POST | `/api/conformity/products/quick-start` | **Public** | Quick-start product. |
| GET | `/api/conformity/products/:id` · `/:id/revisions` | **Public** | Product / revision history. |
| PUT · DELETE | `/api/conformity/products/:id` | **Public** (demo-guarded) | Update / delete product. |
| GET | `/api/conformity/team` | requireAuth | Workbench team roster. |
| POST | `/api/conformity/assessments` | requireAuth | Create assessment. |
| GET · DELETE | `/api/conformity/assessments/:id` | requireAuth | Get / delete assessment. |
| GET | `/api/conformity/activity` · `/assessments/:id/activity` | requireAuth | Activity feeds. |
| PUT | `/api/conformity/assessments/:id/answers` · `/route` · `/standards` | requireAuth | Save answers / routing / standards. |
| POST | `/api/conformity/assessments/:id/instantiate` | requireAuth | Instantiate evaluations. |
| GET | `/api/conformity/assessments/:id/evaluations` | requireAuth | List evaluations. |
| PUT | `/api/conformity/evaluations/:id` | requireAuth | Update evaluation. |
| GET · POST | `/api/conformity/assessments/:id/evidence` | requireAuth | List / attach evidence. |
| GET · DELETE | `/api/conformity/evidence/:id/download` · `/evidence/:id` | requireAuth | Download / delete evidence. |
| GET | `/api/conformity/assessments/:id/artifacts` · `/annex-readiness` | requireAuth | Artifacts / annex-readiness. |
| POST | `/api/conformity/assessments/:id/artifacts/generate` | requireAuth | Generate artifact. |
| GET | `/api/conformity/artifacts/:id` | requireAuth | Single artifact. |
| POST · GET | `/api/conformity/assessments/:id/grade` · `/grades` | requireAuth | Compute / list grades. |
| GET · POST | `/api/conformity/assessments/:id/incidents` | requireAuth | List / create incidents. |
| GET | `/api/conformity/assessments/:id/incident-alert-history` | requireAuth | Incident alert history. |
| PUT · DELETE | `/api/conformity/incidents/:id` | requireAuth | Update / delete incident. |
| GET | `/api/conformity/incidents/:id/report-package` | requireAuth | Incident report package. |
| GET · POST | `/api/conformity/incidents/:id/submissions` | requireAuth | List / record regulator submissions. |

## Workbench — BOMs

`conformityBoms.ts` (demo write-guard). `requireAuth` unless noted **Public**.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/conformity/bom-catalog` | requireAuth | BOM catalog. |
| GET · POST | `/api/conformity/assessments/:id/boms` | requireAuth | List / import BOMs. |
| GET · DELETE | `/api/conformity/boms/:bomId` | requireAuth | Single / delete BOM. |
| POST | `/api/conformity/boms/:bomId/analyze` | requireAuth | Vulnerability analysis. |
| GET | `/api/conformity/boms/:bomId/export` · `/engineering` | requireAuth | Export / engineering view. |
| PATCH | `/api/conformity/boms/:bomId/checklist` | requireAuth | Update checklist. |
| GET · POST | `/api/conformity/assessments/:id/bom-notifications` | requireAuth | List / create maintainer notifications. |
| GET | `/api/conformity/assessments/:id/bom-notification-gaps` | requireAuth | Art. 13(6) notification gaps. |
| PATCH | `/api/conformity/bom-notifications/:notificationId` | requireAuth | Update notification. |
| GET | `/api/conformity/boms/:bomId/hierarchy` · `/cbom-audit` | **Public** | Component tree / crypto (PQC) audit. |
| POST | `/api/conformity/boms/compare` | **Public** (demo-guarded) | Diff two BOMs. |

## Workbench — flows, assistant, me, reports

| Method | Path | Auth | Description |
|---|---|---|---|
| GET · POST | `/api/conformity/flows` | requireAuth / **requireAdmin** | List / create flow definitions (create is admin). |
| GET | `/api/conformity/flows/:flowId` | requireAuth | Single flow. |
| PUT · DELETE | `/api/conformity/flows/:flowId` | **requireAdmin** | Update / delete flow. |
| GET · POST | `/api/conformity/assessments/:id/flow-runs` | requireAuth | List / start flow runs. |
| GET | `/api/conformity/flow-runs/:runId` | requireAuth | Single run. |
| POST | `/api/conformity/flow-runs/:runId/adopt-steps` | **requireAdmin** | Re-snapshot steps. |
| PATCH | `/api/conformity/flow-runs/:runId/steps/:stepKey` | requireAuth | Update step state. |
| POST | `/api/conformity/assessments/:id/assistant` | requireAuth + rate-limit | AI assistant (SSE) scoped to an assessment. |
| GET · PATCH | `/api/conformity/me` | requireAuth | Get / update profile. |
| POST | `/api/conformity/me/password` · `/onboarding` · `/tours` | requireAuth | Password / onboarding / tours. |
| GET · POST | `/api/conformity/reports` | requireAuth | List / create reports. |
| GET | `/api/conformity/reports/:id` | requireAuth | Single report. |
| PATCH | `/api/conformity/reports/:id/sections/:key` | requireAuth | Edit section. |
| POST | `/api/conformity/reports/:id/sections/:key/regenerate` | requireAuth | AI-regenerate section. |
| POST | `/api/conformity/reports/:id/finalize` | requireAuth | Finalize. |
| GET · DELETE | `/api/conformity/reports/:id/export` · `/reports/:id` | requireAuth | Export / delete. |

## Workbench — PSIRT & intelligence

`conformityPsirt.ts` — public CVD surface first, then authenticated. `conformityIntelligence.ts`.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/conformity/public/vulnerability-reports` | Public + rate-limit + honeypot | External CVD intake. |
| GET | `/api/conformity/public/advisories` · `/security-policy` | Public | Advisories / CVD policy. |
| GET | `/api/conformity/public/products/:id/trust-center` | Public | Product trust-center data. |
| GET · PUT | `/api/conformity/products/:id/psirt-profile` | requireAuth | Get / update PSIRT profile. |
| GET | `/api/conformity/vuln-reports` | requireAuth | Internal vuln reports. |
| PATCH | `/api/conformity/vuln-reports/:reportId` | requireAuth | Update report. |
| GET | `/api/conformity/vuln-reports/:reportId/events` | requireAuth | Report event trail. |
| GET · POST | `/api/conformity/advisories` | requireAuth | List / create advisories. |
| PATCH · DELETE | `/api/conformity/advisories/:advisoryId` | requireAuth | Update / delete advisory. |
| POST | `/api/conformity/advisories/:advisoryId/publish` | requireAuth | Publish advisory. |
| GET | `/api/conformity/intelligence/news` | requireAuth | Regulatory news + CISA KEV feed. |

## Auditor & cron (token-based)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/conformity/auditor/workspace` | Workspace access token | Read-only Notified-Body workspace. |
| POST | `/api/conformity/auditor/rfis` | Workspace access token | Submit an auditor RFI. |
| POST | `/api/cron/conformity-alerts` | Bearer cron secret | Trigger scheduled alert run (503 if secret unset). |

## Admin

All **requireAdmin** unless noted. Auth/session endpoints are public (they establish the session).

**Auth / session (`admin.ts`):** `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/session` (all public / session-reading).

**Team (`adminTeam.ts`, `requireAuth` + in-handler role checks):** `GET /api/team`, `GET·POST /api/admin/team`, `PATCH /api/admin/team/:id`.

**CMS pages & nav (`adminCms.ts`):** `GET /api/admin/:locale/pages`, `POST /api/admin/pages`, `GET·DELETE /api/admin/pages/:id`, `PUT /api/admin/pages/:id/draft`, `POST /api/admin/pages/:id/publish`, `GET /api/admin/pages/:id/versions`, `POST /api/admin/pages/:id/versions/:versionId/restore`, `POST /api/admin/pages/:id/translate`, `GET·PUT /api/admin/nav/:locale`.

**Media & carousel (`adminMedia.ts`):** `GET·POST /api/admin/media`, `DELETE /api/admin/media/:id`, `GET /api/admin/carousel`, `POST /api/admin/carousel/image`, `POST /api/admin/carousel/pdf`, `PUT /api/admin/carousel/reorder`, `PUT·DELETE /api/admin/carousel/:id`.

**Settings (`adminSettings.ts`):** `GET·PUT /api/admin/settings/llm`, `GET /api/admin/integration-settings`, `PUT /api/admin/settings/email` (+`/email/test`), `PUT /api/admin/settings/linkedin` (+`/linkedin/test`), `PUT /api/admin/settings/x` (+`/x/test`), `PUT /api/admin/settings/conformity-alerts` (+`/run`), `GET·PUT /api/admin/settings/regulatory-news` (+`/run`), `POST /api/admin/settings/llm/test-model`.

**Wizard & templates (`adminWizard.ts`):** `POST /api/admin/wizard/generate`, `GET·POST /api/admin/templates`, `DELETE /api/admin/templates/:id`.

**Leads (`adminLeads.ts`):** `GET /api/admin/leads`, `GET /api/admin/leads/:id`, `PATCH /api/admin/leads/:id`.

**SEO (`adminSeo.ts`):** `GET /api/admin/seo/pages`, `PUT /api/admin/seo/pages/:id`.

**Newsletter (`adminNewsletter.ts`):** `GET·DELETE /api/admin/newsletter/subscribers[/:id]`, `GET /api/admin/newsletter/mail-status`, `GET·POST /api/admin/newsletters`, `POST /api/admin/newsletters/generate`, `GET·PUT·DELETE /api/admin/newsletters/:id`, `POST /api/admin/newsletters/:id/schedule|unschedule|send`.

**Social (`adminSocial.ts`):** `GET /api/admin/social/status`, `POST /api/admin/social/post`, `GET /api/admin/social/posts`, `POST /api/admin/social/posts/:id/retry`, LinkedIn OAuth `…/linkedin/oauth/start|callback|redirect-uri`.

**Integrations (`adminIntegrations.ts`):** `GET /api/admin/integrations/health`, `GET /api/admin/integrations/activity`.

**Affiliate (`adminAffiliate.ts`):** `GET·POST /api/admin/affiliate/links`, `PUT·DELETE /api/admin/affiliate/links/:id`, `POST /api/admin/affiliate/suggest`, `POST /api/admin/affiliate/apply`.

**Analytics (`adminAnalytics.ts`):** `GET /api/admin/analytics/overview`, `GET /api/admin/analytics/recommendations`.

**Content indexing (`adminContent.ts`):** `GET /api/admin/content/index-status`, `POST /api/admin/content/reindex`.

**Storage upload (`storage.ts`):** `POST /api/storage/uploads/request-url` (requireAdmin).

## Product portfolio

`productPortfolio.ts`, mounted at **`/api/portfolio`**. **As written, none of these routes carry `requireAuth`/`requireAdmin`** (see [Security notes](#security-notes)).

| Method | Path | Description |
|---|---|---|
| GET | `/api/portfolio/products` | List portfolio products. |
| GET · POST · PUT · DELETE | `/api/portfolio/customers[/:id]` | CRUD customers. |
| POST | `/api/portfolio/upload-bulk` | Bulk CSV/Markdown upsert of products. |
| POST | `/api/portfolio/ai-parse-file` | AI-parse an uploaded file into product rows. |
| GET | `/api/portfolio/psirt-impact/:cveId` | Portfolio impact of a CVE. |
| GET · POST · DELETE | `/api/portfolio/products/:id/documents` · `/documents/:docId` | Product document CRUD (writes to local `uploads/`). |
| GET | `/api/portfolio/documents/:docId/download` | Download a product document. |

## Security notes

Surfaced by the endpoint audit (informational — these are pre-existing, not introduced by recent work; confirm intent with the team):

- **Unauthenticated conformity routes.** Several `/api/conformity/*` routes have **no `requireAuth`**: `GET /cra-analytics`, `POST /products/quick-start`, `GET /products/:id`(+`/revisions`), `PUT`/`DELETE /products/:id`, `POST /boms/compare`, `GET /boms/:bomId/hierarchy`, `GET /boms/:bomId/cbom-audit`. Writes are still subject to the demo read-only guard, but not to authentication.
- **The entire `productPortfolio` router (`/api/portfolio/*`) is unauthenticated** as mounted — including bulk upload and customer CRUD. Worth flagging if that surface is meant to be admin-only.
- The **auditor** routes authenticate by a workspace token in the request, not the cookie session — treat them as a distinct token-based surface.
