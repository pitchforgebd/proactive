import type { Metadata } from 'next';
import Image from 'next/image';
import { storyTimeline } from '@/lib/data/mock/content';
import PageHero from '@/components/layout/PageHero';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import RevealOnView from '@/components/motion/RevealOnView';
import CTABand from '@/components/ui/CTABand';

export const metadata: Metadata = {
  title: 'Our Story',
  description:
    'From fifteen years on the factory floor to serving 100+ printing and packaging companies — the story of Proactive Trade International.',
  alternates: { canonical: '/our-story' },
};

export default function OurStoryPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Story"
        title="Built by someone who had already fixed the problem."
        lede="Proactive Trade International started on the factory floor, not in a boardroom. Here is how it got here."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Our Story' }]}
        image="/images/about/our-story.png"
      />

      <Section tone="paper-2" cropMarks>
        <SectionHeading
          eyebrow="Timeline"
          index="01"
          title="The journey so far."
        />

        <ol className="mt-14 relative">
          {/* Registration rule running the length of the timeline. */}
          <span
            aria-hidden="true"
            className="absolute left-[7px] top-2 hidden h-[calc(100%-1rem)] w-px bg-gradient-to-b from-cyan via-magenta to-transparent sm:block"
          />

          {storyTimeline.map((entry, i) => (
            <RevealOnView
              as="li"
              key={entry.year}
              delay={i * 70}
              className="relative pb-12 last:pb-0 sm:pl-12"
            >
              {/* Registration target node */}
              <span
                aria-hidden="true"
                className="absolute left-0 top-1.5 hidden h-[15px] w-[15px] items-center justify-center sm:flex"
              >
                <span className="absolute inset-0 rounded-full border border-cyan" />
                <span className="h-[5px] w-[5px] rounded-full bg-magenta" />
              </span>

              <p className="eyebrow text-magenta">{entry.year}</p>
              <h3 className="mt-3 text-lg font-bold leading-snug text-ink">
                {entry.title}
              </h3>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-graphite">
                {entry.description}
              </p>
            </RevealOnView>
          ))}
        </ol>
      </Section>

      <Section tone="ink" halftone>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <RevealOnView>
            <h2 className="text-xl font-bold leading-tight text-paper md:text-2xl">
              The next chapter is the one you are in.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-paper/65">
              Bangladesh&apos;s printing and packaging industry is moving into
              higher-value work — tighter tolerances, shorter runs, more finishing.
              Our job is to make sure the technology and the support behind it move
              at the same pace.
            </p>
          </RevealOnView>

          <RevealOnView delay={80}>
            <div className="relative aspect-[16/10] overflow-hidden border border-line">
              <Image
                src="/images/gallery/gallery-05.png"
                alt="Machinery handover and operator training on site"
                fill
                sizes="(min-width: 1024px) 46vw, 92vw"
                loading="lazy"
                className="object-cover"
              />
            </div>
          </RevealOnView>
        </div>
      </Section>

      <CTABand />
    </>
  );
}
