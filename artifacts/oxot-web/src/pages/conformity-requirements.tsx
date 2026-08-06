import { useState } from 'react';
import {
  useListRequirements,
  getListRequirementsQueryKey,
  useListThemes,
  useListRegulations,
} from '@workspace/api-client-react';
import { Link } from 'wouter';
import { ConformityShell } from '@/components/layout/conformity-shell';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { regBgStyle } from '@/lib/reg-colors';
import { Search, SlidersHorizontal } from 'lucide-react';

const OBLIGATION_TYPES = [
  { value: 'product_requirement', label: 'Product Requirement' },
  { value: 'process',             label: 'Process'             },
  { value: 'documentation',       label: 'Documentation'       },
  { value: 'reporting',           label: 'Reporting'           },
  { value: 'governance',          label: 'Governance'          },
];

export default function ConformityRequirements() {
  const [q,              setQ]              = useState('');
  const [regulation,     setRegulation]     = useState('');
  const [theme,          setTheme]          = useState('');
  const [obligationType, setObligationType] = useState('');

  const { data: themes }      = useListThemes();
  const { data: regulations } = useListRegulations();

  const { data: requirements, isLoading, isError } = useListRequirements(
    {
      q:              q              || undefined,
      regulation:     regulation     || undefined,
      theme:          theme          || undefined,
      obligationType: obligationType || undefined,
    },
    {
      query: {
        queryKey: getListRequirementsQueryKey({
          q:              q              || undefined,
          regulation:     regulation     || undefined,
          theme:          theme          || undefined,
          obligationType: obligationType || undefined,
        }),
      },
    },
  );

  return (
    <ConformityShell>
      <div className="max-w-[1400px] space-y-6">

        <div>
          <h2 className="text-2xl font-display font-bold mb-1">Requirements Explorer</h2>
          <p className="text-muted-foreground text-sm">Search and filter across all framework obligations.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 bg-muted/30 p-4 rounded-xl border border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search requirements text or ref code…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 bg-background rounded-lg"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              {
                value: regulation,
                onChange: setRegulation,
                placeholder: 'All Regulations',
                options: regulations?.map((r) => ({ value: r.key, label: r.shortName })) ?? [],
              },
              {
                value: theme,
                onChange: setTheme,
                placeholder: 'All Themes',
                options: themes?.map((t) => ({ value: t.theme.key, label: t.theme.name })) ?? [],
              },
              {
                value: obligationType,
                onChange: setObligationType,
                placeholder: 'All Obligations',
                options: OBLIGATION_TYPES.map((o) => ({ value: o.value, label: o.label })),
              },
            ].map((sel, i) => (
              <select
                key={i}
                value={sel.value}
                onChange={(e) => sel.onChange(e.target.value)}
                className="h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer min-w-[140px]"
              >
                <option value="">{sel.placeholder}</option>
                {sel.options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
            </div>
          ) : isError ? (
            <div className="p-8 text-destructive text-center">Failed to load requirements.</div>
          ) : !requirements?.length ? (
            <div className="p-16 text-center text-muted-foreground flex flex-col items-center">
              <SlidersHorizontal className="w-10 h-10 mb-3 opacity-20" />
              <p>No requirements match your current filters.</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader className="bg-muted/40 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-[180px]">Regulation / Ref</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="w-[160px]">Theme</TableHead>
                    <TableHead className="w-[140px]">Obligation</TableHead>
                    <TableHead className="w-[90px] text-right">Mappings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requirements.map((req) => (
                    <TableRow key={req.id} className="cursor-pointer hover:bg-muted/30 transition-colors">
                      <TableCell className="align-top">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold text-white"
                            style={regBgStyle(req.regulationKey)}
                          >
                            {req.regulationShortName}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">{req.refCode}</span>
                        </div>
                      </TableCell>
                      <TableCell className="align-top max-w-xl">
                        <Link href={`/conformity-platform/requirements/${req.id}`} className="block group">
                          <div className="font-medium text-foreground group-hover:text-primary transition-colors mb-1 text-sm">
                            {req.title}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-2">{req.description}</div>
                        </Link>
                      </TableCell>
                      <TableCell className="align-top">
                        {req.themeName ? (
                          <span className="text-xs border border-border px-2 py-1 rounded-md bg-muted/30">
                            {req.themeName}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">—</span>
                        )}
                      </TableCell>
                      <TableCell className="align-top">
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {req.obligationType}
                        </span>
                      </TableCell>
                      <TableCell className="align-top text-right">
                        {req.mappingCount > 0 ? (
                          <Badge variant="secondary" className="font-mono">{req.mappingCount}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </ConformityShell>
  );
}
