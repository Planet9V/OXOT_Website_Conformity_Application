import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RichText } from '@/components/rich-text';

export interface FaqSectionData {
  eyebrow?: string;
  title: string;
  items: {
    question: string;
    answer: string;
  }[];
}

export function FaqSection({ data }: { data: FaqSectionData }) {
  if (!data.items || data.items.length === 0) return null;

  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <div className="text-center mb-16">
          {data.eyebrow && (
            <span className="oxot-kicker mb-3 block">
              {data.eyebrow}
            </span>
          )}
          <h2 className="text-3xl md:text-4xl font-display font-normal tracking-tight">
            {data.title}
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {data.items.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-b-border/50 py-2">
              <AccordionTrigger className="text-left text-lg font-medium hover:text-primary hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pt-2 pb-4">
                <RichText text={item.answer} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
