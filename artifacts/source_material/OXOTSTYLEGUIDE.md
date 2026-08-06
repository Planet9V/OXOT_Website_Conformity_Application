# OXOT Universal Styleguide

**One document, one design system.** Everything below is extracted from the live OXOT site — `src/app/globals.css`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/components/site-nav-client.tsx`, `src/components/site-footer.tsx` and the production navigation menu. No value here is invented or approximated. Where a number looks arbitrary, the reason it is that number is given.

Use this to build any other OXOT web property so it reads as the same company.

---

## 0. The one rule that makes the rest work

**Never hard-code a colour.** Every surface, text colour and border comes from a CSS custom property. That is the only reason light and dark both work without a second stylesheet, and it is the only reason a new site can inherit the brand by copying ~60 lines.

```css
/* WRONG — invisible in dark mode, and nobody will notice until a customer does */
.card { background: #ffffff; color: #0E1B2A; border: 1px solid #D9DFE8; }

/* RIGHT — correct in both themes, forever */
.card { background: hsl(var(--card)); color: hsl(var(--card-foreground)); border: 1px solid hsl(var(--border)); }
```

Tokens are stored **unwrapped** (`212 51% 11%`, not `hsl(212 51% 11%)`) so they compose with alpha:

```css
color: hsl(var(--foreground) / 0.86);   /* body text at 86% — used by article prose */
background: hsl(var(--primary) / 0.15); /* the active language pill */
```

---

## 1. Brand mark

The wordmark is **typeset, not an image**. There is no logo file to manage, it stays crisp at any size, it inherits the current theme, and it is selectable text for accessibility and SEO.

```html
<a href="/" aria-label="OXOT — home"
   class="select-none text-[15px] font-semibold tracking-[0.28em] text-foreground no-underline">
  O<span class="text-primary">X</span>OT
</a>
```

| property | header | footer | why |
|---|---|---|---|
| size | `15px` | `18px` (`text-lg`) | the footer mark anchors a column, so it carries more weight |
| weight | `600` (semibold) | `600` | |
| letter-spacing | `0.28em` | `0.30em` | wide tracking is the mark's signature — it reads as a monogram, not a word |
| colour | `--foreground` | `--foreground` | inherits the theme; never fixed |
| the **X** | `--primary` | `--primary` | the single orange accent in the mark |
| typeface | `--font-sans` (Instrument Sans) | same | **not** the serif |

**Non-negotiables**

- The **X is always orange**, in both themes. It is the only coloured glyph.
- Never letter-space below `0.24em` — it stops reading as the mark.
- Never render it in the serif. The mark is sans; headlines are serif.
- Always wrap it in a link to the site root with `aria-label="OXOT — home"`. On the OXOT site this is verified by clicking it, not by reading the markup.
- The mark is never italic, never bold beyond 600, never in a box.

**Tagline** — `Operational eXcellence in Operational Technology` (NL: `Operationele eXcellentie in operationele technologie`). Note the capital **X** mirroring the mark. Set in the **serif** at `14px`, weight 500. It appears under the footer mark and in the bottom bar.

---

## 2. Colour

### 2.1 The palette in one sentence

Deep navy structure, warm paper, a single orange accent, steel-blue for everything in between — **one accent colour only.** If a second accent ever appears, it is a bug.

### 2.2 Every token, both themes

| token | light HSL | light hex | dark HSL | dark hex |
|---|---|---|---|---|
| `--background` | `60 33% 98%` | `#FCFCF8` | `210 50% 12%` | `#0F1F2E` |
| `--foreground` | `212 51% 11%` | `#0E1B2A` | `220 20% 92%` | `#E7E9EF` |
| `--card` | `0 0% 100%` | `#FFFFFF` | `210 44% 15%` | `#152637` |
| `--primary` | `28 100% 47%` | `#F07000` | `28 100% 53%` | `#FF7F0F` |
| `--primary-ink` | `28 100% 33%` | `#A84F00` | `28 100% 62%` | `#FF983D` |
| `--primary-foreground` | `0 0% 100%` | `#FFFFFF` | `210 50% 10%` | `#0D1926` |
| `--on-accent` | `212 51% 11%` | `#0E1B2A` | `212 51% 11%` | `#0E1B2A` |
| `--secondary` | `210 30% 95%` | `#EEF2F6` | `210 34% 19%` | `#203041` |
| `--muted` | `210 30% 94%` | `#EBF0F4` | `210 34% 18%` | `#1E2E3E` |
| `--muted-foreground` | `212 20% 38%` | `#4E6074` | `214 18% 68%` | `#9FABBC` |
| `--accent` | `210 30% 93%` | `#E8EDF3` | `210 34% 22%` | `#25384B` |
| `--destructive` | `0 72% 48%` | `#D32222` | `0 80% 70%` | `#F07575` |
| `--border` | `214 25% 88%` | `#D9DFE8` | `210 30% 24%` | `#2B3D50` |
| `--input` | `214 25% 84%` | `#CCD5E0` | `210 30% 26%` | `#2E4256` |
| `--ring` | `28 100% 47%` | `#F07000` | `28 100% 53%` | `#FF7F0F` |

Radius is a token too: `--radius: 0.75rem` (12px).

### 2.3 The four token pairs people get wrong

**`--primary` vs `--primary-ink`.** Brand orange `#F07000` measures only about **3.0:1** on the light surfaces — below the 4.5:1 AA bar for text under 24px. So there are two oranges:

- `--primary` — fills, borders, icons, large display type, the X in the wordmark. Anything where contrast is not a text-legibility question.
- `--primary-ink` — **small text only** (≤13px, and any body-size link). `#A84F00` reaches ~5.4:1 on white. In dark mode it goes the other way (`#FF983D`, lighter) because the surface is navy.

If you are colouring text under 24px orange, you want `--primary-ink`. Every time.

**`--primary-foreground` vs `--on-accent`.** Both mean "text on top of orange", and they differ:

- `--primary-foreground` flips with the theme (white on light, near-black on dark). It is what the `Button` component uses.
- `--on-accent` is **the same dark ink in both themes** (`#0E1B2A`), because dark ink is what actually reads on orange regardless of the surrounding theme. Use it for orange chips, badges and the skip link.

**`--muted` vs `--secondary` vs `--accent`.** Three near-identical greys with distinct jobs:

- `--muted` — passive surfaces (code, table headers, skeletons) and, via `--muted-foreground`, all secondary text.
- `--secondary` — a filled but non-primary button.
- `--accent` — **hover only**. The background a nav item or menu row takes on hover. If nothing is hovering, nothing should be `--accent`.

**`--border` vs `--input`.** `--input` is deliberately two steps darker so form fields read as interactive against static dividers.

### 2.4 Fixed-palette exceptions

Two things are hard-coded navy in **both** themes, on purpose:

- **`.oxot-diagram`** — `#102030` with `#2a3b52` borders. Inline SVG figures draw light strokes; on a paper background they would vanish. The panel is fixed so the figures always sit on navy.
- **Closing CTA bands** — deliberately dark in both themes so the final call to action holds its weight on a light page.

These are the only two. Anything else fixed-colour is a defect.

---

## 3. Typography

Three typefaces, three jobs, no overlap. All three are **self-hosted at build time** (`next/font` downloads the WOFF2 and serves it from our own origin) — the browser never contacts Google. That is a GDPR requirement for EU/NL visitors, not a performance preference.

### 3.1 The three faces

| role | face | variable | weights | used for |
|---|---|---|---|---|
| **Display** | **Newsreader** (serif) | `--font-serif` → `--font-display` | 300, 400, 500 + italics | `h1`–`h3`, the tagline, stat numbers, pull quotes |
| **UI / body** | **Instrument Sans** | `--font-sans` | 400, 500, 600 | body copy, navigation, buttons, forms, labels, the wordmark |
| **Label / data** | **IBM Plex Mono** | `--font-mono` | 400, 500, 700 | eyebrow numerals, section counters, spec-table keys, code |

**Why this pairing.** Newsreader is a low-contrast, newspaper-derived serif — it gives headlines editorial authority without the fussiness of a high-contrast display serif, and it survives at 60px and 20px alike. Instrument Sans is a humanist grotesque: neutral enough to disappear in long body copy, with enough character at 600 to hold a nav bar. The mono is doing real work, not decoration — it marks anything the reader should parse as *data* (`01`, `02`, `SCOPE`, `DURATION`), which is exactly the OXOT proposition: evidence as data, not documents.

The serif/sans split is the fastest visual signal that a page is OXOT: **a serif headline over a sans paragraph.** Get that wrong and nothing else rescues it.

### 3.2 The display scale

Headings are **fluid**, not stepped — one `clamp()` instead of a breakpoint jump:

```css
h1 { font-size: clamp(1.75rem, 1.30rem + 2.00vw, 2.5rem); }  /* 28px → 40px */
h2 { font-size: clamp(1.50rem, 1.25rem + 1.10vw, 1.875rem); } /* 24px → 30px */
```

These are deliberately restrained. An earlier scale ran H1 to 48px and H2 to 36px; it was reduced so the H1→H2 gap stays legible on mobile and long Dutch headlines do not dominate the viewport. **Dutch runs roughly 15–20% longer than English** — every size decision has to survive that.

| element | size | weight | family | notes |
|---|---|---|---|---|
| `h1` | `clamp(28px, …, 40px)` | 400 | serif | `text-wrap: balance` |
| `h2` | `clamp(24px, …, 30px)` | 400 | serif | `text-wrap: balance` |
| `h3` | `~21px` | 500 | serif | |
| body | `15–16px` | 400 | sans | line-height `1.6–1.66` |
| article body | `17px` (`1.0625rem`) | 400 | sans | line-height `1.78`, colour `--foreground / 0.86` |
| lede | `18px` | 400 | sans | line-height `1.66`, `--muted-foreground` |
| small / caption | `12–13px` | 400–500 | sans | `--muted-foreground` |
| eyebrow | `12px` | 600 | sans | `0.18em` tracking, uppercase, `--primary` |
| mono label | `11–13px` | 500–700 | mono | `0.05–0.14em` tracking, uppercase |

### 3.3 Line-height rule of thumb

Inverse to size. Display type sits tight (`1.04–1.2`); body opens up (`1.6–1.78`); mono labels are set solid (`1`) because they are single-line.

### 3.4 Two typographic refinements that ship globally

```css
h1, h2, h3, h4 { text-wrap: balance; }        /* no orphan word on a headline */
.article-prose p { text-wrap: pretty; }        /* even ragging in body copy */
```

Both operate on the already-translated DOM, so they work in Dutch and English without per-locale tuning. `pretty` is a progressive enhancement and falls back to `normal`.

### 3.5 The signature kicker

```css
.oxot-kicker {
  font-size: 0.75rem;      /* 12px */
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: hsl(var(--primary));
}
```

Wide-tracked orange uppercase. It appears above section headings and hero headlines and is one of the most recognisable OXOT elements. `0.18em` is the value — not `0.1em`, not `0.2em`.

---

## 4. Spacing and layout

Spacing is Tailwind's default 4px scale. The recurring rhythm:

| use | value |
|---|---|
| tight (icon↔label, chip padding) | `6–8px` |
| component internals | `12–16px` |
| between related blocks | `24–26px` |
| between sub-sections | `40–44px` |
| between major sections | `56–72px` |
| section vertical padding | `62–72px` desktop / `44px` mobile |

**Containers**

| container | max-width |
|---|---|
| reading column (articles) | `max-w-3xl` (48rem / 768px) |
| standard page + footer | `max-w-6xl` (72rem / 1152px) |
| editorial full-bleed | `1280px` |

Horizontal page padding: `24px` mobile → `32px` at `lg`. Feature-page inner padding: `28px 14px` desktop, `12px 6px` below 820px.

**Breakpoints**: `600px` (single column), `820px` (feature-page compaction), `900px` (2-column grids collapse), `md: 768px` (nav switches to hamburger), `lg: 1024px`.

Always test at **375px** — and look at the screenshot, do not just check for horizontal overflow. Claude-Design-derived markup clips with `overflow: hidden`, which means a word can be sliced mid-syllable while every overflow measurement reports clean.

---

## 5. Elevation

Three levels, and they are **built differently per theme** — this is the detail most ports get wrong.

**Light** — warm, low-spread, layered. The shadow is tinted with the ink colour, never pure black:

```css
--elev-1: 0 1px 2px hsl(212 51% 11% / 0.04), 0 1px 1px hsl(212 51% 11% / 0.03);
--elev-2: 0 4px 12px hsl(212 51% 11% / 0.06), 0 2px 4px hsl(212 51% 11% / 0.04);
--elev-3: 0 12px 32px hsl(212 51% 11% / 0.10), 0 4px 10px hsl(212 51% 11% / 0.05);
```

**Dark** — a drop shadow on navy is nearly invisible, so depth comes from an **inset top highlight** plus ambient shadow:

```css
--elev-1: inset 0 1px 0 hsl(0 0% 100% / 0.04), 0 1px 2px hsl(0 0% 0% / 0.30);
--elev-2: inset 0 1px 0 hsl(0 0% 100% / 0.05), 0 6px 16px hsl(0 0% 0% / 0.38);
--elev-3: inset 0 1px 0 hsl(0 0% 100% / 0.06), 0 16px 40px hsl(0 0% 0% / 0.45);
```

Exposed as `shadow-e1` / `shadow-e2` / `shadow-e3`.

Usage: **e1** resting cards, buttons, the scrolled nav · **e2** hover state · **e3** dropdowns, popovers, modals.

---

## 6. Motion — the micro-animation system

Movement is what separates a professional site from a competent one, and OXOT's rule is that **motion should be felt, not watched.** Almost everything is between 150ms and 250ms.

### 6.1 The primitives

```css
--ease-out:    cubic-bezier(0.22, 1, 0.36, 1);   /* the brand curve */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
--dur-1: 150ms;   /* colour, small state changes */
--dur-2: 250ms;   /* movement, reveals, panels */
--dur-3: 400ms;   /* large or staged transitions */
```

`cubic-bezier(0.22, 1, 0.36, 1)` is exposed to Tailwind as `ease-brand` and to Framer Motion as `EASE = [0.22, 1, 0.36, 1]`. **The CSS and the JS are the same curve** — that is deliberate, and it is why a CSS hover and a Framer panel feel like the same system.

The curve overshoots toward its endpoint and decelerates hard. Things arrive quickly and settle; nothing drifts.

### 6.2 The catalogue

| # | effect | spec |
|---|---|---|
| 1 | **Nav scroll-elevation** | Past the scroll threshold the header gains `bg-background/80`, `backdrop-blur-md`, `shadow-e1`, a visible border, and tightens from `py-3` to `py-2`. Transitions `background-color, box-shadow, border-color, padding` over `250ms ease-brand`. The padding change is what makes it feel like the bar *settles*. |
| 2 | **Nav underline sweep** | An `::after` bar, `1px`, `bg-primary`, `origin-left`, scaling `scale-x-0 → scale-x-100` over `200ms ease-brand`. It grows from the left rather than fading. Active items are permanently at `scale-x-100`. |
| 3 | **Dropdown reveal** | Framer Motion, `opacity 0→1` + `y 8→0`, `200ms`, `EASE`. Closing has a **130ms grace timer** so a diagonal mouse path to a child item does not dismiss the menu. |
| 4 | **Chevron rotate** | `rotate-180` over `200ms ease-brand` when a menu opens. |
| 5 | **Dropdown row arrow** | An `ArrowRight` sits at `opacity-0 -translate-x-1`; on row hover it becomes `opacity-100 translate-x-0` and turns `--primary`, over `200ms`. Motion *and* colour, together. |
| 6 | **Button press** | `active:scale-[0.98]` — the tactile confirmation of a click. |
| 7 | **Button hover** | `shadow-e1 → shadow-e2` plus a background shift, `150ms`. |
| 8 | **`.cta-lift`** | Primary CTAs rise `translateY(-2px)` over `150ms ease-out`, mirrored on `:focus-visible` so keyboard users get the same feedback. Compositor-only. |
| 9 | **Card / cell hover** | Background lifts toward `--card` or `--accent` over `180ms`; nested arrows slide `2px`. |
| 10 | **Mobile accordion** | `height 0→auto` + `opacity`, `250ms` for the panel, `200ms` for nested lists. |
| 11 | **Overlay pop** | `@starting-style` entry — `opacity 0`, `translateY(6px) scale(0.985)` → resting, `250ms`. Interruptible; engines without `@starting-style` just show the final state. |
| 12 | **Skeleton shimmer** | A transparent→`--foreground / 0.06`→transparent gradient sweeping `translateX(-100% → 100%)`, `1.4s ease-in-out infinite`. The skeleton reserves layout so there is no CLS. |
| 13 | **Content crossfade** | `.content-fade-in` — `opacity 0→1`, `250ms ease-out`, as loaded content replaces a skeleton. |
| 14 | **Scroll reveals** | `y 12–16px` + fade over `600–650ms EASE`, once, on entry. Never on repeat scroll. |
| 15 | **Reading progress** | A `--primary` bar tracking article scroll depth. |
| 16 | **Link underline** | `text-underline-offset: 2px`, colour transitions `150ms`. |

### 6.3 The rules

- **Compositor-only.** Animate `transform` and `opacity`. Never `width`, `height`, `top` or `left` — except accordion height, where there is no alternative.
- **Colour is 150ms. Movement is 200–250ms. Reveals are 600ms.** Nothing else.
- **Hover changes must have a focus equivalent.** `.cta-lift` fires on `:focus-visible` for exactly this reason.
- **Anything auto-updating for more than 5 seconds needs a pause control** (WCAG 2.2.2). The rotating hero has a real `<button>` with `aria-pressed`, and it also pauses on hover and on `focusin`.
- **Style the control.** A pause button with no border renders as a stray grey word between the headline and the paragraph — technically visible, technically hittable, and read as a caption. Give controls a border, padding and a focus ring.

### 6.4 Reduced motion

A global guard, plus per-component handling:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Framer components check `useReducedMotion()` and drop their `initial`/`exit` states. Anything that auto-advances stops advancing entirely — and its pause control is hidden, because there is then nothing to pause.

---

## 7. Navigation

### 7.1 Structure

Sticky, `z-50`, full-width, bordered bottom. Two states:

```
at rest:      border-transparent  bg-background            py-3
scrolled:     border-border       bg-background/80         py-2   shadow-e1   backdrop-blur-md
                                  (bg-background/70 where backdrop-filter is supported)
```

Layout: `flex items-center justify-between gap-4 px-6 text-sm`.

**Left** — wordmark, then top-level items (`gap-x-1`, each `px-3 py-1.5 rounded-md`).
**Right** — theme toggle · CTA button · language switcher (`gap-3`).
**Below `md` (768px)** — wordmark + hamburger only; everything else moves into an accordion panel.

### 7.2 Type and colour — the alignment rule

The menu **must** match the body, not the headline:

| element | value |
|---|---|
| family | `--font-sans` (Instrument Sans) — **never the serif** |
| size | `14px` (`text-sm`) |
| weight | `400` top level · `600` dropdown child titles |
| resting colour | `--foreground / 0.70` |
| hover / active colour | `--foreground` (full) |
| active indicator | `1px` `--primary` underline, `origin-left`, `scale-x-1` |
| hover background | `--accent` (dropdown rows and mobile items only) |
| child description | `12px`, `--muted-foreground`, `leading-relaxed` |

Top-level items are **not** uppercase and **not** letter-spaced. The only uppercase, letter-spaced elements in the chrome are the footer column headings, the language pills and the kicker.

### 7.3 Dropdown panel

`w-[min(92vw,32rem)]` · `rounded-2xl` · `border-border` · `bg-popover` · `p-2` · `shadow-e3` · children in a `sm:grid-cols-2` grid, each row `rounded-xl p-3`.

### 7.4 The live menu

This is the production navigation, both locales:

| EN | NL | href |
|---|---|---|
| **Cyber Digital Twin** | **Cyber Digital Twin** | `/{locale}` |
| ├ The Problem | ├ Het probleem | `/{locale}/cdt-the-problem` |
| ├ How It Thinks | ├ Hoe het denkt | `/{locale}/cdt-how-it-thinks` |
| ├ One Model, Every Team | ├ Eén model, elk team | `/{locale}/cdt-one-model` |
| ├ Why OXOT | ├ Waarom OXOT | `/{locale}/cdt-why-oxot` |
| └ See It In Action | └ Zie het in actie | `/{locale}/cdt-see-it-in-action` |
| **CRA Readiness** | **CRA-gereedheid** | `/{locale}/cra-landing` |
| ├ Get Ready | ├ Word gereed | `/{locale}/cra-landing` |
| ├ Executive Briefing | ├ Directiebriefing | `/{locale}/cra-executive-brief-1` |
| ├ The Retainer | ├ Het retainer-traject | `/{locale}/cra-retainer` |
| ├ 2-min Self-Check | ├ 2-minuten zelfcheck | `/{locale}/cra-readiness-check` |
| ├ Sample Report | ├ Voorbeeldrapport | `/{locale}/lp/cra-sample-report` |
| ├ Technical Reference | ├ Technische referentie | `/{locale}/cra-technical-reference` |
| └ Conformity Platform | └ Conformiteitsplatform | `/{locale}/conformity-platform` |
| **About** | **Over ons** | `/{locale}/about` |
| ├ Company | ├ Bedrijf | `/{locale}/about` |
| ├ OT Security Services | ├ OT-beveiligingsdiensten | `/{locale}/services` |
| ├ Track Record | ├ Referenties | `/{locale}/track-record` |
| ├ Frameworks | ├ Kaders | `/{locale}/frameworks` |
| ├ Insights | ├ Insights | `/{locale}/blog` |
| └ Contact | └ Contact | `/{locale}/contact` |

Three top-level items. That is the shape: **the product, the regulation, the company.** Resist adding a fourth.

### 7.5 Language switcher

A segmented pill, not a dropdown:

```
container:  inline-flex gap-0.5 rounded-md border-border/70 bg-background/60 p-0.5
pill:       rounded-[5px] px-1.5 py-0.5 text-xs font-semibold uppercase tracking-[0.08em]
active:     bg-primary/15  text-primary
inactive:   text-foreground/55  →  hover: text-foreground
```

`role="group"`, `aria-label="Language / Taal"`, `hreflang` on each link, `aria-current` on the active one.

---

## 8. Footer

Four columns on `lg`, two on `sm`, one on mobile. Container `max-w-6xl`, `gap-10`, `px-6 py-14` (`lg:px-8`). Grid: `lg:grid-cols-[1.6fr_1fr_1fr_auto]` — the brand column is widest.

Surface: `border-t border-border bg-card/40`, with `mt-20` clearing the page above.

### 8.1 Columns

**1 — Brand** (widest)
- Wordmark, `18px`, `tracking-[0.3em]`
- Tagline, **serif**, `14px`, weight 500, `--foreground/90`
- Blurb, `14px`, `leading-relaxed`, `--muted-foreground`, `max-w-md`
- `info@oxot.nl` — `--foreground/70`, hover `--primary-ink`
- Newsletter block (`mt-8`): heading, email input, filled `--primary` Subscribe button, explainer

**2 — Navigation** · **3 — Connect** (socials) · **4 — Language**

All three share the same column heading:

```
text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground
```

Links: `14px`, `--foreground/70`, hover `--primary-ink`, `150ms ease-brand`, `space-y-2`.

### 8.2 The two bottom bars

Both `border-t border-border`, `max-w-6xl`, `px-6 py-5`, `text-xs`, `--muted-foreground`.

**Bar 1 — disclaimer + legal.** Positioning sentence left (`max-w-2xl`), then `Privacy · Terms · Cookie settings` right, separated by `·` (`aria-hidden`). Legal links hover to `--primary`.

**Bar 2 — copyright.** `© {year} OXOT. All rights reserved.` left; `OXOT — {tagline}` right with the **X in `--primary`**, so the mark's signature repeats at the very bottom of every page.

Stacks to a column below `md`/`sm`.

---

## 9. Components

### 9.1 Buttons

Base (every variant):

```
inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium
transition-[transform,background-color,box-shadow,border-color] duration-150 ease-brand
active:scale-[0.98]
focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
disabled:pointer-events-none disabled:opacity-50
```

| variant | resting | hover |
|---|---|---|
| `default` | `bg-primary text-primary-foreground shadow-e1` | `bg-primary/90 shadow-e2` |
| `secondary` | `bg-secondary text-secondary-foreground shadow-e1` | `bg-secondary/80 shadow-e2` |
| `outline` | `border-input bg-background shadow-e1` | `bg-accent text-accent-foreground shadow-e2` |
| `ghost` | — | `bg-accent text-accent-foreground` |
| `destructive` | `bg-destructive text-destructive-foreground shadow-e1` | `bg-destructive/90 shadow-e2` |
| `link` | `text-primary underline-offset-4` | `underline` |

| size | height | padding |
|---|---|---|
| `sm` | `32px` | `px-3 text-xs`, `rounded-md` |
| `default` | `36px` | `px-4 py-2` |
| `lg` | `40px` | `px-6`, `rounded-md` |
| `icon` | `36×36` | — |

Add `.cta-lift` to primary page-level CTAs.

### 9.2 Cards

`bg-card` · `border-border` · `rounded-[var(--radius)]` · `shadow-e1` · hover `shadow-e2` · padding `22–26px`.

### 9.3 Spec rows

The `SCOPE / DURATION / BASIS / APPROACH / OUTPUT` pattern: **mono uppercase key** (`13px`, weight 700, `--foreground`) on the left, sans value (`15px`, `--muted-foreground`) on the right, separated by a dashed `--border` rule. This is the house pattern for anything factual.

### 9.4 Numbered sections

Serif heading preceded by a mono `decimal-leading-zero` counter in `--primary` (`01`, `02`), plus a `44px × 2px` `--primary` rule under the heading. Article H2s do this automatically via `counter-increment`.

### 9.5 Forms

Inputs: `border-input`, `bg-background`, `rounded-md`, `text-sm`, and the global focus ring. Never colour a field border `--border` — `--input` exists so fields read as interactive.

---

## 10. Accessibility — non-negotiable

- **Focus ring, globally**: `outline: 2px solid hsl(var(--ring)); outline-offset: 2px` on every `a`, `button`, `input`, `select`, `textarea`, `[tabindex]`. Never remove it without an equivalent replacement.
- **Skip link**: off-screen at `left: -9999px`, snaps to `left: 0` on `:focus`, `--primary` background with `--on-accent` text.
- **Contrast**: 4.5:1 for text under 24px. Use `--primary-ink` for small orange text — `--primary` does not clear the bar on light surfaces.
- **Pause control** for anything auto-updating beyond 5s, with `aria-pressed`.
- **Reduced motion** honoured globally and per component.
- **Bilingual by construction.** No user-facing string ships in one language. Every layout must survive Dutch running 15–20% longer than English — verify at 375px, in both locales, by looking at the render.

---

## 11. Starter stylesheet

Everything a new OXOT property needs to inherit the system:

```css
:root {
  --background: 60 33% 98%;
  --foreground: 212 51% 11%;
  --card: 0 0% 100%;
  --card-foreground: 212 51% 11%;
  --popover: 0 0% 100%;
  --popover-foreground: 212 51% 11%;
  --primary: 28 100% 47%;
  --primary-ink: 28 100% 33%;
  --primary-foreground: 0 0% 100%;
  --on-accent: 212 51% 11%;
  --secondary: 210 30% 95%;
  --secondary-foreground: 212 51% 11%;
  --muted: 210 30% 94%;
  --muted-foreground: 212 20% 38%;
  --accent: 210 30% 93%;
  --accent-foreground: 212 51% 11%;
  --destructive: 0 72% 48%;
  --destructive-foreground: 0 0% 100%;
  --border: 214 25% 88%;
  --input: 214 25% 84%;
  --ring: 28 100% 47%;
  --radius: 0.75rem;

  --font-display: var(--font-serif), Georgia, "Palatino Linotype", "Iowan Old Style", serif;

  --elev-1: 0 1px 2px hsl(212 51% 11% / 0.04), 0 1px 1px hsl(212 51% 11% / 0.03);
  --elev-2: 0 4px 12px hsl(212 51% 11% / 0.06), 0 2px 4px hsl(212 51% 11% / 0.04);
  --elev-3: 0 12px 32px hsl(212 51% 11% / 0.10), 0 4px 10px hsl(212 51% 11% / 0.05);

  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-1: 150ms;
  --dur-2: 250ms;
  --dur-3: 400ms;
}

.dark {
  --background: 210 50% 12%;
  --foreground: 220 20% 92%;
  --card: 210 44% 15%;
  --card-foreground: 220 20% 92%;
  --popover: 210 44% 15%;
  --popover-foreground: 220 20% 92%;
  --primary: 28 100% 53%;
  --primary-ink: 28 100% 62%;
  --primary-foreground: 210 50% 10%;
  --on-accent: 212 51% 11%;
  --secondary: 210 34% 19%;
  --secondary-foreground: 220 20% 92%;
  --muted: 210 34% 18%;
  --muted-foreground: 214 18% 68%;
  --accent: 210 34% 22%;
  --accent-foreground: 220 20% 92%;
  --destructive: 0 80% 70%;
  --destructive-foreground: 0 0% 100%;
  --border: 210 30% 24%;
  --input: 210 30% 26%;
  --ring: 28 100% 53%;

  --elev-1: inset 0 1px 0 hsl(0 0% 100% / 0.04), 0 1px 2px hsl(0 0% 0% / 0.30);
  --elev-2: inset 0 1px 0 hsl(0 0% 100% / 0.05), 0 6px 16px hsl(0 0% 0% / 0.38);
  --elev-3: inset 0 1px 0 hsl(0 0% 100% / 0.06), 0 16px 40px hsl(0 0% 0% / 0.45);
}

body {
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-family: var(--font-sans), system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
h1, h2, h3 { font-family: var(--font-display); font-feature-settings: "liga" 1, "kern" 1; }
h1, h2, h3, h4 { text-wrap: balance; }
h1 { font-size: clamp(1.75rem, 1.30rem + 2.00vw, 2.5rem); }
h2 { font-size: clamp(1.50rem, 1.25rem + 1.10vw, 1.875rem); }
* { border-color: hsl(var(--border)); }

a:focus-visible, button:focus-visible, input:focus-visible,
select:focus-visible, textarea:focus-visible, [tabindex]:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

.oxot-kicker {
  font-size: 0.75rem; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.18em; color: hsl(var(--primary));
}
.cta-lift {
  transition: transform var(--dur-1) var(--ease-out), box-shadow var(--dur-1) var(--ease-out);
  will-change: transform;
}
.cta-lift:hover, .cta-lift:focus-visible { transform: translateY(-2px); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Fonts, self-hosted:

```js
import { Newsreader, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";

const serif = Newsreader({ subsets: ["latin"], weight: ["300","400","500"],
                           style: ["normal","italic"], variable: "--font-serif", display: "swap" });
const sans  = Instrument_Sans({ subsets: ["latin"], weight: ["400","500","600"],
                                variable: "--font-sans", display: "swap" });
const mono  = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400","500","700"],
                              variable: "--font-mono", display: "swap" });
```

---

## 12. What breaks the brand

| don't | do |
|---|---|
| hard-code a hex in a component | use `hsl(var(--token))` |
| use `--primary` for text under 24px | use `--primary-ink` |
| add a second accent colour | one orange, everywhere |
| set the wordmark in the serif | the mark is sans; headlines are serif |
| letter-space the wordmark below `0.24em` | `0.28em` header, `0.30em` footer |
| uppercase the top-level nav | sentence case, `400`, `14px` |
| define light-mode colours only | every token needs a `.dark` value |
| animate `width` / `height` / `top` / `left` | `transform` and `opacity` |
| use an easing that isn't the brand curve | `cubic-bezier(0.22, 1, 0.36, 1)` |
| auto-rotate content with no pause control | real `<button>` + `aria-pressed` (WCAG 2.2.2) |
| ship an unstyled control | border, padding, focus ring |
| ship English-only copy | `nl` and `en`, always |
| trust an overflow measurement at 375px | look at the screenshot |
| use a drop shadow for depth on navy | inset top highlight + ambient shadow |
