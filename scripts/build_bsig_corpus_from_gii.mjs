/**
 * Build the BSI-Gesetz corpus — the core of the German NIS2 transposition
 * (W2.4 DE, task 9.4b).
 *
 * Source: the CONSOLIDATED text from gesetze-im-internet.de (`bsig_2025`,
 * doknr BJNR12D0B0025), the documentation service operated for the Federal
 * Ministry of Justice. This is a deliberate, evidenced departure from the
 * promulgation-first doctrine the CRA/NIS2/Cbw corpora follow, and the
 * corpus metadata says so:
 *
 * - The authentic promulgation (BGBl. 2025 I Nr. 301, in force 2025-12-06)
 *   is an ARTIKELGESETZ: Artikel 1 enacts this law; the promulgation is
 *   published as PDF only, whose text extraction cannot be byte-verified.
 * - Decisive: the BSIG has ALREADY been amended (first by
 *   Art. 4 G v. 11.3.2026 I Nr. 66). A corpus built from the December 2025
 *   promulgation would show law no longer in force as written. The
 *   consolidated text is therefore what may honestly claim to be the law
 *   that binds today — and the full amendment trail (standangabe) is
 *   carried VERBATIM, including juris's own caveat where an amendment is
 *   "textlich nachgewiesen, dokumentarisch noch nicht abschließend
 *   bearbeitet".
 * - Scope: this corpus is the BSIG alone — the transposition's core. The
 *   NIS2UmsuCG's other Artikel amend further laws (EnWG, TKG, …) and are
 *   NOT included; the metadata states that.
 *
 * The text is GERMAN and stays German: no official English translation
 * exists, and a translation made here would be reconstruction.
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { parseXmlOrdered, children } from "./lib/ordered_xml_parser.mjs";

const ROOT = process.cwd();
const CORPUS_DIR = path.join(ROOT, "docs/bsig_statutory_corpus");
const SOURCE_FILE = path.join(CORPUS_DIR, "source/BJNR12D0B0025.xml");
const SOURCE_URL = "https://www.gesetze-im-internet.de/bsig_2025/xml.zip";

const GESETZ = {
  gesetz: "BSI-Gesetz (BSIG)",
  shortTitle: "BSIG",
  sourceUrl: SOURCE_URL,
  sourceService:
    "gesetze-im-internet.de (documentation service of the Federal Ministry of Justice; NOT the authentic promulgation)",
  authenticPromulgation:
    "BGBl. 2025 I Nr. 301 (NIS2UmsuCG, Artikel 1), https://www.recht.bund.de/eli/bund/bgbl-1/2025/301 — PDF",
  entryIntoForce: "2025-12-06",
  language: "de",
  jurisdiction: "DE",
  instrumentType: "national_transposition",
  transposes: "Directive (EU) 2022/2555",
  bindsEntitiesIn: "DE",
  consolidatedNotPromulgated: true,
  whyConsolidated:
    "The promulgation is an Artikelgesetz published as PDF only, and the BSIG has already been amended since — the consolidated text is what binds today; the amendment trail is carried verbatim in standangabe.",
  scopeNote:
    "The BSIG alone (Artikel 1 of the NIS2UmsuCG). The NIS2UmsuCG's further Artikel amend other federal laws and are not part of this corpus.",
};

// ── gii text flattening ─────────────────────────────────────────────────────

function flatten(nodes) {
  let out = "";
  for (const node of nodes ?? []) {
    for (const [tag, value] of Object.entries(node)) {
      if (tag === "#text") {
        out += String(value);
        continue;
      }
      switch (tag) {
        case "P":
          out += (out && !out.endsWith("\n") ? "\n" : "") + flatten(value);
          break;
        case "BR":
          out += "\n";
          break;
        case "DL":
          out += flatten(value);
          break;
        case "DT":
          out += `\n${flatten(value).trim()} `;
          break;
        case "DD":
        case "LA":
        case "Content":
          out += flatten(value);
          break;
        case "table":
        case "tgroup":
        case "tbody":
        case "thead":
          out += flatten(value);
          break;
        case "row": {
          const cells = value
            .filter((c) => "entry" in c)
            .map((c) => flatten(c.entry).replace(/\s+/g, " ").trim());
          out += `\n${cells.join(" | ")}`;
          break;
        }
        case "colspec":
        case "FnR":
        case "Footnotes":
        case "Footnote":
          // Column geometry and footnote apparatus are not statute text.
          break;
        case "B":
        case "I":
        case "U":
        case "SUB":
        case "SUP":
        case "small":
        case "NB":
          out += flatten(value);
          break;
        default:
          out += flatten(value);
      }
    }
  }
  return out;
}

function childText(nodes, tagName) {
  for (const node of nodes ?? []) {
    if (tagName in node) return flatten(node[tagName]).replace(/\s+/g, " ").trim();
  }
  return "";
}

const clean = (s) =>
  s
    .replace(/ /g, " ")
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean)
    .join("\n");

// ── parse ───────────────────────────────────────────────────────────────────

const sourceBytes = fs.readFileSync(SOURCE_FILE);
const xml = sourceBytes.toString("utf8");
const doc = parseXmlOrdered(xml);

const dokumente = children(doc, "dokumente")[0];
const norms = children(dokumente, "norm");
if (!norms.length) throw new Error("no <norm> elements found");

// Norm 0 carries the law's own metadata, including the amendment trail.
const headMeta = children(norms[0], "metadaten")[0];
const jurabk = childText(headMeta, "jurabk");
const amtabk = childText(headMeta, "amtabk");
const ausfertigung = childText(headMeta, "ausfertigung-datum");
const kurzue = childText(headMeta, "kurzue");
const langue = childText(headMeta, "langue");
const fundstelle = children(headMeta, "fundstelle")[0];
const fundstelleText = fundstelle
  ? `${childText(fundstelle, "periodikum")} ${childText(fundstelle, "zitstelle")}`
  : "";
const standangabe = children(headMeta, "standangabe").map((s) => ({
  typ: childText(s, "standtyp"),
  kommentar: childText(s, "standkommentar"),
}));

// Walk the remaining norms in document order: gliederung markers set the
// current Teil/Kapitel/Abschnitt context; § norms and Anlagen carry text.
const sections = [];
const anlagen = [];
let gliederungMarkers = 0;
const activeGliederung = [];

for (const norm of norms.slice(1)) {
  const meta = children(norm, "metadaten")[0];
  const glied = children(meta, "gliederungseinheit")[0];
  const enbez = childText(meta, "enbez");

  if (glied) {
    gliederungMarkers++;
    const kennzahl = childText(glied, "gliederungskennzahl");
    const entry = {
      kennzahl,
      bez: childText(glied, "gliederungsbez"),
      titel: childText(glied, "gliederungstitel"),
    };
    // A marker replaces every active marker at its own depth or deeper.
    while (
      activeGliederung.length &&
      activeGliederung[activeGliederung.length - 1].kennzahl.length >= kennzahl.length
    ) {
      activeGliederung.pop();
    }
    activeGliederung.push(entry);
    continue;
  }

  if (!enbez || enbez === "Inhaltsübersicht") continue; // TOC duplicates titles

  const titel = childText(meta, "titel");
  const textdaten = children(norm, "textdaten")[0] ?? [];
  const content = children(children(textdaten, "text")[0] ?? [], "Content")[0] ?? [];
  const text = clean(flatten(content));

  if (/^Anlage/.test(enbez)) {
    if (!text) throw new Error(`empty ${enbez}`);
    anlagen.push({ label: enbez, title: titel, text });
    continue;
  }

  const m = /^§ (\d+[a-z]*)$/.exec(enbez);
  if (!m) throw new Error(`unrecognised enbez "${enbez}"`);
  if (!text) throw new Error(`empty ${enbez}`);
  sections.push({
    section: m[1],
    label: enbez,
    title: titel,
    gliederung: activeGliederung.map((g) => `${g.bez} ${g.titel}`.trim()),
    // Absatz numbers "(1)", "(2)" are part of the verbatim text itself;
    // nothing is derived or renumbered here.
    text,
  });
}

// ── assertions ──────────────────────────────────────────────────────────────

let prevBase = 0;
for (const s of sections) {
  const m = /^(\d+)([a-z]*)$/.exec(s.section);
  const base = parseInt(m[1], 10);
  if (!(base === prevBase + 1 || (base === prevBase && m[2]))) {
    throw new Error(`section numbering broke after § ${prevBase}: got § ${s.section}`);
  }
  prevBase = base;
}
const expectGliederung = (xml.match(/<gliederungseinheit>/g) ?? []).length;
if (gliederungMarkers !== expectGliederung)
  throw new Error(`walked ${gliederungMarkers} gliederung markers, source has ${expectGliederung}`);
const expectAnlagen = (xml.match(/<enbez>Anlage /g) ?? []).length;
if (anlagen.length !== expectAnlagen)
  throw new Error(`parsed ${anlagen.length} Anlagen, source has ${expectAnlagen}`);
if (!langue.includes("Bundesamt für Sicherheit in der Informationstechnik"))
  throw new Error("langue does not look like the BSI-Gesetz");
if (!standangabe.length)
  throw new Error("standangabe (amendment trail) missing — the honesty of the consolidation depends on it");

// ── write ───────────────────────────────────────────────────────────────────

const meta = {
  ...GESETZ,
  fullTitle: langue,
  kurzue,
  jurabk,
  amtabk,
  ausfertigungsDatum: ausfertigung,
  fundstelle: fundstelleText,
  /** juris's own record of every change applied or pending — VERBATIM. */
  standangabe,
  builtFrom: "docs/bsig_statutory_corpus/source/BJNR12D0B0025.xml",
  sourceSha256: createHash("sha256").update(sourceBytes).digest("hex"),
  sectionsCount: sections.length,
  lastSection: sections[sections.length - 1].section,
  anlagenCount: anlagen.length,
};

const write = (name, data) =>
  fs.writeFileSync(path.join(CORPUS_DIR, name), JSON.stringify(data, null, 2) + "\n");

write("01_sections_full.json", { ...meta, sections });
write("02_anlagen_full.json", { ...meta, anlagen });

console.log(
  `BSIG corpus built: §§ 1..${meta.lastSection} (${sections.length} sections), ${anlagen.length} Anlagen, ${standangabe.length} standangabe entries (source sha256 ${meta.sourceSha256.slice(0, 12)}…)`,
);
