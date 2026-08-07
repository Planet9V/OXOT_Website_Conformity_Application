# Findings — Framer Motion on the 7 Funnel Pages

## Goal context
Design audit (this session) graded motion **D**: Framer Motion is installed and used in 11 files, but zero of them are the 7 static funnel pages (home, product, pricing, deployment, resources, cra-check, demo) that a first-time visitor actually sees. Task: bring the *existing* animation pattern to those 7 pages — not invent a new one, not add a new dependency.

## The existing pattern (source of truth — reuse exactly, don't reinvent)

Two established shapes, both already in the codebase and already shipped:

**1. Above-the-fold entrance (hero-style)** — `components/sections/hero-section.tsx`:
```tsx
<motion.h1
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.1 }}
  className="...">
  {title}
</motion.h1>
```
Uses `initial`/`animate` (fires immediately on mount, not scroll-gated) with staggered `delay` per element (0, 0.1, 0.2, 0.3...).

**2. Scroll-triggered reveal (grid/list items)** — `components/sections/feature-grid-section.tsx`:
```tsx
<motion.div
  key={i}
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5, delay: i * 0.1 }}
  className="...">
  {/* card content, unchanged */}
</motion.div>
```
`viewport={{ once: true }}` is critical — it means the reveal fires once and never re-triggers on scroll-back-up. This is standard across every existing usage; **must be preserved** in new usage too — no infinitely-repeating scroll animations.

Also seen: `whileInView={{ opacity: 1, scale: 1 }}` (quote-section.tsx), `whileInView={{ opacity: 1, x: 0 }}` (two-column-section.tsx) — same shape, different offset axis depending on the content's visual entrance direction.

## Real gap found in the existing pattern (not caused by this task, but relevant)
`grep -rn "prefers-reduced-motion\|useReducedMotion" src` → **zero matches, anywhere**, including in the 11 files already using Framer Motion. This is a pre-existing accessibility gap. Framer Motion has a one-line, app-root-level fix: wrapping the app in `<MotionConfig reducedMotion="user">` makes *every* `motion.*` component (existing 11 files + the new 7) automatically respect the OS `prefers-reduced-motion` setting, with zero per-component changes. This directly serves this session's earlier a11y remediation work. **Flagging as a proposed companion step — needs explicit sign-off since it touches App.tsx, not purely additive to the 7 target pages.**

## Risk inventory — where NOT to touch

- **`cra-check.tsx`** renders `<CraSelfCheck copy={...} locale={locale} initialAnswers={...} openOnCategory={...} />` — a complex stateful multi-step wizard (`components/cra-check/self-check.tsx`) with its own internal step/answer state and its own transitions. **Do not touch that component at all.** Only the page-level chrome around it (PageHeader, intro paragraph, final CTA card) is in scope.
- **`demo.tsx`** has a real controlled form: `name`/`email`/`company`/`role`/`blocker` inputs, a honeypot field, `useState`, a submit handler calling `/api/lead`, success/error UI states. Motion wrapping must stay on the *container* (the card/section), never on individual `<input>`/`<textarea>` elements themselves, and must never introduce a `key` that changes across re-renders (would remount the input, dropping focus/typed text mid-entry).
- **Every page's `copy = { en, nl }` object and `t.*` interpolation** (this session's Dutch i18n work) must be left completely alone — motion wrapping only changes the JSX element type (`div`/`section` → `motion.div`/`motion.section`) and adds animation props; it never touches what text/data is rendered inside.
- **Every existing `key` prop in `.map()` calls** must be preserved exactly as-is — React reconciliation depends on them; motion props get added alongside, not instead of.
- **Icon arrays indexed by position** (e.g. `PILLAR_ICONS` in home.tsx, established this session) must stay wired to the same index — don't restructure the data shape while adding motion.

## Bundle-size / dependency impact
None. `framer-motion` is already a `package.json` dependency and already shipped in the client bundle (used by 11 other files). Adding usage to 7 more files adds zero new install weight — this is a pure code change.

## Styleguide vs. reality (found while scoping the styleguide-update request)
`artifacts/source_material/OXOTSTYLEGUIDE.md` §6 documents a full motion system — shared easing curve `EASE = [0.22, 1, 0.36, 1]`, timing tokens `--dur-1/2/3` (150/250/400ms), 16-effect catalogue. **None of it exists in code** — verified by grep, zero matches for the tokens/curve/constant anywhere. The 11 already-shipped motion files all use plain `duration: 0.5`, default easing, which doesn't match the doc's stated 200–250ms/600ms rule either. Separately, glassmorphism exists in 3 gated/admin files only (`conformity-dashboard.tsx`, `trust-center-page.tsx`, `admin-login.tsx`), using raw off-token Tailwind literals (`bg-slate-900/80`, `bg-[#030712]`), not the shared `--card`/`--border` tokens — none of it on the public funnel. Full reconciliation prompt: `docs/plans/motion-and-glass-styleguide/prompt.md`.

## Verification method (established this whole session — reuse it)
Docker is the only real build (`docker compose build web`), Chrome is the only real browser check. No local `vite build` (native module pinned to `linux-x64`). Verify: (a) build succeeds, (b) page renders in Chrome — both `/` and `/nl/` locale, both light and dark mode (dark is the *actual* default per `App.tsx`'s `defaultTheme="dark"`, confirmed in the design audit), (c) all existing interactive elements still work (forms submit, wizard advances, CTAs navigate) — not just "does it look animated."
