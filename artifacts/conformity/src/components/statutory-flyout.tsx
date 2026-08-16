import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { X, Scale, BookOpen } from "lucide-react";
import { articlesData, recitalsData, annexesData } from "@/data/craCorpusData";

/**
 * The universal statutory flyout (task 7.6b) — the Library's second mode:
 * the law at the point of use. Born in partner-hub, extracted here so any
 * surface can open the verbatim text of a CRA article, recital or annex
 * without leaving its work.
 *
 * Verbatim only: the flyout renders the Official Journal text and nothing
 * else — no commentary, no paraphrase. CRA only for now, because the CRA is
 * the only act whose full text ships in the frontend bundle; a citation to
 * another act simply does not get a flyout rather than getting a lookalike.
 */

type StatuteRef =
  | { type: "article"; number: number }
  | { type: "recital"; number: number }
  | { type: "annex"; number: string };

const FlyoutContext = createContext<{ open: (ref: StatuteRef) => void } | null>(null);

export function useStatutoryFlyout() {
  const ctx = useContext(FlyoutContext);
  if (!ctx) throw new Error("useStatutoryFlyout must be used inside StatutoryFlyoutProvider");
  return ctx;
}

/**
 * An inline citation that opens the flyout. Renders the instrument name with
 * the number so the citation gate (and the reader) always know which act.
 */
export function Cite({
  article,
  recital,
  annex,
  children,
}: {
  article?: number;
  recital?: number;
  annex?: string;
  children?: ReactNode;
}) {
  const { open } = useStatutoryFlyout();
  const ref: StatuteRef | null =
    article != null
      ? { type: "article", number: article }
      : recital != null
        ? { type: "recital", number: recital }
        : annex != null
          ? { type: "annex", number: annex }
          : null;
  if (!ref) return null;
  const label =
    children ??
    (ref.type === "article"
      ? `CRA Art. ${ref.number}`
      : ref.type === "recital"
        ? `CRA Recital ${ref.number}`
        : `CRA Annex ${ref.number}`);
  return (
    <button
      type="button"
      onClick={() => open(ref)}
      className="text-primary underline decoration-dotted underline-offset-2 hover:decoration-solid cursor-pointer"
      data-testid="statute-cite"
    >
      {label}
    </button>
  );
}

export function StatutoryFlyoutProvider({ children }: { children: ReactNode }) {
  const [ref, setRef] = useState<StatuteRef | null>(null);
  const open = useCallback((r: StatuteRef) => setRef(r), []);

  const content = useMemo(() => {
    if (!ref) return null;
    if (ref.type === "article") {
      for (const ch of articlesData.chapters) {
        const a = ch.articles.find((x: any) => x.articleNumber === ref.number);
        if (a) return { kind: "article" as const, a };
      }
      return null;
    }
    if (ref.type === "recital") {
      const r = recitalsData.recitals.find((x: any) => x.number === ref.number);
      return r ? { kind: "recital" as const, r } : null;
    }
    const an = (annexesData as any).annexes?.find((x: any) => x.annexNumber === ref.number);
    return an ? { kind: "annex" as const, an } : null;
  }, [ref]);

  return (
    <FlyoutContext.Provider value={{ open }}>
      {children}
      {ref && (
        <div
          className="fixed inset-0 z-[60] flex justify-end bg-black/50 backdrop-blur-xs"
          onClick={() => setRef(null)}
          data-testid="statutory-flyout"
        >
          <div
            className="w-full max-w-md bg-card border-l border-border h-full shadow-2xl p-6 overflow-y-auto space-y-4 animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs font-bold uppercase text-primary">
                  Regulation (EU) 2024/2847 — verbatim
                </span>
              </div>
              <button
                onClick={() => setRef(null)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!content && (
              <p className="text-sm text-muted-foreground">
                This provision is not in the bundled corpus. Read it in the{" "}
                <Link href="/library/statute" className="text-primary hover:underline">
                  Library
                </Link>
                .
              </p>
            )}

            {content?.kind === "article" && (
              <div className="space-y-3">
                <div className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md inline-block">
                  Article {(content.a as any).articleNumber}
                </div>
                <h3 className="text-base font-serif text-foreground">{(content.a as any).title}</h3>
                <div className="space-y-2.5 text-xs text-foreground/85 leading-relaxed">
                  {((content.a as any).paragraphs ?? []).map((p: any, i: number) => (
                    <p key={i} className="whitespace-pre-wrap">
                      {typeof p === "string" ? p : (p.text ?? "")}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {content?.kind === "recital" && (
              <div className="space-y-3">
                <div className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md inline-block">
                  Recital ({(content.r as any).number})
                </div>
                <p className="text-xs text-foreground/85 leading-relaxed whitespace-pre-wrap">
                  {(content.r as any).text}
                </p>
              </div>
            )}

            {content?.kind === "annex" && (
              <div className="space-y-3">
                <div className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md inline-block">
                  Annex {(content.an as any).annexNumber}
                </div>
                <h3 className="text-base font-serif text-foreground">{(content.an as any).title}</h3>
                <div className="space-y-2.5 text-xs text-foreground/85 leading-relaxed">
                  {((content.an as any).blocks ?? []).map((p: any, i: number) => (
                    <p key={i} className="whitespace-pre-wrap">
                      {typeof p === "string" ? p : (p.text ?? "")}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-border/60">
              <Link
                href="/library/statute"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1.5"
                onClick={() => setRef(null)}
              >
                <BookOpen className="w-3.5 h-3.5" /> Open in the Library
              </Link>
            </div>
          </div>
        </div>
      )}
    </FlyoutContext.Provider>
  );
}
