import Image from 'next/image';
import Breadcrumbs, { type Crumb } from '@/components/ui/Breadcrumbs';
import Eyebrow from '@/components/ui/Eyebrow';
import HalftoneBg from '@/components/motion/HalftoneBg';
import { cn } from '@/lib/utils';

/**
 * Inner-page header band. Dark ground, halftone field, crop-marked frame —
 * consistent across every non-home page so navigation feels like one system.
 *
 * `image` is optional; when present it is the page's LCP element and gets
 * `priority`.
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
  return (
    <section className="relative isolate overflow-hidden bg-band text-onband">
      {image ? (
        <>
          <Image
            src={image}
            alt={imageAlt}
            fill
            priority
            sizes="100vw"
            quality={70}
            className="object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-band via-band/80 to-band/40" />
        </>
      ) : (
        <HalftoneBg grid fade={false} className="opacity-70" />
      )}

      <div
        className={cn(
          'container-page relative',
          compact ? 'py-14 md:py-16' : 'py-16 md:py-24',
        )}
      >
        {crumbs && <Breadcrumbs items={crumbs} invert className="mb-8" />}
        {eyebrow && <Eyebrow tone="cyan">{eyebrow}</Eyebrow>}
        <h1 className="mt-4 max-w-4xl text-2xl font-extrabold uppercase leading-[1.02] tracking-[-0.025em] md:text-3xl">
          {title}
        </h1>
        {lede && (
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-onband/65">
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
