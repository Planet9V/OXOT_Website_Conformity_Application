import { motion } from 'framer-motion';

export interface StatBandSectionData {
  stats: {
    value: string;
    label: string;
    sublabel?: string;
  }[];
}

export function StatBandSection({ data }: { data: StatBandSectionData }) {
  if (!data.stats || data.stats.length === 0) return null;

  return (
    <section className="py-12 bg-card border-y relative z-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x divide-border/50">
          {data.stats.map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex flex-col items-center justify-center text-center px-4"
            >
              <div className="text-3xl md:text-4xl lg:text-5xl font-display font-medium text-foreground mb-2">
                {stat.value}
              </div>
              <div className="text-sm md:text-base font-medium text-primary">
                {stat.label}
              </div>
              {stat.sublabel && (
                <div className="text-xs text-muted-foreground mt-1">
                  {stat.sublabel}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
