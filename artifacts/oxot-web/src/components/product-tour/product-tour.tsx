import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'wouter';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Play, Pause, ChevronLeft, ChevronRight, ArrowRight, ClipboardCheck } from 'lucide-react';

/**
 * The product tour (Phase 25) — a web-native, auto-advancing cinematic
 * walkthrough of the conformance application, built from REAL screenshots of
 * the live app. It is simultaneously "a movie that plays" (auto-advance +
 * crossfade) and "LinkedIn-style auto-forward" (paged, tappable). Structure
 * follows the keynote arc: hook → the problem → show the product working
 * across acts/artifacts/operator/proof/honesty → CRA Transit ("one more
 * thing") → contact. Every claim maps to a shipped capability.
 *
 * Accessibility: pause/play, prev/next, arrow-key + space control, a live
 * region announcing each caption, and honouring prefers-reduced-motion (no
 * auto-advance and no motion when the user asks for less).
 */

type Slide =
  | {
      kind: 'text';
      eyebrow: string;
      headline: string;
      caption: string;
    }
  | {
      kind: 'shot';
      eyebrow: string;
      headline: string;
      caption: string;
      image: string;
      alt: string;
    }
  | {
      kind: 'cta';
      eyebrow: string;
      headline: string;
      caption: string;
    };

const SLIDES: Slide[] = [
  {
    kind: 'text',
    eyebrow: 'The deadline',
    headline: '11 December 2027.',
    caption:
      'Every product with digital elements on the EU market must be conformant with the Cyber Resilience Act. Reporting duties are already enforceable from 11 September 2026.',
  },
  {
    kind: 'text',
    eyebrow: 'The problem',
    headline: 'Today, your conformity lives in a hundred places.',
    caption:
      'Spreadsheets, tickets, and engineers’ laptops. Nothing is assessment-ready the day an auditor asks. The CRA is an operations problem before it is a paperwork problem.',
  },
  {
    kind: 'shot',
    eyebrow: 'One record, per product',
    headline: 'Every product becomes one living dossier.',
    caption:
      'Its role, its class, its evidence and its statutory clocks in one place — the working record an auditor and a regulator both scrutinise.',
    image: '/media/tour/01-product-dossier.jpg',
    alt: 'The product dossier for a smart-home hub with its role, version, manufacturer and the RED→CRA handover.',
  },
  {
    kind: 'shot',
    eyebrow: 'Not just the CRA',
    headline: 'Nine regulations — each in the act’s own words.',
    caption:
      'The CRA, NIS2, the AI Act, Machinery, RED, GDPR, the Data Act, GPSR and IEC 62443 — 156 obligations, each citing its own article, cross-referenced into one engine.',
    image: '/media/tour/03-act-cards.jpg',
    alt: 'Regulation cards for the CRA, AI Act, Machinery and IEC 62443 with their article references, penalties and mapped requirement counts.',
  },
  {
    kind: 'shot',
    eyebrow: 'The law itself',
    headline: 'The statute, verbatim — and it never tells you you’re compliant.',
    caption:
      'As amended, corrigenda applied and disclosed where you read them, verified character-exact in CI. Article 32 keeps the conformity assessment with you — the tool shows the state of your evidence, honestly.',
    image: '/media/tour/05-verbatim-law.jpg',
    alt: 'The GDPR reader showing Article 37 with an "as corrected by OJ L 127" callout and the note that it never concludes whether processing complies.',
  },
  {
    kind: 'shot',
    eyebrow: 'For operators & asset owners',
    headline: 'Your suppliers carry the CRA. Now hold them to it.',
    caption:
      'A per-device procurement file: what the supplier’s manufacturer must provide, each item citing the CRA duty that binds it — on file, reported missing, or honestly unanswered.',
    image: '/media/tour/04-operator-procurement.jpg',
    alt: 'The operator procurement panel showing CRA Article 13 checklist items with on-file / not-provided / unanswered states.',
  },
  {
    kind: 'shot',
    eyebrow: 'One executable register',
    headline: 'Every obligation, cross-referenced and searchable.',
    caption:
      'The statutory legal register — mandatory dates, fine structures, and a direct line to the verbatim text — decomposed into an engine you can query.',
    image: '/media/tour/02-regulatory-intelligence.jpg',
    alt: 'The EU Regulatory Intelligence page listing 11 frameworks cross-referenced into a compliance engine.',
  },
  {
    kind: 'text',
    eyebrow: 'Your data, your jurisdiction',
    headline: 'Single-tenant, always. The AI runs local.',
    caption:
      'Run it in the AWS European Sovereign Cloud with EU data residency, as a delivered hardware appliance, in Docker, or a VM — with a local AI model that never phones home. Your evidence never leaves your control.',
  },
  {
    kind: 'text',
    eyebrow: 'One more thing',
    headline: 'Or let us do it with you — in 60 days.',
    caption:
      'CRA Transit: our experts run the entire eight-phase process with you on a dedicated instance, hand you the complete Annex VII file and your declaration, and take the platform down. The assisted route, done right.',
  },
  {
    kind: 'cta',
    eyebrow: 'See it against your own products',
    headline: 'Book a 45-minute walkthrough.',
    caption:
      'Bring one product or a whole portfolio. We’ll show you the workbench, the evidence you already hold, and what a defensible technical file looks like for you.',
  },
];

