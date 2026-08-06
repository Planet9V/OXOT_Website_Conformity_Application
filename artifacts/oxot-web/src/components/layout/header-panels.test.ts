/**
 * Regression guard: the Services dropdown panel must always contain the
 * Conformity Platform section with all four items under the section label.
 *
 * Self-contained assertion script (no test framework needed) — runs with
 * Node's native TypeScript strip-types support, wired via the package.json
 * test script alongside article-links.test.ts.
 *
 * Run with: node --experimental-strip-types header-panels.test.ts
 */
import assert from 'node:assert/strict';
import { PANELS } from './header-panels.ts';

// ── Services panel exists ───────────────────────────────────────────────────

const servicesPanel = PANELS['/services'];
assert.ok(servicesPanel, 'PANELS must define a /services entry');

const items = servicesPanel.items;

// ── Conformity Platform section label ───────────────────────────────────────

const sectionLabel = items.find((i) => i.isSectionLabel && i.label === 'Conformity Platform');
assert.ok(
  sectionLabel,
  'Services panel must contain a "Conformity Platform" section label',
);

// ── Required Conformity items ───────────────────────────────────────────────

const portfolioOverview = items.find(
  (i) => !i.isSectionLabel && i.label === 'Portfolio Overview',
);
assert.ok(portfolioOverview, 'Services panel must contain "Portfolio Overview"');
assert.equal(portfolioOverview!.href, '/conformity-platform');

const regulations = items.find(
  (i) => !i.isSectionLabel && i.label === 'Regulations',
);
assert.ok(regulations, 'Services panel must contain "Regulations"');
assert.equal(regulations!.href, '/conformity-platform/regulations');

const requirementsExplorer = items.find(
  (i) => !i.isSectionLabel && i.label === 'Requirements Explorer',
);
assert.ok(requirementsExplorer, 'Services panel must contain "Requirements Explorer"');
assert.equal(requirementsExplorer!.href, '/conformity-platform/requirements');

const crossRegMatrix = items.find(
  (i) => !i.isSectionLabel && i.label === 'Cross-Regulation Matrix',
);
assert.ok(crossRegMatrix, 'Services panel must contain "Cross-Regulation Matrix"');
assert.equal(crossRegMatrix!.href, '/conformity-platform/matrix');

// ── Ordering: section label appears before all four items ───────────────────

const labelIdx = items.indexOf(sectionLabel!);
const portfolioIdx = items.indexOf(portfolioOverview!);
const regulationsIdx = items.indexOf(regulations!);
const requirementsIdx = items.indexOf(requirementsExplorer!);
const matrixIdx = items.indexOf(crossRegMatrix!);

assert.ok(
  labelIdx < portfolioIdx &&
    labelIdx < regulationsIdx &&
    labelIdx < requirementsIdx &&
    labelIdx < matrixIdx,
  '"Conformity Platform" section label must appear before all four Conformity items',
);

console.log('header-panels: all Conformity section assertions passed ✓');
