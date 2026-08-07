# OXOT Design System — Reference Styleguide

*Based on the conformity workbench (`artifacts/conformity`) — the stronger of the two implementations in this codebase. Use this as the baseline for any new OXOT-family application.*

---

## 1. Overview

The system is warm, editorial, and quietly technical: a serif display face for headings, a Dutch-orange accent used sparingly, and a two-layer shadow treatment that reads as considered rather than default. It ships as **Tailwind CSS v4** (CSS-first configuration — no `tailwind.config.js` file) plus **shadcn/ui** in the `new-york` style.

**The app defaults to dark mode.** That's a deliberate choice, not an oversight — dark mode gives the orange accent real contrast, and it's the mode most worth designing for first.

---

## 2. Brand & Color Palette

Colors are stored as raw HSL triplets (`H S% L%`, no wrapping function) and consumed through Tailwind's `@theme inline` mapping — this lets any utility (`bg-primary`, `text-muted-foreground`, etc.) resolve to the right value automatically in both themes.

### Core palette

| Token | Light | Dark | Role |
|---|---|---|---|
| `--primary` | `28 90% 55%` | `28 90% 55%` | Dutch orange — the one accent color, same hue in both themes |
| `--primary-ink` | `28 100% 33%` | `28 100% 62%` | AA-contrast orange for *small text* — never use `--primary` itself for body-size orange text |
| `--secondary` | `215 30% 40%` | `215 30% 45%` | Steel blue — secondary actions, rarely seen |
| `--background` | `24 10% 98%` | `220 15% 6%` | Warm off-white in light; near-black slate in dark |
| `--foreground` | `220 10% 15%` | `220 10% 96%` | Body text |
| `--card` | `0 0% 100%` (pure white) | `220 15% 8%` | Surface color for cards/panels |
| `--border` | `24 10% 90%` | `220 15% 15%` | |
| `--muted` / `--muted-foreground` | `24 10% 94%` / `220 10% 40%` | `220 15% 12%` / `220 10% 65%` | Subdued backgrounds and secondary text |
| `--destructive` | `0 84% 60%` | `0 62% 45%` | Errors, delete actions |

**Rule of thumb:** the orange hue (`28`) never changes between themes — only its lightness shifts (55% primary stays constant; `primary-ink` goes from a *darker* 33% in light mode to a *brighter* 62% in dark mode, since it always needs to contrast against the opposite-direction background).

### Optional: category accent colors

If your app has multiple regulated categories, tracks, or content types that benefit from color-coding, this system defines five extra accents, harmonized to the warm base palette rather than picked arbitrarily:

| Token | Light | Dark |
|---|---|---|
| `--reg-cra` | `28 88% 48%` | `28 90% 58%` |
| `--reg-aia` | `275 55% 52%` | `275 60% 68%` |
| `--reg-machinery` | `12 78% 50%` | `12 82% 62%` |
| `--reg-iec` | `190 70% 36%` | `190 75% 50%` |
| `--reg-nis2` | `158 62% 36%` | `158 60% 50%` |

Drop these entirely if you don't need per-category coloring.

---

## 3. Typography

### Fonts

| Role | Face | Fallback |
|---|---|---|
| Body / UI (`--app-font-sans`) | **Instrument Sans** | system-ui, sans-serif |
| Headings (`--app-font-display`) | **Newsreader** (serif) | Georgia, serif |
| Code, badges, timestamps (`--app-font-mono`) | **IBM Plex Mono** | monospace |

All three load from a single Google Fonts request. Headings get `font-display` applied globally via the base layer — you don't add it per-heading, it's automatic.

### Two heading conventions — pick per context, don't mix arbitrarily

1. **Editorial serif, normal weight** — for primary page titles. Reads as calm and authoritative rather than shouty.
   `text-3xl sm:text-4xl font-serif font-normal tracking-tight`

2. **Bold display, still serif but bold weight** — for section headings *within* a page (dashboard widgets, card titles).
   `text-3xl font-display font-bold tracking-tight` (section heads) · `text-xl font-display font-bold` (card titles)

**A common mistake to avoid:** letting every page pick its own arbitrary size (`text-2xl` through `text-7xl` scattered with no logic). Decide the handful of sizes you'll actually use, and apply them by *role* (page title vs. section head vs. card title), not by whatever felt right on that one page.

### Small text conventions

