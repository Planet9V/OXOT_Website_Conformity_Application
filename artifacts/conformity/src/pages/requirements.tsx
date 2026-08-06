import { useState } from "react";
import {
  useListRequirements,
  getListRequirementsQueryKey,
  useListThemes,
  useListRegulations,
} from "@workspace/api-client-react";
import { Link } from "wouter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getRegColor } from "@/lib/utils";
import { Search, SlidersHorizontal } from "lucide-react";

// Canonical obligation types stored by the backend (fixed set), with labels.
const OBLIGATION_TYPES: { value: string; label: string }[] = [
  { value: "product_requirement", label: "Product Requirement" },
  { value: "process", label: "Process" },
  { value: "documentation", label: "Documentation" },
  { value: "reporting", label: "Reporting" },
  { value: "governance", label: "Governance" },
];

export default function Requirements() {
  const [q, setQ] = useState("");
  const [regulation, setRegulation] = useState("");
  const [theme, setTheme] = useState("");
  const [obligationType, setObligationType] = useState("");

  const { data: themes } = useListThemes();
  const { data: regulations } = useListRegulations();

  const { data: requirements, isLoading, isError } = useListRequirements({
    q: q || undefined,
    regulation: regulation || undefined,
    theme: theme || undefined,
    obligationType: obligationType || undefined
  }, {
    query: {
      queryKey: getListRequirementsQueryKey({ q: q || undefined, regulation: regulation || undefined, theme: theme || undefined, obligationType: obligationType || undefined })
    }
  });

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-[1600px] mx-auto space-y-6">
      <div className="border-b border-border pb-6">
        <span className="oxot-kicker block mb-1">CROSS-REGULATORY OBLIGATIONS &amp; TECHNICAL REQUIREMENTS</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foreground">Requirements Explorer</h1>
        <p className="text-sm text-muted-foreground mt-1 font-sans">Search and filter across all framework obligations.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-muted/30 p-4 border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            aria-label="Search requirements"
            placeholder="Search requirements text or ref code..." 
            value={q} 
            onChange={e => setQ(e.target.value)}
            className="pl-9 bg-background rounded-md"
          />
        </div>
        
        <div className="flex gap-2 shrink-0">
          <select 
            aria-label="Filter by regulation"
            value={regulation} 
            onChange={e => setRegulation(e.target.value)}
            className="h-9 border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring rounded-md appearance-none cursor-pointer"
          >
            <option value="">All Regulations</option>
            {regulations?.map((r) => (
              <option key={r.key} value={r.key}>
                {r.shortName}
              </option>
            ))}
          </select>

          <select 
            aria-label="Filter by theme"
            value={theme} 
            onChange={e => setTheme(e.target.value)}
            className="h-9 border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring rounded-md appearance-none cursor-pointer w-[140px]"
          >
            <option value="">All Themes</option>
            {themes?.map((t) => (
              <option key={t.theme.key} value={t.theme.key}>
                {t.theme.name}
              </option>
            ))}
          </select>

          <select 
            aria-label="Filter by obligation type"
            value={obligationType} 
            onChange={e => setObligationType(e.target.value)}
            className="h-9 border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring rounded-md appearance-none cursor-pointer w-[160px]"
          >
            <option value="">All Obligations</option>
            {OBLIGATION_TYPES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border border-border rounded-md bg-card overflow-hidden">
        <div className="max-h-[calc(100dvh-16rem)] overflow-auto">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1,2,3,4,5,6,7].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : isError ? (
            <div className="p-8 text-destructive text-center">Failed to load requirements.</div>
          ) : !requirements?.length ? (
            <div className="p-16 text-center text-muted-foreground flex flex-col items-center">
              <SlidersHorizontal className="w-12 h-12 mb-4 opacity-20" />
              <p>No requirements match your current filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-card sticky top-0 z-10 shadow-sm">
                <TableRow>
                  <TableHead className="w-[180px]">Regulation / Ref</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-[160px]">Theme</TableHead>
                  <TableHead className="w-[140px]">Obligation</TableHead>
                  <TableHead className="w-[100px] text-right">Mappings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requirements.map((req) => (
                  <TableRow key={req.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <TableCell className="align-top">
                      <div className="flex flex-col gap-1.5 items-start">
                        <Badge className={`${getRegColor(req.regulationKey)} rounded-md text-[10px] px-1.5 py-0 border-none font-mono`}>
                          {req.regulationShortName}
                        </Badge>
                        <span className="font-mono text-xs text-muted-foreground font-medium">{req.refCode}</span>
                      </div>
                    </TableCell>
                    <TableCell className="align-top max-w-xl">
                      <Link href={`/requirements/${req.id}`} className="block group">
                        <div className="font-medium text-foreground group-hover:text-primary transition-colors mb-1">{req.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">{req.description}</div>
                      </Link>
                    </TableCell>
                    <TableCell className="align-top">
                      {req.themeName ? (
                        <span className="text-xs border border-border px-2 py-1 bg-muted/30">{req.themeName}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">-</span>
                      )}
                    </TableCell>
                    <TableCell className="align-top">
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{req.obligationType}</span>
                    </TableCell>
                    <TableCell className="align-top text-right">
                      {req.mappingCount > 0 ? (
                        <Badge variant="secondary" className="font-mono rounded-md">
                          {req.mappingCount}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
