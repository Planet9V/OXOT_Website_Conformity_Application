# OXOT marketing-site image brief — generation prompts + specs

Companion to (not a replacement for) `docs/cra_podcast/blog_process/BLOG_IMAGE_MANIFEST.md`.
That manifest is the **blog's** house style (silver-gelatin monochrome, photo-real).
**This** brief is the **marketing site's** brand style, locked 2026-08-20:
statutory-seal mark + faint amber **graph paper** + **survey-sweep** motion. The two
styles are deliberately different — blog reads as editorial photography, the site
reads as engineering drafting.

## Non-negotiables (read once, apply to every prompt)

- **Every image is text-free.** No words, numbers, letters, logos, UI chrome, or
  watermarks baked in. Captions/labels live in the page, not the pixels.
  (Localization + accessibility depend on this.)
- **Every image is a framed "exhibit plate" on the dark brand ground.** One render
  serves both light and dark site themes because the plate is a dark card that sits
  *on top* of the page. Do **not** generate light-mode variants.
- **Style: engineering drafting, not decoration.** Think technical plotter line-work,
  drafting-table schematic, isometric technical illustration, millimetre graph paper,
  registration ticks and crosshairs, thin confident strokes, generous negative space.
- **No:** stock photography, people/faces, glossy CGI, neon glow, lens flare, laser
  beams, floating holograms, 3D "AI blob" abstractions, gradients-as-subject, clutter.

### Master style prefix (paste in front of any slot prompt)

