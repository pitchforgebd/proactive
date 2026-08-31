import { MapPin, Clock } from 'lucide-react';
import { getJobOpenings } from '@/lib/data';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import RevealOnView from '@/components/motion/RevealOnView';
import type { CareerOpeningsData } from '@/lib/sections/schemas';

/**
 * Open positions, read live from the job openings collection.
 *
 * Renders nothing when there are no openings — an empty list is a valid state,
 * not an error, and an empty heading with no rows under it looks broken.
 */
export default async function CareerOpenings({
  eyebrow,
  index,
  title,
  lede,
  footnote,
  tone,
  cropMarks,
}: CareerOpeningsData) {
  const openings = await getJobOpenings();
  if (openings.length === 0) return null;

  return (
    <Section tone={tone} cropMarks={cropMarks}>
      <SectionHeading
        eyebrow={eyebrow}
        index={index}
        title={title ?? ''}
        lede={lede}
        invert={tone === 'ink'}
      />

      <ul className="mt-12 grid gap-px overflow-hidden rounded-xl border border-ink/10 bg-ink/10">
        {openings.map((job, i) => (
          <RevealOnView
            as="li"
            key={job.id}
            delay={i * 60}
            className="bg-paper-2 p-7 md:p-8"
          >
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

      {footnote && <p className="mt-8 text-sm text-graphite">{footnote}</p>}
    </Section>
  );
}
