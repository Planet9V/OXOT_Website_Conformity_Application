import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Tag, Check, ArrowRight, Radar, LifeBuoy, Users } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useSeo } from '@/hooks/use-seo';
import { pageSeo } from '@/lib/page-seo';
import { useLocale } from '@/providers/locale-provider';
import { revealVariants } from '@/lib/motion';

// Localised page copy (nl-NL professional register, "u"). Machine-assisted —
// flag Dutch strings for a native reviewer before go-live. Structure mirrors the
// English source so every visible string has a Dutch equivalent. Tier names
// (Essential / Professional / Enterprise) and add-on offering names are kept as
// product/service names per glossary.
const copy = {
  en: {
    seoTitle: 'Pricing — OXOT Conformance Platform',
    seoDescription:
      'Three tiers metered on products with digital elements under management. Fixed scope, variable price — request a quote. Single-tenant, always.',
    kicker: 'PRICING',
    headerTitle: 'Priced on the products you actually manage',
    headerDescription:
      'Tiers are metered on products with digital elements under management — the honest unit for the CRA, and the one you can count. For an operator that unit is the purchased devices in your estate register; for a manufacturer, your catalogue. It is a single-tenant product whose cost depends on your deployment, so the scope is fixed and public; the price is a quote.',
    mostChosen: 'Most chosen',
    requestQuote: 'Request a quote',
    deploymentLabel: 'Deployment',
    supportLabel: 'Support',
    bookDemo: 'Book a demo',
    tiers: [
      {
        name: 'Essential',
        forWho: 'One product line getting to CE marking',
        meter: 'A small portfolio of product dossiers',
        features: [
          'The eight-step compliance journey',
          'Annex I requirement tracking + evidence vault',
          'Annex VII technical file + Annex V Declaration of Conformity',
          'Full conformity assessment reports',
        ],
        deployment: 'Secure datacenter',
        support: 'Standard support',
      },
      {
        name: 'Professional',
        forWho: 'A portfolio under active conformity management',
        meter: 'An expanded portfolio of product dossiers',
        features: [
          'Everything in Essential',
          'PSIRT workbench',
          'Article 14 statutory clocks + ENISA single reporting-platform filing',
          'Triage board with named owners + SLA windows',
          'Reports: full + board edition',
        ],
        deployment: 'Secure datacenter or on-premise',
        support: 'Priority support',
      },
      {
        name: 'Enterprise',
        forWho: 'Multi-site or multi-business-unit manufacturers',
        meter: 'Unlimited product dossiers',
        features: [
          'Everything in Professional',
          'SSO and custom retention beyond Article 13(13)',
          'Reports: full + board + custom',
          'On-premise with a local AI model',
        ],
        deployment: 'On-premise with local AI',
        support: 'Named engineer',
      },
    ],
    deliberate:
      'Deliberate: Article 14 statutory clocks and the PSIRT workbench start at Professional. The 24-hour reporting obligation is the sharpest reason to buy — and the natural upgrade trigger.',
    addonsKicker: 'Add to any tier',
    addonsTitle: 'The platform, plus people',
    addonsBody:
      'The product holds the record; the add-ons do the work. Each is available on any tier — request a quote.',
    addons: [
      {
        name: 'Surveillance',
        body: 'Continuous vulnerability and advisory monitoring against your CBOM: CISA KEV correlation, ENISA advisories and VEX exploitability, straight into the triage queue.',
      },
      {
        name: 'CRA Readiness Retainer',
        body: 'Standing access to OXOT engineers across the conformity year. The platform holds the evidence; the retainer keeps it moving.',
      },
      {
        name: 'CRA Readiness Consulting',
        body: 'The three-phase engagement: classification and scope, risk engineering and evidence, technical file to audit-ready.',
      },
    ],
    addonCta: 'Add to any tier · Request a quote',
    finalTitle: 'Which tier fits your portfolio?',
    finalBody:
      'A 45-minute walkthrough sizes it against your real product count and deployment, and shows you the workbench with your own classification.',
  },
  nl: {
    seoTitle: 'Prijzen — OXOT Conformance Platform',
    seoDescription:
      'Drie tiers, gemeten op producten met digitale elementen die u beheert. Vaste scope, variabele prijs — vraag een offerte aan. Altijd single-tenant.',
    kicker: 'PRIJZEN',
    headerTitle: 'Geprijsd op de producten die u daadwerkelijk beheert',
    headerDescription:
      'De tiers worden gemeten op producten met digitale elementen die u beheert — de eerlijke eenheid voor de CRA, en de eenheid die u kunt tellen. Voor een exploitant is die eenheid de gekochte apparaten in uw installatieregister; voor een fabrikant uw catalogus. Het is een single-tenant product waarvan de kosten afhangen van uw implementatie, dus de scope ligt vast en is openbaar; de prijs is een offerte.',
    mostChosen: 'Meest gekozen',
    requestQuote: 'Offerte aanvragen',
    deploymentLabel: 'Implementatie',
    supportLabel: 'Ondersteuning',
    bookDemo: 'Demo aanvragen',
    tiers: [
      {
        name: 'Essential',
        forWho: 'Eén productlijn op weg naar de CE-markering',
        meter: 'Een klein portfolio aan productdossiers',
        features: [
          'Het nalevingstraject in acht stappen',
          'Bijhouden van vereisten uit Bijlage I + bewijskluis',
          'Technisch dossier volgens Bijlage VII + conformiteitsverklaring volgens Bijlage V',
          'Volledige conformiteitsbeoordelingsrapporten',
        ],
        deployment: 'Beveiligd datacenter',
        support: 'Standaardondersteuning',
      },
      {
        name: 'Professional',
        forWho: 'Een portfolio onder actief conformiteitsbeheer',
        meter: 'Een uitgebreid portfolio aan productdossiers',
        features: [
          'Alles in Essential',
          'PSIRT-workbench',
          'Wettelijke Artikel 14-klokken + indiening via het ENISA single reporting platform',
          'Triageboard met aangewezen eigenaren + SLA-vensters',
          'Rapporten: volledig + bestuurseditie',
        ],
        deployment: 'Beveiligd datacenter of on-premise',
        support: 'Prioriteitsondersteuning',
      },
      {
        name: 'Enterprise',
        forWho: 'Fabrikanten met meerdere locaties of business units',
        meter: 'Onbeperkt aantal productdossiers',
        features: [
          'Alles in Professional',
          'SSO en aangepaste bewaartermijnen die verder gaan dan Artikel 10(7)',
          'Rapporten: volledig + bestuur + op maat',
          'On-premise met een lokaal AI-model',
        ],
        deployment: 'On-premise met lokale AI',
        support: 'Toegewezen engineer',
      },
    ],
    deliberate:
      'Bewust gekozen: de wettelijke Artikel 14-klokken en de PSIRT-workbench beginnen bij Professional. De meldingsverplichting binnen 24 uur is de scherpste reden om te kopen — en de natuurlijke aanleiding om te upgraden.',
    addonsKicker: 'Voeg toe aan elke tier',
    addonsTitle: 'Het platform, plus mensen',
    addonsBody:
      'Het product bewaart het dossier; de add-ons doen het werk. Elk is beschikbaar bij elke tier — vraag een offerte aan.',
    addons: [
      {
        name: 'Surveillance',
        body: 'Doorlopende bewaking van kwetsbaarheden en adviezen tegen uw CBOM: correlatie met CISA KEV, ENISA-adviezen en VEX-exploiteerbaarheid, rechtstreeks in de triagewachtrij.',
      },
      {
        name: 'CRA Readiness Retainer',
        body: 'Permanente toegang tot OXOT-engineers gedurende het conformiteitsjaar. Het platform bewaart het bewijs; de retainer houdt het in beweging.',
      },
      {
        name: 'CRA Readiness Consulting',
        body: 'De opdracht in drie fasen: classificatie en scope, risico-engineering en bewijs, technisch dossier tot auditgereed.',
      },
    ],
    addonCta: 'Voeg toe aan elke tier · Offerte aanvragen',
    finalTitle: 'Welke tier past bij uw portfolio?',
    finalBody:
      'Een rondleiding van 45 minuten stemt het af op uw werkelijke aantal producten en uw implementatie, en toont u de workbench met uw eigen classificatie.',
  },
} as const;

