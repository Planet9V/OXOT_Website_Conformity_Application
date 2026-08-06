import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { PublicLayout } from '@/components/layout/public-layout';

export default function NotFound() {
  return (
    <PublicLayout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-muted rounded-3xl flex items-center justify-center mb-8 transform rotate-12">
          <FileQuestion className="w-12 h-12 text-muted-foreground transform -rotate-12" />
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-4">
          404 Not Found
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-md mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Button asChild size="lg" className="rounded-full">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
    </PublicLayout>
  );
}
