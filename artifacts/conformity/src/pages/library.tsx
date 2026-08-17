import { Link } from "wouter";
import { BookOpen, Book, ListTree, Layers, Grid3x3, Database, ArrowRight } from "lucide-react";

/**
 * The Library destination (task 7.6) — one place for the law and the
 * reference layer. Two modes by design (D13): read linearly to learn, or
 * meet the law at the point of use (the statutory flyout — its universal
 * rollout is 7.6b; until then it lives where it was born, in the product
 * pipeline pages).
 *
 * The nine standalone reference pages now live UNDER this destination and
 * their old top-level routes redirect here — one destination, not a wing of
 * the navigation.
 */

const SECTIONS: {
  href: string;
  title: string;
  description: string;
  icon: typeof Book;
}[] = [
  {
    href: "/library/statute",
    title: "The CRA, verbatim",
    description:
      "Regulation (EU) 2024/2847 with its EN corrigenda applied — 71 articles, 130 recitals, 8 annexes — reproduced from the Official Journal source and verified character-exact in CI.",
    icon: BookOpen,
  },
  {
    href: "/library/acts",
    title: "Acts in scope",
    description:
      "Every regulation the reference layer covers — CRA, NIS2, AI Act, Machinery, IEC 62443 and more — with each act's requirement set browsable from the API-driven catalogue.",
    icon: Book,
  },
  {
    href: "/library/nis2",
    title: "NIS2, verbatim",
    description:
      "Directive (EU) 2022/2555 with its EN corrigendum applied — 46 articles, 144 recitals, 3 annexes — from the same reproducible Official Journal pipeline as the CRA reader. The Dutch and German transpositions are loaded (below); other Member States' measures are not.",
    icon: BookOpen,
  },
  {
    href: "/library/cbw",
    title: "Cyberbeveiligingswet, verbatim (NL)",
    description:
      "The Dutch NIS2 transposition as promulgated — Stb. 2026, 187, in force 15 August 2026 — 111 artikelen in 16 hoofdstukken, in Dutch, from the same reproducible pipeline. This is the text that binds entities established in the Netherlands.",
    icon: BookOpen,
  },
  {
    href: "/library/bsig",
    title: "BSI-Gesetz, verbatim (DE)",
    description:
      "The core of the German NIS2 transposition — enacted by Artikel 1 NIS2UmsuCG (BGBl. 2025 I Nr. 301), §§ 1–66 plus 2 Anlagen, in German. Consolidated text, deliberately: the law has already been amended, and the reader shows the verbatim amendment trail.",
    icon: BookOpen,
  },
  {
    href: "/library/ai-act",
    title: "AI Act, verbatim (as amended)",
    description:
      "Regulation (EU) 2024/1689 as amended by the Digital Omnibus (Regulation (EU) 2026/1744) — 119 articles, 180 recitals, 14 annexes — built from the EUR-Lex consolidated text, recitals from the original OJ publication, verified character-exact in CI.",
    icon: BookOpen,
  },
  {
    href: "/library/machinery",
    title: "Machinery Regulation, verbatim (as amended)",
    description:
      "Regulation (EU) 2023/1230 as amended (emergency procedures chapter IVa; the Digital Omnibus) with its corrigendum date fixes — 59 articles, 86 recitals, 12 annexes — from the EUR-Lex consolidated text, verified character-exact in CI.",
    icon: BookOpen,
  },
  {
    href: "/library/red",
    title: "Radio Equipment Directive, verbatim (as amended)",
    description:
      "Directive 2014/53/EU as amended (common charger, chapter Va and more) — 58 articles, 75 recitals, 9 annexes — from the EUR-Lex consolidated text, with Delegated Regulation (EU) 2022/30 shown verbatim on the same page. A directive: national transposition governs and none is loaded.",
    icon: BookOpen,
  },
  {
    href: "/library/gdpr",
    title: "GDPR, verbatim (corrigenda applied)",
    description:
      "Regulation (EU) 2016/679 — 99 articles, 173 recitals — the authentic OJ text with the English corrigendum of 23 May 2018 applied (19 corrections, each a documented must-fire substitution), verified character-exact in CI.",
    icon: BookOpen,
  },
  {
    href: "/library/data-act",
    title: "Data Act, verbatim (corrigenda applied)",
    description:
      "Regulation (EU) 2023/2854 — 50 articles, 120 recitals — the authentic OJ text with its English corrigendum applied. Chapter II binds manufacturers of connected products directly (data access by design).",
    icon: BookOpen,
  },
  {
    href: "/library/requirements",
    title: "Requirement catalogue",
    description:
      "The unified requirement set across all seeded acts, each requirement carrying its citation, theme and the roles it binds.",
    icon: ListTree,
  },
  {
    href: "/library/themes",
    title: "Themes",
    description:
      "The act-independent vocabulary — incident reporting, secure by design, vulnerability handling — that routing, mapping and the role-scoped home all key on.",
    icon: Layers,
  },
  {
    href: "/library/mappings",
    title: "Cross-regulation matrix",
    description:
      "Where one act's requirement answers another's — and where it does not. Overlap is shown per requirement, never claimed wholesale.",
    icon: Grid3x3,
  },
  {
    href: "/library/sources",
    title: "Sources",
    description:
      "The underlying legal source documents the reference layer was built from, viewable as ingested.",
    icon: Database,
  },
];

export default function LibraryPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-border pb-6">
        <span className="oxot-kicker block mb-1">REFERENCE · THE LAW, IN ONE PLACE</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foreground flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-primary shrink-0" /> Library
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
          Read the statutes linearly, or browse the reference layer that every surface in
          this application cites. Nothing here is paraphrase presented as law: the CRA
          reader is the Official Journal text, and every citation in the app must resolve
          against it.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group rounded-2xl border border-border/70 bg-card p-5 hover:border-primary/50 transition-colors flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <s.icon className="w-5 h-5 text-primary" />
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h2 className="text-base font-serif text-foreground">{s.title}</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
