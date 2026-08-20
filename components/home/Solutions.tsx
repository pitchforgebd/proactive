import Image from 'next/image';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import InkStagger from '@/components/motion/InkStagger';
import CrosshairFollow from '@/components/motion/CrosshairFollow';
import RollerLine from '@/components/motion/RollerLine';
import { solutions, solutionsIntro } from '@/lib/data/mock/content';

/**
 * "Our Solutions" — the eight production disciplines we supply into.
 *
 * Presentational tiles: image + title, no link. There is no per-solution route
 * yet, and inventing one that lands nowhere is worse than a static tile. The
 * section-level link carries the traffic to /products instead.
 */
export default function Solutions() {
  return (
    <Section id="solutions" tone="ink" halftone className="overflow-hidden">
      <SectionHeading
        eyebrow="Our Solutions"
        index="02"
        title="Comprehensive solutions for the printing and packaging industry."
        lede={solutionsIntro}
        link={{ href: '/products', label: 'View Products' }}
        invert
      />

      {/* Press roller — scrubs along the rail as the section passes. */}
      <RollerLine tone="ink" className="mt-10" />

      {/* Hairline grid: gap-px over a bg-line fill draws the separators. */}
      <InkStagger
        as="ul"
        className="mt-6 grid grid-cols-2 gap-px overflow-hidden border border-line bg-line md:grid-cols-4"
      >
        {solutions.map((s, i) => (
          <CrosshairFollow
            as="li"
            key={s.slug}
            className="group relative overflow-hidden bg-band"
          >
            <div data-ink-item className="relative aspect-square overflow-hidden">
              <Image
                src={s.image}
                alt={s.title}
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                loading="lazy"
                className="object-cover opacity-65 transition-all duration-500 ease-press group-hover:scale-[1.04] group-hover:opacity-90"
              />

              {/* Scrim so the title holds contrast over any photograph. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-band via-band/70 to-band/10"
              />

              <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                <span className="eyebrow text-cyan/70">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-2 text-sm font-semibold leading-snug text-onband md:text-base">
                  {s.title}
                </h3>
                <span
                  aria-hidden="true"
                  className="mt-3 block h-px w-6 bg-magenta transition-[width] duration-500 ease-press group-hover:w-16"
                />
              </div>
            </div>
          </CrosshairFollow>
        ))}
      </InkStagger>
    </Section>
  );
}