// Non-text data kept out of the copy object, indexed by tier / add-on position.
const TIER_FEATURED = [false, true, false];
const ADDON_ICONS = [Radar, LifeBuoy, Users];

export default function PricingPage() {
  const { locale } = useLocale();
  const t = copy[locale];

  useSeo(
    pageSeo('/pricing', {
      title: t.seoTitle,
      description: t.seoDescription,
    }),
  );

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-6xl">
      <PageHeader
        kicker={t.kicker}
        title={t.headerTitle}
        icon={Tag}
        description={t.headerDescription}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {t.tiers.map((tier, i) => {
          const featured = TIER_FEATURED[i];
          return (
            <motion.div
              key={tier.name}
              className={`flex flex-col rounded-2xl border bg-card p-6 ${
                featured ? 'border-primary shadow-e2 ring-1 ring-primary/30' : 'border-border shadow-e1'
              }`}
              {...revealVariants(i)}
            >
              {featured && <span className="oxot-kicker mb-2">{t.mostChosen}</span>}
              <h3 className="font-display text-2xl font-normal tracking-tight text-foreground">{tier.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{tier.forWho}</p>
              <div className="mt-4 border-y border-border py-4">
                <p className="text-2xl font-semibold text-foreground">{t.requestQuote}</p>
                <p className="mt-1 text-xs text-muted-foreground">{tier.meter}</p>
              </div>
              <ul className="mt-4 flex-1 space-y-2.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <dl className="mt-5 space-y-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
                <div className="flex justify-between gap-3">
                  <dt>{t.deploymentLabel}</dt>
                  <dd className="text-right font-medium text-foreground">{tier.deployment}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>{t.supportLabel}</dt>
                  <dd className="text-right font-medium text-foreground">{tier.support}</dd>
                </div>
              </dl>
              <Link
                href="/demo"
                className={`cta-lift mt-5 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  featured
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border border-border text-foreground hover:border-primary hover:text-primary'
                }`}
              >
                {t.bookDemo} <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          );
        })}
      </div>

      <p className="mx-auto mt-5 max-w-2xl text-center text-xs text-muted-foreground">
        {t.deliberate}
      </p>

      {/* Add-ons */}
      <div className="mt-16">
        <p className="oxot-kicker text-center">{t.addonsKicker}</p>
        <h2 className="mt-2 text-center font-display text-2xl font-normal tracking-tight text-foreground">
          {t.addonsTitle}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-muted-foreground">
          {t.addonsBody}
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {t.addons.map((a, i) => {
            const Icon = ADDON_ICONS[i];
            return (
              <motion.div
                key={a.name}
                className="rounded-2xl border border-border bg-card p-6 shadow-e1"
                {...revealVariants(i)}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 font-display text-lg font-normal tracking-tight text-foreground">{a.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a.body}</p>
                <p className="mt-4 text-xs font-medium text-primary-ink">{t.addonCta}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
        <h2 className="font-display text-2xl font-normal tracking-tight text-foreground">
          {t.finalTitle}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          {t.finalBody}
        </p>
        <Link
          href="/demo"
          className="cta-lift mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          {t.bookDemo} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
