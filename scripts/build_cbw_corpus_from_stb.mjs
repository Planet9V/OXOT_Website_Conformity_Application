/**
 * Build the Cyberbeveiligingswet corpus from the Staatsblad text.
 *
 * Source: Stb. 2026, 187 — "Wet van 8 juli 2026, houdende regels ter
 *         implementatie van Richtlijn (EU) 2022/2555 (Cyberbeveiligingswet)".
 *         The AUTHENTIC promulgated text, from the official publications
 *         register (zoek.officielebekendmakingen.nl), as structured XML.
 *
 * This is the Dutch NATIONAL TRANSPOSITION of NIS2 (W2.4). The same doctrine
 * as the CRA/NIS2 corpora applies, with two additions:
 *
 * 1. The Staatsblad is the NL analogue of the Official Journal: the
 *    promulgated text, not the consolidated register (wetten.overheid.nl,
 *    BWBR0052872). The law entered into force 2026-08-15 with no amendment,
 *    so the two are substantively identical today; the corpus still builds
 *    from the promulgation so its provenance is the authentic act.
 * 2. The text is DUTCH and stays Dutch. There is no official English
 *    translation, and a translation produced here would be reconstruction —
 *    exactly what the Legal circuit-breaker forbids. Verbatim or nothing.
 *
 * Numbering honesty: an artikel without numbered leden gets paragraphNumber
 * null — the law has no number there and this script never invents one.
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const ROOT = process.cwd();
const CORPUS_DIR = path.join(ROOT, "docs/cbw_statutory_corpus");
const SOURCE_FILE = path.join(CORPUS_DIR, "source/stb-2026-187.xml");
const SOURCE_URL = "https://zoek.officielebekendmakingen.nl/stb-2026-187.xml";

const WET = {
  wet: "Cyberbeveiligingswet",
  shortTitle: "Cbw",
  staatsbladReference: "Stb. 2026, 187",
  /** The consolidated register entry, for cross-reference only. */
  bwbId: "BWBR0052872",
  sourceUrl: SOURCE_URL,
  signed: "2026-07-08",
  entryIntoForce: "2026-08-15",
  language: "nl",
  jurisdiction: "NL",
  instrumentType: "national_transposition",
  transposes: "Directive (EU) 2022/2555",
  /**
   * The distinction that governs every use of this corpus, inverted from the
   * directive's: THIS is the text that binds entities established in the
   * Netherlands. The directive corpus says what Member States must enact;
   * this corpus says what was enacted.
   */
  bindsEntitiesIn: "NL",
};

// Ordered XML parsing is shared with the BSIG builder — the schemas differ,
// the tokenizer does not. The count assertions below plus the verifier's
// verbatim probes check the parse.
import { parseXmlOrdered, children } from "./lib/ordered_xml_parser.mjs";

/** All text inside a preserved-order node list, structure-aware. */
function flatten(nodes) {
  let out = "";
  for (const node of nodes ?? []) {
    for (const [tag, value] of Object.entries(node)) {
      if (tag === ":@") continue;
      if (tag === "#text") {
        out += String(value);
        continue;
      }
      switch (tag) {
        case "al":
          out += (out && !out.endsWith("\n") ? "\n" : "") + flatten(value);
          break;
        case "lijst":
        case "definitielijst":
          out += flatten(value);
          break;
        case "li":
        case "definitie-item": {
          const marker = childText(value, "li.nr");
          const term = childText(value, "term");
          const body = flatten(value.filter((c) => !("li.nr" in c) && !("term" in c)));
          out += `\n${[marker, term, body.trim()].filter(Boolean).join(" ")}`;
          break;
        }
        case "definitie":
          out += flatten(value);
          break;
        case "wat":
          out += (out && !out.endsWith("\n") ? "\n" : "") + flatten(value);
          break;
        case "wijzig-lid": {
          // The marker exactly as printed — the Staatsblad writes "A", not
          // "A." (the parity audit caught an added period here once).
          const letter = childText(value, "lidnr");
          const body = flatten(value.filter((c) => !("lidnr" in c)));
          out += `\n${letter} ${body.trim()}`;
          break;
        }
        case "wijziging": {
          const nr = childText(value, "nr");
          const body = flatten(value.filter((c) => !("nr" in c)));
          out += `\n${nr ? nr + " " : ""}${body.trim()}`;
          break;
        }
        case "artikeltekst":
          // Quoted text of the provision as amended — part of the amendment
          // article's own verbatim text, never a statute article of THIS law.
          out += flatten(value);
          break;
        case "table":
          out += (out ? "\n" : "") + flattenTable(value);
          break;
        case "row": {
          const cells = value
            .filter((c) => "entry" in c)
            .map((c) => flatten(c.entry).replace(/\s+/g, " ").trim());
          out += `\n${cells.join(" | ")}`;
          break;
        }
        case "nadruk":
        case "extref":
        case "intref":
        case "sup":
        case "inf":
          // Inline markup: keep the text, drop the decoration.
          out += flatten(value);
          break;
        case "noot":
          // Editorial footnotes are not part of the article text.
          break;
        default:
          out += flatten(value);
      }
    }
  }
  return out;
}