- **Kicker/eyebrow label**: 12px, weight 600, uppercase, `0.18em` letter-spacing, colored `--primary-ink`.
- **Mono for anything data-like**: badges, usernames, timestamps, table column headers.

---

## 4. Spacing, Radius & Elevation

### Border radius

| Token | Value | Typical use |
|---|---|---|
| `--radius` (base) | `0.75rem` (12px) | |
| `--radius-sm` | 8px | Small controls |
| `--radius-md` | 10px | Buttons, inputs, dropdown items (most common) |
| `--radius-lg` | 12px | Standard cards |
| `--radius-xl` | 16px | "Elevated surface" cards |
| *(literal)* `rounded-3xl` | 24px | Hero/prominent cards only — used sparingly |

### Shadows — the real signature move

Every shadow (except the largest) is **two layers stacked**: a flat, barely-visible "shelf" (`0px 2px 0px 0px`, 2–3% opacity) underneath a normal soft blur. Light-mode shadows are **warm-tinted** (`hsl(28 20% 15% / …)`), not neutral black. Dark-mode shadows go further: near-opaque black, **plus an inset top highlight** that simulates a subtle bevel on the card's top edge.

**If you take away one thing from this section:** don't just use Tailwind's default `shadow-md`. Build the two-layer, theme-tinted version.

### Spacing rhythm

Card padding is consistently `p-5` or `p-6`. Header height is a fixed `h-16` (64px). Container width caps at `max-w-7xl` with padding ramp `px-4 → sm:px-6 → lg:px-8`.

---

## 5. Motion

- **Library**: `framer-motion` for real component animation, `tw-animate-css` for enter/exit on every dropdown/dialog/popover (comes free with shadcn's Radix components).
- **CTA lift**: primary buttons rise 2px on hover *and* keyboard focus, using the signature curve `cubic-bezier(0.22, 1, 0.36, 1)`. 150ms, transform + shadow only.
- **Cards lift on hover by default**: `-translate-y-1` (4px) plus a shadow escalation — base-level behavior, not opt-in.
- **Buttons**: flat 200ms transition on hover/color, `scale(0.98)` press feedback.

**The honest gap:** there is no single global reduced-motion guard in the reference implementation — handled inconsistently, component by component. Don't repeat that gap: wrap your app root in a reduced-motion config from day one.

---

## 6. Glass / Translucent Surfaces

> Translucent card background (80% opacity) + background blur + a border at reduced opacity + generous rounding + a hover state that both brightens *and* lifts the card slightly.

Built from the same color tokens as everything else (theme-safe). Use for content genuinely floating over something — not as a global card texture.

---

## 7. Components

- **Foundation**: shadcn/ui, `new-york` style, `neutral` base color, CSS-variable-driven.
- **Icons**: Lucide — 16px for nav/buttons/list rows, 14px for compact badges, 20px for feature/empty-state icons.
- **Command palette** (⌘K) if the app has enough surface area, paired with a styled keyboard-shortcut chip.
- **Status/severity color pattern**: light tint background + stronger-toned text + subtle border, reused identically across every feature needing status color.

---

## 8. Layout

Flex-column shell, not a sidebar: sticky translucent-blurred header at fixed height, flexible main area, footer, optional persistent floating assistant. Navigation's active-state indicator is a small colored underline bar, not a filled background.

---

## 9. Interactive States

- Focus rings deliberately thin (1px).
- Disabled state: 50% opacity + `pointer-events: none`.
- **Every hover effect has a keyboard-focus equivalent** — hard rule.

---

## 10. Quick-Start Checklist

1. Install Tailwind v4 + shadcn/ui (`new-york`, `neutral`, CSS variables on).
2. Set up color tokens (§2) for both themes — one accent hue, constant across themes, only lightness shifts.
3. Load the three fonts (§3), apply display face to headings globally, decide heading sizes *by role*.
4. Build the two-layer, theme-tinted shadow scale (§4).
5. Default the app to **dark mode**.
6. Add the CTA-lift utility (§5) to primary buttons; add a global reduced-motion guard from day one.
7. Reserve the glass treatment (§6) for surfaces genuinely floating over something.

---

*See also: [design-system-comparison.md](design-system-comparison.md) for the full byte-exact CSS source, exact dependency versions, and the detailed conformity-vs-public-site comparison this was derived from.*