const SLIDE_MS = 6000;

export function ProductTour() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(!reduce);
  const [progress, setProgress] = useState(0);
  const raf = useRef<number | null>(null);
  const start = useRef<number>(0);

  const count = SLIDES.length;
  const go = useCallback((next: number) => {
    setIndex(((next % count) + count) % count);
    setProgress(0);
  }, [count]);

  // Auto-advance driver (skipped entirely when reduced motion is requested).
  useEffect(() => {
    if (!playing || reduce) return;
    start.current = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start.current;
      const p = Math.min(1, elapsed / SLIDE_MS);
      setProgress(p);
      if (p >= 1) {
        setIndex((i) => (i + 1) % count);
        setProgress(0);
        start.current = now;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing, reduce, index, count]);

  // Keyboard control.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(index + 1);
      else if (e.key === 'ArrowLeft') go(index - 1);
      else if (e.key === ' ') {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, go]);

  const slide = SLIDES[index];
  const fade = useMemo(
    () =>
      reduce
        ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } }
        : {
            initial: { opacity: 0, scale: 1.02 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.99 },
          },
    [reduce],
  );

  return (
    <div
      className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-e1"
      role="region"
      aria-roledescription="carousel"
      aria-label="OXOT Conformance Platform product tour"
    >
      {/* Progress segments */}
      <div className="flex gap-1.5 p-3" aria-hidden="true">
        {SLIDES.map((_, i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{
                width: i < index ? '100%' : i === index ? `${progress * 100}%` : '0%',
              }}
            />
          </div>
        ))}
      </div>

      {/* Stage */}
      <div className="relative aspect-[16/10] w-full bg-gradient-to-b from-background to-card">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            {...fade}
            transition={{ duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col"
            onClick={() => setPlaying((p) => !p)}
          >
            {slide.kind === 'shot' ? (
              <div className="flex h-full flex-col">
                <div className="flex flex-1 items-center justify-center overflow-hidden bg-muted/20 p-3 md:p-6">
                  <img
                    src={slide.image}
                    alt={slide.alt}
                    className="max-h-full max-w-full rounded-lg border border-border/60 object-contain shadow-lg"
                    loading={index <= 3 ? 'eager' : 'lazy'}
                  />
                </div>
                <div className="border-t border-border bg-card p-5 md:px-8 md:py-6">
                  <p className="oxot-kicker">{slide.eyebrow}</p>
                  <h3 className="mt-1 font-display text-lg font-normal tracking-tight text-foreground md:text-2xl">
                    {slide.headline}
                  </h3>
                  <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                    {slide.caption}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center md:px-12">
                <p className="oxot-kicker">{slide.eyebrow}</p>
                <h3 className="mt-3 max-w-3xl font-display text-3xl font-normal tracking-tight text-foreground md:text-5xl">
                  {slide.headline}
                </h3>
                <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                  {slide.caption}
                </p>
                {slide.kind === 'cta' && (
                  <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Link
                      href="/demo"
                      className="cta-lift inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
                    >
                      Book a demo <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/cra-check"
                      className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <ClipboardCheck className="h-4 w-4" /> Take the 2-minute check
                    </Link>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Live region for assistive tech */}
      <p className="sr-only" aria-live="polite">
        Slide {index + 1} of {count}: {slide.headline} {slide.caption}
      </p>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 border-t border-border p-3">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          aria-label={playing ? 'Pause the tour' : 'Play the tour'}
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playing ? 'Pause' : 'Play'}
        </button>
        <span className="font-mono text-[11px] text-muted-foreground">
          {index + 1} / {count}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => go(index - 1)}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
