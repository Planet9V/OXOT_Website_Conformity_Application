import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Server,
  Layers,
  Cpu,
  Clock,
  Sparkles,
  Copy,
  Check,
  Building2,
  FileSpreadsheet,
  AlertTriangle,
  RotateCcw,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Zap,
  Truck,
  FileCheck2,
  FileText,
  AlertOctagon,
  Factory,
  Droplets,
  ZapOff,
  Boxes,
  HeartPulse,
  ArrowRight,
  ShieldCheck,
  Download,
  Flame,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useSeo } from '@/hooks/use-seo';
import { pageSeo } from '@/lib/page-seo';
import { useLocale } from '@/providers/locale-provider';
import { entranceVariants, revealVariants } from '@/lib/motion';
import { Button } from '@/components/ui/button';
import { parseAndSanitizeBOMText, type SanitizedAssetInput } from '@/lib/sanitizeAssetBOM';
import { normalizeAndSanitizeAssetInput, type NormalizationResult } from '@/lib/assetNormalizer';

interface HardwarePreset {
  vendor: string;
  model: string;
  category: 'switch' | 'firewall' | 'router' | 'gateway' | 'plc' | 'other';
  installYear: number;
  count: number;
}

interface IndustryVertical {
  id: string;
  nameEn: string;
  nameNl: string;
  icon: typeof Factory;
  descriptionEn: string;
  descriptionNl: string;
  typicalDowntimeCostPerHour: number;
  defaultTurnover: number;
  presets: HardwarePreset[];
}

