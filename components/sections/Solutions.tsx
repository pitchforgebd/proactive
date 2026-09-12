'use client';

import Image from 'next/image';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import MotionReveal from '@/components/motion/MotionReveal';
import CrosshairFollow from '@/components/motion/CrosshairFollow';
import RollerLine from '@/components/motion/RollerLine';
import type { SolutionsData } from '@/lib/sections/schemas';

/**
 * "Our Solutions" — production disciplines with Framer stagger + hover.
 */
export default function Solutions({
  eyebrow,
  index,
  title,
  lede,
  linkText,
  linkHref,
  tiles,
}: SolutionsData) {
  return (
    <Section
      id="solutions"
      tone="ink"
      halftone
      atmosphere="soft"
      className="overflow-hidden"
    >
      <SectionHeading
        eyebrow={eyebrow}
        index={index}
        title={title ?? ''}
        lede={lede}
        link={linkText ? { href: linkHref || '/products', label: linkText } : undefined}
        invert
      />

      <RollerLine tone="ink" className="mt-12" />

      <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
        {tiles.map((s, i) => (
          <MotionReveal as="li" key={`${s.title}-${i}`} delay={i * 55}>
            <CrosshairFollow className="group relative overflow-hidden rounded-xl border border-line bg-band">
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={s.image}
                  alt={s.title}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  loading="lazy"
                  className="object-cover opacity-70 transition-all duration-700 ease-press group-hover:scale-[1.07] group-hover:opacity-95"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-band via-band/65 to-band/5"
                />
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                  <span className="eyebrow text-cyan/70">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-2.5 text-[15px] font-semibold leading-snug text-onband md:text-base">
                    {s.title}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="mt-3.5 block h-px w-6 bg-cyan transition-[width] duration-500 ease-press group-hover:w-16"
                  />
                </div>
              </div>
            </CrosshairFollow>
          </MotionReveal>
        ))}
      </ul>
    </Section>
  );
}
