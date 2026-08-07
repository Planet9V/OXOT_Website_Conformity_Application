# Data model

The Postgres/Drizzle schema, grouped by domain. Defined in `lib/db/src/schema/*.ts` and re-exported through `@workspace/db`. **74 tables** across ~68 files.

## Contents
- [Conventions](#conventions)
- [CMS / site](#cms--site)
- [Conformity core](#conformity-core)
- [BOM / supply chain (xBOM)](#bom--supply-chain-xbom)
- [PSIRT / incidents / advisories](#psirt--incidents--advisories)
- [Reports / analytics / flows](#reports--analytics--flows)
- [CRA enterprise / portfolio](#cra-enterprise--portfolio)
- [App settings](#app-settings)

---

## Conventions

- Every `pgTable("<name>", …)` is exported as `<camelCase>Table` (e.g. `conformity_bom_components` → `conformityBomComponentsTable`) via `lib/db/src/schema/index.ts`.
- All tables use a `serial("id")` integer primary key **except** `openrouter_models_cache` (text `id` = model slug).
- Most foreign keys use `onDelete: "cascade"`. Audit/event rows deliberately keep a **nullable FK** so they survive parent deletion: `conformity_activity.assessmentId`, `conformity_alert_state.incidentId`, `conformity_bom_findings.componentId`, `conformity_advisories.{productId,vulnReportId,incidentId}`, `conformity_reports.assessmentId`, `conformity_vuln_reports.productId`, `leads.conversationId`.
- Two tables carry **pgvector** embeddings: `content_chunks` and `conformity_embeddings` (`vector("embedding", { dimensions })`).
- The `cra_*` portfolio tables reference each other by plain integer id columns (logical relationships, **not** FK-enforced).

---

## CMS / site

| Table | Purpose | Key columns |
|---|---|---|
| `pages` | Localized CMS pages + SEO | `slug`, `locale`, `serviceKey`, `title`, SEO fields, `visibility`, `status`, `regulationKeys[]` |
| `page_sections` | Ordered content blocks of a page | `pageId`→pages, `type`, `sortOrder`, `data` jsonb |
| `page_versions` | Version snapshots of a page | `pageId`, `versionNumber`, `state`, `sections` jsonb |
| `page_templates` | Reusable layout presets | `name`, `config` jsonb |
| `page_views` | Anonymous page-view analytics | `path`, `locale`, `sessionId`, `referrer`, `device` |
| `nav_items` | Localized nav entries (legacy CMS nav) | `locale`, `label`, `href`, `placement`, `sortOrder` |
| `site_settings` | Per-locale branding/contact | `locale` (unique), `siteName`, `tagline`, `socialLinks` jsonb |
| `media_assets` | Uploaded media/file references | `kind`, `objectPath`, `fileName`, `mimeType`, `sizeBytes` |
| `carousel_slides` | Marketing carousel slides | `mediaAssetId`, `imagePath`, `captionEn/Nl`, `active`, `sortOrder` |
| `content_chunks` | Vector-embedded content for RAG/search | `pageId`, `content`, `embedding` (pgvector) |
| `conversations` / `messages` | Chat sessions and their messages | `sessionId`; `conversationId`, `role`, `content` |
| **`leads`** | Contact / lead capture | `name`, `email`, `company`, `message`, **`segment`**, **`source`**, `locale`, `status` |
| `newsletters` / `newsletter_subscribers` / `newsletter_sends` | Campaigns, double-opt-in list, per-send delivery log | `status`, `email` (unique), `confirmToken`/`unsubscribeToken` |
| `social_posts` / `integration_events` | Social-post attempts and generic integration event log | `platform`/`integration`, `success`, `error` |
| `affiliate_links` / `affiliate_keywords` / `link_clicks` | Sponsored links, keyword triggers, click analytics | `targetUrl`, `keyword`, `path` |
| `regulatory_news_cache` | Cached AI-generated news items | `title`, `summary`, `source`, `url`, `category`, `publishedAt` |
| `openrouter_models_cache` | Cached OpenRouter model catalog | **text `id`**, `name`, `provider`, `contextLength`, `roles` jsonb |

## Conformity core

| Table | Purpose | Key columns |
|---|---|---|
| `conformity_products` | Products under assessment | `name`, `manufacturerName/Address`, `productType`, `supportPeriodStart/End` |
| `conformity_product_revisions` | Versioned releases + retention lifecycle | `productId`, `versionString`, `lifecycleState`, `technicalFileRetentionExpiry`, `isCurrentRelease` |
| `conformity_assessments` | An assessment workflow for a product | `productId`, `regulationKey`, `status`, `currentStage`, `classKey`, `routeKey` |
| `conformity_members` | Workbench users / assessors (auth) | `username` (unique), `email`, `passwordHash`, `active`, `toursSeen` jsonb |
| `conformity_answers` | Questionnaire answers | `assessmentId`, `questionKey`, `value` jsonb |
| `conformity_evidence` | Evidence attached to requirements | `assessmentId`, `requirementRefCode`, `evidenceType`, `objectPath`, `fileHash` |
| `conformity_artifacts` | Generated docs (risk assessment, EU DoC…) | `assessmentId`, `artifactType`, `status`, `content` jsonb, `version` |
| `conformity_routes` | Conformity routes per regulation | `regulationKey`, `key`, `thirdPartyRequired`, `appliesToClasses` jsonb |
| `conformity_grades` | Computed score/grade per assessment | `assessmentId`, `overallScore`, `overallGrade`, `blockerCount`, `perTheme` jsonb |
| `conformity_evaluations` | Per-requirement status/gap tracking | `assessmentId`, `requirementRefCode`, `status`, `riskRating`, `owner`, `dueDate` |
| `conformity_activity` | Audit / activity feed | `assessmentId?`, `entityType`, `action`, `actor`, `hash` |
| `conformity_themes` | Requirement grouping themes | `key` (unique), `name`, `sortOrder` |
| `regulations` | Regulation catalog (CRA, …) | `key` (unique), `name`, `jurisdiction`, `inForceDate`, `keyDates` jsonb |
| `requirements` | Individual requirements | `regulationKey`, `themeKey`, `refCode`, `obligationType`, `appliesTo` jsonb |
| `requirement_mappings` | Cross-regulation crosswalk | source/target regulation+refCode, `relationship` |
| `product_classes` | Risk-classification tiers per regulation | `regulationKey`, `key`, `riskLevel`, `defaultRouteKey` |
| `conformity_embeddings` | Vector embeddings of assessment content | `assessmentId`, `content`, `embedding` (pgvector) |
| `conformity_analytics_snapshots` | Point-in-time compliance metrics | `assessmentId`, `compliancePercentage`, `domainScores` jsonb, `snapshotDate` |
| `conformity_auditor_access` | Time-boxed auditor access tokens | `assessmentId`, `auditorEmail`, `accessToken` (unique), `expiresAt` |
| `conformity_auditor_rfis` | Auditor RFIs / non-conformities | `assessmentId`, `severity`, `status`, `manufacturerResponse` |
| `conformity_supply_chain_tree` | Multi-tier supplier lineage | `rootProductId`, `parentAssemblyId`, `childAssemblyId`, `supplierName` |

## BOM / supply chain (xBOM)

| Table | Purpose | Key columns |
|---|---|---|
| `conformity_boms` | Uploaded BOM docs (SBOM/CBOM/HBOM/…) | `assessmentId`, `bomType`, `format`, `fileHash`, `componentCount`, `findingCount` |
| `conformity_bom_components` | Components within a BOM | `bomId`, `name`, `version`, `componentType`, `purl`, `cpe`, `licenses` jsonb, `pqcReadinessScore` |
| `conformity_bom_dependencies` | Dependency-graph edges | `bomId`, `ref`, `dependsOnRef` |
| `conformity_bom_findings` | Vuln/crypto/license/policy findings | `bomId`, `componentId?`, `findingType`, `identifier` (CVE/GHSA), `severity` |
| `conformity_bom_licenses` | Per-component licenses | `bomId`, `componentId`, `license` (SPDX) |
| `conformity_bom_differentials` | Diff between two BOM versions | `baseBomId`, `targetBomId`, added/removed/upgraded counts |
| `conformity_bom_notifications` | Upstream-maintainer vuln notifications (Art. 13(6)) | `assessmentId`, `componentKey`, `vulnerabilityId`, `status`, `dueAt` |
| `conformity_eng_items` / `conformity_eng_attributes` / `conformity_eng_connections` | Engineering-BOM items, typed attributes, and connections (industrial/plant) | `bomId`, `itemRef`, `tagName`; `name`/`value`/`units`; `fromRef`/`toRef` |
| `conformity_cryptographic_assets` | CBOM crypto assets | `componentId`, `algorithmName`, `keySizeBits`, `isDeprecated`, `isPqcReady` |
| `conformity_data_assets` | Data assets tied to a component (privacy) | `componentId`, `classificationLevel`, `isEncryptedAtRest/InTransit`, `containsPii` |
| `conformity_saas_assets` | SaaSBOM external endpoints | `componentId`, `endpointUrl`, `cloudProvider`, `dataResidencyJurisdiction` |
| `conformity_ai_models` | AIBOM model assets (EU AI Act) | `componentId`, `modelName`, `parameterCount`, `aiActRiskCategory` |

## PSIRT / incidents / advisories

| Table | Purpose | Key columns |
|---|---|---|
| `conformity_incidents` | CRA incidents with statutory clocks | `assessmentId`, `severity`, `earlyWarningDueAt/DoneAt`, `notificationDueAt/DoneAt`, `finalReportDueAt/DoneAt`, `status` |
| `conformity_incident_submissions` | Official report submissions (ENISA SRP) | `incidentId`, `stage`, `submittedAt`, `reference`, `supersedes` |
| `conformity_vuln_reports` | Inbound vulnerability reports (CVD intake) | `productId`, `reporterEmail`, `assessedSeverity`, `status`, `disclosureDueAt` |
| `conformity_vuln_report_events` | Status-transition history | `reportId`, `fromStatus`, `toStatus`, `actor` |
| `conformity_advisories` | Published security advisories | `advisoryCode` (unique), `severity`, `vulnerabilityId`, `fixedVersions`, `status`, `publishedAt` |
| `conformity_psirt_profiles` | Per-product PSIRT contact/policy | `productId`, `contactEmail`, `policyUrl`, `disclosureDays` |
| `conformity_alert_state` | Dedupe store for alert emails | `alertKey` (unique), `incidentId?`, `delivered` |

## Reports / analytics / flows

| Table | Purpose | Key columns |
|---|---|---|
| `conformity_reports` | Generated compliance reports | `scope`, `assessmentId`, `reportType`, `audience`, `sections` jsonb, `status` |
| `conformity_flows` | Reusable workflow/checklist templates | `key` (unique), `steps` jsonb, `isTemplate` |
| `conformity_flow_runs` | Instantiated workflow runs | `flowId`, `assessmentId`, `status`, `stepStates` jsonb |

(`conformity_analytics_snapshots`, listed under Conformity core, backs the analytics dashboards.)

## CRA enterprise / portfolio

Defined in the `productPortfolio` schema; related by logical integer ids (no FK constraints).

| Table | Purpose | Key columns |
|---|---|---|
| `cra_portfolio_products` | Marketed CRA product catalog | `sku`, `name`, `craClass`, `currentStatus`, `hasActivePsirtIncident`, `activeIncidentCve` |
| `cra_product_releases` | Releases + CRA re-eval dates | `productId`, `version`, `craReevaluationDate`, `isLatest` |
| `cra_enterprise_customers` | Enterprise customer accounts | `orgName`, `contactEmail`, `region`, `cisaSector` |
| `cra_customer_deployments` | Which releases a customer runs | `customerId`, `productId`, `releaseId`, `deployedVersion`, `isOutdatedVersion` |
| `cra_product_documents` | Product document library | `productId`, `docCategory`, `originalFileName`, `sha256Hash`, `storagePath` |

## App settings

| Table | Purpose | Key columns |
|---|---|---|
| `app_settings` | Singleton admin configuration (id = 1) | Six typed jsonb config blocks: `llmConfig`, `emailConfig` (SMTP + alert email), `linkedinConfig` (OAuth), `xConfig` (X/Twitter keys), `conformityAlertsConfig`, `regulatoryNewsConfig` |

> `app_settings` holds secrets (SMTP password, OAuth access tokens, X API secrets); the schema comments flag these as **never returned to the client** — the API masks them. Non-secret model IDs and preferences live alongside them.
