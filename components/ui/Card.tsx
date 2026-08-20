import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardProps {
  href: string;
  title: string;
  image: string;
  description?: string;
  eyebrow?: string;
  /** Passed straight to next/image — get this right or the browser over-downloads. */
  sizes?: string;
  /** Only the first card above the fold should ever set this. */
  priority?: boolean;
  aspect?: 'video' | 'square' | 'portrait';
  className?: string;
}

const aspectClass = {
  video: 'aspect-[16/10]',
  square: 'aspect-square',
  portrait: 'aspect-[4/5]',
};

/**
 * Content card. Hover paints a registration crosshair in the corner and slides
 * a magenta rule under the title — the small, repeated print gesture.
 */
export default function Card({
  href,
  title,
  image,
  description,
  eyebrow,
  sizes = '(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw',
  priority = false,
  aspect = 'video',
  className,
}: CardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative flex flex-col overflow-hidden border border-ink/10 bg-paper-2 transition-colors duration-300 hover:border-ink/25',
        className,
      )}
    >
      <div className={cn('relative overflow-hidden bg-band-2', aspectClass[aspect])}>
        <Image
          src={image}
          alt={title}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-500 ease-press group-hover:scale-[1.03]"
        />
        {/* Registration crosshair — appears on hover, top-right corner. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-3 h-5 w-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-cyan" />
          <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-magenta" />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        {eyebrow && <span className="eyebrow text-graphite">{eyebrow}</span>}
        <h3 className="relative inline-flex items-start gap-1.5 text-lg font-semibold leading-snug">
          <span>
            {title}
            <span
              aria-hidden="true"
              className="mt-1 block h-px w-0 bg-magenta transition-[width] duration-300 ease-press group-hover:w-full"
            />
          </span>
          <ArrowUpRight
            aria-hidden="true"
            className="mt-1 h-4 w-4 shrink-0 text-graphite transition-colors group-hover:text-magenta"
          />
        </h3>
        {description && (
          <p className="text-sm text-graphite line-clamp-3">{description}</p>
        )}
      </div>
    </Link>
  );
}
