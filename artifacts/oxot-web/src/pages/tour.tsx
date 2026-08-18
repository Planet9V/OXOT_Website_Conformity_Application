import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { useSeo } from '@/hooks/use-seo';
import { pageSeo } from '@/lib/page-seo';
import { JsonLd } from '@/components/json-ld';
import { ProductTour } from '@/components/product-tour/product-tour';

export default function TourPage() {
  useSeo(
    pageSeo('/tour', {
      title: 'The 90-second product tour — OXOT Conformance Platform',
      description:
        'See the conformance application in 90 seconds: one living record per product, nine EU regulations in each act’s own words, the verbatim law, supplier CRA management for operators, and the 60-day assisted CRA Transit service.',
    }),
  );

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-6xl">
      <JsonLd
        id="ld-tour-video"
        data={{
          '@context': 'https://schema.org',
          '@type': 'VideoObject',
          name: 'OXOT Conformance Platform — product tour',
          description:
            'An auto-advancing walkthrough of the OXOT Conformance Platform, built from live product screenshots.',
          thumbnailUrl: '/media/tour/01-product-dossier.jpg',
        }}
      />
      <div className="mx-auto max-w-3xl text-center">
        <p className="oxot-kicker">The 90-second tour</p>
        <h1 className="oxot-h1 mt-3 text-foreground">
          See conformity run as an operation.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          The whole application, in the time it takes to read a page. It plays on
          its own — pause, step back, or take your time. Every screen is the real
          product.
        </p>
      </div>

      <div className="mt-10">
        <ProductTour />
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/demo"
          className="cta-lift inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          Book a demo <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
