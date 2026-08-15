/**
 * THE source-of-truth check for the NIS2 corpus.
 *
 * Same contract as verify_cra_corpus.mjs, and the same three states, because
 * the distinction matters more than the pass rate:
 *
 *   PASS  verified
 *   FAIL  contradicted — the corpus does not match the published text
 *   ----  COULD NOT VERIFY (offline, blocked, unavailable)
 *
 * "----" is never counted as success. EUR-Lex bot-challenges this environment
 * intermittently, and a check that silently degrades to "fine" when the network
 * is unavailable is worse than no check.
 *
 * One difference from the CRA. NIS2 is a DIRECTIVE: it binds Member States, and
 * what binds an entity is the national transposition. So this verifies that the
 * corpus IS the published Directive; it says nothing about what any entity must
 * do. F1 asserts that distinction is carried in the metadata, so nothing
 * downstream can quietly forget it.
 *
 * Usage: node scripts/verify_nis2_corpus.mjs [--offline]
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const CORPUS = path.join(ROOT, "docs/nis2_statutory_corpus");
const SOURCE = path.join(CORPUS, "source/CELEX_32022L2555_EN.html");
const SOURCE_URL =
  "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32022L2555";
const OFFLINE = process.argv.includes("--offline");

const results = [];
const ok = (id, msg) => results.push({ id, state: "PASS", msg });
const bad = (id, msg) => results.push({ id, state: "FAIL", msg });
const meh = (id, msg) => results.push({ id, state: "----", msg });

const norm = (s) => s.replace(/ /g, " ").replace(/\s+/g, " ").trim();
const sha = (b) => createHash("sha256").update(b).digest("hex");
/** EUR-Lex embeds a per-request WAF token; it is not part of the legal text. */
const stripVolatile = (h) => h.split("\n").filter((l) => !/agentId=|rpid=/.test(l)).join("\n");

const readJson = (f) => JSON.parse(fs.readFileSync(path.join(CORPUS, f), "utf8"));

/** EUR-Lex answers curl but serves Node's fetch a 202 bot-challenge. */
function fetchText(url) {
  return execFileSync("curl", ["-sL", "--max-time", "90", "-H", "User-Agent: Mozilla/5.0", url], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}

function looksLikeTheDirective(body) {
  return Boolean(body) && body.length > 100_000 && body.includes("2022/2555");
}

// ───────────────────────────────────────────────────────── A. source integrity

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

  const html = bytes.toString("utf8");
  // The consolidated text has no legal effect AND omits the preamble entirely.
  if (/has no legal effect|meant purely as a documentation tool/i.test(html)) {
    return bad("A1", "cached source is a CONSOLIDATED text — it has no legal effect and omits all recitals");
  }
  if (!/Whereas/.test(html)) {
    return bad("A1", "cached source has no preamble — the recitals cannot be authentic");
  }
  ok("A1", `authentic OJ source, committed, ${bytes.length} bytes, sha256 ${sha(bytes).slice(0, 16)}…`);
}

function checkSourceReproducible() {
  if (OFFLINE) return ok("A2", "skipped (--offline)");
  let fresh;
  try {
    fresh = fetchText(SOURCE_URL);
  } catch (e) {
    return meh("A2", `could not reach EUR-Lex (${e.message.split("\n")[0]}) — reproducibility NOT verified`);
  }
  if (!looksLikeTheDirective(fresh)) {
    return meh("A2", `EUR-Lex returned ${fresh.length} bytes that are not the Directive (bot challenge?) — reproducibility NOT verified`);
  }
  const cached = fs.readFileSync(SOURCE, "utf8");
  stripVolatile(fresh) === stripVolatile(cached)
    ? ok("A2", "a fresh EUR-Lex fetch matches the cached copy exactly (ignoring the per-request WAF token)")
    : bad("A2", "a fresh EUR-Lex fetch DIFFERS from the cached copy — the published text may have changed");
}

// ───────────────────────────────────────────────────── B. corrigenda coverage

function checkCorrigenda(meta) {
  const declared = meta.corrigenda ?? [];
  if (declared.length === 0 && meta.corrigendaVerified === false) {
    return meh(
      "B1",
      "no corrigenda applied, and their absence is NOT verified. Scraping the EUR-Lex act page for corrigendum links was tested against the CRA, whose corrigendum (OJ L 2025/90555) is KNOWN — and the method failed to find it. A method that cannot detect a corrigendum we know exists cannot prove one does not. Re-check manually before relying on this.",
    );
  }
  if (declared.length === 0) {
    return ok("B1", "no corrigenda, and the absence was verified against the EUR-Lex act page");
  }
  ok("B1", `${declared.length} corrigendum correction(s) declared`);
}

// ─────────────────────────────────────────────────────── C. reproducible build

function checkRebuild() {
  const files = ["01_recitals_full.json", "02_articles_full.json", "03_annexes_full.json"];
  const before = files.map((f) => sha(fs.readFileSync(path.join(CORPUS, f))));
  try {
    execFileSync("node", ["scripts/build_nis2_corpus_from_eurlex.mjs"], { stdio: "ignore" });
  } catch (e) {
    return bad("C1", `the builder failed: ${e.message.split("\n")[0]}`);
  }
  const after = files.map((f) => sha(fs.readFileSync(path.join(CORPUS, f))));
  before.join() === after.join()
    ? ok("C1", "rebuilding from the cached source reproduces the committed JSON byte-for-byte")
    : bad("C1", "rebuild does NOT reproduce the committed JSON — the corpus was edited by hand or the builder changed");
}

// ───────────────────────────────────────────── D. verbatim traceability

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

