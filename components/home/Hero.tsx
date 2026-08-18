import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import HeroSlider from '@/components/home/HeroSlider';
import RegistrationHero from '@/components/motion/RegistrationHero';

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
    <section className="relative isolate flex min-h-[calc(100svh-70px)] items-center overflow-hidden text-paper">
      <HeroSlider slides={slides} />

      <div className="container-page relative py-20 md:py-28">
        <p className="eyebrow flex items-center gap-3 text-cyan">
          <span aria-hidden="true" className="h-px w-10 bg-cyan" />
          Printing &amp; Packaging · Bangladesh
        </p>

        <RegistrationHero
          className="mt-6 max-w-4xl"
          as="h1"
          textClassName="font-display text-3xl font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-paper md:text-4xl"
        >
          One-Stop
          <br />
          Printing &amp; Packaging
          <br />
          Solutions.
        </RegistrationHero>

        <p className="mt-7 max-w-xl text-base leading-relaxed text-paper/70">
          A trusted supplier of printing and packaging machineries, press room
          chemicals, inks, coatings and consumables — serving 100+ top-tier
          printing and packaging companies across Bangladesh.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 rounded-sm bg-cyan px-7 py-3.5 font-mono text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:bg-magenta hover:text-white"
          >
            Explore Products
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-300 ease-press group-hover:translate-x-1"
            />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-sm border border-white/25 px-7 py-3.5 font-mono text-xs uppercase tracking-[0.16em] text-paper transition-colors hover:border-cyan hover:text-cyan"
          >
            Get in Touch
          </Link>
        </div>

        <dl className="mt-14 flex flex-wrap gap-x-12 gap-y-6 border-t border-line pt-8">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="block font-display text-2xl font-bold text-paper">
                  {s.value}
                </span>
                <span className="eyebrow mt-1 block text-paper/45">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
