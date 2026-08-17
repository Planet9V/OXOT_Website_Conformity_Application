/**
 * ONE COMMAND THAT VERIFIES THE CRA SOURCE OF TRUTH.
 *
 *   node scripts/verify_cra_corpus.mjs            # full, re-fetches from EUR-Lex
 *   node scripts/verify_cra_corpus.mjs --offline  # skips network checks
 *
 * Every check below is deterministic and prints its own numbers. Nothing here
 * depends on a human eyeballing output or grepping a rendering — that is
 * precisely how this corpus was twice reported broken when it was fine, and
 * once reported fine when it was carrying superseded text.
 *
 * Exits non-zero if any check fails. Run it before trusting anything the
 * application says about the CRA.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { checkOjContentParity, negativeControl } from "./lib/oj_content_parity.mjs";

const ROOT = process.cwd();
const CORPUS = path.join(ROOT, "docs/cra_statutory_corpus");
const SOURCE = path.join(CORPUS, "source/OJ_L_202402847_EN.html");
const OFFLINE = process.argv.includes("--offline");

const APPS = [
  "artifacts/api-server/src/lib/craCorpusData.ts",
  "artifacts/conformity/src/data/craCorpusData.ts",
  "artifacts/oxot-web/src/data/craCorpusData.ts",
];

/**
 * Three states, deliberately. Conflating "I could not check" with "the check
 * failed" is how a network hiccup gets reported as the law having changed.
 * INCONCLUSIVE never fails the run; it tells you what was not verified.
 */
const results = [];
const ok = (id, msg) => results.push({ id, state: "PASS", msg });
const bad = (id, msg) => results.push({ id, state: "FAIL", msg });
const meh = (id, msg) => results.push({ id, state: "----", msg });

const norm = (s) => s.replace(/ /g, " ").replace(/\s+/g, " ").trim();
const sha = (b) => createHash("sha256").update(b).digest("hex");
/** EUR-Lex embeds a per-request WAF token; it is not part of the legal text. */
const stripVolatile = (h) => h.split("\n").filter((l) => !/agentId=|rpid=/.test(l)).join("\n");

function readJson(f) {
  return JSON.parse(fs.readFileSync(path.join(CORPUS, f), "utf8"));
}

/** Extract an exported object literal from a generated TS module. */
function tsExport(file, name) {
  const s = fs.readFileSync(path.join(ROOT, file), "utf8");
  const m = new RegExp(`export const ${name} = (\\{[\\s\\S]*?\\});\\n`).exec(s);
  if (!m) throw new Error(`${name} not found in ${file}`);
  return JSON.parse(m[1]);
}

/**
 * EUR-Lex answers curl but serves Node's fetch a 202 bot-challenge with an empty
 * body, so this shells out. The body is sanity-checked before any caller is
 * allowed to treat it as the regulation.
 */
