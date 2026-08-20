import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import HeroSlider from '@/components/home/HeroSlider';
import RegistrationHero from '@/components/motion/RegistrationHero';
import PointerParallax from '@/components/motion/PointerParallax';
import PressCounter from '@/components/motion/PressCounter';

const slides = [
  { src: '/images/hero/hero-01.png', alt: '' },
  { src: '/images/hero/hero-02.png', alt: '' },
  { src: '/images/hero/hero-03.png', alt: '' },
];

const stats = [
  { value: '100+', label: 'Companies served' },
  { value: '15+', label: 'Years of expertise' },
  { value: '2024', label: 'Founded' },
];

/**
 * Home hero. The headline is server-rendered text (the LCP element) wrapped in
 * the CMYK registration snap — the signature moment of the whole site.
 */
export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-70px)] items-center overflow-hidden text-onband">
      <HeroSlider slides={slides} />

      <PointerParallax className="absolute inset-0 z-0">
        {/* Registration target — drifts with the pointer, three depths so the
            channels separate slightly, like a sheet not yet in register. */}
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

        {/* The dot field leans the other way, so the layers pull apart. */}
        <div
          className="p-layer pointer-events-none absolute inset-0 halftone opacity-[0.35]"
          style={{ '--p-depth': '-10px', '--halftone-size': '9px' } as React.CSSProperties}
        />
      </PointerParallax>

      <div className="container-page relative z-10 py-20 md:py-28">
        <p className="eyebrow flex items-center gap-3 text-cyan">
          <span aria-hidden="true" className="h-px w-10 bg-cyan" />
          Printing &amp; Packaging · Bangladesh
        </p>

        <RegistrationHero
          className="mt-6 max-w-4xl"
          as="h1"
          textClassName="font-display text-3xl font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-onband md:text-4xl"
        >
          One-Stop
          <br />
          Printing &amp; Packaging
          <br />
          Solutions.
        </RegistrationHero>

        <p className="mt-7 max-w-xl text-base leading-relaxed text-onband/70">
          A trusted supplier of printing and packaging machineries, press room
          chemicals, inks, coatings and consumables — serving 100+ top-tier
          printing and packaging companies across Bangladesh.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 rounded-sm bg-cyan px-7 py-3.5 font-mono text-xs uppercase tracking-[0.16em] text-band transition-colors hover:bg-magenta hover:text-white"
          >
            Explore Products
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-300 ease-press group-hover:translate-x-1"
            />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-sm border border-white/25 px-7 py-3.5 font-mono text-xs uppercase tracking-[0.16em] text-onband transition-colors hover:border-cyan hover:text-cyan"
          >
            Get in Touch
          </Link>
        </div>

        <dl className="mt-14 flex flex-wrap gap-x-12 gap-y-6 border-t border-line pt-8">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <PressCounter
                  value={s.value}
                  className="block font-display text-2xl font-bold text-onband"
                />
                <span className="eyebrow mt-1 block text-onband/45">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
