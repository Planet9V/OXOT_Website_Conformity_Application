import { motion } from 'framer-motion';

export interface StepsSectionData {
  eyebrow?: string;
  title: string;
  steps: {
    number: string | number;
    title: string;
    description: string;
  }[];
}

export function StepsSection({ data }: { data: StepsSectionData }) {
  if (!data.steps || data.steps.length === 0) return null;

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl mb-16">
          {data.eyebrow && (
            <span className="text-primary font-medium tracking-wide text-sm uppercase mb-3 block">
              {data.eyebrow}
            </span>
          )}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-tight mb-6">
            {data.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line for desktop */}
          <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-border -z-10" />

          {data.steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className="relative"
            >
              <div className="w-16 h-16 rounded-full bg-card border-2 border-primary text-primary font-display font-bold text-2xl flex items-center justify-center mb-6 shadow-lg mx-auto md:mx-0">
                {step.number}
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-display font-semibold mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