const VERTICALS: IndustryVertical[] = [
  {
    id: 'manufacturing',
    nameEn: 'Discrete Manufacturing & Automotive',
    nameNl: 'Discrete Productie & Automotive',
    icon: Factory,
    descriptionEn: 'High-speed assembly lines, robotic workcells, distributed PROFINET & EtherNet/IP switches.',
    descriptionNl: 'Snelle assemblagelijnen, robotcellen, gedistribueerde PROFINET & EtherNet/IP netwerken.',
    typicalDowntimeCostPerHour: 45_000,
    defaultTurnover: 85_000_000,
    presets: [
      { vendor: 'Siemens', model: 'Scalance X208 (EOS 2022)', category: 'switch', installYear: 2016, count: 24 },
      { vendor: 'Hirschmann', model: 'Rail Switch RS20-0800 (EOS 2021)', category: 'switch', installYear: 2014, count: 16 },
      { vendor: 'Cisco', model: 'Catalyst IE-2000-8TC (EOS 2023)', category: 'switch', installYear: 2017, count: 12 },
      { vendor: 'Siemens', model: 'Scalance S602 Firewall (EOS 2020)', category: 'firewall', installYear: 2015, count: 6 },
      { vendor: 'Siemens', model: 'SIMATIC S7-300 PLC (EOS 2023)', category: 'plc', installYear: 2012, count: 8 },
      { vendor: 'Moxa', model: 'EDS-508A Managed Switch', category: 'switch', installYear: 2019, count: 18 },
    ],
  },
  {
    id: 'process',
    nameEn: 'Chemical, Pharma & Process Industry',
    nameNl: 'Chemie, Farmacie & Procesindustrie',
    icon: Droplets,
    descriptionEn: 'Continuous batch processing, SIL-rated safety instrumentation, Zone 2 explosion-proof networking.',
    descriptionNl: 'Continue proceslijnen, SIL-geclassificeerde veiligheidssystemen, Zone 2 ATEX netwerkinfrastructuur.',
    typicalDowntimeCostPerHour: 80_000,
    defaultTurnover: 150_000_000,
    presets: [
      { vendor: 'Hirschmann', model: 'MICE MS20 Modular Switch (EOS 2021)', category: 'switch', installYear: 2013, count: 20 },
      { vendor: 'Siemens', model: 'Scalance X308-2M Managed (EOS 2022)', category: 'switch', installYear: 2015, count: 14 },
      { vendor: 'Cisco', model: 'IE-3000-8TM Industrial Ethernet (EOS 2022)', category: 'switch', installYear: 2016, count: 10 },
      { vendor: 'Siemens', model: 'Scalance S612 VPN Firewall (EOS 2019)', category: 'firewall', installYear: 2014, count: 8 },
      { vendor: 'Siemens', model: 'SIMATIC S7-400 DCS Controller', category: 'plc', installYear: 2011, count: 6 },
    ],
  },
  {
    id: 'energy',
    nameEn: 'Energy, Utilities & Water Infrastructure',
    nameNl: 'Energie, Nutsbedrijven & Drinkwater',
    icon: ZapOff,
    descriptionEn: 'IEC 61850 substation automation, DNP3/IEC 104 RTUs, NIS2 Essential Entity critical infrastructure.',
    descriptionNl: 'IEC 61850 onderstation automatisering, DNP3/IEC 104 RTUs, NIS2 Essentiële Entiteit infrastructuur.',
    typicalDowntimeCostPerHour: 120_000,
    defaultTurnover: 220_000_000,
    presets: [
      { vendor: 'Hirschmann', model: 'MACH104 Substation Switch (EOS 2020)', category: 'switch', installYear: 2012, count: 18 },
      { vendor: 'Siemens', model: 'RuggedCom RS900 Utility Switch (EOS 2021)', category: 'switch', installYear: 2014, count: 22 },
      { vendor: 'Cisco', model: 'Connected Grid Router CGR 2010 (EOS 2023)', category: 'router', installYear: 2015, count: 8 },
      { vendor: 'Siemens', model: 'Scalance SC-632 Industrial Security', category: 'firewall', installYear: 2018, count: 12 },
    ],
  },
  {
    id: 'logistics',
    nameEn: 'Logistics, Ports & Automated Warehouses',
    nameNl: 'Logistiek, Havens & Geautomatiseerde Warehouses',
    icon: Boxes,
    descriptionEn: 'Automated Guided Vehicles (AGVs), AS/RS cranes, high-density industrial Wi-Fi & edge gateways.',
    descriptionNl: 'Automatisch Geleide Voertuigen (AGV’s), AS/RS kranen, robuuste industriële Wi-Fi en gateways.',
    typicalDowntimeCostPerHour: 35_000,
    defaultTurnover: 65_000_000,
    presets: [
      { vendor: 'Moxa', model: 'AWK-3131A Industrial AP/Bridge (EOS 2022)', category: 'gateway', installYear: 2016, count: 32 },
      { vendor: 'Siemens', model: 'Scalance W788 Industrial Wi-Fi (EOS 2021)', category: 'gateway', installYear: 2015, count: 28 },
      { vendor: 'Cisco', model: 'Catalyst IE-2000-16TC (EOS 2023)', category: 'switch', installYear: 2017, count: 16 },
      { vendor: 'Siemens', model: 'Scalance X108 Unmanaged Switch', category: 'switch', installYear: 2018, count: 40 },
    ],
  },
  {
    id: 'healthcare',
    nameEn: 'Healthcare & Medical Devices (MDR Interlock)',
    nameNl: 'Zorg, Ziekenhuizen & MedTech (MDR Intersectie)',
    icon: HeartPulse,
    descriptionEn: 'Hospital campus IoT, connected MRI/imaging networks, ISO 13485 & MDR Article 74 interplay.',
    descriptionNl: 'Ziekenhuis campus IoT, medische beeldvormingsnetwerken, ISO 13485 & MDR interactie.',
    typicalDowntimeCostPerHour: 60_000,
    defaultTurnover: 110_000_000,
    presets: [
      { vendor: 'Cisco', model: 'Catalyst 2960-X Campus Switch (EOS 2021)', category: 'switch', installYear: 2015, count: 35 },
      { vendor: 'Hirschmann', model: 'OpenRail RS30 Managed Switch', category: 'switch', installYear: 2016, count: 14 },
      { vendor: 'Siemens', model: 'Scalance S623 Security Appliance (EOS 2020)', category: 'firewall', installYear: 2014, count: 10 },
      { vendor: 'Moxa', model: 'NPort 5150 Serial Device Server', category: 'gateway', installYear: 2017, count: 25 },
    ],
  },
];

const SUPPLIERS_DATA = [
  {
    name: 'Siemens AG',
    vendorKey: 'siemens',
    country: 'DE',
    complianceStatus: 'VERIFIED_CE_COMPLIANT',
    hasDoC: true,
    declaredYears: 10,
    dutyToRefrain: false,
    notes: 'Scalance XC-200, SC-600, S7-1500 conform to CRA Class I/II and IEC 62443.',
  },
  {
    name: 'Cisco Systems',
    vendorKey: 'cisco',
    country: 'US (EU Importer: Cisco NL)',
    complianceStatus: 'VERIFIED_CE_COMPLIANT',
    hasDoC: true,
    declaredYears: 8,
    dutyToRefrain: false,
    notes: 'Catalyst IE-4000/ISA-3000 series certified. Legacy IE-2000 EOS notices issued.',
  },
  {
    name: 'Belden / Hirschmann',
    vendorKey: 'hirschmann',
    country: 'DE',
    complianceStatus: 'VERIFIED_CE_COMPLIANT',
    hasDoC: true,
    declaredYears: 7,
    dutyToRefrain: false,
    notes: 'BOBCAT & EAGLE40 certified. RS20/RS30 legacy lines supported via Recital 34 identical spares.',
  },
  {
    name: 'Moxa Europe GmbH',
    vendorKey: 'moxa',
    country: 'TW (EU Importer: Moxa DE)',
    complianceStatus: 'VERIFIED_CE_COMPLIANT',
    hasDoC: true,
    declaredYears: 5,
    dutyToRefrain: false,
    notes: 'EDS-4000 & EDR-G9010 series certified. Legacy EDS-500 series designated EOS.',
  },
  {
    name: 'Legacy / Discontinued OEM Group',
    vendorKey: 'legacy_unsupported',
    country: 'Various',
    complianceStatus: 'NON_COMPLIANT_HALT_SALES',
    hasDoC: false,
    declaredYears: 0,
    dutyToRefrain: true,
    notes: 'DUTY TO REFRAIN (Art. 19(2)): Discontinued hardware lacking CE mark must NOT be distributed.',
  },
];

