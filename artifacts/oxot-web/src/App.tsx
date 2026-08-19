import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { Suspense, lazy, useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { stripLocalePrefix } from '@/providers/locale-routing';
import { ThemeProvider } from '@/providers/theme-provider';
import { LocaleProvider } from '@/providers/locale-provider';
import { Skeleton } from '@/components/ui/skeleton';

// Pages
import SlugPage from '@/pages/slug-page';
import FrameworksPage from '@/pages/frameworks-page';
import FrameworkDetailPage from '@/pages/framework-detail-page';
import FrameworksMatrixPage from '@/pages/frameworks-matrix-page';
import ConformityRegulations from '@/pages/conformity-regulations';
import ConformityRegulationDetail from '@/pages/conformity-regulation-detail';
import ConformityRequirements from '@/pages/conformity-requirements';
import ConformityRequirementDetail from '@/pages/conformity-requirement-detail';
import ConformityThemes from '@/pages/conformity-themes';
import ConformityMappings from '@/pages/conformity-mappings';
import ConformitySources from '@/pages/conformity-sources';
import ConformitySourceViewer from '@/pages/conformity-source-viewer';
import StatutoryWorkbench from '@/pages/statutory-workbench';
import KnowledgeHubPage from '@/pages/knowledge-hub';
import RegulatoryNewsPage from '@/pages/regulatory-news';
import CraCheckPage from '@/pages/cra-check';
import PartnerScopePage from '@/pages/partner-scope';
import CraWikiPage from '@/pages/cra-wiki';
import CraHomePage from '@/pages/home';
import DemoPage from '@/pages/demo';
import PricingPage from '@/pages/pricing';
import ProductPage from '@/pages/product';
import SolutionsHubPage from '@/pages/solutions-hub';
import OperatorsPage from '@/pages/operators';
import ManufacturersPage from '@/pages/manufacturers';
import CraTransitPage from '@/pages/cra-transit';
import SuppliersPage from '@/pages/suppliers';
import SuppliersSecurityIpPage from '@/pages/suppliers-security-ip';
import SuppliersTourPage from '@/pages/suppliers-tour';
import DeploymentPage from '@/pages/deployment';
import ResourcesPage from '@/pages/resources';
import CompetitorsPage from '@/pages/competitors-page';
import TrustCenterPage from '@/pages/trust-center-page';
import NewsletterConfirm from '@/pages/newsletter-confirm';
import NewsletterUnsubscribe from '@/pages/newsletter-unsubscribe';
import PodcastHubPage from '@/pages/podcast-hub';
import BlogHubPage from '@/pages/blog-hub';
import BlogPostPage from '@/pages/blog-post';
import CraFaqPage from '@/pages/cra-faq';
import NotFound from '@/pages/not-found';
import { PublicLayout } from '@/components/layout/public-layout';
import { CookieConsentProvider } from '@/components/cookie-consent';

// Code-split: the admin console and the conformity dashboard (recharts +
// framer-motion heavy) are never visited by a typical marketing-site visitor,
// but were previously statically imported into App.tsx, so the public
// homepage shipped the same bundle weight as the authenticated admin
// console. Lazy-loading them keeps that weight out of the first-load chunk
// for every public page. Mirrors the pattern already proven in
// conformity/src/pages/dashboard.tsx (its own CommandCenter lazy-load).
const ConformityDashboard = lazy(() => import('@/pages/conformity-dashboard'));
// 22.2 — the public statutory wikis. Each act page carries a large corpus
// bundle; lazy per-route so the reading room never taxes the funnel pages.
const WikiHubPage = lazy(() => import('@/pages/wiki-hub'));
const TourPage = lazy(() => import('@/pages/tour'));
const WikiActRoutes = lazy(() => import('@/pages/wiki-act-routes'));
const AdminLogin = lazy(() => import('@/pages/admin-login'));
const AdminDashboard = lazy(() => import('@/pages/admin-dashboard'));
const AdminLeads = lazy(() => import('@/pages/admin-leads'));
const AdminPages = lazy(() => import('@/pages/admin-pages'));
const AdminPageEditor = lazy(() => import('@/pages/admin-page-editor'));
const AdminMenus = lazy(() => import('@/pages/admin-menus'));
const AdminCarousel = lazy(() => import('@/pages/admin-carousel'));
const AdminAi = lazy(() => import('@/pages/admin-ai'));
const AdminSeo = lazy(() => import('@/pages/admin-seo'));
const AdminAnalytics = lazy(() => import('@/pages/admin-analytics'));
const AdminNewsletter = lazy(() => import('@/pages/admin-newsletter'));
const AdminSettings = lazy(() => import('@/pages/admin-settings'));
const AdminIntegrations = lazy(() => import('@/pages/admin-integrations'));

/** Minimal full-viewport loading state shown only while a lazy chunk loads. */
function RouteLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Skeleton className="h-8 w-40" />
    </div>
  );
}

