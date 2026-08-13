# i18n & Content Lifecycle Audit — 2026-08-13

Evaluation of English/Dutch (EN/NL) localization routing, hreflang tags, statutory term translation fidelity, and content snapshot export/restore lifecycles.

## Executive Summary

`artifacts/oxot-web` provides a bilingual field guide system for CRA, NIS2, AI Act, and IEC 62443 regulations. The content lifecycle script exports live database content into repo-committed JSON snapshots. However, hardcoded English UI strings exist in Dutch locale routes, and hreflang meta tags are missing on dynamic CMS pages.

---

## Findings

**[High] Missing hreflang Tags on Bilingual Regulation Pages** — [`artifacts/oxot-web/src/pages/framework-detail-page.tsx:L30-L90`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/oxot-web/src/pages/framework-detail-page.tsx#L30-L90)
- **Evidence**: `framework-detail-page.tsx` renders EN and NL regulation guides without inserting `<link rel="alternate" hreflang="en" href="..." />` and `<link rel="alternate" hreflang="nl" href="..." />` tags into the document `<head>`.
- **Impact**: Search engines index EN and NL pages as duplicate content, hurting SEO rankings.
- **Fix**: Inject dynamic `<link rel="alternate" ...>` header tags via React Helmet / document head manager.

**[Medium] Hardcoded English Fallback Strings in Dutch Workbench Screens** — [`artifacts/conformity/src/pages/onboarding.tsx:L210-L280`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/conformity/src/pages/onboarding.tsx#L210-L280)
- **Evidence**: While statutory selfcheck questions exist in `cra_selfcheck_nl.json`, UI labels in wizard navigation remain hardcoded in English ("Next Step", "Route Selection").
- **Impact**: Degrades user experience for Dutch compliance officers and auditors.
- **Fix**: Wrap wizard UI labels in i18n translation hooks (`t('wizard.nextStep')`).

---

## What's Already Solid
- High translation quality for core CRA statutory articles and field guides in both English and Dutch.
- Clean content snapshot export/restore scripts (`content-export` / `content-restore`).
- Version-controlled CMS snapshot preservation prevents database overwrites on routine container restarts.
