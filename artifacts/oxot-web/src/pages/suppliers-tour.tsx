import { Link } from 'wouter';
import { ArrowRight, ArrowLeft, FileStack, ClipboardCheck } from 'lucide-react';
import { useSeo } from '@/hooks/use-seo';
import { pageSeo } from '@/lib/page-seo';
import { ProductTour, type Slide } from '@/components/product-tour/product-tour';
import { useLocale } from '@/providers/locale-provider';

// The supplier cockpit walkthrough — built from REAL screenshots of the live
// component/IP-supplier surfaces (assurance package, shared-responsibility
// matrix, delivery manifest, and the public customer view). Reuses the shared
// ProductTour carousel via its `slides` prop. Bilingual; flag NL for review.
const SUPPLIER_SLIDES: Record<'en' | 'nl', Slide[]> = {
  en: [
    {
      kind: 'text',
      eyebrow: 'The problem',
      headline: 'Every customer’s due diligence lands on you.',
      caption:
        'The CRA obliges each finished-product manufacturer to vet its third-party components — so a flood of security questionnaires, audits and procurement requests arrives at your door. Answer it once, not a hundred times.',
    },
    {
      kind: 'shot',
      eyebrow: 'One bundle answers them all',
      headline: 'The supplier assurance package.',
      caption:
        'Matrix, delivery manifest, CVD policy, support-period statement and SBOM composed into one view — with a completeness readout. It reports what you have assembled; it never declares the customer’s product conforming.',
      image: '/media/suppliers/sup-01-assurance-package.jpg',
      alt: 'The supplier assurance package panel showing 5/5 complete with the shared-responsibility matrix, delivery manifest, CVD policy, support-period statement and SBOM all on file, plus the publish-to-customers section.',
    },
    {
      kind: 'shot',
      eyebrow: 'Who owns what, stated once',
      headline: 'The shared-responsibility matrix.',
      caption:
        'For each area — provisioning and key ownership, secure boot, cryptographic defaults, vulnerability handling — exactly what you provide versus what the integrating customer retains. Authored, versioned, and never a verdict.',
      image: '/media/suppliers/sup-02-matrix.jpg',
      alt: 'The shared-responsibility matrix panel with rows for provisioning, secure boot, cryptographic use and vulnerability handling, each splitting supplier-provides from customer-retains.',
    },
    {
      kind: 'shot',
      eyebrow: 'Exactly what you shipped',
      headline: 'The versioned delivery manifest.',
      caption:
        'Each release recorded with its IP release, technology node, supported options, configuration baseline and change note — and one revocable customer link that always resolves to the current manifest.',
      image: '/media/suppliers/sup-03-manifest.jpg',
      alt: 'The delivery manifest panel with an active customer link and a version history entry v1 SE-2.4.1 on 22nm with options secure boot, attestation and PUF.',
    },
    {
      kind: 'shot',
      eyebrow: 'What your customer receives',
      headline: 'A clean, public package — per recipient.',
      caption:
        'Issue one revocable link per named customer; each opens a read-only page with the matrix, the manifest and your lifecycle evidence — the exact record their due diligence needs. Revoke any link, any time.',
      image: '/media/suppliers/sup-04-customer-view.jpg',
      alt: 'The public customer view of the assurance package, prepared for Siemens AG, showing the shared-responsibility table and the delivery manifest.',
    },
    {
      kind: 'cta',
      eyebrow: 'See it against your own components',
      headline: 'Book a 45-minute walkthrough.',
      caption:
        'Bring one component. We’ll show you the assurance package, the shared-responsibility matrix, the versioned manifest, and the customer link your buyers would receive on day one.',
    },
  ],
  nl: [
    {
      kind: 'text',
      eyebrow: 'Het probleem',
      headline: 'De due diligence van elke klant belandt bij u.',
      caption:
        'De CRA verplicht elke fabrikant van eindproducten om de componenten van derden te toetsen — dus komt er een stroom beveiligingsvragenlijsten, audits en inkoopverzoeken naar u toe. Beantwoord die één keer, geen honderd keer.',
    },
    {
      kind: 'shot',
      eyebrow: 'Eén pakket beantwoordt ze allemaal',
      headline: 'Het leveranciersassurancepakket.',
      caption:
        'Matrix, leveringsmanifest, CVD-beleid, verklaring ondersteuningsperiode en SBOM samengebracht in één overzicht — met een volledigheidsuitlezing. Het toont wat u hebt samengesteld; het verklaart het product van de klant nooit conform.',
      image: '/media/suppliers/sup-01-assurance-package.jpg',
      alt: 'Het leveranciersassurancepaneel met 5/5 volledig: matrix voor gedeelde verantwoordelijkheid, leveringsmanifest, CVD-beleid, verklaring ondersteuningsperiode en SBOM op dossier, plus de sectie publiceren naar klanten.',
    },
    {
      kind: 'shot',
      eyebrow: 'Wie bezit wat, één keer vastgelegd',
      headline: 'De matrix voor gedeelde verantwoordelijkheid.',
      caption:
        'Per gebied — provisioning en sleuteleigenaarschap, secure boot, cryptografische standaarden, kwetsbaarheidsafhandeling — precies wat u levert versus wat de integrerende klant behoudt. Geschreven, versiegebonden, en nooit een oordeel.',
      image: '/media/suppliers/sup-02-matrix.jpg',
      alt: 'Het paneel voor gedeelde verantwoordelijkheid met rijen voor provisioning, secure boot, cryptografisch gebruik en kwetsbaarheidsafhandeling, elk gesplitst tussen leverancier-levert en klant-behoudt.',
    },
    {
      kind: 'shot',
      eyebrow: 'Precies wat u hebt geleverd',
      headline: 'Het versiegebonden leveringsmanifest.',
      caption:
        'Elke release vastgelegd met IP-release, technologieknoop, ondersteunde opties, configuratiebasislijn en wijzigingsnotitie — en één intrekbare klantlink die altijd naar het actuele manifest verwijst.',
      image: '/media/suppliers/sup-03-manifest.jpg',
      alt: 'Het leveringsmanifestpaneel met een actieve klantlink en een versiehistorie-item v1 SE-2.4.1 op 22nm met opties secure boot, attestation en PUF.',
    },
    {
      kind: 'shot',
      eyebrow: 'Wat uw klant ontvangt',
      headline: 'Een schoon, openbaar pakket — per ontvanger.',
      caption:
        'Geef één intrekbare link uit per benoemde klant; elke opent een alleen-lezen pagina met de matrix, het manifest en uw levenscyclusbewijs — precies het dossier dat hun due diligence nodig heeft. Trek elke link in, wanneer u wilt.',
      image: '/media/suppliers/sup-04-customer-view.jpg',
      alt: 'De openbare klantweergave van het assurancepakket, opgesteld voor Siemens AG, met de tabel voor gedeelde verantwoordelijkheid en het leveringsmanifest.',
    },
    {
      kind: 'cta',
      eyebrow: 'Bekijk het tegen uw eigen componenten',
      headline: 'Plan een rondleiding van 45 minuten.',
      caption:
        'Neem één component mee. Wij tonen u het assurancepakket, de matrix voor gedeelde verantwoordelijkheid, het versiegebonden manifest en de klantlink die uw kopers op dag één zouden ontvangen.',
    },
  ],
};

