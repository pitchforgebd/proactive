import type { Metadata } from 'next';
import Image from 'next/image';
import { founderMessage } from '@/lib/data/mock/content';
import PageHero from '@/components/layout/PageHero';
import Section from '@/components/ui/Section';
import RichText from '@/components/ui/RichText';
import RevealOnView from '@/components/motion/RevealOnView';
import CTABand from '@/components/ui/CTABand';

export const metadata: Metadata = {
  title: 'Message from Founder & CEO',
  description:
    'A message from Mr. Billal Hossain Bappi, Founder & CEO of Proactive Trade International, on why the company was built around service and local stock.',
  alternates: { canonical: '/about/founder-message' },
};

export default function FounderMessagePage() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="Message from Founder & CEO"
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'About Us', href: '/about' },
          { label: 'Founder Message' },
        ]}
      />

      <Section tone="paper-2" cropMarks>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-16">
          {/* Portrait */}
          <RevealOnView>
            <figure className="lg:sticky lg:top-[110px]">
              <div className="relative aspect-[4/5] overflow-hidden bg-band">
                <Image
                  src="/images/about/founder-portrait.png"
                  alt="Portrait of Mr. Billal Hossain Bappi, Founder & CEO"
                  fill
                  priority
                  sizes="(min-width: 1024px) 320px, 92vw"
                  className="object-cover"
                />
                {/* Registration ticks — the print gesture, quietly repeated. */}
                <span aria-hidden="true" className="absolute left-4 top-4 h-5 w-px bg-cyan" />
                <span aria-hidden="true" className="absolute left-4 top-4 h-px w-5 bg-cyan" />
              </div>
              <figcaption className="mt-5">
                <p className="font-display text-lg font-bold leading-tight text-ink">
                  Mr. Billal Hossain Bappi
                </p>
                <p className="eyebrow mt-2 text-magenta">Founder &amp; CEO</p>
              </figcaption>
            </figure>
          </RevealOnView>

          {/* Message */}
          <RevealOnView delay={80}>
            <blockquote className="border-l-2 border-cyan pl-6 font-display text-lg font-semibold leading-snug text-ink md:text-xl">
              We will be judged on uptime, not on brochures.
            </blockquote>

            <RichText html={founderMessage} className="mt-10" />

            {/* Signature block */}
            <div className="mt-12 border-t border-ink/10 pt-8">
              <p
                aria-hidden="true"
                className="font-display text-xl italic tracking-tight text-ink/80"
                style={{ transform: 'skewX(-8deg)' }}
              >
                B. H. Bappi
              </p>
              <p className="mt-4 text-sm font-semibold text-ink">
                Mr. Billal Hossain Bappi
              </p>
              <p className="eyebrow mt-1.5 text-graphite">
                Founder &amp; CEO · Proactive Trade International
              </p>
            </div>
          </RevealOnView>
        </div>
      </Section>

      <CTABand />
    </>
  );
}
