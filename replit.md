# OXOT

A bilingual (English/Dutch) marketing platform for OXOT ("Operational eXcellence in Operational Technology") — a multi-regulation compliance/consulting service (Cyber Resilience Act, EU AI Act, Machinery Regulation, IEC 62443). Public content is database-driven and localized; a simple-credential admin area provides a full no-code CMS (page editor with live preview, versioning/publish/rollback, menus, carousel, EN↔NL AI translation, an AI landing-page wizard, and LLM model configuration).

## Run & Operate

- `pnpm --filter @workspace/oxot-web run dev` — run the web app (managed workflow `artifacts/oxot-web: web`)
- `pnpm --filter @workspace/api-server run dev` — run the API server (managed workflow `artifacts/api-server: API Server`, binds `PORT`)
- `pnpm --filter @workspace/api-server run seed` — (re)seed bilingual site settings, navigation, and pages (idempotent)
- `pnpm --filter @workspace/api-server run alerts:run` — CRA incident deadline alert scan (emails via admin-configured SMTP; dedupe in `conformity_alert_state` makes re-runs safe). The dev API server also scans in-process every ~10 min; admins can trigger it from Admin → Integrations → "Run check now".
- **Production requirement (alert scheduling):** the autoscale deployment has no always-on process, so an OUTSIDE scheduler must trigger the scan every 15–60 min. The API exposes `POST /api/cron/conformity-alerts` (machine-only, not in OpenAPI) guarded by `Authorization: Bearer $CONFORMITY_ALERTS_CRON_SECRET`; it returns 503 until that secret is set (production env), 401 on a bad token, and non-200 when any send fails so the scheduler can alert. Point any external cron (cron-job.org, GitHub Actions cron, uptime monitor, or a Scheduled Deployment in a companion Replit app running `curl`) at `https://<production-domain>/api/cron/conformity-alerts`. The same trigger also runs the daily LinkedIn token expiry check (deduped in `linkedin_config`, so frequent cadence never spams). Note: this repl's single deployment slot is the autoscale web app, so a Scheduled Deployment cannot live in this repl; while the deployment visibility is **private**, an external caller additionally needs a Replit external access token. End-to-end delivery still requires SMTP configured + alerts enabled in Admin → Integrations.
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks + Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm run typecheck` — full typecheck across all packages
- Required env: `DATABASE_URL` (Postgres), `SESSION_SECRET` (admin session signing), `ADMIN_USERNAME` + `ADMIN_PASSWORD` (admin login credential), `AI_INTEGRATIONS_OPENAI_BASE_URL` + `AI_INTEGRATIONS_OPENAI_API_KEY` (chat completions via Replit proxy), `OPENROUTER_API_KEY` (embeddings)
- After publishing/editing content, rebuild the assistant's knowledge index: `POST /api/admin/content/reindex` (admin-only) or call `reindexContent()`. RAG returns no context until this has run.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Web: React + Vite + Tailwind + shadcn/ui, wouter routing, TanStack Query, Orval-generated hooks, next-themes-style light/dark, Framer Motion
- API: Express 5, pino logging, cookie-parser
- DB: PostgreSQL + Drizzle ORM (pgvector extension enabled for future RAG)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from `lib/api-spec/openapi.yaml`)

## Where things live

- **API contract (source of truth):** `lib/api-spec/openapi.yaml` → codegen emits `lib/api-client-react` (React hooks) and `lib/api-zod` (server-side validation schemas).
- **DB schema (source of truth):** `lib/db/src/schema/*` (one table per file, re-exported from `index.ts`). Tables: `siteSettings`, `pages` (also carries operational SEO columns: `ogTitle/ogDescription/ogImage/canonicalUrl/metaKeywords/noindex`), `pageSections`, `navItems`, `conversations`, `messages`, `leads`, `contentChunks` (pgvector `vector(1536)` embeddings for RAG), and the growth layer: `affiliateLinks`, `affiliateKeywords`, `linkClicks`, `pageViews`.
- **API routes:** `artifacts/api-server/src/routes/{site,pages,admin,chat,adminLeads,storage,adminSeo,adminCms,adminMedia,adminSettings,adminWizard,tracking,adminAffiliate,adminAnalytics}.ts`, mounted in `routes/index.ts` under `/api`. **Registration order matters:** `adminSeo` is mounted before `adminCms` because the CMS `GET /admin/:locale/pages` would otherwise swallow `/admin/seo/pages`.
- **Admin CMS:** `adminCms.ts` (pages CRUD, draft/publish, versions/restore, nav, EN↔NL translate) backed by `lib/cms.ts` (snapshot versioning in `page_versions`); `adminMedia.ts` (media library + carousel, PDF→PNG slides) backed by `lib/pdf.ts` (poppler `pdftoppm`) + `lib/objectStorage.ts`; `adminSettings.ts` + `lib/models.ts` (LLM model catalog/selection); `adminWizard.ts` + `lib/aiContent.ts` (AI page-draft generation + translation). Frontend admin CMS pages: `artifacts/oxot-web/src/pages/admin-{pages,page-editor,menus,carousel,ai}.tsx`; recursive section editor `components/admin/json-fields.tsx`; direct-to-storage upload helper `lib/upload.ts`.
- **AI chat + RAG:** `artifacts/api-server/src/lib/llm.ts` (chat completions), `embeddings.ts` (embeddings), `rag.ts` (`reindexContent` + `retrieveContext`). Frontend widget: `artifacts/oxot-web/src/components/chat/chat-widget.tsx` (mounted in `PublicLayout`); admin leads UI: `artifacts/oxot-web/src/pages/admin-leads.tsx`.
- **Admin auth:** `artifacts/api-server/src/lib/adminAuth.ts` (stateless signed-cookie session).
- **Seed data:** `artifacts/api-server/src/scripts/seed.ts` (bilingual content), built via `build.seed.mjs`.
- **Frontend:** `artifacts/oxot-web/src/` — `SectionRenderer` maps DB section `type` → components; `LocaleProvider`/`ThemeProvider` persist to localStorage; public routes wrapped in `PublicLayout`, admin routes in a separate shell.

## Architecture decisions

- **Content is DB-driven and localized.** A `page` has ordered `pageSections`; each section has a string `type` and a free-form JSON `data` blob. The frontend renders sections by type. This keeps copy editable (future CMS) while the frontend owns presentation.
- **Locale is a path segment, not a query param** (`/api/site/:locale/...`). Reason: Orval emits colliding `*Params` types when an operation mixes path + query params; keeping locale in the path avoids the collision.
- **Admin auth is a single credential + stateless signed cookie** (HMAC over SESSION_SECRET), per the user's request for simple backend protection — no Clerk/Replit Auth.
- **AI chat is grounded via pgvector RAG.** `reindexContent()` embeds published page/section text into `contentChunks`; each visitor message retrieves top-k chunks (drizzle `cosineDistance`) for the conversation's locale and injects them into a locale-aware system prompt. The assistant always replies in the visitor's language (EN/NL).
- **Chat completions use the OpenAI Replit integration proxy** (no key; billed to Replit credits), model `gpt-5.4-mini` — a gpt-5-family model, so **no `temperature`**; use `max_completion_tokens`. **Embeddings use OpenRouter directly** (`OPENROUTER_API_KEY`, `openai/text-embedding-3-small`, 1536 dims) because none of the Replit AI proxies (OpenAI/Gemini/OpenRouter) expose an embeddings endpoint.
- **Chat conversation endpoints are session-scoped.** Serial conversation ids are enumerable, so `GET/POST /api/chat/conversations/:id*` require an `X-Session-Id` header that must match the stored `conversations.sessionId` (returns 404 otherwise). The header is sent as a raw fetch option, not declared in OpenAPI, to avoid the Orval `*Params` collision.
- **SSE streaming** (`POST /api/chat/conversations/:id/messages`): the OpenAI stream is tied to an `AbortController` bound to `req` close so client disconnects stop token consumption; partial replies are still persisted. The response is not a generated hook — the client reads it with `fetch` + `ReadableStream`.

## Product

Bilingual public marketing site (long-form, DB-driven landing page + Services/Approach/About/Contact), EN/NL switcher, light/dark mode, a site-wide AI assistant chat widget (RAG-grounded, streaming, EN/NL, with inline lead capture), and a password-protected admin shell. Live admin modules: Leads (search + transcripts), the full CMS, AI model config, **Affiliate & SEO** (partner-link CRUD, AI-assisted link insertion into page drafts, per-page OG/canonical/keywords/noindex), and **Analytics** (first-party page-view + affiliate-click dashboard with AI content/placement recommendations). Newsletter/social remains a placeholder for a later task.

The **OXOT Conformity** workbench (`/conformity`) additionally ships an **executive reporting suite**: briefing/full/readout reports for board or regulator audiences, per assessment or portfolio-wide, generated from a frozen data snapshot with a numbered citation registry — deterministic KPI/chart/annex sections pre-rendered server-side, AI-drafted prose sections that are editable and regenerable while in draft, finalize-to-lock, and print-ready HTML export. Reports live under `/conformity/reports` plus a Reports tab on each assessment.

## User preferences

- Visual: minimalist, modern, subtle; whites/greys/blacks with a Dutch-orange accent + one highlight color; standard shadcn/ui components (not hand-rolled); varied layouts (alternating two-column, modern tables); dark + light mode. No emojis in the UI.
- Admin access: simple username/password credential (not third-party auth).
- All third-party credentials (LinkedIn, X, email/SMTP, and any similar integration secrets) are configured by the **admin user** through the admin console Settings page at runtime — the agent must NOT set them up, hardcode them, or move them to env/Secrets. Build simple, self-serve in-app configuration flows for the admin instead.

## Gotchas

- After any change to `lib/api-spec/openapi.yaml`, run `pnpm --filter @workspace/api-spec run codegen`. Do not mix path + query params on one operation (Orval `*Params` collision, TS2308).
- After adding/changing DB schema files, run `pnpm -w run typecheck:libs` before typechecking the API server (project references need rebuilding), then `pnpm --filter @workspace/db run push`.
- The seed script cannot use the pino logger (worker-transport breaks when bundled standalone); it uses a plain stdout logger and is built by `build.seed.mjs` (which supplies the CJS `createRequire` banner).
- Server code must never `console.log` — use `req.log` in handlers or the singleton `logger`.
- SEO field ownership is split: `seoTitle`/`seoDescription` are versioned CMS content (rewritten on publish); the SEO admin only edits the operational fields (`og*`, `canonicalUrl`, `metaKeywords`, `noindex`). Never write the versioned pair from the SEO admin path or publish will revert it.
- Affiliate clicks route through the public redirect `GET /api/go/:id` (deliberately not in OpenAPI); it reads `Referer` for attribution, so inline tracker links must use `rel="sponsored nofollow"` (never `noreferrer`). Affiliate `targetUrl` is validated as absolute http/https at write time.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
