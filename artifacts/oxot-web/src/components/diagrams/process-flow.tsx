/**
 * A horizontal process-flow diagram (Phase 26) — numbered nodes on a
 * connecting rail, the final node accented. Theme-safe; scrolls on narrow
 * screens rather than breaking the page. Used for the CRA Transit phases.
 */
export function ProcessFlow({ steps }: { steps: string[] }) {
  return (
    <div className="overflow-x-auto pb-2">
      <ol className="flex min-w-max items-start gap-0 px-1">
        {steps.map((label, i) => {
          const last = i === steps.length - 1;
          return (
            <li key={label} className="flex items-start">
              <div className="flex w-28 flex-col items-center text-center md:w-32">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-mono text-sm font-semibold ${
                    last
                      ? 'bg-primary text-primary-foreground'
                      : 'border-2 border-primary/40 bg-primary/[0.06] text-primary-ink'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="mt-2 text-xs font-medium leading-tight text-foreground">{label}</span>
              </div>
              {!last && (
                <div className="mt-5 h-0.5 w-6 shrink-0 rounded-full bg-border md:w-8" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
