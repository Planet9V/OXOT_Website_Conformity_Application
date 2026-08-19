import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Redirect, Route, Switch, Router as WouterRouter } from 'wouter';
import { ThemeProvider } from './providers/theme-provider';
import { TooltipProvider } from './components/ui/tooltip';
import { Toaster } from './components/ui/sonner';
import { AppShell } from './components/layout';
import { AuthGate } from './components/auth-gate';

import Dashboard from './pages/dashboard';
import Regulations from './pages/regulations';
import RegulationDetail from './pages/regulation-detail';
import Themes from './pages/themes';
import Requirements from './pages/requirements';
import RequirementDetail from './pages/requirement-detail';
import Mappings from './pages/mappings';
import Sources from './pages/sources';
import SourceViewer from './pages/source-viewer';
import Products from './pages/products';
import ProductDetail from './pages/product-detail';
import Team from './pages/team';
import Welcome from './pages/welcome';
import Demo from './pages/demo';
import Onboarding from './pages/onboarding';
import IncidentsPage from './pages/incidents';
import LibraryPage from './pages/library';
import ProjectsPage from './pages/projects';
import AuthoritiesPage from './pages/authorities';
import SignaturesPage from './pages/signatures';
import Profile from './pages/profile';
import Security from './pages/security';

import React, { Component, Suspense, lazy, type ReactNode } from "react";
import { Skeleton } from './components/ui/skeleton';

// Code-split the heaviest feature workspaces (chart-heavy) out of the main
// bundle — every route in this app was previously statically imported, so
// visiting /team pulled in PSIRT's recharts bundle too. Mirrors the
// lazy-load pattern already proven in pages/dashboard.tsx (its own
// CommandCenter lazy-load).
const Assessment = lazy(() => import('./pages/assessment'));
const Flows = lazy(() => import('./pages/flows'));
const ReportWorkspace = lazy(() => import('./pages/report-workspace'));
const AuditorPortalPage = lazy(() => import('./pages/auditor-portal'));
const SupplierPortalPage = lazy(() => import('./pages/supplier-portal'));
const DeliveryManifestPage = lazy(() => import('./pages/delivery-manifest'));
const AssurancePackagePage = lazy(() => import('./pages/assurance-package'));
const CraWikiPage = lazy(() => import('./pages/cra-wiki'));
const Nis2ReaderPage = lazy(() => import('./pages/nis2-reader'));
const CbwReaderPage = lazy(() => import('./pages/cbw-reader'));
const BsigReaderPage = lazy(() => import('./pages/bsig-reader'));
const AiActReaderPage = lazy(() => import('./pages/ai-act-reader'));
const MachineryReaderPage = lazy(() => import('./pages/machinery-reader'));
const RedReaderPage = lazy(() => import('./pages/red-reader'));
const GdprReaderPage = lazy(() => import('./pages/gdpr-reader'));
const DataActReaderPage = lazy(() => import('./pages/data-act-reader'));
const OrgProfilePage = lazy(() => import('./pages/org-profile'));
const PodcastStudioPage = lazy(() => import('./pages/podcast-studio'));

