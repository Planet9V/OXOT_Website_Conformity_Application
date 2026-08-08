/**
 * Regression guard for the CRA self-check's pure scoring/classification
 * engine. This logic drives lead segmentation and routing (the wizard's
 * result screen, PDF report, and lead payload all read from it) but had
 * zero test coverage before this file — flagged as a high-severity gap in
 * the 2026-08-07 codebase evaluation (findings.md): a silent regression
 * here would mis-classify visitors' CRA obligations.
 *
 * Self-contained assertion script (no test framework needed) — runs with
 * Node's native TypeScript strip-types support, wired via the package.json
 * test script, matching the convention of the other *.test.ts files in
 * this package (e.g. locale-routing.test.ts).
 *
 * Run with: node --experimental-strip-types cra-selfcheck.test.ts
 */
import assert from 'node:assert/strict';
import {
  applyCategoryChange,
  classify,
  gaps,
  miniVerdict,
  parsePrefill,
  readinessBand,
  readinessScore,
  runwayMath,
  scoreBreakdown,
  type SelfCheckAnswers,
  type TeaserCopy,
} from './cra-selfcheck.ts';

// ── classify: scope gate ─────────────────────────────────────────────────────
// No digital elements -> likely out of scope, regardless of any other answer.
{
  const r = classify({ hasDigital: 'no', category: 'critical' });
  assert.equal(r.craClass, 'OUT_OF_SCOPE_LIKELY');
  assert.equal(r.route, 'unknown');
  assert.equal(r.nowActionKey, 'confirm_scope');
  assert.equal(r.classIIFlag, false);
}

// ── classify: category -> class -> route mapping ─────────────────────────────
assert.equal(classify({ hasDigital: 'yes', category: 'default' }).craClass, 'DEFAULT');
assert.equal(classify({ hasDigital: 'yes', category: 'default' }).route, 'self_default');
assert.equal(classify({ hasDigital: 'yes', category: 'classI' }).craClass, 'CLASS_I');
assert.equal(classify({ hasDigital: 'yes', category: 'classI' }).route, 'self_closed');
assert.equal(classify({ hasDigital: 'yes', category: 'classII' }).craClass, 'CLASS_II');
assert.equal(classify({ hasDigital: 'yes', category: 'classII' }).route, 'third_party');
assert.equal(classify({ hasDigital: 'yes', category: 'critical' }).craClass, 'CRITICAL');
assert.equal(classify({ hasDigital: 'yes', category: 'critical' }).route, 'third_party_plus');
// No category answered yet defaults to "unsure" -> NEEDS_REVIEW, not a guess.
assert.equal(classify({ hasDigital: 'yes' }).craClass, 'NEEDS_REVIEW');
assert.equal(classify({ hasDigital: 'yes' }).route, 'unknown');

// ── classify: NIS2-essential deploy context upgrades unresolved classes ──────
// DEFAULT + nis2_essential -> upgraded to NEEDS_REVIEW with the flag set.
{
  const r = classify({ hasDigital: 'yes', category: 'default', deployContext: 'nis2_essential' });
  assert.equal(r.craClass, 'NEEDS_REVIEW');
  assert.equal(r.classIIFlag, true);
}
// Already-NEEDS_REVIEW stays NEEDS_REVIEW but the flag still records why.
{
  const r = classify({ hasDigital: 'yes', category: 'unsure', deployContext: 'nis2_essential' });
  assert.equal(r.craClass, 'NEEDS_REVIEW');
  assert.equal(r.classIIFlag, true);
}
// An already-resolved hard class (CLASS_II) is NOT silently upgraded/flagged —
// the upgrade only applies to DEFAULT/NEEDS_REVIEW per the function's contract.
{
  const r = classify({ hasDigital: 'yes', category: 'classII', deployContext: 'nis2_essential' });
  assert.equal(r.craClass, 'CLASS_II');
  assert.equal(r.classIIFlag, false);
}

// ── classify: becomesManufacturerFlag only fires for integrator/reseller ─────
assert.equal(
  classify({ hasDigital: 'yes', position: 'integrator', becomesManufacturer: true }).becomesManufacturerFlag,
  true,
);
assert.equal(
  classify({ hasDigital: 'yes', position: 'reseller', becomesManufacturer: true }).becomesManufacturerFlag,
  true,
);
// A manufacturer is already the manufacturer — the flag is about RECLASSIFYING
// a non-manufacturer, so it never fires for a position that already is one.
assert.equal(
  classify({ hasDigital: 'yes', position: 'manufacturer', becomesManufacturer: true }).becomesManufacturerFlag,
  false,
);
assert.equal(
  classify({ hasDigital: 'yes', position: 'integrator', becomesManufacturer: false }).becomesManufacturerFlag,
  false,
);