function flattenTable(nodes) {
  return flatten(nodes).replace(/^\n+/, "");
}

function childText(nodes, tagName) {
  for (const node of nodes ?? []) {
    if (tagName in node) return flatten(node[tagName]).replace(/\s+/g, " ").trim();
  }
  return "";
}


const clean = (s) =>
  s
    .replace(/ /g, " ")
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean)
    .join("\n");

// ── parse ───────────────────────────────────────────────────────────────────

const sourceBytes = fs.readFileSync(SOURCE_FILE);
const xml = sourceBytes.toString("utf8").replace(/^﻿/, "");
const doc = parseXmlOrdered(xml);

function descend(nodes, ...tags) {
  let cur = nodes;
  for (const tag of tags) {
    const next = children(cur, tag);
    if (next.length !== 1) {
      throw new Error(`expected exactly one <${tag}>, found ${next.length}`);
    }
    cur = next[0];
  }
  return cur;
}

const staatsblad = descend(doc, "officiele-publicatie", "staatsblad");
const intitule = clean(flatten(children(staatsblad, "intitule")[0])).replace(/\n/g, " ");
const wetBesluit = descend(staatsblad, "wet-besluit");
const wettekst = descend(wetBesluit, "wettekst");

const considerans = clean(
  flatten(children(descend(wetBesluit, "aanhef"), "considerans")[0] ?? []),
);

const chapters = children(wettekst, "hoofdstuk").map((hoofdstuk, i) => {
  const kop = children(hoofdstuk, "kop")[0];
  const chapterNumber = parseInt(childText(kop, "nr"), 10);
  if (chapterNumber !== i + 1) {
    throw new Error(`hoofdstuk numbering broke at index ${i}: got ${chapterNumber}`);
  }
  const title = childText(kop, "titel");

  // Artikelen sit either directly under the hoofdstuk or inside a
  // <paragraaf> section, and amendment articles (99–105, amending OTHER
  // laws) are <wijzig-artikel>. Quoted provisions inside <artikeltekst> are
  // amendment payload, never statute articles of THIS law. Walk in document
  // order, carrying the section heading so the reader can render it.
  const collect = (nodes, sectionTitle) => {
    const out = [];
    for (const node of nodes) {
      if ("artikel" in node) {
        out.push({ artikel: node.artikel, sectionTitle, amendsOtherLaw: false });
      } else if ("wijzig-artikel" in node) {
        out.push({ artikel: node["wijzig-artikel"], sectionTitle, amendsOtherLaw: true });
      } else if ("paragraaf" in node) {
        const pkop = children(node.paragraaf, "kop")[0];
        const title = pkop
          ? `§ ${childText(pkop, "nr")} ${childText(pkop, "titel")}`.trim()
          : null;
        out.push(...collect(node.paragraaf, title));
      }
    }
    return out;
  };
  const articleNodes = collect(hoofdstuk, null);

  const articles = articleNodes.map(({ artikel, sectionTitle, amendsOtherLaw }) => {
    const akop = children(artikel, "kop")[0];
    const articleNumber = childText(akop, "nr");
    const articleTitle = childText(akop, "titel");
    if (!articleNumber) throw new Error(`artikel without a number in hoofdstuk ${chapterNumber}`);

    const body = artikel.filter((n) => !("kop" in n));
    const leden = children(artikel, "lid");
    let paragraphs;
    if (amendsOtherLaw) {
      // Amendment articles enumerate instructions (A., B., 1., 2.), not
      // numbered leden of this law; keep them as one verbatim block.
      const text = clean(flatten(body));
      if (!text) throw new Error(`empty wijzig-artikel ${articleNumber}`);
      paragraphs = [{ paragraphNumber: null, text }];
    } else if (leden.length > 0) {
      paragraphs = leden.map((lid) => {
        const lidnr = childText(lid, "lidnr").replace(/\.$/, "");
        const text = clean(flatten(lid.filter((n) => !("lidnr" in n))));
        if (!/^\d+$/.test(lidnr)) throw new Error(`bad lidnr "${lidnr}" in artikel ${articleNumber}`);
        if (!text) throw new Error(`empty lid ${lidnr} in artikel ${articleNumber}`);
        return { paragraphNumber: parseInt(lidnr, 10), text };
      });
    } else {
      const text = clean(flatten(body));
      if (!text) throw new Error(`empty artikel ${articleNumber}`);
      // The law numbers no leden here; null says so instead of inventing a 1.
      paragraphs = [{ paragraphNumber: null, text }];
    }

    return {
      // The official number as printed — the law contains an inserted
      // "21a", so this is a string and is never coerced to an integer.
      articleNumber,
      title: articleTitle,
      chapterNumber,
      chapterTitle: title,
      sectionTitle,
      amendsOtherLaw,
      paragraphs,
    };
  });

  return { chapterNumber, label: `HOOFDSTUK ${chapterNumber}`, title, articles };
});