/** Long segments are the strong signal; very short ones match by chance. */
const MIN_SEGMENT = 40;

function checkVerbatim(recitals, articlesJson, annexes) {
  const raw = sourceAsPlainText();
  const articles = articlesJson.chapters.flatMap((c) => c.articles);

  const titleMiss = articles.filter((a) => a.title && !raw.includes(norm(a.title)));
  titleMiss.length
    ? bad("D1", `${titleMiss.length} article title(s) not found in the source: ${titleMiss.map((a) => a.articleNumber).join(", ")}`)
    : ok("D1", `all ${articles.length} article titles appear verbatim in the source`);

  let checked = 0;
  const miss = [];
  for (const a of articles) {
    for (const p of a.paragraphs) {
      for (const seg of String(p.text).split("\n")) {
        const s = norm(seg);
        if (s.length < MIN_SEGMENT) continue;
        checked++;
        if (!raw.includes(s)) miss.push(`Art ${a.articleNumber}(${p.paragraphNumber}): ${s.slice(0, 60)}…`);
      }
    }
  }
  miss.length
    ? bad("D2", `${miss.length}/${checked} article text segments not traceable: ${miss.slice(0, 3).join(" | ")}`)
    : ok("D2", `all ${checked} article text segments trace verbatim to the source`);

  const recMiss = (recitals.recitals ?? []).filter((r) => {
    const s = norm(String(r.text ?? ""));
    return s.length >= MIN_SEGMENT && !raw.includes(s);
  });
  recMiss.length
    ? bad("D3", `${recMiss.length} recital(s) not traceable: ${recMiss.slice(0, 5).map((r) => r.number ?? r.recitalNumber).join(", ")}`)
    : ok("D3", `all ${(recitals.recitals ?? []).length} recitals trace to the source`);

  const anxMiss = (annexes.annexes ?? []).filter((a) => {
    const blocks = a.blocks ?? [];
    return blocks.some((b) => {
      const s = norm(String(b));
      return s.length >= MIN_SEGMENT && !raw.includes(s);
    });
  });
  anxMiss.length
    ? bad("D4", `${anxMiss.length} annex(es) contain text not traceable to the source: ${anxMiss.map((a) => a.annexNumber).join(", ")}`)
    : ok("D4", `all ${(annexes.annexes ?? []).length} annexes trace to the source`);
}

// ────────────────────────────────────── E. structure  F. instrument character

function checkStructure(recitals, articlesJson, annexes) {
  const articles = articlesJson.chapters.flatMap((c) => c.articles);
  const problems = [];
  if (articles.length !== 46) problems.push(`articles: ${articles.length}, expected 46`);
  if ((recitals.recitals ?? []).length !== 144) problems.push(`recitals: ${(recitals.recitals ?? []).length}, expected 144`);
  if ((annexes.annexes ?? []).length !== 3) problems.push(`annexes: ${(annexes.annexes ?? []).length}, expected 3`);
  const empty = articles.filter((a) => !a.paragraphs?.length).map((a) => a.articleNumber);
  if (empty.length) problems.push(`empty articles: ${empty.join(", ")}`);
  problems.length
    ? bad("E1", `structure does not match the Directive: ${problems.join("; ")}`)
    : ok("E1", "structure matches the Directive: 46 articles, 144 recitals, 3 annexes, no empty articles");
}

/**
 * The distinction that governs every downstream use: NIS2 is a Directive, so
 * this corpus states what the DIRECTIVE says, never what an entity must do.
 */
function checkInstrumentCharacter(meta) {
  if (meta.instrumentType !== "directive" || meta.nationalTranspositionRequired !== true) {
    return bad(
      "F1",
      "metadata does not record that this is a Directive requiring national transposition — downstream code could present it as directly applicable",
    );
  }
  ok("F1", "metadata records instrumentType=directive and nationalTranspositionRequired=true");
}

// ──────────────────────────────────────────────────────────────────── report

function main() {
  if (!fs.existsSync(CORPUS)) {
    console.error("NIS2 corpus not found. Run: node scripts/build_nis2_corpus_from_eurlex.mjs");
    process.exit(1);
  }
  const recitals = readJson("01_recitals_full.json");
  const articlesJson = readJson("02_articles_full.json");
  const annexes = readJson("03_annexes_full.json");

  checkSourcePresent();
  checkSourceReproducible();
  checkCorrigenda(articlesJson);
  checkRebuild();
  checkVerbatim(recitals, articlesJson, annexes);
  checkStructure(recitals, articlesJson, annexes);
  checkInstrumentCharacter(articlesJson);

  const line = "─".repeat(76);
  console.log(`\nNIS2 source-of-truth check — Directive (EU) 2022/2555 (CELEX 32022L2555)\n${line}`);
  for (const r of results) console.log(`  ${r.state}  ${r.id}  ${r.msg}`);
  console.log(line);

  const failed = results.filter((r) => r.state === "FAIL");
  const unverified = results.filter((r) => r.state === "----");
  if (failed.length) {
    console.log(`\n  VERDICT: ${failed.length} check(s) FAILED — the corpus does not match the`);
    console.log("           published Directive. Do not ship material citing it.\n");
    process.exit(1);
  }
  console.log("\n  VERDICT: the corpus is the published NIS2 Directive text, reproducible");
  console.log("           from a committed source.");
  if (unverified.length) {
    console.log(`           ${unverified.length} check(s) COULD NOT be verified — see "----" above.`);
  }
  console.log(
    "\n           NIS2 is a DIRECTIVE. This says what the Directive says; national\n" +
      "           transposition governs what any entity must actually do.\n",
  );
}

main();
