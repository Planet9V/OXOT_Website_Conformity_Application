import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { revealVariants } from '@/lib/motion';

/**
 * A framed real-product screenshot — the same treatment as the ProductTour
 * `shot` slides (rounded card, hairline border, elevation), with an optional
 * caption footer. Marketing pages use this to SHOW the cockpit rather than only
 * describe it. Images are real captures under public/media/*. Reveals on scroll.
 */
export function ProductShot({
  src,
  alt,
  caption,
  className,
  index = 0,
  priority = false,
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  index?: number;
  priority?: boolean;
}) {
  return (
    <motion.figure
      className={cn(
        'overflow-hidden rounded-2xl border border-border bg-card shadow-e1',
        className,
      )}
      {...revealVariants(index)}
    >
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        className="block w-full"
      />
      {caption && (
        <figcaption className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </motion.figure>
  );
}