/** Minimal loading state shown only while a lazy chunk loads. */
function RouteLoadingFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <Skeleton className="h-8 w-40" />
    </div>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-3xl p-8 my-12 bg-card border border-destructive/40 rounded-3xl text-center space-y-4 shadow-2xl">
          <div className="text-red-500 font-mono text-xs font-bold uppercase tracking-wider">
            Runtime Component Error Handled
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Workbench Section Recovery
          </h2>
          <pre className="text-xs font-mono text-destructive bg-muted/60 p-4 rounded-xl text-left overflow-x-auto">
            {this.state.error?.stack || this.state.error?.toString() || "Unknown rendering exception"}
          </pre>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-extrabold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Reload Workbench
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// The reference library + execution workbench live inside the app shell (header,
// nav, footer). The whole shell is gated: reaching any /conformity/* route
// challenges for sign-in first, and the login overlay hides everything beneath
// it until authenticated. The public front doors (/welcome, /demo, /security,
// /auditor-portal) live outside this shell in Router() and stay open.
function ShellRoutes() {
  return (
    <AuthGate>
      <AppShell>
        <Suspense fallback={<RouteLoadingFallback />}>
        <Switch>
          {/* ── The nine destinations (DESIGN_five_shapes.md iteration 2, task 7.1).
              Several mount DONOR pages until their surface is rebuilt in
              7.2–7.6 — the shell ships first, the surfaces follow. */}
          <Route path="/" component={Dashboard} />
          <Route path="/incidents">
            <ErrorBoundary>
              <IncidentsPage />
            </ErrorBoundary>
          </Route>
          <Route path="/authorities" component={AuthoritiesPage} />
          <Route path="/signatures" component={SignaturesPage} />
          <Route path="/products">
            <ErrorBoundary>
              <Products />
            </ErrorBoundary>
          </Route>
          <Route path="/products/:id">
            <ErrorBoundary>
              <ProductDetail />
            </ErrorBoundary>
          </Route>
          <Route path="/projects" component={ProjectsPage} />
          <Route path="/organisation" component={OrgProfilePage} />
          {/* Library (7.6a): one destination owns all reference content. */}
          <Route path="/library" component={LibraryPage} />
          <Route path="/library/statute" component={CraWikiPage} />
          <Route path="/library/nis2" component={Nis2ReaderPage} />
          <Route path="/library/cbw" component={CbwReaderPage} />
          <Route path="/library/bsig" component={BsigReaderPage} />
          <Route path="/library/ai-act" component={AiActReaderPage} />
          <Route path="/library/machinery" component={MachineryReaderPage} />
          <Route path="/library/red" component={RedReaderPage} />
          <Route path="/library/gdpr" component={GdprReaderPage} />
          <Route path="/library/data-act" component={DataActReaderPage} />
          <Route path="/library/statute/*" component={CraWikiPage} />
          <Route path="/library/acts" component={Regulations} />
          <Route path="/library/acts/:key" component={RegulationDetail} />
          <Route path="/library/requirements" component={Requirements} />
          <Route path="/library/requirements/:id" component={RequirementDetail} />
          <Route path="/library/themes" component={Themes} />
          <Route path="/library/mappings" component={Mappings} />
          <Route path="/library/sources" component={Sources} />
          <Route path="/library/sources/view/:filename" component={SourceViewer} />
          <Route path="/settings" component={Team} />

          {/* ── Retired paths redirect to their destination, so old bookmarks
              and deep links keep working. */}
          <Route path="/overview"><Redirect to="/" /></Route>
          {/* psirt + psirt-tools retired (8.2): the real machinery lives in Incidents. */}
          <Route path="/psirt"><Redirect to="/incidents" /></Route>
          <Route path="/psirt-tools"><Redirect to="/incidents" /></Route>
          <Route path="/psirt/*"><Redirect to="/incidents" /></Route>
          <Route path="/steward"><Redirect to="/projects" /></Route>
          <Route path="/open-source-steward"><Redirect to="/projects" /></Route>
          <Route path="/org-profile"><Redirect to="/organisation" /></Route>
          <Route path="/team"><Redirect to="/settings" /></Route>
          <Route path="/wiki"><Redirect to="/library/statute" /></Route>
          <Route path="/wiki/*"><Redirect to="/library/statute" /></Route>
          <Route path="/cra-wiki"><Redirect to="/library/statute" /></Route>
          <Route path="/cra-wiki/*"><Redirect to="/library/statute" /></Route>
          {/* The nine reference pages live under Library now (7.6a). */}
          <Route path="/regulations"><Redirect to="/library/acts" /></Route>
          <Route path="/regulations/:key">
            {(params) => <Redirect to={`/library/acts/${params.key}`} />}
          </Route>
          <Route path="/themes"><Redirect to="/library/themes" /></Route>
          <Route path="/requirements"><Redirect to="/library/requirements" /></Route>
          <Route path="/requirements/:id">
            {(params) => <Redirect to={`/library/requirements/${params.id}`} />}
          </Route>
          <Route path="/mappings"><Redirect to="/library/mappings" /></Route>
          <Route path="/sources"><Redirect to="/library/sources" /></Route>
          <Route path="/sources/view/:filename">
            {(params) => <Redirect to={`/library/sources/view/${params.filename}`} />}
          </Route>
          {/* Alias sprawl collapsed: one canonical path per surviving page. */}
          <Route path="/standards-matrix"><Redirect to="/standards" /></Route>
          <Route path="/ce-nameplate"><Redirect to="/ce-studio" /></Route>
          <Route path="/ce-nameplate-studio"><Redirect to="/ce-studio" /></Route>
          <Route path="/importer-archive"><Redirect to="/archive" /></Route>
          <Route path="/podcast"><Redirect to="/podcast-studio" /></Route>
          <Route path="/podcast/*"><Redirect to="/podcast-studio" /></Route>
          <Route path="/blogs"><Redirect to="/podcast-studio" /></Route>
          <Route path="/blogs/*"><Redirect to="/podcast-studio" /></Route>

          {/* ── Transitional surfaces awaiting re-homing (7.2–7.6); reachable
              via the "More" menu, each retires with its re-homing task. */}
          <Route path="/assessments/:id" component={Assessment} />
          {/* Re-homed 9.2: the reports list lives on Home; each document
              still opens in the /reports/:id workspace. Flow authoring lives
              under Settings; /flows redirects so bookmarks survive. */}
          <Route path="/settings/flows" component={Flows} />
          <Route path="/flows"><Redirect to="/settings/flows" /></Route>
          <Route path="/reports/:id" component={ReportWorkspace} />
          <Route path="/reports"><Redirect to="/" /></Route>
          <Route path="/profile" component={Profile} />
          {/* Retired donors (7.3c, 9.1): partner-hub's stages live in the
              product file and Incidents; the archive's retention clocks live
              in the statutory file; the standards editor lives in each
              assessment's wizard; product-portfolio's import lives on
              Products, its rollup on Home, its documents in the product file. */}
          <Route path="/product-portfolio"><Redirect to="/products" /></Route>
          <Route path="/product-portfolio/*"><Redirect to="/products" /></Route>
          <Route path="/partner-hub"><Redirect to="/products" /></Route>
          <Route path="/partner-hub/*"><Redirect to="/products" /></Route>
          <Route path="/standards"><Redirect to="/library/statute" /></Route>
          {/* CE studio retired (8.3): CE facts live in each product's statutory
              file; nameplate rendering returns when the Art. 30(6) implementing
              acts give labels real content. */}
          <Route path="/ce-studio"><Redirect to="/products" /></Route>
          <Route path="/archive"><Redirect to="/products" /></Route>
          <Route path="/podcast-studio" component={PodcastStudioPage} />
          <Route path="/podcast-studio/*" component={PodcastStudioPage} />
          {/* /auditor-portal is registered ONLY outside this shell (below):
              it is the external, token-authenticated notified-body door —
              never an internal destination (9.3). */}
          <Route>
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-24 text-center flex flex-col items-center justify-center">
              <h2 className="text-2xl font-bold mb-2">404 — Page not found</h2>
              <p className="text-muted-foreground">
                The requested page does not exist in the conformity workbench.
              </p>
            </div>
          </Route>
        </Switch>
        </Suspense>
      </AppShell>
    </AuthGate>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/welcome" component={Welcome} />
      <Route path="/demo" component={Demo} />
      {/* Public CVD surface (Annex I Part II CRA) — no auth, full-bleed. */}
      <Route path="/security" component={Security} />
      {/* Notified Body Auditor Portal (Module B/H) — token-authenticated, full-bleed. */}
      <Route path="/auditor-portal">
        <Suspense fallback={<RouteLoadingFallback />}>
          <AuditorPortalPage />
        </Suspense>
      </Route>
      {/* Supplier evidence door (21.4) — token-authenticated, full-bleed. */}
      <Route path="/supplier-portal">
        <Suspense fallback={<RouteLoadingFallback />}>
          <SupplierPortalPage />
        </Suspense>
      </Route>
      {/* Delivery manifest customer view (B3) — token-authenticated, full-bleed. */}
      <Route path="/delivery-manifest">
        <Suspense fallback={<RouteLoadingFallback />}>
          <DeliveryManifestPage />
        </Suspense>
      </Route>
      {/* Full assurance-package customer view (B4) — token-authenticated, full-bleed. */}
      <Route path="/assurance-package">
        <Suspense fallback={<RouteLoadingFallback />}>
          <AssurancePackagePage />
        </Suspense>
      </Route>
      {/* Full-bleed like the demo front door: onboarding gets full attention. */}
      <Route path="/onboarding">
        <AuthGate>
          <Onboarding />
        </AuthGate>
      </Route>
      <Route>
        <ShellRoutes />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="oxot-conformity-theme">
        <TooltipProvider delayDuration={200}>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
