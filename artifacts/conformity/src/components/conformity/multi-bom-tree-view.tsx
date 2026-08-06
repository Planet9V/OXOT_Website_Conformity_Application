import { useState } from "react";
import { Cpu, ShieldCheck, Layers, Lock, Server, Database, Bot, ChevronRight, ChevronDown, CheckCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export interface BomNode {
  id: number;
  name: string;
  version: string;
  bomType: "sbom" | "hbom" | "cbom" | "saasbom" | "dbom" | "aibom" | string;
  componentType: string;
  supplier: string;
  purl?: string;
  tierLevel: number;
  chipsetArchitecture?: string;
  pqcReadinessScore?: number;
  findingCount?: number;
  children?: BomNode[];
}

export function MultiBomTreeView({ tree }: { tree: BomNode[] }) {
  const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({ 1: true, 2: true });

  const toggleNode = (id: number) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getBomTypeIcon = (type: string) => {
    switch (type) {
      case "hbom":
        return <Cpu className="w-4 h-4 text-amber-400" />;
      case "cbom":
        return <Lock className="w-4 h-4 text-purple-400" />;
      case "saasbom":
        return <Server className="w-4 h-4 text-blue-400" />;
      case "dbom":
        return <Database className="w-4 h-4 text-emerald-400" />;
      case "aibom":
        return <Bot className="w-4 h-4 text-teal-400" />;
      default:
        return <Layers className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getBomTypeBadge = (type: string) => {
    switch (type) {
      case "hbom":
        return <Badge className="bg-amber-950 text-amber-300 border-amber-500/30 text-[10px]">HBOM (Hardware)</Badge>;
      case "cbom":
        return <Badge className="bg-purple-950 text-purple-300 border-purple-500/30 text-[10px]">CBOM (Crypto)</Badge>;
      case "saasbom":
        return <Badge className="bg-blue-950 text-blue-300 border-blue-500/30 text-[10px]">SaaSBOM (Cloud)</Badge>;
      case "dbom":
        return <Badge className="bg-emerald-950 text-emerald-300 border-emerald-500/30 text-[10px]">DBOM (Data)</Badge>;
      case "aibom":
        return <Badge className="bg-teal-950 text-teal-300 border-teal-500/30 text-[10px]">AI-BOM (Model)</Badge>;
      default:
        return <Badge className="bg-cyan-950 text-cyan-300 border-cyan-500/30 text-[10px]">SBOM (Software)</Badge>;
    }
  };

  const renderNode = (node: BomNode, depth: number = 0) => {
    const isExpanded = expandedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="space-y-2">
        <div
          onClick={() => hasChildren && toggleNode(node.id)}
          className={`flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-300 ${
            hasChildren ? "cursor-pointer" : ""
          }`}
          style={{ marginLeft: `${depth * 1.5}rem` }}
        >
          <div className="flex items-center gap-3">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4 text-cyan-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500" />
              )
            ) : (
              <span className="w-4" />
            )}

            {getBomTypeIcon(node.bomType)}

            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-100 text-sm">{node.name}</span>
                {node.version && <span className="text-xs text-slate-400 font-mono">v{node.version}</span>}
                {getBomTypeBadge(node.bomType)}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Supplier: <span className="text-slate-300">{node.supplier || "Internal OEM"}</span>
                {node.chipsetArchitecture && (
                  <span className="ml-2 text-amber-300 font-mono">Arch: {node.chipsetArchitecture}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-slate-700 text-slate-400 text-[10px]">
              Tier {node.tierLevel} Component
            </Badge>

            {node.bomType === "cbom" && (
              <Badge className="bg-purple-950 text-purple-300 border border-purple-500/30 text-[10px]">
                PQC Ready: {node.pqcReadinessScore ?? 100}%
              </Badge>
            )}

            {(node.findingCount ?? 0) > 0 ? (
              <Badge className="bg-red-950 text-red-400 border border-red-500/30 text-[10px] flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {node.findingCount} CVEs
              </Badge>
            ) : (
              <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Verified
              </Badge>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-2 border-l-2 border-slate-800 ml-4 pl-2">
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="bg-slate-900/60 border-slate-800 text-slate-100 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" /> Multi-Tier OEM Supply Chain Lineage Tree
        </CardTitle>
        <CardDescription className="text-slate-400">
          Recursive component hierarchy matching Hardware (HBOM), Cryptography (CBOM), Cloud APIs (SaaSBOM), and Software (SBOM).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {tree && tree.length > 0 ? (
          tree.map((node) => renderNode(node, 0))
        ) : (
          <div className="p-8 text-center text-slate-500 text-sm">
            No multi-tier BOM components registered for this product assessment.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
