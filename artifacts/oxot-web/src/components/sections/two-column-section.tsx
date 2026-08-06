import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Check, ArrowRight } from 'lucide-react';
import { RichText } from '@/components/rich-text';

export interface TwoColumnSectionData {
  eyebrow?: string;
  title: string;
  body: string;
  bullets?: string[];
  cta?: { label: string; href: string };
  reverse?: boolean;
}

export function TwoColumnSection({ data }: { data: TwoColumnSectionData }) {
  return (
    <section className="py-24 bg-card overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className={`flex flex-col ${data.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-24`}>
          
          <motion.div 
            initial={{ opacity: 0, x: data.reverse ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2 space-y-6"
          >
            {data.eyebrow && (
              <span className="text-primary font-medium tracking-wide text-sm uppercase block">
                {data.eyebrow}
              </span>
            )}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-tight text-foreground">
              {data.title}
            </h2>
            <div className="prose prose-lg dark:prose-invert prose-p:text-muted-foreground text-foreground max-w-none">
              <p><RichText text={data.body} /></p>
            </div>
            
            {data.bullets && data.bullets.length > 0 && (
              <ul className="space-y-4 pt-4">
                {data.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start">
                    <div className="mt-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-3">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-foreground">{bullet}</span>
                  </li>
                ))}
              </ul>
            )}

            {data.cta && (
              <div className="pt-6">
                <Button asChild variant="outline" className="group rounded-full px-6">
                  <Link href={data.cta.href}>
                    {data.cta.label}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-1/2"
          >
            {/* Abstract engineered graphic representation */}
            <div className="relative aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl transform rotate-3" />
              <div className="absolute inset-0 bg-card border border-border shadow-xl rounded-3xl transform -rotate-3 transition-transform hover:rotate-0 duration-500 overflow-hidden flex flex-col">
                <div className="h-12 border-b flex items-center px-4 gap-2 bg-muted/30">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 p-6 relative">
                  <div className="absolute top-8 left-8 right-8 h-2 bg-muted rounded-full" />
                  <div className="absolute top-16 left-8 right-16 h-2 bg-muted rounded-full" />
                  <div className="absolute top-24 left-8 right-12 h-2 bg-muted rounded-full" />
                  
                  <div className="absolute bottom-8 right-8 w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin [animation-duration:3s]" />
                  </div>
                  
                  <div className="absolute bottom-8 left-8 flex gap-2">
                    <div className="w-4 h-16 bg-secondary/40 rounded-sm" />
                    <div className="w-4 h-24 bg-primary/60 rounded-sm" />
                    <div className="w-4 h-12 bg-secondary/40 rounded-sm" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
