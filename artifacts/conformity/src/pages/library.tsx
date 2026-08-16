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
      "Regulation (EU) 2024/2847 as published — 71 articles, 130 recitals, 8 annexes — reproduced from the Official Journal source and verified byte-for-byte in CI.",
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
      "Directive (EU) 2022/2555 as published — 46 articles, 144 recitals — from the same reproducible Official Journal pipeline as the CRA reader. States plainly that no national transposition measure is loaded yet.",
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