// ── classify: nowActionKey — gaps take priority over the class-driven default ─
assert.equal(classify({ hasDigital: 'yes', category: 'default' }).nowActionKey, 'now_sbom');
assert.equal(
  classify({ hasDigital: 'yes', category: 'default', evidence: ['sbom'] }).nowActionKey,
  'now_risk',
);
assert.equal(
  classify({ hasDigital: 'yes', category: 'default', evidence: ['sbom', 'risk'] }).nowActionKey,
  'now_annex_vii',
);
// A hard route with both artifacts in hand points at reserving a CAB slot instead.
assert.equal(
  classify({ hasDigital: 'yes', category: 'classII', evidence: ['sbom', 'risk'] }).nowActionKey,
  'now_reserve_slot',
);

// ── gaps: which required artifacts are still missing ─────────────────────────
assert.deepEqual(gaps({}), ['sbom', 'risk', 'cvd']);
assert.deepEqual(gaps({ evidence: [] }), ['sbom', 'risk', 'cvd']);
// "none of these yet" is an explicit answer, not an omission — same result.
assert.deepEqual(gaps({ evidence: ['none'] }), ['sbom', 'risk', 'cvd']);
assert.deepEqual(gaps({ evidence: ['sbom'] }), ['risk', 'cvd']);
assert.deepEqual(gaps({ evidence: ['sbom', 'risk', 'cvd'] }), []);
// Non-required evidence (sdl/cert) doesn't close a required gap.
assert.deepEqual(gaps({ evidence: ['sdl', 'cert'] }), ['sbom', 'risk', 'cvd']);

// ── scoreBreakdown: all core artifacts held, easy route -> clamped to 98 ─────
{
  const a: SelfCheckAnswers = {
    hasDigital: 'yes',
    category: 'default',
    evidence: ['sbom', 'risk', 'cvd'],
    euMarket: false,
  };
  const { total, deltas } = scoreBreakdown(a);
  assert.deepEqual(deltas, []);
  // 100 + 0 clamped to the documented 5-98 ceiling.
  assert.equal(total, 98);
  assert.equal(readinessScore(a), 98);
}

// ── scoreBreakdown: worst realistic case — every negative delta fires ────────
{
  const a: SelfCheckAnswers = {
    hasDigital: 'yes',
    category: 'classII', // hard route
    evidence: [], // all 3 required artifacts missing
    euMarket: true,
    portfolioSize: 'p50plus', // queue penalty eligible
  };
  const { total, deltas } = scoreBreakdown(a);
  assert.deepEqual(deltas, [
    { key: 'missing_sbom', points: -22 },
    { key: 'missing_risk', points: -22 },
    { key: 'missing_cvd', points: -22 },
    { key: 'hard_route', points: -14 },
    { key: 'eu_market', points: -4 },
    { key: 'queue', points: -8 },
  ]);
  // 100 - 92 = 8, above the 5 floor.
  assert.equal(total, 8);
  assert.equal(readinessScore(a), 8);
}

// ── scoreBreakdown: certification and SDL add points; queue penalty needs BOTH
//    a hard route AND a large-enough portfolio ────────────────────────────────
{
  const a: SelfCheckAnswers = {
    hasDigital: 'yes',
    category: 'classII', // hard route, but portfolio is small -> no queue penalty
    evidence: ['sbom', 'risk', 'cvd', 'cert', 'sdl'],
    portfolioSize: 'p1',
  };
  const { deltas } = scoreBreakdown(a);
  assert.deepEqual(deltas, [
    { key: 'hard_route', points: -14 },
    { key: 'cert', points: 12 },
    { key: 'sdl', points: 6 },
  ]);
}
// cert_progress only counts when the full cert isn't already held (else/if, not both).
{
  const a: SelfCheckAnswers = {
    hasDigital: 'yes',
    category: 'default',
    evidence: ['sbom', 'risk', 'cvd', 'cert', 'cert_progress'],
  };
  const { deltas } = scoreBreakdown(a);
  assert.deepEqual(deltas, [{ key: 'cert', points: 12 }]);
}

// ── readinessBand ──────────────────────────────────────────────────────────
// No gaps, easy route -> on_track.
assert.equal(
  readinessBand({ hasDigital: 'yes', category: 'default', evidence: ['sbom', 'risk', 'cvd'] }),
  'on_track',
);
// Exactly one gap, easy route -> behind (recoverable).
assert.equal(
  readinessBand({ hasDigital: 'yes', category: 'default', evidence: ['sbom', 'cvd'] }),
  'behind',
);
// Two or more gaps -> at_risk regardless of route.
assert.equal(
  readinessBand({ hasDigital: 'yes', category: 'default', evidence: [] }),
  'at_risk',
);
// Exactly one gap PLUS a hard route -> at_risk (the combination, not the count alone).
assert.equal(
  readinessBand({ hasDigital: 'yes', category: 'classII', evidence: ['risk', 'cvd'] }),
  'at_risk',
);

