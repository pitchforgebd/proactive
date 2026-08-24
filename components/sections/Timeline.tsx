import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import RevealOnView from '@/components/motion/RevealOnView';
import { cn } from '@/lib/utils';
import type { TimelineData } from '@/lib/sections/schemas';

/**
 * Vertical journey timeline. The rule runs cyan → magenta down the length of
 * the list and each milestone is marked with a registration target node.
 */
export default function Timeline({
  eyebrow,
  index,
  title,
  lede,
  milestones,
  tone,
  cropMarks,
}: TimelineData) {
  const invert = tone === 'ink';
  const hasHeading = Boolean(eyebrow || title);

  return (
    <Section tone={tone} cropMarks={cropMarks}>
      {hasHeading && (
        <SectionHeading
          eyebrow={eyebrow}
          index={index}
          title={title ?? ''}
          lede={lede}
          invert={invert}
        />
      )}

      <ol className={cn('relative', hasHeading ? 'mt-14' : 'mt-2')}>
        {/* Registration rule running the length of the timeline. */}
        <span
          aria-hidden="true"
          className="absolute left-[7px] top-2 hidden h-[calc(100%-1rem)] w-px bg-gradient-to-b from-cyan via-magenta to-transparent sm:block"
        />

        {milestones.map((entry, i) => (
          <RevealOnView
            as="li"
            key={`${entry.year}-${entry.title}`}
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
            <h3
              className={cn(
                'mt-3 text-lg font-bold leading-snug',
                invert ? 'text-onband' : 'text-ink',
              )}
            >
              {entry.title}
            </h3>
            {entry.text && (
              <p
                className={cn(
                  'mt-3 max-w-2xl text-base leading-relaxed',
                  invert ? 'text-onband/65' : 'text-graphite',
                )}
              >
                {entry.text}
              </p>
            )}
          </RevealOnView>
        ))}
      </ol>
    </Section>
  );
}