export default function PartnerScopePage() {
  const { locale } = useLocale();
  const isNl = locale === 'nl';

  // Read partner parameter from URL if present (e.g. ?partner=axians)
  const partnerName = useMemo(() => {
    if (typeof window === 'undefined') return 'Axians';
    const params = new URLSearchParams(window.location.search);
    const p = params.get('partner');
    if (p && p.toLowerCase().includes('spie')) return 'SPIE';
    if (p && p.toLowerCase().includes('equans')) return 'Equans';
    return 'Axians';
  }, []);

  useSeo(
    pageSeo('/partner-scope', {
      title: isNl
        ? `${partnerName} & Actemium CRA Netwerkmodernisering & Leverancierscockpit`
        : `${partnerName} & Actemium CRA Network Modernization & Supplier Cockpit`,
      description: isNl
        ? `Wettelijke CRA-evaluatie, leveranciersverificatie (Art. 19), reserveonderdelen (Recital 34) en investeringsversnelling.`
        : `Statutory CRA evaluation, supplier verification (Art. 19), spare parts matching (Recital 34), and Capex acceleration.`,
    })
  );

  const [selectedVertical, setSelectedVertical] = useState<IndustryVertical>(VERTICALS[0]);
  const [activeTab, setActiveTab] = useState<'vertical' | 'matrix' | 'bom' | 'results' | 'suppliers'>('vertical');
  const [selectedPresets, setSelectedPresets] = useState<HardwarePreset[]>(VERTICALS[0].presets);
  const [customBOMText, setCustomBOMText] = useState('');
  const [normalizationInfo, setNormalizationInfo] = useState<NormalizationResult | null>(null);
  const [turnoverEur, setTurnoverEur] = useState<number>(VERTICALS[0].defaultTurnover);
  const [clientCompany, setClientCompany] = useState<string>('Client Industrial Operations');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Switch vertical handler
  const handleSelectVertical = (vert: IndustryVertical) => {
    setSelectedVertical(vert);
    setSelectedPresets(vert.presets);
    setTurnoverEur(vert.defaultTurnover);
  };

  // Calculate stats dynamically
  const totalAssets = selectedPresets.reduce((acc, p) => acc + p.count, 0);
  const eosAssets = selectedPresets
    .filter((p) => p.model.includes('EOS') || p.installYear < 2018)
    .reduce((acc, p) => acc + p.count, 0);
  const classIiCount = selectedPresets
    .filter((p) => p.category === 'firewall' || p.category === 'plc')
    .reduce((acc, p) => acc + p.count, 0);
  const fineLiability = Math.min(15_000_000, Math.max(5_000_000, turnoverEur * 0.025));
  const estimatedCapexPullForward = eosAssets * 1_850;
  const downtimeRisk24h = selectedVertical.typicalDowntimeCostPerHour * 24;

  const handleCopy = (textToCopy: string, key: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleApplyBOM = () => {
    if (!customBOMText.trim()) return;
    const normResult = normalizeAndSanitizeAssetInput(customBOMText);
    setNormalizationInfo(normResult);
    
    if (normResult.assets.length) {
      const grouped: Record<string, HardwarePreset> = {};
      normResult.assets.forEach((item) => {
        const k = `${item.vendor} ${item.model}`;
        if (!grouped[k]) {
          grouped[k] = {
            vendor: item.vendor,
            model: item.model,
            category: (item.role as any) || 'switch',
            installYear: 2016,
            count: item.qty || 1,
          };
        } else {
          grouped[k].count += item.qty || 1;
        }
      });
      setSelectedPresets(Object.values(grouped));
      setActiveTab('results');
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 max-w-5xl">
      {/* Co-Branding Banner (Axians & VINCI Energies Actemium Alignment) */}
      <motion.div
        {...entranceVariants(0)}
        className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold font-mono text-sm shadow-sm">
            {partnerName.substring(0, 3).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {partnerName} & Actemium Industrial OT Practice
              </span>
              <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-medium border border-emerald-500/20">
                Single-Tenant Verified
              </span>
            </div>
            <h2 className="text-sm font-semibold text-foreground">
              {isNl
                ? `CRA Netwerkmodernisering & Leveranciersverificatie (Art. 19)`
                : `CRA Network Modernization & Supplier Compliance Cockpit (Art. 19)`}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background/80 px-3 py-1.5 rounded-lg border border-border">
          <Clock className="h-4 w-4 text-amber-500" />
          <span className="font-medium text-foreground">
            {isNl ? 'Art. 14 Meldplicht: 11 Sept 2026' : 'Art. 14 Reporting: 11 Sept 2026'}
          </span>
        </div>
      </motion.div>

      {/* Main Header */}
      <motion.div {...entranceVariants(1)}>
        <PageHeader
          kicker={isNl ? 'B2B COMMERCIËLE DISCOVERY & OT-MODERNISERING' : 'B2B COMMERCIAL DISCOVERY & OT MODERNIZATION'}
          title={
            isNl
              ? 'Zet CRA-urgentie om in netwerkmodernisering en reservevoorraad-omzet'
              : 'Turn CRA urgency into network modernization, supplier tracking, and spare-parts revenue'
          }
          description={
            isNl
              ? 'Evalueer geïnstalleerde fabrieksnetwerken, beheer distributeursplichten (Art. 19), match direct met magazijnvoorraad (Recital 34) en genereer 1-klik klantadviezen en SLA-contractaanpassingen.'
              : 'Evaluate plant OT hardware, manage distributor verification (Art. 19), match immediate warehouse stock (Recital 34), and generate 1-click customer advisory dossiers and SLA contract amendments.'
          }
          icon={Building2}
        />
      </motion.div>

      {/* Navigation Tabs (Progressive Disclosure) */}
      <div className="mt-8 flex border-b border-border overflow-x-auto">
        <button
          onClick={() => setActiveTab('vertical')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'vertical'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Factory className="h-4 w-4" />
          {isNl ? '1. Industrie & Vertical' : '1. Industry Vertical'}
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'matrix'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sliders className="h-4 w-4" />
          {isNl ? '2. Hardware Matrix' : '2. Hardware Presets'}
        </button>
        <button
          onClick={() => setActiveTab('bom')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'bom'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          {isNl ? '3. BOM Import (Sanitized)' : '3. Paste BOM (Sanitized)'}
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'results'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="h-4 w-4 text-emerald-500" />
          {isNl ? '4. Commercieel Actieplan & Copilot' : '4. Commercial Plan & Copilot'}
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'suppliers'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Truck className="h-4 w-4 text-amber-500" />
          {isNl ? '5. Leveranciers & Klantadviezen (Art. 19)' : '5. Supplier Tracking & Notices (Art. 19)'}
        </button>
      </div>

      {/* Tab 1: Industry Vertical Selection */}
      {activeTab === 'vertical' && (
        <motion.div {...revealVariants(0)} className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                {isNl ? 'Klantbedrijf / Locatie' : 'Client Company / Plant Site'}
              </label>
              <input
                type="text"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                {isNl ? 'Jaaromzet Klant (€)' : 'Client Annual Turnover (€)'}
              </label>
              <input
                type="number"
                value={turnoverEur}
                onChange={(e) => setTurnoverEur(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase text-muted-foreground block">
              {isNl ? 'Selecteer Industriële Doelmarkt van de Klant:' : 'Select Target Customer Industry Vertical:'}
            </span>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {VERTICALS.map((vert) => {
                const IconComponent = vert.icon;
                const isSelected = selectedVertical.id === vert.id;
                return (
                  <div
                    key={vert.id}
                    onClick={() => handleSelectVertical(vert)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <IconComponent className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <h4 className="mt-2 text-sm font-semibold text-foreground">
                        {isNl ? vert.nameNl : vert.nameEn}
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {isNl ? vert.descriptionNl : vert.descriptionEn}
                      </p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between font-mono">
                      <span>{isNl ? 'Stilstandskosten/u:' : 'Downtime cost/hr:'}</span>
                      <span className="font-semibold text-foreground">€{vert.typicalDowntimeCostPerHour.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-primary-ink uppercase">
                {isNl ? 'Geselecteerd Profiel' : 'Active Profile Selected'}
              </span>
              <h4 className="text-sm font-semibold text-foreground mt-0.5">
                {isNl ? selectedVertical.nameNl : selectedVertical.nameEn} ({selectedPresets.length} {isNl ? 'hardware typen geladen' : 'device profiles loaded'})
              </h4>
            </div>
            <Button onClick={() => setActiveTab('matrix')} className="flex items-center gap-2">
              <span>{isNl ? 'Bekijk Hardware Matrix' : 'Review Hardware Matrix'}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Tab 2: Hardware Presets */}
      {activeTab === 'matrix' && (
        <motion.div {...revealVariants(0)} className="mt-6 space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Server className="h-4 w-4 text-primary" />
                {isNl ? 'Geïnstalleerde Industriële Netwerkcomponenten' : 'Installed Industrial OT Hardware Profile'}
              </h3>
              <span className="text-xs text-muted-foreground">
                {selectedPresets.length} {isNl ? 'modellen' : 'models'}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {isNl
                ? 'Pas de aantallen aan of selecteer veelvoorkomende switches en firewalls in de fabriek:'
                : 'Adjust counts or toggle typical legacy switches and firewalls found in industrial client plants:'}
            </p>

            <div className="mt-4 divide-y divide-border">
              {selectedPresets.map((preset, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{preset.vendor} {preset.model}</span>
                      {preset.model.includes('EOS') && (
                        <span className="rounded bg-red-500/10 text-red-600 dark:text-red-400 px-1.5 py-0.5 text-[10px] font-semibold border border-red-500/20">
                          EOS Vulnerable (Art 14 Risk)
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {isNl ? 'Categorie:' : 'Category:'} {preset.category.toUpperCase()} | {isNl ? 'Geïnstalleerd:' : 'Installed:'} {preset.installYear}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      value={preset.count}
                      onChange={(e) => {
                        const newPresets = [...selectedPresets];
                        newPresets[idx].count = Math.max(0, parseInt(e.target.value, 10) || 0);
                        setSelectedPresets(newPresets);
                      }}
                      className="w-16 rounded border border-border bg-background px-2 py-1 text-center text-sm font-mono"
                    />
                    <span className="text-xs text-muted-foreground">units</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <Button variant="outline" onClick={() => setActiveTab('vertical')}>
                {isNl ? '← Wijzig Vertical' : '← Change Vertical'}
              </Button>
              <Button onClick={() => setActiveTab('results')} size="lg" className="flex items-center gap-2">
                <span>{isNl ? 'Genereer Commercieel Actieplan' : 'Generate Commercial Action Plan'}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 3: BOM Ingestion with In-Browser Sanitization */}
      {activeTab === 'bom' && (
        <motion.div {...revealVariants(0)} className="mt-6 space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-emerald-500" />
                {isNl ? 'In-Browser Geanonimiseerde BOM Import' : 'Client-Side In-Browser Sanitized BOM Upload'}
              </h3>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                {isNl ? '✓ Lokale IP/Host Stripping Actief' : '✓ Local IP/Hostname Redaction Active'}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {isNl
                ? 'Plak hier een CSV of export uit asset management systemen (Cisco, Siemens TIA, Claroty). Privé IP-adressen en hostnames worden lokaal in uw browser gewist voor verzending.'
                : 'Paste a CSV or asset register from client inventory tools. Private IP addresses and hostnames are sanitized locally in your browser before any evaluation.'}
            </p>

            <textarea
              rows={8}
              value={customBOMText}
              onChange={(e) => setCustomBOMText(e.target.value)}
              placeholder="Vendor, Model, Firmware, Year&#10;Siemens, Scalance X208, V5.1, 2016&#10;Cisco, IE-2000, 15.2, 2015&#10;Hirschmann, RS20-0800, 09.0, 2014&#10;Siemens, S7-300, V3.2, 2012"
              className="mt-4 w-full rounded-lg border border-border bg-background p-3 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />

            <div className="mt-4 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {customBOMText ? `${customBOMText.split('\n').filter(Boolean).length} lines detected` : ''}
              </span>
              <Button onClick={handleApplyBOM} disabled={!customBOMText.trim()}>
                {isNl ? 'Verwerk en Evalueer Gegevens' : 'Sanitize & Run Scope Evaluation'}
              </Button>
            </div>

            {normalizationInfo && (
              <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">Source Detected:</span>
                  <span className="rounded bg-primary/10 text-primary px-2 py-0.5 font-mono font-medium">
                    {normalizationInfo.sourceDetected}
                  </span>
                  <span className="text-muted-foreground">({normalizationInfo.totalRowsProcessed} lines parsed)</span>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ {normalizationInfo.sanitizationReport.replacedCount} sensitive IPs/MACs redacted client-side
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Tab 4: Results, Commercial Plan & AI Copilot */}
      {activeTab === 'results' && (
        <motion.div {...revealVariants(0)} className="mt-6 space-y-6">
          {/* Executive Export Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/10 p-4">
            <div>
              <span className="text-xs font-bold uppercase text-primary tracking-wider">
                {isNl ? 'Directie & CISO Dossier' : 'Executive & CISO Board Dossier'}
              </span>
              <h3 className="text-base font-bold text-foreground">
                {clientCompany} — CRA Modernization Business Case
              </h3>
            </div>
            <Button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-primary text-primary-foreground shadow-md hover:opacity-90"
            >
              <Download className="h-4 w-4" />
              <span>{isNl ? '1-Click Dossier Exporteren (PDF)' : '1-Click Export Executive Dossier (PDF)'}</span>
            </Button>
          </div>

          {/* Executive Metrics Overview */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                {isNl ? 'Geëvalueerde Apparaten' : 'Total Evaluated'}
              </span>
              <p className="text-2xl font-bold font-mono text-foreground mt-1">{totalAssets}</p>
              <span className="text-[11px] text-muted-foreground">
                {isNl ? 'Geïnstalleerde basis' : 'Installed base items'}
              </span>
            </div>
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase">
                {isNl ? 'Art 14 Risico (EOS)' : 'Art 14 Risk (EOS)'}
              </span>
              <p className="text-2xl font-bold font-mono text-red-600 dark:text-red-400 mt-1">{eosAssets}</p>
              <span className="text-[11px] text-muted-foreground">
                {isNl ? 'Geen security patches meer' : 'No patch pipeline (2026)'}
              </span>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                {isNl ? 'Magazijnvoorraad Match' : 'Warehouse Stock Match'}
              </span>
              <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">{eosAssets}</p>
              <span className="text-[11px] text-muted-foreground">
                {isNl ? '48u levering (Recital 34)' : '48h dispatch vs 42w lead'}
              </span>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">
                {isNl ? 'Art 61 Boete Risico' : 'Art 61 Fine Liability'}
              </span>
              <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                €{(fineLiability / 1_000_000).toFixed(1)}M
              </p>
              <span className="text-[11px] text-muted-foreground">
                {isNl ? '2.5% jaaromzet plafond' : '2.5% global turnover cap'}
              </span>
            </div>
          </div>

          {/* Statutory Timing & Grandfathering Strategy Strip */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              {isNl
                ? 'Wettelijke Timing & Investeringsversnelling (Pre-2027 Capex Pull-Forward)'
                : 'CRA Statutory Timing & Pre-2027 Capex Pull-Forward Playbook'}
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {isNl
                ? `Onder CRA Artikel 69(2) is apparatuur die vóór 11 december 2027 op de markt is gebracht vrijgesteld van algemene CE-markering. Echter geldt Artikel 14 (verplichte 24-uurs kwetsbaarheidsrapportage) al vanaf 11 september 2026 voor ALLE apparaten. Voor de ${eosAssets} End-of-Support apparaten levert de fabrikant geen patches meer, waardoor ${clientCompany} direct wettelijk risico loopt.`
                : `Under CRA Article 69(2), equipment placed on the market before 11 December 2027 is grandfathered from general CE-marking. However, Article 14 mandatory vulnerability reporting applies starting 11 September 2026 to ALL operating equipment. Because ${eosAssets} assets have reached EOS, manufacturers will not patch zero-days, exposing ${clientCompany} to direct regulatory liability.`}
            </p>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-primary-ink">
                  {isNl ? 'Aanbevolen Capex naar voren trekken (Reservevoorraad):' : 'Recommended Capex Pull-Forward (Buffer Stock):'}
                </span>
                <p className="text-sm font-mono font-bold text-foreground">
                  €{estimatedCapexPullForward.toLocaleString()} EUR
                </p>
              </div>
              <span className="text-xs text-muted-foreground text-right">
                {isNl ? '10-jaars continuïteit (Recital 34)' : '10-year operational continuity (Recital 34)'}
              </span>
            </div>
          </div>

          {/* Salesperson Copilot Talk-Tracks */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {isNl
                  ? 'Vincents 4 Commerciële Gespreksstarters voor de Accountmanager'
                  : "Vincent's 4 Commercial Conversation Prompts for Sales Representatives"}
              </h3>
              <span className="text-xs text-muted-foreground font-mono">
                {isNl ? 'Klik om te kopiëren' : 'Click to copy'}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div
                onClick={() =>
                  handleCopy(
                    `Based on our assessment of ${clientCompany}, these ${eosAssets} network components may require mandatory CRA vulnerability handling before September 2026 under Article 14.`,
                    'p1'
                  )
                }
                className="cursor-pointer rounded-lg border border-border bg-background p-3.5 hover:border-primary transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">1. CRA IMPACT & URGENCY</span>
                  {copiedSection === 'p1' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
                <p className="mt-1 text-xs text-foreground leading-relaxed">
                  {isNl
                    ? `"Op basis van deze audit vereisen deze ${eosAssets} componenten bij ${clientCompany} actieve kwetsbaarheidsopvolging voor september 2026 onder CRA Artikel 14."`
                    : `"Based on our assessment of ${clientCompany}, these ${eosAssets} network components may require mandatory CRA vulnerability handling before September 2026 under Article 14."`}
                </p>
              </div>

              <div
                onClick={() =>
                  handleCopy(
                    'Do you currently know which network and industrial components in your plant environment are no longer supported with firmware patches?',
                    'p2'
                  )
                }
                className="cursor-pointer rounded-lg border border-border bg-background p-3.5 hover:border-primary transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">2. INSTALLED-BASE VISIBILITY</span>
                  {copiedSection === 'p2' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
                <p className="mt-1 text-xs text-foreground leading-relaxed">
                  {isNl
                    ? `"Heeft u momenteel een compleet overzicht van welke industriële switches en firewalls in uw fabrieken geen firmware-updates meer ontvangen?"`
                    : `"Do you currently know which network and industrial components in your plant environment are no longer supported with firmware patches?"`}
                </p>
              </div>

              <div
                onClick={() =>
                  handleCopy(
                    'Is the replacement or modernization of these vulnerable components already allocated in your multi-year network roadmap?',
                    'p3'
                  )
                }
                className="cursor-pointer rounded-lg border border-border bg-background p-3.5 hover:border-primary transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">3. ROADMAP ALIGNMENT</span>
                  {copiedSection === 'p3' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
                <p className="mt-1 text-xs text-foreground leading-relaxed">
                  {isNl
                    ? `"Is de tijdige vervanging of modernisering van deze kwetsbare componenten al opgenomen in uw meerjareninvesteringsplan?"`
                    : `"Is the replacement or modernization of these vulnerable components already allocated in your multi-year network roadmap?"`}
                </p>
              </div>

              <div
                onClick={() =>
                  handleCopy(
                    `Would it be useful to review your installed base with ${partnerName} to evaluate warehouse stock, retrofit options, or network redesign to eliminate 18-month lead times?`,
                    'p4'
                  )
                }
                className="cursor-pointer rounded-lg border border-border bg-background p-3.5 hover:border-primary transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">4. {partnerName.toUpperCase()} VALUE PROPOSITION</span>
                  {copiedSection === 'p4' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
                <p className="mt-1 text-xs text-foreground leading-relaxed">
                  {isNl
                    ? `"Zou het waardevol zijn om samen met ${partnerName} te bekijken hoe onze magazijnvoorraad en lifecycle management uw levertijden met 18 maanden kunnen verkorten?"`
                    : `"Would it be useful to review your installed base with ${partnerName} to evaluate warehouse stock, retrofit options, or network redesign to eliminate 18-month lead times?"`}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 5: Suppliers, Distributor Verification (Art 19) & Customer Notices */}
      {activeTab === 'suppliers' && (
        <motion.div {...revealVariants(0)} className="mt-6 space-y-6">
          {/* Article 19 Distributor Duty Banner */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-2">
            <div className="flex items-center gap-2">
              <AlertOctagon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-semibold text-foreground">
                {isNl ? 'Distributeursverplichtingen onder CRA Artikel 19 & Leveringsstop' : 'Distributor Verification Duties & Duty to Refrain (CRA Art. 19)'}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isNl
                ? `Als distributeur en reseller is ${partnerName} wettelijk verplicht om vóór levering te verifiëren dat apparatuur van toeleveranciers een CE-markering en EU-conformiteitsverklaring bezit. Bij vermoeden van non-conformiteit geldt een wettelijke leveringsstop (Artikel 19(2)) en een plicht tot proactieve klantwaarschuwing.`
                : `As an IT/OT distributor and reseller, ${partnerName} is legally required to verify that supplier hardware holds valid CE-marking and an EU Declaration of Conformity before market placement. If non-compliance is suspected, distributors have a mandatory duty to refrain from making the product available (Article 19(2)) and notify affected customers.`}
            </p>
          </div>

          {/* Supplier Registry Grid */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              {isNl ? 'Geverifieerd Leveranciers- & OEM Register' : 'Tracked Supplier & OEM Compliance Registry'}
            </h3>

            <div className="divide-y divide-border">
              {SUPPLIERS_DATA.map((supp, sIdx) => (
                <div key={sIdx} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{supp.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">({supp.country})</span>
                      {supp.dutyToRefrain ? (
                        <span className="rounded bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 text-[10px] font-bold border border-red-500/20">
                          DUTY TO REFRAIN (HALT SALES)
                        </span>
                      ) : (
                        <span className="rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-medium border border-emerald-500/20 flex items-center gap-1">
                          <Check className="h-3 w-3" /> CE Compliant & DoC Verified
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{supp.notes}</p>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <span className="text-xs font-mono font-medium text-foreground block">
                      {supp.declaredYears > 0 ? `${supp.declaredYears}y Support Term` : 'No Patch Support'}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {supp.hasDoC ? 'DoC on File' : 'No DoC Available'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 1-Click Customer Information Packet & SLA Addendum Generator */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-emerald-500" />
                {isNl
                  ? `Klantadviesbrief & SLA Contractaanpassing voor ${clientCompany}`
                  : `Customer Advisory Packet & SLA Contract Addendum for ${clientCompany}`}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleCopy(
                    `OFFICIAL REGULATORY NOTICE (CRA Art. 19):\nTo: Leadership & CISO of ${clientCompany}\nIssued By: ${partnerName} Cybersecurity Practice\n\nSubject: Lifecycle & Vulnerability Notice for Installed Network Assets\n\nIn accordance with distributor verification obligations under CRA Regulation (EU) 2024/2847 Article 19, we hereby notify you that ${eosAssets} components in your installed base have reached End-of-Support. Starting 11 September 2026, Article 14 requires 24h vulnerability disclosures.\n\nRecommended Remediation: ${partnerName} offers immediate dispatch of identical replacement units (Recital 34) from regional warehouse stock or migration to CRA certified hardware.`,
                    'advisory'
                  )
                }
                className="flex items-center gap-1.5 text-xs"
              >
                {copiedSection === 'advisory' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {isNl ? 'Kopieer Volledig Advies' : 'Copy Full Advisory Letter'}
              </Button>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4 font-mono text-xs text-foreground leading-relaxed whitespace-pre-wrap">
              {isNl
                ? `OFFICIËLE REGULATOIRE KENNISGEVING (CRA Art. 19 & NIS2 Art. 21)\nAan: Directie & CISO van ${clientCompany}\nUitgegeven door: ${partnerName} Industrial Networks Practice\n\nGeachte directie,\n\nIn overeenstemming met de distributeursverplichtingen onder Artikel 19 van de EU Cyber Resilience Act (Verordening EU 2024/2847), informeert ${partnerName} u over de gewijzigde compliance-status van ${eosAssets} geïnstalleerde netwerkcomponenten in uw fabriek.\n\nBelangrijkste Conclusies:\n1. De fabrikant heeft voor deze apparatuur de End-of-Support (EOS) datum bereikt en verstrekt geen beveiligingsupdates meer.\n2. Vanaf 11 september 2026 geldt onder CRA Artikel 14 een wettelijke 24-uurs meldplicht bij kwetsbaarheden.\n3. Oplossing: ${partnerName} stelt voor om via onze magazijnvoorraad geteste identieke vervangende eenheden (CRA Recital 34) of gecertificeerde moderne Class I/II switches in te zetten met een gegarandeerde levertijd van 48 uur.`
                : `OFFICIAL REGULATORY NOTICE (CRA Art. 19 & NIS2 Art. 21)\nTo: Executive Leadership & CISO of ${clientCompany}\nIssued By: ${partnerName} Industrial Networks Practice\n\nDear Leadership Team,\n\nIn accordance with distributor verification obligations under Article 19 of the EU Cyber Resilience Act (Regulation EU 2024/2847), ${partnerName} hereby issues this regulatory advisory regarding ${eosAssets} End-of-Support components operating in your infrastructure.\n\nKey Findings:\n1. The manufacturer has ceased firmware security updates following End-of-Support.\n2. Starting 11 September 2026, CRA Article 14 imposes a mandatory 24-hour notification duty for active vulnerabilities.\n3. Remediation: ${partnerName} provides verified identical replacement units from warehouse stock (CRA Recital 34) with 48-hour dispatch to maintain operational continuity.`}
            </div>

            {/* Contract SLA Amendment Clauses */}
            <div className="pt-2">
              <span className="text-xs font-bold uppercase text-primary block mb-2">
                {isNl ? 'Geadviseerde Contractuele SLA Aanpassingsclausules:' : 'Recommended Contractual SLA Amendment Clauses:'}
              </span>
              <div className="grid gap-2 sm:grid-cols-3 text-xs">
                <div className="rounded-lg border border-border bg-background p-3">
                  <span className="font-semibold text-foreground block">1. 24h Vulnerability SLA</span>
                  <span className="text-muted-foreground mt-1 block">
                    {isNl
                      ? 'Distributeur bewaakt CVE’s en levert binnen 24/72u mitigerende maatregelen.'
                      : 'Distributor monitors CVEs and provides mitigation engineering within 24h statutory windows.'}
                  </span>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <span className="font-semibold text-foreground block">2. Recital 34 Spare Rights</span>
                  <span className="text-muted-foreground mt-1 block">
                    {isNl
                      ? 'Vervanging met identieke reserveonderdelen behoudt overgangsvrijstelling.'
                      : 'Identical spare part replacements preserve pre-2027 transitional protections.'}
                  </span>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <span className="font-semibold text-foreground block">3. Legacy Isolation Duty</span>
                  <span className="text-muted-foreground mt-1 block">
                    {isNl
                      ? 'Niet-patchbare PLC’s worden verplicht afgeschermd via IEC 62443 zonering.'
                      : 'Unpatchable legacy PLCs are front-ended with IEC 62443 micro-segmentation gateways.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
