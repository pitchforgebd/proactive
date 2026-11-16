import Image from 'next/image';
import Breadcrumbs, { type Crumb } from '@/components/ui/Breadcrumbs';
import Eyebrow from '@/components/ui/Eyebrow';
import { cn } from '@/lib/utils';

/** Used when a page does not supply its own hero photo. */
const DEFAULT_HERO_IMAGE = '/images/hero/hero-03.png';

/**
 * Inner-page header band. Always a photo under a light-to-medium navy overlay —
 * consistent across every non-home page so navigation feels like one system.
 *
 * The photo is the page's LCP element and gets `priority`.
 */
export default function PageHero({
  eyebrow,
  title,
  lede,
  crumbs,
  image,
  imageAlt = '',
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  crumbs?: Crumb[];
  image?: string;
  imageAlt?: string;
  compact?: boolean;
}) {
  // Every page hero carries a photo; pages without their own get the default.
  const src = image || DEFAULT_HERO_IMAGE;

  return (
    <section className="relative isolate overflow-hidden bg-[rgb(var(--scrim-rgb))] text-onband">
      <Image
        src={src}
        alt={image ? imageAlt : ''}
        fill
        priority
        sizes="100vw"
        quality={70}
        className="object-cover"
      />
      {/* One navy at reduced opacity: heavier behind the text (left), light on
          the right so the photo reads clearly. Same colour throughout. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgb(var(--band-rgb) / 0.72) 0%, rgb(var(--band-rgb) / 0.5) 50%, rgb(var(--band-rgb) / 0.28) 100%)',
        }}
      />

      <div
        className={cn(
          'container-page relative z-[1]',
          compact ? 'py-12 sm:py-16 md:py-20' : 'py-14 sm:py-20 md:py-28',
        )}
      >
        {crumbs && <Breadcrumbs items={crumbs} invert className="mb-6 sm:mb-8" />}
        {eyebrow && <Eyebrow tone="cyan">{eyebrow}</Eyebrow>}
        <h1 className="mt-3 max-w-4xl text-xl font-extrabold uppercase leading-snug sm:mt-4 sm:text-2xl sm:leading-[1.02] md:text-3xl">
          {title}
        </h1>
        {lede && (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-onband/85 sm:mt-6 sm:text-base">
            {lede}
          </p>
        )}
      </div>

      {/* CMYK rule closing the band. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-0.5"
        style={{
          background:
            'linear-gradient(90deg, var(--cyan) 0%, var(--cyan) 33%, var(--magenta) 33%, var(--magenta) 66%, var(--yellow) 66%, var(--yellow) 100%)',
        }}
      />
    </section>
  );
}
