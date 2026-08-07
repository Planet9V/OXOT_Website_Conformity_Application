import { Link } from 'wouter';
import {
  ArrowRight,
  ClipboardCheck,
  ShieldCheck,
  Clock,
  FileStack,
  Layers,
  ServerCog,
} from 'lucide-react';
import { useSeo } from '@/hooks/use-seo';
import { pageSeo } from '@/lib/page-seo';
import { JsonLd } from '@/components/json-ld';
import { LiveRegulatoryNewsFeed } from '@/components/sections/live-regulatory-news-feed';
import { useLocale } from '@/providers/locale-provider';

// Localised page copy (nl-NL professional register, "u"). Machine-assisted —
// flag Dutch strings for a native reviewer before go-live. Structure mirrors the
// English source so every visible string has a Dutch equivalent.
const copy = {
  en: {
    seoTitle: 'OXOT Conformance Platform — run CRA conformity as an operation',
    seoDescription:
      'Every product with digital elements in one workbench: a guided compliance journey per product, statutory Article 14 clocks running live, Annex VII technical files generated from your own evidence.',
    kicker: 'The CRA Conformance Application',
    heroTitle: 'Run CRA conformity as an operation, not a fire drill.',
    heroBody:
      'Every product with digital elements in one workbench: a guided compliance journey per product, statutory Article 14 clocks running live, Annex VII technical files generated from your own evidence, and blockers ranked before they cost you the CE mark.',
    bookDemo: 'Book a demo',
    takeCheck: 'Take the 2-minute check',
    clockStrong: '11 December 2027 — full application.',
    clockRest:
      ' From 11 September 2026, reporting obligations are already enforceable — a 24-hour clock, for products already on the market.',
    stallsKicker: 'Why teams stall',
    stallsTitle: 'The CRA is an operations problem before it is a paperwork problem',
    stalls: [
      {
        title: 'Evidence lives everywhere.',
        body: "Spreadsheets, tickets and engineers' laptops. Nothing is assessment-ready when the auditor asks.",
      },
      {
        title: 'Clocks start without warning.',
        body: 'Article 14 gives 24 hours for early warning and 72 for detailed notification — from awareness.',
      },
      {
        title: 'One portfolio, many classes.',
        body: 'Default, Class I and Class II each take a different route. Getting it wrong costs the CE mark.',
      },
    ],
    pillarsKicker: 'The platform',
    pillarsTitle: 'One record, every regulation',
    pillarsLink: 'Explore the six modules →',
    pillars: [
      {
        title: 'A guided compliance journey, per product',
        body: 'Eight steps from classification to a defensible Annex VII technical file and Annex V Declaration of Conformity — evidence assembled from what you already hold.',
      },
      {
        title: 'Statutory Article 14 clocks, running live',
        body: 'The 24-hour early warning and 72-hour notification tracked per product, with a PSIRT triage board and ENISA single-reporting-platform filing.',
      },
      {
        title: 'One portfolio, every class',
        body: 'Default, Class I and Class II routed correctly across your whole catalogue — blockers ranked before they cost you the CE mark.',
      },
    ],
    deployTitle: 'Single tenant, always',
    deployBody:
      'Run it in a secure datacenter, or on your own premises with a local AI model — your evidence never leaves your control.',
    deployLink: 'See the deployment options →',
    personasKicker: "Who it's for",
    personasTitle: 'Wherever you sit in the value chain',
    personas: [
      ['Product manufacturers', 'The full Annex VII file, the CE marking, and the reporting duties from day one.'],
      ['OEMs', 'Portfolio math against 11 Dec 2027 — where Module H is the only route that fits.'],
      ['Integrators', 'Article 22: know which side of "substantial modification" your projects sit on.'],
      ['Distributors', 'Verify CE marking and the Declaration of Conformity on every line you offer.'],
      ['Owner / operators', 'Test your suppliers now, while you can still switch.'],
    ] as [string, string][],
    finalTitle: 'See your own portfolio in the workbench',
    finalBody:
      'A 45-minute walkthrough covers classification, the evidence you already hold, and what a defensible Annex VII technical file looks like for your products.',
  },
  nl: {
    seoTitle: 'OXOT Conformance Platform — voer CRA-conformiteit uit als een operatie',
    seoDescription:
      'Elk product met digitale elementen in één workbench: een begeleid conformiteitstraject per product, wettelijke Artikel 14-klokken die live lopen, en technische documentatie volgens Bijlage VII, gegenereerd uit uw eigen bewijs.',
    kicker: 'De CRA Conformance-applicatie',
    heroTitle: 'Voer CRA-conformiteit uit als een operatie, niet als een brandoefening.',
    heroBody:
      'Elk product met digitale elementen in één workbench: een begeleid conformiteitstraject per product, wettelijke Artikel 14-klokken die live lopen, technische documentatie volgens Bijlage VII gegenereerd uit uw eigen bewijs, en knelpunten die worden geprioriteerd voordat ze u de CE-markering kosten.',
    bookDemo: 'Demo aanvragen',
    takeCheck: 'Doe de 2-minutencheck',
    clockStrong: '11 december 2027 — volledige toepassing.',
    clockRest:
      ' Vanaf 11 september 2026 zijn de meldingsverplichtingen al afdwingbaar — een klok van 24 uur, voor producten die al op de markt zijn.',
    stallsKicker: 'Waarom teams vastlopen',
    stallsTitle: 'De CRA is een operationeel probleem voordat het een papierprobleem is',
    stalls: [
      {
        title: 'Bewijs staat overal verspreid.',
        body: 'Spreadsheets, tickets en de laptops van engineers. Niets is beoordelingsklaar wanneer de auditor erom vraagt.',
      },
      {
        title: 'Klokken beginnen zonder waarschuwing.',
        body: 'Artikel 14 geeft 24 uur voor een vroegtijdige waarschuwing en 72 uur voor een gedetailleerde melding — vanaf het moment van bekendheid.',
      },
      {
        title: 'Eén portfolio, meerdere klassen.',
        body: 'Standaard, Klasse I en Klasse II volgen elk een andere route. Een verkeerde keuze kost u de CE-markering.',
      },
    ],
    pillarsKicker: 'Het platform',
    pillarsTitle: 'Eén dossier, elke verordening',
    pillarsLink: 'Bekijk de zes modules →',
    pillars: [
      {
        title: 'Een begeleid conformiteitstraject, per product',
        body: 'Acht stappen van classificatie tot een verdedigbaar technisch dossier volgens Bijlage VII en een conformiteitsverklaring volgens Bijlage V — bewijs samengesteld uit wat u al in huis hebt.',
      },
      {
        title: 'Wettelijke Artikel 14-klokken, live actief',
        body: 'De vroegtijdige waarschuwing van 24 uur en de melding van 72 uur, per product bijgehouden, met een PSIRT-triageboard en indiening via het ENISA single reporting platform.',
      },
      {
        title: 'Eén portfolio, elke klasse',
        body: 'Standaard, Klasse I en Klasse II correct gerouteerd over uw hele catalogus — knelpunten geprioriteerd voordat ze u de CE-markering kosten.',
      },
    ],
    deployTitle: 'Altijd single tenant',
    deployBody:
      'Draai het in een beveiligd datacenter, of op uw eigen locatie met een lokaal AI-model — uw bewijs verlaat nooit uw beheer.',
    deployLink: 'Bekijk de implementatieopties →',
    personasKicker: 'Voor wie het is',
    personasTitle: 'Waar u zich ook in de waardeketen bevindt',
    personas: [
      ['Productfabrikanten', 'Het volledige Bijlage VII-dossier, de CE-markering en de meldingsplichten vanaf dag één.'],
      ['OEM’s', 'Portfolioberekening richting 11 dec 2027 — waar Module H de enige passende route is.'],
      ['Integrators', 'Artikel 22: weet aan welke kant van een “substantiële wijziging” uw projecten vallen.'],
      ['Distributeurs', 'Verifieer de CE-markering en de conformiteitsverklaring op elke lijn die u aanbiedt.'],
      ['Eigenaren / exploitanten', 'Test uw leveranciers nu, nu u nog kunt wisselen.'],
    ] as [string, string][],
    finalTitle: 'Bekijk uw eigen portfolio in de workbench',
    finalBody:
      'Een rondleiding van 45 minuten behandelt classificatie, het bewijs dat u al in huis hebt, en hoe een verdedigbaar technisch dossier volgens Bijlage VII eruitziet voor uw producten.',
  },
} as const;

