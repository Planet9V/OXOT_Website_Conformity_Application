/**
 * Builds the corpus for Commission Delegated Regulation (EU) 2022/30 — the
 * act that designates WHICH radio equipment carries the RED Art 3(3)(d)/(e)/
 * (f) cybersecurity essential requirements (task 13.1).
 *
 * Three committed sources, one text:
 *
 * - CELEX 32022R0030 — the base act as published (OJ L 7, 12.1.2022).
 * - CELEX 32023R2444 — amends Art 3 (application deferred to 1 August 2025)
 *   and corrects the Art 1(2) introductory wording. Applied here as
 *   DOCUMENTED AMENDMENTS, CRA-corrigendum style: from/to verbatim, quoted
 *   provenance, and the build FAILS if either replacement stops firing.
 * - CELEX 32026R0339 — repeals 2022/30 "with effect from 11 December 2027"
 *   because the CRA's Annex I includes all the elements of the three
 *   essential requirements. Carried as repeal metadata; the quote is
 *   verified verbatim against the committed repealing act.
 *
 * A Bulgarian-language corrigendum (32022R0030R(01)) does not touch the EN
 * text — recorded, not applied.
 *
 * The articles of 2022/30 carry no titles in the OJ; none are invented.
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import {
  parseRecitals,
  parseArticles,
  referencedArticles,
} from "./lib/eu_oj_parser.mjs";

const ROOT = process.cwd();
const CORPUS = path.join(ROOT, "docs/red_delegated_2022_30");
const BASE = path.join(CORPUS, "source/CELEX_32022R0030_EN.html");
const AMENDING = path.join(CORPUS, "source/CELEX_32023R2444_EN.html");
const REPEALING = path.join(CORPUS, "source/CELEX_32026R0339_EN.html");

const sha = (b) => createHash("sha256").update(b).digest("hex");
const flat = (s) => s.replace(/\s+/g, " ");

const EXPECTED = { recitals: 19, articles: 3 };

/**
 * The two replacements made by Delegated Regulation (EU) 2023/2444. The
 * `from`/`to` strings are applied to corpus paragraph text (the OJ's own
 * quoted replacement carries the "2." paragraph marker, which the parser
 * stores as paragraphNumber — `quoted` keeps the marker for source-anchoring,
 * `from`/`to` drop it for application).
 */
const AMENDMENTS = [
  {
    act: "Commission Delegated Regulation (EU) 2023/2444",
    celex: "32023R2444",
    eli: "http://data.europa.eu/eli/reg_del/2023/2444/oj",
    provision: "Article 1 — Amendment to Delegated Regulation (EU) 2022/30",
    note: "Defers the date of application from 1 August 2024 to 1 August 2025 (harmonised standards for the three cybersecurity essential requirements were not ready).",
    article: 3,
    quoted: "‘It shall apply from 1 August 2025.’",
    from: "It shall apply from 1 August 2024.",
    to: "It shall apply from 1 August 2025.",
  },
  {
    act: "Commission Delegated Regulation (EU) 2023/2444",
    celex: "32023R2444",
    eli: "http://data.europa.eu/eli/reg_del/2023/2444/oj",
    provision: "Article 2 — Correction to Delegated Regulation (EU) 2022/30",
    note: "Corrects the Art 1(2) introductory wording: 'traffic data and location data' becomes 'traffic data or location data'.",
    article: 1,
    quoted:
      "‘2. The essential requirement set out in Article 3(3), point (e), of Directive 2014/53/EU shall apply to any of the following radio equipment, if that radio equipment is capable of processing, within the meaning of Article 4(2) of Regulation (EU) 2016/679, personal data, as defined in Article 4(1) of Regulation (EU) 2016/679, or traffic data or location data, as defined in Article 2, points (b) and (c), of Directive 2002/58/EC:’",
    from: "The essential requirement set out in Article 3(3), point (e), of Directive 2014/53/EU shall apply to any of the following radio equipment, if that radio equipment is capable of processing, within the meaning of Article 4(2) of Regulation (EU) 2016/679, personal data, as defined in Article 4(1) of Regulation (EU) 2016/679, or traffic data and location data, as defined in Article 2, points (b) and (c), of Directive 2002/58/EC:",
    to: "The essential requirement set out in Article 3(3), point (e), of Directive 2014/53/EU shall apply to any of the following radio equipment, if that radio equipment is capable of processing, within the meaning of Article 4(2) of Regulation (EU) 2016/679, personal data, as defined in Article 4(1) of Regulation (EU) 2016/679, or traffic data or location data, as defined in Article 2, points (b) and (c), of Directive 2002/58/EC:",
  },
];

const REPEAL = {
  act: "Commission Delegated Regulation (EU) 2026/339",
  celex: "32026R0339",
  eli: "http://data.europa.eu/eli/reg_del/2026/339/oj",
  adopted: "2026-02-16",
  withEffectFrom: "2027-12-11",
  articleQuote: "Delegated Regulation (EU) 2022/30 is repealed with effect from 11 December 2027.",
  reasonQuote:
    "The essential cybersecurity requirements set out in Annex I to Regulation (EU) 2024/2847 include all the elements of the essential requirements referred to in Article 3(3), points (d), (e) and (f), of Directive 2014/53/EU.",
};

