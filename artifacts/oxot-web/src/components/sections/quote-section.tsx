import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

export interface QuoteSectionData {
  quote: string;
  author: string;
  role?: string;
}

export function QuoteSection({ data }: { data: QuoteSectionData }) {
  return (
    <section className="py-24 bg-primary/5 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] text-primary/5 font-serif leading-none select-none pointer-events-none">
        "
      </div>
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <Quote className="w-12 h-12 text-primary mx-auto mb-8 opacity-50" />
          
          <blockquote className="text-2xl md:text-3xl lg:text-4xl font-display font-medium leading-relaxed text-foreground mb-10">
            "{data.quote}"
          </blockquote>
          
          <div>
            <div className="font-bold text-lg text-foreground">{data.author}</div>
            {data.role && (
              <div className="text-primary font-medium mt-1">{data.role}</div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