const PILLAR_ICONS = [FileStack, Clock, Layers];

export default function CraHomePage() {
  const { locale } = useLocale();
  const t = copy[locale];

  useSeo(
    pageSeo('/', {
      title: t.seoTitle,
      description: t.seoDescription,
    }),
  );

  return (
    <div className="w-full">
      <JsonLd
        id="ld-organization"
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'OXOT Conformance Platform',
          description:
            'Single-tenant platform to run EU Cyber Resilience Act (CRA) conformity as an operation.',
          url: typeof window !== 'undefined' ? window.location.origin : undefined,
        }}
      />
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 md:px-8 py-20 md:py-28 max-w-4xl text-center">
          <p className="oxot-kicker">{t.kicker}</p>
          <h1 className="oxot-h1 mt-4 text-foreground">
            {t.heroTitle}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {t.heroBody}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/demo"
              className="cta-lift inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
            >
              {t.bookDemo} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/cra-check"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ClipboardCheck className="h-4 w-4" /> {t.takeCheck}
            </Link>
          </div>
        </div>
      </section>

      {/* Statutory clock — dated, factual, no penalty framing */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 md:px-8 py-8 max-w-4xl">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Clock className="h-6 w-6 shrink-0 text-primary" />
            <p className="text-sm leading-relaxed text-foreground">
              <span className="font-semibold">{t.clockStrong}</span>{t.clockRest}
            </p>
          </div>
        </div>
      </section>

      {/* Live regulatory news — API-driven, degrades gracefully */}
      <LiveRegulatoryNewsFeed />

      {/* Why teams stall */}
      <section className="border-t border-border">
        <div className="container mx-auto px-4 md:px-8 py-16 md:py-20 max-w-6xl">
          <p className="oxot-kicker text-center">{t.stallsKicker}</p>
          <h2 className="oxot-h2 mt-2 text-center text-foreground">
            {t.stallsTitle}
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {t.stalls.map((s) => (
              <div key={s.title} className="rounded-2xl border border-border bg-card p-6 shadow-e1">
                <h3 className="oxot-h3 text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform pillars */}
      <section className="border-t border-border bg-card/40">
        <div className="container mx-auto px-4 md:px-8 py-16 md:py-20 max-w-6xl">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="oxot-kicker">{t.pillarsKicker}</p>
              <h2 className="oxot-h2 mt-2 text-foreground">
                {t.pillarsTitle}
              </h2>
            </div>
            <Link href="/product" className="text-sm font-medium text-primary-ink hover:underline">
              {t.pillarsLink}
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {t.pillars.map((p, i) => {
              const Icon = PILLAR_ICONS[i];
              return (
                <div key={p.title} className="rounded-2xl border border-border bg-card p-6 shadow-e1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="oxot-h3 mt-4 text-foreground">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Deployment */}
      <section className="border-t border-border">
        <div className="container mx-auto px-4 md:px-8 py-16 md:py-20 max-w-4xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <ServerCog className="h-6 w-6 text-primary" />
          </div>
          <h2 className="oxot-h2 mt-4 text-foreground">
            {t.deployTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {t.deployBody}
          </p>
          <Link href="/deployment" className="mt-5 inline-block text-sm font-medium text-primary-ink hover:underline">
            {t.deployLink}
          </Link>
        </div>
      </section>

      {/* Personas */}
      <section className="border-t border-border bg-card/40">
        <div className="container mx-auto px-4 md:px-8 py-16 md:py-20 max-w-6xl">
          <p className="oxot-kicker text-center">{t.personasKicker}</p>
          <h2 className="oxot-h2 mt-2 text-center text-foreground">
            {t.personasTitle}
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.personas.map(([who, what]) => (
              <div key={who} className="flex items-start gap-3 rounded-xl border border-border bg-card p-5">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{who}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{what}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border">
        <div className="container mx-auto px-4 md:px-8 py-16 md:py-24 max-w-3xl text-center">
          <h2 className="oxot-h2 text-foreground">
            {t.finalTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
            {t.finalBody}
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/demo"
              className="cta-lift inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
            >
              {t.bookDemo} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
