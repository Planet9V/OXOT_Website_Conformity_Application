import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { useEffect } from 'react';
import { stripLocalePrefix } from '@/providers/locale-routing';
import { ThemeProvider } from '@/providers/theme-provider';
import { LocaleProvider } from '@/providers/locale-provider';

// Pages
import HomePage from '@/pages/home-page';
import SlugPage from '@/pages/slug-page';
import FrameworksPage from '@/pages/frameworks-page';
import FrameworkDetailPage from '@/pages/framework-detail-page';
import FrameworksMatrixPage from '@/pages/frameworks-matrix-page';
import ConformityDashboard from '@/pages/conformity-dashboard';
import ConformityRegulations from '@/pages/conformity-regulations';
import ConformityRegulationDetail from '@/pages/conformity-regulation-detail';
import ConformityRequirements from '@/pages/conformity-requirements';
import ConformityRequirementDetail from '@/pages/conformity-requirement-detail';
import ConformityThemes from '@/pages/conformity-themes';
import ConformityMappings from '@/pages/conformity-mappings';
import ConformitySources from '@/pages/conformity-sources';
import AdminLogin from '@/pages/admin-login';
import AdminDashboard from '@/pages/admin-dashboard';
import AdminLeads from '@/pages/admin-leads';
import AdminPages from '@/pages/admin-pages';
import AdminPageEditor from '@/pages/admin-page-editor';
import AdminMenus from '@/pages/admin-menus';
import AdminCarousel from '@/pages/admin-carousel';
import AdminAi from '@/pages/admin-ai';
import AdminSeo from '@/pages/admin-seo';
import AdminAnalytics from '@/pages/admin-analytics';
import AdminNewsletter from '@/pages/admin-newsletter';
import AdminSettings from '@/pages/admin-settings';
import AdminIntegrations from '@/pages/admin-integrations';
import KnowledgeHubPage from '@/pages/knowledge-hub';
import RegulatoryNewsPage from '@/pages/regulatory-news';
import CompetitorsPage from '@/pages/competitors-page';
import TrustCenterPage from '@/pages/trust-center-page';
import NewsletterConfirm from '@/pages/newsletter-confirm';
import NewsletterUnsubscribe from '@/pages/newsletter-unsubscribe';
import NotFound from '@/pages/not-found';
import { PublicLayout } from '@/components/layout/public-layout';
import { CookieConsentProvider } from '@/components/cookie-consent';

const queryClient = new QueryClient();

// Wrap public routes in the PublicLayout shell
function PublicRoute({ component: Component }: { component: any }) {
  return (
    <PublicLayout>
      <Component />
    </PublicLayout>
  );
}

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
        {() => <PublicRoute component={HomePage} />}
      </Route>

      {/* Frameworks section — registered before /:slug so /frameworks isn't swallowed */}
      <Route path="/knowledge">
        {() => <PublicRoute component={KnowledgeHubPage} />}
      </Route>
      <Route path="/news">
        {() => <PublicRoute component={RegulatoryNewsPage} />}
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
      <Route path="/conformity-platform/sources">
        {() => <PublicRoute component={ConformitySources} />}
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
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

export default App;
