/**
 * Shared Framer Motion primitives (OXOT styleguide §6). Mirrors the CSS
 * --ease-brand token in index.css so a CSS hover and a Framer Motion panel
 * share one curve. Timing matches the site's existing shipped motion
 * (0.5s entrance/reveal) — only the easing curve is new; nothing here
 * changes what any already-animated page looks like.
 *
 * No explicit Framer Motion type import here on purpose — `Transition`/
 * `Variant` aren't part of framer-motion's public top-level export surface
 * in the installed version; TypeScript checks the spread against
 * `motion.div`'s own prop types wherever these are used instead.
 */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** Above-the-fold entrance: fires immediately on mount, staggered by delay. */
export function entranceVariants(delay = 0) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: EASE },
  } as const;
}

/** Scroll-triggered reveal for grid/list items: fires once, staggered by index. */
export function revealVariants(index = 0) {
  return {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5, delay: index * 0.1, ease: EASE },
  } as const;
}
