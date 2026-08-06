import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export interface HeroSectionData {
  eyebrow?: string;
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  bullets?: string[];
}

export function HeroSection({ data }: { data: HeroSectionData }) {
  return (
    <section className="relative overflow-hidden pt-24 pb-32 md:pt-36 md:pb-40 lg:pt-48 lg:pb-48 flex items-center">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-background pointer-events-none -z-10" />
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl opacity-50 dark:opacity-20 pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl opacity-50 dark:opacity-20 pointer-events-none -z-10" />
      
      {/* subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10 opacity-20 dark:opacity-10" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {data.eyebrow && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
                {data.eyebrow}
              </span>
            </motion.div>
          )}
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-display font-normal tracking-tight text-foreground leading-[1.1] mb-6"
          >
            {data.title}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10"
          >
            {data.subtitle}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            {data.primaryCta && (
              <Button asChild size="lg" className="w-full sm:w-auto h-12 px-8 rounded-full text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all cta-lift">
                <Link href={data.primaryCta.href}>
                  {data.primaryCta.label} <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            )}
            {data.secondaryCta && (
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 rounded-full text-base bg-background/50 backdrop-blur-sm hover:bg-muted">
                <Link href={data.secondaryCta.href}>
                  {data.secondaryCta.label}
                </Link>
              </Button>
            )}
          </motion.div>

          {data.bullets && data.bullets.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-muted-foreground"
            >
              {data.bullets.map((bullet, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                  {bullet}
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