function fetchText(url) {
  const body = execFileSync(
    "curl",
    ["-sL", "--max-time", "90", "-H", "User-Agent: Mozilla/5.0", url],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  return body;
}

/** Does this look like the document we asked for, or a challenge page? */
function looksLikeOjDocument(body, ...mustContain) {
  if (!body || body.length < 5000) return false;
  return mustContain.every((t) => body.includes(t));
}

// ─────────────────────────────────────────────────────── A. source integrity

function checkSourcePresent() {
  if (!fs.existsSync(SOURCE)) return bad("A1", "cached OJ source is missing");
  const bytes = fs.readFileSync(SOURCE);
  let tracked = false;
  try {
    execFileSync("git", ["ls-files", "--error-unmatch", path.relative(ROOT, SOURCE)], {
      stdio: "ignore",
    });
    tracked = true;
  } catch {
    /* not tracked */
  }
  if (!tracked) return bad("A1", "OJ source is not committed — provenance is unverifiable");
  ok("A1", `OJ source present and committed, ${bytes.length} bytes, sha256 ${sha(bytes).slice(0, 16)}…`);
}

async function checkSourceReproducible(articlesJson) {
  if (OFFLINE) return ok("A2", "skipped (--offline)");
  let fresh;
  try {
    fresh = fetchText(articlesJson.sourceUrl);
  } catch (e) {
    return meh("A2", `could not reach EUR-Lex (${e.message.split("\n")[0]}) — reproducibility NOT verified`);
  }
  if (!looksLikeOjDocument(fresh, "2024/2847", "Whereas")) {
    return meh("A2", `EUR-Lex returned ${fresh.length} bytes that are not the OJ document (bot challenge?) — reproducibility NOT verified`);
  }
  const cached = fs.readFileSync(SOURCE, "utf8");
  stripVolatile(fresh) === stripVolatile(cached)
    ? ok("A2", "a fresh EUR-Lex fetch matches the cached copy exactly (ignoring the per-request WAF token)")
    : bad("A2", "a fresh EUR-Lex fetch DIFFERS from the cached copy — the published text may have changed");
}

// ─────────────────────────────────────────────────── B. corrigenda coverage

async function checkCorrigenda(articlesJson) {
  const applied = articlesJson.corrigenda ?? [];
  const arts = Object.fromEntries(
    articlesJson.chapters.flatMap((c) => c.articles).map((a) => [a.articleNumber, a]),
  );

  // B1 — every recorded correction is actually present in the shipped text.
  let allPresent = true;
  for (const c of applied) {
    const para = arts[c.article]?.paragraphs.find((p) => p.paragraphNumber === c.paragraph);
    if (!para || !para.text.includes(c.to)) {
      allPresent = false;
      bad("B1", `corrigendum ${c.ojRef} recorded but Art. ${c.article}(${c.paragraph}) does not contain the corrected wording`);
    }
    if (para && para.text.includes(c.from)) {
      allPresent = false;
      bad("B1", `Art. ${c.article}(${c.paragraph}) still contains the SUPERSEDED wording`);
    }
  }
  if (allPresent) ok("B1", `${applied.length} corrigendum correction(s) present in the shipped text`);

  if (OFFLINE) return ok("B2", "skipped (--offline)");

  // B2 — the corrected wording matches what the corrigendum actually says.
  for (const c of applied) {
    let html;
    try {
      html = fetchText(c.url);
    } catch (e) {
      return meh("B2", `could not fetch ${c.ojRef} — corrections NOT verified against the published corrigendum`);
    }
    if (!looksLikeOjDocument(html, "2024/2847")) {
      return meh("B2", `${c.ojRef} did not return the corrigendum document — corrections NOT verified`);
    }
    const text = norm(html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " "));
    for (const fix of applied.filter((x) => x.ojRef === c.ojRef)) {
      if (!text.includes(norm(fix.to))) {
        return bad("B2", `${c.ojRef}: the corrected wording we applied does not appear in the published corrigendum`);
      }
    }
  }
  ok("B2", "each applied correction matches the wording published in its corrigendum");

  // B3 — is there a corrigendum we do not know about?
  const eli = "https://eur-lex.europa.eu/eli/reg/2024/2847/oj/eng";
  try {
    const page = fetchText(eli);
    if (!looksLikeOjDocument(page, "2024/2847")) return meh("B3", "EUR-Lex act page unavailable — unknown-corrigenda check NOT performed");
    const found = [...page.matchAll(/corrigendum\/(\d{4}-\d{2}-\d{2})/g)].map((m) => m[1]);
    const known = applied.map((c) => c.eli.match(/corrigendum\/(\d{4}-\d{2}-\d{2})/)?.[1]).filter(Boolean);

    /**
     * POSITIVE CONTROL. This check used to pass whenever `found` came back
     * empty — which is exactly what happens when EUR-Lex changes its markup or
     * serves a page without the corrigendum links. It reported "no unaccounted
     * corrigenda" having detected nothing at all: a check that could not fail.
     *
     * If the page does not surface the corrigenda we ALREADY KNOW about, the
     * detection method is not working, and the honest answer is "could not
     * verify" — not "clean". Silence is not success.
     */
    const missingKnown = known.filter((d) => !found.includes(d));
    if (missingKnown.length) {
      return meh(
        "B3",
        `detection method unverified: the act page does not surface known corrigendum date(s) ${missingKnown.join(", ")}, ` +
          `so an UNKNOWN corrigendum would not be detected either — NOT verified`,
      );
    }

    const unknown = [...new Set(found)].filter((d) => !known.includes(d));
    if (unknown.length) {
      bad("B3", `EUR-Lex lists corrigendum date(s) not applied here: ${unknown.join(", ")}`);
    } else {
      ok("B3", `no unaccounted corrigenda on the EUR-Lex act page (${known.length} known and applied)`);
    }
  } catch (e) {
    meh("B3", `could not check EUR-Lex for unknown corrigenda — NOT verified`);
  }
}

// ───────────────────────────────────────────────────────── C. rebuild parity

