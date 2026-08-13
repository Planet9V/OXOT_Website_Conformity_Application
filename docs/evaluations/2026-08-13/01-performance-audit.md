# Performance Audit — 2026-08-13

Evaluation of frontend JavaScript bundle size, Core Web Vitals risks, API response times, and rendering optimization across SPAs and API microservices.

## Executive Summary

The application demonstrates fast initial rendering times thanks to Vite bundling and lightweight Tailwind CSS v4 styling. However, bundle size inflation from heavy icon libraries, uncompressed report generation payloads, and synchronous PDF rendering pose performance bottlenecks for large enterprise product portfolios.

---

## Findings

**[High] Un-split Large Monolithic Bundle Entry Point** — [`artifacts/conformity/vite.config.ts:L1-L40`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/conformity/vite.config.ts#L1-L40)
- **Evidence**: `artifacts/conformity` bundles all 26 page components into a single main JS chunk without dynamic `React.lazy()` route splitting.
- **Impact**: Initial page load transfers > 2.2 MB uncompressed JS bundle, degrading Largest Contentful Paint (LCP) and Interaction to Next Paint (INP).
- **Fix**: Implement route-level code splitting: `const PsirtPage = React.lazy(() => import("./pages/psirt"))`.

**[Medium] Synchronous PDF Report Generation Blocking Main Event Loop** — [`artifacts/api-server/src/routes/conformityReports.ts:L80-L150`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/src/routes/conformityReports.ts#L80-L150)
- **Evidence**: PDF generation executes synchronously on the Express HTTP request thread using heavy DOM/HTML parsing.
- **Impact**: Concurrent executive report exports block API request processing for all connected workbench users.
- **Fix**: Offload PDF rendering to background worker threads or async task queues (e.g. BullMQ / worker pool).

---

## What's Already Solid
- Fast initial CSS load with Tailwind CSS v4 pre-compiled utility classes.
- TanStack Query stale-while-revalidate client caching eliminates duplicate API GET fetches.
- Vite HMR provides rapid developer iteration.
