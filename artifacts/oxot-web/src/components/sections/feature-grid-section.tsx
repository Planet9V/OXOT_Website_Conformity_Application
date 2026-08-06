import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

export interface FeatureGridSectionData {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  features: {
    title: string;
    description: string;
    icon?: string;
  }[];
}

export function FeatureGridSection({ data }: { data: FeatureGridSectionData }) {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {data.features.map((feature, i) => {
            // @ts-ignore - dynamic icon loading
            const IconComponent = feature.icon && LucideIcons[feature.icon] ? LucideIcons[feature.icon] : LucideIcons.CheckCircle;
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group p-8 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all hover:border-primary/20 flex flex-col"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
