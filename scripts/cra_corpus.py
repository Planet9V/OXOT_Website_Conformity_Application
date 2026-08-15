"""
The single CRA reference for Python generators.

Every script that produces material about the Cyber Resilience Act — podcast
scripts, blogs, FAQs, primers, diagrams — must resolve article numbers and
titles through this module instead of typing them.

Roughly 45 of 71 article numbers in this repository were invented before the
corpus was grounded, and 115 wrong citations reached published blog and podcast
material because the generators that wrote them consulted nothing.

    from cra_corpus import cite, article_title, check_text

    cite(13)            -> 'Article 13 (Obligations of manufacturers)'
    article_title(64)   -> 'Penalties'
    check_text(body)    -> raises CitationError on a wrong citation

Source of truth: docs/cra_statutory_corpus/02_articles_full.json, built from the
Official Journal by scripts/build_cra_corpus_from_eurlex.mjs and verified by
scripts/verify_cra_corpus.mjs. See docs/cra-personas/CRA_SOURCE_OF_TRUTH.md.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent
_CORPUS = _ROOT / "docs/cra_statutory_corpus/02_articles_full.json"


class CitationError(ValueError):
    """Raised when generated text cites the CRA incorrectly."""


def _load() -> dict:
    if not _CORPUS.exists():
        raise FileNotFoundError(
            f"CRA corpus not found at {_CORPUS}. "
            "Run: node scripts/build_cra_corpus_from_eurlex.mjs"
        )
    return json.loads(_CORPUS.read_text(encoding="utf-8"))


_DATA = _load()
_ARTICLES = {
    a["articleNumber"]: a for c in _DATA["chapters"] for a in c["articles"]
}
MAX_ARTICLE = max(_ARTICLES)

REGULATION = _DATA["regulation"]
OJ_REFERENCE = _DATA["officialJournalReference"]
CELEX = _DATA["celex"]
CORRIGENDA = _DATA.get("corrigenda", [])

#: Concept -> governing article(s), mirroring scripts/check_citations.mjs.
#: Some concepts are genuinely split: Art. 21 covers an importer or distributor
#: who substantially modifies, Art. 22 covers any other person. Both are right.
CONCEPT_ARTICLES: dict[str, list[int]] = {
    "manufacturer obligations": [13],
    "reporting obligations": [14],
    "authorised representative": [18],
    "importer obligations": [19],
    "distributor obligations": [20],
    "substantial modification": [21, 22],
    "identification of economic operators": [23],
    "open-source steward obligations": [24],
    "presumption of conformity": [27],
    "EU declaration of conformity": [28],
    "CE marking": [29, 30],
    "technical documentation": [31],
    "conformity assessment procedures": [32],
    "penalties": [64],
}

_CONCEPT_PATTERNS: list[tuple[str, re.Pattern, list[int], list[int]]] = [
    ("manufacturer obligations", re.compile(r"obligations of manufacturers|manufacturer obligations", re.I), [13], [10]),
    ("authorised representative", re.compile(r"authorised representative", re.I), [18], [12]),
    ("importer obligations", re.compile(r"obligations of importers|importer obligations", re.I), [19], [17]),
    ("distributor obligations", re.compile(r"obligations of distributors|distributor obligations|duty to refrain", re.I), [20], [18]),
    ("substantial modification", re.compile(r"substantial(?:ly)? modif", re.I), [21, 22], [20]),
    ("open-source steward obligations", re.compile(r"open[- ]source software steward|steward obligations", re.I), [24], [16, 33]),
    ("presumption of conformity", re.compile(r"presumption of conformity", re.I), [27], [24, 34]),
    ("EU declaration of conformity", re.compile(r"EU declaration of conformity", re.I), [28], [22]),
    ("CE marking", re.compile(r"CE marking", re.I), [29, 30], [22, 23]),
    ("technical documentation", re.compile(r"technical documentation", re.I), [31], [27]),
    ("conformity assessment procedures", re.compile(r"conformity assessment procedure", re.I), [32], [28]),
    ("penalties", re.compile(r"penalt(?:y|ies)|administrative fine|\bfines?\b", re.I), [64], [61]),
]

_CITE = re.compile(r"\bArt(?:icle|\.)\s*(\d{1,3})\b", re.I)
#: Article numbers on these lines belong to another instrument, not the CRA.
_OTHER_INSTRUMENT = re.compile(
    r"NIS2|2022/2555|2019/1020|2019/881|765/2008|1182/71|IEC|ETSI|ISO|GDPR|2016/679|AI Act|2024/1689|Machinery|2023/1230|RED|2014/53",
    re.I,
)


def article_title(number: int) -> str:
    """The article's title exactly as published in the Official Journal."""
    art = _ARTICLES.get(number)
    if art is None:
        raise CitationError(
            f"Article {number} does not exist — the CRA has {MAX_ARTICLE} articles."
        )
    return art["title"]


def cite(number: int) -> str:
    """A citation that cannot be wrong: 'Article 13 (Obligations of manufacturers)'."""
    return f"Article {number} ({article_title(number)})"


def articles_for(concept: str) -> list[int]:
    """The article(s) governing a concept, e.g. 'substantial modification' -> [21, 22]."""
    try:
        return CONCEPT_ARTICLES[concept]
    except KeyError:
        raise CitationError(
            f"Unknown concept {concept!r}. Known: {', '.join(sorted(CONCEPT_ARTICLES))}"
        ) from None


def find_citation_errors(text: str) -> list[str]:
    """Return a human-readable problem for each bad CRA citation in `text`."""
    problems: list[str] = []
    for lineno, line in enumerate(text.splitlines(), 1):
        cited = [int(m.group(1)) for m in _CITE.finditer(line)]
        if not cited:
            continue
        if _OTHER_INSTRUMENT.search(line):
            continue
        for n in cited:
            if n < 1 or n > MAX_ARTICLE:
                problems.append(
                    f"line {lineno}: Article {n} does not exist "
                    f"(the CRA has {MAX_ARTICLE} articles)"
                )
        for name, pattern, governing, wrong in _CONCEPT_PATTERNS:
            if not pattern.search(line):
                continue
            if any(n in cited for n in governing):
                continue
            bad = [n for n in cited if n in wrong]
            if bad:
                right = " or ".join(f"Article {n} ({article_title(n)})" for n in governing)
                problems.append(
                    f"line {lineno}: {name!r} is governed by {right}, "
                    f"not Article {'/'.join(map(str, bad))}"
                )
    return problems


def check_text(text: str, *, source: str = "generated text") -> str:
    """
    Validate before writing. Raises CitationError listing every problem.

    Call this in a generator's write path so a wrong citation never reaches
    disk — the gate belongs at the point of production, not only in CI.
    """
    problems = find_citation_errors(text)
    if problems:
        raise CitationError(
            f"{len(problems)} CRA citation problem(s) in {source}:\n  "
            + "\n  ".join(problems)
            + "\n\nResolve numbers with cra_corpus.cite(n) rather than typing them."
        )
    return text


def write_checked(path, text: str) -> None:
    """Write a file only if its CRA citations are correct."""
    p = Path(path)
    check_text(text, source=str(p))
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    print(f"{REGULATION} — {OJ_REFERENCE} (CELEX {CELEX})")
    for c in CORRIGENDA:
        print(f"  corrected by {c['ojRef']} — Art. {c['article']}({c['paragraph']})")
    print(f"  {len(_ARTICLES)} articles loaded\n")
    for concept, nums in CONCEPT_ARTICLES.items():
        print(f"  {'/'.join(map(str, nums)):>5} — {concept}")
