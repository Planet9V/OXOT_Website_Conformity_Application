import { useGetPage, getGetPageQueryKey } from '@workspace/api-client-react';
import { useLocale } from '@/providers/locale-provider';
import { SectionRenderer } from '@/components/sections/section-renderer';
import { Skeleton } from '@/components/ui/skeleton';
import { useSeo } from '@/hooks/use-seo';
import { LiveRegulatoryNewsFeed } from '@/components/sections/live-regulatory-news-feed';

export default function HomePage() {
  const { locale } = useLocale();
  const { data: page, isLoading, error } = useGetPage(locale, 'home', {
    query: { enabled: !!locale, queryKey: getGetPageQueryKey(locale, 'home') }
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

  if (isLoading) {
    return (
      <div className="w-full min-h-screen pt-24 pb-12 flex flex-col gap-12 px-4 container mx-auto">
        <Skeleton className="h-[400px] w-full rounded-2xl" />
        <Skeleton className="h-[200px] w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-[300px] w-full rounded-2xl" />
          <Skeleton className="h-[300px] w-full rounded-2xl" />
          <Skeleton className="h-[300px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl font-display font-bold mb-4">Content unavailable</h1>
        <p className="text-muted-foreground max-w-md">
          We couldn't load the homepage content. Please try again later.
        </p>
      </div>
    );
  }

  // Sort sections by order
  const sortedSections = [...(page.sections || [])].sort((a, b) => a.order - b.order);

  // Render hero section first, then the live regulatory news feed, then remaining sections
  const heroSection = sortedSections[0];
  const remainingSections = sortedSections.slice(1);

  return (
    <div className="w-full">
      {heroSection && <SectionRenderer key={heroSection.id} section={heroSection} />}
      <LiveRegulatoryNewsFeed />
      {remainingSections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </div>
  );
}
