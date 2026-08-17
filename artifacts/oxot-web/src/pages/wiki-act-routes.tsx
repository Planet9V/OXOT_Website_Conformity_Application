import { lazy, Suspense } from 'react';
import { useParams } from 'wouter';
import WikiHubPage from './wiki-hub';

/**
 * /wiki/:slug dispatcher (22.2) — each act's page (and its MB-scale corpus
 * bundle) is its own lazy chunk. Unknown slugs fall back to the hub.
 * (/wiki/cra is registered ahead of this route and never reaches it.)
 */
const PAGES: Record<string, ReturnType<typeof lazy>> = {
  'nis2': lazy(() => import('./wiki-nis2')),
  'ai-act': lazy(() => import('./wiki-ai-act')),
  'machinery': lazy(() => import('./wiki-machinery')),
  'red': lazy(() => import('./wiki-red')),
  'gdpr': lazy(() => import('./wiki-gdpr')),
  'data-act': lazy(() => import('./wiki-data-act')),
};

export default function WikiActRoutes() {
  const params = useParams<{ slug: string }>();
  const Page = PAGES[params.slug ?? ''];
  if (!Page) return <WikiHubPage />;
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-sm text-muted-foreground">Loading the statute…</div>}>
      <Page />
    </Suspense>
  );
}
