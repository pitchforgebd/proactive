import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { aboutBody, aboutIntro } from '@/lib/data/mock/content';
import PageHero from '@/components/layout/PageHero';
import Section from '@/components/ui/Section';
import RichText from '@/components/ui/RichText';
import Eyebrow from '@/components/ui/Eyebrow';
import RevealOnView from '@/components/motion/RevealOnView';
import CTABand from '@/components/ui/CTABand';

export const metadata: Metadata = {
  title: 'About Us',
  description: aboutIntro,
  alternates: { canonical: '/about' },
};

const stats = [
  { value: '2024', label: 'Founded' },
  { value: '15+', label: 'Years of expertise' },
  { value: '100+', label: 'Companies served' },
  { value: '4', label: 'Solution lines' },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="One-stop printing & packaging solutions."
        lede={aboutIntro}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'About Us' }]}
        image="/images/about/about-company.png"
      />

      {/* Stats plate */}
      <Section tone="paper-2" className="py-10 md:py-12">
        <dl className="grid grid-cols-2 gap-px overflow-hidden border border-ink/10 bg-ink/10 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-paper-2 p-6 md:p-8">
              <dt className="eyebrow text-graphite">{s.label}</dt>
              <dd className="mt-3 font-display text-2xl font-bold leading-none text-ink">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section tone="paper" cropMarks>
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <RevealOnView>
            <Eyebrow index="01" tone="magenta">
              Our company
            </Eyebrow>
            <RichText html={aboutBody} className="mt-6" />
          </RevealOnView>

          {/* Founder aside */}
          <RevealOnView delay={80}>
            <aside className="border border-ink/10 bg-paper-2 p-7 lg:sticky lg:top-[110px]">
              <div className="relative aspect-[4/5] overflow-hidden bg-ink">
                <Image
                  src="/images/about/founder-portrait.png"
                  alt="Mr. Billal Hossain Bappi, Founder & CEO of Proactive Trade International"
                  fill
                  sizes="(min-width: 1024px) 32vw, 92vw"
                  loading="lazy"
                  className="object-cover"
                />
              </div>
              <p className="eyebrow mt-6 text-cyan">Founder &amp; CEO</p>
              <p className="mt-3 font-display text-lg font-bold leading-tight text-ink">
                Mr. Billal Hossain Bappi
              </p>
              <p className="mt-4 text-sm leading-relaxed text-graphite">
                Over 15 years of expertise in printing and packaging machineries
                and consumables — and the reason this company measures itself on
                uptime rather than order volume.
              </p>
              <Link
                href="/about/founder-message"
                className="group mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:text-magenta"
              >
                Read his message
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-300 ease-press group-hover:translate-x-1"
                />
              </Link>
            </aside>
          </RevealOnView>
        </div>
      </Section>

      <CTABand
        title="Come and see how we work."
        lede="Ask us for references from printing houses running the machinery and consumables we supply."
      />
    </>
  );
}