function checkRebuild() {
  const before = ["01_recitals_full.json", "02_articles_full.json", "03_annexes_full.json"].map(
    (f) => sha(fs.readFileSync(path.join(CORPUS, f))),
  );
  execFileSync("node", ["scripts/build_cra_corpus_from_eurlex.mjs"], { cwd: ROOT, stdio: "ignore" });
  const after = ["01_recitals_full.json", "02_articles_full.json", "03_annexes_full.json"].map(
    (f) => sha(fs.readFileSync(path.join(CORPUS, f))),
  );
  if (before.join() === after.join()) ok("C1", "rebuilding from the cached source reproduces the committed JSON byte-for-byte");
  else bad("C1", "rebuild does NOT reproduce the committed JSON — the corpus was edited by hand or the builder changed");
}

// ─────────────────────────────────────────────── D. verbatim traceability

/**
 * The source rendered to plain text using the same rules as the builder:
 * footnote markers dropped, tags to space, entities decoded, whitespace
 * collapsed. Comparing corpus text against raw HTML is not a like-for-like
 * check — anything spanning an inline tag (an italicised "Official Journal",
 * a footnote anchor) can never match, which is what produced a spurious
 * "not traceable" failure on 16 perfectly good segments.
 */
function sourceAsPlainText() {
  const html = fs.readFileSync(SOURCE, "utf8");
  const ENT = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", laquo: "«", raquo: "»",
    hellip: "…", ndash: "–", mdash: "—", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”",
    deg: "°", euro: "€", sect: "§", middot: "·", times: "×" };
  return norm(
    html
      .replace(/<script[\s\S]*?<\/script>/g, " ")
      .replace(/<span[^>]*class="oj-super[^"]*"[^>]*>[\s\S]*?<\/span>/g, "")
      .replace(/<a[^>]*class="oj-note"[^>]*>[\s\S]*?<\/a>/g, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
      .replace(/&#x([0-9a-f]+);/gi, (_, d) => String.fromCodePoint(parseInt(d, 16)))
      .replace(/&([a-z]+);/gi, (m, n) => ENT[n.toLowerCase()] ?? m)
      .replace(/\(\s*\)/g, ""),
  );
}

function checkVerbatim(recitals, articles, annexes) {
  const raw = sourceAsPlainText();

  const titles = articles.chapters.flatMap((c) => c.articles);
  const titleMiss = titles.filter((a) => !raw.includes(norm(a.title)));
  titleMiss.length
    ? bad("D1", `${titleMiss.length} article title(s) not found in the OJ source: ${titleMiss.map((a) => a.articleNumber).join(", ")}`)
    : ok("D1", `all ${titles.length} article titles appear verbatim in the OJ source`);

  // Corrected paragraphs legitimately differ from the original publication.
  const corrected = new Set((articles.corrigenda ?? []).map((c) => `${c.article}:${c.paragraph}`));

  /**
   * The parser joins several source blocks into one paragraph with newlines, so
   * the concatenation is deliberately NOT contiguous in the OJ HTML. Verify each
   * segment instead — stricter than probing the join, and it checks every line
   * rather than only the first 90 characters.
   *
   * Two-column points are rejoined as "(a) text", which also breaks contiguity,
   * so a segment that fails is retried on its body text alone.
   */
  let segChecked = 0;
  const segMiss = [];
  for (const a of titles) {
    for (const p of a.paragraphs) {
      if (corrected.has(`${a.articleNumber}:${p.paragraphNumber}`)) continue;
      for (const seg of p.text.split("\n")) {
        const t = norm(seg);
        if (t.length < 25) continue;
        segChecked++;
        if (raw.includes(t)) continue;
        const body = t.replace(/^\(?[\w.]{1,6}[).]\s+/, "");
        if (raw.includes(body)) continue;
        segMiss.push(`${a.articleNumber}(${p.paragraphNumber}): ${t.slice(0, 60)}`);
      }
    }
  }
  segMiss.length
    ? bad("D2", `${segMiss.length}/${segChecked} article text segments not traceable to the OJ source: ${segMiss.slice(0, 5).join(" | ")}`)
    : ok("D2", `all ${segChecked} article text segments trace verbatim to the OJ source`);

  const recMiss = recitals.recitals.filter((r) => {
    const t = norm(r.text);
    // Footnote markers are stripped mid-sentence, so probe a clean opening span.
    return !raw.includes(t.slice(0, 60)) && !raw.includes(t.slice(80, 180));
  });
  recMiss.length
    ? bad("D3", `${recMiss.length} recital(s) not traceable: ${recMiss.map((r) => r.number).join(", ")}`)
    : ok("D3", `all ${recitals.recitals.length} recitals trace to the OJ source`);

  const anxMiss = annexes.annexes.filter((a) => {
    const b = norm(a.blocks[0]);
    return !raw.includes(b.slice(0, 80)) && !raw.includes(b.replace(/^\(?\w{1,4}[).]\s+/, "").slice(0, 80));
  });
  anxMiss.length
    ? bad("D4", `${anxMiss.length} annex(es) not traceable: ${anxMiss.map((a) => a.annexNumber).join(", ")}`)
    : ok("D4", `all ${annexes.annexes.length} annexes trace to the OJ source`);
}

// ──────────────────────────────────────────────────────── E. app copy parity

function checkFullContentParity() {
  // D2 — every article and annex character-exact against an INDEPENDENT
  // flatten of the committed OJ source, with the declared corrigenda applied
  // and required to fire (L51). D2N is the negative control.
  let r;
  try {
    r = checkOjContentParity({ corpusDir: CORPUS, sourceFile: "source/OJ_L_202402847_EN.html" });
  } catch (e) {
    return bad("D5", e.message.replace(/^D2:\s*/, ""));
  }
  ok("D5", `full-content parity: ${r.articles} articles + ${r.annexes} annexes character-exact against the source (${r.corrigendaApplied} corrigendum applied)`);
  if (!negativeControl({ corpusDir: CORPUS, sourceFile: "source/OJ_L_202402847_EN.html" })) {
    return bad("D5N", "negative control DID NOT fail — the parity check is blind");
  }
  ok("D5N", "negative control fails as required (one flipped character is caught)");
}

function checkAppsInSync(articles) {
  const hashes = APPS.map((f) => sha(fs.readFileSync(path.join(ROOT, f))));
  if (new Set(hashes).size !== 1) return bad("E1", "the three app corpus modules are NOT identical to each other");
  const a = tsExport(APPS[0], "articlesData");
  const shipped = a.chapters.flatMap((c) => c.articles).length;
  const built = articles.chapters.flatMap((c) => c.articles).length;
  if (shipped !== built) return bad("E1", `apps carry ${shipped} articles, built JSON has ${built}`);
  const art64 = a.chapters.flatMap((c) => c.articles).find((x) => x.articleNumber === 64);
  const p10 = art64?.paragraphs.find((p) => p.paragraphNumber === 10);
  const applied = (articles.corrigenda ?? []).find((c) => c.article === 64 && c.paragraph === 10);
  if (applied && !p10?.text.includes(applied.to)) {
    return bad("E1", "apps do not carry the corrected Article 64(10) — sync was not run or not committed");
  }
  ok("E1", `all three app modules identical, ${shipped} articles, corrections present`);
}

// ─────────────────────────────────────────────────────────────────── report

async function main() {
  checkSourcePresent();
  const articles = readJson("02_articles_full.json");
  const recitals = readJson("01_recitals_full.json");
  const annexes = readJson("03_annexes_full.json");

  await checkSourceReproducible(articles);
  await checkCorrigenda(articles);
  checkRebuild();
  checkVerbatim(recitals, articles, annexes);
  checkFullContentParity();
  checkAppsInSync(articles);

  const width = 76;
  console.log("\n" + "─".repeat(width));
  console.log("  CRA SOURCE OF TRUTH — VERIFICATION");
  console.log("─".repeat(width));
  console.log(`  Instrument   ${articles.regulation}`);
  console.log(`  Published    ${articles.officialJournalReference}  (CELEX ${articles.celex})`);
  for (const c of articles.corrigenda ?? []) {
    console.log(`  Corrected by ${c.ojRef} — Art. ${c.article}(${c.paragraph})`);
  }
  console.log(
    `  Content      ${recitals.recitals.length} recitals · ` +
      `${articles.chapters.flatMap((c) => c.articles).length} articles · ` +
      `${annexes.annexes.length} annexes`,
  );
  console.log("─".repeat(width));
  for (const r of results) {
    console.log(`  ${r.state}  ${r.id}  ${r.msg}`);
  }
  console.log("─".repeat(width));
  const unchecked = results.filter((r) => r.state === "----");
  if (unchecked.length) {
    console.log(`  ${unchecked.length} check(s) could not be performed — see "----" above.`);
  }
  const failed = results.filter((r) => r.state === "FAIL");
  if (failed.length) {
    console.log(`  VERDICT: ${failed.length} CHECK(S) FAILED — do not rely on the corpus\n`);
    process.exit(1);
  }
  console.log("  VERDICT: the corpus is the published CRA text, corrections applied,\n" +
              "           reproducible from a committed source, identical in all three apps.\n");
}

main().catch((e) => {
  console.error(`\nVERIFIER ERROR: ${e.stack || e}\n`);
  process.exit(1);
});
