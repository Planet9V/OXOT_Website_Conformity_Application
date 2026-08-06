import { useState } from "react";
import { motion } from "framer-motion";
import {
  Layers,
  Flame,
  Search,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Building2,
  Filter,
  FileCheck2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface SbomKevItem {
  id: string;
  componentName: string;
  version: string;
  supplier: string;
  type: "software" | "hardware" | "firmware";
  locationInProduct: string;
  cveId: string;
  cvssScore: number;
  isCisaKev: boolean;
  cisaKevAddedDate?: string;
  vexStatus: "not_affected" | "affected" | "fixed" | "under_investigation";
  vexJustification?: string;
  affectedProducts: string[];
}

const DEFAULT_SBOM_KEV_ITEMS: SbomKevItem[] = [
  {
    id: "sk-1",
    componentName: "hms-anybus-np40-driver",
    version: "2.1.0",
    supplier: "HMS Networks",
    type: "firmware",
    locationInProduct: "Network Subsystem / Ethernet Stack",
    cveId: "CVE-2026-3891",
    cvssScore: 9.8,
    isCisaKev: true,
    cisaKevAddedDate: "2026-08-01",
    vexStatus: "affected",
    vexJustification: "Vulnerable network parsing function is exposed on TCP port 8443.",
    affectedProducts: ["NovaGuard Smart Home Hub", "Test Industrial Controller"],
  },
  {
    id: "sk-2",
    componentName: "openssl",
    version: "3.0.8",
    supplier: "OpenSSL Software Foundation",
    type: "software",
    locationInProduct: "Cryptographic Library / TLS Stack",
    cveId: "CVE-2023-0286",
    cvssScore: 7.4,
    isCisaKev: true,
    cisaKevAddedDate: "2023-02-15",
    vexStatus: "fixed",
    vexJustification: "Upgraded to OpenSSL 3.0.12 in firmware release v2.1.4.",
    affectedProducts: ["Robot Vision System Pro"],
  },
  {
    id: "sk-3",
    componentName: "nxp-imx8-bootloader",
    version: "2025.04",
    supplier: "NXP Semiconductors",
    type: "hardware",
    locationInProduct: "SoC Boot ROM / HAB Module",
    cveId: "CVE-2026-4412",
    cvssScore: 7.8,
    isCisaKev: false,
    vexStatus: "under_investigation",
    vexJustification: "Assessing HAB cryptographic fuse configuration on hardware revision B.",
    affectedProducts: ["NovaGuard Smart Home Hub"],
  },
  {
    id: "sk-4",
    componentName: "busybox",
    version: "1.35.0",
    supplier: "BusyBox Project",
    type: "software",
    locationInProduct: "Linux Userspace / Shell Utilities",
    cveId: "CVE-2022-48174",
    cvssScore: 9.8,
    isCisaKev: true,
    cisaKevAddedDate: "2024-05-10",
    vexStatus: "not_affected",
    vexJustification: "Ash shell feature with vulnerable memory allocation is disabled in kernel config.",
    affectedProducts: ["NovaGuard Smart Home Hub", "Robot Vision System Pro"],
  },
  {
    id: "sk-5",
    componentName: "renesas-mbedtls-hw",
    version: "3.2.0",
    supplier: "Renesas Electronics",
    type: "hardware",
    locationInProduct: "MCU Hardware Security Module (HSM)",
    cveId: "CVE-2026-0811",
    cvssScore: 5.3,
    isCisaKev: false,
    vexStatus: "not_affected",
    vexJustification: "Hardware side-channel is mitigated by hardware bus shielding in enclosure.",
    affectedProducts: ["Test Industrial Controller"],
  },
];

export function PsirtSbomKev() {
  const [items, setItems] = useState<SbomKevItem[]>(DEFAULT_SBOM_KEV_ITEMS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVex, setFilterVex] = useState<string>("all");
  const [filterKevOnly, setFilterKevOnly] = useState(false);

  const handleVexChange = (id: string, newStatus: SbomKevItem["vexStatus"]) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, vexStatus: newStatus } : item))
    );
    toast.success(`VEX status updated to ${newStatus.replace("_", " ")}`);
  };

  const filtered = items.filter((item) => {
    if (filterKevOnly && !item.isCisaKev) return false;
    if (filterVex !== "all" && item.vexStatus !== filterVex) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.componentName.toLowerCase().includes(q) ||
      item.supplier.toLowerCase().includes(q) ||
      item.cveId.toLowerCase().includes(q) ||
      item.locationInProduct.toLowerCase().includes(q)
    );
  });

  const cisaKevCount = items.filter((i) => i.isCisaKev).length;
  const affectedCount = items.filter((i) => i.vexStatus === "affected").length;

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border border-border/80 bg-card/90 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-gradient-to-r from-card via-card to-orange-500/10 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30 font-mono text-xs gap-1">
                  <Flame className="h-3.5 w-3.5 text-orange-400" /> CycloneDX SBOM &amp; CISA KEV Correlation
                </Badge>
                <Badge variant="secondary" className="font-mono text-xs">
                  {cisaKevCount} CISA KEV Flagged
                </Badge>
                {affectedCount > 0 && (
                  <Badge variant="destructive" className="font-mono text-xs animate-pulse">
                    {affectedCount} Actionable Exploit
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl font-display font-bold text-foreground">
                SBOM / HBOM Component Vulnerability Correlation Matrix
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Full software (SBOM) and hardware (HBOM) bill of materials inventory correlated against CISA Known Exploited Vulnerabilities with VEX exploitability status controls.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          {/* Filtering Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search component, supplier, CVE ID, or location..."
                className="pl-9 text-xs font-mono bg-muted/50 border-border/80"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto font-mono text-xs">
              <button
                type="button"
                onClick={() => setFilterKevOnly((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl border text-xs transition-all flex items-center gap-1.5 ${
                  filterKevOnly
                    ? "bg-red-500/20 text-red-400 border-red-500/40 font-bold"
                    : "border-border/80 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Flame className="h-3.5 w-3.5" /> CISA KEV Only ({cisaKevCount})
              </button>

              <Select value={filterVex} onValueChange={setFilterVex}>
                <SelectTrigger className="w-[160px] h-8 text-xs font-mono">
                  <SelectValue placeholder="VEX Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All VEX Statuses</SelectItem>
                  <SelectItem value="affected">Affected</SelectItem>
                  <SelectItem value="not_affected">Not Affected</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="under_investigation">Under Investigation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actionable Data Table */}
          <div className="rounded-2xl border border-border/80 overflow-hidden bg-card/60">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-muted/80 font-mono text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border/80">
                  <tr>
                    <th className="p-3.5">Component &amp; Supplier</th>
                    <th className="p-3.5">Location in Product</th>
                    <th className="p-3.5">CVE &amp; CVSS</th>
                    <th className="p-3.5">CISA KEV</th>
                    <th className="p-3.5">VEX Exploitability Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{item.componentName}</span>
                          <Badge variant="outline" className="font-mono text-[10px]">
                            v{item.version}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-primary" /> {item.supplier} ({item.type})
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="text-xs font-mono text-foreground font-medium">
                          {item.locationInProduct}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          Products: {item.affectedProducts.join(", ")}
                        </div>
                      </td>

                      <td className="p-3.5 space-y-1">
                        <Badge
                          variant="outline"
                          className={`font-mono text-xs ${
                            item.cvssScore >= 9.0
                              ? "bg-red-500/20 text-red-400 border-red-500/40 font-bold"
                              : item.cvssScore >= 7.0
                              ? "bg-orange-500/20 text-orange-400 border-orange-500/40 font-semibold"
                              : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                          }`}
                        >
                          {item.cveId} ({item.cvssScore})
                        </Badge>
                      </td>

                      <td className="p-3.5">
                        {item.isCisaKev ? (
                          <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/40 font-mono text-[10px] gap-1 font-bold animate-pulse">
                            <Flame className="h-3 w-3" /> CISA KEV Flagged ({item.cisaKevAddedDate})
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                            No KEV Signal
                          </Badge>
                        )}
                      </td>

                      <td className="p-3.5 space-y-1.5">
                        <Select
                          value={item.vexStatus}
                          onValueChange={(val) => handleVexChange(item.id, val as SbomKevItem["vexStatus"])}
                        >
                          <SelectTrigger
                            className={`w-[170px] h-8 text-xs font-mono font-semibold ${
                              item.vexStatus === "affected"
                                ? "bg-red-500/20 text-red-400 border-red-500/40"
                                : item.vexStatus === "fixed"
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                                : item.vexStatus === "not_affected"
                                ? "bg-primary/20 text-primary border-primary/40"
                                : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                            }`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="affected">Affected</SelectItem>
                            <SelectItem value="not_affected">Not Affected</SelectItem>
                            <SelectItem value="fixed">Fixed</SelectItem>
                            <SelectItem value="under_investigation">Under Investigation</SelectItem>
                          </SelectContent>
                        </Select>

                        {item.vexJustification && (
                          <p className="text-[11px] text-muted-foreground leading-snug italic max-w-xs">
                            "{item.vexJustification}"
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