const bijlagen = children(wetBesluit, "bijlage").map((bijlage, i) => {
  const kop = children(bijlage, "kop")[0];
  const number = parseInt(childText(kop, "nr"), 10) || i + 1;
  const text = clean(flatten(bijlage.filter((n) => !("kop" in n))));
  if (!text) throw new Error(`empty bijlage ${number}`);
  return { number, label: `Bijlage ${number}`, text };
});

// ── assertions: fail loudly if the parse drifted from the source ────────────

const allArticles = chapters.flatMap((c) => c.articles);
const totalArticles = allArticles.length;
const expectChapters = (xml.match(/<hoofdstuk[ >]/g) ?? []).length;
const expectBijlagen = (xml.match(/<bijlage[ >]/g) ?? []).length;
if (chapters.length !== expectChapters)
  throw new Error(`parsed ${chapters.length} hoofdstukken, source has ${expectChapters}`);
// Stronger than a tag count (which would double-count provisions QUOTED
// inside amendment articles): the law numbers its articles 1..N with only
// letter-suffixed insertions (21a), so a monotonic base sequence covering
// every integer proves nothing was dropped and nothing was invented.
let prevBase = 0;
for (const a of allArticles) {
  const m = /^(\d+)([a-z]*)$/.exec(a.articleNumber);
  if (!m) throw new Error(`unrecognised article number "${a.articleNumber}" (${a.title})`);
  const base = parseInt(m[1], 10);
  const okStep = base === prevBase + 1 || (base === prevBase && m[2]);
  if (!okStep)
    throw new Error(`article numbering broke after ${prevBase}: got ${a.articleNumber} (${a.title})`);
  prevBase = base;
}
const lastNumber = allArticles[allArticles.length - 1].articleNumber;
if (bijlagen.length !== expectBijlagen)
  throw new Error(`parsed ${bijlagen.length} bijlagen, source has ${expectBijlagen}`);
if (!intitule.includes("Cyberbeveiligingswet") || !intitule.includes("2022/2555"))
  throw new Error("intitule does not look like the Cyberbeveiligingswet");

// ── write ───────────────────────────────────────────────────────────────────

const meta = {
  ...WET,
  fullTitle: intitule,
  builtFrom: "docs/cbw_statutory_corpus/source/stb-2026-187.xml",
  sourceSha256: createHash("sha256").update(sourceBytes).digest("hex"),
  chaptersCount: chapters.length,
  totalArticles,
  lastArticleNumber: lastNumber,
  bijlagenCount: bijlagen.length,
};

const write = (name, data) =>
  fs.writeFileSync(path.join(CORPUS_DIR, name), JSON.stringify(data, null, 2) + "\n");

write("01_articles_full.json", { ...meta, considerans, chapters });
write("02_bijlagen_full.json", { ...meta, bijlagen });

console.log(
  `Cbw corpus built: ${chapters.length} hoofdstukken, ${totalArticles} artikelen, ${bijlagen.length} bijlagen (source sha256 ${meta.sourceSha256.slice(0, 12)}…)`,
);
