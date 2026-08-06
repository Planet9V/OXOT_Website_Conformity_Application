import { Check, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ComparisonTableSectionData {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  columns: string[];
  rows: {
    label: string;
    values: (string | boolean)[];
  }[];
}

export function ComparisonTableSection({ data }: { data: ComparisonTableSectionData }) {
  if (!data.columns || !data.rows) return null;

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          {data.eyebrow && (
            <span className="text-primary font-medium tracking-wide text-sm uppercase mb-3 block">
              {data.eyebrow}
            </span>
          )}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-tight mb-6">
            {data.title}
          </h2>
          {data.subtitle && (
            <p className="text-lg text-muted-foreground leading-relaxed">
              {data.subtitle}
            </p>
          )}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto overflow-x-auto"
        >
          <div className="min-w-[800px] border rounded-2xl bg-card shadow-sm overflow-hidden">
            <div className="grid" style={{ gridTemplateColumns: `2fr repeat(${data.columns.length}, 1fr)` }}>
              {/* Header */}
              <div className="p-6 font-display font-semibold text-lg border-b border-r bg-muted/30">
                Features
              </div>
              {data.columns.map((col, i) => (
                <div 
                  key={i} 
                  className={`p-6 font-display font-semibold text-lg border-b text-center ${i === data.columns.length - 1 ? '' : 'border-r'} ${i === 0 ? 'bg-primary/5 text-primary' : 'bg-muted/30'}`}
                >
                  {col}
                </div>
              ))}

              {/* Rows */}
              {data.rows.map((row, rowIndex) => (
                <div key={rowIndex} className="contents group">
                  <div className="p-4 px-6 text-foreground font-medium border-b border-r group-hover:bg-muted/50 transition-colors flex items-center">
                    {row.label}
                  </div>
                  {row.values.map((val, colIndex) => (
                    <div 
                      key={colIndex} 
                      className={`p-4 flex items-center justify-center border-b group-hover:bg-muted/50 transition-colors ${colIndex === data.columns.length - 1 ? '' : 'border-r'} ${colIndex === 0 ? 'bg-primary/5' : ''}`}
                    >
                      {typeof val === 'boolean' ? (
                        val ? (
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                            <Check className="w-5 h-5" />
                          </div>
                        ) : (
                          <Minus className="w-5 h-5 text-muted-foreground/50" />
                        )
                      ) : (
                        <span className="text-sm font-medium">{val}</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
