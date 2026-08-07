# Prompt — Reconcile the Styleguide with Reality, Then Extend It (Non-Destructively)

## Context (verified, not assumed)

`artifacts/source_material/OXOTSTYLEGUIDE.md` §6 ("Motion — the micro-animation system") is a detailed, well-designed spec: a shared easing curve (`EASE = [0.22, 1, 0.36, 1]`), a 3-tier timing scale (`--dur-1: 150ms` / `--dur-2: 250ms` / `--dur-3: 400ms`), a 16-effect catalogue, explicit rules ("compositor-only", "colour is 150ms, movement is 200–250ms, reveals are 600ms"), and a reduced-motion section.

**None of it is implemented.** Verified by direct grep across `artifacts/oxot-web/src`:
- No `--ease-out`, `--dur-1/2/3` custom properties anywhere in `index.css`.
- No `ease-brand` Tailwind utility, no `EASE` JS constant, anywhere.
- The 11 files that already use `framer-motion` all use plain `transition={{ duration: 0.5, delay: ... }}` — 500ms, default easing. That doesn't match the documented "movement is 200–250ms, reveals are 600ms" rule at all.

Separately: **glassmorphism already exists in the codebase**, but only in 3 files (`conformity-dashboard.tsx`, `trust-center-page.tsx`, `admin-login.tsx`) — all inside the gated workbench/admin surfaces, none on the public funnel — and all using raw, off-token Tailwind literals (`bg-slate-900/80`, `border-white/10`, `bg-[#030712]`) rather than the shared `--card`/`--border`/`--primary` design tokens. `trust-center-page.tsx` is a deliberate, permanently-dark single-theme page (no `dark:` variants — by design, not a bug), which is a legitimate pattern for *that* page but not a template for the 7 public funnel pages, which must work in both themes.

**Conclusion:** the styleguide document and the implementation have drifted apart. Before extending motion to 7 more pages (the already-approved plan in `task_plan.md`), decide *which* motion system those 7 pages should actually use — the documented-but-unbuilt one, or a formalized version of the one that's already shipped in 11 files — rather than adding an 8th ad-hoc variant.

## The task

Two deliverables, in order. **Non-destructive is the hard constraint on both: zero changes to any of the 11 existing framer-motion files, the 3 existing glass-usage files, or any page/route/prop/copy/logic outside what's explicitly named below.**

### 1. Formalize shared motion + glass tokens (additive only)

Add, once, in `artifacts/oxot-web/src/index.css` (alongside the existing `@theme inline` block — Tailwind v4, CSS-first, no `tailwind.config.js`):

```css
:root {
  --ease-brand: cubic-bezier(0.22, 1, 0.36, 1);
  --dur-1: 150ms; /* colour, small state changes */
  --dur-2: 250ms; /* movement, reveals, panels */
  --dur-3: 400ms; /* large/staged transitions */
}
```

Add a small new file, `artifacts/oxot-web/src/lib/motion.ts`, exporting the JS-side equivalents for Framer Motion consumers:

```ts
export const EASE = [0.22, 1, 0.36, 1] as const;
export const entranceVariants = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: EASE },
});
export const revealVariants = (index = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay: index * 0.1, ease: EASE },
});
```

**Decision needed from you before this is written:** keep `duration: 0.5` (matches the 11 already-shipped files — visual consistency with existing motion) and layer the brand `EASE` curve on top of it, **or** move to the styleguide's documented 250ms/600ms scale (closer to spec, but visibly different timing from the 11 existing files, so the site would have two motion "speeds" until/unless those are ever revisited). Recommendation: keep `duration: 0.5`, add `ease: EASE` — smallest change, brings the curve in line with the spec without a timing mismatch against already-shipped pages.

Add one new utility class for glass surfaces, token-based so it works in both themes:

```css
.oxot-glass {
  background-color: color-mix(in srgb, var(--card) 70%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
}
```

This is genuinely new (nothing today defines glass via the shared tokens) but purely additive — no existing class is renamed, removed, or redefined, so nothing that currently compiles can break.

### 2. Update the styleguide document to match what's true after step 1

Edit `OXOTSTYLEGUIDE.md` §6 surgically:
- Note plainly that `--ease-brand`/`--dur-*`/`EASE` are now real, defined tokens (cite the files), where before the section described an aspiration.
- Correct the catalogue's timing claims to match what's actually shipped (`0.5s`/`500ms` entrance and reveal, not the previously-stated 200–250ms/600ms) — **or**, if you choose the "move to spec" option above instead, update the code to match the doc rather than the doc to match the code. Either is fine; what's not fine is leaving them disagreeing, which is the current state.
- Add a new short subsection, "6.5 Glass surfaces," documenting `.oxot-glass` — what it's for (translucent layering over imagery/gradients, not a decorative default), the token composition above, and that it's opt-in per-section, not a base style.

Do not touch §7–14 (navigation, footer, components, accessibility, page header, TOC) — out of scope, not implicated by this drift.

### 3. Then, and only then, resume the approved 7-page motion plan

Once §1–2 are done and verified, `task_plan.md`'s Phase 1–7 (home → demo, one page/commit/verify at a time, per `findings.md`'s risk inventory) should import `entranceVariants`/`revealVariants` from the new `lib/motion.ts` instead of hand-writing `initial`/`whileInView`/`transition` inline per page — same visual result, one shared source of truth instead of 7 more copies of the same object literal. If any funnel page has a real case for `.oxot-glass` (e.g. a card floating over the hero's gradient blur, already present in `hero-section.tsx`), it's fair to use it there — but do not go looking for places to insert it just because it now exists; a glass panel needs an actual translucency need (something visible showing through it) to be worth using, not just because the token is available.

## Guardrails (repeat of the user's own constraint, made explicit)

- No existing file outside `index.css` (additive-only edit), the new `lib/motion.ts`, and `OXOTSTYLEGUIDE.md` gets touched in this phase.
- No existing Tailwind class, CSS custom property, or `motion.*` prop in any of the 11 already-shipped files is renamed, removed, or given a different value.
- Verify via the same method as everything else this session: `docker compose build web`, then Chrome — confirm the 3 existing glass pages and all 11 existing motion pages render pixel-identical to before (spot-check: `/conformity` dashboard, `/trust`, `/admin/login`, `/frameworks`), before touching any of the 7 funnel pages.
