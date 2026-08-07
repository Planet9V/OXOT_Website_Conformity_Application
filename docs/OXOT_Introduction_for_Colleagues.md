# OXOT CRA Conformance Application — Introduction

*An overview for colleagues: what it is, how to access it, and what to expect from the demo.*

---

## What OXOT does

OXOT is a statutory conformity platform for the **EU Cyber Resilience Act** (Regulation (EU) 2024/2847). It gives manufacturers, authorized representatives, and assessors a single working environment to scope products, run conformity assessments, handle vulnerabilities under Article 14, and produce the technical documentation the Regulation requires — with **NIS2, IEC 62443, the EU AI Act, and the Machinery Regulation** mapped into the same requirement catalogue, so evidence gathered once counts toward every regulation it touches.

In plain terms: instead of juggling spreadsheets, a compliance consultant's PDF checklist, and a separate binary-scanning tool, OXOT is the one place a product's CRA compliance story lives — from "is this product in scope?" through to a defensible technical file ready for a Notified Body or a customer's procurement team.

---

## How to access it

There are two parts to the application:

| | URL | Who it's for |
|---|---|---|
| **Public site** | `<your deployment URL>/` | Prospects, marketing, the 2-minute readiness check, pricing |
| **Conformity workbench** | `<your deployment URL>/conformity/` | The actual product — where assessments, evidence, and reports live |

*(Fill in your deployment's actual domain — Railway production URL or your organization's custom domain — wherever you see `<your deployment URL>` above.)*

The public site is **bilingual** — English and Dutch, with an EN | NL toggle in the header. The workbench itself is English.

### Logging into the workbench — the fastest path: the demo account

Go to `<your deployment URL>/conformity/demo`. The login form is **pre-filled** with a read-only demo account:

```
Username: oxotdemo
Password: oxot2026$
```

Just click **Sign in** — nothing to type. The demo account is scoped **read-only**: you can click through every screen, open every product, run every report, but you can't edit or delete anything, so there's no risk of disturbing the demo data for the next person who looks at it.

If you're setting up your *own* account instead (not the shared demo), an administrator adds you via the admin console (`/admin`) with your own username/password and a named role.

---

## What to expect in the demo

The demo workspace is seeded with a fully worked example: **NovaGuard Smart Home Hub**, a connected device with a complete assessment, an ingested SBOM, a resolved PSIRT incident with its full report chain, and generated technical documentation. It exists specifically so a new user (or a prospect) can see what "done" looks like without having to build an example from scratch.

Start at the **Portfolio** (the landing view after login) — it shows every product at a glance: compliance grade, open blockers, and how close the statutory deadline horizon is. From there:

1. **Open NovaGuard's assessment** — see the eight-step compliance journey (classification → conformity route → requirement checklist → evidence → readiness grade), with real answers and linked evidence already filled in.
2. **Check the PSIRT workbench** — the resolved incident shows the full Article 14 flow: the 24-hour early-warning clock, the 72-hour detailed notification, and the final report, each stage with the level of detail it actually needs.
3. **Open the BOM tab** — a real ingested CycloneDX SBOM, with component identities and vulnerability annotations, is the format any real product's SBOM would need to match.
4. **Generate or view a report** — executive summary, full assessment report, or the technical documentation package itself, each with citations tracing every claim back to the underlying evidence.
5. **Ask the assistant** anything — "show me an example of X" — it's indexed over both this demo material and the live workspace, in English or Dutch.

---

## Core capabilities

**Conformity workbench**
- **Products & assessments** — register a product, run it through the statutory journey: scope determination, classification (Annex III/IV), conformity route selection (Module A / B+C / H), requirement checklist, evidence, readiness grading.
- **Scoping wizard** — a guided three-step wizard (scoping questions with Article references, classification, route selection with Article 32 standards recording) that builds the requirement checklist for a new assessment.
- **Portfolio command center** — cross-product compliance rollups: grades, open blockers, statutory deadline horizon, customer fleet exposure, executive PDF export.
- **PSIRT workbench** — vulnerability intake aligned to ISO 29147/30111, supplier and CISA KEV correlation against product BOMs, and the Article 14 reporting workflow with live 24h/72h clocks and ENISA Single Reporting Platform submission forms.
- **Reports** — executive briefings, full reports, and readouts generated from frozen data snapshots, with AI-drafted narrative sections and per-section regeneration; finalizing locks the document.
- **BOM vault** — SBOM/CBOM ingestion, component findings, license and dependency views, per assessment.
- **Team directory** — named assessor accounts with organizational mandates and work assignment.
- **Reference library** — the cross-regulation requirement catalogue (CRA, NIS2, AI Act, IEC 62443, Machinery, RED, GDPR, CER), theme coverage views, cross-regulation mappings, and the primary-source document library.

**Public site**
- Home, pricing (three tiers — Essential / Professional / Enterprise, metered on products under management), deployment options, resources (spec sheet, sales sheet, CRA primer), and a free **2-minute CRA readiness check** — an indicative classification, route to CE marking, and gap list, grounded in the Regulation, not a sales pitch.
- A gated **Knowledge Hub** for members: article-by-article CRA guidance, templates & worked examples, and workbench how-to guides.
- Now fully bilingual (English/Dutch) end to end, including the readiness check questionnaire.

---

## What differentiates OXOT

The compliance-tooling market splits into two camps that don't talk to each other:

- **Binary/firmware scanners** (Cybellum, Finite State, and similar) go deep on SBOM extraction and CVE detection, but stop there — no EU Declaration of Conformity, no Annex VII technical file, no Notified Body audit workflow.
- **IT/cloud GRC platforms** (Vanta, Drata, and similar) automate SOC 2/ISO 27001 evidence collection well, but have no concept of embedded hardware or software products at all — they can't ingest an SBOM, and they have no notion of a CRA Article 14 24-hour reporting clock.

OXOT is built specifically for the gap between those two: **one platform that carries a product with digital elements from binary-level evidence (SBOM, vulnerability correlation) all the way through to the statutory paperwork (Declaration of Conformity, CE marking, Notified Body packages)** — because for a CRA-regulated manufacturer, that's one continuous problem, not two separate tools' worth.

Other things worth knowing when this comes up in conversation:
- **Single-tenant, always.** Every deployment runs its own database — evidence is never pooled or shared across customers, and there's a self-hosted / on-premise option with a local AI model for organizations that need their evidence to never leave their own infrastructure.
- **Live regulatory intelligence.** The public site's news feed and the reference library update from real sources (ENISA, the European Commission, CISA) rather than being a static PDF that goes stale.
- **Statutory clocks that actually run.** The Article 14 24-hour/72-hour deadlines aren't a checklist item — they're a live countdown tied to the incident, with the correct downstream deadline (14 days after a fix, or one month after notification, depending on the incident type) computed automatically.

---

*Questions or access issues: contact the OXOT team, or ask the in-app assistant — it's aware of both this documentation and the live workspace.*
