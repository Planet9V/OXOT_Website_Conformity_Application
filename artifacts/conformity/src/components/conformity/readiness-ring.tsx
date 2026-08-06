import { useEffect, useState } from "react";
import type { ConformityGrade } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { ShieldAlert } from "lucide-react";
import { TermHint } from "@/components/conformity/glossary-dialog";

/** Grade letter → ring + text colour (matches gradeClass palette in lib/conformity). */
function gradeColor(letter: string): { ring: string; text: string } {
  switch (letter) {
    case "A":
      return { ring: "text-green-500", text: "text-green-600" };
    case "B":
      return { ring: "text-lime-500", text: "text-lime-600" };
    case "C":
      return { ring: "text-amber-500", text: "text-amber-600" };
    case "D":
      return { ring: "text-orange-500", text: "text-orange-600" };
    default:
      return { ring: "text-red-500", text: "text-red-600" };
  }
}

/**
 * Circular readiness gauge. Shows the computed grade + score, or an unscored
 * placeholder. Blockers are surfaced inline because they cap the grade — a high
 * ring with blockers is never "safe".
 */
export function ReadinessRing({
  grade,
  size = 132,
  strokeWidth = 10,
}: {
  grade: ConformityGrade | null | undefined;
  size?: number;
  strokeWidth?: number;
}) {
  const scored = !!grade;
  const score = grade?.overallScore ?? 0;
  const letter = grade?.overallGrade ?? "";
  const blockerCount = grade?.blockerCount ?? 0;
  const blocked = blockerCount > 0;
  const pct = Math.max(0, Math.min(100, score));

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Animate the sweep from empty to the target whenever the score changes
  // (including when the grade first loads). Reduced motion jumps via CSS.
  const [shownPct, setShownPct] = useState(0);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setShownPct(pct));
    return () => cancelAnimationFrame(raf);
  }, [pct]);
  const dashoffset = circumference * (1 - shownPct / 100);

  const colors = scored
    ? gradeColor(letter)
    : { ring: "text-muted-foreground", text: "text-muted-foreground" };

  const ariaLabel = scored
    ? `Readiness score ${pct} out of 100, grade ${letter}${
        blocked ? `, ${blockerCount} blocker${blockerCount === 1 ? "" : "s"}` : ""
      }`
    : "Readiness not scored yet";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={ariaLabel}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="text-muted-foreground/15"
          stroke="currentColor"
        />
        {scored && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            className={cn(
              colors.ring,
              "transition-[stroke-dashoffset] duration-1000 ease-out motion-reduce:transition-none",
            )}
            stroke="currentColor"
          />
        )}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <TermHint terms={["grade", "readiness"]} className="flex flex-col items-center">
          {scored ? (
            <>
              <div className={cn("text-3xl font-bold leading-none", colors.text)}>{letter}</div>
              <div className="mt-1 font-mono text-sm tabular-nums text-muted-foreground">{pct}%</div>
              {blocked && (
                <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-red-600">
                  <ShieldAlert className="h-3 w-3" />
                  {blockerCount} blocker{blockerCount === 1 ? "" : "s"}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-2xl font-bold leading-none text-muted-foreground">—</div>
              <div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                Not scored
              </div>
            </>
          )}
        </TermHint>
      </div>
    </div>
  );
}
