/**
 * Regression check for article heading slugging.
 *
 * No test framework is configured in this workspace, so this file is a
 * self-contained assertion script runnable with Node's native TypeScript
 * support: `node --experimental-strip-types article-headings.test.ts`
 * (wired as `pnpm --filter @workspace/oxot-web test`).
 *
 * It guards the bug where the sidebar TOC and the rendered <h2 id> could drift
 * apart when a heading is styled: emphasis/links/inline-code inside a heading,
 * duplicate headings, punctuation, or a `##` that only looks like a heading
 * because it sits inside a fenced code block.
 *
 * The rendered <h2 id>s are drawn, in document order, from the exact array
 * `extractH2Headings` returns (see `buildComponents` in article-section.tsx), so
 * asserting on that array proves the TOC hrefs and the rendered ids agree.
 */
import assert from 'node:assert/strict';
import { slugify, createSlugger, extractH2Headings } from './article-headings.ts';

// --- slugify: canonical rules -------------------------------------------------
assert.equal(slugify('Hello World'), 'hello-world');
assert.equal(slugify('  Leading & trailing --- dashes!  '), 'leading-trailing-dashes');
assert.equal(slugify('Under_scores and   spaces'), 'under-scores-and-spaces');
assert.equal(slugify('***'), ''); // all-punctuation collapses to empty

// --- createSlugger: uniqueness ------------------------------------------------
const s = createSlugger();
assert.equal(s('Overview'), 'overview');
assert.equal(s('Overview'), 'overview-2');
assert.equal(s('Overview'), 'overview-3');
assert.equal(s('Intro'), 'intro');
assert.equal(s(''), 'section'); // empty label still yields a usable anchor

// --- extractH2Headings: AST-based, matches rendered plain text ----------------

// Duplicate H2s must produce unique, clickable anchors.
const dup = extractH2Headings('## Overview\ntext\n## Overview\nmore\n## Overview');
assert.deepEqual(
  dup.map((h) => h.id),
  ['overview', 'overview-2', 'overview-3'],
);

// Styled headings: emphasis, inline code, and links must slug from the rendered
// text (link *text*, not its URL) — the same text react-markdown renders.
const styled = extractH2Headings(
  ['## Intro *Overview*', '## Use the `slugify` helper', '## See the [docs](/some/url)'].join('\n'),
);
assert.deepEqual(
  styled.map((h) => h.id),
  ['intro-overview', 'use-the-slugify-helper', 'see-the-docs'],
);
// The URL must never leak into the anchor id.
assert.ok(!styled.some((h) => h.id.includes('some') || h.id.includes('url')));

// A `##` inside a fenced code block is not a heading — both the TOC and the
// renderer must ignore it, so it must not appear here.
const withCodeFence = ['## Real Heading', '', '```md', '## Not A Heading', '```', '', '## Another'].join(
  '\n',
);
assert.deepEqual(
  extractH2Headings(withCodeFence).map((h) => h.label),
  ['Real Heading', 'Another'],
);

// Only H2s participate (H1/H3 are excluded from the TOC).
const mixedLevels = ['# Title', '## Section', '### Subsection', '## Section Two'].join('\n');
assert.deepEqual(
  extractH2Headings(mixedLevels).map((h) => h.id),
  ['section', 'section-two'],
);

const total = 4 + 5 + 1 + 1 + 1 + 1 + 1 + 1;
console.log(`article-headings: ${total} assertions passed`);
