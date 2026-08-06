import { useGetPage, getGetPageQueryKey } from '@workspace/api-client-react';
import { useLocale } from '@/providers/locale-provider';
import { SectionRenderer } from '@/components/sections/section-renderer';
import { RelatedServices } from '@/components/sections/related-services';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'wouter';
import NotFound from './not-found';
import { useSeo } from '@/hooks/use-seo';

export default function SlugPage() {
  const { locale } = useLocale();
  const params = useParams();
  const slug = params.slug;

  const { data: page, isLoading, error } = useGetPage(locale, slug || '', {
    query: { enabled: !!locale && !!slug, queryKey: getGetPageQueryKey(locale, slug || '') }
  });

  useSeo(page ? {
    title: page.seoTitle || page.title,
    description: page.seoDescription,
    keywords: page.metaKeywords,
    canonicalUrl: page.canonicalUrl,
    noindex: page.noindex,
    ogTitle: page.ogTitle,
    ogDescription: page.ogDescription,
    ogImage: page.ogImage,
  } : null);

  if (!slug) return <NotFound />;

  if (isLoading) {
    return (
      <div className="w-full min-h-screen pt-32 pb-12 flex flex-col gap-12 px-4 container mx-auto">
        <Skeleton className="h-16 w-1/3 rounded-lg mx-auto" />
        <Skeleton className="h-[400px] w-full rounded-2xl mt-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-[200px] w-full rounded-2xl" />
          <Skeleton className="h-[200px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !page) {
    if ((error as any)?.status === 404) {
      return <NotFound />;
    }
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl font-display font-bold mb-4">Content unavailable</h1>
        <p className="text-muted-foreground max-w-md">
          We couldn't load this page. Please try again later.
        </p>
      </div>
    );
  }

  const sortedSections = [...(page.sections || [])].sort((a, b) => a.order - b.order);

  return (
    <div className="w-full">
      {sortedSections.length === 0 && (
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-4xl font-display font-bold mb-4">{page.title}</h1>
          <p className="text-muted-foreground">This page has no content yet.</p>
        </div>
      )}
      {sortedSections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
      <RelatedServices slug={slug} />
    </div>
  );
}