> Technical engineering schematic on a warm near-black drafting ground (#131110),
> rendered as precise plotter line-work over a very faint millimetre graph-paper grid.
> Monochrome warm-grey linework with a single accent colour: OXOT amber (#EE6C1B),
> used sparingly to emphasise exactly one element. Thin confident strokes, subtle
> registration ticks and corner crosshairs, generous negative space, matte finish.
> Calm, authoritative, precise — the visual language of a statutory conformity
> instrument, not a marketing graphic. No text, no numbers, no logos, no people.

### Master negative prompt (paste into the negative field every time)

> text, letters, numbers, words, captions, labels, logos, watermark, UI, buttons,
> people, faces, hands, stock photo, photograph, glossy, CGI render, neon, glow,
> bloom, lens flare, laser beams, hologram, 3D abstract blobs, gradient mesh,
> rainbow colours, cluttered, busy, low-contrast, blurry

## Palette (for reference / any recolour step)

| Role | Hex |
|------|-----|
| Ground (dark) | `#131110` (also `#100D0B`) |
| Accent — amber | `#EE6C1B` |
| Accent — hot (use rarely, for alarm/critical only) | `#FF3C00` |
| Accent — amber ink (lighter, for fine lines) | `#F4A24A` |
| Linework — warm grey | `#8A8073` / `rgba(237,231,222,0.35)` |
| Ink / highlight | `#EDE7DE` |

## Canonical sizes (so each fits its slot perfectly)

All plates are framed full-width in a rounded hairline card (`ProductShot`
treatment), so they downscale from these retina sources:

| Slot type | Source px | Aspect | Format | Where it renders |
|-----------|-----------|--------|--------|------------------|
| Home signature plate | 2400×1200 | 2:1 | JPG q85 | Home, top exhibit |
| Hero / persona exhibit plate | 1600×900 | 16:9 | JPG q85 | Directly under a page header |
| In-body concept diagram | 1600×900 | 16:9 | JPG q85 | Mid-page, explaining one idea |
| Tall stack diagram | 1600×1200 | 4:3 | JPG q85 | For layered/stacked subjects |
| Statutory timeline strip | 2000×700 | ~2.86:1 | JPG q85 | Wide, one-per-site |
| OG / social card | 1200×630 | 1.91:1 | JPG q85 | Link previews (funnelMeta) |
| CTA atmosphere band (optional) | 2400×800 | 3:1 | JPG q85 | Full-bleed CTA background |

> **Fit rule:** generate at the source px above (or larger, same aspect) and hand
> back at that exact aspect. I resize/optimise on ingest. Never crop to a different
> aspect — the card assumes the ratio in this table.

---

## The set (curated, tiered — stay lean; ship Tier 1–2 first)

### Tier 1 — signature (2 images, do these first)

**`brand-home-signature.jpg`** — 2400×1200 (2:1) — Home, top exhibit plate.
Purpose: one signature image that *is* the brand. Animation candidate (see below).
> [master prefix] A single central document-object — a technical dossier / declaration
> drawn as a precise isometric line-work slab — resting on a drafting table of faint
> graph paper. Concentric registration circles (a statutory seal motif) are inscribed
> over it, with one amber cross-mark at the centre where the seal bites. Faint radial
> light from the top edge. The object is the only subject; everything else is quiet
> grid and negative space. 2:1 composition, subject centred slightly low.

**`og-default.jpg`** — 1200×630 (1.91:1) — universal social/link-preview card.
Purpose: branded preview for any page without its own OG. Text-free (platform adds title).
> [master prefix] Centred statutory-seal motif — concentric drafting circles with a
> single amber cross-mark at the core — over a faint graph-paper field, framed by four
> corner registration crosshairs. Maximal negative space, nothing else. 1.91:1.

### Tier 2 — persona exhibit plates (5 images — the "header pictures" you wanted)

Each sits directly under that persona page's header as the hero exhibit, and *states
that persona's CRA position* at a glance. All 1600×900 (16:9).

**`brand-persona-manufacturer.jpg`** — Manufacturers page.
> [master prefix] One product node at centre, drawn as a precise line-work module,
> visibly "carrying" a stacked load above it — a layered set of thin plates (essential
> requirements, technical file, declaration, conformity mark) balanced on the single
> node. The node and the topmost plate are picked out in amber. The idea: this one
> actor bears the full weight. 16:9, centred, generous space.

**`brand-persona-operator.jpg`** — Operators & asset owners page.
> [master prefix] A regular grid/fleet of small identical device nodes (an estate),
> drawn in warm grey. None of them wear a badge. A single thin amber tether descends
> from a small watching aperture at the top edge and touches the fleet — an external
> duty reaching in from outside (NIS2), not born by the devices themselves. 16:9.

**`brand-persona-integrator.jpg`** — Integrators / partner-scope page.
> [master prefix] A horizontal boundary line across the plate. On the left, an
> unmodified module in warm grey; a modification arrow crosses the line to the right,
> where the same module — now amber — has flipped identity. One amber threshold marker
> sits exactly on the crossing point. The idea: cross the line and you become the
> manufacturer. 16:9, the crossing point on the centre axis.

**`brand-persona-supplier.jpg`** — Component & IP suppliers page.
> [master prefix] One upstream component node (amber) at the left, feeding thin
> line-work arrows downstream to several finished-product nodes (warm grey) on the
> right. A single versioned "assurance package" plate travels along the arrows.
> Evidence flows downstream; duty does not transfer. 16:9.

**`brand-persona-transit.jpg`** — CRA-in-transit / 60-day sprint page.
> [master prefix] A single fast horizontal track from a raw product node on the left
> to a finished, sealed dossier on the right, with a few evenly spaced gate ticks along
> the way. The track and the end-seal are amber; motion implied by tapering speed-lines
> behind the node. A compressed, decisive sprint. 16:9.

### Tier 3 — concept diagrams (3, add for depth where a page makes a hard claim)

**`brand-cra-timeline.jpg`** — 2000×700 (~2.86:1) — one wide statutory-timeline strip
(home or solutions). Animation candidate (playhead).
> [master prefix] A single long horizontal statutory timeline rule spanning the width,
> with a handful of evenly spaced milestone ticks rising as thin verticals. One tick —
> the enforcement cut-over — is amber and taller. A faint "before/after" shaded change
> at that tick. Purely geometric: rule, ticks, one accent. No dates, no text. 2.86:1.

**`brand-technical-file.jpg`** — 1600×1200 (4:3) — Product page, the Annex VII dossier.
> [master prefix] An exploded isometric stack of thin document plates (the layers of a
> technical file: scope, risk assessment, requirement mapping, test evidence, SBOM,
> declaration), slightly separated so each layer reads, aligned to a graph-paper base.
> The SBOM layer is picked out in amber. Precise, architectural, calm. 4:3, centred.

**`brand-deemed-threshold.jpg`** — 1600×900 (16:9) — partner-scope, the Article 22 line.
> [master prefix] A measured gauge/scale running left to right from "configuration"
> to "substantial modification", with a single amber threshold gate part-way along and
> a needle resting just before it. Everything else warm-grey graduation ticks. The one
> line that decides deemed-manufacturer status. 16:9.

### Tier 4 — atmosphere (optional, 1, only if a CTA band feels bare)

**`brand-cta-band.jpg`** — 2400×800 (3:1) — full-bleed behind a closing CTA.
> [master prefix] Almost-empty field of faint graph paper with a single amber
> survey-sweep line passing across it and four corner registration crosshairs. Extreme
> negative space — this is background texture, not a subject. 3:1.

---

## Animation (loveart.ai) — keep it to 1–2, poster-first

Motion rules from the perf/accessibility research still apply: **the still is the
poster and the LCP element; the animation is progressive enhancement; deliver a short
loop (≤4 MB, H.264/WebM, muted, `playsinline`); on `prefers-reduced-motion` we show
the poster.** So every animated slot must first exist as the still above.

Recommended candidates (in priority order — don't animate everything):

1. **`brand-home-signature`** → a slow 5–6 s loop: the faint top light breathes and one
   thin amber survey-sweep passes down over the seal, then resets. Subject stays still.
2. **`brand-cra-timeline`** → a single 6 s left-to-right playhead pass along the rule,
   milestone ticks brightening as it crosses them; hold, then fade to poster. (One pass,
   not a hard loop.)
3. **(optional) one persona plate** → a 3–4 s dataflow: the amber accent pulses once and
   the arrows fill in the flow direction. Pick supplier or transit — they read as flow.

loveart.ai prompt add-on for these: *"Animate as a subtle, slow, looping engineering
diagram: only the amber accent element and a single light-sweep move; all line-work
stays perfectly still; no camera zoom, no parallax on the grid, no easing overshoot.
Seamless loop."* Export the first frame as the matching `.jpg` poster.

## Delivery & naming

- Hand files back at the exact filename + aspect above.
- Plates → `artifacts/oxot-web/public/media/brand/`
- OG cards → `artifacts/oxot-web/public/media/og/`
- Animations → same basename, `.mp4` + `.webm`, beside the `.jpg` poster.
- I optimise/resize on ingest and wire each into its slot (the persona plates need a
  small `PageHeader` hero-slot addition — I'll handle that when we place them).

## Leanness check (Jobs test — does each earn its place?)

Ship **Tier 1 (2) + Tier 2 (5) = 7 images** and the site is fully, tastefully imaged
without being image-heavy. Tier 3 (3) adds depth on the three pages that make the
hardest claims. Tier 4 is optional. Total ceiling: **13**. If a page's idea is already
carried by a live JSX diagram (e.g. `SupplyChainDiagram`), it does **not** also get a
plate — no redundancy.