const TAGS = [
  ["internet", "internet_connected"],
  ["personal data", "personal_data"],
  ["fraud", "fraud"],
  ["network", "network_protection"],
  ["toy", "toys"],
  ["childcare", "childcare"],
  ["wearable", "wearables"],
];
const tagsFor = (text) => TAGS.filter(([kw]) => text.toLowerCase().includes(kw)).map(([, t]) => t);

function main() {
  const html = fs.readFileSync(BASE, "utf8");
  const amendingHtml = fs.readFileSync(AMENDING, "utf8");
  const repealingHtml = fs.readFileSync(REPEALING, "utf8");

  // Provenance anchors: every quoted string must exist VERBATIM in the
  // committed source it is attributed to. No memory, no paraphrase.
  for (const a of AMENDMENTS) {
    if (!flat(amendingHtml.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").includes(flat(a.quoted).replace(/\s+/g, " ")) &&
        !flat(amendingHtml).includes(flat(a.quoted))) {
      // Tags may split the quote — compare tag-stripped, whitespace-collapsed.
      const plain = flat(amendingHtml.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");
      if (!plain.includes(flat(a.quoted).replace(/\s+/g, " "))) {
        throw new Error(`amendment quote not found verbatim in ${a.celex}: ${a.provision}`);
      }
    }
  }
  const repealPlain = flat(repealingHtml.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");
  if (!repealPlain.includes(REPEAL.articleQuote)) {
    throw new Error("repeal quote not found verbatim in the committed 32026R0339 source");
  }
  if (!repealPlain.includes(REPEAL.reasonQuote)) {
    throw new Error("repeal REASON quote not found verbatim in the committed 32026R0339 source");
  }

  const recitals = parseRecitals(html, tagsFor, EXPECTED.recitals, EXPECTED.articles);
  // One synthetic chapter — the act has none; the shape matches the other
  // corpora so shared tooling (incl. the D2 parity module) applies.
  const chapters = [{ label: "", title: "", index: 0 }];
  const articles = parseArticles(html, chapters, tagsFor, EXPECTED.articles, { titleOptional: true });

  // Articles of this act carry NO titles in the OJ; none are invented.
  for (const a of articles) {
    if (a.title) throw new Error(`Article ${a.articleNumber} unexpectedly carries a title: "${a.title}"`);
    a.chapterNumber = 1;
    a.chapterTitle = "";
  }

  // Apply the amendments — each must fire exactly once.
  const applied = [];
  for (const am of AMENDMENTS) {
    const art = articles.find((x) => x.articleNumber === am.article);
    const para = art?.paragraphs.find((p) => p.text.includes(am.from));
    if (!para) throw new Error(`amendment did not fire: ${am.provision} (Article ${am.article})`);
    para.text = para.text.replace(am.from, am.to);
    applied.push(am);
  }

  const meta = {
    regulation: "Commission Delegated Regulation (EU) 2022/30",
    shortTitle: "RED Delegated Regulation (EU) 2022/30",
    supplements: "Directive 2014/53/EU (RED), Article 3(3), points (d), (e) and (f)",
    officialJournalReference: "OJ L 7, 12.1.2022, p. 6",
    celex: "32022R0030",
    eli: "http://data.europa.eu/eli/reg_del/2022/30/oj",
    sourceUrl: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32022R0030",
    adopted: "2021-10-29",
    instrumentType: "delegated_regulation",
    appliesFrom: "2025-08-01",
    languageNote:
      "A Bulgarian-language corrigendum (32022R0030R(01)) exists and does not affect the English text; it is recorded, not applied.",
    corrigendaNoted: [
      { id: "32022R0030R(01)", note: "BG only — the English text is not affected." },
    ],
    amendments: applied,
    repeal: REPEAL,
    builtFrom: {
      base: { file: "source/CELEX_32022R0030_EN.html", sha256: sha(fs.readFileSync(BASE)) },
      amending: { file: "source/CELEX_32023R2444_EN.html", sha256: sha(fs.readFileSync(AMENDING)) },
      repealing: { file: "source/CELEX_32026R0339_EN.html", sha256: sha(fs.readFileSync(REPEALING)) },
    },
    sourceSha256: sha(fs.readFileSync(BASE)),
    recitalsCount: recitals.length,
    totalArticles: articles.length,
    annexesCount: 0,
  };

  if (recitals.length !== EXPECTED.recitals) throw new Error(`recitals: ${recitals.length} != ${EXPECTED.recitals}`);
  if (articles.length !== EXPECTED.articles) throw new Error(`articles: ${articles.length} != ${EXPECTED.articles}`);

  fs.writeFileSync(
    path.join(CORPUS, "01_recitals_full.json"),
    JSON.stringify({ ...meta, recitals }, null, 2) + "\n",
  );
  fs.writeFileSync(
    path.join(CORPUS, "02_articles_full.json"),
    JSON.stringify(
      { ...meta, chapters: [{ chapterNumber: 1, chapterTitle: "", articles }] },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `RED Delegated 2022/30: recitals ${recitals.length} · articles ${articles.length} · amendments applied ${applied.length} · repeal recorded (with effect from ${REPEAL.withEffectFrom}) → docs/red_delegated_2022_30`,
  );
  void referencedArticles;
}

main();
