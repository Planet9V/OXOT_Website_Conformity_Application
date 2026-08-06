import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { useListPages } from '@workspace/api-client-react';
import { useLocale } from '@/providers/locale-provider';
import { cn } from '@/lib/utils';
import { resolveRelatedServices } from './related-services.logic';

type Locale = 'en' | 'nl';

const HEADING: Record<Locale, string> = { en: 'Related services', nl: 'Gerelateerde diensten' };
const CTA_LABEL: Record<Locale, string> = { en: 'Learn more', nl: 'Meer informatie' };

/**
 * A strip of two or three adjacent service cards rendered at the bottom of each
 * core service page, so readers can follow the natural service journey without
 * backtracking to the overview. Renders nothing for non-service pages.
 */
export function RelatedServices({ slug }: { slug: string }) {
  const { locale } = useLocale();
  const { data: pages } = useListPages(locale);

  // Relationships resolve by each page's stable serviceKey (see the logic
  // module), so a slug rename in the CMS never silently drops a card. Card
  // href/title/excerpt still come from the live CMS list so edits stay in sync.
  const items = resolveRelatedServices(pages ?? [], slug);
  if (items.length === 0) return null;

  return (
    <section className="w-full border-t border-border bg-muted/20 py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-8 flex items-center gap-2">
          <span className="inline-block h-px w-6 bg-primary" />
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {HEADING[locale]}
          </h2>
        </div>
        <div
          className={cn(
            'grid grid-cols-1 gap-5',
            items.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3',
          )}
        >
          {items.map((page) => (
            <Link
              key={page.slug}
              href={`/${page.slug}`}
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
              <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary">
                {page.title}
              </h3>
              {page.excerpt && (
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {page.excerpt}
                </p>
              )}
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                {CTA_LABEL[locale]}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
