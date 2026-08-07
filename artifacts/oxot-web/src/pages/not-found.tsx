import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { PublicLayout } from '@/components/layout/public-layout';
import { useLocale } from '@/providers/locale-provider';

// Localised page copy (nl-NL professional register, "u"). Machine-assisted —
// flag Dutch strings for a native reviewer before go-live. Structure mirrors the
// English source so every visible string has a Dutch equivalent.
const copy = {
  en: {
    title: '404 Not Found',
    body: "The page you are looking for doesn't exist or has been moved.",
    backToHome: 'Back to Home',
  },
  nl: {
    title: '404 Niet gevonden',
    body: 'De pagina die u zoekt bestaat niet of is verplaatst.',
    backToHome: 'Terug naar de startpagina',
  },
} as const;

export default function NotFound() {
  const { locale } = useLocale();
  const t = copy[locale];

  return (
    <PublicLayout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-muted rounded-3xl flex items-center justify-center mb-8 transform rotate-12">
          <FileQuestion className="w-12 h-12 text-muted-foreground transform -rotate-12" />
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-4">
          {t.title}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-md mb-8">
          {t.body}
        </p>
        <Button asChild size="lg" className="rounded-full">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.backToHome}
          </Link>
        </Button>
      </div>
    </PublicLayout>
  );
}
