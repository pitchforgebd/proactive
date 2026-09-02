import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import HeroSlider from '@/components/sections/HeroSlider';
import RegistrationHero from '@/components/motion/RegistrationHero';
import PointerParallax from '@/components/motion/PointerParallax';
import PressAtmosphere from '@/components/motion/PressAtmosphere';
import PressCounter from '@/components/motion/PressCounter';
import type { HeroData } from '@/lib/sections/schemas';

/**
 * Home hero — the CMYK registration snap, the signature moment of the site.
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
      <PressAtmosphere intensity="soft" className="z-[1]" />

      <PointerParallax className="absolute inset-0 z-[2]">
        <svg
          aria-hidden="true"
          viewBox="0 0 400 400"
          className="pointer-events-none absolute -right-24 top-1/2 hidden h-[560px] w-[560px] -translate-y-1/2 opacity-[0.55] lg:block"
        >
          <g className="p-layer" style={{ '--p-depth': '26px' } as React.CSSProperties}>
            <circle cx="200" cy="200" r="120" fill="none" stroke="var(--cyan)" strokeWidth="1" />
            <circle cx="200" cy="200" r="164" fill="none" stroke="var(--cyan)" strokeWidth="0.6" opacity="0.6" />
          </g>
          <g className="p-layer" style={{ '--p-depth': '-18px' } as React.CSSProperties}>
            <circle cx="200" cy="200" r="120" fill="none" stroke="var(--magenta)" strokeWidth="1" />
            <circle cx="200" cy="200" r="164" fill="none" stroke="var(--magenta)" strokeWidth="0.6" opacity="0.6" />
          </g>
          <g className="p-layer" style={{ '--p-depth': '8px' } as React.CSSProperties}>
            <path d="M200 40v320M40 200h320" stroke="var(--onband)" strokeWidth="0.5" opacity="0.35" />
          </g>
        </svg>

        <div
          className="p-layer pointer-events-none absolute inset-0 halftone opacity-[0.35]"
          style={{ '--p-depth': '-10px', '--halftone-size': '9px' } as React.CSSProperties}
        />
      </PointerParallax>

      <div className="container-page relative z-10 py-8 sm:py-12 md:py-28">
        {eyebrow && (
          <p className="eyebrow flex items-center gap-2 text-[10px] text-cyan sm:gap-3 sm:text-xs">
            <span aria-hidden="true" className="h-px w-6 bg-cyan sm:w-10" />
            {eyebrow}
          </p>
        )}

        <RegistrationHero
          className="mt-3 max-w-4xl sm:mt-5"
          as="h1"
          textClassName="font-display text-[clamp(1.15rem,5.2vw,2.25rem)] font-extrabold uppercase leading-[1.05] tracking-tight text-onband break-words md:text-4xl md:leading-[0.95]"
        >
          {lines.map((line, i) => (
            <span key={line + i} className="block">
              {line}
            </span>
          ))}
        </RegistrationHero>

        {lede && (
          <p className="mt-3 max-w-xl text-[13px] leading-snug text-onband/70 sm:mt-5 sm:text-sm sm:leading-relaxed md:mt-7 md:text-base">
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
