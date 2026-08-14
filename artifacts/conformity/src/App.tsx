import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
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
import Overview from './pages/overview';
import Onboarding from './pages/onboarding';
import Profile from './pages/profile';
import Security from './pages/security';

import React, { Component, Suspense, lazy, type ReactNode } from "react";
import { Skeleton } from './components/ui/skeleton';

// Code-split the heaviest feature workspaces (chart-heavy or, in
// product-portfolio's case, a 1727-line single component) out of the main
// bundle — every route in this app was previously statically imported, so
// visiting /team pulled in PSIRT's recharts bundle and the whole product
// portfolio workspace too. Mirrors the lazy-load pattern already proven in
// pages/dashboard.tsx (its own CommandCenter lazy-load).
const Assessment = lazy(() => import('./pages/assessment'));
const Flows = lazy(() => import('./pages/flows'));
const Reports = lazy(() => import('./pages/reports'));
const ReportWorkspace = lazy(() => import('./pages/report-workspace'));
const Psirt = lazy(() => import('./pages/psirt'));
const ProductPortfolioPage = lazy(() =>
  import('./pages/product-portfolio').then((m) => ({ default: m.ProductPortfolioPage })),
);
const AuditorPortalPage = lazy(() => import('./pages/auditor-portal'));
const PartnerHubPage = lazy(() => import('./pages/partner-hub'));
const CraWikiPage = lazy(() => import('./pages/cra-wiki'));

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
          <Route path="/" component={Dashboard} />
          <Route path="/overview" component={Overview} />
          <Route path="/regulations" component={Regulations} />
          <Route path="/regulations/:key" component={RegulationDetail} />
          <Route path="/themes" component={Themes} />
          <Route path="/requirements" component={Requirements} />
          <Route path="/requirements/:id" component={RequirementDetail} />
          <Route path="/mappings" component={Mappings} />
          <Route path="/sources" component={Sources} />
          <Route path="/sources/view/:filename" component={SourceViewer} />
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
          <Route path="/assessments/:id" component={Assessment} />
          <Route path="/flows" component={Flows} />
          <Route path="/reports/:id" component={ReportWorkspace} />
          <Route path="/reports" component={Reports} />
          <Route path="/profile" component={Profile} />
          <Route path="/psirt">
            <ErrorBoundary>
              <Psirt />
            </ErrorBoundary>
          </Route>
          <Route path="/psirt/*">
            <ErrorBoundary>
              <Psirt />
            </ErrorBoundary>
          </Route>
          <Route path="/product-portfolio">
            <ErrorBoundary>
              <ProductPortfolioPage />
            </ErrorBoundary>
          </Route>
          <Route path="/product-portfolio/*">
            <ErrorBoundary>
              <ProductPortfolioPage />
            </ErrorBoundary>
          </Route>
          <Route path="/team" component={Team} />
          <Route path="/partner-hub" component={PartnerHubPage} />
          <Route path="/wiki" component={CraWikiPage} />
          <Route path="/wiki/*" component={CraWikiPage} />
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
