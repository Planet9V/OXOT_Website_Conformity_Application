import { PageSection } from '@workspace/api-client-react';
import { HeroSection } from './hero-section';
import { StatBandSection } from './stat-band-section';
import { FeatureGridSection } from './feature-grid-section';
import { TwoColumnSection } from './two-column-section';
import { ComparisonTableSection } from './comparison-table-section';
import { StepsSection } from './steps-section';
import { LogoWallSection } from './logo-wall-section';
import { FaqSection } from './faq-section';
import { QuoteSection } from './quote-section';
import { CtaSection } from './cta-section';
import { ArticleSection } from './article-section';

export function SectionRenderer({ section }: { section: PageSection }) {
  switch (section.type) {
    case 'article':
      return <ArticleSection data={section.data as any} />;
    case 'hero':
      return <HeroSection data={section.data as any} />;
    case 'stat_band':
      return <StatBandSection data={section.data as any} />;
    case 'feature_grid':
      return <FeatureGridSection data={section.data as any} />;
    case 'two_column':
      return <TwoColumnSection data={section.data as any} />;
    case 'comparison_table':
      return <ComparisonTableSection data={section.data as any} />;
    case 'steps':
      return <StepsSection data={section.data as any} />;
    case 'logo_wall':
      return <LogoWallSection data={section.data as any} />;
    case 'faq':
      return <FaqSection data={section.data as any} />;
    case 'quote':
      return <QuoteSection data={section.data as any} />;
    case 'cta':
      return <CtaSection data={section.data as any} />;
    default:
      console.warn(`Unknown section type: ${section.type}`);
      return null;
  }
}
