import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GLOSSARY, getGlossaryEntry, type GlossaryEntry } from "@/lib/glossary";
import { BookOpen, Scale, Wrench } from "lucide-react";

function EntryRow({ entry }: { entry: GlossaryEntry }) {
  return (
    <div data-testid={`glossary-entry-${entry.key}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-semibold">{entry.term}</span>
        {entry.citation && (
          <Badge variant="outline" className="rounded-md font-mono text-[10px]">
            {entry.citation}
          </Badge>
        )}
      </div>
      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{entry.definition}</p>
    </div>
  );
}

/**
 * The workbench glossary: statutory CRA concepts (with citations) kept visibly
 * separate from concepts this tool invented to organise the work.
 */
export function GlossaryDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const statutory = GLOSSARY.filter((e) => e.basis === "statutory");
  const workbench = GLOSSARY.filter((e) => e.basis === "workbench");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-md max-w-2xl max-h-[85dvh] flex flex-col" data-testid="glossary-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Glossary
          </DialogTitle>
          <DialogDescription>
            Statutory terms cite the Cyber Resilience Act (Regulation (EU) 2024/2847). Workbench
            terms are this tool&apos;s own concepts — labelled so the two are never confused.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto pr-1 space-y-6 min-h-0">
          <section>
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              <Scale className="w-3.5 h-3.5" /> Statutory concepts
            </div>
            <div className="mt-3 space-y-4">
              {statutory.map((e) => (
                <EntryRow key={e.key} entry={e} />
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              <Wrench className="w-3.5 h-3.5" /> Workbench concepts
            </div>
            <div className="mt-3 space-y-4">
              {workbench.map((e) => (
                <EntryRow key={e.key} entry={e} />
              ))}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Inline term affordance: dotted-underlined text that opens a small popover
 * with the relevant glossary entries, plus a jump into the full glossary.
 * Wrap existing label text — it must not change the visible wording.
 */
export function TermHint({
  terms,
  children,
  className,
}: {
  terms: string[];
  children: ReactNode;
  className?: string;
}) {
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const entries = terms
    .map(getGlossaryEntry)
    .filter((e): e is GlossaryEntry => e !== undefined);

  if (entries.length === 0) return <>{children}</>;

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "cursor-help rounded-sm underline decoration-dotted decoration-muted-foreground/60 underline-offset-4 hover:decoration-foreground transition-colors",
              className,
            )}
            data-testid={`term-hint-${terms[0]}`}
          >
            {children}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 space-y-3" align="start">
          {entries.map((e) => (
            <div key={e.key}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold">{e.term}</span>
                {e.citation && (
                  <Badge variant="outline" className="rounded-md font-mono text-[10px]">
                    {e.citation}
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{e.definition}</p>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-md"
            onClick={() => setGlossaryOpen(true)}
            data-testid="term-hint-open-glossary"
          >
            <BookOpen className="w-3.5 h-3.5 mr-2" /> Open full glossary
          </Button>
        </PopoverContent>
      </Popover>
      <GlossaryDialog open={glossaryOpen} onOpenChange={setGlossaryOpen} />
    </>
  );
}
