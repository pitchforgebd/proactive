import type { Metadata } from 'next';
import { MapPin, Clock } from 'lucide-react';
import { getJobOpenings } from '@/lib/data';
import PageHero from '@/components/layout/PageHero';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import RevealOnView from '@/components/motion/RevealOnView';
import CareerForm from '@/components/forms/CareerForm';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Career',
  description:
    'Join Proactive Trade International — field service engineers, technical sales and CRM roles in printing and packaging supply across Bangladesh.',
  alternates: { canonical: '/career' },
};

export default async function CareerPage() {
  const openings = await getJobOpenings();

  return (
    <>
      <PageHero
        eyebrow="Career"
        title="Work where the machines actually run."
        lede="We hire engineers and technical staff who would rather solve a press room problem than send an email about it."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Career' }]}
        image="/images/about/career.png"
      />

      {openings.length > 0 && (
        <Section tone="paper-2" cropMarks>
          <SectionHeading
            eyebrow="Open positions"
            index="01"
            title="Roles we are hiring for right now."
          />

          <ul className="mt-12 grid gap-px overflow-hidden border border-ink/10 bg-ink/10">
            {openings.map((job, i) => (
              <RevealOnView as="li" key={job.id} delay={i * 60} className="bg-paper-2 p-7 md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="max-w-2xl">
                    <h3 className="text-lg font-bold leading-snug">{job.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-graphite">
                      {job.summary}
                    </p>
                  </div>

                  <dl className="flex shrink-0 flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-graphite">
                    <div className="flex items-center gap-2">
                      <dt className="sr-only">Location</dt>
                      <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-cyan" />
                      <dd>{job.location}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <dt className="sr-only">Type</dt>
                      <Clock aria-hidden="true" className="h-3.5 w-3.5 text-magenta" />
                      <dd>{job.type}</dd>
                    </div>
                  </dl>
                </div>
              </RevealOnView>
            ))}
          </ul>

          <p className="mt-8 text-sm text-graphite">
            Nothing matching your experience? Send an open application — we keep
            strong CVs on file and contact people when a role opens.
          </p>
        </Section>
      )}

      <Section tone="paper" id="apply">
        <SectionHeading
          eyebrow="Apply"
          index={openings.length > 0 ? '02' : '01'}
          title="Send us your application."
          lede="Tell us what you have worked on. Attach a CV. If it fits, you will hear from a person, not an autoresponder."
        />

        <div className="mt-12 max-w-3xl">
          <CareerForm openings={openings} />
        </div>
      </Section>
    </>
  );
}
