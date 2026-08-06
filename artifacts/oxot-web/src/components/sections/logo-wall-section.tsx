import { motion } from 'framer-motion';

export interface LogoWallSectionData {
  title?: string;
  logos: {
    name: string;
  }[];
}

export function LogoWallSection({ data }: { data: LogoWallSectionData }) {
  if (!data.logos || data.logos.length === 0) return null;

  return (
    <section className="py-16 bg-card border-y">
      <div className="container mx-auto px-4 md:px-8">
        {data.title && (
          <h3 className="text-center text-sm font-medium text-muted-foreground uppercase tracking-widest mb-10">
            {data.title}
          </h3>
        )}
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
          {data.logos.map((logo, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-lg md:text-xl font-display font-normal text-foreground/80 hover:text-foreground select-none"
            >
              {logo.name}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
