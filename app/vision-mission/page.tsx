import type { Metadata } from 'next';
import {
  BadgeCheck,
  Cpu,
  Handshake,
  ShieldCheck,
  Target,
  Users,
  Compass,
} from 'lucide-react';
import { coreValues, mission, vision } from '@/lib/data/mock/content';
import PageHero from '@/components/layout/PageHero';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import Eyebrow from '@/components/ui/Eyebrow';
import RevealOnView from '@/components/motion/RevealOnView';
import CTABand from '@/components/ui/CTABand';

export const metadata: Metadata = {
  title: 'Vision & Mission',
  description: `${vision} ${mission}`,
  alternates: { canonical: '/vision-mission' },
};

const valueIcons = { Cpu, Users, ShieldCheck, BadgeCheck, Handshake };

export default function VisionMissionPage() {
  return (
    <>
      <PageHero
        eyebrow="Vision & Mission"
        title="Where we are going, and how we get there."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Vision & Mission' }]}
        image="/images/about/vision-mission.png"
      />

      <Section tone="paper-2" cropMarks>
        <div className="grid gap-px overflow-hidden border border-ink/10 bg-ink/10 lg:grid-cols-2">
          <RevealOnView className="bg-paper-2 p-8 md:p-12">
            <Compass aria-hidden="true" className="h-7 w-7 text-cyan" />
            <Eyebrow tone="cyan" className="mt-6">
              Vision
            </Eyebrow>
            <p className="mt-5 text-lg leading-relaxed text-ink md:text-xl md:leading-relaxed">
              {vision}
            </p>
          </RevealOnView>

          <RevealOnView delay={80} className="bg-paper-2 p-8 md:p-12">
            <Target aria-hidden="true" className="h-7 w-7 text-magenta" />
            <Eyebrow tone="magenta" className="mt-6">
              Mission
            </Eyebrow>
            <p className="mt-5 text-lg leading-relaxed text-ink md:text-xl md:leading-relaxed">
              {mission}
            </p>
          </RevealOnView>
        </div>
      </Section>

      <Section tone="ink" halftone>
        <SectionHeading
          eyebrow="Core Values"
          index="01"
          title="Five commitments we are willing to be held to."
          lede="These are not wall posters. They are the tests we apply before we sign a manufacturer, quote a machine or accept an order."
          invert
        />

        <ul className="mt-12 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
          {coreValues.map((v, i) => {
            const Icon = valueIcons[v.icon];
            return (
              <RevealOnView
                as="li"
                key={v.title}
                delay={i * 60}
                className="bg-band p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <Icon
                    aria-hidden="true"
                    className={
                      i % 2 === 0 ? 'h-6 w-6 text-cyan' : 'h-6 w-6 text-magenta'
                    }
                  />
                  <span className="font-mono text-xs text-onband/25">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="mt-6 text-base font-semibold leading-snug text-onband">
                  {v.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-onband/55">
                  {v.description}
                </p>
              </RevealOnView>
            );
          })}
        </ul>
      </Section>

      <CTABand
        title="Hold us to it."
        lede="Ask our existing customers whether the service matches the statement."
      />
    </>
  );
}
