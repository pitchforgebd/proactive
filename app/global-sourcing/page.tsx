import type { Metadata } from 'next';
import { Globe2, PackageCheck, Timer, Users } from 'lucide-react';
import { globalSourcing } from '@/lib/data/mock/content';
import PageHero from '@/components/layout/PageHero';
import Section from '@/components/ui/Section';
import RichText from '@/components/ui/RichText';
import Eyebrow from '@/components/ui/Eyebrow';
import RevealOnView from '@/components/motion/RevealOnView';
import CTABand from '@/components/ui/CTABand';

export const metadata: Metadata = {
  title: 'Global Sourcing',
  description: globalSourcing.intro,
  alternates: { canonical: '/global-sourcing' },
};

const pillarIcons = [Globe2, PackageCheck, Users, Timer];

export default function GlobalSourcingPage() {
  return (
    <>
      <PageHero
        eyebrow="Global Sourcing"
        title="A supply chain arranged before the order is signed."
        lede={globalSourcing.intro}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Global Sourcing' }]}
        image="/images/about/global-sourcing.png"
      />

      <Section tone="paper-2">
        <ul className="grid gap-px overflow-hidden border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
          {globalSourcing.pillars.map((p, i) => {
            const Icon = pillarIcons[i] ?? Globe2;
            return (
              <RevealOnView
                as="li"
                key={p.title}
                delay={i * 60}
                className="bg-paper-2 p-7"
              >
                <Icon
                  aria-hidden="true"
                  className={
                    i % 2 === 0 ? 'h-6 w-6 text-cyan' : 'h-6 w-6 text-magenta'
                  }
                />
                <h2 className="mt-6 text-base font-semibold leading-snug">
                  {p.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-graphite">
                  {p.description}
                </p>
              </RevealOnView>
            );
          })}
        </ul>
      </Section>

      <Section tone="paper" cropMarks>
        <RevealOnView>
          <Eyebrow index="01" tone="magenta">
            How the network runs
          </Eyebrow>
          <RichText html={globalSourcing.body} className="mt-6" />
        </RevealOnView>
      </Section>

      <CTABand
        title="Need a manufacturer we do not list?"
        lede="Tell us the specification. Our sourcing team will find it, assess it against our criteria, and quote it with a parts plan attached."
      />
    </>
  );
}
