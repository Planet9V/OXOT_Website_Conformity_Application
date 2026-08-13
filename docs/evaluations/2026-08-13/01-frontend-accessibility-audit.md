# Frontend & Accessibility Audit — 2026-08-13

Evaluation of frontend UI component architecture, WCAG 2.2 accessibility compliance, keyboard navigation, dark mode styling, and design system adherence (`docs/design-system-styleguide.md`).

## Executive Summary

The application UI strictly adheres to the established design system (Dutch-orange/steel-blue color palette, dark-mode-first aesthetic, Instrument Sans / Newsreader / IBM Plex Mono typography). However, several accessibility issues exist around unlabelled icon buttons, focus ring visibility, and ARIA dialog modal semantics.

---

## Findings

**[High] Missing Accessible Names on Icon-Only Action Buttons** — [`artifacts/conformity/src/pages/onboarding.tsx:L80-L140`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/conformity/src/pages/onboarding.tsx#L80-L140), [`artifacts/conformity/src/pages/psirt.tsx:L120-L180`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/conformity/src/pages/psirt.tsx#L120-L180)
- **Evidence**: Interactive Lucide icon buttons (edit, delete, expand) lack `aria-label` or `<span class="sr-only">` fallback text.
- **Impact**: Screen reader users hear "button" without context for button function.
- **Fix**: Add explicit `aria-label="Edit requirement evidence"` to all icon buttons.

**[Medium] Inconsistent Keyboard Focus Ring Contrast** — [`artifacts/conformity/src/index.css:L40-L90`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/conformity/src/index.css#L40-L90)
- **Evidence**: Dark mode focus ring styles (`focus:outline-none`) suppress browser default focus indicators without replacing them with high-contrast custom focus outlines on all interactive cards.
- **Impact**: Violates WCAG 2.2 Success Criterion 2.4.7 (Focus Visible).
- **Fix**: Implement global focus utility style: `focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2`.

---

## What's Already Solid
- Excellent design system adherence (Dutch-orange accents, dark-mode-first contrast, responsive flex layouts).
- Clean semantic HTML structure (`<main>`, `<header>`, `<nav>`, `<aside>`).
- Fast render performance with React 19 component trees.
