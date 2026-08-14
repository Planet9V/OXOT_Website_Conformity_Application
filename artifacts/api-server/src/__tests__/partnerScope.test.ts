import { describe, it, expect } from 'vitest';
import { evaluateNetworkScope } from '../lib/partnerScopeEngine';

describe('PartnerScopeEngine Statutory Calculations (Reg EU 2024/2847)', () => {
  it('correctly categorizes legacy pre-2027 hardware and computes fine liability', () => {
    const evaluation = evaluateNetworkScope(
      [
        {
          id: 'asset-1',
          vendor: 'Hirschmann',
          model: 'RS20 Rail Switch',
          category: 'switch',
          criticality: 'CRITICAL',
          installYear: 2017,
        },
        {
          id: 'asset-2',
          vendor: 'Siemens',
          model: 'SCALANCE XC208',
          category: 'switch',
          criticality: 'STANDARD',
          installYear: 2024,
        },
      ],
      100_000_000,
      'en'
    );

    expect(evaluation.totalAssetsCount).toBe(2);
    expect(evaluation.art14ExposedCount).toBe(1); // RS20 is EOS
    expect(evaluation.grandfatheredPre2027Count).toBe(2);
    expect(evaluation.classIAssetsCount).toBe(2);
    expect(evaluation.article61FineExposureEur).toBe(2_500_000); // 2.5% of 100M turnover
    expect(evaluation.recommendedCapexPullForwardEur).toBeGreaterThan(0);
  });

  it('matches legacy Hirschmann to identical spare parts under Recital 34', () => {
    const evaluation = evaluateNetworkScope(
      [
        {
          id: 'asset-1',
          vendor: 'Hirschmann',
          model: 'RS20',
          category: 'switch',
          criticality: 'CRITICAL',
          installYear: 2018,
        },
      ],
      50_000_000,
      'en'
    );

    const match = evaluation.sanitizedAssets[0];
    expect(match.recommendedAction).toBe('PULL_FORWARD_SPARE');
    expect(match.hasSpareMatch).toBe(true);
    expect(match.matchedSpareSku).toBe('BOBCAT-BRS20');
    expect(match.matchedSpareLeadHours).toBe(48);
  });

  it('generates commercial action plan with sales dialogue prompts', () => {
    const evaluation = evaluateNetworkScope(
      [
        {
          id: 'asset-1',
          vendor: 'Siemens',
          model: 'Scalance X208',
          category: 'switch',
          criticality: 'CRITICAL',
          installYear: 2016,
        },
      ],
      50_000_000,
      'nl'
    );

    expect(evaluation.commercialActionPlan.headline).toContain('CRA-Netwerkmoderniserings- en Vervangingsplan');
    expect(evaluation.commercialActionPlan.salesDialoguePrompts.urgencyPrompt).toContain('Artikel 14');
    expect(evaluation.commercialActionPlan.salesDialoguePrompts.partnerValuePrompt).toContain('Axians');
  });
});
