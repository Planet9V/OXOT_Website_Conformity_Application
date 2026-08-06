import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';

export interface CtaSectionData {
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export function CtaSection({ data }: { data: CtaSectionData }) {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-foreground -z-20" />
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-[100px] opacity-20 -z-10 translate-x-1/3 translate-y-1/3" />
      
      <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-normal tracking-tight text-background mb-6 max-w-3xl mx-auto leading-tight">
          {data.title}
        </h2>
        
        <p className="text-lg md:text-xl text-muted/80 leading-relaxed max-w-2xl mx-auto mb-10">
          {data.subtitle}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {data.primaryCta && (
            <Button asChild size="lg" className="w-full sm:w-auto h-14 px-8 rounded-full text-base bg-primary text-primary-foreground hover:bg-primary/90 cta-lift">
              <Link href={data.primaryCta.href}>
                {data.primaryCta.label} <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          )}
          {data.secondaryCta && (
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 rounded-full text-base border-background/20 text-background hover:bg-background/10 hover:text-background">
              <Link href={data.secondaryCta.href}>
                {data.secondaryCta.label}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
