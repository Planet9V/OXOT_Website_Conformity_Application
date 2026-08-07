# OXOT Design System — Conformity vs. Public Site Comparison

Companion to [design-system-styleguide.md](design-system-styleguide.md). Every value here is sourced directly from `artifacts/conformity/src` and `artifacts/oxot-web/src` — file:line citations available in the session transcript that produced this doc. Published as an artifact too: see the session for the interactive version with color swatches.

## The headline comparison

| | Conformity workbench | Public site (oxot-web) |
|---|---|---|
| Default theme | **Dark** (`defaultTheme='dark'`) | Dark (same default, added later) |
| Motion library | framer-motion 12.23 — 14+ files, real springs/`AnimatePresence` | framer-motion 12.23 — same version, 11→12 files |
| Global reduced-motion | **None** — per-component `useReducedMotion()` only | `<MotionConfig reducedMotion="user">` app-wide |
| Motion tokens (`--ease-brand`, `--dur-*`) | **Not defined** — only a hardcoded literal inside `.cta-lift` | Defined as real CSS custom properties + `lib/motion.ts` |
| Glassmorphism | Two families: token-based (`bg-card/80`) + legacy raw slate/cyan | One token-based `.oxot-glass` utility, unused so far |
| Shadow system | Full 8-step Tailwind v4 `--shadow-*` scale, warm-tinted, two-layer | `--shadow-e1/e2/e3` named tokens only (narrower) |
| Heading scale | Consistent per-context conventions | Was 25+ files each choosing its own size — now getting a shared `.oxot-h1-4` scale (Phase 1 only) |
| App shell | Flex-column, sticky top header (**not** a sidebar) | Same header pattern, simpler nav |
| Distinctive chrome | Floating AI assistant, ⌘K palette, readiness-ring SVG gauge, guided tour | None — marketing funnel only |

**Why conformity reads as "more professional":** not one thing — the accumulation of a fuller shadow system (warm-tinted, two-layer, theme-aware), a restrained heading scale used consistently per content-type, a token-based translucent card recipe repeated 10+ times verbatim, and purposeful motion (data-viz gauges, staged reveals) rather than motion for its own sake.

## Full source stylesheet

The complete, byte-exact `index.css` from the conformity app is reproduced and annotated in the session transcript — copy it wholesale into a new project's CSS entry point. Key sections: `@theme inline` token mapping, `:root`/`.dark` HSL values, the two-layer shadow scale, `.oxot-kicker`/`.cta-lift` utilities.

## Exact dependency manifest

```json
{
  "tailwindcss": "^4.1.14",
  "framer-motion": "^12.23.24",
  "tw-animate-css": "^1.4.0",
  "lucide-react": "^0.545.0",
  "@tailwindcss/typography": "^0.5.15",
  "cmdk": "^1.1.1",
  "recharts": "^2.15.2",
  "driver.js": "^1.7.0",
  "vaul": "^1.1.2",
  "sonner": "^2.0.7",
  "embla-carousel-react": "...",
  "react-hook-form": "...", "zod": "...",
  "react-markdown": "...", "remark-gfm": "..."
}
```

`components.json`: `"style": "new-york"`, `"baseColor": "neutral"`, `"cssVariables": true`. 47 components in `components/ui/`, plus two custom additions: `oxot-wordmark.tsx` and `kbd.tsx`.

## Five distinctive devices worth deliberately reusing

1. **Split-screen auth gate** — fixed navy panel, CSS grid-line background masked with a radial gradient, orange radial glow blob, serif hero headline.
2. **Wordmark lockup** — `O` + orange-`X` + `OT` at `tracking-[0.28em]`, rendered as real text, not an image.
3. **Readiness-ring gauge** — bespoke SVG circular progress, grade-letter→color mapping, animated stroke sweep.
4. **Floating AI assistant** — persistent bottom-right chat widget, gradient launcher pill, glass panel.
5. **⌘K command palette** via `cmdk`, with a real `Kbd` chip component.

## Quick-start checklist for a new application

1. Copy the color/shadow/radius token block into `:root`/`.dark`.
2. Load the three fonts; apply `font-display` to headings.
3. Install the exact dependency versions; run `shadcn` init with the config above.
4. Use the token-based glass recipe for translucent surfaces — skip the legacy raw-slate one unless deliberately building a dark ops aesthetic.
5. Add `<MotionConfig reducedMotion="user">` at the app root from day one — conformity itself lacks this; don't repeat the gap.
6. Build the flex-column shell, not a sidebar, unless genuinely needed.
