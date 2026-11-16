import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import HeroSlider from '@/components/sections/HeroSlider';
import PressCounter from '@/components/motion/PressCounter';
import type { HeroData } from '@/lib/sections/schemas';

/**
 * Home hero — photo slider (cross-fade + slow zoom) under one neutral scrim.
 * The print-themed overlays (registration snap, orbit rings, halftone,
 * parallax) were removed from here on purpose: they fought the photography.
 *
 * Mobile: fixed short band (not full viewport) so the slider does not dominate.
 * Desktop: near-viewport height as before.
 */
export default function Hero({
  eyebrow,
  headline,
  lede,
  primaryCtaText,
  primaryCtaHref,
  secondaryCtaText,
  secondaryCtaHref,
  slides,
  stats,
}: HeroData) {
  const lines = headline.split('\n').map((l) => l.trim()).filter(Boolean);

  return (
    <section
      className="relative isolate flex h-[min(52svh,400px)] items-center overflow-hidden text-onband sm:h-[min(58svh,480px)] md:h-auto md:min-h-[calc(100svh-70px)]"
    >
      <HeroSlider slides={slides.map((s) => ({ src: s.image, alt: s.alt ?? '' }))} />

      <div className="container-page relative z-10 py-8 sm:py-12 md:py-28 pb-12 sm:pb-14 md:pb-28">
        {eyebrow && (
          <p className="eyebrow flex items-center gap-2 text-[10px] text-white sm:gap-3 sm:text-xs">
            <span aria-hidden="true" className="h-px w-6 bg-cyan sm:w-10" />
            {eyebrow}
          </p>
        )}

        <h1 className="mt-3 max-w-4xl font-display text-[clamp(1.15rem,5.2vw,2.25rem)] font-extrabold uppercase leading-[1.05] tracking-tight text-white break-words sm:mt-5 md:text-4xl md:leading-[0.95]">
          {lines.map((line, i) => (
            <span key={line + i} className="block">
              {line}
            </span>
          ))}
        </h1>

        {lede && (
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:mt-6 sm:leading-relaxed md:mt-7 md:text-base">
            {lede}
          </p>
        )}

        {(primaryCtaText || secondaryCtaText) && (
          <div className="mt-5 flex flex-wrap gap-2 sm:mt-7 sm:gap-3 md:mt-9">
            {primaryCtaText && (
              <Link
                href={primaryCtaHref || '/products'}
                className="group inline-flex items-center gap-1.5 rounded-md bg-cyan px-4 py-2.5 font-mono text-[10px] uppercase text-band transition-colors hover:bg-magenta hover:text-white sm:gap-2 sm:px-6 sm:py-3 sm:text-xs md:px-7 md:py-3.5"
              >
                {primaryCtaText}
                <ArrowRight
                  aria-hidden="true"
                  className="h-3.5 w-3.5 transition-transform duration-300 ease-press group-hover:translate-x-1 sm:h-4 sm:w-4"
                />
              </Link>
            )}
            {secondaryCtaText && (
              <Link
                href={secondaryCtaHref || '/contact'}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/25 px-4 py-2.5 font-mono text-[10px] uppercase text-onband transition-colors hover:border-cyan hover:text-cyan sm:gap-2 sm:px-6 sm:py-3 sm:text-xs md:px-7 md:py-3.5"
              >
                {secondaryCtaText}
              </Link>
            )}
          </div>
        )}

        {stats.length > 0 && (
          <dl className="mt-6 hidden flex-wrap gap-x-10 gap-y-4 border-t border-line pt-5 sm:mt-10 sm:flex md:mt-14 md:gap-x-12 md:gap-y-6 md:pt-8">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <PressCounter
                    value={s.value}
                    className="block font-display text-xl font-bold text-onband md:text-2xl"
                  />
                  <span className="eyebrow mt-1 block text-onband/45">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
