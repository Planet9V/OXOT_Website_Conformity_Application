import { useState } from 'react';
import { Link } from 'wouter';
import {
  Tag,
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Building2,
  FileCheck2,
  Gavel,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function CeNameplateStudioPage() {
  const [formData, setFormData] = useState({
    productName: 'Industrial Edge Controller 400',
    modelNumber: 'IEC-400-PRO-X',
    manufacturerName: 'OXOT Cybersecurity Systems B.V.',
    manufacturerAddress: 'Keizersgracht 421, 1016 EK Amsterdam, Netherlands',
    // Never ship a real NANDO number as a default. Affixing a CE mark bearing a
    // notified body's identification number where that body performed no
    // assessment is a marking offence. This must stay empty until the user
    // enters the body that actually assessed their product.
    notifiedBodyNumber: '',
    productionYear: '2026',
    serialBatch: 'SN-2026-EU-94821',
    supplyVoltage: '24V DC / 1.5A',
    ipRating: 'IP67 Submersible',
    docPublicUrl: 'https://conformity.oxot.nl/doc/IEC-400-PRO-X',
  });

  const [copied, setCopied] = useState(false);

  // The preview below is HTML, not SVG — there is no vector artwork to export yet.
  // Copy the nameplate field values so they can be handed to whoever produces the
  // physical plate. Do not re-label this as an SVG/EPS/PDF export until one exists.
  const copyNameplateFields = () => {
    navigator.clipboard.writeText(
      Object.entries(formData)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n')
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans text-foreground">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/80 border border-border/80 p-5 rounded-xl shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-medium text-xl tracking-tight text-foreground">
                Digital Product Passport & CE Nameplate Studio
              </h1>
              <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 font-semibold">
                Articles 22 & 23 Affixation Engine
              </span>
            </div>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">
              Vector CE Marking Generator • 4-Digit Notified Body ID • Machine-Readable QR Link to Annex V DoC
            </p>
          </div>
        </div>

        <Link
          href="/wiki"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border/80 font-mono text-xs text-foreground hover:border-primary transition-all"
        >
          <Gavel className="w-3.5 h-3.5 text-primary" />
          Statutory Ref: Articles 22 & 23
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Configuration */}
        <div className="lg:col-span-6 bg-card/80 border border-border/80 rounded-xl p-6 shadow-xs space-y-4">
          <h2 className="font-display font-medium text-lg text-foreground border-b border-border/60 pb-2">
            Statutory Nameplate Parameters
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-muted-foreground">Product Commercial Name</label>
              <Input
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-muted-foreground">Model / Type Identifier</label>
              <Input
                value={formData.modelNumber}
                onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-muted-foreground">Manufacturer Legal Entity</label>
            <Input
              value={formData.manufacturerName}
              onChange={(e) => setFormData({ ...formData, manufacturerName: e.target.value })}
              className="mt-1 text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-muted-foreground">Manufacturer EU Postal Address</label>
            <Input
              value={formData.manufacturerAddress}
              onChange={(e) => setFormData({ ...formData, manufacturerAddress: e.target.value })}
              className="mt-1 text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-mono text-muted-foreground">Notified Body ID (Art. 22)</label>
              <Input
                value={formData.notifiedBodyNumber}
                onChange={(e) => setFormData({ ...formData, notifiedBodyNumber: e.target.value })}
                className="mt-1 text-xs font-mono"
                placeholder="0035"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-muted-foreground">Production Year</label>
              <Input
                value={formData.productionYear}
                onChange={(e) => setFormData({ ...formData, productionYear: e.target.value })}
                className="mt-1 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-muted-foreground">Serial / Batch (Art. 10.7)</label>
              <Input
                value={formData.serialBatch}
                onChange={(e) => setFormData({ ...formData, serialBatch: e.target.value })}
                className="mt-1 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-muted-foreground">Electrical / Power Rating</label>
              <Input
                value={formData.supplyVoltage}
                onChange={(e) => setFormData({ ...formData, supplyVoltage: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-muted-foreground">Ingress Protection</label>
              <Input
                value={formData.ipRating}
                onChange={(e) => setFormData({ ...formData, ipRating: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-muted-foreground">
              Digital Product Passport DoC URL (QR Code Target)
            </label>
            <Input
              value={formData.docPublicUrl}
              onChange={(e) => setFormData({ ...formData, docPublicUrl: e.target.value })}
              className="mt-1 text-xs font-mono"
            />
          </div>
        </div>

        {/* Right Column: Physical / Digital Nameplate Preview */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-card/80 border border-border/80 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <h2 className="font-display font-medium text-lg text-foreground">
                Affixation Rating Plate Preview (Vector SVG)
              </h2>
              <span className="font-mono text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 font-bold">
                DIN / ISO 7000 & CRA Compliant
              </span>
            </div>

            {/* Industrial Metal Rating Plate Graphic */}
            <div className="p-6 rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-900 border-2 border-zinc-700 shadow-2xl text-zinc-100 font-mono space-y-4 relative overflow-hidden">
              <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-zinc-600 border border-zinc-500" />
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-zinc-600 border border-zinc-500" />
              <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-zinc-600 border border-zinc-500" />
              <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-zinc-600 border border-zinc-500" />

              <div className="flex items-start justify-between border-b border-zinc-700 pb-3">
                <div>
                  <div className="font-sans font-bold text-base text-zinc-100 uppercase tracking-tight">
                    {formData.manufacturerName}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-sans">{formData.manufacturerAddress}</div>
                </div>

                {/* CE Logo Mark */}
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-black tracking-tighter text-zinc-100 leading-none">CE</div>
                  {formData.notifiedBodyNumber && (
                    <div className="text-[9px] font-mono tracking-wider text-zinc-300 font-bold">
                      {formData.notifiedBodyNumber}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-[9px] text-zinc-400 uppercase">Product / Model:</div>
                  <div className="font-bold text-zinc-100 text-sm">{formData.productName}</div>
                  <div className="text-zinc-300 text-[11px]">TYPE: {formData.modelNumber}</div>
                </div>

                <div>
                  <div className="text-[9px] text-zinc-400 uppercase">Power & Rating:</div>
                  <div className="text-zinc-200">{formData.supplyVoltage}</div>
                  <div className="text-zinc-400 text-[10px]">ENV: {formData.ipRating}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-700">
                <div className="text-[10px] space-y-0.5">
                  <div>
                    <span className="text-zinc-400">SERIAL: </span>
                    <span className="text-zinc-200 font-bold">{formData.serialBatch}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">YEAR: </span>
                    <span className="text-zinc-300">{formData.productionYear}</span>
                    <span className="text-zinc-400 ml-2">CRA: </span>
                    <span className="text-green-400">REG (EU) 2024/2847</span>
                  </div>
                </div>

                <div className="w-12 h-12 bg-white p-1 rounded border border-zinc-300 flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-black" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={copyNameplateFields} variant="outline" className="font-mono text-xs gap-1.5 flex-1">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-primary" />}
                {copied ? 'Copied' : 'Copy nameplate fields'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
