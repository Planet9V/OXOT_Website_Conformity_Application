import { useState, useEffect } from "react";
import type { PortfolioSize, SelfCheckCopyV2 } from "@/lib/cra-selfcheck";
import { runwayMath } from "@/lib/cra-selfcheck";

/**
 * Pure bar geometry calculation: percentages scaled so weeksAvailable at offset 0 = 100%.
 * Also computes rendered bar geometry: need bar is capped at 100% (availPct), overshoot extends
 * from 100% boundary to needMinPct (clamped to 130% max for viewBox safety).
 * Returns { needMinPct, needMaxPct, availPct, overshoot, renderedNeedMinPct, renderedOvershootWidth }
 */
export function runwayBars(
  portfolioSize: PortfolioSize,
  offset: number,
  now: Date,
): {
  needMinPct: number;
  needMaxPct: number;
  availPct: number;
  overshoot: boolean;
  renderedNeedMinPct: number;
  renderedOvershootWidth: number;
} {
  const math = runwayMath(portfolioSize, offset, now);
  // Scale is weeksAvailable at offset 0
  const scale = runwayMath(portfolioSize, 0, now).weeksAvailable;

  const availPct = (math.weeksAvailable / scale) * 100;
  const needMinPct = (math.weeksNeededMin / scale) * 100;
  const needMaxPct = (math.weeksNeededMax / scale) * 100;
  const overshoot = math.overshootWeeks > 0;

  // Rendered geometry: need bar capped at 100%, overshoot extends from there
  const renderedNeedMinPct = Math.min(needMinPct, 100);
  const renderedOvershootWidth = overshoot ? Math.max(0, Math.min(needMinPct - 100, 30)) : 0;

  return { needMinPct, needMaxPct, availPct, overshoot, renderedNeedMinPct, renderedOvershootWidth };
}

interface RunwaySvgProps {
  portfolioSize: PortfolioSize;
  copy: SelfCheckCopyV2["runway"];
  now: Date;
}

export function RunwaySvg({ portfolioSize, copy, now }: RunwaySvgProps) {
  const [offset, setOffset] = useState(0);
  const [reduce, setReduce] = useState(false);
  const inputId = "runway-slider";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    setReduce(!!mq?.matches);
    const handler = (e: MediaQueryListEvent) => setReduce(e.matches);
    mq?.addEventListener("change", handler);
    return () => mq?.removeEventListener("change", handler);
  }, []);

  const bars = runwayBars(portfolioSize, offset, now);
  const math = runwayMath(portfolioSize, offset, now);

  // Clamp availability to 0–130% for visual purposes
  const clampPct = (pct: number) => Math.min(130, Math.max(0, pct));
  const avail = clampPct(bars.availPct);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={inputId} className="block text-sm font-medium text-foreground mb-2">
          {copy.startLabel}: <span className="text-primary">{offset}</span>
        </label>
        <input
          id={inputId}
          type="range"
          min={0}
          max={4}
          value={offset}
          onChange={(e) => setOffset(parseInt(e.currentTarget.value))}
          className="w-full"
        />
      </div>

      {/* SVG bars */}
      <div className="rounded-lg border border-border bg-card p-4">
        <svg
          viewBox="0 0 400 85"
          className="w-full max-w-2xl mx-auto"
          role="img"
          aria-label={copy.title}
        >
          {/* Available window bar (background) */}
          <rect
            x="20"
            y="30"
            width={(avail / 130) * 350}
            height="30"
            fill="hsl(var(--muted))"
            className={reduce ? "" : "transition-all duration-500"}
          />

          {/* Need range bar: min at full opacity, max range at reduced opacity */}
          <rect
            x="20"
            y="30"
            width={(bars.renderedNeedMinPct / 130) * 350}
            height="30"
            fill="hsl(var(--primary))"
            className={reduce ? "" : "transition-all duration-500"}
            opacity="0.8"
          />

          {/* Need range extension (min to max at reduced opacity) */}
          <rect
            x={20 + (bars.renderedNeedMinPct / 130) * 350}
            y="30"
            width={((Math.min(bars.needMaxPct, 100) - bars.renderedNeedMinPct) / 130) * 350}
            height="30"
            fill="hsl(var(--primary))"
            className={reduce ? "" : "transition-all duration-500"}
            opacity="0.4"
          />

          {/* Overshoot segment (destructive color) */}
          {bars.renderedOvershootWidth > 0 && (
            <rect
              x={20 + (100 / 130) * 350}
              y="30"
              width={(bars.renderedOvershootWidth / 130) * 350}
              height="30"
              fill="hsl(var(--destructive))"
              className={reduce ? "" : "transition-all duration-500"}
              opacity="0.7"
            />
          )}

          {/* 100% reference line (primary token at low opacity) */}
          <line
            x1={20 + (100 / 130) * 350}
            y1="20"
            x2={20 + (100 / 130) * 350}
            y2="70"
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            strokeDasharray="4,4"
            opacity="0.3"
          />
        </svg>
      </div>

      {/* Annotations (moved out of SVG to HTML) */}
      <ul className="space-y-1 text-xs text-muted-foreground">
        {copy.annotations.map((annotation: string, i: number) => (
          <li key={i}>{annotation}</li>
        ))}
      </ul>

      {/* Status label */}
      <div className="text-sm">
        {bars.overshoot ? (
          <p className="text-destructive font-medium">
            {Math.round(math.overshootWeeks)} {copy.overshootLabel}
          </p>
        ) : (
          <p className="text-primary font-medium">{copy.fitsLabel}</p>
        )}
      </div>
    </div>
  );
}
