import { Link } from 'wouter';
import { ServerCog, Building2, HardDrive, Cpu, Lock, Mail, Users, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useSeo } from '@/hooks/use-seo';
import { pageSeo } from '@/lib/page-seo';
import { useLocale } from '@/providers/locale-provider';

// Localised page copy (nl-NL professional register, "u"). Machine-assisted —
// flag Dutch strings for a native reviewer before go-live. Structure mirrors the
// English source so every visible string has a Dutch equivalent.
const copy = {
  en: {
    seoTitle: 'Deployment — OXOT Conformance Platform',
    seoDescription:
      'Single tenant, always. Run it in a secure datacenter, or on your own premises with a local AI model — your evidence never leaves your control.',
    kicker: 'DEPLOYMENT',
    title: 'Single tenant, always',
    headerDescription:
      "Run it in a secure datacenter, or on your own premises with a local AI model — your evidence never leaves your control. The platform is single-tenant by design: your conformity record is not something to pool with anyone else's.",
    options: [
      {
        name: 'Secure compliance datacenter',
        body: 'Single-tenant, hosted in a compliance-grade datacenter. Your instance, your data — never shared, never pooled.',
      },
      {
        name: 'On-premise, your hardware',
        body: 'Deployed on your own premises with our hardware. Your evidence never leaves your control, and it stays available if your link does not.',
      },
      {
        name: 'On-premise with local AI',
        body: 'A custom AI model that runs island-mode — it processes and stores everything locally. No data leaves the box; the model learns your organisation over time.',
      },
    ],
    islandKicker: 'The island-mode advantage',
    islandTitle: 'A custom AI that never phones home',
    islandBody:
      'The platform ships with its own AI model configured for island mode: it reads your evidence, drafts your files and answers your questions entirely on the local instance. Nothing is sent to a third-party model, and the store stays with you. For a conformity record — the thing an auditor and a regulator both scrutinise — that is the only posture that holds.',
    features: [
      'Single tenant, always — no shared infrastructure',
      'Island-mode AI: all processing and storage stays local',
      'Up to 20 users, and OAuth / SSO for your identity provider',
      'Configurable email and Slack integration',
    ],
    ctaTitle: 'Which deployment fits your estate?',
    ctaBody:
      'A 45-minute walkthrough covers hosting, the local-AI option and how it maps to your security posture.',
    bookDemo: 'Book a demo',
  },
  nl: {
    seoTitle: 'Implementatie — OXOT Conformance Platform',
    seoDescription:
      'Altijd single tenant. Draai het in een beveiligd datacenter, of op uw eigen locatie met een lokaal AI-model — uw bewijs verlaat nooit uw beheer.',
    kicker: 'IMPLEMENTATIE',
    title: 'Altijd single tenant',
    headerDescription:
      'Draai het in een beveiligd datacenter, of op uw eigen locatie met een lokaal AI-model — uw bewijs verlaat nooit uw beheer. Het platform is single-tenant van opzet: uw conformiteitsdossier is niets om samen te voegen met dat van iemand anders.',
    options: [
      {
        name: 'Beveiligd compliance-datacenter',
        body: 'Single-tenant, gehost in een datacenter van compliance-niveau. Uw instantie, uw gegevens — nooit gedeeld, nooit samengevoegd.',
      },
      {
        name: 'On-premise, uw eigen hardware',
        body: 'Geïmplementeerd op uw eigen locatie met onze hardware. Uw bewijs verlaat nooit uw beheer en blijft beschikbaar, ook als uw verbinding dat niet doet.',
      },
      {
        name: 'On-premise met lokale AI',
        body: 'Een op maat gemaakt AI-model dat in island-mode draait — het verwerkt en bewaart alles lokaal. Er verlaten geen gegevens de box; het model leert uw organisatie in de loop van de tijd kennen.',
      },
    ],
    islandKicker: 'Het island-mode-voordeel',
    islandTitle: 'Een op maat gemaakte AI die nooit naar huis belt',
    islandBody:
      'Het platform wordt geleverd met een eigen AI-model dat is geconfigureerd voor island-mode: het leest uw bewijs, stelt uw documenten op en beantwoordt uw vragen volledig op de lokale instantie. Er wordt niets naar een AI-model van derden gestuurd, en de opslag blijft bij u. Voor een conformiteitsdossier — datgene wat zowel een auditor als een toezichthouder onder de loep neemt — is dat de enige houding die standhoudt.',
    features: [
      'Altijd single tenant — geen gedeelde infrastructuur',
      'Island-mode-AI: alle verwerking en opslag blijft lokaal',
      'Tot 20 gebruikers, en OAuth / SSO voor uw identity provider',
      'Configureerbare integratie met e-mail en Slack',
    ],
    ctaTitle: 'Welke implementatie past bij uw omgeving?',
    ctaBody:
      'Een rondleiding van 45 minuten behandelt hosting, de optie voor lokale AI en hoe die aansluit op uw beveiligingsbeleid.',
    bookDemo: 'Demo aanvragen',
  },
} as const;

const OPTION_ICONS = [Building2, HardDrive, Cpu];
const FEATURE_ICONS = [Lock, Cpu, Users, Mail];

export default function DeploymentPage() {
  const { locale } = useLocale();
  const t = copy[locale];

  useSeo(
    pageSeo('/deployment', {
      title: t.seoTitle,
      description: t.seoDescription,
    }),
  );

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-6xl">
      <PageHeader
        kicker={t.kicker}
        title={t.title}
        icon={ServerCog}
        description={t.headerDescription}
      />

      <div className="grid gap-5 md:grid-cols-3">
        {t.options.map((o, i) => {
          const Icon = OPTION_ICONS[i];
          return (
            <div key={o.name} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-e1">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 font-display text-lg font-normal tracking-tight text-foreground">{o.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{o.body}</p>
            </div>
          );
        })}
      </div>

      {/* The island-mode moat */}
      <div className="mt-12 rounded-2xl border border-primary/30 bg-primary/5 p-8">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <p className="oxot-kicker">{t.islandKicker}</p>
            <h2 className="mt-2 font-display text-2xl font-normal tracking-tight text-foreground">
              {t.islandTitle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t.islandBody}
            </p>
          </div>
          <ul className="space-y-3">
            {t.features.map((label, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <li key={label} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm text-foreground">{label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
        <h2 className="font-display text-2xl font-normal tracking-tight text-foreground">
          {t.ctaTitle}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          {t.ctaBody}
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
