/**
 * Public wiki act metadata (22.2) — deliberately DATA-FREE so the hub and
 * the route dispatcher stay in the light bundle; each act page lazy-loads
 * its own corpus chunk. No counts here either: numbers live in the corpus
 * bundles and are rendered where the bundle is loaded, never restated.
 */
export interface WikiActMeta {
  slug: string;
  actLabel: string;
  citeAs: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  kicker: string;
  banner: string;
  defaultArticle: number | string;
}

export const WIKI_ACT_META: WikiActMeta[] = [
  {
    slug: 'nis2',
    actLabel: 'NIS2',
    citeAs: 'Directive (EU) 2022/2555',
    title: 'NIS2 Directive — full text',
    seoTitle: 'NIS2 Directive (EU) 2022/2555 — full text, browsable | OXOT',
    seoDescription:
      'The NIS2 Directive, verbatim and browsable: all 46 articles, 144 recitals and 3 annexes with search, citations and deep links. Free, no signup.',
    kicker: 'VERBATIM OFFICIAL JOURNAL TEXT',
    banner:
      'NIS2 is a directive: the duties that bind an entity flow through each Member State’s implementing law. This is the Directive’s own text, reproduced from the Official Journal and verified character-exact in CI.',
    defaultArticle: 21,
  },
  {
    slug: 'ai-act',
    actLabel: 'AI Act',
    citeAs: 'Regulation (EU) 2024/1689',
    title: 'EU AI Act — full text, as amended',
    seoTitle: 'EU AI Act (Regulation 2024/1689) — full text as amended | OXOT',
    seoDescription:
      'The EU AI Act, verbatim and browsable as amended (Digital Omnibus 2026/1744 applied): every article, recital and annex with search, citations and deep links. Free, no signup.',
    kicker: 'VERBATIM CONSOLIDATED TEXT (AS AMENDED)',
    banner:
      'Built from the EUR-Lex consolidated text — the Act as amended, with the amending instruments disclosed. A consolidated text is a documentation tool without legal effect of its own; the amending acts are the law.',
    defaultArticle: 6,
  },
  {
    slug: 'machinery',
    actLabel: 'Machinery',
    citeAs: 'Regulation (EU) 2023/1230',
    title: 'Machinery Regulation — full text, as amended',
    seoTitle: 'EU Machinery Regulation (2023/1230) — full text as amended | OXOT',
    seoDescription:
      'The Machinery Regulation, verbatim and browsable as amended: every article, recital and annex — including the Annex III cybersecurity requirements — with search, citations and deep links.',
    kicker: 'VERBATIM CONSOLIDATED TEXT (AS AMENDED)',
    banner:
      'Built from the EUR-Lex consolidated text — the Regulation as amended, amending instruments disclosed. A consolidated text is a documentation tool without legal effect of its own; the amending acts are the law.',
    defaultArticle: 10,
  },
  {
    slug: 'red',
    actLabel: 'RED',
    citeAs: 'Directive 2014/53/EU',
    title: 'Radio Equipment Directive — full text, as amended',
    seoTitle: 'Radio Equipment Directive (2014/53/EU) — full text as amended | OXOT',
    seoDescription:
      'The Radio Equipment Directive, verbatim and browsable as amended — including the Article 3(3) cybersecurity hooks that hand over to the CRA on 11 December 2027. Free, no signup.',
    kicker: 'VERBATIM CONSOLIDATED TEXT (AS AMENDED)',
    banner:
      'RED is a directive: operator-binding duties flow through national implementing law. Built from the EUR-Lex consolidated text, amending instruments disclosed; the amending acts are the law.',
    defaultArticle: 3,
  },
  {
    slug: 'gdpr',
    actLabel: 'GDPR',
    citeAs: 'Regulation (EU) 2016/679',
    title: 'GDPR — full text, corrigenda applied',
    seoTitle: 'GDPR (Regulation 2016/679) — full text, corrigenda applied | OXOT',
    seoDescription:
      'The GDPR, verbatim and browsable with the 2018 English corrigendum applied and disclosed per article: all 99 articles and 173 recitals with search, citations and deep links. Free, no signup.',
    kicker: 'VERBATIM OFFICIAL JOURNAL TEXT (CORRIGENDA APPLIED)',
    banner:
      'The authentic OJ text with the English corrigendum of 23 May 2018 applied — each corrected article says so where you read it. Directly applicable in every Member State since 25 May 2018.',
    defaultArticle: 32,
  },
  {
    slug: 'data-act',
    actLabel: 'Data Act',
    citeAs: 'Regulation (EU) 2023/2854',
    title: 'EU Data Act — full text',
    seoTitle: 'EU Data Act (Regulation 2023/2854) — full text, browsable | OXOT',
    seoDescription:
      'The EU Data Act, verbatim and browsable: every article and recital — including the connected-product access-by-design duties — with search, citations and deep links. Free, no signup.',
    kicker: 'VERBATIM OFFICIAL JOURNAL TEXT (CORRIGENDA APPLIED)',
    banner:
      'The authentic OJ text with the English corrigendum applied and disclosed where it touches the text. Directly applicable across the Union.',
    defaultArticle: 3,
  },
];
