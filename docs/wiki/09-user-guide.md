# User guide

For the people who *use* the product rather than build it: prospective buyers on the public site, members working in the workbench, and administrators running the CMS.

## Contents
- [The public site](#the-public-site)
- [The 2-minute CRA readiness check](#the-2-minute-cra-readiness-check)
- [Booking a demo](#booking-a-demo)
- [The conformity workbench](#the-conformity-workbench)
- [The admin console](#the-admin-console)

---

## The public site

The public site is a focused funnel. Every page has one primary call to action — **Book a demo** — and one secondary hook, the free **2-minute check**.

The site is available in **English and Dutch** — use the **EN | NL** toggle in the header. Dutch URLs live under `/nl/...` (e.g. `/nl/pricing`); switching language keeps you on the equivalent page. The 2-minute check's questionnaire and the gated Knowledge Hub member guides are also available in Dutch.

| Page | What you'll find |
|---|---|
| **Home** (`/`) | What the platform is, who it's for, and the CRA statutory clock (11 Dec 2027 full application; reporting obligations enforceable from 11 Sep 2026). |
| **Platform** (`/product`) | The six modules and the eight-step compliance journey a product travels from scope to Declaration of Conformity. |
| **Pricing** (`/pricing`) | Three tiers — **Essential / Professional / Enterprise** — metered on products under management. Prices are by quote; the tier *structure* is public. Three add-ons: Surveillance, CRA Readiness Retainer, CRA Readiness Consulting. |
| **Deployment** (`/deployment`) | Single-tenant options: secure datacenter, on-premise, or on-premise with a local **island-mode AI** that keeps your evidence entirely on your instance. |
| **Resources** (`/resources`) | The spec sheet and sales sheet (PDF), plus the CRA primer, live regulatory news, knowledge hub and source library. |

The **Regulatory news** page (`/news`) is a growing corpus of CRA developments, refreshed daily.

## The 2-minute CRA readiness check

The check (`/cra-check`) gives an **indicative** CRA classification, your route to CE marking, your specific evidence gaps, and a readiness score — grounded in Regulation (EU) 2024/2847, not a sales pitch.

**How it works:**
1. Answer up to eight short questions (your role, portfolio size, where you sit in the value chain, your product's nature, market and evidence you already hold). It takes about two minutes.
2. You immediately see, **on screen**, your indicative classification (Default / Class I / Class II / Critical / Needs review / Likely out of scope), your route, your readiness score with an itemised breakdown, your gaps, and a "runway" graphic against the deadline.
3. To take the result away as a **PDF**, submit your contact details. The PDF downloads directly in your browser — it is never emailed.

The result is indicative and confirmed with you in a walkthrough — it is not a legal determination.

## Booking a demo

The demo page (`/demo`) is the single conversion point. Submit your name, work email, organisation, role and (optionally) your most pressing CRA question. A 45-minute walkthrough covers your classification, the evidence you already hold, and what a defensible **Annex VII** technical file looks like for your products. Free, no obligation.

Submissions land in the admin **Leads** list, tagged with their `source` (e.g. `demo`, `cra_selfcheck`).

## The conformity workbench

The workbench (`/conformity/`) is the gated application where compliance work happens. It requires a signed-in member account (see your administrator; local development uses `admin` / `admin`).

Once signed in, the shell gives you:

| Area | What it's for |
|---|---|
| **Dashboard / Overview** | The state of your programme at a glance. |
| **Products / Product portfolio** | Each product with digital elements as a dossier — its class, route and evidence. |
| **Assessments** | The guided per-product journey from scope to Declaration of Conformity. |
| **Regulations / Requirements / Themes / Mappings** | The reference catalogue: regulations decomposed into requirements and mapped to shared control themes. |
| **Sources** | The primary legislation and technical annexes, viewable inline. |
| **PSIRT** | Vulnerability handling: the Article 14 clocks (24h / 72h / 14d), triage, and reporting. |
| **Reports** | Conformity assessment reports (full / board / custom), generated from your record. |
| **Flows** | Workflow views across the programme. |
| **Team** | Member management. |

Public "front doors" exist outside the gate: `/conformity/welcome`, `/conformity/demo`, `/conformity/security` (the public vulnerability-disclosure surface required by CRA Annex I Part II), and `/conformity/auditor-portal` (a token-authenticated portal for a Notified Body auditor).

## The admin console

The admin console (`/admin`) manages the public site's CMS content and platform settings. Sign in at `/admin/login`.

| Section | What you manage |
|---|---|
| **Pages** | CMS pages and their sections. (Marketing funnel pages are code, not CMS — see the developer wiki.) |
| **Menus / Carousel / SEO** | Navigation, homepage carousel, SEO metadata. |
| **Leads** | Captured leads from the demo form and the readiness check, filterable and status-tracked. |
| **AI** | LLM model selection and the **regulatory-news scheduler** (enable/disable, hour, timezone, run-now). |
| **Newsletter / Analytics / Integrations** | Newsletter subscribers, site analytics, and third-party integrations (email/SMTP, LinkedIn, X, alerts). |
| **Settings** | Global site settings. |

> After editing CMS content you want to keep across rebuilds, capture it into the seed snapshot — see [How-to → edit CMS content](08-how-to.md#edit-cms-content-and-capture-it-as-a-durable-seed).