const copy = {
  en: {
    seoTitle: 'The supplier cockpit tour — OXOT Conformance Platform',
    seoDescription:
      'See the component & IP supplier cockpit in 90 seconds: the supplier assurance package, the shared-responsibility matrix, the versioned delivery manifest, and the revocable customer link your buyers receive.',
    kicker: 'The supplier tour',
    title: 'The supplier cockpit, in 90 seconds.',
    intro:
      'The four surfaces a component or IP supplier lives in — composed, versioned, and ready to hand your customers. It plays on its own; pause or step through. Every screen is the real product.',
    liveKicker: 'See it live',
    liveTitle: 'Open the customer-facing surfaces yourself.',
    liveBody:
      'These are the exact pages your customers receive — each opens a token-entry screen; no token, no data.',
    manifestLink: 'Delivery manifest view',
    packageLink: 'Assurance package view',
    back: 'Back to component & IP suppliers',
    tourAria: 'Component & IP supplier cockpit tour',
    bookDemo: 'Book a demo',
  },
  nl: {
    seoTitle: 'De leveranciers-cockpitrondleiding — OXOT Conformance Platform',
    seoDescription:
      'Bekijk de cockpit voor component- & IP-leveranciers in 90 seconden: het assurancepakket, de matrix voor gedeelde verantwoordelijkheid, het versiegebonden leveringsmanifest en de intrekbare klantlink die uw kopers ontvangen.',
    kicker: 'De leveranciersrondleiding',
    title: 'De leveranciers-cockpit, in 90 seconden.',
    intro:
      'De vier schermen waarin een component- of IP-leverancier werkt — samengesteld, versiegebonden en klaar om aan uw klanten te geven. Het speelt vanzelf; pauzeer of stap erdoorheen. Elk scherm is het echte product.',
    liveKicker: 'Bekijk het live',
    liveTitle: 'Open de klantgerichte pagina’s zelf.',
    liveBody:
      'Dit zijn precies de pagina’s die uw klanten ontvangen — elke opent een token-invoerscherm; geen token, geen gegevens.',
    manifestLink: 'Leveringsmanifest-weergave',
    packageLink: 'Assurancepakket-weergave',
    back: 'Terug naar component- & IP-leveranciers',
    tourAria: 'Rondleiding cockpit voor component- & IP-leveranciers',
    bookDemo: 'Demo aanvragen',
  },
} as const;

export default function SuppliersTourPage() {
  const { locale } = useLocale();
  const t = copy[locale];

  useSeo(
    pageSeo('/suppliers/tour', {
      title: t.seoTitle,
      description: t.seoDescription,
      ogImage: '/media/suppliers/sup-01-assurance-package.jpg',
    }),
  );

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-6xl">
      <div className="mb-4">
        <Link
          href="/suppliers"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {t.back}
        </Link>
      </div>

      <div className="mx-auto max-w-3xl text-center">
        <p className="oxot-kicker">{t.kicker}</p>
        <h1 className="oxot-h1 mt-3 text-foreground">{t.title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{t.intro}</p>
      </div>

      <div className="mt-10">
        <ProductTour slides={SUPPLIER_SLIDES} label={t.tourAria} />
      </div>

      {/* See it live — the real public customer surfaces (token-entry screens). */}
      <div className="mt-12 rounded-2xl border border-border bg-card p-6 md:p-8">
        <p className="oxot-kicker">{t.liveKicker}</p>
        <h2 className="oxot-h3 mt-1 text-foreground">{t.liveTitle}</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t.liveBody}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/conformity/delivery-manifest"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <FileStack className="h-4 w-4" /> {t.manifestLink} <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="/conformity/assurance-package"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <ClipboardCheck className="h-4 w-4" /> {t.packageLink} <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/demo"
          className="cta-lift inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          {t.bookDemo} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
