import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  Code2,
  ShieldCheck,
  FileCheck2,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Gavel,
  ExternalLink,
  Cpu,
  Sparkles,
  GitBranch,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function OpenSourceStewardPage() {
  const [formData, setFormData] = useState({
    stewardName: 'Industrial Linux Foundation OT Working Group',
    stewardLegalEntity: 'Open Source Security Collective e.V.',
    foundationOrCollective: 'Linux Foundation Europe',
    repositoryUrl: 'https://github.com/industrial-linux/ot-core-stack',
    softwarePackageName: 'industrial-modbus-core',
    versionOrCommit: 'v2.8.4',
    securityContactEmail: 'security@industrial-linux.org',
    securityPolicyUrl: 'https://industrial-linux.org/security-policy',
    hasCvdPolicy: true,
    hasAutomatedCiTesting: true,
    hasSbomPublished: true,
    hasSignedReleases: true,
    nonCommercialStewardDeclaration: true,
  });

  const [attestationResult, setAttestationResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const attestationMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/steward/attestation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to generate attestation');
      return res.json();
    },
    onSuccess: (data) => {
      setAttestationResult(data);
    },
  });

  const copyAttestation = () => {
    if (!attestationResult) return;
    navigator.clipboard.writeText(JSON.stringify(attestationResult, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans text-foreground">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/80 border border-border/80 p-5 rounded-xl shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-medium text-xl tracking-tight text-foreground">
                Open-Source Software Steward Hub
              </h1>
              <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 font-semibold">
                Article 33 Voluntary Attestation
              </span>
            </div>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">
              Voluntary Security Attestation for FOSS Stewards & Foundations • Statutory Exemption from Manufacturer Liabilities (Recital 18)
            </p>
          </div>
        </div>

        <Link
          href="/wiki"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border/80 font-mono text-xs text-foreground hover:border-primary transition-all"
        >
          <Gavel className="w-3.5 h-3.5 text-primary" />
          Statutory Ref: Article 33 & Recital 18
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Configuration */}
        <div className="lg:col-span-6 bg-card/80 border border-border/80 rounded-xl p-6 shadow-xs space-y-4">
          <h2 className="font-display font-medium text-lg text-foreground border-b border-border/60 pb-2">
            Steward Entity & Software Repository
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-muted-foreground">Steward Organization Name</label>
              <Input
                value={formData.stewardName}
                onChange={(e) => setFormData({ ...formData, stewardName: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-muted-foreground">Legal Entity / Registered Seat</label>
              <Input
                value={formData.stewardLegalEntity}
                onChange={(e) => setFormData({ ...formData, stewardLegalEntity: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-muted-foreground">Software Package Name</label>
              <Input
                value={formData.softwarePackageName}
                onChange={(e) => setFormData({ ...formData, softwarePackageName: e.target.value })}
                className="mt-1 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-muted-foreground">Release Tag / Commit SHA</label>
              <Input
                value={formData.versionOrCommit}
                onChange={(e) => setFormData({ ...formData, versionOrCommit: e.target.value })}
                className="mt-1 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-muted-foreground">Source Repository (GitHub/GitLab)</label>
            <Input
              value={formData.repositoryUrl}
              onChange={(e) => setFormData({ ...formData, repositoryUrl: e.target.value })}
              className="mt-1 text-xs font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-muted-foreground">PSIRT Security Contact Email</label>
              <Input
                value={formData.securityContactEmail}
                onChange={(e) => setFormData({ ...formData, securityContactEmail: e.target.value })}
                className="mt-1 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-muted-foreground">Public Security Policy URL</label>
              <Input
                value={formData.securityPolicyUrl}
                onChange={(e) => setFormData({ ...formData, securityPolicyUrl: e.target.value })}
                className="mt-1 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border/60">
            <div className="font-mono text-xs font-semibold text-foreground">
              Article 33 Voluntary Security Attestation Checklist
            </div>

            {[
              {
                id: 'hasCvdPolicy',
                label: 'Coordinated Vulnerability Disclosure (CVD) policy documented & active',
              },
              {
                id: 'hasAutomatedCiTesting',
                label: 'Automated CI/CD security scanning (SAST / Dependency audit) on all PRs',
              },
              {
                id: 'hasSbomPublished',
                label: 'Machine-readable CycloneDX / SPDX SBOM published with releases',
              },
              {
                id: 'hasSignedReleases',
                label: 'Cryptographically signed releases (Sigstore / GPG keys)',
              },
              {
                id: 'nonCommercialStewardDeclaration',
                label: 'Non-commercial open-source steward declaration (Recital 18 & Art. 33)',
              },
            ].map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 hover:bg-muted/70 cursor-pointer text-xs"
              >
                <input
                  type="checkbox"
                  checked={(formData as any)[item.id]}
                  onChange={(e) => setFormData({ ...formData, [item.id]: e.target.checked })}
                  className="rounded text-primary focus:ring-primary"
                />
                <span className="text-foreground">{item.label}</span>
              </label>
            ))}
          </div>

          <Button
            onClick={() => attestationMutation.mutate()}
            disabled={attestationMutation.isPending}
            className="w-full bg-primary text-primary-foreground font-mono text-xs gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            {attestationMutation.isPending ? 'Generating Attestation...' : 'Issue Article 33 Voluntary Attestation'}
          </Button>
        </div>

        {/* Attestation Result / JSON Certificate */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-card/80 border border-border/80 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <h2 className="font-display font-medium text-lg text-foreground">
                Article 33 Attestation Certificate
              </h2>
              {attestationResult && (
                <span className="font-mono text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 font-bold">
                  VALID ARTICLE 33 ATTESTATION
                </span>
              )}
            </div>

            {attestationResult ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/50 border border-border font-mono text-xs space-y-2">
                  <div className="text-muted-foreground text-[11px]">DOCUMENT ID:</div>
                  <div className="font-bold text-primary">{attestationResult.attestationDocument.documentId}</div>
                  <div className="text-muted-foreground text-[11px] mt-2">SHA-256 DIGITAL DIGEST:</div>
                  <div className="text-[10px] text-foreground break-all">{attestationResult.attestationHash}</div>
                  <div className="text-muted-foreground text-[11px] mt-2">STATUTORY PROTECTION:</div>
                  <div className="text-xs text-green-400 font-sans">{attestationResult.legalLiabilityExemption}</div>
                </div>

                <div className="flex items-center gap-3">
                  <Button onClick={copyAttestation} variant="outline" className="font-mono text-xs gap-1.5 flex-1">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-primary" />}
                    {copied ? 'Copied Attestation' : 'Copy JSON Attestation'}
                  </Button>
                  <Button variant="outline" className="font-mono text-xs gap-1.5 flex-1">
                    <Download className="w-4 h-4 text-primary" />
                    Download Attestation (.json)
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground space-y-2 font-mono text-xs">
                <GitBranch className="w-8 h-8 text-muted-foreground/50 mx-auto" />
                <p>Fill in steward details and click generate to issue a legally recognized Article 33 FOSS Attestation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
