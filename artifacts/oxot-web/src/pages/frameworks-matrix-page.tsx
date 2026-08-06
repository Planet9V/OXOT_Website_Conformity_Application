import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Info } from 'lucide-react';
import { useGetMappingMatrix } from '@workspace/api-client-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSeo } from '@/hooks/use-seo';
import { regBgStyle, regColor } from '@/lib/reg-colors';

export default function FrameworksMatrixPage() {
  useSeo({
    title: 'Control Matrix — OXOT Frameworks',
    description:
      'Cross-regulation requirements matrix showing how EU cybersecurity obligations map across control themes — CRA, NIS2, AI Act, Machinery, IEC 62443 and more.',
  });

  const { data: matrix, isLoading } = useGetMappingMatrix();
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  const themes = selectedTheme
    ? (matrix?.themes ?? []).filter((t) => t.key === selectedTheme)
    : (matrix?.themes ?? []);

  const regulations = matrix?.regulations ?? [];

  /** Look up a cell count, returns 0 if missing */
  function cellCount(themeKey: string, regKey: string): number {
    return (
      matrix?.cells.find(
        (c) => c.themeKey === themeKey && c.regulationKey === regKey
      )?.requirementCount ?? 0
    );
  }

  return (
    <div className="w-full">
      {/* ── Header ───────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-32 pb-12 md:pt-40 md:pb-16">
        <div className="absolute inset-0 bg-background -z-10 pointer-events-none" />
        <div className="absolute top-0 left-0 translate-y-8 -translate-x-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl opacity-50 pointer-events-none -z-10" />

        <div className="container mx-auto px-4 md:px-8">
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm text-muted-foreground mb-8"
          >
            <Link href="/frameworks" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Frameworks
            </Link>
          </motion.nav>

          <div className="max-w-3xl">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-5"
            >
              Cross-regulation view
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-tight text-foreground mb-4"
            >
              Control requirements matrix
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-base md:text-lg text-muted-foreground leading-relaxed"
            >
              Each row is a cross-cutting control theme; each column is a regulation or standard.
              The number in each cell is the count of requirements that cover that theme.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── Theme filter pills ───────────────────────────── */}
      {!isLoading && matrix && (
        <div className="sticky top-16 z-20 bg-background/90 backdrop-blur border-b border-border/40 py-3">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs text-muted-foreground font-medium shrink-0">Filter theme:</span>
              <button
                onClick={() => setSelectedTheme(null)}
                className={`shrink-0 text-xs px-3 py-1 rounded-full border transition-all ${
                  selectedTheme === null
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
              >
                All
              </button>
              {matrix.themes.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setSelectedTheme(selectedTheme === t.key ? null : t.key)}
                  className={`shrink-0 text-xs px-3 py-1 rounded-full border transition-all ${
                    selectedTheme === t.key
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Matrix ───────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-12 w-full rounded-xl" />
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : !matrix ? (
            <div className="text-center py-16 text-muted-foreground">
              Unable to load matrix data.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border/50 shadow-sm">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                {/* ── Column headers ── */}
                <thead>
                  <tr className="bg-muted/40">
                    <th className="text-left p-4 font-semibold text-foreground text-sm border-b border-border/50 w-48 min-w-[12rem]">
                      Control theme
                    </th>
                    {regulations.map((reg) => (
                      <th
                        key={reg.key}
                        className="p-3 text-center border-b border-border/50 min-w-[90px]"
                      >
                        <Link href={`/frameworks/${reg.key}`}>
                          <span
                            className="inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold text-white cursor-pointer hover:opacity-80 transition-opacity"
                            style={regBgStyle(reg.key)}
                            title={reg.name}
                          >
                            {reg.shortName}
                          </span>
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* ── Rows ── */}
                <tbody>
                  {themes.map((theme, ri) => (
                    <motion.tr
                      key={theme.key}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: ri * 0.04 }}
                      className="border-b border-border/30 hover:bg-muted/20 transition-colors group"
                    >
                      {/* Theme label */}
                      <td className="p-4 align-top">
                        <p className="font-medium text-foreground text-sm leading-snug">
                          {theme.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                          {theme.description}
                        </p>
                      </td>

                      {/* Cells */}
                      {regulations.map((reg) => {
                        const count = cellCount(theme.key, reg.key);
                        const cellId = `${theme.key}:${reg.key}`;
                        const isHovered = hoveredCell === cellId;

                        return (
                          <td
                            key={reg.key}
                            className="p-3 text-center align-middle"
                            onMouseEnter={() => setHoveredCell(cellId)}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            {count > 0 ? (
                              <Link href={`/frameworks/${reg.key}`}>
                                <div
                                  className="relative inline-flex items-center justify-center w-10 h-10 rounded-xl font-mono font-bold text-sm cursor-pointer transition-all hover:scale-110"
                                  style={{
                                    background: `hsl(${regColor(reg.key)} / ${isHovered ? 0.25 : 0.12})`,
                                    color: `hsl(${regColor(reg.key)})`,
                                    boxShadow: isHovered ? `0 0 0 2px hsl(${regColor(reg.key)} / 0.4)` : undefined,
                                  }}
                                  title={`${count} requirement${count !== 1 ? 's' : ''} for ${theme.name} in ${reg.name}`}
                                >
                                  {count}
                                </div>
                              </Link>
                            ) : (
                              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl">
                                <span className="w-1.5 h-1.5 rounded-full bg-border/60" />
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Legend */}
          {!isLoading && matrix && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 flex flex-wrap items-center gap-6 text-xs text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5" />
                Numbers show how many requirements that regulation has for that control theme.
              </div>
              <div className="flex items-center gap-4">
                {regulations.slice(0, 6).map((reg) => (
                  <Link key={reg.key} href={`/frameworks/${reg.key}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={regBgStyle(reg.key)}
                    />
                    {reg.shortName}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Regulation quick-links ───────────────────────── */}
      {!isLoading && matrix && (
        <section className="py-12 border-t border-border/40">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-xl font-display font-semibold mb-6">Explore individual frameworks</h2>
            <div className="flex flex-wrap gap-3">
              {regulations.map((reg) => (
                <Link key={reg.key} href={`/frameworks/${reg.key}`}>
                  <span
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium cursor-pointer transition-all hover:shadow-sm"
                    style={{
                      borderColor: `hsl(${regColor(reg.key)} / 0.4)`,
                      color: `hsl(${regColor(reg.key)})`,
                      background: `hsl(${regColor(reg.key)} / 0.06)`,
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={regBgStyle(reg.key)}
                    />
                    {reg.name}
                    <span className="text-xs opacity-70">
                      {reg.requirementCount} reqs
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Bottom nav ───────────────────────────────────── */}
      <div className="py-8 border-t border-border/40">
        <div className="container mx-auto px-4 md:px-8">
          <Link
            href="/frameworks"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to all frameworks
          </Link>
        </div>
      </div>
    </div>
  );
}
