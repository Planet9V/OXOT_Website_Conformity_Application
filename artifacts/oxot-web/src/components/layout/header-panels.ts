/**
 * Dropdown panel definitions for the desktop navigation.
 * Extracted into a plain .ts module so it can be imported by unit tests
 * without pulling in React or any component dependencies.
 *
 * Keyed by the nav item's href so locale doesn't matter.
 */

export type DropItem = {
  label: string;
  description: string;
  href: string;
  external?: boolean;
  isSectionLabel?: boolean;
};

export type Panel = { cols: 1 | 2; items: DropItem[] };

export const PANELS: Record<string, Panel> = {
  '/services': {
    cols: 2,
    items: [
      {
        label: 'Services overview',
        description: 'What we do, how we work, and how it maps to the EU frameworks.',
        href: '/services',
      },
      {
        label: 'OT Security Assessments',
        description: 'Understand your current OT security posture, key risks and next steps.',
        href: '/services#ot-security-assessments',
      },
      {
        label: 'Cyber Digital Twin',
        description: 'A living model of your OT environment for risk-based decisions at scale.',
        href: '/cyber-digital-twin',
      },
      {
        label: 'OT Security Programmes',
        description: 'Structured OT security improvement programmes across sites and regions.',
        href: '/services#ot-security-programmes',
      },
      {
        label: 'Architecture & Segmentation',
        description: 'Secure OT network architectures, zones, conduits and segmentation patterns.',
        href: '/services#architecture-segmentation',
      },
      {
        label: 'Secure Remote Access',
        description: 'Reduce risk from vendor access, remote maintenance and external connectivity.',
        href: '/services#secure-remote-access',
      },
      {
        label: 'OT Security Baseline',
        description: 'Minimum controls that are realistic, repeatable and operations-aligned.',
        href: '/services#ot-security-baseline',
      },
      {
        label: 'Capability Transfer',
        description: 'Build internal knowledge, structure and ownership to sustain OT security.',
        href: '/services#capability-transfer',
      },
      // ── Conformity Platform section ──────────────────────────────────────────
      {
        label: 'Conformity Platform',
        description: '',
        href: '',
        isSectionLabel: true,
      },
      {
        label: 'Portfolio Overview',
        description: 'Executive summary of regulatory coverage and conformity requirements.',
        href: '/conformity-platform',
      },
      {
        label: 'Competitor Matrix',
        description: 'Why OT leaders choose OXOT over generic IT GRC & binary scanners.',
        href: '/compare',
      },
      {
        label: 'Regulations',
        description: 'Browse every regulation and its mapped obligations.',
        href: '/conformity-platform/regulations',
      },
      {
        label: 'Requirements Explorer',
        description: 'Search and filter across all framework obligations.',
        href: '/conformity-platform/requirements',
      },
      {
        label: 'Cross-Regulation Matrix',
        description: 'See shared control themes across CRA, NIS2, AI Act and IEC 62443.',
        href: '/conformity-platform/matrix',
      },
    ],
  },
  '/frameworks': {
    cols: 2,
    items: [
      {
        label: 'All frameworks',
        description: 'Every EU regulation and standard shaping OT cybersecurity obligations — mapped to common controls.',
        href: '/frameworks',
      },
      {
        label: 'Cross-regulation matrix',
        description: 'See how controls map across every framework at a glance.',
        href: '/frameworks/matrix',
      },
      {
        label: 'Cyber Resilience Act',
        description: 'Horizontal cybersecurity requirements for products with digital elements.',
        href: '/frameworks/cra',
      },
      {
        label: 'NIS2 Directive',
        description: 'Network and information security obligations for critical infrastructure.',
        href: '/frameworks/nis2',
      },
      {
        label: 'EU AI Act',
        description: 'Risk-based requirements for AI systems placed in high-risk categories.',
        href: '/frameworks/ai-act',
      },
      {
        label: 'IEC 62443',
        description: 'Industrial automation and control systems security standard.',
        href: '/frameworks/iec',
      },
      {
        label: 'Machinery Regulation',
        description: 'Safety and cybersecurity for machinery and safety-related control systems.',
        href: '/frameworks/machinery',
      },
    ],
  },
  '/insights': {
    cols: 2,
    items: [
      {
        label: 'All insights',
        description: 'Analysis and practical guides on securing industrial environments.',
        href: '/insights',
      },
      {
        label: 'Fooled by Randomness',
        description: "Why \"we've never had an incident\" is not evidence of safety.",
        href: '/cdt-fooled-by-randomness',
      },
    ],
  },
};
