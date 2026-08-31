'use client';

import { cn } from '@/lib/utils';
import MotionReveal from '@/components/motion/MotionReveal';
import PressCounter from '@/components/motion/PressCounter';
import type { StatsData } from '@/lib/sections/schemas';

/** Stat plate — animated counters, CMYK accent rule, Framer reveal. */
export default function Stats({ items, tone }: StatsData) {
  const invert = tone === 'ink';

  return (
    <section
      className={cn(
        'relative py-10 md:py-12',
        invert ? 'bg-band text-onband' : 'bg-paper text-ink',
      )}
    >
      <div className="container-page">
        <MotionReveal>
          <dl
            className={cn(
              'grid grid-cols-2 gap-3 overflow-hidden rounded-xl border p-2 sm:gap-4 sm:p-3 lg:grid-cols-4',
              invert ? 'border-line bg-band-2/80' : 'border-ink/10 bg-paper-2',
            )}
          >
            {items.map((s, i) => (
              <MotionReveal
                key={s.label}
                delay={i * 70}
                className={cn(
                  'relative overflow-hidden rounded-lg px-5 py-6 md:px-6 md:py-8',
                  invert ? 'bg-band' : 'bg-paper',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-x-0 top-0 h-0.5',
                    i % 2 === 0
                      ? 'bg-gradient-to-r from-cyan to-transparent'
                      : 'bg-gradient-to-r from-magenta to-transparent',
                  )}
                />
                <dt
                  className={cn(
                    'eyebrow',
                    invert ? 'text-onband/50' : 'text-graphite',
                  )}
                >
                  {s.label}
                </dt>
                <dd
                  className={cn(
                    'mt-3 font-display text-2xl font-bold leading-none md:text-3xl',
                    invert ? 'text-onband' : 'text-ink',
                  )}
                >
                  <PressCounter value={s.value} />
                </dd>
              </MotionReveal>
            ))}
          </dl>
        </MotionReveal>
      </div>
    </section>
  );
}