// ── runwayMath: pure date arithmetic, tested at exact week boundaries to
//    avoid any floor()-rounding ambiguity ─────────────────────────────────────
{
  // Mirrors the module's own (unexported) constants: the CRA Class I
  // self-assessment closure date and one week in ms.
  const WALL_MS = Date.UTC(2027, 11, 11); // 2027-12-11
  const WEEK_MS = 7 * 24 * 3600 * 1000;

  // `now` set exactly 20 weeks before the wall, offset 0 -> weeksAvailable = 20 exactly.
  const now20 = new Date(WALL_MS - 20 * WEEK_MS);
  {
    const r = runwayMath('p1', 0, now20);
    assert.equal(r.weeksNeededMin, 16); // 1 product * 16 weeks/product minimum
    assert.equal(r.weeksNeededMax, 24);
    assert.equal(r.weeksAvailable, 20);
    // 16 <= 20 -> fits, no overshoot.
    assert.equal(r.overshootWeeks, 0);
  }
  {
    // 10-product portfolio needs far more than 20 weeks serially.
    const r = runwayMath('p2_10', 0, now20);
    assert.equal(r.weeksNeededMin, 160);
    assert.equal(r.overshootWeeks, 140); // 160 - 20
  }
  // Shifting the start one quarter (13 weeks) later leaves only 7 weeks of runway.
  {
    const r = runwayMath('p1', 1, now20);
    assert.equal(r.weeksAvailable, 7);
    assert.equal(r.overshootWeeks, 9); // 16 - 7
  }
}

// ── applyCategoryChange: stale deployContext must not survive Back-navigation ─
{
  const withDeploy: SelfCheckAnswers = { category: 'classII', deployContext: 'nis2_essential' };
  // Changing away from classII/unsure clears the now-unreachable answer.
  const changed = applyCategoryChange(withDeploy, 'default');
  assert.equal(changed.category, 'default');
  assert.equal('deployContext' in changed, false);
}
{
  // Changing TO "unsure" keeps deployContext (that question is still reachable).
  const withDeploy: SelfCheckAnswers = { category: 'default', deployContext: 'nis2_essential' };
  const changed = applyCategoryChange(withDeploy, 'unsure');
  assert.equal(changed.deployContext, 'nis2_essential');
}
{
  // Staying on classII keeps it too.
  const withDeploy: SelfCheckAnswers = { category: 'classII', deployContext: 'nis2_essential' };
  const changed = applyCategoryChange(withDeploy, 'classII');
  assert.equal(changed.deployContext, 'nis2_essential');
}

// ── parsePrefill: the home-page teaser hand-off, nothing guessed ─────────────
assert.deepEqual(parsePrefill({}), { answers: {}, openOnCategory: false });
assert.deepEqual(parsePrefill({ position: 'manufacturer' }), {
  answers: { position: 'manufacturer' },
  openOnCategory: false,
});
// An invalid position is silently ignored, never guessed at.
assert.deepEqual(parsePrefill({ position: 'not-a-real-position' }), {
  answers: {},
  openOnCategory: false,
});
assert.deepEqual(parsePrefill({ classAware: 'default' }), {
  answers: { category: 'default' },
  openOnCategory: false,
});
// "unsure" / "no" class-awareness opens straight on the classification question
// instead of guessing a category.
assert.deepEqual(parsePrefill({ classAware: 'unsure' }), { answers: {}, openOnCategory: true });
assert.deepEqual(parsePrefill({ classAware: 'no' }), { answers: {}, openOnCategory: true });
// sbom=yes seeds one evidence item; sbom=no is absence of ONE artifact, not a
// signal about the others, so evidence stays unset entirely.
assert.deepEqual(parsePrefill({ sbom: 'yes' }), { answers: { evidence: ['sbom'] }, openOnCategory: false });
assert.deepEqual(parsePrefill({ sbom: 'no' }), { answers: {}, openOnCategory: false });

// ── miniVerdict: pure three-line string composition ───────────────────────────
{
  const t: TeaserCopy = {
    title: 't',
    q1: { label: 'l1', options: [] },
    q2: { label: 'l2', options: [] },
    q3: { label: 'l3', yes: 'y', no: 'n', noHint: 'h' },
    verdictScope: 'Likely in scope.',
    verdictRoute: {
      default: 'Default route text.',
      classI: 'Class I route text.',
      classII: 'Class II route text.',
      unsure: 'Unsure route text.',
    },
    verdictSbomGap: 'SBOM gap text.',
    verdictSbomOk: 'SBOM ok text.',
    cta: 'cta',
  };
  assert.equal(
    miniVerdict('classI', 'no', t),
    'Likely in scope. Class I route text. SBOM gap text.',
  );
  assert.equal(
    miniVerdict('default', 'yes', t),
    'Likely in scope. Default route text. SBOM ok text.',
  );
}

console.log('cra-selfcheck: all classification/scoring/prefill assertions passed ✓');
