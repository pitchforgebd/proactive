import Section from '@/components/ui/Section';
import { cn } from '@/lib/utils';
import type { StatsData } from '@/lib/sections/schemas';

/** Stat plate — a hairline grid of figures. Editor supplies value + label. */
export default function Stats({ items, tone }: StatsData) {
  const invert = tone === 'ink';

  return (
    <Section tone={tone} className="py-10 md:py-12">
      <dl
        className={cn(
          'grid grid-cols-2 gap-px overflow-hidden border lg:grid-cols-4',
          invert ? 'border-line bg-line' : 'border-ink/10 bg-ink/10',
        )}
      >
        {items.map((s) => (
          <div key={s.label} className={cn('p-6 md:p-8', invert ? 'bg-band' : 'bg-paper-2')}>
            <dt className={cn('eyebrow', invert ? 'text-onband/50' : 'text-graphite')}>
              {s.label}
            </dt>
            <dd
              className={cn(
                'mt-3 font-display text-2xl font-bold leading-none',
                invert ? 'text-onband' : 'text-ink',
              )}
            >
              {s.value}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
