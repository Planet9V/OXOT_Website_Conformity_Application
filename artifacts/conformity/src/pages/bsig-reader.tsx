import { useMemo, useState } from "react";
import { Link } from "wouter";
import { bsigSectionsData, bsigAnlagenData } from "@/data/bsigCorpusData";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BookOpen, ArrowLeft, Landmark } from "lucide-react";

/**
 * The BSI-Gesetz reader (task 9.4b / W2.4 DE) — the core of the German NIS2
 * transposition, verbatim, through the same reproducible pipeline as the
 * CRA, NIS2 and Cbw corpora.
 *
 * Unlike its siblings this corpus is built from the CONSOLIDATED
 * gesetze-im-internet.de text, not the promulgation — a recorded decision,
 * because the promulgation is an Artikelgesetz published as PDF only and
 * the BSIG has already been amended since; the consolidated text is what
 * binds today. The banner discloses that, shows the verbatim amendment
 * trail, and names the authentic promulgation underneath it.
 *
 * The text is German and stays German: no official English translation
 * exists, and this application will not paraphrase or translate statute.
 */

type Mode = "paragrafen" | "anlagen";

export default function BsigReaderPage() {
  const [mode, setMode] = useState<Mode>("paragrafen");
  const [query, setQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<string>("32");
  const [selectedAnlage, setSelectedAnlage] = useState<string>("Anlage 1");

  const q = query.trim().toLowerCase();

  const sections = useMemo(
    () =>
      q
        ? bsigSectionsData.sections.filter(
            (s: any) =>
              s.title.toLowerCase().includes(q) || s.text.toLowerCase().includes(q),
          )
        : bsigSectionsData.sections,
    [q],
  );
  const anlagen = bsigAnlagenData.anlagen;

  const section = bsigSectionsData.sections.find((s: any) => s.section === selectedSection);
  const anlage = anlagen.find((a: any) => a.label === selectedAnlage);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link href="/library" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Library
      </Link>
      <div className="border-b border-border pb-6">
        <span className="oxot-kicker block mb-1">REFERENCE · VERBATIM CONSOLIDATED TEXT (DE)</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foreground flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-primary shrink-0" /> BSI-Gesetz
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
          Enacted by Artikel 1 NIS2UmsuCG ({bsigSectionsData.fundstelle}) · in force{" "}
          {bsigSectionsData.entryIntoForce}. §§ 1–{bsigSectionsData.lastSection},{" "}
          {bsigSectionsData.anlagenCount} Anlagen — reproduced from the committed
          gesetze-im-internet.de source and verified byte-for-byte in CI.
        </p>
      </div>

      {/* The consolidation posture — disclosed, with its amendment trail. */}
      <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-4 text-sm text-muted-foreground space-y-2">
        <div className="flex gap-3">
          <Landmark className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p>
            <span className="font-medium text-foreground">
              This is the core of the German transposition of NIS2 ({bsigSectionsData.transposes}).
            </span>{" "}
            It is the CONSOLIDATED text from gesetze-im-internet.de — not the authentic
            promulgation ({bsigSectionsData.authenticPromulgation.split(",")[0]}, PDF) —
            because the law has already been amended since promulgation; the consolidated
            text is what binds today. Shown in German, verbatim: no official English
            translation exists, and this application will not paraphrase or translate
            statutory text. The NIS2UmsuCG's further Artikel amend other federal laws and
            are not included here. For the directive itself, read the{" "}
            <Link href="/library/nis2" className="text-primary hover:underline">
              NIS2 reader
            </Link>
            ; for the Dutch transposition, the{" "}
            <Link href="/library/cbw" className="text-primary hover:underline">
              Cyberbeveiligingswet
            </Link>
            .
          </p>
        </div>
        <ul className="pl-7 text-xs space-y-0.5">
          {bsigSectionsData.standangabe.map((s: any, i: number) => (
            <li key={i} className="font-mono">
              {s.typ}: {s.kommentar}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {(["paragrafen", "anlagen"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium capitalize border",
                mode === m ? "bg-primary/15 border-primary/40 text-primary" : "border-border text-muted-foreground",
              )}
            >
              {m === "paragrafen" ? "Paragrafen" : "Anlagen"}
            </button>
          ))}
        </div>
        <Input
          className="h-8 text-xs max-w-xs"
          placeholder="Im Wortlaut suchen…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        <nav className="max-h-[70vh] overflow-y-auto rounded-xl border border-border/60 divide-y divide-border/40">
          {mode === "paragrafen" &&
            sections.map((s: any) => (
              <button
                key={s.section}
                onClick={() => setSelectedSection(s.section)}
                className={cn(
                  "w-full text-left px-3 py-2 text-xs hover:bg-muted/40",
                  selectedSection === s.section && "bg-primary/10 text-primary",
                )}
              >
                <span className="font-mono">{s.label}</span> — {s.title}
              </button>
            ))}
          {mode === "anlagen" &&
            anlagen.map((a: any) => (
              <button
                key={a.label}
                onClick={() => setSelectedAnlage(a.label)}
                className={cn(
                  "w-full text-left px-3 py-2 text-xs hover:bg-muted/40",
                  selectedAnlage === a.label && "bg-primary/10 text-primary",
                )}
              >
                <span className="font-mono">{a.label}</span> — {a.title}
              </button>
            ))}
        </nav>

        <article className="max-h-[70vh] overflow-y-auto rounded-xl border border-border/60 p-5 space-y-3" data-testid="bsig-reader-body">
          {mode === "paragrafen" && section && (
            <>
              <Badge variant="outline" className="font-mono text-[10px]">
                BSIG {section.label}
                {section.gliederung.length ? ` · ${section.gliederung.join(" · ")}` : ""}
              </Badge>
              <h2 className="text-xl font-serif text-foreground">{section.title}</h2>
              <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">
                {section.text}
              </p>
            </>
          )}
          {mode === "anlagen" && anlage && (
            <>
              <Badge variant="outline" className="font-mono text-[10px]">BSIG {anlage.label}</Badge>
              <h2 className="text-xl font-serif text-foreground">{anlage.title}</h2>
              <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap font-mono text-xs">
                {anlage.text}
              </p>
            </>
          )}
        </article>
      </div>
    </div>
  );
}