// Root cause of a stuck "Content unavailable" state on any bad slug (both
// locales): the default retry policy retries EVERY error, including a 404 —
// which is deterministic and will never succeed on retry. Under a paused
// fetchStatus (e.g. a momentary network blip), that left the query stuck
// mid-retry indefinitely, so `error` never settled and pages like
// slug-page.tsx never reached their `error.status === 404` branch. 4xx client
// errors are never worth retrying; only network/5xx failures are.
function isNonRetryableClientError(error: unknown): boolean {
  const status = (error as { status?: number })?.status;
  return typeof status === 'number' && status >= 400 && status < 500;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (isNonRetryableClientError(error)) return false;
        return failureCount < 3;
      },
    },
  },
});

// Wrap public routes in the PublicLayout shell
function PublicRoute({ component: Component }: { component: any }) {
  return (
    <PublicLayout>
      <Component />
    </PublicLayout>
  );
}

const CraFaqRoute = () => <PublicRoute component={CraFaqPage} />;
const BlogHubRoute = () => <PublicRoute component={BlogHubPage} />;
const BlogPostRoute = () => <PublicRoute component={BlogPostPage} />;
const PodcastHubRoute = () => <PublicRoute component={PodcastHubPage} />;

// Public content routes. Mounted twice: once at the site root (English) and once
// nested under "/nl" (Dutch). Because the "/nl" mount is a nested wouter Router,
// every <Link> and useLocation inside these routes is automatically relative to
// the active locale prefix — no per-link locale logic is required.
function PublicRoutes() {
  return (
    <Switch>
      <Route path="/newsletter/confirm">
        {() => <PublicRoute component={NewsletterConfirm} />}
      </Route>
      <Route path="/newsletter/unsubscribe">
        {() => <PublicRoute component={NewsletterUnsubscribe} />}
      </Route>
      <Route path="/compare">
        {() => <PublicRoute component={CompetitorsPage} />}
      </Route>
      <Route path="/trust/:productId">
        {() => <PublicRoute component={TrustCenterPage} />}
      </Route>
      <Route path="/trust">
        {() => <PublicRoute component={TrustCenterPage} />}
      </Route>
      <Route path="/">
        {() => <PublicRoute component={CraHomePage} />}
      </Route>

      {/* CRA sales funnel — static routes, no CMS dependency (durable across rebuilds) */}
      <Route path="/product">
        {() => <PublicRoute component={ProductPage} />}
      </Route>
      <Route path="/solutions">
        {() => <PublicRoute component={SolutionsHubPage} />}
      </Route>
      <Route path="/operators">
        {() => <PublicRoute component={OperatorsPage} />}
      </Route>
      <Route path="/manufacturers">
        {() => <PublicRoute component={ManufacturersPage} />}
      </Route>
      <Route path="/cra-transit">
        {() => <PublicRoute component={CraTransitPage} />}
      </Route>
      <Route path="/suppliers/security-ip">
        {() => <PublicRoute component={SuppliersSecurityIpPage} />}
      </Route>
      <Route path="/suppliers/tour">
        {() => <PublicRoute component={SuppliersTourPage} />}
      </Route>
      <Route path="/suppliers">
        {() => <PublicRoute component={SuppliersPage} />}
      </Route>
      <Route path="/tour">
        <Suspense fallback={<RouteLoadingFallback />}>
          <TourPage />
        </Suspense>
      </Route>
      <Route path="/pricing">
        {() => <PublicRoute component={PricingPage} />}
      </Route>
      <Route path="/deployment">
        {() => <PublicRoute component={DeploymentPage} />}
      </Route>
      <Route path="/resources">
        {() => <PublicRoute component={ResourcesPage} />}
      </Route>
      <Route path="/demo">
        {() => <PublicRoute component={DemoPage} />}
      </Route>
      <Route path="/faq" component={CraFaqRoute} />
      <Route path="/faq/" component={CraFaqRoute} />
      <Route path="/faqs" component={CraFaqRoute} />
      <Route path="/faqs/" component={CraFaqRoute} />
      <Route path="/conformity/cra-faq" component={CraFaqRoute} />
      <Route path="/conformity/cra-faq/" component={CraFaqRoute} />
      <Route path="/blog" component={BlogHubRoute} />
      <Route path="/blog/" component={BlogHubRoute} />
      <Route path="/blogs" component={BlogHubRoute} />
      <Route path="/blogs/" component={BlogHubRoute} />
      <Route path="/blog/:slug" component={BlogPostRoute} />
      <Route path="/blogs/:slug" component={BlogPostRoute} />
      <Route path="/podcast" component={PodcastHubRoute} />
      <Route path="/podcast/" component={PodcastHubRoute} />

      {/* Frameworks section — registered before /:slug so /frameworks isn't swallowed */}
      <Route path="/knowledge">
        {() => <PublicRoute component={KnowledgeHubPage} />}
      </Route>
      <Route path="/news">
        {() => <PublicRoute component={RegulatoryNewsPage} />}
      </Route>
      <Route path="/cra-check">
        {() => <PublicRoute component={CraCheckPage} />}
      </Route>
      <Route path="/partner-scope">
        {() => <PublicRoute component={PartnerScopePage} />}
      </Route>
      <Route path="/partner-scope/">
        {() => <PublicRoute component={PartnerScopePage} />}
      </Route>
      <Route path="/axians">
        {() => <PublicRoute component={PartnerScopePage} />}
      </Route>
      <Route path="/axians/">
        {() => <PublicRoute component={PartnerScopePage} />}
      </Route>
      <Route path="/wiki/cra">
        {() => <PublicRoute component={CraWikiPage} />}
      </Route>
      <Route path="/wiki/cra/">
        {() => <PublicRoute component={CraWikiPage} />}
      </Route>
      <Route path="/wiki/:slug">
        {() => <PublicRoute component={WikiActRoutes} />}
      </Route>
      <Route path="/wiki">
        {() => <PublicRoute component={WikiHubPage} />}
      </Route>
      <Route path="/wiki/">
        {() => <PublicRoute component={WikiHubPage} />}
      </Route>
      <Route path="/frameworks">
        {() => <PublicRoute component={FrameworksPage} />}
      </Route>
      <Route path="/frameworks/matrix">
        {() => <PublicRoute component={FrameworksMatrixPage} />}
      </Route>
      <Route path="/frameworks/:key">
        {() => <PublicRoute component={FrameworkDetailPage} />}
      </Route>

      {/* Conformity Platform — registered before /:slug */}
      <Route path="/conformity">
        {() => <PublicRoute component={ConformityDashboard} />}
      </Route>
      <Route path="/conformity/">
        {() => <PublicRoute component={ConformityDashboard} />}
      </Route>
      <Route path="/conformity/regulations">
        {() => <PublicRoute component={ConformityRegulations} />}
      </Route>
      <Route path="/conformity/regulations/">
        {() => <PublicRoute component={ConformityRegulations} />}
      </Route>
      <Route path="/conformity/regulations/:key">
        {() => <PublicRoute component={ConformityRegulationDetail} />}
      </Route>
      <Route path="/conformity/requirements">
        {() => <PublicRoute component={ConformityRequirements} />}
      </Route>
      <Route path="/conformity/requirements/">
        {() => <PublicRoute component={ConformityRequirements} />}
      </Route>
      <Route path="/conformity/requirements/:id">
        {() => <PublicRoute component={ConformityRequirementDetail} />}
      </Route>
      <Route path="/conformity/themes">
        {() => <PublicRoute component={ConformityThemes} />}
      </Route>
      <Route path="/conformity/themes/">
        {() => <PublicRoute component={ConformityThemes} />}
      </Route>
      <Route path="/conformity/matrix">
        {() => <PublicRoute component={ConformityMappings} />}
      </Route>
      <Route path="/conformity/matrix/">
        {() => <PublicRoute component={ConformityMappings} />}
      </Route>
      <Route path="/conformity/mappings">
        {() => <PublicRoute component={ConformityMappings} />}
      </Route>
      <Route path="/conformity/mappings/">
        {() => <PublicRoute component={ConformityMappings} />}
      </Route>
      <Route path="/conformity/sources">
        {() => <PublicRoute component={ConformitySources} />}
      </Route>
      <Route path="/conformity/sources/">
        {() => <PublicRoute component={ConformitySources} />}
      </Route>

      <Route path="/conformity-platform">
        {() => <PublicRoute component={ConformityDashboard} />}
      </Route>
      <Route path="/conformity-platform/">
        {() => <PublicRoute component={ConformityDashboard} />}
      </Route>
      <Route path="/conformity-platform/regulations">
        {() => <PublicRoute component={ConformityRegulations} />}
      </Route>
      <Route path="/conformity-platform/regulations/:key">
        {() => <PublicRoute component={ConformityRegulationDetail} />}
      </Route>
      <Route path="/conformity-platform/requirements">
        {() => <PublicRoute component={ConformityRequirements} />}
      </Route>
      <Route path="/conformity-platform/requirements/:id">
        {() => <PublicRoute component={ConformityRequirementDetail} />}
      </Route>
      <Route path="/conformity-platform/themes">
        {() => <PublicRoute component={ConformityThemes} />}
      </Route>
      <Route path="/conformity-platform/matrix">
        {() => <PublicRoute component={ConformityMappings} />}
      </Route>
      <Route path="/conformity-platform/sources/view/:filename">
        {() => <PublicRoute component={ConformitySourceViewer} />}
      </Route>
      <Route path="/conformity-platform/sources">
        {() => <PublicRoute component={ConformitySources} />}
      </Route>
      <Route path="/conformity-platform/statutory-workbench">
        {() => <PublicRoute component={StatutoryWorkbench} />}
      </Route>

      <Route path="/:slug">
        {() => <PublicRoute component={SlugPage} />}
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  const [location, navigate] = useLocation();

  // Admin is locale-agnostic and mounted only at "/admin/*". A stray
  // "/nl/admin/..." URL (e.g. from a bad share) would otherwise hit the public
  // 404 — redirect it back to the canonical admin path.
  useEffect(() => {
    if (location === '/nl/admin' || location.startsWith('/nl/admin/')) {
      navigate(stripLocalePrefix(location), { replace: true });
    }
  }, [location, navigate]);

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Switch>
        {/* Admin Routes - No Public Layout, locale-agnostic */}
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/pages/:id">
          {(params) => <AdminPageEditor id={Number(params.id)} />}
        </Route>
        <Route path="/admin/pages" component={AdminPages} />
        <Route path="/admin/menus" component={AdminMenus} />
        <Route path="/admin/carousel" component={AdminCarousel} />
        <Route path="/admin/leads" component={AdminLeads} />
        <Route path="/admin/ai" component={AdminAi} />
        <Route path="/admin/seo" component={AdminSeo} />
        <Route path="/admin/analytics" component={AdminAnalytics} />

        <Route path="/admin/newsletter" component={AdminNewsletter} />
        <Route path="/admin/settings" component={AdminSettings} />
        <Route path="/admin/integrations" component={AdminIntegrations} />

        {/* Dutch public pages — nested router gives every child a "/nl" base. */}
        <Route path="/nl" nest>
          <PublicRoutes />
        </Route>

        {/* English public pages — default locale at the site root. */}
        <Route>
          <PublicRoutes />
        </Route>
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* reducedMotion="user" makes every framer-motion component (existing
          and future) automatically honor the OS prefers-reduced-motion
          setting, with zero per-component changes. */}
      <MotionConfig reducedMotion="user">
        <ThemeProvider defaultTheme="dark" storageKey="oxot-theme">
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <LocaleProvider>
              <CookieConsentProvider>
                <TooltipProvider>
                  <Router />
                  <Toaster />
                </TooltipProvider>
              </CookieConsentProvider>
            </LocaleProvider>
          </WouterRouter>
        </ThemeProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}

export default App;
